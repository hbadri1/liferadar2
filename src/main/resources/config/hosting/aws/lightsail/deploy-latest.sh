#!/usr/bin/env bash
# =============================================================================
# deploy-latest.sh
# Build the Spring Boot image as "latest", push to ECR, deploy to Lightsail.
#
# Usage:
#   ./deploy-latest.sh
#   SERVER_HOST=<ip> ./deploy-latest.sh   # override target IP
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../../../.." && pwd)"

# ── Configurable defaults (override via env vars) ─────────────────────────────
SERVER_HOST="${SERVER_HOST:-3.126.92.141}"
SSH_USER="${SSH_USER:-ec2-user}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-$SCRIPT_DIR/liferadar-lightsail01.pem}"
REMOTE_DIR="${REMOTE_DIR:-/opt/liferadar}"
IMAGE_TAG="latest"

ENV_FILE="$SCRIPT_DIR/.env"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
NGINX_TEMPLATE="$SCRIPT_DIR/nginx/default.conf.template"
SETUP_SCRIPT="$SCRIPT_DIR/0-setup-docker"

SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new -i "$SSH_KEY" -p "$SSH_PORT")
SCP_OPTS=(-o BatchMode=yes -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new -i "$SSH_KEY" -P "$SSH_PORT")

# ── Load .env ─────────────────────────────────────────────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: .env not found at $ENV_FILE" >&2; exit 1
fi
# Load .env line-by-line; skip blanks and comments; quote values for safety
while IFS= read -r line || [[ -n "$line" ]]; do
  # strip leading/trailing whitespace
  line="${line#"${line%%[![:space:]]*}"}"
  line="${line%"${line##*[![:space:]]}"}"
  # skip blank lines and comments
  [[ -z "$line" || "$line" == \#* ]] && continue
  # must contain '='
  [[ "$line" == *=* ]] || continue
  key="${line%%=*}"
  val="${line#*=}"
  # strip surrounding single/double quotes from value
  if [[ "${val:0:1}" == '"' && "${val: -1}" == '"' ]]; then
    val="${val:1:${#val}-2}"
  elif [[ "${val:0:1}" == "'" && "${val: -1}" == "'" ]]; then
    val="${val:1:${#val}-2}"
  fi
  export "$key=$val"
done < "$ENV_FILE"

# ── Sanity checks ─────────────────────────────────────────────────────────────
for f in "$ENV_FILE" "$COMPOSE_FILE" "$NGINX_TEMPLATE" "$SETUP_SCRIPT" "$SSH_KEY"; do
  [[ -f "$f" ]] || { echo "ERROR: missing required file: $f" >&2; exit 1; }
done
chmod 400 "$SSH_KEY" 2>/dev/null || true

command -v aws  >/dev/null || { echo "ERROR: aws CLI not found" >&2; exit 1; }
command -v mvn  >/dev/null 2>&1 || MVNW="$PROJECT_ROOT/mvnw"
MVN="${MVNW:-mvn}"

# ── Derived values ─────────────────────────────────────────────────────────────
: "${AWS_REGION:?AWS_REGION must be set in .env}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID must be set in .env}"
: "${ECR_REPOSITORY:?ECR_REPOSITORY must be set in .env}"

REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
IMAGE_URI="$REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"

# Export static credentials if present
[[ -n "${AWS_ACCESS_KEY_ID:-}"     ]] && export AWS_ACCESS_KEY_ID
[[ -n "${AWS_SECRET_ACCESS_KEY:-}" ]] && export AWS_SECRET_ACCESS_KEY
[[ -n "${AWS_SESSION_TOKEN:-}"     ]] && export AWS_SESSION_TOKEN

# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "════════════════════════════════════════════════════════════════"
echo " STEP 1/3  Build & push Docker image  (tag: $IMAGE_TAG)"
echo "════════════════════════════════════════════════════════════════"

# Ensure ECR repository exists
echo "Checking ECR repository: $ECR_REPOSITORY"
aws ecr describe-repositories --repository-names "$ECR_REPOSITORY" --region "$AWS_REGION" > /dev/null 2>&1 \
  || aws ecr create-repository \
       --repository-name "$ECR_REPOSITORY" \
       --image-scanning-configuration scanOnPush=true \
       --region "$AWS_REGION" > /dev/null

# Authenticate Docker → ECR
echo "Authenticating Docker to ECR..."
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY"

# Build + push via Maven / Jib (runs from project root)
echo "Building image: $IMAGE_URI"
cd "$PROJECT_ROOT"
"$MVN" -Pprod -DskipTests -Denforcer.skip=true \
  "-Djib.to.image=$IMAGE_URI" \
  "-Djib.to.auth.username=AWS" \
  "-Djib.to.auth.password=$(aws ecr get-login-password --region "$AWS_REGION")" \
  package jib:build
cd "$SCRIPT_DIR"

echo "Image pushed: $IMAGE_URI"

# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "════════════════════════════════════════════════════════════════"
echo " STEP 2/3  Updating APP_IMAGE in .env  ->  $IMAGE_URI"
echo "════════════════════════════════════════════════════════════════"

if grep -q '^APP_IMAGE=' "$ENV_FILE"; then
  sed -i.bak "s|^APP_IMAGE=.*|APP_IMAGE=$IMAGE_URI|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
else
  echo "APP_IMAGE=$IMAGE_URI" >> "$ENV_FILE"
fi
sed -i.bak "s|^IMAGE_TAG=.*|IMAGE_TAG=$IMAGE_TAG|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
echo ".env updated."

# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "════════════════════════════════════════════════════════════════"
echo " STEP 3/3  Deploying to Lightsail  ($SERVER_HOST)"
echo "════════════════════════════════════════════════════════════════"

# 3a – Ensure remote dirs (sudo required for /opt)
echo "[3a] Creating remote directories"
ssh "${SSH_OPTS[@]}" "$SSH_USER@$SERVER_HOST" "sudo mkdir -p $REMOTE_DIR/nginx && sudo chown -R \$(id -u):\$(id -g) $REMOTE_DIR"

# 3b – Upload files
echo "[3b] Uploading files"
scp "${SCP_OPTS[@]}" "$SETUP_SCRIPT"    "$SSH_USER@$SERVER_HOST:$REMOTE_DIR/0-setup-docker"
scp "${SCP_OPTS[@]}" "$COMPOSE_FILE"    "$SSH_USER@$SERVER_HOST:$REMOTE_DIR/docker-compose.yml"
scp "${SCP_OPTS[@]}" "$ENV_FILE"        "$SSH_USER@$SERVER_HOST:$REMOTE_DIR/.env"
scp "${SCP_OPTS[@]}" "$NGINX_TEMPLATE"  "$SSH_USER@$SERVER_HOST:$REMOTE_DIR/nginx/default.conf.template"

# Normalise line endings
ssh "${SSH_OPTS[@]}" "$SSH_USER@$SERVER_HOST" \
  "sed -i 's/\r$//' $REMOTE_DIR/.env $REMOTE_DIR/docker-compose.yml $REMOTE_DIR/nginx/default.conf.template"

# 3c – Ensure Docker is installed
echo "[3c] Ensuring Docker is installed on remote host"
ssh "${SSH_OPTS[@]}" "$SSH_USER@$SERVER_HOST" "
if ! command -v docker >/dev/null 2>&1; then
  echo 'Docker not found. Running bootstrap script...'
  chmod +x $REMOTE_DIR/0-setup-docker
  sudo $REMOTE_DIR/0-setup-docker
else
  echo 'Docker already installed.'
fi"

# 3d – ECR login on remote host
echo "[3d] Authenticating remote Docker to ECR"
ECR_TOKEN="$(aws ecr get-login-password --region "$AWS_REGION")"
ssh "${SSH_OPTS[@]}" "$SSH_USER@$SERVER_HOST" "
printf '%s' '$ECR_TOKEN' | docker login --username AWS --password-stdin $REGISTRY"

# 3e – Pull & start containers
echo "[3e] Pulling images and starting containers"
ssh "${SSH_OPTS[@]}" "$SSH_USER@$SERVER_HOST" "
set -e
cd $REMOTE_DIR
docker compose --env-file .env pull
docker compose --env-file .env up -d --remove-orphans
docker compose --env-file .env up -d"

# 3f – Let's Encrypt certificate
echo "[3f] Requesting/refreshing Let's Encrypt certificate"
ssh "${SSH_OPTS[@]}" "$SSH_USER@$SERVER_HOST" "
cd $REMOTE_DIR
docker compose --env-file .env --profile init run --rm certbot-init \
  && docker compose --env-file .env exec -T nginx nginx -s reload" \
  || echo "WARNING: Let's Encrypt init failed – ensure DNS is pointing to $SERVER_HOST and re-run manually."

# 3g – Status
echo ""
echo "[done] Current service status:"
ssh "${SSH_OPTS[@]}" "$SSH_USER@$SERVER_HOST" "cd $REMOTE_DIR && docker compose ps"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo " All done.  liferadar:latest is live on Lightsail ($SERVER_HOST)"
echo "════════════════════════════════════════════════════════════════"

