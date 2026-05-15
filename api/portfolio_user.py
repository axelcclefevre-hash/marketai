"""
Génération de portefeuilles personnalisés basés sur le profil de risque.
Claude génère l'allocation exacte en fonction du profil et des signaux actuels.
"""

import json
import sys
from datetime import date, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "financial_dashboard"))

import anthropic

RISK_PROFILES = {
    "conservateur": {
        "label": "Conservateur",
        "description": "Préservation du capital avec rendements stables",
        "categories": {
            "Obligations": 0.40,
            "ETFs": 0.35,
            "Actions": 0.20,
            "Crypto": 0.05,
        },
        "max_volatility": 15.0,
    },
    "equilibre": {
        "label": "Équilibré",
        "description": "Croissance modérée avec risque maîtrisé",
        "categories": {
            "ETFs": 0.35,
            "Actions": 0.45,
            "Matières premières": 0.10,
            "Crypto": 0.10,
        },
        "max_volatility": 25.0,
    },
    "croissance": {
        "label": "Croissance",
        "description": "Rendements élevés avec volatilité acceptée",
        "categories": {
            "ETFs": 0.20,
            "Actions": 0.50,
            "Matières premières": 0.15,
            "Crypto": 0.15,
        },
        "max_volatility": 40.0,
    },
    "agressif": {
        "label": "Agressif",
        "description": "Maximisation des gains avec risque élevé",
        "categories": {
            "ETFs": 0.10,
            "Actions": 0.35,
            "Matières premières": 0.20,
            "Crypto": 0.35,
        },
        "max_volatility": 999.0,
    },
}


def score_from_answers(answers: list[int]) -> str:
    """Convertit les réponses du questionnaire en profil de risque. answers: liste de scores 0-3."""
    total = sum(answers)
    max_score = len(answers) * 3
    pct = total / max_score

    if pct < 0.30:
        return "conservateur"
    elif pct < 0.55:
        return "equilibre"
    elif pct < 0.75:
        return "croissance"
    else:
        return "agressif"


def generate_user_portfolio(risk_profile: str, assets: dict, api_key: str, initial_capital: float = 10000.0) -> dict:
    """
    Génère un portefeuille personnalisé via Claude basé sur le profil de risque.
    Retourne un dict portfolio prêt à être stocké.
    """
    profile_info = RISK_PROFILES.get(risk_profile, RISK_PROFILES["equilibre"])
    today = date.today().isoformat()

    # Filtrer les actifs pertinents et construire le résumé
    lines = []
    for name, asset in assets.items():
        if asset.get("error"):
            continue
        cat = asset.get("category", "")
        pct = asset.get("pct_change", 0) or 0
        score = asset.get("claude_score", {})
        signal = score.get("signal", "HOLD")
        conf = score.get("confidence", 50)
        ind = asset.get("indicators", {})
        rsi = ind.get("rsi")
        lines.append(
            f"- {name} ({cat}): prix={asset.get('current'):.4g}, "
            f"variation={pct:+.2f}%, signal={signal}({conf}%)"
            + (f", RSI={rsi:.1f}" if rsi else "")
        )

    summary = "\n".join(lines[:30])
    cat_targets = "\n".join(f"  - {cat}: ~{int(w*100)}%" for cat, w in profile_info["categories"].items())

    prompt = f"""Date : {today}
Profil de risque : {profile_info['label']} — {profile_info['description']}
Capital initial : {initial_capital:.0f} USD

Allocation cible par catégorie :
{cat_targets}

Actifs disponibles avec signaux :
{summary}

Tu es un gestionnaire de portefeuille. Sélectionne entre 6 et 12 actifs pour construire un portefeuille adapté au profil "{profile_info['label']}".

Réponds UNIQUEMENT avec un JSON valide (aucun markdown, aucun commentaire) :
{{
  "positions": [
    {{"name": "nom_actif", "weight": 0.XX, "rationale": "raison courte en français"}}
  ],
  "strategy_summary": "Résumé de la stratégie en 2 phrases en français"
}}

Règles :
- La somme des poids doit être exactement 1.0
- Respecte les proportions par catégorie du profil
- Favorise les actifs avec signal BUY pour ce profil
- Les actifs à haute volatilité (Crypto) ne doivent pas dépasser leur quota"""

    client = anthropic.Anthropic(api_key=api_key)
    msg = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = msg.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    result = json.loads(raw)

    # Construire les positions finales
    positions = []
    for pos in result.get("positions", []):
        name = pos["name"]
        weight = pos["weight"]
        asset = assets.get(name)
        if not asset or asset.get("error"):
            continue
        price = asset.get("current", 0)
        if not price:
            continue
        capital_alloc = initial_capital * weight
        positions.append({
            "name": name,
            "weight": round(weight, 4),
            "entry_price": round(price, 6),
            "units": round(capital_alloc / price, 6),
            "capital_usd": round(capital_alloc, 2),
            "rationale": pos.get("rationale", ""),
            "signal": asset.get("claude_score", {}).get("signal", "HOLD"),
            "category": asset.get("category", ""),
        })

    return {
        "risk_profile": risk_profile,
        "profile_label": profile_info["label"],
        "strategy_summary": result.get("strategy_summary", ""),
        "initial_capital": initial_capital,
        "created_at": datetime.utcnow().isoformat(),
        "positions": positions,
        "history": [{
            "date": today,
            "total_value": initial_capital,
            "return_pct": 0.0,
        }],
    }


def update_portfolio_value(portfolio: dict, assets: dict) -> dict:
    """Met à jour la valeur du portefeuille avec les prix actuels."""
    today = date.today().isoformat()
    positions = portfolio.get("positions", [])
    initial = portfolio.get("initial_capital", 10000.0)

    total = 0.0
    updated_positions = []
    for pos in positions:
        asset = assets.get(pos["name"])
        if asset and not asset.get("error"):
            current_price = asset.get("current", pos["entry_price"])
        else:
            current_price = pos["entry_price"]
        current_val = pos["units"] * current_price
        total += current_val
        updated_positions.append({**pos, "current_price": round(current_price, 6), "current_value": round(current_val, 2)})

    ret_pct = (total - initial) / initial * 100 if initial else 0
    history = portfolio.get("history", [])
    entry = {"date": today, "total_value": round(total, 2), "return_pct": round(ret_pct, 2)}
    if history and history[-1]["date"] == today:
        history[-1] = entry
    else:
        history.append(entry)

    return {**portfolio, "positions": updated_positions, "history": history}
