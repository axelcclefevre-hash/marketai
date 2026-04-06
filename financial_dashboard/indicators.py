# indicators.py — Calcul des indicateurs techniques

import numpy as np
import pandas as pd

from config import RSI_PERIOD, MACD_FAST, MACD_SLOW, MACD_SIGNAL, SMA_SHORT, SMA_LONG, VOL_WINDOW


# ── RSI ───────────────────────────────────────────────────────────────────────

def compute_rsi(prices: list[float], period: int = RSI_PERIOD) -> list[float | None]:
    if len(prices) < period + 1:
        return [None] * len(prices)

    s      = pd.Series(prices, dtype=float)
    delta  = s.diff()
    gain   = delta.clip(lower=0)
    loss   = (-delta).clip(lower=0)

    avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()

    rs  = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return [None if pd.isna(v) else round(float(v), 2) for v in rsi]


# ── MACD ──────────────────────────────────────────────────────────────────────

def compute_macd(
    prices: list[float],
    fast: int = MACD_FAST,
    slow: int = MACD_SLOW,
    signal: int = MACD_SIGNAL,
) -> dict:
    s       = pd.Series(prices, dtype=float)
    ema_f   = s.ewm(span=fast,   adjust=False).mean()
    ema_s   = s.ewm(span=slow,   adjust=False).mean()
    macd    = ema_f - ema_s
    sig     = macd.ewm(span=signal, adjust=False).mean()
    hist    = macd - sig

    def _clean(series):
        return [None if pd.isna(v) else round(float(v), 4) for v in series]

    return {
        "macd":      _clean(macd),
        "signal":    _clean(sig),
        "histogram": _clean(hist),
    }


# ── Moyennes mobiles ──────────────────────────────────────────────────────────

def compute_sma(prices: list[float], period: int) -> list[float | None]:
    s   = pd.Series(prices, dtype=float)
    sma = s.rolling(period).mean()
    return [None if pd.isna(v) else round(float(v), 4) for v in sma]


# ── Volatilité ────────────────────────────────────────────────────────────────

def compute_volatility(prices: list[float], window: int = VOL_WINDOW) -> float | None:
    """Volatilité annualisée sur `window` jours (en %)."""
    if len(prices) < window + 1:
        return None
    s      = pd.Series(prices[-window - 1:], dtype=float)
    ret    = s.pct_change().dropna()
    if ret.empty:
        return None
    vol    = ret.std() * np.sqrt(252) * 100
    return round(float(vol), 2)


# ── Calcul complet pour un actif ─────────────────────────────────────────────

def compute_all_indicators(asset: dict) -> dict:
    """Ajoute tous les indicateurs à un dict actif et retourne les indicateurs."""
    prices = asset.get("prices", [])
    if not prices or len(prices) < 2:
        return {
            "rsi":        None,
            "macd":       None,
            "signal":     None,
            "histogram":  None,
            "sma20":      None,
            "sma50":      None,
            "volatility": None,
            "rsi_series":       [],
            "macd_series":      [],
            "signal_series":    [],
            "histogram_series": [],
            "sma20_series":     [],
            "sma50_series":     [],
        }

    rsi_series   = compute_rsi(prices)
    macd_data    = compute_macd(prices)
    sma20_series = compute_sma(prices, SMA_SHORT)
    sma50_series = compute_sma(prices, SMA_LONG)
    vol          = compute_volatility(prices)

    # Dernières valeurs scalaires
    def _last(lst):
        vals = [v for v in lst if v is not None]
        return vals[-1] if vals else None

    return {
        "rsi":              _last(rsi_series),
        "macd":             _last(macd_data["macd"]),
        "signal":           _last(macd_data["signal"]),
        "histogram":        _last(macd_data["histogram"]),
        "sma20":            _last(sma20_series),
        "sma50":            _last(sma50_series),
        "volatility":       vol,
        # Séries complètes pour les graphiques
        "rsi_series":       rsi_series,
        "macd_series":      macd_data["macd"],
        "signal_series":    macd_data["signal"],
        "histogram_series": macd_data["histogram"],
        "sma20_series":     sma20_series,
        "sma50_series":     sma50_series,
    }


def enrich_assets(assets: dict) -> dict:
    """Enrichit tous les actifs avec leurs indicateurs techniques."""
    for name, asset in assets.items():
        indicators = compute_all_indicators(asset)
        asset["indicators"] = indicators
    return assets
