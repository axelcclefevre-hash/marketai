# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development commands

Everything runs locally; there are no accounts, no payments and no API keys. AI features call `claude -p` (see `financial_dashboard/claude_cli.py`).

```bash
./start.sh                                   # API :8000 + frontend :3000
cd api && uvicorn main:app --reload --port 8000
cd frontend && npm run dev                   # set API_URL if the API is not on :8000
cd frontend && npm run build
```

Requires Python 3.10+ (the code uses `X | None` annotations) and the `claude` CLI logged in.

---

## Architecture

```
financial_dashboard/   ← Data layer (pure Python, no web)
api/                   ← FastAPI server (imports financial_dashboard)
frontend/              ← Next.js 14 (App Router), proxies /api/* to FastAPI via next.config.mjs
```

`api/main.py` inserts `financial_dashboard/` into `sys.path` at startup. Optional keys (FRED, Guardian, NewsAPI) and `MARKETAI_CLAUDE_MODEL` live in `financial_dashboard/.env`.

### Data pipeline (financial_dashboard/)

```
data_fetcher.py    → fetch_all_data()     yfinance + CoinGecko + FRED
indicators.py      → enrich_assets()      RSI, MACD, SMA, volatility
claude_analysis.py → score_all_assets()   BUY/HOLD/SELL + confidence, ONE `claude -p` call for all assets
claude_cli.py      → ask_claude()         subprocess wrapper around `claude -p` (no tools, no session)
portfolio.py       → get_or_update_portfolio()  signal-driven, rebalances once/day
```

Market data is cached at `api/cache/market_data.json`. `_get_enriched_data()` returns immediately and starts the AI scoring + macro report in a background thread (`_run_ai_job`); `/api/market-data` exposes `ai: {available, running}` and the frontend polls while it runs.

### Portfolio (simulated)

`financial_dashboard/portfolio.py` manages `api/cache/portfolio.json`: only BUY-signal assets enter (fallback: equal weight), excluded categories `{"Indices", "Obligations"}`, max 15 positions, max 40% per category, max 4 assets per category, rebalance at most once per day, 60-day changelog.

### Personal portfolio

`api/portfolio_user.py` asks Claude for an allocation from a risk profile ("conservateur" / "equilibre" / "croissance" / "agressif"); stored as a single row in SQLite (`UserPortfolio`, `api/marketai.db`). The questionnaire score is computed client-side.

### Frontend layout

`AppShell.tsx` wraps all pages (sidebar drawer on mobile, fixed on `lg+`). Add nav links in the `nav` array of `Sidebar.tsx`. Design tokens are CSS variables in `app/globals.css`, mapped in `tailwind.config.ts` (use `text-muted`, `bg-surface`, `.card`, never raw hex).

---

## Key conventions

- **`_sanitize()`** in `api/main.py` converts numpy/pandas types to JSON-serializable ones. Wrap endpoint return values with it.
- **Tables on mobile**: wrap in `<div className="overflow-x-auto">` with `min-w-[Npx]` on the table; hide secondary columns with `hidden sm:table-cell`.
- **ESLint and TypeScript build errors are ignored** in `next.config.mjs`.
- **No test suite**: validate by running both servers and testing manually.
