# claude_cli.py — Appelle Claude via la CLI `claude -p` (Claude Code), sans clé API.
# Utilise l'abonnement / la connexion déjà configurés dans Claude Code sur la machine.

import os
import shutil
import subprocess
import tempfile

# "sonnet", "opus", "haiku" ou un identifiant complet ; surchargeable via .env
DEFAULT_MODEL = os.getenv("MARKETAI_CLAUDE_MODEL", "sonnet")


def claude_available() -> bool:
    return shutil.which("claude") is not None


def ask_claude(prompt: str, model: str | None = None, timeout: int = 300) -> str:
    """Envoie `prompt` à `claude -p` (aucun outil, aucune session) et renvoie la réponse texte."""
    cmd = ["claude", "-p", "--tools", "", "--no-session-persistence", "--output-format", "text",
           "--model", model or DEFAULT_MODEL]
    # cwd neutre : évite de charger le CLAUDE.md du projet dans la requête
    proc = subprocess.run(cmd, input=prompt, capture_output=True, text=True,
                          timeout=timeout, cwd=tempfile.gettempdir())
    if proc.returncode != 0:
        raise RuntimeError((proc.stderr or proc.stdout).strip()[:300] or f"claude -p a échoué ({proc.returncode})")
    return proc.stdout.strip()


def parse_json(raw: str):
    """Extrait un objet JSON d'une réponse, même entourée de ```json ... ```."""
    import json
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        raw = raw[4:] if raw.startswith("json") else raw
    start, end = raw.find("{"), raw.rfind("}")
    return json.loads(raw[start:end + 1])
