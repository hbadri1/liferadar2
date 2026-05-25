#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../../../.." && pwd)"
ENV_FILE="$PROJECT_ROOT/src/main/resources/config/.env.prod"

# Load environment variables from .env.prod
if [ -f "$ENV_FILE" ]; then
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
fi

# Use custom tag if provided
IMAGE_TAG=${1:-latest}
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"
IMAGE_WITH_TAG="${ECR_URI}:${IMAGE_TAG}"
APP_IMAGE="${IMAGE_WITH_TAG}"
DB_CONTAINER_NAME="${DB_CONTAINER_NAME:-liferadar-postgres}"
LOCAL_BACKUP_SCRIPT="$SCRIPT_DIR/lightsail-backup-postgres.sh"
REMOTE_BACKUP_SCRIPT="/tmp/lightsail-backup-postgres.sh"

echo "==============================================="
echo "Liferadar Deploy to Lightsail"
echo "==============================================="
echo ""
echo "Deployment Configuration:"
echo "  Lightsail IP: ${LIGHTSAIL_IP}"
echo "  Image Tag: ${IMAGE_TAG}"
echo "  Image URI: ${IMAGE_WITH_TAG}"
echo "  DB Container: ${DB_CONTAINER_NAME}"
echo ""

# Verify prerequisites
if [ -z "$LIGHTSAIL_IP" ]; then
    echo "✗ LIGHTSAIL_IP not set in environment"
    exit 1
fi

if [ ! -f ~/.ssh/lightsail_key ]; then
    echo "✗ SSH key not found at ~/.ssh/lightsail_key"
    echo "Please ensure your Lightsail SSH key is in place"
    exit 1
fi

if [ ! -f "${LOCAL_BACKUP_SCRIPT}" ]; then
    echo "✗ Backup script not found at ${LOCAL_BACKUP_SCRIPT}"
    exit 1
fi

echo "Uploading backup script to Lightsail..."
scp -i ~/.ssh/lightsail_key -o StrictHostKeyChecking=no "${LOCAL_BACKUP_SCRIPT}" "ec2-user@${LIGHTSAIL_IP}:${REMOTE_BACKUP_SCRIPT}"

echo "Connecting to Lightsail instance..."
ssh -i ~/.ssh/lightsail_key -o StrictHostKeyChecking=no ec2-user@${LIGHTSAIL_IP} << EOF
set -e
chmod +x ${REMOTE_BACKUP_SCRIPT}
echo "Pulling Docker image from ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}
docker pull ${IMAGE_WITH_TAG}

cd liferadar
echo "Creating database backup before deployment..."
BACKUP_DIR="\$HOME/liferadar-backups" ${REMOTE_BACKUP_SCRIPT} ${DB_CONTAINER_NAME}

echo "Stopping current container..."
docker compose down || true

echo "Starting new container..."
export IMAGE_TAG=${IMAGE_TAG}
export APP_IMAGE=${APP_IMAGE}
docker compose up -d

echo "Waiting for health check..."
HEALTHY=0
for i in {1..30}; do
  if docker exec liferadar-app curl -f http://localhost:8080/management/health >/dev/null 2>&1; then
    echo "✓ Application is healthy!"
    HEALTHY=1
    break
  fi
  echo "  Attempt \$i/30..."
  sleep 2
done

if [ "\$HEALTHY" -ne 1 ]; then
  echo "✗ Application failed health check after deployment"
  exit 1
fi

docker ps
EOF

echo ""
echo "==============================================="
echo "✓ Deployment completed!"
echo "==============================================="
echo ""
echo "Application URL: https://${DOMAIN_NAME:-liferadar.atharsense.com}"
echo "Health Check: https://${DOMAIN_NAME:-liferadar.atharsense.com}/management/health"
echo ""

