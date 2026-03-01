#!/bin/bash

set -e  # stoppe le script à la moindre erreur

# VARIABLES
PROJECT_DIR="$(pwd)"

# Angular variables
ANGULAR_DIR="web"
ANGULAR_WWW_DIR="/var/www/verly"
ANGULAR_BUILD_DIR="$PROJECT_DIR/$ANGULAR_DIR/dist"
ANGULAR_NGINX_CONF_SRC="$PROJECT_DIR/infra/nginx/verly_front.conf"
ANGULAR_NGINX_CONF_DST="/etc/nginx/sites-available/verly_front.conf"
ANGULAR_NGINX_ENABLED="/etc/nginx/sites-enabled/verly_front.conf"

# API variables

# Cron job variables

# SSL Variables
FRONT_DOMAIN="verly.nicoblog.dev"
BACK_DOMAIN="api.nicoblog.dev"
EMAIL="nicolasmarmot@gmail.com"

echo "🚀 Starting deployment..."

# 2️⃣ Build Angular
echo "🔧 Building Angular..."
cd "$PROJECT_DIR/$ANGULAR_DIR"
npm i 
npm run build-prod
echo "✅ Angular build complete!"
echo "📂 Copying Angular build to /var/www..."
sudo rm -rf "$ANGULAR_WWW_DIR"
sudo mkdir -p "$ANGULAR_WWW_DIR"
sudo cp -r "$ANGULAR_BUILD_DIR"/* "$ANGULAR_WWW_DIR"

# nginx
echo "🧩 Installing Nginx config..."
sudo cp "$ANGULAR_NGINX_CONF_SRC" "$ANGULAR_NGINX_CONF_DST"
if [ ! -L "$ANGULAR_NGINX_ENABLED" ]; then
  sudo ln -s "$ANGULAR_NGINX_CONF_DST" "$ANGULAR_NGINX_ENABLED"
fi

echo "🔍 Testing Nginx configuration..."
sudo nginx -t

echo "♻️ Reloading Nginx..."
sudo systemctl reload nginx

# echo "Applying SSL certificate with Certbot..."
# if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
#   echo "🔐 No SSL certificate found, generating one..."

#   sudo certbot --nginx \
#     -d "$FRONT_DOMAIN" \
#     -d "www.$FRONT_DOMAIN" \
#     --non-interactive \
#     --agree-tos \
#     --email "$EMAIL" \
#     --redirect
# else
#   echo "🔒 SSL certificate already exists"
# fi

echo "✅ Angular deployment complete!"