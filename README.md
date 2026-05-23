# MarketAI — Dashboard Financier Intelligent

> Plateforme d'analyse financière propulsée par l'IA, avec portefeuille simulé en temps réel, modules d'apprentissage Premium et rapports macro générés par Claude.

**🌐 [marketai.fr](https://marketai.fr)**

---

## Fonctionnalités

### Accès gratuit
- **Vue d'ensemble** — marchés mondiaux (actions, crypto, indices, matières premières, forex) en temps réel
- **Portefeuille simulé** — allocation automatique sur 20+ actifs avec P&L, évolution et diversification
- **Corrélations** — matrice de corrélation interactive entre actifs
- **Backtesting** — simulation de stratégie sur données historiques
- **Compte utilisateur** — inscription, connexion, profil

### Premium (9,99 €/mois)
- **Mon portefeuille** — allocation personnalisée générée par IA selon ton profil de risque (questionnaire 5 questions)
- **Rapport macro** — analyse hebdomadaire des marchés rédigée par Claude (inflation, taux, géopolitique...)
- **Apprendre à investir** — 7 modules interactifs issus du cours NUS Investment Management :
  1. Les bases de l'investissement
  2. Construire un portefeuille optimal (Markowitz)
  3. Modèles de valorisation — CAPM
  4. Efficience des marchés & finance comportementale
  5. Gestion de portefeuille en pratique
  6. Analyse obligataire
  7. Options, Futures & produits dérivés

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Auth | NextAuth.js + JWT |
| Backend | FastAPI (Python), SQLModel, SQLite |
| IA | Anthropic Claude (Haiku & Sonnet) |
| Paiement | Stripe (abonnement mensuel) |
| Email | Resend (bienvenue, premium, reset password) |
| Graphiques | Recharts |
| Animations | Framer Motion |
| Déploiement | VPS Hostinger + Nginx + systemd + Cloudflare |

---

## Architecture

```
MarketData/
├── api/                    # Backend FastAPI
│   ├── main.py             # Endpoints : market data, auth, portfolio, stripe
│   ├── models.py           # SQLModel : User, UserPortfolio, PasswordResetToken
│   ├── auth.py             # JWT, bcrypt, dépendances FastAPI
│   ├── emails.py           # Resend — emails transactionnels
│   └── portfolio_user.py   # Génération portefeuille IA selon profil risque
│
├── financial_dashboard/    # Logique marché
│   └── portfolio.py        # Allocation, enrichissement, P&L
│
└── frontend/               # Next.js app
    ├── app/                # Pages (App Router)
    │   ├── page.tsx        # Vue d'ensemble
    │   ├── portfolio/      # Portefeuille simulé
    │   ├── my-portfolio/   # Portefeuille personnel (Premium)
    │   ├── learn/          # Modules apprentissage (Premium)
    │   ├── macro/          # Rapport macro (Premium)
    │   ├── correlations/
    │   ├── backtest/
    │   ├── login/ register/ forgot-password/ reset-password/
    │   └── upgrade/        # Page abonnement Stripe
    ├── components/
    │   ├── layout/         # Sidebar, Header
    │   ├── auth/           # ProfileClient, PremiumGate
    │   ├── learn/          # LearnHub, ModuleContent, charts/
    │   └── ui/             # Composants réutilisables
    └── lib/
        ├── learn-content.ts  # Contenu des 7 modules
        └── market-utils.ts
```

---

## Installation locale

### Prérequis
- Python 3.11+
- Node.js 18+
- Clés API : Anthropic, Stripe, Resend

### Backend (FastAPI)

```bash
cd api
python -m venv venv
source venv/bin/activate  # Windows : venv\Scripts\activate
pip install -r requirements.txt

# Créer .env
cp .env.example .env
# Remplir : ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
#           RESEND_API_KEY, JWT_SECRET_KEY

uvicorn main:app --reload --port 8000
```

### Frontend (Next.js)

```bash
cd frontend
npm install

# Créer .env.local
cp .env.local.example .env.local
# Remplir : NEXTAUTH_SECRET, NEXTAUTH_URL

npm run dev  # http://localhost:3000
```

---

## Déploiement (VPS)

Le site tourne sur un VPS Hostinger avec :

- **Nginx** — reverse proxy marketai.fr → port 4000 (Next.js), /api/* → port 8000 (FastAPI)
- **systemd** — services `marketai-api` et `marketai-front`
- **Cloudflare** — SSL + CDN
- **Stripe webhook** — événements `checkout.session.completed`, `customer.subscription.*`

```bash
# Mise à jour en production
git pull
cd api && pip install -r requirements.txt
sudo systemctl restart marketai-api
cd ../frontend && npm install && npm run build
sudo systemctl restart marketai-front
```

---

## Variables d'environnement

### `api/.env`
```env
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
JWT_SECRET_KEY=...
```

### `frontend/.env.local`
```env
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://marketai.fr
```

---

## Auteur

Développé par **Axel** — [marketai.fr](https://marketai.fr)

---

*MarketAI est un projet personnel à but éducatif. Les données affichées et les allocations générées par IA ne constituent pas des conseils en investissement.*
