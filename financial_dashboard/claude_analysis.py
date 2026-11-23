# claude_analysis.py — Analyses via la CLI Claude Code (`claude -p`)

import json
import logging
from datetime import datetime

from claude_cli import ask_claude, parse_json

logger = logging.getLogger(__name__)

# ── Rapport macro ─────────────────────────────────────────────────────────────

def generate_macro_report(
    assets: dict,
    news: list[dict] | None = None,
    geo_news: list[dict] | None = None,
) -> str:
    """
    Génère un rapport macro structuré en markdown enrichi avec des actualités
    économiques et géopolitiques séparées pour un contexte géopolitique approfondi.
    """
    try:
        lines = []
        for name, asset in assets.items():
            if asset.get("error"):
                continue
            pct = asset.get("pct_change")
            cur = asset.get("current")
            ind = asset.get("indicators", {})
            rsi = ind.get("rsi")
            vol = ind.get("volatility")
            signal = (asset.get("claude_score") or {}).get("signal", "")
            lines.append(
                f"- {name} ({asset.get('category', '')}) : "
                f"prix={cur:.4g}, variation={pct:+.2f}%"
                + (f", RSI={rsi:.1f}" if rsi else "")
                + (f", volatilité={vol:.1f}%" if vol else "")
                + (f", signal={signal}" if signal else "")
            )

        summary = "\n".join(lines)
        today   = datetime.utcnow().strftime("%d/%m/%Y")

        eco_block = ""
        if news:
            eco_block = "\n\nActualités économiques & marchés du jour :\n"
            for n in news:
                eco_block += f"- [{n.get('source', '')}] {n.get('title', '')}\n"

        geo_block = ""
        if geo_news:
            geo_block = "\n\nActualités géopolitiques du jour :\n"
            for n in geo_news:
                geo_block += f"- [{n.get('source', '')}] {n.get('title', '')}\n"

        prompt = f"""Date : {today}

Données de marché du jour :
{summary}
{eco_block}{geo_block}

En tant qu'analyste macro senior, rédigez un rapport structuré en **markdown** avec exactement ces sections :

## Tendances de marché
Commentez les mouvements clés des indices, matières premières, devises et cryptos. Mentionnez les niveaux RSI significatifs et les signaux techniques. Soyez précis sur les chiffres. (~100 mots)

## Contexte géopolitique & économique
Cette section doit être la plus substantielle du rapport (~200 mots). Commencez par décrire concrètement les événements géopolitiques et économiques du moment en vous appuyant sur les actualités fournies : nommez les conflits, tensions diplomatiques, décisions politiques, crises, élections ou négociations en cours. Expliquez leur logique et leurs enjeux. Ensuite seulement, établissez les liens avec les marchés financiers. L'objectif est qu'un lecteur comprenne CE QUI SE PASSE DANS LE MONDE avant de comprendre l'effet sur les marchés.

## Risques & Opportunités
**Risques :** listez 3 risques principaux identifiés.
**Opportunités :** listez 2-3 opportunités à surveiller.

## Synthèse
En une phrase concise : quelle est l'orientation probable du marché pour les prochaines 48 heures et quel est le sentiment dominant ?

Utilisez du **gras** pour les chiffres clés et événements importants. Soyez factuel, précis et perspicace."""

        return ask_claude(prompt, timeout=300)

    except Exception as e:
        logger.error("Erreur inattendue macro report : %s", e)
        return f"⚠️ Rapport indisponible : {e}"


# ── Score BUY / HOLD / SELL ───────────────────────────────────────────────────

FALLBACK = {"signal": "HOLD", "confidence": 0, "rationale": "Analyse indisponible."}


def _asset_line(name: str, asset: dict) -> str:
    ind = asset.get("indicators", {})
    prices = ", ".join(f"{p:.4g}" for p in asset.get("prices", [])[-10:])
    return (
        f"- {name} ({asset.get('category', '')}) : prix {asset.get('current') or 'N/A'}, "
        f"var. jour {asset.get('pct_change') or 'N/A'}%, RSI {ind.get('rsi', 'N/A')}, "
        f"MACD {ind.get('macd', 'N/A')}/signal {ind.get('signal', 'N/A')}, "
        f"SMA20 {ind.get('sma20', 'N/A')}, SMA50 {ind.get('sma50', 'N/A')}, "
        f"vol. 30j {ind.get('volatility', 'N/A')}%, 10 derniers prix : {prices}"
    )


def score_all_assets(assets: dict) -> dict:
    """Score tous les actifs en UN seul appel `claude -p` et injecte le résultat dans chaque actif."""
    valid = {n: a for n, a in assets.items() if not a.get("error")}
    scores: dict = {}
    try:
        prompt = (
            "Tu es analyste quantitatif. Pour chaque actif ci-dessous, donne un signal BUY, HOLD ou SELL "
            "avec une confiance (entier 0-100) et une justification d'une phrase en français.\n\n"
            + "\n".join(_asset_line(n, a) for n, a in valid.items())
            + "\n\nRéponds UNIQUEMENT avec un objet JSON (sans markdown) de la forme :\n"
            '{"<nom exact de l\'actif>": {"signal": "BUY|HOLD|SELL", "confidence": 0, "rationale": "..."}}'
        )
        result = parse_json(ask_claude(prompt, timeout=600))
        for name in valid:
            r = result.get(name) or {}
            if r.get("signal") in ("BUY", "HOLD", "SELL"):
                scores[name] = {
                    "signal": r["signal"],
                    "confidence": max(0, min(100, int(r.get("confidence", 50)))),
                    "rationale": str(r.get("rationale", "")),
                }
    except Exception as e:
        logger.error("Scoring Claude : %s", e)

    for name, asset in assets.items():
        asset["claude_score"] = scores.get(name, FALLBACK)
    return scores
