#!/bin/bash

set -e  # stoppe le script à la moindre erreur

# VARIABLES
PROJECT_DIR="$(pwd)"

# Angular variables
ANGULAR_DIR="web"
ANGULAR_WWW_DIR="/var/www/verly"
ANGULAR_BUILD_DIR="$PROJECT_DIR/$ANGULAR_DIR/dist"
ANGULAR_NGINX_CONF_SRC="$PROJECT_DIR/infra/nginx/verly.conf"
ANGULAR_NGINX_CONF_DST="/etc/nginx/sites-available/verly.conf"
ANGULAR_NGINX_ENABLED="/etc/nginx/sites-enabled/verly.conf"

# API variables

# Cron job variables


echo "🚀 Starting deployment..."

# 2️⃣ Build Angular
echo "🔧 Building Angular..."
cd "$PROJECT_DIR/$ANGULAR_DIR"
npm run build --prod
echo "✅ Angular build complete!"
echo "📂 Copying Angular build to /var/www..."
sudo rm -rf "$ANGULAR_WWW_DIR"
sudo mkdir -p "$ANGULAR_WWW_DIR"
sudo cp -r "$ANGULAR_BUILD_DIR"/* "$ANGULAR_WWW_DIR"

# nginx
echo "🧩 Installing Nginx config..."
sudo cp "$ANGULAR_NGINX_CONF_SRC" "$ANGULAR_NGINX_CONF_DST"
sudo ln -sf "$ANGULAR_NGINX_CONF_DST" "$ANGULAR_NGINX_ENABLED"