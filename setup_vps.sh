#!/bin/bash
set -e

# ── 1. Système ─────────────────────────────────────────────────────────────────
echo "=== 1/6 Mise à jour système ==="
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y python3 python3-pip python3-venv nginx git

# ── 2. Code ────────────────────────────────────────────────────────────────────
echo "=== 2/6 Clonage du repo ==="
rm -rf /var/www/marketai
git clone https://github.com/axelcclefevre-hash/marketai.git /var/www/marketai

# ── 3. Dépendances Python ──────────────────────────────────────────────────────
echo "=== 3/6 Installation Python (2-3 min) ==="
python3 -m venv /var/www/marketai/financial_dashboard/venv
/var/www/marketai/financial_dashboard/venv/bin/pip install --upgrade pip -q
/var/www/marketai/financial_dashboard/venv/bin/pip install -r /var/www/marketai/financial_dashboard/requirements.txt

# ── 4. Clés API ────────────────────────────────────────────────────────────────
echo "=== 4/6 Clés API ==="
cat > /var/www/marketai/financial_dashboard/.env << 'EOF'
ANTHROPIC_API_KEY=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
FRED_API_KEY=07570e0b3937a806b7fe645f57af915c
EOF
chmod 600 /var/www/marketai/financial_dashboard/.env

# ── 5. Service systemd ─────────────────────────────────────────────────────────
echo "=== 5/6 Service systemd ==="
cat > /etc/systemd/system/marketai.service << 'EOF'
[Unit]
Description=MarketAI Streamlit Dashboard
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/marketai/financial_dashboard
ExecStart=/var/www/marketai/financial_dashboard/venv/bin/streamlit run app.py --server.port 8501 --server.headless true --server.address 127.0.0.1
Restart=always
RestartSec=5
EnvironmentFile=/var/www/marketai/financial_dashboard/.env

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable marketai
systemctl start marketai

# ── 6. Nginx ───────────────────────────────────────────────────────────────────
echo "=== 6/6 Nginx ==="
cat > /etc/nginx/sites-available/marketai << 'EOF'
server {
    listen 80;
    server_name 31.97.158.55;

    location / {
        proxy_pass         http://127.0.0.1:8501;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_read_timeout 86400;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/marketai /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

echo ""
echo "✅ Déploiement terminé !"
echo "👉 http://31.97.158.55"
