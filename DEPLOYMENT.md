# Liferadar Deployment Guide

## Overview

This guide covers building and deploying Liferadar to Amazon ECR and Lightsail using either GitHub Actions (recommended) or local scripts.

## Architecture

```
GitHub Repository
    ↓
GitHub Actions: Build & Push to ECR
    ↓
Amazon ECR (Image Registry)
    ↓
GitHub Actions: Deploy to Lightsail
    ↓
Lightsail Instance (Production)
```

## Prerequisites

### For GitHub Actions Deployment (Recommended ✓)
- GitHub repository with Secrets configured
- AWS Account with ECR repository
- GitHub Actions enabled

### For Local Deployment
- Docker installed and running
- AWS CLI configured
- SSH access to Lightsail instance

---

## Setup: GitHub Secrets

Add these secrets to your GitHub repository Settings → Secrets and variables → Actions:

```
AWS_ACCOUNT_ID        →  682033485934
AWS_ACCESS_KEY_ID     →  AKIAZ5TC5DBXNA5N2XCH
AWS_SECRET_ACCESS_KEY →  [Your AWS secret key]
LIGHTSAIL_IP          →  3.126.92.141
LIGHTSAIL_SSH_KEY     →  [Your Lightsail private SSH key content]
```

**⚠️ Never commit these to the repository!**

---

## Method 1: GitHub Actions (Recommended)

### Automatic Deployment

Just push to `main`, `develop`, or `master` branches:

```bash
git add .
git commit -m "Update family management"
git push origin main
```

The workflow will automatically:
1. Build Maven application
2. Build Docker image
3. Push to Amazon ECR
4. Deploy to Lightsail

Monitor progress in **Actions** tab of your GitHub repository.

### Manual Workflow Trigger

In GitHub UI:
1. Go to **Actions** → **Build and Push to ECR**
2. Click **Run workflow**
3. Select branch and click **Run workflow**

---

## Method 2: Local Deployment

### Step 1: Build and Push to ECR

```bash
chmod +x scripts/build-and-push-ecr.sh
./scripts/build-and-push-ecr.sh 3.5.0
```

This script:
- Loads AWS credentials from `.env.prod`
- Builds the Maven application (if not already built)
- Builds Docker image
- Pushes to Amazon ECR

**Requirements:**
- Docker running
- AWS CLI installed
- AWS credentials configured

### Step 2: Deploy to Lightsail

```bash
chmod +x scripts/deploy-lightsail.sh
./scripts/deploy-lightsail.sh 3.5.0
```

This script:
- Connects to Lightsail instance via SSH
- Pulls the Docker image from ECR
- Stops old container
- Starts new container with latest image
- Verifies health check

**Requirements:**
- `~/.ssh/lightsail_key` (your Lightsail SSH private key)
- SSH access to Lightsail instance

---

## Workflow Files

### `.github/workflows/ecr-build-push.yml`
- **Trigger:** Push to `main`/`develop`/`master` or manual
- **Actions:**
  - Build Maven application
  - Build Docker image
  - Push to Amazon ECR
  - Output image URI

### `.github/workflows/deploy-lightsail.yml`
- **Trigger:** Successful ECR push or manual
- **Actions:**
  - Pull image from ECR to Lightsail
  - Restart Docker container
  - Verify health check
  - Report status

---

## Dockerfile

Location: `./Dockerfile`

```dockerfile
FROM eclipse-temurin:17-jre-focal
ENV _JAVA_OPTIONS="-Xmx1024m -Xms256m"
COPY target/liferadar-*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=5s --timeout=5s --retries=40 \
  CMD curl -f http://localhost:8080/management/health || exit 1
ENTRYPOINT ["java","-jar","/app.jar"]
```

---

## Environment Configuration

### `.env.prod` Values Used
```dotenv
AWS_REGION=eu-central-1
AWS_ACCOUNT_ID=682033485934
AWS_ACCESS_KEY_ID=AKIAZ5TC5DBXNA5N2XCH
AWS_SECRET_ACCESS_KEY=***
ECR_REPOSITORY=liferadar/apps
IMAGE_TAG=3.5.0
LIGHTSAIL_IP=3.126.92.141
DOMAIN_NAME=liferadar.atharsense.com
```

---

## Monitoring & Troubleshooting

### Check Deployment Status

```bash
# GitHub Actions
# Go to: https://github.com/yourrepo/actions

# Check Lightsail container
ssh -i ~/.ssh/lightsail_key ec2-user@3.126.92.141
docker ps
docker logs liferadar-app-1

# Check health
curl https://liferadar.atharsense.com/management/health
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Docker daemon not running | Start Docker Desktop or use GitHub Actions |
| AWS credentials not found | Run `aws configure` or set environment variables |
| SSH key permission denied | `chmod 600 ~/.ssh/lightsail_key` |
| Container won't start | Check logs: `docker logs <container_id>` |
| Health check fails | Wait 30 seconds and check application logs |

---

## Docker Image Tagging Strategy

- **Latest Build:** `latest` (always pushed)
- **Version Tag:** `3.5.0` (current version)
- **Commit SHA:** `abc123def` (GitHub Actions automatic)

Example ECR image URIs:
```
682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:latest
682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:3.5.0
682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:abc123def
```

---

## Scale & Update Strategy

### Zero-Downtime Updates
1. New image is pushed to ECR
2. Lightsail instance pulls new image
3. Old container is stopped
4. New container starts on same port
5. Health check verifies before route traffic

### Rollback
```bash
# Redeploy previous version
./scripts/deploy-lightsail.sh 3.4.0
```

---

## Security Best Practices

✓ **AWS Credentials:** Stored in GitHub Secrets, never in code  
✓ **SSH Keys:** Stored securely, not in repository  
✓ **Database:** RDS instance with encrypted password  
✓ **HTTPS:** Enabled via Let's Encrypt on Lightsail  
✓ **Health Checks:** Verify container is ready before routing

---

## Quick Reference

```bash
# View available tags
aws ecr describe-images \
  --repository-name liferadar/apps \
  --region eu-central-1

# Manually push an image
docker tag liferadar:3.5.0 \
  682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:3.5.0
docker push \
  682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:3.5.0

# Connect to Lightsail
ssh -i ~/.ssh/lightsail_key ec2-user@3.126.92.141

# View running container
docker ps
docker inspect <container_id>
```

---

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Review Lightsail container logs: `docker logs`
3. Verify AWS credentials and permissions
4. Check Lightsail security group rules
5. Verify DNS and SSL certificate status

---

**Last Updated:** May 9, 2026  
**Version:** 3.5.0  
**Contact:** Atharsense Team

