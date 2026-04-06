# portfolio.py — Gestion du portefeuille fictif (valorisé en USD)

import json
import os
import logging
from datetime import datetime, date

from config import CACHE_DIR

logger = logging.getLogger(__name__)

PORTFOLIO_FILE  = os.path.join(CACHE_DIR, "portfolio.json")
INITIAL_CAPITAL = 10_000.0   # USD (fictif)

# Poids relatifs par signal
SIGNAL_WEIGHTS = {"BUY": 1.0, "HOLD": 0.4, "SELL": 0.0}

# Nombre maximum d'actifs dans le portefeuille (les plus attractifs seulement)
MAX_POSITIONS = 15

# Diversification : poids maximum par catégorie (ex : Actions ne dépasse pas 40 %)
MAX_CAT_WEIGHT = 0.40
# Nombre maximum d'actifs par catégorie
MAX_PER_CAT = 4

# Catégories exclues du portefeuille (taux de change et rendements obligataires)
EXCLUDED_CURRENCIES = {"RATIO", "%"}

# ── Actifs du portefeuille original (v1 du dashboard) ─────────────────────────
ORIGINAL_ASSET_NAMES = [
    "S&P 500", "Nasdaq", "CAC 40", "Nikkei 225",
    "Bitcoin", "Ethereum", "Solana", "BNB",
    "Or", "Argent", "Pétrole WTI",
]
ORIGINAL_START_DATE = "2026-03-24"


# ── Persistance ───────────────────────────────────────────────────────────────

def load_portfolio() -> dict | None:
    if not os.path.exists(PORTFOLIO_FILE):
        return None
    try:
        with open(PORTFOLIO_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error("Lecture portfolio : %s", e)
        return None


def save_portfolio(portfolio: dict):
    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(PORTFOLIO_FILE, "w", encoding="utf-8") as f:
        json.dump(portfolio, f, ensure_ascii=False, indent=2)


# ── Conversion devise → USD ───────────────────────────────────────────────────

def _forex_series(assets: dict) -> dict[str, dict[str, float]]:
    """Retourne {date: taux} pour EUR/USD et USD/JPY (historique complet)."""
    out = {}
    for key in ("EUR/USD", "USD/JPY"):
        a = assets.get(key, {})
        out[key] = dict(zip(a.get("dates", []), a.get("prices", [])))
    return out


def _to_usd(price: float, currency: str, date_str: str,
            forex: dict[str, dict[str, float]]) -> float:
    """
    Convertit un prix dans sa devise native en USD.
    Utilise le taux historique si disponible, sinon le dernier taux connu.
    """
    if currency in (None, "USD"):
        return price

    if currency == "EUR":
        rates = forex.get("EUR/USD", {})
        rate  = rates.get(date_str) or (list(rates.values())[-1] if rates else 1.10)
        return price * rate

    if currency == "JPY":
        rates = forex.get("USD/JPY", {})
        rate  = rates.get(date_str) or (list(rates.values())[-1] if rates else 150.0)
        return price / rate if rate else price

    return price  # devise inconnue : pas de conversion


def _current_usd(asset: dict, assets: dict) -> float | None:
    """Prix courant d'un actif converti en USD (using taux du jour)."""
    price    = asset.get("current")
    currency = (asset.get("currency") or "USD")
    if price is None:
        return None
    forex = _forex_series(assets)
    today = date.today().isoformat()
    return _to_usd(price, currency, today, forex)


# ── Construction de l'allocation cible ───────────────────────────────────────

def _target_allocation(assets: dict) -> dict[str, float]:
    """
    Poids cibles (0-1, somme = 1) basés sur signal Claude × confiance.
    Applique une diversification par catégorie :
      - max MAX_PER_CAT actifs par catégorie (meilleurs scores)
      - max MAX_CAT_WEIGHT de poids total par catégorie
    Exclut le Forex et les obligations pures.
    """
    # ── 1. Scores bruts ──────────────────────────────────────────────────────
    candidates: dict[str, dict] = {}   # name → {weight, category}
    for name, asset in assets.items():
        if asset.get("error"):
            continue
        if (asset.get("currency") or "USD") in EXCLUDED_CURRENCIES:
            continue
        price_usd = _current_usd(asset, assets)
        if price_usd is None or price_usd <= 0:
            continue
        score  = asset.get("claude_score", {})
        signal = score.get("signal", "HOLD")
        conf   = score.get("confidence", 50) / 100
        w      = SIGNAL_WEIGHTS.get(signal, 0.0) * conf
        if w > 0:
            candidates[name] = {
                "weight":   w,
                "category": asset.get("category", "Autre"),
            }

    if not candidates:
        eligible = [
            n for n, a in assets.items()
            if not a.get("error")
            and a.get("currency", "USD") not in EXCLUDED_CURRENCIES
            and _current_usd(a, assets) is not None
        ]
        if eligible:
            return {n: 1 / min(len(eligible), MAX_POSITIONS)
                    for n in eligible[:MAX_POSITIONS]}
        return {}

    # ── 2. Filtre intra-catégorie : top MAX_PER_CAT par catégorie ────────────
    by_cat: dict[str, list] = {}
    for name, info in candidates.items():
        by_cat.setdefault(info["category"], []).append((name, info["weight"]))

    selected: dict[str, float] = {}
    for cat, items in by_cat.items():
        items.sort(key=lambda x: x[1], reverse=True)
        for name, w in items[:MAX_PER_CAT]:
            selected[name] = w

    # ── 3. Limite globale MAX_POSITIONS ──────────────────────────────────────
    if len(selected) > MAX_POSITIONS:
        top = sorted(selected.items(), key=lambda x: x[1], reverse=True)[:MAX_POSITIONS]
        selected = dict(top)

    # ── 4. Normalisation initiale ─────────────────────────────────────────────
    total = sum(selected.values())
    weights = {n: w / total for n, w in selected.items()}

    # ── 5. Cap par catégorie (MAX_CAT_WEIGHT) — itératif ─────────────────────
    cat_of = {n: candidates[n]["category"] for n in weights}
    for _ in range(10):   # max 10 passes de rééquilibrage
        cat_totals: dict[str, float] = {}
        for n, w in weights.items():
            cat_totals[n] = cat_totals.get(cat_of[n], 0) + w   # accumule par catégorie
        # Recalculer correctement les totaux par catégorie
        cat_sums: dict[str, float] = {}
        for n, w in weights.items():
            cat_sums[cat_of[n]] = cat_sums.get(cat_of[n], 0) + w

        overflow = {c: s - MAX_CAT_WEIGHT for c, s in cat_sums.items() if s > MAX_CAT_WEIGHT}
        if not overflow:
            break   # tout est dans les limites
        # Réduire les actifs des catégories qui dépassent
        excess_total = 0.0
        for n in list(weights):
            cat = cat_of[n]
            if cat in overflow:
                ratio = MAX_CAT_WEIGHT / cat_sums[cat]
                reduction = weights[n] * (1 - ratio)
                weights[n] *= ratio
                excess_total += reduction
        # Redistribuer l'excès aux catégories non saturées
        non_capped = [n for n in weights if cat_of[n] not in overflow]
        if non_capped:
            nc_total = sum(weights[n] for n in non_capped)
            if nc_total > 0:
                for n in non_capped:
                    weights[n] += excess_total * (weights[n] / nc_total)
        # Renormaliser
        s = sum(weights.values())
        if s > 0:
            weights = {n: w / s for n, w in weights.items()}

    return weights


# ── Initialisation ────────────────────────────────────────────────────────────

def initialize_portfolio(assets: dict) -> dict:
    """Crée le portefeuille initial. Tous les montants sont en USD."""
    weights = _target_allocation(assets)
    today   = date.today().isoformat()
    forex   = _forex_series(assets)
    positions = {}

    for name, weight in weights.items():
        asset     = assets[name]
        price_usd = _to_usd(
            asset["current"], (asset.get("currency") or "USD"), today, forex
        )
        capital   = INITIAL_CAPITAL * weight
        positions[name] = {
            "units":          capital / price_usd,
            "entry_price_usd": round(price_usd, 6),
            "entry_price_nat": round(asset["current"], 6),   # prix en devise native
            "currency":       (asset.get("currency") or "USD"),
            "weight":         round(weight, 4),
            "signal":         asset.get("claude_score", {}).get("signal", "HOLD"),
            "capital_usd":    round(capital, 2),
        }

    portfolio = {
        "created_at":      datetime.utcnow().isoformat(),
        "initial_capital": INITIAL_CAPITAL,
        "currency":        "USD",
        "positions":       positions,
        "history": [{
            "date":        today,
            "total_value": INITIAL_CAPITAL,
            "return_pct":  0.0,
            "cash":        INITIAL_CAPITAL - sum(p["capital_usd"] for p in positions.values()),
        }],
    }
    save_portfolio(portfolio)
    return portfolio


# ── Rééquilibrage ─────────────────────────────────────────────────────────────

def rebalance_portfolio(portfolio: dict, assets: dict) -> dict:
    """Rééquilibre et met à jour l'historique. Valorisation en USD."""
    positions   = portfolio.get("positions", {})
    initial_cap = portfolio.get("initial_capital", INITIAL_CAPITAL)
    today       = date.today().isoformat()
    forex       = _forex_series(assets)

    # ── Valorisation actuelle en USD ──────────────────────────────────────────
    current_value = 0.0
    for name, pos in positions.items():
        asset = assets.get(name, {})
        if asset.get("current") is not None:
            price_usd = _to_usd(
                asset["current"], (pos.get("currency") or "USD"), today, forex
            )
            current_value += pos["units"] * price_usd
        else:
            current_value += pos["capital_usd"]   # fallback

    ret_pct = (current_value - initial_cap) / initial_cap * 100

    # ── Nouvelle allocation ────────────────────────────────────────────────────
    weights = _target_allocation(assets)
    new_positions = {}
    for name, weight in weights.items():
        asset     = assets[name]
        price_usd = _to_usd(
            asset["current"], (asset.get("currency") or "USD"), today, forex
        )
        capital = current_value * weight
        new_positions[name] = {
            "units":           capital / price_usd,
            "entry_price_usd": round(price_usd, 6),
            "entry_price_nat": round(asset["current"], 6),
            "currency":        (asset.get("currency") or "USD"),
            "weight":          round(weight, 4),
            "signal":          asset.get("claude_score", {}).get("signal", "HOLD"),
            "capital_usd":     round(capital, 2),
        }

    # ── Historique (une entrée par jour) ──────────────────────────────────────
    history = portfolio.get("history", [])
    entry   = {"date": today, "total_value": round(current_value, 2),
               "return_pct": round(ret_pct, 2), "cash": 0.0}
    if history and history[-1]["date"] == today:
        history[-1] = entry
    else:
        history.append(entry)

    updated = {
        "created_at":      portfolio["created_at"],
        "initial_capital": initial_cap,
        "currency":        "USD",
        "positions":       new_positions,
        "history":         history,
    }
    save_portfolio(updated)
    return updated


# ── Point d'entrée principal ──────────────────────────────────────────────────

def get_or_update_portfolio(assets: dict) -> dict:
    """Charge le portefeuille existant et le rééquilibre, ou en crée un nouveau."""
    has_scores = any(a.get("claude_score") for a in assets.values())
    if not has_scores:
        return {}

    existing = load_portfolio()
    if existing is None:
        return initialize_portfolio(assets)

    # Migration : si l'ancien portefeuille n'a pas le champ currency, recréer
    if "currency" not in existing or "entry_price_usd" not in next(
        iter(existing.get("positions", {}).values()), {}
    ):
        logger.info("Migration portefeuille vers USD → recréation")
        return initialize_portfolio(assets)

    return rebalance_portfolio(existing, assets)


# ── Historique rétroactif ─────────────────────────────────────────────────────

def compute_history_from_prices(positions: dict, assets: dict,
                                 initial_capital: float) -> list[dict]:
    """
    Reconstitue la courbe de valeur du portefeuille en USD jour par jour
    sur tout l'historique de prix disponible.
    """
    forex = _forex_series(assets)

    # date → {asset_name: prix_natif}
    date_prices: dict[str, dict[str, float]] = {}
    for name in positions:
        asset  = assets.get(name, {})
        dates  = asset.get("dates", [])
        prices = asset.get("prices", [])
        for d, p in zip(dates, prices):
            if p is not None:
                date_prices.setdefault(d, {})[name] = p

    if not date_prices:
        return []

    history = []
    for d in sorted(date_prices.keys()):
        day_prices = date_prices[d]
        total = 0.0
        for name, pos in positions.items():
            nat_price = day_prices.get(name, pos.get("entry_price_nat", pos.get("entry_price_usd", 0)))
            currency  = (pos.get("currency") or "USD")
            usd_price = _to_usd(nat_price, currency, d, forex)
            total    += pos["units"] * usd_price

        ret_pct = (total - initial_capital) / initial_capital * 100
        history.append({
            "date":        d,
            "total_value": round(total, 2),
            "return_pct":  round(ret_pct, 2),
        })
    return history


# ── Reconstruction du portefeuille original (v1) ─────────────────────────────

def reconstruct_original_portfolio(assets: dict) -> dict:
    """
    Reconstruit le portefeuille v1 en partant des prix du ORIGINAL_START_DATE.
    Utilise les signaux Claude actuels pour l'allocation (meilleure approximation
    des signaux d'origine, qui ont été perdus lors de la suppression du cache).
    Ne modifie PAS portfolio.json — retourne uniquement la structure pour affichage.
    """
    forex = _forex_series(assets)

    # Filtrer sur les actifs originaux uniquement
    orig_assets = {
        name: a for name, a in assets.items()
        if name in ORIGINAL_ASSET_NAMES
        and not a.get("error")
        and (a.get("currency") or "USD") not in EXCLUDED_CURRENCIES
    }

    if not orig_assets:
        return {}

    # Trouver les prix à la date de départ
    start_prices: dict[str, float] = {}
    for name, asset in orig_assets.items():
        dates  = asset.get("dates", [])
        prices = asset.get("prices", [])
        date_map = {d[:10]: p for d, p in zip(dates, prices)}
        # Date exacte ou dernière date disponible avant le start
        p = date_map.get(ORIGINAL_START_DATE)
        if p is None:
            closest = max((d for d in date_map if d <= ORIGINAL_START_DATE), default=None)
            p = date_map.get(closest) if closest else None
        if p is not None:
            start_prices[name] = p

    if not start_prices:
        return {}

    # Allocation : mêmes poids que la logique actuelle (signals Claude actuels)
    raw_weights: dict[str, float] = {}
    for name in start_prices:
        score  = orig_assets[name].get("claude_score", {})
        signal = score.get("signal", "HOLD")
        conf   = score.get("confidence", 50) / 100
        w      = SIGNAL_WEIGHTS.get(signal, 0.0) * conf
        if w > 0:
            raw_weights[name] = w

    # Fallback équipondéré si aucun signal disponible
    if not raw_weights:
        raw_weights = {n: 1.0 for n in start_prices}

    total_w = sum(raw_weights.values())
    weights = {n: w / total_w for n, w in raw_weights.items()}

    # Construire les positions en USD (prix d'entrée au ORIGINAL_START_DATE)
    positions: dict = {}
    for name, weight in weights.items():
        nat_price = start_prices[name]
        currency  = (orig_assets[name].get("currency") or "USD")
        usd_price = _to_usd(nat_price, currency, ORIGINAL_START_DATE, forex)
        if usd_price <= 0:
            continue
        capital = INITIAL_CAPITAL * weight
        positions[name] = {
            "units":            capital / usd_price,
            "entry_price_usd":  round(usd_price, 6),
            "entry_price_nat":  round(nat_price, 6),
            "currency":         currency,
            "weight":           round(weight, 4),
            "signal":           orig_assets[name].get("claude_score", {}).get("signal", "HOLD"),
            "capital_usd":      round(capital, 2),
        }

    # Historique reconstitué depuis ORIGINAL_START_DATE
    history = compute_history_from_prices(positions, orig_assets, INITIAL_CAPITAL)
    # Filtrer depuis la date de départ seulement
    history = [h for h in history if h["date"][:10] >= ORIGINAL_START_DATE]

    return {
        "created_at":      ORIGINAL_START_DATE + "T00:00:00",
        "initial_capital": INITIAL_CAPITAL,
        "currency":        "USD",
        "note":            "Portefeuille v1 reconstruit — 16 actifs initiaux, signaux Claude actuels",
        "positions":       positions,
        "history":         history,
    }


# ── Calculs d'affichage ───────────────────────────────────────────────────────

def compute_positions_table(portfolio: dict, assets: dict) -> list[dict]:
    """Liste des positions enrichies pour l'affichage (valorisation en USD)."""
    today = date.today().isoformat()
    forex = _forex_series(assets)
    rows  = []

    for name, pos in portfolio.get("positions", {}).items():
        asset       = assets.get(name, {})
        currency    = (pos.get("currency") or "USD")
        nat_price   = asset.get("current") or pos.get("entry_price_nat", pos.get("entry_price_usd", 0))
        current_usd = _to_usd(nat_price, currency, today, forex)
        current_val = pos["units"] * current_usd
        capital_ref = pos.get("capital_usd", pos.get("capital_init", 0))
        pnl_abs     = current_val - capital_ref
        pnl_pct     = pnl_abs / capital_ref * 100 if capital_ref else 0

        rows.append({
            "Actif":            name,
            "Signal":           pos.get("signal", "—"),
            "Devise":           currency,
            "Poids":            f"{pos['weight'] * 100:.1f}%",
            "Prix entrée ($)":  pos.get("entry_price_usd", 0),
            "Prix actuel ($)":  round(current_usd, 2),
            "Valeur ($)":       round(current_val, 2),
            "P&L ($)":          round(pnl_abs, 2),
            "P&L (%)":          round(pnl_pct, 2),
        })

    rows.sort(key=lambda r: r["Valeur ($)"], reverse=True)
    return rows
