# Guide Complet — Construire et Déployer une App Web avec Claude Code

> Rédigé à partir de l'expérience de construction de MarketAI (dashboard financier IA).
> À utiliser comme référence dans les futures conversations avec Claude Code.

---

## Instructions pour Claude Code

> **À lire en début de chaque conversation de déploiement.**
>
> 1. **Apprendre des problèmes** : quand un problème est résolu pendant la session, l'ajouter immédiatement dans la section "Problèmes connus & solutions" avec la cause et la solution.
> 2. **Tenir le journal à jour** : chaque modification sur le serveur (nouvelle app, changement de config, nouveau domaine) doit être ajoutée dans la section "Journal des modifications serveur".
> 3. **Mettre à jour le guide** : si une nouvelle technique ou un nouvel outil est utilisé, l'ajouter dans la section correspondante.
> 4. **Pousser le doc sur GitHub** après chaque session : `git add GUIDE_DEPLOIEMENT.md && git commit -m "Mise à jour guide" && git push`

---

## 1. Choisir sa stack technique

### Dashboard / App de données → Python + Streamlit
- Pas de HTML/CSS/JS à écrire
- Idéal pour graphiques, tableaux, métriques
- Déploiement sur VPS uniquement (pas Vercel/Netlify)

### Site web / SaaS → JavaScript + Next.js
- Frontend : Next.js → déploiement sur Vercel
- Backend : Node.js ou Python/FastAPI → Railway ou Render
- Base de données : Supabase (PostgreSQL + Auth + Storage)
- Paiements : Stripe

### Quand ajouter quoi
| Besoin | Outil |
|--------|-------|
| Comptes utilisateurs | Supabase Auth |
| Base de données | Supabase |
| Paiements | Stripe |
| Emails | Resend |
| Automatisation | n8n |
| Sécurité / CDN | Cloudflare |

---

## 2. Setup du projet en local

### Structure recommandée
```
MonProjet/
├── app/                  # Code principal
│   ├── app.py            # Point d'entrée (Streamlit) ou index.js (Next.js)
│   ├── requirements.txt  # Dépendances Python
│   ├── .env              # Clés API (jamais committé)
│   ├── .env.example      # Template des clés (committé)
│   └── .gitignore
```

### .gitignore indispensable
```
.env
cache/
__pycache__/
*.pyc
node_modules/
.next/
```

### .env.example (template sans vraies valeurs)
```
API_KEY_1=votre_cle_ici
API_KEY_2=votre_cle_ici
```

---

## 3. Git + GitHub

### Première fois
```bash
# Dans le dossier du projet
git init
git add nom_du_dossier/
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON_PSEUDO/NOM_REPO.git
git push -u origin main
```

### Workflow quotidien
```bash
git add nom_du_dossier/
git commit -m "Description du changement"
git push
```

> ⚠️ Créer le repo sur github.com en **Private** avant de pousser.
> Ne jamais committer le fichier `.env` (clés API).
> Si besoin de cloner sur le serveur : passer le repo en **Public** temporairement (puis repasser en Private après).

---

## 4. Déploiement sur VPS Hostinger

### Accès au serveur
- **Terminal web** : hpanel.hostinger.com → VPS → Terminal **(recommandé — pas de problème de firewall)**
- **SSH local** : `ssh root@IP_VPS` (nécessite ouvrir le port 22 dans le firewall Hostinger)

### Installation initiale (une seule fois)
```bash
apt-get update -qq
apt-get install -y python3 python3-pip python3-venv nginx git
```

### Déployer le code
```bash
mkdir -p /var/www/nom_app
git clone https://github.com/TON_PSEUDO/NOM_REPO.git /var/www/nom_app
```

### Environnement Python
```bash
cd /var/www/nom_app/app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Créer le .env sur le serveur
```bash
cp .env.example .env
nano .env
# Remplir les vraies clés API
# Ctrl+X → Y → Entrée pour sauvegarder
chmod 600 .env
```

---

## 5. Service systemd (app toujours active)

Créer `/etc/systemd/system/nom_app.service` :

### Pour Streamlit (Python)
```ini
[Unit]
Description=Nom App Streamlit
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/nom_app/app
ExecStart=/var/www/nom_app/app/venv/bin/streamlit run app.py \
          --server.port 8501 \
          --server.headless true \
          --server.address 127.0.0.1
Restart=always
RestartSec=5
EnvironmentFile=/var/www/nom_app/app/.env

[Install]
WantedBy=multi-user.target
```

### Pour Node.js
```ini
[Unit]
Description=Nom App Node
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/nom_app
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
EnvironmentFile=/var/www/nom_app/.env

[Install]
WantedBy=multi-user.target
```

### Activer le service
```bash
systemctl daemon-reload
systemctl enable nom_app
systemctl start nom_app
systemctl status nom_app    # Vérifier que c'est "active (running)"
```

---

## 6. Configuration Nginx

### ⚠️ Important : plusieurs sites sur le même VPS
Chaque site a son propre fichier dans `/etc/nginx/sites-available/`.
Toujours vérifier que `nginx.conf` inclut bien `sites-enabled` et pas un fichier en dur :
```bash
cat /etc/nginx/nginx.conf | grep include
# Doit contenir : include /etc/nginx/sites-enabled/*;
# Si ce n'est pas le cas (ex: include /etc/nginx/sites-available/ancien_site;) :
sed -i 's|include /etc/nginx/sites-available/ancien_site;|include /etc/nginx/sites-enabled/*;|' /etc/nginx/nginx.conf
```

### Config Nginx avec domaine + HTTPS (via Cloudflare)
```nginx
server {
    listen 80;
    server_name mon-domaine.fr www.mon-domaine.fr;

    location / {
        proxy_pass         http://127.0.0.1:PORT_APP;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_read_timeout 86400;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Config Nginx sans domaine (accès par IP + port)
```nginx
server {
    listen 8080;        # Choisir un port libre (8080, 8081, etc.)
    server_name IP_VPS;

    location / {
        proxy_pass         http://127.0.0.1:PORT_APP;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_read_timeout 86400;
    }
}
```

### Activer la config
```bash
ln -sf /etc/nginx/sites-available/nom_app /etc/nginx/sites-enabled/
nginx -t                    # Vérifier la syntaxe
systemctl restart nginx
```

### Vérifier que Nginx écoute bien sur le bon port
```bash
ss -tlnp | grep nginx
# Doit afficher le port configuré (ex: 8080)
# Si le port n'apparaît pas → le symlink est peut-être cassé → recréer avec ln -sf
```

### Ports applicatifs courants
| App | Port par défaut |
|-----|----------------|
| Streamlit | 8501 |
| Node.js/Express | 3000 |
| Next.js | 3000 |
| FastAPI | 8000 |
| n8n | 5678 |

---

## 7. Firewall (UFW)

```bash
ufw status                  # Voir l'état actuel
ufw allow 22/tcp            # SSH
ufw allow 'Nginx Full'      # HTTP + HTTPS
ufw allow 8080              # Port custom si besoin
ufw enable
```

---

## 8. Cloudflare (HTTPS + sécurité)

### Setup
1. Créer un compte sur cloudflare.com
2. Add a site → entrer le domaine → plan **Free**
3. Cloudflare scanne les DNS existants
4. **Vérifier que l'enregistrement A pointe vers la bonne IP du VPS** (corriger si nécessaire)
5. Laisser le proxy **orange (Proxied)** activé
6. Copier les 2 nameservers Cloudflare
7. Sur Hostinger → Domaines → changer les nameservers
8. Attendre 1-24h pour la propagation

### Une fois Cloudflare actif
- HTTPS est automatique (certificat SSL géré par Cloudflare)
- L'IP réelle du VPS est masquée
- Protection DDoS active

### Config Nginx avec Cloudflare
Cloudflare gère le HTTPS en amont — le VPS reçoit du HTTP simple.
La config Nginx en `listen 80` suffit, Cloudflare s'occupe du reste.

---

## 9. Workflow de mise à jour

### Modifier le site
1. Modifier les fichiers en local avec Claude Code
2. Tester en local : `streamlit run app.py` → http://localhost:8501
3. Pousser sur GitHub :
```bash
git add .
git commit -m "Description du changement"
git push
```
4. Mettre à jour le serveur (terminal Hostinger) :
```bash
cd /var/www/nom_app && git pull && systemctl restart nom_app
```

### Commandes de diagnostic
```bash
systemctl status nom_app        # État du service
journalctl -u nom_app -f        # Logs en temps réel
systemctl status nginx          # État Nginx
nginx -t                        # Tester la config Nginx
ufw status                      # État du firewall
ss -tlnp | grep nginx           # Ports écoutés par Nginx
curl http://127.0.0.1:PORT      # Tester l'app en local sur le serveur
cat /etc/nginx/nginx.conf | grep include   # Vérifier les inclusions Nginx
```

---

## 10. Checklist déploiement

- [ ] Code sur GitHub (repo Private)
- [ ] `.env` exclu du repo (.gitignore)
- [ ] `.env.example` présent avec les noms des variables
- [ ] Dépendances dans `requirements.txt` ou `package.json`
- [ ] Service systemd créé et actif
- [ ] Config Nginx créée et activée
- [ ] `nginx.conf` inclut bien `sites-enabled/*` (pas un fichier en dur)
- [ ] Port ouvert dans UFW
- [ ] `nginx -t` sans erreur
- [ ] `ss -tlnp | grep nginx` montre le bon port
- [ ] App accessible via `curl http://127.0.0.1:PORT` depuis le serveur
- [ ] Domaine acheté et DNS configuré (si applicable)
- [ ] Cloudflare actif (si domaine)

---

## 11. Informations VPS Hostinger

| Info | Valeur |
|------|--------|
| IP VPS | 31.97.158.55 |
| OS | Ubuntu Linux |
| Accès | Terminal web Hostinger (SSH externe bloqué par défaut) |

### Sites actifs sur le VPS
| Site | Domaine | Port app | Port Nginx | Repo GitHub |
|------|---------|----------|------------|-------------|
| Prepact | prepact.fr | 3000 | 80/443 | — |
| n8n | n8n.prepact.fr | 5678 | 443 | — |
| MarketAI | marketai.fr | 8501 | 8080 | axelcclefevre-hash/marketai |

> ⚠️ Ne jamais stocker les mots de passe et clés API dans ce document.
> Les conserver dans un gestionnaire de mots de passe (Bitwarden, 1Password).

---

## 12. Problèmes connus & solutions

> Cette section est mise à jour à chaque problème rencontré.
> Format : **Symptôme → Cause → Solution**

---

### Nginx n'écoute pas sur le bon port malgré une config correcte
- **Symptôme** : `ss -tlnp | grep nginx` ne montre pas le port configuré
- **Cause** : Le symlink dans `sites-enabled` pointait vers l'ancienne version du fichier, ou `nginx.conf` n'incluait pas `sites-enabled`
- **Solution** :
  1. Vérifier `cat /etc/nginx/nginx.conf | grep include`
  2. Si `nginx.conf` inclut directement un fichier (ex: `sites-available/prepact`) au lieu de `sites-enabled/*`, corriger avec `sed`
  3. Recréer le symlink : `rm /etc/nginx/sites-enabled/nom && ln -sf /etc/nginx/sites-available/nom /etc/nginx/sites-enabled/nom`
  4. `systemctl restart nginx`

---

### Le site existant (prepact.fr) s'affiche à la place de la nouvelle app
- **Symptôme** : En accédant à l'IP du VPS, c'est un autre site qui apparaît
- **Cause** : `nginx.conf` incluait directement `sites-available/prepact` au lieu de `sites-enabled/*`, donc seul prepact était chargé
- **Solution** : Remplacer l'include en dur par `include /etc/nginx/sites-enabled/*;` dans `nginx.conf`

---

### Connexion SSH impossible depuis le PC local (timeout)
- **Symptôme** : `ssh root@IP` timeout, paramiko échoue avec "Error reading SSH protocol banner"
- **Cause** : Le firewall Hostinger bloque le port 22 par défaut depuis l'extérieur. SSH depuis Claude Code est aussi bloqué (restriction réseau du sandbox)
- **Solution** : Utiliser le **terminal web Hostinger** (hpanel.hostinger.com → VPS → Terminal) — toujours disponible sans configuration

---

### Cloner un repo privé GitHub sur le VPS demande un login
- **Symptôme** : `git clone` demande username/password sur le serveur
- **Cause** : Le repo GitHub est privé
- **Solutions** (par ordre de préférence) :
  1. Passer le repo en **Public** temporairement le temps du clone, puis repasser en Private
  2. Utiliser un **Personal Access Token** GitHub (Settings → Developer settings → Tokens)
  3. Configurer une clé SSH sur le serveur

---

### Erreur `ModuleNotFoundError` au démarrage de l'app
- **Symptôme** : L'app affiche une erreur de module manquant (ex: `No module named 'fpdf'`)
- **Cause** : Une dépendance n'est pas dans `requirements.txt`
- **Solution** :
  1. Installer manuellement : `/var/www/nom_app/venv/bin/pip install nom_module`
  2. Ajouter dans `requirements.txt` pour les prochains déploiements
  3. `systemctl restart nom_app`

---

### Clé API invalide (erreur 401) malgré un `.env` correct
- **Symptôme** : Erreur `authentication_error: invalid x-api-key` dans les logs
- **Cause** : La clé API a expiré ou été révoquée sur la plateforme
- **Solution** :
  1. Générer une nouvelle clé sur la plateforme concernée
  2. Mettre à jour le `.env` : `sed -i 's|ANCIENNE_CLE|NOUVELLE_CLE|' /var/www/nom_app/app/.env`
  3. Supprimer le cache si nécessaire : `rm -f /var/www/nom_app/app/cache/*.json`
  4. `systemctl restart nom_app`

---

### paramiko échoue avec Python 3.14
- **Symptôme** : `SSHException: No existing session` avec paramiko
- **Cause** : Incompatibilité de paramiko avec Python 3.14
- **Solution** : Utiliser Python 3.12 + `pip install "paramiko==3.4.0"`

---

### Cloudflare scanne la mauvaise IP pour le domaine
- **Symptôme** : Cloudflare détecte une IP différente de celle du VPS
- **Cause** : L'ancienne IP du registrar (Hostinger) est réutilisée par défaut
- **Solution** : Dans Cloudflare DNS, éditer manuellement l'enregistrement A pour mettre la bonne IP du VPS

---

## 13. Journal des modifications serveur

> Toutes les modifications sur le VPS sont consignées ici.
> Format : `[DATE] — Action effectuée`

| Date | Action |
|------|--------|
| 2026-04-06 | Installation nginx, python3, git sur le VPS |
| 2026-04-06 | Déploiement MarketAI — `/var/www/marketai` |
| 2026-04-06 | Service systemd `marketai` créé et activé |
| 2026-04-06 | Config Nginx marketai sur port 8080 |
| 2026-04-06 | Port 8080 ouvert dans UFW |
| 2026-04-06 | `nginx.conf` corrigé — include `sites-enabled/*` |
| 2026-04-06 | Installation `fpdf2` (dépendance manquante) |
| 2026-04-07 | Clé Anthropic renouvelée dans `.env` |
| 2026-04-08 | Domaine `marketai.fr` acheté sur Hostinger |
| 2026-04-08 | Cloudflare configuré pour `marketai.fr` — propagation en cours |
