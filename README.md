# MarketAI

Tableau de bord de marchés avec un portefeuille simulé piloté par Claude. Tout tourne **en local**, sans compte, sans abonnement et sans clé API : l'IA passe par [Claude Code](https://claude.com/claude-code) (`claude -p`).

## Fonctionnalités

- **Vue d'ensemble** : actions, ETF, indices, matières premières, forex, crypto et obligations, avec indicateurs (RSI, MACD, moyennes mobiles, volatilité) et signaux Achat / Conserver / Vente générés par Claude
- **Portefeuille simulé** : allocation automatique à partir des signaux, rééquilibrée une fois par jour, avec journal des modifications
- **Mon portefeuille** : allocation personnalisée selon ton profil de risque (questionnaire en 5 questions)
- **Rapport macro** : analyse des marchés et du contexte géopolitique rédigée par Claude
- **Corrélations**, **Backtesting** (SMA, RSI, MACD) et **Apprendre** (7 modules inspirés du cours NUS Investment Management)

## Prérequis

- Python 3.10 ou plus
- Node.js 18 ou plus
- [Claude Code](https://claude.com/claude-code) installé et connecté (la commande `claude` doit fonctionner dans ton terminal). Sans lui, tout marche sauf les signaux IA, le rapport macro et « Mon portefeuille ».

## Installation

```bash
git clone https://github.com/axelcclefevre-hash/marketai.git
cd marketai
python3 -m venv .venv && source .venv/bin/activate
pip install -r api/requirements.txt
cd frontend && npm install && cd ..
```

## Lancer

```bash
./start.sh
```

Le site est sur http://localhost:3000 et l'API sur http://localhost:8000. Au premier lancement, les signaux IA et le rapport macro arrivent en arrière-plan après environ une minute ; la page se met à jour toute seule.

Sous Windows : `start.ps1`.

## Configuration (facultative)

Copie `financial_dashboard/.env.example` en `financial_dashboard/.env` :

| Variable | Rôle |
| --- | --- |
| `MARKETAI_CLAUDE_MODEL` | Modèle passé à `claude -p` (`sonnet` par défaut, ou `opus`, `haiku`) |
| `FRED_API_KEY` | Données obligataires US (gratuit sur fred.stlouisfed.org) |
| `GUARDIAN_KEY`, `NEWSAPI_KEY` | Actualités pour le rapport macro |

## Architecture

```
financial_dashboard/   données et analyses (Python pur) : yfinance, CoinGecko, FRED, indicateurs, appels à claude -p
api/                   serveur FastAPI (port 8000)
frontend/              Next.js 14, Tailwind, Recharts (port 3000)
```

Les données sont mises en cache dans `api/cache/` et le portefeuille personnel dans `api/marketai.db` (SQLite). Rien ne quitte ta machine, à part les requêtes vers les sources de données et vers Claude.

## Avertissement

Projet éducatif. Les signaux et rapports sont générés par une IA, ne constituent pas un conseil en investissement et le portefeuille est fictif.

## Licence

[MIT](LICENSE)
