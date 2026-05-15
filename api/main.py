"""
FastAPI backend — MarketAI
Wraps financial_dashboard Python modules and exposes a REST API.
"""

import sys
import os
import json
import time
from pathlib import Path
from typing import Any, Optional

# Add financial_dashboard to path so we can import its modules
sys.path.insert(0, str(Path(__file__).parent.parent / "financial_dashboard"))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / "financial_dashboard" / ".env")

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import stripe

from database import init_db, get_session
from models import User, UserPortfolio, PasswordResetToken
from auth import (
    hash_password, verify_password, create_jwt,
    get_current_user, get_premium_user, get_optional_user,
)
from portfolio_user import generate_user_portfolio, update_portfolio_value, score_from_answers
from emails import send_welcome, send_premium_confirmation, send_password_reset
from sqlmodel import select

# ── Rate limiter simple (in-memory) ──────────────────────────────────────────
_rate_limits: dict[str, float] = {}   # key → timestamp dernier appel

def _check_rate_limit(key: str, min_interval_seconds: int) -> bool:
    """Retourne True si l'appel est autorisé, False si trop fréquent."""
    now = time.time()
    last = _rate_limits.get(key, 0)
    if now - last < min_interval_seconds:
        return False
    _rate_limits[key] = now
    return True

from data_fetcher import fetch_all_data, load_cache, cache_is_fresh, save_cache, get_prices_df, fetch_news
from indicators import enrich_assets
from claude_analysis import score_all_assets, generate_macro_report
from portfolio import get_or_update_portfolio, compute_positions_table
from backtest import backtest_asset
from notifications import check_and_notify

ADMIN_EMAIL          = os.getenv("ADMIN_EMAIL", "")
ANTHROPIC_KEY        = os.getenv("ANTHROPIC_API_KEY", "")
FRED_KEY             = os.getenv("FRED_API_KEY", "")
NEWSAPI_KEY          = os.getenv("NEWSAPI_KEY", "")
GUARDIAN_KEY         = os.getenv("GUARDIAN_KEY", "")
STRIPE_SECRET_KEY    = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_PRICE_ID      = os.getenv("STRIPE_PRICE_ID", "")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY


def _sanitize(obj: Any) -> Any:
    """Recursively convert numpy/pandas types to JSON-serializable Python types."""
    if isinstance(obj, dict):
        return {k: _sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize(i) for i in obj]
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return None if np.isnan(obj) else float(obj)
    if isinstance(obj, np.ndarray):
        return _sanitize(obj.tolist())
    if isinstance(obj, float) and np.isnan(obj):
        return None
    if isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    return obj


def _get_enriched_data(force: bool = False) -> dict:
    """Load, enrich, and score market data (with cache)."""
    cached = load_cache()
    if not force and cache_is_fresh() and cached:
        data = cached
    else:
        data = fetch_all_data(fred_api_key=FRED_KEY)

    assets = data.get("assets", {})
    enrich_assets(assets)

    if ANTHROPIC_KEY:
        needs_scores = not all(
            a.get("claude_score") for a in assets.values() if not a.get("error")
        )
        if needs_scores:
            score_all_assets(assets, ANTHROPIC_KEY)

        if not data.get("macro_report"):
            data["macro_report"] = generate_macro_report(assets, ANTHROPIC_KEY)

    save_cache(data)
    return data


app = FastAPI(title="MarketAI API", version="2.0.0")

@app.on_event("startup")
def on_startup():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://marketai.fr",
        "https://www.marketai.fr",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/market-data")
def get_market_data(force: bool = False, user: Optional[User] = Depends(get_optional_user)):
    """All assets with prices, indicators, and Claude scores."""
    try:
        # Rate limit sur force=true : 1 fois par heure globalement
        if force and not _check_rate_limit("force_refresh", 3600):
            raise HTTPException(
                status_code=429,
                detail="Actualisation forcée limitée à 1 fois par heure. Réessaie plus tard."
            )
        data = _get_enriched_data(force=force)
        assets = data.get("assets", {})
        return _sanitize({
            "date":   data.get("date"),
            "assets": assets,
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/portfolio")
def get_portfolio():
    """Current portfolio: positions, history, KPIs. Never rebalances on load."""
    try:
        data   = _get_enriched_data()
        assets = data.get("assets", {})
        port   = get_or_update_portfolio(assets)
        positions = compute_positions_table(port, assets)
        return _sanitize({
            "portfolio":  port,
            "positions":  positions,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/macro-report")
def get_macro_report(force: bool = False):
    """Claude-generated macro market commentary with geopolitical news context."""
    try:
        data = _get_enriched_data()
        report = data.get("macro_report", "")
        news   = data.get("news", [])

        if not news or force:
            news = fetch_news(newsapi_key=NEWSAPI_KEY, guardian_key=GUARDIAN_KEY)
            data["news"] = news

        if (not report or force) and ANTHROPIC_KEY:
            assets = data.get("assets", {})
            report = generate_macro_report(assets, ANTHROPIC_KEY, news=news)
            data["macro_report"] = report
            save_cache(data)

        return _sanitize({
            "report": report or "Rapport non disponible — clé ANTHROPIC_API_KEY manquante.",
            "news":   news,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class BacktestRequest(BaseModel):
    asset_name: str
    strategy: str = "sma"
    lookback_days: int = 90


@app.post("/api/backtest")
def run_backtest(req: BacktestRequest):
    """Run a backtest simulation for a given asset and strategy."""
    try:
        data = _get_enriched_data()
        assets = data.get("assets", {})
        asset = assets.get(req.asset_name)
        if not asset:
            raise HTTPException(status_code=404, detail=f"Asset '{req.asset_name}' not found")
        result = backtest_asset(asset, strategy=req.strategy, lookback_days=req.lookback_days)
        if not result:
            raise HTTPException(status_code=422, detail="Not enough price data for backtest (min 30 days)")
        return _sanitize(result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/alerts")
def get_alerts():
    """Price and RSI alerts for all assets."""
    try:
        data = _get_enriched_data()
        assets = data.get("assets", {})
        alerts = check_and_notify(assets)
        return _sanitize({"alerts": alerts})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/correlation-matrix")
def get_correlation_matrix():
    """Pearson correlation matrix across all assets (last 35 days)."""
    try:
        data = _get_enriched_data()
        assets = data.get("assets", {})
        df = get_prices_df(assets)
        if df.empty:
            return {"matrix": [], "labels": []}
        corr = df.corr().round(3)
        return _sanitize({
            "labels": list(corr.columns),
            "matrix": corr.values.tolist(),
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}


# ── Admin ─────────────────────────────────────────────────────────────────────

ADMIN_EMAILS = {ADMIN_EMAIL, "axelcc.lefevre@gmail.com"}  # fallback hardcodé

def get_admin_user(user: User = Depends(get_current_user)) -> User:
    if user.email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Accès administrateur requis")
    return user


@app.get("/api/admin/users")
def admin_list_users(user: User = Depends(get_admin_user)):
    """Liste tous les utilisateurs avec leur statut d'abonnement."""
    with get_session() as session:
        users = session.exec(select(User)).all()
        return _sanitize([{
            "id":                  u.id,
            "email":               u.email,
            "subscription_status": u.subscription_status,
            "created_at":          u.created_at.isoformat() if u.created_at else None,
            "subscription_end":    u.subscription_end.isoformat() if u.subscription_end else None,
            "stripe_customer_id":  u.stripe_customer_id,
        } for u in users])


@app.patch("/api/admin/users/{user_id}/subscription")
def admin_update_subscription(user_id: int, status: str, admin: User = Depends(get_admin_user)):
    """Modifie manuellement le statut d'abonnement d'un utilisateur."""
    if status not in ("free", "premium", "cancelled"):
        raise HTTPException(status_code=400, detail="Statut invalide")
    with get_session() as session:
        u = session.get(User, user_id)
        if not u:
            raise HTTPException(status_code=404, detail="Utilisateur introuvable")
        u.subscription_status = status
        session.add(u)
        session.commit()
    return {"id": user_id, "subscription_status": status}


@app.get("/api/admin/stats")
def admin_stats(user: User = Depends(get_admin_user)):
    """Statistiques globales de la plateforme."""
    with get_session() as session:
        users = session.exec(select(User)).all()
        total     = len(users)
        premium   = sum(1 for u in users if u.subscription_status == "premium")
        free_users = total - premium
        mrr = premium * 9.99
        return {
            "total_users":    total,
            "premium_users":  premium,
            "free_users":     free_users,
            "mrr_eur":        round(mrr, 2),
        }


# ── Auth ──────────────────────────────────────────────────────────────────────

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@app.post("/api/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    """Génère un token de reset et envoie l'email."""
    import secrets
    from datetime import timedelta
    with get_session() as session:
        user = session.exec(select(User).where(User.email == req.email)).first()
        if not user:
            # Réponse identique que l'utilisateur existe ou non (sécurité)
            return {"message": "Si cet email existe, un lien de réinitialisation a été envoyé."}
        token = secrets.token_urlsafe(32)
        expires = datetime.utcnow() + timedelta(hours=1)
        reset = PasswordResetToken(user_id=user.id, token=token, expires_at=expires)
        session.add(reset)
        session.commit()
        reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
        import threading
        threading.Thread(target=send_password_reset, args=(user.email, reset_url), daemon=True).start()
    return {"message": "Si cet email existe, un lien de réinitialisation a été envoyé."}


@app.post("/api/auth/reset-password")
def reset_password(req: ResetPasswordRequest):
    """Valide le token et met à jour le mot de passe."""
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 8 caractères")
    with get_session() as session:
        reset = session.exec(
            select(PasswordResetToken).where(
                PasswordResetToken.token == req.token,
                PasswordResetToken.used == False,
            )
        ).first()
        if not reset or reset.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Lien invalide ou expiré")
        user = session.get(User, reset.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur introuvable")
        user.password_hash = hash_password(req.new_password)
        reset.used = True
        session.add(user)
        session.add(reset)
        session.commit()
    return {"message": "Mot de passe mis à jour avec succès"}


class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/api/auth/register")
def register(req: RegisterRequest):
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 8 caractères")
    with get_session() as session:
        existing = session.exec(select(User).where(User.email == req.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
        user = User(email=req.email, password_hash=hash_password(req.password))
        session.add(user)
        session.commit()
        session.refresh(user)
        # Email de bienvenue (non bloquant)
        import threading
        threading.Thread(target=send_welcome, args=(user.email,), daemon=True).start()
        token = create_jwt(user.id, user.email, user.subscription_status)
        return {"token": token, "user": {"id": user.id, "email": user.email, "subscription": user.subscription_status}}


@app.post("/api/auth/login")
def login(req: LoginRequest):
    with get_session() as session:
        user = session.exec(select(User).where(User.email == req.email)).first()
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
        token = create_jwt(user.id, user.email, user.subscription_status)
        return {"token": token, "user": {"id": user.id, "email": user.email, "subscription": user.subscription_status}}


@app.get("/api/auth/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "subscription": user.subscription_status, "subscription_end": user.subscription_end}


# ── Portefeuille utilisateur (premium) ───────────────────────────────────────

class QuestionnaireRequest(BaseModel):
    answers: list[int]   # scores 0-3 pour chaque question
    initial_capital: float = 10000.0

class CreatePortfolioRequest(BaseModel):
    risk_profile: str
    initial_capital: float = 10000.0


@app.post("/api/user/questionnaire")
def evaluate_questionnaire(req: QuestionnaireRequest, user: User = Depends(get_current_user)):
    """Détermine le profil de risque depuis les réponses au questionnaire."""
    profile = score_from_answers(req.answers)
    return {"risk_profile": profile}


@app.get("/api/user/portfolio")
def get_user_portfolio(user: User = Depends(get_premium_user)):
    """Récupère le portefeuille personnel de l'utilisateur (premium uniquement)."""
    with get_session() as session:
        port = session.exec(select(UserPortfolio).where(UserPortfolio.user_id == user.id)).first()
        if not port:
            return {"portfolio": None}
        data = _get_enriched_data()
        assets = data.get("assets", {})
        portfolio_data = json.loads(port.positions) if isinstance(port.positions, str) else port.positions
        history_data = json.loads(port.history) if isinstance(port.history, str) else port.history
        full_portfolio = {
            "risk_profile": port.risk_profile,
            "initial_capital": port.initial_capital,
            "created_at": port.created_at.isoformat(),
            "positions": portfolio_data,
            "history": history_data,
        }
        updated = update_portfolio_value(full_portfolio, assets)
        return _sanitize({"portfolio": updated})


@app.post("/api/user/portfolio/create")
def create_user_portfolio(req: CreatePortfolioRequest, user: User = Depends(get_premium_user)):
    """Génère un portefeuille personnalisé via Claude selon le profil de risque."""
    if not ANTHROPIC_KEY:
        raise HTTPException(status_code=503, detail="Clé API Anthropic manquante")
    data = _get_enriched_data()
    assets = data.get("assets", {})
    portfolio = generate_user_portfolio(req.risk_profile, assets, ANTHROPIC_KEY, req.initial_capital)
    with get_session() as session:
        existing = session.exec(select(UserPortfolio).where(UserPortfolio.user_id == user.id)).first()
        if existing:
            existing.risk_profile = req.risk_profile
            existing.initial_capital = req.initial_capital
            existing.positions = json.dumps(portfolio["positions"])
            existing.history = json.dumps(portfolio["history"])
            session.add(existing)
        else:
            port = UserPortfolio(
                user_id=user.id,
                risk_profile=req.risk_profile,
                initial_capital=req.initial_capital,
                positions=json.dumps(portfolio["positions"]),
                history=json.dumps(portfolio["history"]),
            )
            session.add(port)
        session.commit()
    return _sanitize({"portfolio": portfolio})


# ── Stripe ───────────────────────────────────────────────────────────────────

@app.post("/api/stripe/create-checkout")
def create_checkout(user: User = Depends(get_current_user)):
    if not STRIPE_SECRET_KEY or not STRIPE_PRICE_ID:
        raise HTTPException(status_code=503, detail="Stripe non configuré")
    try:
        checkout = stripe.checkout.Session.create(
            customer_email=user.email,
            payment_method_types=["card"],
            line_items=[{"price": STRIPE_PRICE_ID, "quantity": 1}],
            mode="subscription",
            success_url="http://localhost:3000/profile?success=1&session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:3000/upgrade?cancelled=1",
            metadata={"user_id": str(user.id)},
        )
        return {"checkout_url": checkout.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stripe/confirm")
def confirm_checkout(session_id: str, user: User = Depends(get_current_user)):
    """Vérifie une session Stripe et active le premium si le paiement est validé."""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Stripe non configuré")
    try:
        session_data = stripe.checkout.Session.retrieve(session_id)
        if session_data.payment_status == "paid" or session_data.status == "complete":
            with get_session() as db:
                u = db.get(User, user.id)
                if u and u.subscription_status != "premium":
                    u.subscription_status = "premium"
                    u.stripe_customer_id = session_data.customer
                    db.add(u)
                    db.commit()
                    # Email de confirmation premium (non bloquant)
                    import threading
                    threading.Thread(target=send_premium_confirmation, args=(u.email,), daemon=True).start()
            return {"status": "premium", "activated": True}
        return {"status": user.subscription_status, "activated": False}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(body, sig, STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="Webhook invalide")

    if event["type"] == "checkout.session.completed":
        session_data = event["data"]["object"]
        user_id = int(session_data.get("metadata", {}).get("user_id", 0))
        customer_id = session_data.get("customer")
        if user_id:
            with get_session() as session:
                user = session.get(User, user_id)
                if user:
                    user.subscription_status = "premium"
                    user.stripe_customer_id = customer_id
                    session.add(user)
                    session.commit()

    elif event["type"] == "customer.subscription.deleted":
        customer_id = event["data"]["object"].get("customer")
        if customer_id:
            with get_session() as session:
                user = session.exec(select(User).where(User.stripe_customer_id == customer_id)).first()
                if user:
                    user.subscription_status = "cancelled"
                    session.add(user)
                    session.commit()

    return {"received": True}
