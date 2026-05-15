# app.py — Dashboard principal Streamlit

import os
import logging
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
FRED_KEY      = os.getenv("FRED_API_KEY", "")

from config import (
    ALERT_PRICE_CHANGE_PCT, ALERT_RSI_OVERBOUGHT, ALERT_RSI_OVERSOLD,
    SMA_SHORT, SMA_LONG,
)
from data_fetcher import fetch_all_data, load_cache, cache_is_fresh, get_prices_df
from indicators import enrich_assets
from claude_analysis import score_all_assets, generate_macro_report
from portfolio import get_or_update_portfolio, compute_positions_table
from backtest import backtest_asset, STRATEGIES
from scheduler import start_scheduler
from notifications import check_and_notify
from pdf_export import generate_macro_pdf

logging.basicConfig(level=logging.WARNING)

# ── Config ────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Dashboard Marchés",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Newsreader:ital,wght@0,700;1,700&display=swap');

/* ── Base ─────────────────────────────────────────────────────────────── */
html, body, [class*="css"], .stMarkdown, button, input {
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif !important;
}

/* Tabular nums — tous les chiffres financiers */
[data-testid="stMetricValue"], [data-testid="stMetricDelta"],
.rv-stat-value, .rv-stat-delta-pos, .rv-stat-delta-neg {
    font-variant-numeric: tabular-nums;
}

/* ── Sidebar ──────────────────────────────────────────────────────────── */
[data-testid="stSidebarContent"] { padding: 0 !important; }

/* ── Metric cards ─────────────────────────────────────────────────────── */
[data-testid="metric-container"] {
    background: var(--secondary-background-color);
    border: 1px solid #EAEAEA;
    border-radius: 8px;
    padding: 16px 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    transition: box-shadow 0.2s, transform 0.2s;
}
[data-testid="metric-container"]:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transform: translateY(-1px);
}
[data-testid="metric-container"] label {
    font-size: 0.70rem !important;
    letter-spacing: 0.05em;
    font-weight: 500;
    opacity: 0.50;
    text-transform: uppercase;
}
[data-testid="stMetricValue"] {
    font-size: 1.4rem !important;
    font-weight: 700;
    letter-spacing: -0.03em;
}
[data-testid="stMetricDelta"] {
    font-size: 0.80rem !important;
    font-weight: 600;
}

/* ── Tabs ─────────────────────────────────────────────────────────────── */
.stTabs [data-baseweb="tab-list"] {
    background: var(--secondary-background-color);
    border-radius: 8px;
    padding: 3px;
    gap: 2px;
    border: 1px solid #EAEAEA;
}
.stTabs [data-baseweb="tab"] {
    border-radius: 6px;
    font-size: 0.84rem;
    font-weight: 500;
    padding: 7px 16px;
    background: transparent;
    transition: all 0.18s;
    border: none !important;
    opacity: 0.50;
}
.stTabs [aria-selected="true"] {
    background: var(--background-color) !important;
    opacity: 1 !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
}
.stTabs [data-baseweb="tab-highlight"] { display: none !important; }
.stTabs [data-baseweb="tab-border"]    { display: none !important; }

/* ── Alertes ──────────────────────────────────────────────────────────── */
.alert-danger {
    background: #FDEBEC;
    border-left: 2px solid #9F2F2D;
    border-radius: 4px;
    padding: 10px 16px;
    margin: 4px 0;
    font-size: 0.875rem;
    color: #9F2F2D;
}
.alert-warning {
    background: #FBF3DB;
    border-left: 2px solid #956400;
    border-radius: 4px;
    padding: 10px 16px;
    margin: 4px 0;
    font-size: 0.875rem;
    color: #956400;
}

/* ── Badges signal — pastels mats, coins carrés ───────────────────────── */
.badge-buy {
    background: #EDF3EC;
    border: 1px solid rgba(52,101,56,0.20);
    color: #346538;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}
.badge-sell {
    background: #FDEBEC;
    border: 1px solid rgba(159,47,45,0.20);
    color: #9F2F2D;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}
.badge-hold {
    background: #FBF3DB;
    border: 1px solid rgba(149,100,0,0.20);
    color: #956400;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

/* ── Bouton primaire ──────────────────────────────────────────────────── */
.stButton > button[kind="primary"],
.stButton > button[data-testid="baseButton-primary"] {
    background: #111111 !important;
    color: #ffffff !important;
    border-radius: 5px !important;
    border: none !important;
    font-weight: 600 !important;
    font-size: 0.875rem !important;
    font-family: 'DM Sans', sans-serif !important;
    letter-spacing: 0.01em !important;
    transition: background 0.18s, transform 0.12s !important;
    display: block !important;
    margin: 0 auto !important;
    box-shadow: none !important;
}
.stButton > button[kind="primary"]:hover {
    background: #333333 !important;
}
.stButton > button[kind="primary"]:active {
    transform: scale(0.98) !important;
}

/* ── Séparateurs ──────────────────────────────────────────────────────── */
hr { border-color: #EAEAEA !important; margin: 20px 0 !important; }

/* ── DataFrames ───────────────────────────────────────────────────────── */
[data-testid="stDataFrame"] {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #EAEAEA !important;
}

/* ── Scrollbar ────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #EAEAEA; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #d0d0d0; }

/* ── Header principal ─────────────────────────────────────────────────── */
.rv-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 28px 0;
    border-bottom: 1px solid #EAEAEA;
    margin-bottom: 32px;
}
.rv-header-left { display: flex; align-items: center; gap: 14px; }
.rv-logo {
    width: 44px; height: 44px;
    background: #111111;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    color: #ffffff;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: -0.02em;
}
.rv-title {
    font-family: 'Newsreader', serif;
    font-size: 1.9rem;
    font-weight: 700;
    font-style: italic;
    letter-spacing: -0.03em;
    margin: 0;
    line-height: 1.1;
}
.rv-subtitle {
    font-size: 0.78rem;
    margin: 4px 0 0 0;
    font-weight: 400;
    color: #787774;
    letter-spacing: 0.01em;
}
.rv-live {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    color: #346538;
    font-weight: 600;
    background: #EDF3EC;
    padding: 5px 12px;
    border-radius: 4px;
    border: 1px solid rgba(52,101,56,0.18);
    letter-spacing: 0.05em;
    text-transform: uppercase;
}
.rv-live-dot {
    width: 6px; height: 6px;
    background: #346538;
    border-radius: 50%;
    animation: blink 2.4s infinite;
    display: inline-block;
}
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
}

/* ── Sidebar header ───────────────────────────────────────────────────── */
.rv-sidebar-header {
    padding: 20px 16px 14px 16px;
    border-bottom: 1px solid #EAEAEA;
    margin-bottom: 4px;
}
.rv-sidebar-logo { display: flex; align-items: center; gap: 10px; }
.rv-sidebar-logo-icon {
    width: 28px; height: 28px;
    background: #111111;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    color: #ffffff;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: -0.01em;
}
.rv-sidebar-title {
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.02em;
}

/* Section label sidebar */
.rv-section-label {
    font-size: 0.65rem;
    font-weight: 600;
    color: #787774;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 14px 16px 6px 16px;
}

/* Stat card sidebar */
.rv-stat-block {
    background: var(--secondary-background-color);
    border: 1px solid #EAEAEA;
    border-radius: 8px;
    padding: 12px 16px;
    margin: 0 12px 12px 12px;
}
.rv-stat-label {
    font-size: 0.68rem;
    color: #787774;
    letter-spacing: 0.04em;
    font-weight: 500;
    text-transform: uppercase;
}
.rv-stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    margin-top: 2px;
    font-variant-numeric: tabular-nums;
}
.rv-stat-delta-pos { color: #346538; font-size: 0.80rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.rv-stat-delta-neg { color: #9F2F2D; font-size: 0.80rem; font-weight: 600; font-variant-numeric: tabular-nums; }
</style>
""", unsafe_allow_html=True)


def plotly_theme() -> dict:
    """Retourne les paramètres Plotly adaptés au thème actif (clair ou sombre)."""
    try:
        base = st.get_option("theme.base") or "light"
    except Exception:
        base = "light"
    if base == "dark":
        return dict(template="plotly_dark",  paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    return dict(template="plotly_white", paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")

start_scheduler()


# ── Chargement des données ────────────────────────────────────────────────────

@st.cache_data(ttl=3600, show_spinner=False)
def load_all_data(force: bool = False):
    cached = load_cache()

    if not force and cache_is_fresh() and cached:
        data = cached
    else:
        with st.spinner("Récupération des données de marché..."):
            data = fetch_all_data(fred_api_key=FRED_KEY)

    assets = data.get("assets", {})

    with st.spinner("Calcul des indicateurs techniques..."):
        enrich_assets(assets)

    if ANTHROPIC_KEY:
        needs_scores = not all(a.get("claude_score") for a in assets.values() if not a.get("error"))
        if needs_scores:
            with st.spinner("Analyse Claude — scores BUY/HOLD/SELL..."):
                score_all_assets(assets, ANTHROPIC_KEY)

        if not data.get("macro_report"):
            with st.spinner("Génération du rapport macro..."):
                data["macro_report"] = generate_macro_report(assets, ANTHROPIC_KEY)

    # Portefeuille
    with st.spinner("Mise à jour du portefeuille fictif..."):
        data["portfolio"] = get_or_update_portfolio(assets)

    from data_fetcher import save_cache
    save_cache(data)
    return data


# ── Helpers ───────────────────────────────────────────────────────────────────

def badge(signal: str | None) -> str:
    if signal == "BUY":
        return '<span class="badge-buy">▲ ACHETER</span>'
    if signal == "SELL":
        return '<span class="badge-sell">▼ VENDRE</span>'
    return '<span class="badge-hold">● CONSERVER</span>'


def fmt(val, decimals=2, suffix="") -> str:
    if val is None:
        return "—"
    return f"{val:,.{decimals}f}{suffix}"


def fmt_pct(val) -> str:
    if val is None:
        return "—"
    return f"{'+'if val>0 else ''}{val:.2f}%"


def compute_alerts(assets: dict) -> list[dict]:
    alerts = []
    for name, asset in assets.items():
        if asset.get("error"):
            continue
        pct = asset.get("pct_change")
        rsi = (asset.get("indicators") or {}).get("rsi")
        if pct is not None and abs(pct) >= ALERT_PRICE_CHANGE_PCT:
            alerts.append({
                "level":   "danger" if pct < 0 else "warning",
                "msg":     f"⚡ {name} : variation journalière de {pct:+.2f}%",
            })
        if rsi is not None:
            if rsi > ALERT_RSI_OVERBOUGHT:
                alerts.append({"level": "warning",
                    "msg": f"🔴 {name} : RSI suracheté ({rsi:.0f} > {ALERT_RSI_OVERBOUGHT})"})
            elif rsi < ALERT_RSI_OVERSOLD:
                alerts.append({"level": "danger",
                    "msg": f"🟢 {name} : RSI survendu ({rsi:.0f} < {ALERT_RSI_OVERSOLD})"})
    return alerts


# ── Sidebar ───────────────────────────────────────────────────────────────────

def render_sidebar(data: dict):
    assets  = data.get("assets", {})
    port    = data.get("portfolio", {})
    history = port.get("history", [])
    alerts  = compute_alerts(assets)

    # ── Logo / titre ──────────────────────────────────────────────────────────
    st.sidebar.markdown("""
<div class="rv-sidebar-header">
  <div class="rv-sidebar-logo">
    <div class="rv-sidebar-logo-icon">M</div>
    <span class="rv-sidebar-title">MarketAI</span>
  </div>
</div>
""", unsafe_allow_html=True)

    # ── Bouton actualiser ─────────────────────────────────────────────────────
    st.sidebar.markdown('<div style="padding: 10px 12px 4px 12px">', unsafe_allow_html=True)
    if st.sidebar.button("↻  Actualiser", use_container_width=True, type="primary"):
        st.cache_data.clear()
        st.rerun()
    st.sidebar.markdown('</div>', unsafe_allow_html=True)

    # ── Portefeuille ──────────────────────────────────────────────────────────
    if history:
        last    = history[-1]
        val     = last.get("total_value", 0)
        ret_pct = last.get("return_pct", 0)
        delta_cls = "rv-stat-delta-pos" if ret_pct >= 0 else "rv-stat-delta-neg"
        arrow     = "▲" if ret_pct >= 0 else "▼"
        st.sidebar.markdown('<div class="rv-section-label">Portefeuille fictif</div>', unsafe_allow_html=True)
        st.sidebar.markdown(f"""
<div class="rv-stat-block">
  <div class="rv-stat-label">Valeur totale</div>
  <div class="rv-stat-value">$ {val:,.0f}</div>
  <span class="{delta_cls}">{arrow} {ret_pct:+.2f}%</span>
</div>
""", unsafe_allow_html=True)

    # ── Alertes ───────────────────────────────────────────────────────────────
    if alerts:
        st.sidebar.markdown(
            f'<div class="rv-section-label">Alertes ({len(alerts)})</div>',
            unsafe_allow_html=True,
        )
        for a in alerts[:3]:
            css = "alert-danger" if a["level"] == "danger" else "alert-warning"
            st.sidebar.markdown(
                f'<div style="margin:0 12px 6px 12px"><div class="{css}">{a["msg"]}</div></div>',
                unsafe_allow_html=True,
            )
        if len(alerts) > 3:
            st.sidebar.caption(f"  + {len(alerts)-3} autre(s) — voir Vue d'ensemble")

    # ── Statut APIs ───────────────────────────────────────────────────────────
    st.sidebar.markdown('<div class="rv-section-label">Sources</div>', unsafe_allow_html=True)
    cache_date = data.get("date", "—")
    api_status = []
    if not ANTHROPIC_KEY:
        api_status.append("⚠️ ANTHROPIC_API_KEY manquante")
    if not FRED_KEY:
        api_status.append("ℹ️ FRED_API_KEY manquante")
    status_html = "".join(f'<div style="color:#9ca3af;font-size:0.75rem;padding:2px 16px">{s}</div>' for s in api_status)
    st.sidebar.markdown(f"""
<div style="padding: 0 16px 12px 16px">
  <div style="color:#9ca3af;font-size:0.75rem;margin-bottom:4px">
    yfinance · CoinGecko · FRED · Claude
  </div>
  <div style="color:#9ca3af;font-size:0.72rem">Cache : {cache_date}</div>
</div>
{status_html}
""", unsafe_allow_html=True)


# ── Page 1 — Vue d'ensemble ───────────────────────────────────────────────────

def page_overview(data: dict):
    assets = data.get("assets", {})
    alerts = compute_alerts(assets)

    # Alertes en haut
    if alerts:
        with st.expander(f"🚨 {len(alerts)} alertes actives", expanded=True):
            for a in alerts:
                css = "alert-danger" if a["level"] == "danger" else "alert-warning"
                st.markdown(f'<div class="{css}">{a["msg"]}</div>', unsafe_allow_html=True)
        st.markdown("")

    # ── Barre de recherche + filtre catégorie ────────────────────────────────
    col_search, col_filter = st.columns([2, 3])
    with col_search:
        search_query = st.text_input(
            "Rechercher un actif",
            placeholder="🔍  Rechercher un actif...",
            label_visibility="collapsed",
        )
    with col_filter:
        categories = sorted({a.get("category", "Autre") for a in assets.values()})
        selected_cats = st.multiselect(
            "Filtrer par catégorie",
            categories, default=categories,
            label_visibility="collapsed",
        )

    # ── Cartes indices en haut ────────────────────────────────────────────────
    indices = {n: a for n, a in assets.items() if a.get("category") == "Indices" and not a.get("error")}
    if indices:
        cols = st.columns(len(indices))
        for col, (name, asset) in zip(cols, indices.items()):
            pct = asset.get("pct_change", 0) or 0
            col.metric(
                name,
                fmt(asset.get("current"), 2),
                delta=fmt_pct(asset.get("pct_change")),
                delta_color="normal" if pct >= 0 else "inverse",
            )
        st.markdown("")

    # ── Tableau principal ─────────────────────────────────────────────────────
    rows = []
    sq = search_query.strip().lower()
    for name, asset in assets.items():
        if asset.get("category") not in selected_cats:
            continue
        if sq and sq not in name.lower() and sq not in (asset.get("category") or "").lower():
            continue
        ind   = asset.get("indicators") or {}
        score = asset.get("claude_score") or {}
        sig   = score.get("signal", "—")
        conf  = score.get("confidence")
        err   = asset.get("error")

        currency = asset.get("currency", "USD")
        devise_label = {"USD": "$", "EUR": "€", "JPY": "¥",
                        "RATIO": "ratio", "%": "%"}.get(currency, currency)

        rows.append({
            "Actif":       name,
            "Catégorie":   asset.get("category", ""),
            "Devise":      devise_label,
            "Prix":        fmt(asset.get("current"), 4) if not err else "⚠️ Erreur",
            "Variation":   fmt_pct(asset.get("pct_change"))  if not err else "—",
            "RSI":         fmt(ind.get("rsi"), 1)             if not err else "—",
            "Volatilité":  fmt(ind.get("volatility"), 1, "%") if not err else "—",
            "SMA20":       fmt(ind.get("sma20"), 4)           if not err else "—",
            "Signal":      sig,
            "Confiance":   f"{conf}%" if isinstance(conf, int) else "—",
        })

    df = pd.DataFrame(rows)

    def _sig_style(v):
        m = {"BUY": "color:#4ade80;font-weight:700",
             "SELL": "color:#f87171;font-weight:700",
             "HOLD": "color:#fbbf24;font-weight:700"}
        return m.get(v, "")

    def _pct_style(v):
        try:
            num = float(str(v).replace("%", "").replace("+", ""))
            return f"color:{'#4ade80' if num >= 0 else '#f87171'}"
        except Exception:
            return ""

    styled = (
        df.style
        .map(_sig_style, subset=["Signal"])
        .map(_pct_style, subset=["Variation"])

    )
    st.dataframe(styled, width="stretch", hide_index=True)

    fetched = max((a.get("fetched_at","") for a in assets.values() if not a.get("error")), default="")
    if fetched:
        try:
            ts = datetime.fromisoformat(fetched).strftime("%d/%m/%Y %H:%M UTC")
            st.caption(f"🕐 Dernière mise à jour : {ts}")
        except Exception:
            pass


# ── Page 2 — Analyse d'un actif ───────────────────────────────────────────────

def page_deep_dive(data: dict):
    assets = data.get("assets", {})
    names  = [n for n, a in assets.items() if not a.get("error") and a.get("prices")]
    if not names:
        st.warning("Aucune donnée disponible.")
        return

    col_sel, col_info = st.columns([2, 3])
    with col_sel:
        selected = st.selectbox("Actif", names, label_visibility="collapsed")
    asset = assets[selected]
    ind   = asset.get("indicators") or {}
    dates = asset.get("dates", [])
    ohlcv = asset.get("ohlcv") or {}
    score = asset.get("claude_score") or {}

    # Métriques
    m1, m2, m3, m4, m5 = st.columns(5)
    pct = asset.get("pct_change", 0) or 0
    m1.metric("Prix",        fmt(asset.get("current"), 4))
    m2.metric("Variation",   fmt_pct(asset.get("pct_change")),
              delta=fmt_pct(asset.get("pct_change")),
              delta_color="normal" if pct >= 0 else "inverse")
    m3.metric("RSI (14)",    fmt(ind.get("rsi"), 1))
    m4.metric("Volatilité",  fmt(ind.get("volatility"), 1, "%"))
    m5.metric("SMA20/50",    f"{fmt(ind.get('sma20'),2)} / {fmt(ind.get('sma50'),2)}")

    # Signal Claude
    if score:
        sig  = score.get("signal", "—")
        conf = score.get("confidence", "—")
        rat  = score.get("rationale", "")
        st.markdown(
            f"**Signal :** {badge(sig)} &nbsp;&nbsp; **Confiance :** `{conf}%`  \n"
            f"<small style='color:#8b949e'>💬 {rat}</small>",
            unsafe_allow_html=True,
        )
    st.markdown("---")

    # Graphique prix + SMAs
    prices = asset.get("prices", [])
    fig = go.Figure()
    if ohlcv.get("open"):
        fig.add_trace(go.Candlestick(
            x=dates,
            open=ohlcv["open"], high=ohlcv["high"],
            low=ohlcv["low"],   close=ohlcv["close"],
            name=selected,
            increasing_line_color="#4ade80", decreasing_line_color="#f87171",
        ))
    else:
        fig.add_trace(go.Scatter(x=dates, y=prices, mode="lines", name=selected,
                                 line=dict(color="#60a5fa", width=2)))

    for vals, label, color, dash in [
        (ind.get("sma20_series"), f"SMA{SMA_SHORT}", "#fbbf24", "dot"),
        (ind.get("sma50_series"), f"SMA{SMA_LONG}",  "#a78bfa", "dash"),
    ]:
        if vals:
            fig.add_trace(go.Scatter(x=dates, y=vals, mode="lines", name=label,
                                     line=dict(color=color, width=1.5, dash=dash)))

    fig.update_layout(title=f"{selected} — Prix & Moyennes mobiles",
                      xaxis_rangeslider_visible=False, height=420, **plotly_theme())
    st.plotly_chart(fig, width="stretch")

    # MACD
    macd_v = ind.get("macd_series", [])
    if macd_v:
        fig_m = go.Figure()
        fig_m.add_trace(go.Scatter(x=dates, y=macd_v, name="MACD",
                                   line=dict(color="#60a5fa", width=1.5)))
        fig_m.add_trace(go.Scatter(x=dates, y=ind.get("signal_series",[]), name="Signal",
                                   line=dict(color="#fbbf24", width=1.5)))
        hist = ind.get("histogram_series", [])
        colors = ["#4ade80" if (h or 0) >= 0 else "#f87171" for h in hist]
        fig_m.add_trace(go.Bar(x=dates, y=hist, name="Histogramme",
                               marker_color=colors, opacity=0.65))
        fig_m.update_layout(title="MACD", height=320, **plotly_theme())
        st.plotly_chart(fig_m, width="stretch")

    # RSI
    rsi_v = ind.get("rsi_series", [])
    if rsi_v:
        fig_r = go.Figure()
        fig_r.add_trace(go.Scatter(x=dates, y=rsi_v, name="RSI",
                                   line=dict(color="#a78bfa", width=2),
                                   fill="tozeroy", fillcolor="rgba(167,139,250,.08)"))
        fig_r.add_hline(y=ALERT_RSI_OVERBOUGHT, line_dash="dot", line_color="#f87171",
                        annotation_text="Suracheté (70)")
        fig_r.add_hline(y=ALERT_RSI_OVERSOLD,   line_dash="dot", line_color="#4ade80",
                        annotation_text="Survendu (30)")
        fig_r.add_hrect(y0=ALERT_RSI_OVERSOLD, y1=ALERT_RSI_OVERBOUGHT,
                        fillcolor="rgba(99,102,241,.04)", line_width=0)
        fig_r.update_layout(title="RSI (14)", height=300, yaxis=dict(range=[0, 100]),
                             **plotly_theme())
        st.plotly_chart(fig_r, width="stretch")


# ── Page 3 — Corrélations ─────────────────────────────────────────────────────

def page_correlations(data: dict):
    assets = data.get("assets", {})
    df     = get_prices_df(assets)

    if df.empty or df.shape[1] < 2:
        st.warning("Données insuffisantes pour calculer les corrélations (minimum 2 actifs avec données valides).")
        return

    corr = df.corr()

    fig = px.imshow(
        corr,
        color_continuous_scale="RdYlGn",
        zmin=-1, zmax=1,
        text_auto=".2f",
        title=f"Corrélations des rendements journaliers — {df.shape[0]} jours",
        aspect="auto",
        height=620,
    )
    fig.update_layout(**plotly_theme())
    fig.update_traces(textfont_size=11)
    st.plotly_chart(fig, width="stretch")

    st.markdown(
        "> **Lecture :** +1 = évolution identique · 0 = indépendants · -1 = évolution opposée  \n"
        "> *Les week-ends et jours fériés sont interpolés pour aligner crypto et actions.*"
    )

    # Top corrélations
    pairs = (
        corr.where(np.triu(np.ones(corr.shape), k=1).astype(bool))
        .stack().reset_index()
    )
    pairs.columns = ["Actif A", "Actif B", "Corrélation"]
    pairs = pairs.reindex(pairs["Corrélation"].abs().sort_values(ascending=False).index)

    c1, c2 = st.columns(2)
    c1.subheader("Paires les plus corrélées")
    c1.dataframe(pairs.head(5).reset_index(drop=True), width="stretch", hide_index=True)
    c2.subheader("Paires les moins corrélées (diversification)")
    c2.dataframe(pairs.tail(5).reset_index(drop=True), width="stretch", hide_index=True)


# ── Page 4 — Rapport macro ────────────────────────────────────────────────────

def page_macro_report(data: dict):
    assets = data.get("assets", {})
    report = data.get("macro_report", "")

    if report:
        st.markdown(report)
    elif not ANTHROPIC_KEY:
        st.info("Ajoutez votre ANTHROPIC_API_KEY dans .env pour activer le rapport macro.")
    else:
        st.warning("Rapport en cours de génération ou indisponible.")

    st.markdown("---")
    st.subheader("Données brutes")

    rows = []
    for name, asset in assets.items():
        ind = asset.get("indicators") or {}
        sc  = asset.get("claude_score") or {}
        rows.append({
            "Actif": name, "Catégorie": asset.get("category"),
            "Prix": asset.get("current"), "Variation %": asset.get("pct_change"),
            "RSI": ind.get("rsi"), "MACD": ind.get("macd"),
            "SMA20": ind.get("sma20"), "SMA50": ind.get("sma50"),
            "Volatilité %": ind.get("volatility"),
            "Signal": sc.get("signal"), "Confiance": sc.get("confidence"),
            "Rationale": sc.get("rationale"),
        })
    df = pd.DataFrame(rows)
    st.dataframe(df, width="stretch", hide_index=True)
    csv = df.to_csv(index=False, encoding="utf-8-sig").encode("utf-8-sig")
    col_csv, col_pdf = st.columns([1, 1])
    col_csv.download_button("⬇️ Télécharger CSV",
                           csv, f"market_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv", "text/csv")
    try:
        macro_txt = data.get("macro_report", "")
        pdf_bytes = generate_macro_pdf(macro_txt, assets)
        col_pdf.download_button(
            "📄 Télécharger PDF",
            pdf_bytes,
            f"rapport_macro_{datetime.now(timezone.utc).strftime('%Y%m%d')}.pdf",
            "application/pdf",
        )
    except Exception as e:
        col_pdf.caption(f"PDF indisponible : {e}")


# ── Page 5 — Portefeuille fictif ──────────────────────────────────────────────

def _render_portfolio_view(port: dict, assets: dict, label: str):
    """Rendu commun d'un portefeuille (v1 original ou v2 actuel)."""
    from portfolio import compute_history_from_prices

    history   = port.get("history", [])
    initial   = port.get("initial_capital", 10_000)
    last      = history[-1] if history else {}
    total_val = last.get("total_value", initial)
    ret_pct   = last.get("return_pct", 0)
    pnl_abs   = total_val - initial
    created   = port.get("created_at", "")[:10]

    # ── KPIs ──────────────────────────────────────────────────────────────────
    k1, k2, k3, k4 = st.columns(4)
    k1.metric("Valeur totale (USD)", f"$ {total_val:,.2f}",
              delta=f"{ret_pct:+.2f}%",
              delta_color="normal" if ret_pct >= 0 else "inverse")
    k2.metric("P&L total (USD)",    f"$ {pnl_abs:+,.2f}",
              delta_color="normal" if pnl_abs >= 0 else "inverse")
    k3.metric("Capital initial",    f"$ {initial:,.0f}")
    k4.metric("Créé le",            created)

    st.markdown("---")

    # ── Courbe de performance ──────────────────────────────────────────────────
    positions    = port.get("positions", {})
    rich_history = compute_history_from_prices(positions, assets, initial) if positions else history

    if rich_history:
        hist_df = pd.DataFrame(rich_history)
        color_line = "#4ade80" if hist_df["total_value"].iloc[-1] >= initial else "#f87171"

        fig_perf = go.Figure()

        # Zone colorée entre la courbe et la baseline (capital initial)
        fig_perf.add_trace(go.Scatter(
            x=hist_df["date"], y=hist_df["total_value"],
            mode="lines", name="Valeur ($)",
            line=dict(color=color_line, width=2.5),
            fill="tonexty",
            fillcolor=f"rgba({'74,222,128' if color_line == '#4ade80' else '248,113,113'},.10)",
            hovertemplate="<b>%{x}</b><br>Valeur : $%{y:,.2f}<extra></extra>",
        ))
        # Ligne baseline invisible (pour fill="tonexty")
        fig_perf.add_trace(go.Scatter(
            x=hist_df["date"],
            y=[initial] * len(hist_df),
            mode="lines", name=f"Capital initial (${initial:,.0f})",
            line=dict(color="#8b949e", width=1.5, dash="dot"),
            hovertemplate=f"Capital initial : ${initial:,.0f}<extra></extra>",
        ))

        # Axe % rendement à droite
        fig_perf.add_trace(go.Scatter(
            x=hist_df["date"], y=hist_df["return_pct"],
            mode="lines", name="Rendement (%)",
            line=dict(color="#c084fc", width=1.5, dash="dashdot"),
            yaxis="y2",
            hovertemplate="<b>%{x}</b><br>Rendement : %{y:+.2f}%<extra></extra>",
        ))

        fig_perf.update_layout(
            title=f"Évolution — {label} (USD)",
            height=400,
            hovermode="x unified",
            xaxis=dict(
                title="Date",
                rangeslider=dict(visible=False),
                rangeselector=dict(
                    buttons=[
                        dict(count=7,  label="7J",  step="day",  stepmode="backward"),
                        dict(count=1,  label="1M",  step="month", stepmode="backward"),
                        dict(count=3,  label="3M",  step="month", stepmode="backward"),
                        dict(step="all", label="Max"),
                    ],
                    bgcolor="rgba(100,100,100,0.15)",
                ),
            ),
            yaxis=dict(title="Valeur ($)", tickprefix="$"),
            yaxis2=dict(title="Rendement (%)", overlaying="y", side="right",
                        ticksuffix="%", showgrid=False),
            legend=dict(orientation="h", y=1.12, x=0.5, xanchor="center",
                        bgcolor="rgba(0,0,0,0)"),
            margin=dict(t=60, b=10),
            **plotly_theme(),
        )
        st.plotly_chart(fig_perf, width="stretch")

    st.markdown("<div style='margin-top:20px'></div>", unsafe_allow_html=True)
    col_pie, col_tbl = st.columns([3, 2])

    # ── Camembert allocation ──────────────────────────────────────────────────
    positions = port.get("positions", {})
    if positions:
        names_p = list(positions.keys())
        vals_p  = [pos.get("capital_usd", pos.get("capital_init", 0))
                   for pos in positions.values()]
        fig_pie = go.Figure(go.Pie(
            labels=names_p, values=vals_p,
            hole=0.40,
            textinfo="percent",
            textfont=dict(size=12),
            marker=dict(line=dict(color="rgba(0,0,0,0.15)", width=1.5)),
            hovertemplate="<b>%{label}</b><br>%{percent}<br>$%{value:,.0f}<extra></extra>",
        ))
        fig_pie.update_layout(
            title="Allocation actuelle",
            height=440,
            showlegend=True,
            legend=dict(
                orientation="v", x=1.0, y=0.5, xanchor="left",
                font=dict(size=11), itemsizing="constant",
            ),
            margin=dict(t=50, b=20, l=10, r=140),
            **plotly_theme(),
        )
        col_pie.plotly_chart(fig_pie, width="stretch")

    # ── Tableau des positions ─────────────────────────────────────────────────
    rows = compute_positions_table(port, assets)
    df_pos = pd.DataFrame(rows)

    def _pnl_color(v):
        try:
            return f"color: {'#4ade80' if float(v) >= 0 else '#f87171'}"
        except Exception:
            return ""

    def _sig_color(v):
        return {"BUY":"color:#4ade80;font-weight:700",
                "SELL":"color:#f87171;font-weight:700",
                "HOLD":"color:#fbbf24;font-weight:700"}.get(v, "")

    styled = (
        df_pos.style
        .map(_pnl_color, subset=["P&L ($)", "P&L (%)"])
        .map(_sig_color, subset=["Signal"])
        .format({
            "Prix entrée ($)": "{:,.4g}",
            "Prix actuel ($)": "{:,.4g}",
            "Valeur ($)":      "{:,.2f}",
            "P&L ($)":         "{:+,.2f}",
            "P&L (%)":         "{:+.2f}%",
        })
    )
    col_tbl.subheader("Positions")
    col_tbl.dataframe(styled, width="stretch", hide_index=True)

    st.markdown("---")
    st.caption(
        "**Méthode :** capital alloué proportionnellement au score de confiance Claude "
        "(BUY × confiance). Les actifs SELL sont exclus. Rééquilibrage à chaque refresh."
    )


# ── Page 5 — Portefeuille fictif ─────────────────────────────────────────────

def page_portfolio(data: dict):
    assets = data.get("assets", {})
    port   = data.get("portfolio", {})

    if not port:
        st.info("Le portefeuille sera créé automatiquement une fois les analyses Claude disponibles.")
        return

    _render_portfolio_view(port, assets, "Portefeuille fictif")


# ── Page 6 — Backtesting ──────────────────────────────────────────────────────

def page_backtest(data: dict):
    assets = data.get("assets", {})
    names  = [n for n, a in assets.items() if not a.get("error") and len(a.get("prices", [])) >= 30]

    if not names:
        st.warning("Données insuffisantes pour le backtesting.")
        return

    # ── Sélecteurs ────────────────────────────────────────────────────────────
    c1, c2, c3 = st.columns([2, 2, 1])
    with c1:
        selected = st.selectbox("Actif", names, label_visibility="visible", key="bt_asset")
    with c2:
        strategy_key = st.selectbox(
            "Stratégie",
            list(STRATEGIES.keys()),
            format_func=lambda k: STRATEGIES[k],
            label_visibility="visible",
            key="bt_strat",
        )
    with c3:
        period = st.selectbox("Période", [90, 60, 30], format_func=lambda x: f"{x} jours",
                              key="bt_period")

    asset  = assets[selected]
    result = backtest_asset(asset, strategy_key, lookback_days=period)

    if not result:
        st.warning("Pas assez de données pour cette période.")
        return

    m = result["metrics"]

    # ── KPIs ──────────────────────────────────────────────────────────────────
    k1, k2, k3, k4, k5, k6 = st.columns(6)
    ret_s = m["return_pct"]
    ret_b = m["benchmark_return_pct"]
    k1.metric("Rendement stratégie",  f"{ret_s:+.2f}%",
              delta_color="normal" if ret_s >= 0 else "inverse")
    k2.metric("Buy & Hold",           f"{ret_b:+.2f}%",
              delta_color="normal" if ret_b >= 0 else "inverse")
    k3.metric("Alpha",                f"{ret_s - ret_b:+.2f}%",
              delta_color="normal" if ret_s >= ret_b else "inverse")
    k4.metric("Max Drawdown",         f"{m['max_drawdown_pct']:.2f}%")
    k5.metric("Sharpe",               f"{m['sharpe']:.2f}")
    k6.metric("Trades / Win Rate",    f"{m['n_trades']} / {m['win_rate_pct']:.0f}%")

    st.markdown("---")

    dates = result["dates"]

    # ── Graphique performance normalisée ──────────────────────────────────────
    fig_perf = go.Figure()
    fig_perf.add_trace(go.Scatter(
        x=dates, y=result["portfolio_norm"],
        mode="lines", name="Stratégie",
        line=dict(color="#60a5fa", width=2),
    ))
    fig_perf.add_trace(go.Scatter(
        x=dates, y=result["benchmark_norm"],
        mode="lines", name="Buy & Hold",
        line=dict(color="#6b7280", width=1.5, dash="dot"),
    ))
    # Marqueurs d'entrée (achats)
    buy_idx = result.get("buy_idx", [])
    if buy_idx:
        fig_perf.add_trace(go.Scatter(
            x=[dates[i] for i in buy_idx if i < len(dates)],
            y=[result["portfolio_norm"][i] for i in buy_idx if i < len(dates)],
            mode="markers", name="Achat",
            marker=dict(symbol="triangle-up", size=10, color="#4ade80"),
        ))
    # Marqueurs de sortie (ventes)
    sell_idx = result.get("sell_idx", [])
    if sell_idx:
        fig_perf.add_trace(go.Scatter(
            x=[dates[i] for i in sell_idx if i < len(dates)],
            y=[result["portfolio_norm"][i] for i in sell_idx if i < len(dates)],
            mode="markers", name="Vente",
            marker=dict(symbol="triangle-down", size=10, color="#f87171"),
        ))

    fig_perf.add_hline(y=100, line_dash="dot", line_color="rgba(128,128,128,.4)")
    fig_perf.update_layout(
        title=f"{selected} — {STRATEGIES[strategy_key]} (base 100)",
        height=380, xaxis_title="Date", yaxis_title="Performance (base 100)",
        **plotly_theme(),
    )
    st.plotly_chart(fig_perf, width="stretch")

    # ── Graphique drawdown ────────────────────────────────────────────────────
    port_arr  = result["portfolio"]
    peak      = [max(port_arr[:i+1]) for i in range(len(port_arr))]
    drawdown  = [(p - pk) / pk * 100 if pk else 0 for p, pk in zip(port_arr, peak)]

    fig_dd = go.Figure()
    fig_dd.add_trace(go.Scatter(
        x=dates, y=drawdown,
        mode="lines", name="Drawdown",
        line=dict(color="#f87171", width=1.5),
        fill="tozeroy", fillcolor="rgba(248,113,113,.15)",
    ))
    fig_dd.update_layout(
        title="Drawdown (%)", height=300,
        xaxis_title="Date", yaxis_title="%",
        **plotly_theme(),
    )
    st.plotly_chart(fig_dd, width="stretch")

    # ── Tableau des trades ────────────────────────────────────────────────────
    trades = result.get("trades", [])
    if trades:
        st.subheader(f"Historique des trades ({len(trades)} opérations)")
        df_trades = pd.DataFrame(trades)
        df_trades.columns = [c.capitalize() for c in df_trades.columns]

        def _pnl_color(v):
            try:
                return f"color: {'#4ade80' if float(v) >= 0 else '#f87171'}"
            except Exception:
                return ""

        styled = df_trades.style
        if "Pnl" in df_trades.columns:
            styled = styled.map(_pnl_color, subset=["Pnl"])
        if "Pnl_cumul" in df_trades.columns:
            styled = styled.map(_pnl_color, subset=["Pnl_cumul"])

        st.dataframe(styled, width="stretch", hide_index=True)
    else:
        st.info("Aucun trade exécuté sur cette période avec cette stratégie.")

    st.markdown("---")
    st.caption(
        "**Hypothèses :** Long only · Exécution au prix T+1 · Sans frais de transaction · "
        "Sharpe annualisé (rf=0) · Basé sur les données de clôture."
    )


# ── Point d'entrée ────────────────────────────────────────────────────────────

def main():
    data = load_all_data()
    render_sidebar(data)

    st.markdown("""
<div class="rv-header">
  <div class="rv-header-left">
    <div class="rv-logo">MA</div>
    <div>
      <div class="rv-title">MarketAI</div>
      <div class="rv-subtitle">Analyse en temps réel &middot; IA &middot; Backtesting</div>
    </div>
  </div>
  <div class="rv-live">
    <span class="rv-live-dot"></span>
    Live
  </div>
</div>
""", unsafe_allow_html=True)

    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "🌐 Vue d'ensemble",
        "🔍 Analyse d'un actif",
        "🔗 Corrélations",
        "📰 Rapport macro",
        "💼 Portefeuille",
        "📊 Backtesting",
    ])

    with tab1:
        page_overview(data)
    with tab2:
        page_deep_dive(data)
    with tab3:
        page_correlations(data)
    with tab4:
        page_macro_report(data)
    with tab5:
        page_portfolio(data)
    with tab6:
        page_backtest(data)


if __name__ == "__main__":
    main()
