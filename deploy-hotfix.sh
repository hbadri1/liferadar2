#!/bin/bash
# Liferadar v4.18 Hotfix Deployment Guide
# Date: May 23, 2026

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Liferadar v4.18 - Date Conversion Hotfix Deployment          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/Users/houssem/Work/1- Liferadar"
JAR_FILE="$PROJECT_DIR/target/liferadar-4.18.jar"
AWS_ACCOUNT="682033485934"
AWS_REGION="eu-central-1"
ECR_REPO="liferadar/apps"
ECR_URI="$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO"
IMAGE_TAG="4.18-hotfix1"
DOCKER_IMAGE="$ECR_URI:$IMAGE_TAG"

echo -e "${BLUE}[1/6]${NC} Verifying JAR file..."
if [ -f "$JAR_FILE" ]; then
    SIZE=$(ls -lh "$JAR_FILE" | awk '{print $5}')
    echo -e "${GREEN}✓${NC} JAR file found: $JAR_FILE ($SIZE)"
else
    echo -e "${RED}✗${NC} JAR file not found: $JAR_FILE"
    exit 1
fi

echo ""
echo -e "${BLUE}[2/6]${NC} Verifying Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓${NC} Docker is installed: $DOCKER_VERSION"
else
    echo -e "${RED}✗${NC} Docker is not installed"
    exit 1
fi

echo ""
echo -e "${BLUE}[3/6]${NC} Building Docker image..."
echo "    Command: docker build -t $DOCKER_IMAGE ."
echo "    This may take 2-5 minutes..."

# Check if Dockerfile exists
if [ ! -f "$PROJECT_DIR/Dockerfile" ]; then
    echo -e "${RED}✗${NC} Dockerfile not found in $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"
docker build -t "$DOCKER_IMAGE" . --quiet
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Docker image built successfully: $DOCKER_IMAGE"
else
    echo -e "${RED}✗${NC} Docker build failed"
    exit 1
fi

echo ""
echo -e "${BLUE}[4/6]${NC} Authenticating with AWS ECR..."
echo "    Running: aws ecr get-login-password | docker login ..."

# Get ECR login token
if ! aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com"; then
    echo -e "${RED}✗${NC} AWS ECR authentication failed"
    echo "    Make sure AWS CLI is configured and you have ECR permissions"
    exit 1
fi
echo -e "${GREEN}✓${NC} Successfully authenticated with AWS ECR"

echo ""
echo -e "${BLUE}[5/6]${NC} Pushing Docker image to ECR..."
echo "    Target: $DOCKER_IMAGE"

if docker push "$DOCKER_IMAGE"; then
    echo -e "${GREEN}✓${NC} Image pushed successfully to ECR"
else
    echo -e "${RED}✗${NC} Failed to push image to ECR"
    exit 1
fi

# Also push as 'latest' tag
LATEST_IMAGE="$ECR_URI:latest"
echo "    Tagging as latest..."
docker tag "$DOCKER_IMAGE" "$LATEST_IMAGE"
docker push "$LATEST_IMAGE"
echo -e "${GREEN}✓${NC} Latest tag updated"

echo ""
echo -e "${BLUE}[6/6]${NC} Deployment Instructions"
echo ""
echo -e "${YELLOW}Next Steps on Lightsail Instance:${NC}"
echo ""
echo "1. Connect to your Lightsail instance:"
echo "   ssh -i your-key.pem ec2-user@your-instance.aws.com"
echo ""
echo "2. Navigate to your deployment directory:"
echo "   cd /path/to/liferadar"
echo ""
echo "3. Update docker-compose.yml (optional, as latest will be used):"
echo "   - Change image to: $ECR_URI:$IMAGE_TAG"
echo "   - Or keep using 'latest' tag which is now updated"
echo ""
echo "4. Pull the new image:"
echo "   docker-compose pull"
echo ""
echo "5. Restart the application:"
echo "   docker-compose down && docker-compose up -d"
echo ""
echo "6. Verify the deployment:"
echo "   docker-compose ps"
echo "   docker-compose logs -f app --tail 50"
echo ""
echo "7. Test the fix:"
echo "   - Visit: https://your-domain.com"
echo "   - Try updating a Trip Plan with dates"
echo "   - Try creating a SaaS Subscription"
echo "   - Check browser console for any date errors"
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Deployment package ready!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Docker Image: $DOCKER_IMAGE"
echo "Latest Tag:  $LATEST_IMAGE"
echo ""
echo "Changelog:   CHANGELOG-v4.18-HOTFIX.md"
echo ""

