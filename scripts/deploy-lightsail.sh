#!/bin/bash
set -e

# Load environment variables from .env.prod
if [ -f "src/main/resources/config/.env.prod" ]; then
    export $(cat src/main/resources/config/.env.prod | grep -v '^#' | xargs)
fi

# Use custom tag if provided
IMAGE_TAG=${1:-latest}
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"
IMAGE_WITH_TAG="${ECR_URI}:${IMAGE_TAG}"
APP_IMAGE="${IMAGE_WITH_TAG}"

echo "==============================================="
echo "Liferadar Deploy to Lightsail"
echo "==============================================="
echo ""
echo "Deployment Configuration:"
echo "  Lightsail IP: ${LIGHTSAIL_IP}"
echo "  Image Tag: ${IMAGE_TAG}"
echo "  Image URI: ${IMAGE_WITH_TAG}"
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

echo "Connecting to Lightsail instance..."
ssh -i ~/.ssh/lightsail_key -o StrictHostKeyChecking=no ec2-user@${LIGHTSAIL_IP} << EOF
set -e
echo "Pulling Docker image from ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}
docker pull ${IMAGE_WITH_TAG}

cd liferadar
echo "Stopping current container..."
docker compose down || true

echo "Starting new container..."
export IMAGE_TAG=${IMAGE_TAG}
export APP_IMAGE=${APP_IMAGE}
docker compose up -d

echo "Waiting for health check..."
for i in {1..30}; do
  if docker exec liferadar-app-1 curl -f http://localhost:8080/management/health >/dev/null 2>&1; then
    echo "✓ Application is healthy!"
    break
  fi
  echo "  Attempt \$i/30..."
  sleep 2
done

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

