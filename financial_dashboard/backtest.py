# backtest.py — Simulation de stratégies techniques sur données historiques

import numpy as np
import pandas as pd

from indicators import compute_rsi, compute_macd, compute_sma
from config import RSI_PERIOD, MACD_FAST, MACD_SLOW, MACD_SIGNAL, SMA_SHORT

# ── Stratégies disponibles ────────────────────────────────────────────────────

STRATEGIES = {
    "sma":  "SMA Crossover (prix vs SMA20)",
    "rsi":  "RSI — Retour à la moyenne",
    "macd": "MACD Momentum",
}


# ── Génération des signaux ────────────────────────────────────────────────────

def generate_signals(prices: list[float], strategy: str) -> list[str]:
    """
    Retourne une liste de signaux ("BUY" / "SELL" / "HOLD") de même longueur
    que prices, calculée entièrement sur l'historique disponible.
    """
    n       = len(prices)
    signals = ["HOLD"] * n

    if strategy == "sma":
        sma20 = compute_sma(prices, SMA_SHORT)
        for i in range(n):
            if sma20[i] is None:
                continue
            if prices[i] > sma20[i]:
                signals[i] = "BUY"
            else:
                signals[i] = "SELL"

    elif strategy == "rsi":
        rsi = compute_rsi(prices, RSI_PERIOD)
        # État courant : on garde la position jusqu'au signal inverse
        state = "HOLD"
        for i in range(n):
            if rsi[i] is None:
                signals[i] = state
                continue
            if rsi[i] < 35:
                state = "BUY"
            elif rsi[i] > 65:
                state = "SELL"
            signals[i] = state

    elif strategy == "macd":
        macd_data = compute_macd(prices, MACD_FAST, MACD_SLOW, MACD_SIGNAL)
        hist      = macd_data["histogram"]
        state     = "HOLD"
        prev_h    = None
        for i in range(n):
            h = hist[i]
            if h is None:
                signals[i] = state
                prev_h = h
                continue
            # Croisement : histogramme passe de négatif à positif → BUY
            if prev_h is not None and prev_h <= 0 and h > 0:
                state = "BUY"
            # Croisement : histogramme passe de positif à négatif → SELL
            elif prev_h is not None and prev_h >= 0 and h < 0:
                state = "SELL"
            signals[i] = state
            prev_h = h

    return signals


# ── Simulation du portefeuille ────────────────────────────────────────────────

def run_backtest(
    prices: list[float],
    dates:  list[str],
    signals: list[str],
    initial_capital: float = 10_000.0,
) -> dict:
    """
    Simule un portefeuille Long-Only sur la base des signaux fournis.
    - Entrée sur BUY au prix du lendemain (exécution T+1)
    - Sortie sur SELL au prix du lendemain
    - 100 % investi ou 100 % cash
    """
    n            = len(prices)
    cash         = initial_capital
    units        = 0.0
    portfolio    = []
    benchmark    = []
    buy_signals  = []
    sell_signals = []
    trades       = []
    pending      = None   # signal à exécuter le jour J+1

    for i in range(n):
        price = prices[i]
        date  = dates[i]

        # ── Exécution du signal du jour précédent ──────────────────────────────
        if pending == "BUY" and units == 0 and cash > 0:
            units = cash / price
            cash  = 0.0
            buy_signals.append(i)
            trades.append({
                "date":       date,
                "type":       "ACHAT",
                "prix":       price,
                "unités":     round(units, 6),
                "pnl":        None,
                "pnl_cumul":  None,
            })

        elif pending == "SELL" and units > 0:
            proceeds = units * price
            entry_p  = trades[-1]["prix"] if trades else price
            pnl      = proceeds - (trades[-1]["unités"] * entry_p if trades else 0)
            cumul    = proceeds - initial_capital
            sell_signals.append(i)
            trades.append({
                "date":      date,
                "type":      "VENTE",
                "prix":      price,
                "unités":    round(units, 6),
                "pnl":       round(pnl, 2),
                "pnl_cumul": round(cumul, 2),
            })
            cash  = proceeds
            units = 0.0

        pending = signals[i]

        # ── Valorisation journalière ───────────────────────────────────────────
        portfolio.append(cash + units * price)

        # ── Benchmark buy-and-hold ─────────────────────────────────────────────
        if i == 0:
            bm_units = initial_capital / price
        benchmark.append(bm_units * price)

    # ── Métriques ──────────────────────────────────────────────────────────────
    metrics = _compute_metrics(portfolio, benchmark, initial_capital, trades)

    # Séries normalisées base 100
    port_norm = [v / initial_capital * 100 for v in portfolio]
    bm_norm   = [v / initial_capital * 100 for v in benchmark]

    return {
        "dates":            dates,
        "portfolio":        portfolio,
        "benchmark":        benchmark,
        "portfolio_norm":   port_norm,
        "benchmark_norm":   bm_norm,
        "signals":          signals,
        "buy_idx":          buy_signals,
        "sell_idx":         sell_signals,
        "trades":           trades,
        "metrics":          metrics,
    }


def _compute_metrics(
    portfolio: list[float],
    benchmark: list[float],
    initial: float,
    trades: list[dict],
) -> dict:
    p    = np.array(portfolio, dtype=float)
    b    = np.array(benchmark, dtype=float)

    # Rendements
    ret_strat = (p[-1] - initial) / initial * 100
    ret_bm    = (b[-1] - initial) / initial * 100

    # Max drawdown
    peak = np.maximum.accumulate(p)
    dd   = (p - peak) / np.where(peak == 0, 1, peak) * 100
    max_dd = float(dd.min())

    # Sharpe annualisé (rf = 0)
    daily_ret = np.diff(p) / p[:-1]
    sharpe    = 0.0
    if daily_ret.std() > 0:
        sharpe = float(daily_ret.mean() / daily_ret.std() * np.sqrt(252))

    # Trades aller-retour (paires ACHAT → VENTE)
    sells     = [t for t in trades if t["type"] == "VENTE" and t["pnl"] is not None]
    n_trades  = len(sells)
    win_rate  = (sum(1 for t in sells if t["pnl"] > 0) / n_trades * 100) if n_trades else 0.0

    return {
        "return_pct":           round(ret_strat, 2),
        "benchmark_return_pct": round(ret_bm, 2),
        "max_drawdown_pct":     round(max_dd, 2),
        "sharpe":               round(sharpe, 2),
        "n_trades":             n_trades,
        "win_rate_pct":         round(win_rate, 1),
    }


# ── Wrapper haut niveau ───────────────────────────────────────────────────────

def backtest_asset(
    asset:           dict,
    strategy:        str   = "sma",
    initial_capital: float = 10_000.0,
    lookback_days:   int   = 90,
) -> dict:
    """
    Lance le backtest complet sur un actif.
    Retourne le dict résultat ou {} si les données sont insuffisantes.
    """
    prices = asset.get("prices", [])
    dates  = asset.get("dates", [])

    if not prices or len(prices) < 30:
        return {}

    # Limiter à lookback_days
    prices = prices[-lookback_days:]
    dates  = dates[-lookback_days:]

    signals = generate_signals(prices, strategy)
    return run_backtest(prices, dates, signals, initial_capital)
