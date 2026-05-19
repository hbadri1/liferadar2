#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../../../.." && pwd)"
ENV_FILE="$PROJECT_ROOT/src/main/resources/config/.env.prod"

# Load environment variables from .env.prod
if [ -f "$ENV_FILE" ]; then
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
fi

# Use custom tag if provided, otherwise use from .env
IMAGE_TAG=${1:-${IMAGE_TAG:-3.5.0}}

# Build variables
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"
IMAGE_WITH_TAG="${ECR_URI}:${IMAGE_TAG}"
IMAGE_LATEST="${ECR_URI}:latest"

echo "==============================================="
echo "Liferadar Build & ECR Push Script"
echo "==============================================="
echo ""
echo "Configuration:"
echo "  AWS Region: ${AWS_REGION}"
echo "  AWS Account: ${AWS_ACCOUNT_ID}"
echo "  ECR Repository: ${ECR_REPOSITORY}"
echo "  Image Tag: ${IMAGE_TAG}"
echo "  Full URI: ${IMAGE_WITH_TAG}"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed or not running"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "✗ AWS CLI is not installed"
    exit 1
fi

# Verify JAR exists
if ls "$PROJECT_ROOT"/target/liferadar-*.jar >/dev/null 2>&1; then
    :
else
    echo "Building Maven project..."
    (cd "$PROJECT_ROOT" && ./mvnw -DskipTests -Pprod clean package)
fi

echo "✓ Prerequisites checked"
echo ""

# Authenticate with ECR
echo "Authenticating with Amazon ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}
echo "✓ Authenticated"
echo ""

# Build Docker image (target linux/amd64 for Lightsail x86 instances)
echo "Building Docker image..."
(cd "$PROJECT_ROOT" && docker buildx build --platform linux/amd64 -t ${IMAGE_WITH_TAG} -t ${IMAGE_LATEST} --load .)
echo "✓ Image built: ${IMAGE_WITH_TAG}"
echo ""

# Push to ECR
echo "Pushing image to ECR..."
docker push ${IMAGE_WITH_TAG}
docker push ${IMAGE_LATEST}
echo "✓ Image pushed successfully"
echo ""

echo "==============================================="
echo "✓ Build and push complete!"
echo "==============================================="
echo ""
echo "Image is now available in Amazon ECR at:"
echo "  ${IMAGE_WITH_TAG}"
echo "  ${IMAGE_LATEST}"
echo ""
echo "Next steps:"
echo "  1. Deploy using: $SCRIPT_DIR/deploy-lightsail.sh ${IMAGE_TAG}"
echo "  2. Or push to GitHub to trigger automated deployment"
echo "  3. Or deploy manually to ECS/Lightsail"
echo ""

