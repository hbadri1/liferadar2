#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

require_command ssh

load_env_file
apply_aws_env_auth

require_env LIGHTSAIL_IP
require_env REMOTE_DIR
require_file "$SSH_KEY_PATH"

chmod 400 "$SSH_KEY_PATH" 2>/dev/null || true

SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new -i "$SSH_KEY_PATH" -p "$SSH_PORT")

# Run from remote .env so credentials/image stay in one source.
read -r -d '' REMOTE_CMD <<'EOF' || true
set -e
cd __REMOTE_DIR__

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is not installed on remote host."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: docker compose plugin is not available on remote host."
  exit 1
fi

sed -i 's/\r$//' .env docker-compose.yml
set -a
. ./.env
set +a

AWS_REGION="${AWS_REGION%$'\r'}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID%$'\r'}"
APP_IMAGE="${APP_IMAGE%$'\r'}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID%$'\r'}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY%$'\r'}"
AWS_SESSION_TOKEN="${AWS_SESSION_TOKEN%$'\r'}"

if echo "$APP_IMAGE" | grep -q '\.dkr\.ecr\.'; then
  if ! command -v aws >/dev/null 2>&1; then
    echo "ERROR: AWS CLI required for ECR login on remote host."
    exit 1
  fi

  : "${AWS_REGION:?AWS_REGION must be set in .env}"

  if [ -n "${AWS_ACCESS_KEY_ID:-}" ] && [ -n "${AWS_SECRET_ACCESS_KEY:-}" ]; then
    export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY
    export AWS_SESSION_TOKEN="${AWS_SESSION_TOKEN:-}"
    unset AWS_PROFILE || true
    echo "Using static AWS credentials from .env for ECR login."
  else
    echo "Using instance profile/default AWS auth for ECR login."
  fi

  aws ecr get-login-password --region "$AWS_REGION" \
    | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
fi

docker compose --env-file .env pull
docker compose --env-file .env up -d --remove-orphans
docker compose --env-file .env ps
EOF

REMOTE_CMD="${REMOTE_CMD/__REMOTE_DIR__/$REMOTE_DIR}"

echo "Connecting to $SSH_USER@$LIGHTSAIL_IP and starting containers..."
ssh "${SSH_OPTS[@]}" "$SSH_USER@$LIGHTSAIL_IP" "$REMOTE_CMD"

echo "Remote deployment run finished."

