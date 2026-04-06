# notifications.py — Alertes desktop Windows via plyer

import logging
import os
import json
from datetime import date

from config import (
    ALERT_PRICE_CHANGE_PCT, ALERT_RSI_OVERBOUGHT, ALERT_RSI_OVERSOLD, CACHE_DIR
)

logger = logging.getLogger(__name__)

_NOTIF_LOG = os.path.join(CACHE_DIR, "notifications_sent.json")


def _load_sent() -> dict:
    """Charge les alertes déjà envoyées aujourd'hui (évite les doublons)."""
    if not os.path.exists(_NOTIF_LOG):
        return {}
    try:
        with open(_NOTIF_LOG, "r", encoding="utf-8") as f:
            data = json.load(f)
        # Réinitialiser si ce n'est plus aujourd'hui
        if data.get("date") != date.today().isoformat():
            return {}
        return data.get("sent", {})
    except Exception:
        return {}


def _save_sent(sent: dict):
    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(_NOTIF_LOG, "w", encoding="utf-8") as f:
        json.dump({"date": date.today().isoformat(), "sent": sent}, f)


def _notify(title: str, message: str, key: str, sent: dict) -> bool:
    """
    Envoie une notification desktop si elle n'a pas déjà été envoyée aujourd'hui.
    Retourne True si une notification a été émise.
    """
    if key in sent:
        return False
    try:
        from plyer import notification
        notification.notify(
            title=title,
            message=message,
            app_name="Dashboard Marchés",
            timeout=8,          # secondes avant fermeture auto
        )
        sent[key] = True
        logger.info("Notification envoyée : %s", title)
        return True
    except Exception as e:
        logger.warning("Notification impossible : %s", e)
        return False


def check_and_notify(assets: dict) -> list[dict]:
    """
    Parcourt tous les actifs, émet une notification Windows pour chaque alerte
    nouvelle (une seule fois par actif par jour).
    Retourne la liste des alertes détectées (même celles déjà notifiées).
    """
    sent   = _load_sent()
    alerts = []

    for name, asset in assets.items():
        if asset.get("error") or asset.get("current") is None:
            continue

        ind     = asset.get("indicators") or {}
        pct     = asset.get("pct_change")
        rsi     = ind.get("rsi")

        # ── Variation journalière ──────────────────────────────────────────────
        if pct is not None and abs(pct) >= ALERT_PRICE_CHANGE_PCT:
            direction = "hausse" if pct > 0 else "baisse"
            emoji     = "🚀" if pct > 0 else "📉"
            msg       = f"{emoji} {name} : {pct:+.2f}% aujourd'hui"
            key       = f"{name}_pct_{date.today().isoformat()}"
            _notify(
                title=f"{emoji} Alerte marché — {name}",
                message=f"Variation journalière : {pct:+.2f}%",
                key=key, sent=sent,
            )
            alerts.append({"asset": name, "type": "variation", "msg": msg,
                           "level": "danger" if abs(pct) >= ALERT_PRICE_CHANGE_PCT * 1.5 else "warning"})

        # ── RSI surachat ───────────────────────────────────────────────────────
        if rsi is not None and rsi > ALERT_RSI_OVERBOUGHT:
            msg = f"⚠️ {name} : RSI {rsi:.1f} — surachat"
            key = f"{name}_rsi_high_{date.today().isoformat()}"
            _notify(
                title=f"⚠️ RSI surachat — {name}",
                message=f"RSI = {rsi:.1f} (seuil : {ALERT_RSI_OVERBOUGHT})",
                key=key, sent=sent,
            )
            alerts.append({"asset": name, "type": "rsi_high", "msg": msg, "level": "warning"})

        # ── RSI survente ───────────────────────────────────────────────────────
        if rsi is not None and rsi < ALERT_RSI_OVERSOLD:
            msg = f"⚠️ {name} : RSI {rsi:.1f} — survente"
            key = f"{name}_rsi_low_{date.today().isoformat()}"
            _notify(
                title=f"⚠️ RSI survente — {name}",
                message=f"RSI = {rsi:.1f} (seuil : {ALERT_RSI_OVERSOLD})",
                key=key, sent=sent,
            )
            alerts.append({"asset": name, "type": "rsi_low", "msg": msg, "level": "warning"})

    _save_sent(sent)
    return alerts
