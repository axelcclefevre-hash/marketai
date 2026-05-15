"""
Envoi d'emails transactionnels via Resend.
Fallback silencieux si RESEND_API_KEY n'est pas configuré.
"""

import os
import logging
import resend

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL     = os.getenv("EMAIL_FROM", "MarketAI <noreply@marketai.fr>")


def _send(to: str, subject: str, html: str) -> bool:
    if not RESEND_API_KEY:
        logger.info("EMAIL SKIP (no RESEND_API_KEY): %s → %s", subject, to)
        return False
    try:
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({"from": FROM_EMAIL, "to": to, "subject": subject, "html": html})
        logger.info("EMAIL SENT: %s → %s", subject, to)
        return True
    except Exception as e:
        logger.error("EMAIL ERROR: %s", e)
        return False


def send_welcome(email: str) -> bool:
    html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:40px;background:#111111;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
    <div style="margin-bottom:32px;">
      <span style="font-size:22px;font-weight:800;color:#ffffff;">Market</span><span style="font-size:22px;font-weight:800;color:#00d97e;">AI</span>
    </div>
    <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 12px 0;">Bienvenue sur MarketAI !</h1>
    <p style="color:#a0a0a0;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
      Ton compte a bien été créé. Tu as maintenant accès à l'analyse de marchés en temps réel,
      aux rapports macro générés par IA et aux outils de backtesting.
    </p>
    <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px 0;">Ton plan actuel</p>
      <p style="color:#ffffff;font-size:16px;font-weight:600;margin:0;">Gratuit</p>
      <p style="color:#6b7280;font-size:13px;margin:4px 0 0 0;">Vue d'ensemble · Backtesting limité · Rapport macro</p>
    </div>
    <a href="https://marketai.fr/upgrade" style="display:inline-block;background:#ffffff;color:#0a0a0a;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">
      Découvrir le plan Premium →
    </a>
    <p style="color:#6b7280;font-size:12px;margin:24px 0 0 0;">
      Tu reçois cet email car tu t'es inscrit sur <a href="https://marketai.fr" style="color:#00d97e;">marketai.fr</a>.
    </p>
  </div>
</body>
</html>"""
    return _send(email, "Bienvenue sur MarketAI 🎉", html)


def send_password_reset(email: str, reset_url: str) -> bool:
    html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:40px;background:#111111;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
    <div style="margin-bottom:32px;">
      <span style="font-size:22px;font-weight:800;color:#ffffff;">Market</span><span style="font-size:22px;font-weight:800;color:#00d97e;">AI</span>
    </div>
    <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 12px 0;">Réinitialisation du mot de passe</h1>
    <p style="color:#a0a0a0;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
      Tu as demandé la réinitialisation de ton mot de passe MarketAI.
      Clique sur le bouton ci-dessous pour définir un nouveau mot de passe.
    </p>
    <a href="{reset_url}" style="display:inline-block;background:#ffffff;color:#0a0a0a;padding:14px 28px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;margin-bottom:24px;">
      Réinitialiser mon mot de passe →
    </a>
    <p style="color:#6b7280;font-size:13px;margin:0 0 8px 0;">
      Ce lien expire dans <strong style="color:#ffffff;">1 heure</strong>.
    </p>
    <p style="color:#6b7280;font-size:12px;margin:0;">
      Si tu n'as pas fait cette demande, ignore cet email. Ton mot de passe restera inchangé.
    </p>
  </div>
</body>
</html>"""
    return _send(email, "Réinitialisation de ton mot de passe MarketAI", html)


def send_premium_confirmation(email: str) -> bool:
    html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:40px;background:#111111;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
    <div style="margin-bottom:32px;">
      <span style="font-size:22px;font-weight:800;color:#ffffff;">Market</span><span style="font-size:22px;font-weight:800;color:#00d97e;">AI</span>
    </div>
    <div style="background:rgba(255,211,42,0.08);border:1px solid rgba(255,211,42,0.2);border-radius:8px;padding:16px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:24px;">👑</span>
      <div>
        <p style="color:#ffd32a;font-weight:700;margin:0;font-size:15px;">Premium activé !</p>
        <p style="color:#a0a0a0;font-size:13px;margin:2px 0 0 0;">Abonnement mensuel confirmé</p>
      </div>
    </div>
    <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 12px 0;">Merci pour ton abonnement</h1>
    <p style="color:#a0a0a0;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
      Ton compte Premium est maintenant actif. Tu as accès à toutes les fonctionnalités de MarketAI,
      dont le portefeuille personnalisé basé sur ton profil de risque.
    </p>
    <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px 0;">Ce que tu débloque</p>
      {chr(10).join(f'<p style="color:#ffffff;font-size:13px;margin:0 0 6px 0;">✓ {f}</p>' for f in [
        "Portefeuille personnel sur mesure",
        "Questionnaire de profil de risque",
        "Rapport macro illimité + actualités",
        "Backtesting illimité",
        "Allocation Claude personnalisée",
      ])}
    </div>
    <a href="https://marketai.fr/my-portfolio" style="display:inline-block;background:#ffd32a;color:#0a0a0a;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">
      Créer mon portefeuille →
    </a>
    <p style="color:#6b7280;font-size:12px;margin:24px 0 0 0;">
      Questions ? Réponds à cet email ou contacte-nous sur <a href="https://marketai.fr" style="color:#00d97e;">marketai.fr</a>.
    </p>
  </div>
</body>
</html>"""
    return _send(email, "Ton abonnement Premium MarketAI est confirmé 👑", html)
