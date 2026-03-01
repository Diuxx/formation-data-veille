#!/bin/bash

set -e  # stoppe le script à la moindre erreur

# VARIABLES
PROJECT_DIR="$(pwd)"

# API variables
API_DIR="api"
API_WWW_DIR="/home/ubuntu/verly_api"
API_NGINX_CONF_SRC="$PROJECT_DIR/infra/nginx/verly_api.conf"
API_NGINX_CONF_DST="/etc/nginx/sites-available/verly_api.conf"
API_NGINX_ENABLED="/etc/nginx/sites-enabled/verly_api.conf"
API_LOG_DIR="/home/ubuntu/logs"

# SSL Variables
DOMAIN="api.nicoblog.dev"
EMAIL="nicolasmarmot@gmail.com"

echo "🚀 Starting deployment..."

# Stopping API with PM2 before deployment
echo "⏹️ Stopping API with PM2..."
# pm2 stop verly_api || true # Ignore error if not running
pm2 delete verly_api || true

sudo rm -rf "$API_WWW_DIR"
sudo mkdir -p "$API_WWW_DIR"
sudo cp -r "$PROJECT_DIR/$API_DIR/"* "$API_WWW_DIR"

sudo mkdir -p "$API_LOG_DIR"

sudo chown -R ubuntu:ubuntu "$API_LOG_DIR"
sudo chown -R ubuntu:ubuntu "$API_WWW_DIR"

echo "🔧 Building API..."
cd "$API_WWW_DIR"
npm i

# nginx
cd "$PROJECT_DIR"
echo "🧩 Installing Nginx config..."
sudo cp "$API_NGINX_CONF_SRC" "$API_NGINX_CONF_DST"
if [ ! -L "$API_NGINX_ENABLED" ]; then
  sudo ln -s "$API_NGINX_CONF_DST" "$API_NGINX_ENABLED"
fi

echo "🔍 Testing Nginx configuration..."
sudo nginx -t

echo "♻️ Reloading Nginx..."
sudo systemctl reload nginx

echo "Applying SSL certificate with Certbot..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo "🔐 No SSL certificate found, generating one..."

  sudo certbot --nginx \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect
else
  echo "🔒 SSL certificate already exists"
fi

# PM2
echo "🚀 Starting API with PM2..."

cd "$API_WWW_DIR"
pm2 start ecosystem.config.cjs # Configure l’auto-start au reboot
pm2 status # Voir l’état global (online, stopped, crashed)
pm2 save # Sauvegarde l’état actuel pour redémarrage serveur

# pm2 logs api-nicoblog
# Affiche les logs en temps réel de ton API (stdout + stderr)
# Utile pour debug live : erreurs, requêtes, crashs, etc.
# pm2 restart api-nicoblog
# Redémarre ton API
# Recharge le code + reset l’état
# À utiliser après un nouveau build ou un changement d’env
# pm2 stop api-nicoblog
# Stoppe l’API MAIS la garde enregistrée dans PM2
# Elle ne tourne plus, mais peut être relancée facilement
# pm2 delete api-nicoblog
# Stoppe ET supprime l’API du registre PM2
# PM2 "oublie" complètement ce process
# À utiliser si tu veux la recréer proprement
# pm2 monit
# Dashboard live dans le terminal
# CPU / RAM / restarts / logs
# Vision temps réel de la santé de ton API