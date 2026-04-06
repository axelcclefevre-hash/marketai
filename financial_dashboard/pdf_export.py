# pdf_export.py — Export PDF du rapport macro Claude

import io
import os
from datetime import date
from fpdf import FPDF

# ── Police ─────────────────────────────────────────────────────────────────────
# Utilise Arial depuis les fonts système Windows (supporte les accents)
_WIN_FONTS = "C:/Windows/Fonts"

def _font_regular() -> str:
    return os.path.join(_WIN_FONTS, "arial.ttf")

def _font_bold() -> str:
    return os.path.join(_WIN_FONTS, "arialbd.ttf")

_FONT_NAME = "Arial"


class _PDF(FPDF):
    def header(self):
        self.set_font(_FONT_NAME, "B", 14)
        self.set_text_color(30, 30, 30)
        self.cell(0, 10, "Dashboard Marchés — Rapport Macro", align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font(_FONT_NAME, "", 9)
        self.set_text_color(120, 120, 120)
        self.cell(0, 6, f"Généré le {date.today().strftime('%d/%m/%Y')} · Powered by Claude AI",
                  align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)
        self.set_draw_color(200, 200, 200)
        self.set_line_width(0.3)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font(_FONT_NAME, "", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")


def _clean(text: str) -> str:
    """Retire les caractères Markdown pour un rendu PDF propre."""
    import re
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)   # **gras**
    text = re.sub(r"\*(.*?)\*",     r"\1", text)    # *italique*
    text = re.sub(r"#{1,4}\s",      "",    text)    # ### titres
    text = re.sub(r"`(.*?)`",       r"\1", text)    # `code`
    return text.strip()


def generate_macro_pdf(
    macro_report: str,
    assets: dict,
    report_date: str = "",
) -> bytes:
    """
    Génère un PDF complet avec :
    - Le rapport macro Claude
    - Un tableau récapitulatif des actifs (prix, variation, signal)

    Retourne les bytes du PDF prêts pour st.download_button.
    """
    pdf = _PDF(orientation="P", unit="mm", format="A4")
    pdf.add_font(_FONT_NAME, "",  _font_regular())
    pdf.add_font(_FONT_NAME, "B", _font_bold())
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    # ── Section 1 : Rapport macro ─────────────────────────────────────────────
    pdf.set_font(_FONT_NAME, "B", 12)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 8, "Analyse Macro", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1)

    pdf.set_font(_FONT_NAME, "", 10)
    pdf.set_text_color(60, 60, 60)

    if macro_report:
        for para in macro_report.split("\n"):
            para = _clean(para)
            if not para:
                pdf.ln(3)
                continue
            pdf.multi_cell(0, 5.5, para)
    else:
        pdf.set_text_color(150, 150, 150)
        pdf.cell(0, 8, "Rapport macro non disponible.", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(6)

    # ── Section 2 : Tableau des actifs ────────────────────────────────────────
    pdf.set_draw_color(200, 200, 200)
    pdf.set_line_width(0.3)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
    pdf.ln(4)

    pdf.set_font(_FONT_NAME, "B", 12)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 8, "Récapitulatif des actifs", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    # En-tête du tableau
    cols = [("Actif", 50), ("Catégorie", 36), ("Prix", 28),
            ("Variation", 24), ("Signal", 22), ("RSI", 18)]
    pdf.set_fill_color(240, 240, 245)
    pdf.set_font(_FONT_NAME, "B", 9)
    pdf.set_text_color(40, 40, 40)
    for label, w in cols:
        pdf.cell(w, 7, label, border=1, fill=True)
    pdf.ln()

    # Lignes
    pdf.set_font(_FONT_NAME, "", 9)
    for name, asset in assets.items():
        if asset.get("error"):
            continue
        ind   = asset.get("indicators") or {}
        score = asset.get("claude_score") or {}
        pct   = asset.get("pct_change")
        rsi   = ind.get("rsi")

        prix_str = f"{asset.get('current', '—'):.4g}" if asset.get("current") else "—"
        pct_str  = f"{pct:+.2f}%" if pct is not None else "—"
        rsi_str  = f"{rsi:.1f}" if rsi is not None else "—"
        sig_str  = score.get("signal", "—")

        # Couleur ligne alternée
        row_fill = (248, 248, 252)
        pdf.set_fill_color(*row_fill)

        for val, (_, w) in zip(
            [name, asset.get("category",""), prix_str, pct_str, sig_str, rsi_str],
            cols
        ):
            pdf.cell(w, 6, str(val), border=1, fill=True)
        pdf.ln()

    # ── Section 3 : Signaux Claude ────────────────────────────────────────────
    buy_assets  = [n for n, a in assets.items()
                   if a.get("claude_score", {}).get("signal") == "BUY"]
    sell_assets = [n for n, a in assets.items()
                   if a.get("claude_score", {}).get("signal") == "SELL"]

    if buy_assets or sell_assets:
        pdf.ln(5)
        pdf.set_x(pdf.l_margin)
        pdf.set_font(_FONT_NAME, "B", 11)
        pdf.set_text_color(40, 40, 40)
        pdf.cell(0, 7, "Signaux Claude", new_x="LMARGIN", new_y="NEXT")

        pdf.set_font(_FONT_NAME, "", 10)
        w = pdf.w - pdf.l_margin - pdf.r_margin
        if buy_assets:
            pdf.set_x(pdf.l_margin)
            pdf.set_text_color(34, 139, 34)
            pdf.multi_cell(w, 6, f"BUY  : {', '.join(buy_assets)}")
        if sell_assets:
            pdf.set_x(pdf.l_margin)
            pdf.set_text_color(200, 30, 30)
            pdf.multi_cell(w, 6, f"SELL : {', '.join(sell_assets)}")

    return bytes(pdf.output())


