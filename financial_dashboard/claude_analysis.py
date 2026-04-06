# claude_analysis.py — Intégration Anthropic Claude API

import json
import logging
from datetime import datetime

import anthropic

from config import CLAUDE_MODEL

logger = logging.getLogger(__name__)

_client: anthropic.Anthropic | None = None


def _get_client(api_key: str) -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


# ── Rapport macro ─────────────────────────────────────────────────────────────

def generate_macro_report(assets: dict, api_key: str) -> str:
    """
    Envoie un résumé des performances à Claude et reçoit un commentaire
    macro de ~200 mots en français.
    """
    try:
        client = _get_client(api_key)

        # Construire le résumé textuel des actifs
        lines = []
        for name, asset in assets.items():
            if asset.get("error"):
                continue
            pct = asset.get("pct_change")
            cur = asset.get("current")
            ind = asset.get("indicators", {})
            rsi = ind.get("rsi")
            vol = ind.get("volatility")
            lines.append(
                f"- {name} ({asset.get('category', '')}) : "
                f"prix={cur:.4g}, variation={pct:+.2f}%"
                + (f", RSI={rsi:.1f}" if rsi else "")
                + (f", volatilité={vol:.1f}%" if vol else "")
            )

        summary = "\n".join(lines)
        today   = datetime.utcnow().strftime("%d/%m/%Y")

        prompt = (
            f"Date : {today}\n\n"
            "Voici les données de marché du jour :\n"
            f"{summary}\n\n"
            "En tant qu'analyste financier senior, rédigez un commentaire macro de marché "
            "d'environ 200 mots en français. Identifiez les tendances clés, les risques "
            "majeurs et les opportunités. Soyez précis, factuel et professionnel."
        )

        message = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text

    except anthropic.APIError as e:
        logger.error("Claude macro report : %s", e)
        return f"⚠️ Rapport indisponible (erreur API Claude : {e})"
    except Exception as e:
        logger.error("Erreur inattendue macro report : %s", e)
        return f"⚠️ Rapport indisponible : {e}"


# ── Score BUY / HOLD / SELL ───────────────────────────────────────────────────

_SIGNAL_SCHEMA = """\
Réponds UNIQUEMENT avec un objet JSON (sans markdown, sans commentaire) de la forme :
{
  "signal": "BUY" | "HOLD" | "SELL",
  "confidence": <entier 0-100>,
  "rationale": "<une phrase en français>"
}"""


def score_asset(name: str, asset: dict, api_key: str) -> dict:
    """
    Retourne un dict {"signal", "confidence", "rationale"} pour un actif donné.
    En cas d'erreur, retourne un signal HOLD avec confidence 0.
    """
    fallback = {"signal": "HOLD", "confidence": 0, "rationale": "Analyse indisponible."}

    if asset.get("error"):
        return fallback

    try:
        client = _get_client(api_key)
        ind    = asset.get("indicators", {})

        # Construire le contexte
        prices_30 = asset.get("prices", [])[-30:]
        dates_30  = asset.get("dates", [])[-30:]
        price_str = ", ".join(
            f"{d}: {p:.4g}" for d, p in zip(dates_30, prices_30)
        )

        context = (
            f"Actif : {name} ({asset.get('category', '')})\n"
            f"Prix actuel : {asset.get('current', 'N/A'):.4g}\n"
            f"Variation journalière : {asset.get('pct_change', 'N/A'):+.2f}%\n"
            f"RSI(14) : {ind.get('rsi', 'N/A')}\n"
            f"MACD : {ind.get('macd', 'N/A')}, Signal : {ind.get('signal', 'N/A')}, "
            f"Histogramme : {ind.get('histogram', 'N/A')}\n"
            f"SMA20 : {ind.get('sma20', 'N/A')}, SMA50 : {ind.get('sma50', 'N/A')}\n"
            f"Volatilité 30j annualisée : {ind.get('volatility', 'N/A')}%\n\n"
            f"Prix des 30 derniers jours :\n{price_str}\n\n"
            + _SIGNAL_SCHEMA
        )

        message = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=200,
            messages=[{"role": "user", "content": context}],
        )
        raw = message.content[0].text.strip()

        # Nettoyage markdown éventuel
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw)

        # Validation minimale
        if result.get("signal") not in ("BUY", "HOLD", "SELL"):
            raise ValueError(f"Signal invalide : {result.get('signal')}")
        result["confidence"] = max(0, min(100, int(result.get("confidence", 50))))

        return result

    except (json.JSONDecodeError, ValueError, KeyError) as e:
        logger.warning("Score %s — parsing : %s", name, e)
        return fallback
    except anthropic.APIError as e:
        logger.error("Score %s — API Claude : %s", name, e)
        return fallback
    except Exception as e:
        logger.error("Score %s — inattendu : %s", name, e)
        return fallback


def score_all_assets(assets: dict, api_key: str) -> dict:
    """Score tous les actifs et injecte le résultat dans chaque dict actif."""
    scores = {}
    total  = len(assets)
    for i, (name, asset) in enumerate(assets.items(), 1):
        print(f"  › Score Claude ({i}/{total}) : {name}...")
        scores[name] = score_asset(name, asset, api_key)
        asset["claude_score"] = scores[name]
    return scores
