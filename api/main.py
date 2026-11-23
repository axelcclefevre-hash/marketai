"""
FastAPI backend — MarketAI
Wraps financial_dashboard Python modules and exposes a REST API.
"""

import sys
import os
import json
import threading
from pathlib import Path
from typing import Any, Optional

# Add financial_dashboard to path so we can import its modules
sys.path.insert(0, str(Path(__file__).parent.parent / "financial_dashboard"))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / "financial_dashboard" / ".env")

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import init_db, get_session
from models import UserPortfolio
from portfolio_user import generate_user_portfolio, update_portfolio_value, score_from_answers
from sqlmodel import select

from data_fetcher import fetch_all_data, load_cache, cache_is_fresh, save_cache, get_prices_df, fetch_news, fetch_geopolitical_news
from indicators import enrich_assets
from claude_analysis import score_all_assets, generate_macro_report
from claude_cli import claude_available
from portfolio import get_or_update_portfolio, compute_positions_table
from backtest import backtest_asset
from notifications import check_and_notify

FRED_KEY             = os.getenv("FRED_API_KEY", "")
NEWSAPI_KEY          = os.getenv("NEWSAPI_KEY", "")
GUARDIAN_KEY         = os.getenv("GUARDIAN_KEY", "")

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

_ai_lock = threading.Lock()   # un seul job IA à la fois

def _run_ai_job():
    """Signaux + rapport macro via `claude -p`, en arrière-plan (plusieurs dizaines de secondes)."""
    if not _ai_lock.acquire(blocking=False):
        return
    try:
        data = load_cache() or {}
        assets = data.get("assets", {})
        enrich_assets(assets)
        score_all_assets(assets)
        if not data.get("macro_report"):
            data["macro_report"] = generate_macro_report(assets)
        save_cache(data)
    finally:
        _ai_lock.release()

def _get_enriched_data(force: bool = False) -> dict:
    """Charge les données de marché (cache) et lance l'analyse IA en tâche de fond si nécessaire."""
    cached = load_cache()
    if not force and cache_is_fresh() and cached:
        data = cached
    else:
        data = fetch_all_data(fred_api_key=FRED_KEY)
        save_cache(data)

    assets = data.get("assets", {})
    enrich_assets(assets)

    needs_scores = not all(a.get("claude_score") for a in assets.values() if not a.get("error"))
    if claude_available() and needs_scores and not _ai_lock.locked():
        threading.Thread(target=_run_ai_job, daemon=True).start()
    return data

app = FastAPI(title="MarketAI API", version="2.0.0")

@app.on_event("startup")
def on_startup():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/market-data")
def get_market_data(force: bool = False):
    """All assets with prices, indicators, and Claude scores."""
    try:
        data = _get_enriched_data(force=force)
        assets = data.get("assets", {})
        return _sanitize({
            "date":   data.get("date"),
            "assets": assets,
            "ai":     {"available": claude_available(), "running": _ai_lock.locked()},
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
    """Claude-generated macro market commentary with economic and geopolitical news."""
    try:
        data = _get_enriched_data()
        report  = data.get("macro_report", "")
        news    = data.get("news", [])
        geo_news = data.get("geo_news", [])

        if not news or force:
            news = fetch_news(newsapi_key=NEWSAPI_KEY, guardian_key=GUARDIAN_KEY)
            data["news"] = news

        if not geo_news or force:
            geo_news = fetch_geopolitical_news(guardian_key=GUARDIAN_KEY)
            data["geo_news"] = geo_news

        if (not report or force) and claude_available():
            assets = data.get("assets", {})
            report = generate_macro_report(assets, news=news, geo_news=geo_news)
            data["macro_report"] = report
            save_cache(data)

        return _sanitize({
            "report":   report or "Rapport non disponible — installe Claude Code (commande `claude`) pour l'activer.",
            "news":     news,
            "geo_news": geo_news,
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

# ── Portefeuille personnel (local, un seul utilisateur) ───────────────────────────────────────

class QuestionnaireRequest(BaseModel):
    answers: list[int]   # scores 0-3 pour chaque question
    initial_capital: float = 10000.0

class CreatePortfolioRequest(BaseModel):
    risk_profile: str
    initial_capital: float = 10000.0

@app.post("/api/user/questionnaire")
def evaluate_questionnaire(req: QuestionnaireRequest):
    """Détermine le profil de risque depuis les réponses au questionnaire."""
    profile = score_from_answers(req.answers)
    return {"risk_profile": profile}

@app.get("/api/user/portfolio")
def get_user_portfolio():
    """Récupère le portefeuille personnel de l'utilisateur ."""
    with get_session() as session:
        port = session.exec(select(UserPortfolio)).first()
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
def create_user_portfolio(req: CreatePortfolioRequest):
    """Génère un portefeuille personnalisé via Claude selon le profil de risque."""
    if not claude_available():
        raise HTTPException(status_code=503, detail="Claude Code (`claude`) introuvable")
    data = _get_enriched_data()
    assets = data.get("assets", {})
    portfolio = generate_user_portfolio(req.risk_profile, assets, req.initial_capital)
    with get_session() as session:
        existing = session.exec(select(UserPortfolio)).first()
        if existing:
            existing.risk_profile = req.risk_profile
            existing.initial_capital = req.initial_capital
            existing.positions = json.dumps(portfolio["positions"])
            existing.history = json.dumps(portfolio["history"])
            session.add(existing)
        else:
            port = UserPortfolio(
                risk_profile=req.risk_profile,
                initial_capital=req.initial_capital,
                positions=json.dumps(portfolio["positions"]),
                history=json.dumps(portfolio["history"]),
            )
            session.add(port)
        session.commit()
    return _sanitize({"portfolio": portfolio})
