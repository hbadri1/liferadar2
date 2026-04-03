# AWS ECS deploy

Deploys the app to **AWS ECS Fargate** using the existing Maven/Jib image build.

## Prerequisites

- AWS CLI v2 configured (`aws --version`)
- PowerShell 5+
- Java 17+
- ECS execution/task IAM roles already created
- VPC subnets + security groups ready

## Configuration – two files

Configuration is intentionally split so infra secrets never mix with app secrets:

| File | Purpose | Committed? |
|---|---|---|
| `src/main/resources/config/hosting/aws/ecs/.env` | AWS/ECS infrastructure (region, cluster, ECR, IAM…) | **No** – gitignored |
| `src/main/resources/config/.env/.env.prod` | App runtime (DB URL, JWT secret, mail password…) | **No** – gitignored |

Both have a committed `*.example` counterpart to use as a starting template.

## AWS credentials

The scripts call `aws` under the hood. Supply credentials via **one** of:

| Method | How |
|---|---|
| **Named profile** | Run `aws configure` or `aws sso login`, then set `AWS_PROFILE=<name>` in the hosting `.env` |
| **Static keys** | Set `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` (+ optionally `AWS_SESSION_TOKEN`) in the hosting `.env` |
| **Pre-configured shell** | Run `aws configure` / `aws sso login` before running scripts and leave credential keys blank |

> Verify with: `aws sts get-caller-identity`

## Files

```
src/main/resources/config/hosting/aws/ecs/
  .env.example              → copy to .env, fill hosting/AWS values
  common.ps1                → shared helpers (sourced by other scripts)
  ensure-ecr.ps1            → create/check ECR repository
  build-push-image.ps1      → build and push Docker image via Jib
  render-task-definition.ps1→ merge configs → task-definition.rendered.json
  deploy-ecs.ps1            → create/update cluster + service
  deploy-all.ps1            → runs all of the above

src/main/resources/config/.env/
  .env.prod.example         → copy to .env.prod, fill app runtime values
```

## Quick start

```powershell
# 1. Hosting config (AWS/ECS infrastructure)
cd src/main/resources/config/hosting/aws/ecs
Copy-Item .env.example .env
notepad .env

# 2. App runtime config (DB / JWT / mail)
Copy-Item ..\..\..\..\.env\.env.prod.example ..\..\..\..\.env\.env.prod
notepad ..\..\..\..\.env\.env.prod

# 3. Deploy
.\deploy-all.ps1
```

## Step by step

```powershell
cd src/main/resources/config/hosting/aws/ecs
.\ensure-ecr.ps1
.\build-push-image.ps1
.\deploy-ecs.ps1
```

## Required hosting `.env` values

| Key | Notes |
|---|---|
| `AWS_REGION` | e.g. `eu-central-1` |
| `AWS_ACCOUNT_ID` | 12-digit account number |
| `ECR_REPOSITORY` | **Repo name only**, e.g. `liferadar/apps` |
| `IMAGE_TAG` | e.g. `v0.12` |
| `ECS_CLUSTER` | |
| `ECS_SERVICE` | |
| `ECS_TASK_FAMILY` | |
| `ECS_EXECUTION_ROLE_ARN` | |
| `ECS_TASK_ROLE_ARN` | |
| `ECS_SUBNET_IDS` | comma-separated |
| `ECS_SECURITY_GROUP_IDS` | comma-separated |

## Required app `.env.prod` values

| Key | Notes |
|---|---|
| `SPRING_PROFILES_ACTIVE` | usually `prod` |
| `CONTAINER_PORT` | usually `8080` |
| `JHIPSTER_SLEEP` | startup delay in seconds (usually `0`) |
| `DB_URL` | JDBC URL of target PostgreSQL |
| `DB_USERNAME` | |
| `DB_PASSWORD` | |
| `JWT_BASE64_SECRET` | Base64 ≥ 256-bit – generate with `openssl rand -base64 64` |
| `SPRING_MAIL_PASSWORD` | SMTP password |

## Validate

```powershell
aws sts get-caller-identity
aws ecs describe-services --cluster <cluster> --services <service> --region <region>
aws ecs list-tasks --cluster <cluster> --service-name <service> --region <region>
```

## Notes

- Uses `prod` Spring profile by default.
- Exposes container port `8080`.
- PostgreSQL is an external RDS instance (set `DB_URL` in `.env.prod`).
- Environment variables are injected via plain ECS task definition. Move sensitive values to Secrets Manager/SSM Parameter Store for higher security environments.
