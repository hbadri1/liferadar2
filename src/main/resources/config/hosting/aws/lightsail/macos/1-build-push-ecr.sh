#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

require_command aws
require_command docker

load_env_file
apply_aws_env_auth

require_env AWS_REGION
require_env ECR_REPOSITORY
require_env IMAGE_TAG

AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text --region "$AWS_REGION")}"
require_env AWS_ACCOUNT_ID

REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
IMAGE_URI="$REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"
PROJECT_ROOT="$(resolve_project_root)"
MVN_WRAPPER="$PROJECT_ROOT/mvnw"

if [[ -x "$MVN_WRAPPER" ]]; then
  MVN_CMD="$MVN_WRAPPER"
else
  require_command mvn
  MVN_CMD="mvn"
fi

echo "[1/4] Ensuring ECR repository exists: $ECR_REPOSITORY"
aws ecr describe-repositories --repository-names "$ECR_REPOSITORY" --region "$AWS_REGION" >/dev/null 2>&1 || \
  aws ecr create-repository \
    --repository-name "$ECR_REPOSITORY" \
    --image-scanning-configuration scanOnPush=true \
    --region "$AWS_REGION" >/dev/null

echo "[2/4] Logging in Docker to ECR"
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$REGISTRY"

echo "[3/4] Building and pushing image with Maven/Jib"
pushd "$PROJECT_ROOT" >/dev/null
"$MVN_CMD" -Pprod -DskipTests -Denforcer.skip=true \
  "-Djib.to.image=$IMAGE_URI" \
  -Djib.to.auth.username=AWS \
  "-Djib.to.auth.password=$(aws ecr get-login-password --region "$AWS_REGION")" \
  clean package jib:build
popd >/dev/null

echo "[4/4] Done"
echo "Image pushed: $IMAGE_URI"

if grep -q '^APP_IMAGE=' "$ENV_FILE"; then
  sed -i.bak "s|^APP_IMAGE=.*|APP_IMAGE=$IMAGE_URI|" "$ENV_FILE"
else
  printf '\nAPP_IMAGE=%s\n' "$IMAGE_URI" >> "$ENV_FILE"
fi
rm -f "$ENV_FILE.bak"

echo "Updated APP_IMAGE in $ENV_FILE"

