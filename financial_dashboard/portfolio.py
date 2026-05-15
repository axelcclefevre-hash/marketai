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
# Devises dont la conversion est instable (JPY) → on évite pour le portefeuille fictif
EXCLUDED_PORTFOLIO_CURRENCIES = {"RATIO", "%", "JPY"}
# Catégories non-investissables directement
EXCLUDED_PORTFOLIO_CATEGORIES = {"Indices", "Obligations"}

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
    Poids cibles garantis de sommer à 1.0.
    - Exclut les indices, obligations, forex, JPY
    - Max MAX_PER_CAT actifs par catégorie
    - Max MAX_POSITIONS au total
    - Cap de MAX_CAT_WEIGHT par catégorie
    """
    # 1. Filtrer les candidats investissables
    candidates: list[tuple[str, float, str]] = []  # (name, score, category)
    for name, asset in assets.items():
        if asset.get("error"):
            continue
        currency = asset.get("currency") or "USD"
        category = asset.get("category", "")
        if currency in EXCLUDED_PORTFOLIO_CURRENCIES:
            continue
        if category in EXCLUDED_PORTFOLIO_CATEGORIES:
            continue
        price = asset.get("current")
        if not price or price <= 0:
            continue
        score_d = asset.get("claude_score") or {}
        signal  = score_d.get("signal", "HOLD")
        conf    = (score_d.get("confidence") or 50) / 100
        raw_w   = SIGNAL_WEIGHTS.get(signal, 0.0) * conf
        if raw_w > 0:
            candidates.append((name, raw_w, category))

    # Fallback équipondéré si aucun signal BUY
    if not candidates:
        eligible = [
            n for n, a in assets.items()
            if not a.get("error")
            and (a.get("currency") or "USD") not in EXCLUDED_PORTFOLIO_CURRENCIES
            and (a.get("category") or "") not in EXCLUDED_PORTFOLIO_CATEGORIES
            and (a.get("current") or 0) > 0
        ][:MAX_POSITIONS]
        if not eligible:
            return {}
        w = round(1.0 / len(eligible), 8)
        return {n: w for n in eligible}

    # 2. Top MAX_PER_CAT par catégorie
    by_cat: dict[str, list] = {}
    for name, w, cat in candidates:
        by_cat.setdefault(cat, []).append((name, w))

    selected: list[tuple[str, float, str]] = []
    for cat, items in by_cat.items():
        items.sort(key=lambda x: x[1], reverse=True)
        for name, w in items[:MAX_PER_CAT]:
            selected.append((name, w, cat))

    # 3. Limite globale
    selected.sort(key=lambda x: x[1], reverse=True)
    selected = selected[:MAX_POSITIONS]

    # 4. Normalisation → somme = 1.0 garantie
    total = sum(w for _, w, _ in selected)
    if total == 0:
        n = len(selected)
        return {name: round(1.0 / n, 8) for name, _, _ in selected}
    weights = {name: w / total for name, w, _ in selected}
    cat_map = {name: cat for name, _, cat in selected}

    # 5. Cap par catégorie avec redistribution simple
    for _ in range(20):
        cat_sums: dict[str, float] = {}
        for n, w in weights.items():
            cat_sums[cat_map[n]] = cat_sums.get(cat_map[n], 0) + w

        over = {c for c, s in cat_sums.items() if s > MAX_CAT_WEIGHT + 1e-9}
        if not over:
            break

        excess = 0.0
        for n in list(weights):
            if cat_map[n] in over:
                cap_w = MAX_CAT_WEIGHT * weights[n] / cat_sums[cat_map[n]]
                excess += weights[n] - cap_w
                weights[n] = cap_w

        free = [n for n in weights if cat_map[n] not in over]
        if free:
            free_total = sum(weights[n] for n in free)
            for n in free:
                weights[n] += excess * (weights[n] / free_total if free_total > 0 else 1.0 / len(free))

        # Renormaliser strictement
        s = sum(weights.values())
        if s > 0:
            weights = {n: w / s for n, w in weights.items()}

    # Vérification finale
    assert abs(sum(weights.values()) - 1.0) < 0.001, f"Weights sum={sum(weights.values())}"
    return weights


# ── Initialisation ────────────────────────────────────────────────────────────

def _validate_price_usd(name: str, price_usd: float, capital: float) -> bool:
    """
    Vérifie qu'un prix de conversion USD est plausible.
    Un prix invalide ferait des unités aberrantes → P&L délirante.
    """
    if price_usd <= 0:
        logger.error("PORTFOLIO SANITY: %s price_usd=%s <= 0, skip", name, price_usd)
        return False
    # Les unités ne doivent pas être absurdes (ni > 1M ni < 0.000001)
    units = capital / price_usd
    if units > 1_000_000 or units < 1e-8:
        logger.error(
            "PORTFOLIO SANITY: %s price_usd=%.6f → units=%.2f hors limites, skip",
            name, price_usd, units
        )
        return False
    return True


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
        if not _validate_price_usd(name, price_usd, capital):
            continue
        positions[name] = {
            "units":           round(capital / price_usd, 8),
            "entry_price_usd": round(price_usd, 6),
            "entry_price_nat": round(asset["current"], 6),
            "currency":        (asset.get("currency") or "USD"),
            "weight":          round(weight, 4),
            "signal":          (asset.get("claude_score") or {}).get("signal", "HOLD"),
            "capital_usd":     round(capital, 2),
        }

    if not positions:
        logger.error("PORTFOLIO SANITY: aucune position valide — initialisation annulée")
        return {}

    # Garde-fou : sum(capital_usd) doit être ≈ INITIAL_CAPITAL (±5%)
    total_cap = sum(p["capital_usd"] for p in positions.values())
    if not (INITIAL_CAPITAL * 0.50 < total_cap < INITIAL_CAPITAL * 1.50):
        logger.error(
            "PORTFOLIO SANITY: sum(capital_usd)=%.2f ≠ initial=%.2f — abandon",
            total_cap, INITIAL_CAPITAL
        )
        return {}

    portfolio = {
        "created_at":      datetime.utcnow().isoformat(),
        "initial_capital": INITIAL_CAPITAL,
        "currency":        "USD",
        "positions":       positions,
        "history": [{
            "date":        today,
            "total_value": INITIAL_CAPITAL,   # hardcodé à J0 : toujours 0%
            "return_pct":  0.0,
            "cash":        round(INITIAL_CAPITAL - total_cap, 2),
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
            # Garde-fou : ignorer si la valorisation est absurde (>10x ou <0.01x l'initial)
            contrib = pos["units"] * price_usd
            if 0 < contrib < initial_cap * 50:
                current_value += contrib
            else:
                logger.warning("REBALANCE SANITY: %s contrib=%.2f hors limites, fallback capital", name, contrib)
                current_value += pos.get("capital_usd", 0)
        else:
            current_value += pos.get("capital_usd", 0)

    # Garde-fou global : si la valeur calculée est aberrante, on conserve l'initial
    if current_value <= 0 or current_value > initial_cap * 20:
        logger.error("REBALANCE SANITY: current_value=%.2f aberrant → conserve initial_cap=%.2f", current_value, initial_cap)
        current_value = initial_cap

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
        if not _validate_price_usd(name, price_usd, capital):
            continue
        new_positions[name] = {
            "units":           round(capital / price_usd, 8),
            "entry_price_usd": round(price_usd, 6),
            "entry_price_nat": round(asset["current"], 6),
            "currency":        (asset.get("currency") or "USD"),
            "weight":          round(weight, 4),
            "signal":          (asset.get("claude_score") or {}).get("signal", "HOLD"),
            "capital_usd":     round(capital, 2),
        }

    if not new_positions:
        logger.error("REBALANCE SANITY: aucune position valide — on conserve les anciennes")
        new_positions = positions

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
    """Charge le portefeuille. Rééquilibre au maximum une fois par jour."""
    has_scores = any(a.get("claude_score") for a in assets.values())
    if not has_scores:
        return {}

    existing = load_portfolio()
    if existing is None:
        return initialize_portfolio(assets)

    # Ne rééquilibre pas si on a déjà une entrée pour aujourd'hui
    today = date.today().isoformat()
    history = existing.get("history", [])
    if history and history[-1].get("date") == today:
        return existing

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
