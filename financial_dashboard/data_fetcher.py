# data_fetcher.py — Récupération des données de marché

import os
import json
import time
import logging
from datetime import datetime, timedelta, date

import pandas as pd
import numpy as np
import yfinance as yf
import requests

from config import (
    INDICES, ETFS, STOCKS, COMMODITIES, FOREX, CRYPTO_IDS, FRED_SERIES,
    EUR_TICKERS, JPY_TICKERS,
    LOOKBACK_DAYS, COINGECKO_DELAY, COINGECKO_DAYS,
    CACHE_FILE, CACHE_DIR,
)

logger = logging.getLogger(__name__)

# ── Helpers ───────────────────────────────────────────────────────────────────

def _today_str() -> str:
    return date.today().isoformat()


def _to_serialisable(obj):
    """Convertit les types numpy/pandas en types Python natifs pour JSON."""
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, (np.ndarray,)):
        return obj.tolist()
    if isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    return str(obj)


# ── yfinance ──────────────────────────────────────────────────────────────────

def fetch_yfinance_asset(ticker: str, name: str) -> dict:
    """Télécharge l'historique et les méta-données d'un actif yfinance."""
    try:
        end   = datetime.now()
        start = end - timedelta(days=LOOKBACK_DAYS)
        df = yf.download(ticker, start=start, end=end, progress=False, auto_adjust=True)
        if df.empty:
            raise ValueError(f"Aucune donnée pour {ticker}")

        # Aplatir les colonnes MultiIndex si nécessaire (yfinance ≥ 0.2.x)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        close   = df["Close"].dropna()
        prices  = close.values.tolist()
        dates   = [d.isoformat() for d in close.index]
        current = float(close.iloc[-1])
        prev    = float(close.iloc[-2]) if len(close) >= 2 else current
        pct_chg = (current - prev) / prev * 100

        # OHLCV pour le chandelier
        ohlcv = {
            "open":   df["Open"].ffill().values.tolist(),
            "high":   df["High"].ffill().values.tolist(),
            "low":    df["Low"].ffill().values.tolist(),
            "close":  prices,
            "volume": df["Volume"].fillna(0).values.tolist() if "Volume" in df.columns else [],
        }

        return {
            "name":        name,
            "ticker":      ticker,
            "category":    _category(ticker),
            "currency":    _currency(ticker),
            "current":     current,
            "pct_change":  round(pct_chg, 2),
            "prices":      prices,
            "dates":       dates,
            "ohlcv":       ohlcv,
            "fetched_at":  datetime.utcnow().isoformat(),
            "error":       None,
        }
    except Exception as e:
        logger.error("yfinance %s : %s", ticker, e)
        return _empty_asset(name, ticker, str(e))


def _category(ticker: str) -> str:
    if ticker in INDICES.values():
        return "Indices"
    if ticker in ETFS.values():
        return "ETFs"
    if ticker in STOCKS.values():
        return "Actions"
    if ticker in COMMODITIES.values():
        return "Matières premières"
    if ticker in FOREX.values():
        return "Forex"
    return "Autre"


def _currency(ticker: str) -> str:
    cat = _category(ticker)
    if cat == "Forex":
        return "RATIO"
    if ticker in EUR_TICKERS:
        return "EUR"
    if ticker in JPY_TICKERS:
        return "JPY"
    return "USD"


# ── CoinGecko ─────────────────────────────────────────────────────────────────

def fetch_crypto(coin_id: str, name: str) -> dict:
    """Récupère l'historique prix d'une crypto via CoinGecko (API publique)."""
    try:
        url = (
            f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
            f"?vs_currency=usd&days={COINGECKO_DAYS}&interval=daily"
        )
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        prices_raw = data.get("prices", [])
        if not prices_raw:
            raise ValueError("Données vides")

        dates  = [datetime.utcfromtimestamp(p[0] / 1000).date().isoformat() for p in prices_raw]
        prices = [p[1] for p in prices_raw]

        current = prices[-1]
        prev    = prices[-2] if len(prices) >= 2 else current
        pct_chg = (current - prev) / prev * 100

        time.sleep(COINGECKO_DELAY)

        return {
            "name":       name,
            "ticker":     coin_id,
            "category":   "Crypto",
            "currency":   "USD",
            "current":    current,
            "pct_change": round(pct_chg, 2),
            "prices":     prices,
            "dates":      dates,
            "ohlcv":      {},
            "fetched_at": datetime.utcnow().isoformat(),
            "error":      None,
        }
    except Exception as e:
        logger.error("CoinGecko %s : %s", coin_id, e)
        time.sleep(COINGECKO_DELAY)
        return _empty_asset(name, coin_id, str(e))


# ── FRED ─────────────────────────────────────────────────────────────────────

def fetch_fred_series(series_id: str, name: str, api_key: str) -> dict:
    """Récupère une série FRED."""
    try:
        from fredapi import Fred
        fred  = Fred(api_key=api_key)
        start = (datetime.now() - timedelta(days=LOOKBACK_DAYS)).strftime("%Y-%m-%d")
        s     = fred.get_series(series_id, observation_start=start).dropna()
        if s.empty:
            raise ValueError("Série FRED vide")

        prices  = s.values.tolist()
        dates   = [d.isoformat() for d in s.index]
        current = float(s.iloc[-1])
        prev    = float(s.iloc[-2]) if len(s) >= 2 else current
        pct_chg = (current - prev) / prev * 100

        return {
            "name":       name,
            "ticker":     series_id,
            "category":   "Obligations",
            "currency":   "%",
            "current":    current,
            "pct_change": round(pct_chg, 2),
            "prices":     prices,
            "dates":      dates,
            "ohlcv":      {},
            "fetched_at": datetime.utcnow().isoformat(),
            "error":      None,
        }
    except Exception as e:
        logger.error("FRED %s : %s", series_id, e)
        return _empty_asset(name, series_id, str(e))


# ── Agrégateur principal ──────────────────────────────────────────────────────

def fetch_all_data(fred_api_key: str = "") -> dict:
    """Collecte toutes les données et retourne un dict prêt à être mis en cache."""
    assets = {}

    print("  › Indices...")
    for name, ticker in INDICES.items():
        assets[name] = fetch_yfinance_asset(ticker, name)

    print("  › ETFs...")
    for name, ticker in ETFS.items():
        assets[name] = fetch_yfinance_asset(ticker, name)

    print("  › Actions...")
    for name, ticker in STOCKS.items():
        assets[name] = fetch_yfinance_asset(ticker, name)

    print("  › Matières premières...")
    for name, ticker in COMMODITIES.items():
        assets[name] = fetch_yfinance_asset(ticker, name)

    print("  › Forex...")
    for name, ticker in FOREX.items():
        assets[name] = fetch_yfinance_asset(ticker, name)

    print("  › Crypto (CoinGecko)...")
    for name, coin_id in CRYPTO_IDS.items():
        assets[name] = fetch_crypto(coin_id, name)

    if fred_api_key:
        print("  › Obligations (FRED)...")
        for name, series_id in FRED_SERIES.items():
            assets[name] = fetch_fred_series(series_id, name, fred_api_key)
    else:
        logger.warning("FRED_API_KEY absent — obligations ignorées")

    payload = {
        "date":   _today_str(),
        "assets": assets,
    }
    save_cache(payload)
    return payload


# ── Cache ─────────────────────────────────────────────────────────────────────

def save_cache(data: dict):
    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, default=_to_serialisable, ensure_ascii=False, indent=2)


def load_cache() -> dict | None:
    if not os.path.exists(CACHE_FILE):
        return None
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error("Lecture cache : %s", e)
        return None


def cache_is_fresh() -> bool:
    """Vérifie si le cache date d'aujourd'hui."""
    data = load_cache()
    return data is not None and data.get("date") == _today_str()


# ── Utilitaires ───────────────────────────────────────────────────────────────

def _empty_asset(name: str, ticker: str, error: str) -> dict:
    return {
        "name":       name,
        "ticker":     ticker,
        "category":   "Inconnu",
        "current":    None,
        "pct_change": None,
        "prices":     [],
        "dates":      [],
        "ohlcv":      {},
        "fetched_at": datetime.utcnow().isoformat(),
        "error":      error,
    }


def get_prices_df(assets: dict) -> pd.DataFrame:
    """Construit un DataFrame des séries de clôture pour la matrice de corrélation."""
    series = {}
    for name, asset in assets.items():
        prices = asset.get("prices", [])
        dates  = asset.get("dates", [])
        if not (prices and dates and len(prices) == len(dates) and len(prices) >= 5):
            continue
        try:
            clean_prices = [float(p) if p is not None else float("nan") for p in prices]
            s = pd.Series(clean_prices, index=pd.to_datetime(dates), name=name)
            # Dédupliquer les dates (CoinGecko peut retourner 2 points pour le même jour)
            s = s[~s.index.duplicated(keep="last")]
            if s.notna().sum() >= 5:
                series[name] = s
        except Exception:
            continue
    if not series:
        return pd.DataFrame()
    df = pd.DataFrame(series).sort_index()
    # Garder les 30 derniers jours calendaires
    df = df.tail(35)
    # Combler les jours fériés/week-ends (crypto vs actions)
    df = df.ffill().bfill()
    # Supprimer les colonnes entièrement vides
    df = df.dropna(axis=1, how="all")
    return df.pct_change().dropna(how="all")
