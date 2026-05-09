# Quick Start: Deploy Liferadar 3.5.0

## ✓ What's Been Set Up

### Completed
- ✅ **Maven Build:** Application built (79 MB JAR)
- ✅ **Dockerfile:** Production image configuration
- ✅ **GitHub Actions:** Automated CI/CD workflows
- ✅ **ECR Integration:** Ready to push to Amazon ECR
- ✅ **Lightsail Deployment:** Automated deployment workflow
- ✅ **Environment Config:** AWS credentials loaded from `.env.prod`
- ✅ **Deployment Scripts:** Local build/push/deploy workflows
- ✅ **Docker Compose:** Production-ready stack configuration

---

## 🚀 Deploy Now

### Option A: GitHub Actions (Recommended)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Liferadar 3.5.0: Family management, sortable expenses, overdue detection"
   git push origin main
   ```

2. **Watch deployment:**
   - Go to GitHub Actions tab
   - Monitor "Build and Push to ECR" workflow
   - Monitor "Deploy to Lightsail" workflow

3. **Verify:**
   - Check https://liferadar.atharsense.com
   - Check health: https://liferadar.atharsense.com/management/health

### Option B: Manual Local Deployment

Requires: Docker running, AWS CLI configured

```bash
# 1. Build and push to ECR
./scripts/build-and-push-ecr.sh 3.5.0

# 2. Deploy to Lightsail
./scripts/deploy-lightsail.sh 3.5.0

# 3. Monitor
curl https://liferadar.atharsense.com/management/health
```

---

## 📋 What's New in 3.5.0

### Frontend (Angular)
- ✅ **My Finance: Sortable Columns**
  - Sort expenses by Date, Name, Amount, Status
  - Click column header to toggle sort direction
  - Persists sort state across filters

- ✅ **Automatic Overdue Detection**
  - Expenses overdue past due date → status changes to OVERDUE
  - Real-time monitoring every 60 seconds
  - Works with both dueDate and renewalDate

- ✅ **Typo Fixed**
  - Label now says "expenses" instead of "decisions"

### Backend (Java)
- ✅ **Family Management System**
  - New `ROLE_PARENT` replaces `ROLE_FAMILY_ADMIN`
  - Parents can view/edit children's objectives
  - Parent account management (add/remove parents)

- ✅ **Settings Toggle**
  - Users can enable family management from settings
  - Grants `ROLE_PARENT` via toggle
  - Revokes role when toggled off

- ✅ **Liquibase Migration**
  - Production-safe role migration
  - Idempotent changeset (safe to rerun)
  - Preserves existing user-role mappings

- ✅ **i18n Updates**
  - English, French, Arabic translations
  - All new feature labels translated

---

## 🔄 Deployment Pipeline

```
↓ Developer pushes to GitHub
  ├─ GitHub Actions triggers
  ├─ Maven builds application
  ├─ Docker image created
  ├─ Pushed to Amazon ECR
  ├─ Lightsail pulls latest image
  ├─ Container restarted
  ├─ Health check verified
  └─ 🎉 Live!
```

**Total Time:** ~8 minutes

---

## 📊 Production Details

| Component | Value |
|-----------|-------|
| AWS Region | eu-central-1 |
| ECR Repository | liferadar/apps |
| Image Version | 3.5.0 |
| Lightsail IP | 3.126.92.141 |
| Domain | liferadar.atharsense.com |
| Java Version | 17 (Eclipse Temurin) |
| Container Memory | 1024 MB |
| Database | PostgreSQL 16 |
| Health Check | `/management/health` |

---

## 📝 Files Modified

### Backend Changes
```
src/main/java/
  ├── com/atharsense/lr/security/AuthoritiesConstants.java (ROLE_PARENT added)
  ├── com/atharsense/lr/service/UserService.java
  ├── com/atharsense/lr/service/FamilyObjectiveService.java
  └── com/atharsense/lr/web/rest/
      ├── AccountResource.java (family management toggle)
      ├── FamilyResource.java (parent management endpoints)
      └── SaaSSubscriptionResource.java (expense sorting)
```

### Frontend Changes
```
src/main/webapp/app/
  ├── account/settings/settings.component.ts (family toggle)
  ├── family/family.component.ts (parent management UI)
  ├── family/family.models.ts (ParentUser interface)
  ├── bills-subscriptions/bills-subscriptions.component.ts (sentiment sorting)
  ├── layouts/navbar/navbar.component.html (ROLE_PARENT link)
  └── i18n/
      ├── en/billsSubscriptions.json
      ├── fr/billsSubscriptions.json
      └── ar-ly/billsSubscriptions.json
```

### Database Changes
```
src/main/resources/config/liquibase/changelog/
  ├── 00000000000000_initial_schema.xml (checksum validation)
  └── 20260509000000_replace_family_admin_with_parent.xml (role migration)
```

### Infrastructure
```
.github/workflows/
  ├── ecr-build-push.yml (build and push to ECR)
  └── deploy-lightsail.yml (deploy to Lightsail)

scripts/
  ├── build-and-push-ecr.sh (local build script)
  └── deploy-lightsail.sh (local deploy script)

Dockerfile (production image)
docker-compose.yml (production stack)
DEPLOYMENT.md (detailed guide)
```

---

## ✨ Feature Showcase

### 1. Expense Sorting (My Finance)
**Before:** Fixed order by creation date  
**After:** Click any column header to sort
- Date (ascending/descending)
- Name (alphabetical)
- Amount (highest/lowest)
- Status (alphabetical)

### 2. Automatic Overdue Status
**Before:** Manual status updates  
**After:** Automatic detection every 60 seconds
```
Expense due: May 8, 2026
Today: May 9, 2026 → Status automatically becomes OVERDUE
```

### 3. Family Management
**Before:** Only ROLE_FAMILY_ADMIN could manage families  
**After:** 
```
User registers → Gets USER_ROLE
Goes to Settings → Enables "Family Management"
→ Gets ROLE_PARENT
→ Can see "My Family Space" menu
→ Can manage kids, objectives, parents
```

### 4. Parent Management
**Feature:** Add multiple parent accounts
```
Admin/Parent → Opens "Add Parent" form
Enters: login, password, name, email
→ New parent account created
→ New parent gets ROLE_PARENT
→ Shows in "Parents" section
```

---

## 🔐 Security Notes

- ✅ All credentials in `.env.prod` (never committed)
- ✅ GitHub Actions secrets for CI/CD
- ✅ SSH key-based deployment
- ✅ HTTPS/TLS enabled via Let's Encrypt
- ✅ Health checks verify container readiness
- ✅ Role-based access control for features

---

## 📞 Support

### If deployment fails:

1. **Check GitHub Actions logs:**
   ```
   GitHub → Actions → [Latest workflow] → Logs
   ```

2. **Check Lightsail container:**
   ```bash
   ssh -i ~/.ssh/lightsail_key ec2-user@3.126.92.141
   docker logs liferadar-app
   ```

3. **Check health endpoint:**
   ```bash
   curl https://liferadar.atharsense.com/management/health
   ```

4. **Check CloudWatch logs:**
   - AWS Console → Logs → /ecs/liferadar

---

## 🎯 Next Steps

- [ ] Push code to GitHub
- [ ] Monitor GitHub Actions
- [ ] Verify application health
- [ ] Test family management feature
- [ ] Test expense sorting
- [ ] Check Lightsail logs
- [ ] Monitor for errors

---

**Version:** 3.5.0  
**Release Date:** May 9, 2026  
**Status:** Ready for Deployment ✅


