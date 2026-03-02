#!/bin/bash

set -e  # stoppe le script à la moindre erreur

# VARIABLES
PROJECT_DIR="$(pwd)"

# Cron scr_node variables
CRON_DIR="crons/scr_node"
CRON_WWW_DIR="/home/ubuntu/verly_crons/scr_node"
CRON_LOG_DIR="/home/ubuntu/logs"
CRON_ENV_FILE="/home/ubuntu/envs/.env.cron"
CRON_LOG_FILE="$CRON_LOG_DIR/scr_node.log"
CRON_TAG="# VERLY_SCR_NODE"
DEFAULT_SCHEDULE="0 */6 * * *"
SCHEDULE="$DEFAULT_SCHEDULE"
REMOVE_ONLY=false
RUN_ONCE=true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --schedule)
      shift
      SCHEDULE="$1"
      ;;
    --schedule=*)
      SCHEDULE="${1#*=}"
      ;;
    --remove)
      REMOVE_ONLY=true
      ;;
    --no-run-once)
      RUN_ONCE=false
      ;;
    *)
      echo "❌ Unknown argument: $1"
      echo "Usage: ./cron_deploy.sh [--schedule '0 */6 * * *'] [--remove] [--no-run-once]"
      exit 1
      ;;
  esac
  shift
done

if [ "$REMOVE_ONLY" = true ]; then
  echo "🧹 Removing cron entry only..."
  CURRENT_CRONTAB="$(crontab -l 2>/dev/null || true)"
  {
    echo "$CURRENT_CRONTAB" | grep -v "$CRON_TAG" || true
  } | crontab -
  echo "✅ Cron entry removed (tag: $CRON_TAG)"
  exit 0
fi

echo "🚀 Starting cron deployment..."

NODE_BIN="$(command -v node)"
if [ -z "$NODE_BIN" ]; then
  echo "❌ node introuvable dans le PATH"
  exit 1
fi

echo "📦 Deploying source files..."
sudo rm -rf "$CRON_WWW_DIR"
sudo mkdir -p "$CRON_WWW_DIR"
sudo cp -r "$PROJECT_DIR/$CRON_DIR/"* "$CRON_WWW_DIR"

sudo mkdir -p "$CRON_LOG_DIR"
sudo chown -R ubuntu:ubuntu "$CRON_WWW_DIR"
sudo chown -R ubuntu:ubuntu "$CRON_LOG_DIR"

echo "🔧 Installing dependencies..."
cd "$CRON_WWW_DIR"
npm i

if [ -f "$CRON_ENV_FILE" ]; then
  echo "🔐 Copying environment file..."
  sudo cp "$CRON_ENV_FILE" "$CRON_WWW_DIR/.env"
fi

CRON_CMD="cd $CRON_WWW_DIR && $NODE_BIN index.js >> $CRON_LOG_FILE 2>&1"
CRON_LINE="$SCHEDULE $CRON_CMD $CRON_TAG"

echo "🗓️ Configuring crontab with schedule: $SCHEDULE"
CURRENT_CRONTAB="$(crontab -l 2>/dev/null || true)"

{
  echo "$CURRENT_CRONTAB" | grep -v "$CRON_TAG" || true
  echo "$CRON_LINE"
} | crontab -

if [ "$RUN_ONCE" = true ]; then
  echo "▶️ Running scr_node once in background (silent)..."
  nohup bash -c "cd '$CRON_WWW_DIR' && '$NODE_BIN' index.js >> '$CRON_LOG_FILE' 2>&1" >/dev/null 2>&1 &
fi

echo "✅ Cron deployment complete!"
echo "ℹ️ Current entry: $CRON_LINE"
