#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

require_command ssh
require_command scp

load_env_file

require_env LIGHTSAIL_IP
require_file "$COMPOSE_FILE"
require_file "$ENV_FILE"
require_file "$NGINX_TEMPLATE"
require_file "$SSH_KEY_PATH"

chmod 400 "$SSH_KEY_PATH" 2>/dev/null || true

SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new -i "$SSH_KEY_PATH" -p "$SSH_PORT")
SCP_OPTS=(-o BatchMode=yes -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new -i "$SSH_KEY_PATH" -P "$SSH_PORT")

echo "[1/3] Preparing remote directory on $LIGHTSAIL_IP"
ssh "${SSH_OPTS[@]}" "$SSH_USER@$LIGHTSAIL_IP" \
  "sudo mkdir -p '$REMOTE_DIR/nginx' && sudo chown -R \$(id -u):\$(id -g) '$REMOTE_DIR'"

echo "[2/3] Uploading docker-compose and env files"
scp "${SCP_OPTS[@]}" "$COMPOSE_FILE" "$SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/docker-compose.yml"
scp "${SCP_OPTS[@]}" "$ENV_FILE" "$SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/.env"
scp "${SCP_OPTS[@]}" "$NGINX_TEMPLATE" "$SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/nginx/default.conf.template"

echo "[3/3] Normalizing remote line endings"
ssh "${SSH_OPTS[@]}" "$SSH_USER@$LIGHTSAIL_IP" \
  "sed -i 's/\r$//' '$REMOTE_DIR/.env' '$REMOTE_DIR/docker-compose.yml' '$REMOTE_DIR/nginx/default.conf.template'"

echo "Upload complete to $SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR"

