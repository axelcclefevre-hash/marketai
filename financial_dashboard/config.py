# config.py — Configuration centrale du dashboard

# ── Indices ───────────────────────────────────────────────────────────────────

INDICES = {
    "S&P 500":    "^GSPC",
    "Nasdaq":     "^IXIC",
    "CAC 40":     "^FCHI",
    "Nikkei 225": "^N225",
    # "DAX":        "^GDAXI",
    # "FTSE 100":   "^FTSE",
    # "Russell 2000":"^RUT",
    # "VIX":        "^VIX",
}

# ── ETFs ──────────────────────────────────────────────────────────────────────

ETFS = {
    "S&P 500 ETF":   "SPY",    # SPDR S&P 500 — benchmark universel
    "Nasdaq-100 ETF":"QQQ",    # Invesco Nasdaq-100
    "MSCI World ETF":"URTH",   # iShares MSCI World
    "MSCI EM ETF":   "EEM",    # iShares MSCI Emerging Markets
    # "MSCI Europe ETF":  "IEV",
    # "Dividend Global":  "SDIV",
}

# ── Actions individuelles ─────────────────────────────────────────────────────

STOCKS = {
    # US Tech — les plus tradées sur Revolut & Trade Republic 2024-2025
    "Apple":     "AAPL",
    "Microsoft": "MSFT",
    "Nvidia":    "NVDA",
    "Alphabet":  "GOOGL",
    "Meta":      "META",
    "Amazon":    "AMZN",
    "Tesla":     "TSLA",
    # Finance US
    "JPMorgan":  "JPM",
    # Europe
    "ASML":      "ASML",       # Semi-conducteurs, Amsterdam
    "LVMH":      "MC.PA",      # Luxe, Paris
    "Novo Nordisk": "NVO",     # Pharma, Ozempic
    # "SAP":             "SAP",
    # "Palantir":        "PLTR",
    # "Goldman Sachs":   "GS",
}

# ── Matières premières ────────────────────────────────────────────────────────

COMMODITIES = {
    "Or":          "GC=F",
    "Argent":      "SI=F",
    "Pétrole WTI": "CL=F",
    "Platine":     "PL=F",
    "Cuivre":      "HG=F",
    # "Gaz naturel": "NG=F",
    # "Blé":         "ZW=F",
}

# ── Forex ─────────────────────────────────────────────────────────────────────

FOREX = {
    "EUR/USD": "EURUSD=X",
    "USD/JPY": "JPY=X",
    "GBP/USD": "GBPUSD=X",
    # "AUD/USD": "AUDUSD=X",
    # "USD/CHF": "CHFUSD=X",
}

# ── Crypto (CoinGecko IDs) ────────────────────────────────────────────────────

CRYPTO_IDS = {
    "Bitcoin":  "bitcoin",
    "Ethereum": "ethereum",
    "Solana":   "solana",
    "BNB":      "binancecoin",
    "XRP":      "ripple",
    # "Cardano":  "cardano",
    # "Avalanche":"avalanche-2",
    # "Polkadot": "polkadot",
}

# ── Obligations / taux FRED ───────────────────────────────────────────────────

FRED_SERIES = {
    "US 10Y Treasury": "DGS10",
    "US 2Y Treasury":  "DGS2",
}

# ── Devises non-USD pour conversion portefeuille ──────────────────────────────
# Tickers yfinance dont le prix est en EUR (nécessite conversion dans portfolio.py)
EUR_TICKERS = {"^FCHI", "MC.PA"}
# Tickers dont le prix est en JPY
JPY_TICKERS = {"^N225"}

# ── Thresholds / alertes ──────────────────────────────────────────────────────

ALERT_PRICE_CHANGE_PCT = 5.0
ALERT_RSI_OVERBOUGHT   = 70
ALERT_RSI_OVERSOLD     = 30

# ── Indicateurs techniques ────────────────────────────────────────────────────

RSI_PERIOD    = 14
MACD_FAST     = 12
MACD_SLOW     = 26
MACD_SIGNAL   = 9
SMA_SHORT     = 20
SMA_LONG      = 50
VOL_WINDOW    = 30
LOOKBACK_DAYS = 90

# ── Planificateur ─────────────────────────────────────────────────────────────

REFRESH_HOUR   = 8
REFRESH_MINUTE = 0

# ── Modèle Claude ─────────────────────────────────────────────────────────────

CLAUDE_MODEL = "claude-sonnet-4-20250514"

# ── Cache ─────────────────────────────────────────────────────────────────────

CACHE_DIR  = "cache"
CACHE_FILE = "cache/market_data.json"

# ── CoinGecko ─────────────────────────────────────────────────────────────────

COINGECKO_DELAY = 1.2
COINGECKO_DAYS  = 30
