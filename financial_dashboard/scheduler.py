# scheduler.py — Rafraîchissement automatique quotidien via APScheduler

import logging
import os

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from config import REFRESH_HOUR, REFRESH_MINUTE

logger = logging.getLogger(__name__)

_scheduler: BackgroundScheduler | None = None


def _refresh_job():
    """Tâche planifiée : recharge les données et les analyses."""
    logger.info("⏰ Rafraîchissement automatique démarré...")
    try:
        # Import ici pour éviter les imports circulaires
        from data_fetcher import fetch_all_data
        from indicators import enrich_assets
        from claude_analysis import score_all_assets, generate_macro_report
        import streamlit as st

        fred_key      = os.getenv("FRED_API_KEY", "")
        anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")

        data   = fetch_all_data(fred_api_key=fred_key)
        assets = enrich_assets(data["assets"])

        if anthropic_key:
            score_all_assets(assets, anthropic_key)
            report = generate_macro_report(assets, anthropic_key)
            data["macro_report"] = report

        from data_fetcher import save_cache
        save_cache(data)

        # Invalider le cache Streamlit
        st.cache_data.clear()
        logger.info("✅ Rafraîchissement automatique terminé.")
    except Exception as e:
        logger.error("Erreur rafraîchissement automatique : %s", e)


def start_scheduler():
    """Démarre le planificateur en arrière-plan (une seule instance)."""
    global _scheduler
    if _scheduler is not None and _scheduler.running:
        return

    _scheduler = BackgroundScheduler(daemon=True)
    trigger = CronTrigger(hour=REFRESH_HOUR, minute=REFRESH_MINUTE)
    _scheduler.add_job(_refresh_job, trigger, id="daily_refresh", replace_existing=True)
    _scheduler.start()
    logger.info(
        "Planificateur démarré — rafraîchissement à %02d:%02d chaque jour.",
        REFRESH_HOUR, REFRESH_MINUTE,
    )


def stop_scheduler():
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Planificateur arrêté.")
