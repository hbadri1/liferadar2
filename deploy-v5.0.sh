#!/bin/bash
# Liferadar v5.0 - Mobile Dashboard Refactor Deployment
# Date: July 17, 2026

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Liferadar v5.0 - Mobile Dashboard Refactor Deployment        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load config from .env
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_DIR/src/main/resources/config/.env.prod"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗${NC} Environment file not found: $ENV_FILE"
    exit 1
fi

# Source environment variables
source "$ENV_FILE"

echo -e "${BLUE}[0/5]${NC} Configuration Loaded"
echo "    Project:        LifeRadar"
echo "    Version:        5.0"
echo "    AWS Account:    $AWS_ACCOUNT_ID"
echo "    AWS Region:     eu-central-1"
echo "    ECR Repo:       $ECR_REPOSITORY"
echo "    Image:          $APP_IMAGE"
echo "    Lightsail IP:   $LIGHTSAIL_IP"
echo ""

# Verify JAR file
JAR_FILE="$PROJECT_DIR/target/liferadar-5.0.jar"
echo -e "${BLUE}[1/5]${NC} Verifying JAR file..."
if [ -f "$JAR_FILE" ]; then
    SIZE=$(ls -lh "$JAR_FILE" | awk '{print $5}')
    echo -e "${GREEN}✓${NC} JAR file found: liferadar-5.0.jar ($SIZE)"
else
    echo -e "${RED}✗${NC} JAR file not found: $JAR_FILE"
    echo "    Run: npm run build && ./mvnw clean package -DskipTests -Pprod"
    exit 1
fi

echo ""
echo -e "${BLUE}[2/5]${NC} Checking AWS CLI..."
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version)
    echo -e "${GREEN}✓${NC} AWS CLI is installed: $AWS_VERSION"
else
    echo -e "${RED}✗${NC} AWS CLI is not installed"
    exit 1
fi

echo ""
echo -e "${BLUE}[3/5]${NC} Authenticating with AWS ECR..."
# Configure AWS credentials
export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="eu-central-1"

# Get ECR login token
ECR_PASSWORD=$(aws ecr get-login-password --region eu-central-1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Successfully authenticated with AWS ECR"
else
    echo -e "${RED}✗${NC} AWS ECR authentication failed"
    echo "    Check your AWS credentials in .env.prod"
    exit 1
fi

echo ""
echo -e "${BLUE}[4/5]${NC} Building and Pushing Docker Image"
echo "    This requires Docker to be running on this machine"
echo "    On macOS: Open Docker Desktop"
echo "    Command: docker build -t $APP_IMAGE ."
echo ""
echo "    For automated deployment:"
echo "    1. Run Docker locally: npm run docker:build && npm run docker:push"
echo "    2. Or use CI/CD pipeline if available"
echo ""

echo -e "${BLUE}[5/5]${NC} Deployment Instructions for Lightsail"
echo ""
echo -e "${YELLOW}Step 1: Connect to Lightsail Instance${NC}"
echo "    ssh -i your-lightsail-key.pem ec2-user@$LIGHTSAIL_IP"
echo ""
echo -e "${YELLOW}Step 2: Pull and Deploy New Image${NC}"
cat << 'DEPLOY'
    # Set environment variables
    export AWS_REGION=eu-central-1
    export AWS_ACCOUNT_ID=682033485934
    export ECR_REPO=liferadar/apps
    export IMAGE_TAG=5.0
    export ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG"
    
    # Authenticate Docker with ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Navigate to deployment directory
    cd /home/ec2-user/liferadar
    
    # Pull and deploy
    docker-compose pull
    docker-compose down
    docker-compose up -d
    
    # Verify deployment
    docker-compose ps
    docker-compose logs -f app --tail 50
DEPLOY

echo ""
echo -e "${YELLOW}Step 3: Verify Deployment${NC}"
echo "    - Visit: https://liferadar.atharsense.com"
echo "    - Check new home dashboard with 4 widgets"
echo "    - Mobile optimized view should be responsive"
echo "    - Check browser console for errors"
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  v5.0 Deployment Preparation Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "What's New in v5.0:"
echo "  ✓ Simplified home dashboard with 4 widgets"
echo "  ✓ Coming Journey widget with trip preparation todos"
echo "  ✓ Upcoming Payments helper (instead of monthly totals)"
echo "  ✓ Expiring Documents with 6-month outlook"
echo "  ✓ Family Highlights widget"
echo "  ✓ Mobile-first responsive design"
echo "  ✓ Compact typography for better mobile UX"
echo "  ✓ Purple gradient theme with modern styling"
echo "  ✓ Life Radar page preserves original functionality"
echo ""
echo "Changes:"
echo "  ✓ pom.xml version: 5.0"
echo "  ✓ package.json version: 5.0"
echo "  ✓ Docker image: 682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:5.0"
echo ""

exit 0
