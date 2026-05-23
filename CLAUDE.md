# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development commands

### Backend (FastAPI — port 8000)
```bash
cd api
uvicorn main:app --reload --port 8000
```

### Frontend (Next.js — port 3000 in dev, 4000 in production)
```bash
cd frontend
npm run dev        # dev server
npm run build      # production build
npm run lint       # ESLint
```

### Full local stack
Both processes must run simultaneously. The frontend proxies `/api/*` to `localhost:8000` via `next.config.mjs` rewrites.

### VPS deployment (marketai.fr)
```bash
cd /var/www/marketai && git pull
sudo systemctl restart marketai-api          # backend
cd frontend && npm run build && sudo systemctl restart marketai-front  # frontend
```

Services: `marketai-api` (port 8000), `marketai-front` (port 4000). Nginx reverse-proxies marketai.fr.

---

## Architecture

### Three-layer structure

```
financial_dashboard/   ← Data layer (pure Python, no web)
api/                   ← FastAPI server (imports financial_dashboard)
frontend/              ← Next.js 14 (App Router)
```

`api/main.py` inserts `financial_dashboard/` into `sys.path` at startup so it can import its modules directly. The single `.env` file lives at `financial_dashboard/.env` and is loaded by both layers.

### Data pipeline (financial_dashboard/)

```
data_fetcher.py   → fetch_all_data()     yfinance + CoinGecko + FRED
indicators.py     → enrich_assets()      RSI, MACD, SMA, volatility
claude_analysis.py→ score_all_assets()   BUY/HOLD/SELL + confidence via Claude Sonnet
portfolio.py      → get_or_update_portfolio()  signal-driven, rebalances once/day
```

All market data is cached at `api/cache/market_data.json` (NOT `financial_dashboard/cache/`). Cache freshness is checked on every request; Claude scoring is rate-limited to once/hour via an in-memory dict in `main.py`.

Asset universe is defined in `financial_dashboard/config.py`: INDICES, ETFS, STOCKS, COMMODITIES, FOREX, CRYPTO_IDS, FRED_SERIES.

### Portfolio (simulated)

`financial_dashboard/portfolio.py` manages `api/cache/portfolio.json`. Key rules:
- Only BUY-signal assets enter the allocation. Fallback: equal-weight all eligible assets.
- Excluded: `{"Indices", "Obligations"}` categories, `{"RATIO", "%", "JPY"}` currencies.
- Max 15 positions, max 40% per category, max 4 assets per category.
- Rebalances at most once per day (checks `history[-1].date`).
- Daily changelog is appended to `portfolio["changelog"]` (60-day rolling window).

### Auth

- **Backend**: `api/auth.py` — bcrypt passwords, HS256 JWT (30-day), `get_current_user` / `get_premium_user` / `get_optional_user` FastAPI dependencies.
- **Frontend**: NextAuth.js credentials provider calls `http://localhost:8000/api/auth/login` and stores the JWT in the NextAuth session.
- **Admin bypass**: `ADMIN_EMAILS` set in `auth.py` is the single source of truth. `effective_subscription(user)` always returns `"premium"` for admins — use this instead of `user.subscription_status` directly everywhere.
- **Premium gate**: backend uses `get_premium_user` dependency; frontend uses `<PremiumGate>` component (`frontend/components/ui/PremiumGate.tsx`) which checks `session.user.subscription === "premium"` or admin email.

### API routing

`next.config.mjs` rewrites:
- `/api/auth/*` → stays in Next.js (NextAuth handles it)
- `/api/*` → `localhost:8000` (FastAPI)
- `/api-backend/*` → `localhost:8000` (alias used by auth pages to avoid NextAuth intercept)

### Frontend layout

`AppShell.tsx` (client component) manages mobile sidebar state and wraps all pages. It renders:
1. `Sidebar` (slide-in drawer on mobile, always-visible on `lg+`)
2. Fixed top bar on mobile with hamburger button
3. `<main>` with `lg:ml-[260px]` and responsive padding

When adding new nav links, add to the `nav` array in `Sidebar.tsx` and import the icon from `@phosphor-icons/react`. Sidebar accepts `mobileOpen: boolean` and `onClose: () => void` props — always call `onClose` on link click.

Auth pages (login, register, forgot-password, reset-password) must NOT use `style={{ marginLeft: -260 }}` — that hack was removed. Use `min-h-[calc(100vh-3.5rem)] lg:min-h-screen flex items-center justify-center` instead.

### Stripe + Premium flow

1. User hits `/upgrade` → `POST /api/stripe/create-checkout` → Stripe Checkout session.
2. Stripe redirects to `/profile?session_id=...`.
3. `ProfileClient.tsx` calls `GET /api/stripe/confirm?session_id=...` which queries Stripe directly (no webhook dependency).
4. On success, calls NextAuth `updateSession({ subscription: "premium" })` which triggers the `trigger === "update"` branch in the JWT callback.

### Personal portfolio (Premium)

`api/portfolio_user.py` — Claude Haiku generates a JSON allocation from a risk profile string ("conservateur" / "equilibre" / "croissance" / "agressif"). Stored in `UserPortfolio` (SQLite via SQLModel). The questionnaire score is computed client-side in the frontend.

### Email

`api/emails.py` uses Resend API. Sender: `MarketAI <noreply@marketai.fr>`. Functions: `send_welcome`, `send_premium_confirmation`, `send_password_reset`. All calls are fire-and-forget in background threads to avoid blocking API responses.

---

## Key conventions

- **ESLint and TypeScript build errors are suppressed** in `next.config.mjs` (`ignoreDuringBuilds: true`). Fix errors locally but don't worry about them blocking builds.
- **`_sanitize()`** in `api/main.py` recursively converts numpy/pandas types to JSON-serializable Python types. Wrap all endpoint return values with it.
- **Tables on mobile**: wrap in `<div className="overflow-x-auto">` with `min-w-[Npx]` on the table. Hide secondary columns with `hidden sm:table-cell` on both `<th>` and `<td>`.
- **Claude model**: defined in `financial_dashboard/config.py` as `CLAUDE_MODEL`. Update it there to change the model used for scoring and macro reports.
- **No test suite** is configured. Validate changes by running the dev servers and testing manually.
