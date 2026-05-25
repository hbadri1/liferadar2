# 🚀 Quick Start Deployment Guide

## For: Liferadar v4.18 Hotfix - Date Conversion Fix

### TL;DR - Just Deploy It! 
**Time Required:** 10-15 minutes

```bash
# Step 1: Run the deployment script (handles everything)
cd /Users/houssem/Work/1-\ Liferadar
./deploy-hotfix.sh

# Step 2: On your Lightsail instance
ssh -i your-key.pem ec2-user@your-instance.com
cd /home/ec2-user/liferadar

# Step 3: Restart the app
docker-compose pull
docker-compose down
docker-compose up -d

# Step 4: Verify (should say "Up")
docker-compose ps

# Step 5: Test in browser
# - Visit your app
# - Create/update a trip with dates - should work now! ✓
```

---

## What Was Wrong?
Users got this error: `TypeError: startDate?.format is not a function`

It happened when trying to:
- ✗ Save a Trip with dates
- ✗ Create a SaaS Subscription  
- ✗ Update a Life Evaluation
- ✗ Create an Evaluation Decision

## What's Fixed?
All date handling code now:
- ✓ Checks if date is the right type before using it
- ✓ Handles strings, Date objects, dayjs objects
- ✓ Doesn't crash on unexpected formats
- ✓ Safe null handling

---

## Detailed Deployment Steps

### Step 1: Local Build & Push (5 minutes)

On your developer machine:

```bash
cd /Users/houssem/Work/1-\ Liferadar

# Option A: Let the script do everything
./deploy-hotfix.sh

# Option B: Manual steps
docker build -t 682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:4.18-hotfix1 .
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin 682033485934.dkr.ecr.eu-central-1.amazonaws.com
docker push 682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:4.18-hotfix1
docker tag 682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:4.18-hotfix1 \
          682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:latest
docker push 682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:latest
```

✅ **Check:** You should see "Pushed" in the output

### Step 2: Lightsail Instance Update (5 minutes)

SSH into your instance:

```bash
ssh -i your-key.pem ec2-user@your-instance.com
cd /home/ec2-user/liferadar  # Or wherever you have docker-compose.yml

# Option A: Update to specific tag
nano docker-compose.yml
# Change: image: 682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:4.18-hotfix1
# Save: Ctrl+O, Enter, Ctrl+X

# Option B: Keep using 'latest' (it's already updated)
# No changes needed

# Pull and restart
docker-compose pull
docker-compose down
docker-compose up -d

# Wait 30 seconds for startup
sleep 30
```

### Step 3: Verification (5 minutes)

```bash
# Check container is healthy
docker-compose ps
# Status should show: "Up (healthy)" or just "Up"

# Check logs
docker-compose logs app --tail 20
# Should see "Started Application in X seconds"

# Health check
curl http://localhost:8080/management/health
# Should return: {"status":"UP"}
```

### Step 4: Test in Browser

Go to https://your-domain.com and test:

1. **Create a Trip with Dates**
   - Navigate to "Trips"
   - Click "Create"
   - Enter name and dates
   - Click Save
   - ✅ Should work without errors

2. **Create a SaaS Subscription**
   - Navigate to "Bills"
   - Click "Add Subscription"
   - Fill in all date fields
   - Click Save
   - ✅ Should work without errors

3. **Check Browser Console**
   - Press F12 → Console tab
   - Look for red error messages
   - ✅ Should be clean

---

## If Something Goes Wrong

### Problem: Image push fails with "authentication required"

```bash
# Re-authenticate with AWS ECR
aws ecr get-login-password --region eu-central-1 | \
  docker login --username AWS --password-stdin 682033485934.dkr.ecr.eu-central-1.amazonaws.com

# Verify credentials
aws sts get-caller-identity
```

### Problem: Container won't start

```bash
# Check what's wrong
docker-compose logs app

# If failed to download: pull again
docker-compose pull

# If port conflict
lsof -i :8080  # see what's using it
sudo kill -9 <PID>

# Try again
docker-compose up -d
```

### Problem: Date fields still error after deploying

```bash
# Make sure correct image is running
docker-compose ps
# Look at IMAGE column - should see "4.18-hotfix1" or "latest"

# Make sure image was actually pulled
docker images | grep liferadar

# Force repull
docker-compose pull --no-parallel

# Restart
docker-compose down
docker-compose up -d
```

### Problem: Need to rollback quickly

```bash
# Option 1: If you know previous tag
sed -i 's|image:.*|image: 682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:4.17|' docker-compose.yml

# Option 2: Go back to a known working image
docker-compose down
docker pull 682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:4.17
docker-compose up -d
```

---

## Files to Reference

- 📄 **CHANGELOG-v4.18-HOTFIX.md** - Full changelog
- 📄 **DEPLOYMENT.md** - Detailed deployment guide
- 📄 **CODE-CHANGES.md** - Exact code changes made
- 🔧 **deploy-hotfix.sh** - Automated deployment script

---

## Key Info

| Item | Value |
|------|-------|
| **Hotfix Version** | 4.18-hotfix1 |
| **ECR Image** | `682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:4.18-hotfix1` |
| **Latest Tag** | Also updated (`:latest`) |
| **Build Size** | 85MB |
| **Build Time** | May 23, 2026 09:43 UTC |
| **Files Changed** | 4 TypeScript service files |
| **Breaking Changes** | None |
| **Database Migration** | Not needed |
| **API Changes** | None |
| **Backward Compatible** | Yes ✓ |

---

## Estimated Timeline

| Step | Time | Notes |
|------|------|-------|
| Build & Push | 5 min | One-time, local |
| SSH to instance | 1 min | - |
| Update compose | 2 min | Optional if using :latest |
| Pull & restart | 3 min | Wait for health check |
| Tests | 3 min | Quick sanity checks |
| **Total** | **~14 minutes** | Fastest path |

---

## Contact & Support

If you encounter any issues:

1. Check **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed troubleshooting
2. Review **[CODE-CHANGES.md](CODE-CHANGES.md)** for technical details
3. Check container logs: `docker-compose logs app -f`
4. Verify AWS credentials: `aws sts get-caller-identity`

---

**Ready to Deploy?** Run: `./deploy-hotfix.sh` 🚀

