# AWS ECS deploy

Deploys the app to **AWS ECS Fargate** using the existing Maven/Jib image build.
This setup runs **both app + PostgreSQL containers** in ECS.

## Prerequisites

- AWS CLI v2 configured (`aws --version`)
- PowerShell 5+
- Java 17+
- ECS execution/task IAM roles already created
- VPC subnets + security groups ready

## AWS credentials

The scripts call `aws` under the hood. You must supply credentials via **one** of:

| Method | How |
|---|---|
| **Named profile** | Run `aws configure` or `aws sso login`, then set `AWS_PROFILE=<name>` in `.env` |
| **Static keys** | Set `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` (+ optionally `AWS_SESSION_TOKEN`) in `.env` |
| **Pre-configured shell** | Run `aws configure` / `aws sso login` before running the scripts and leave the credential keys blank in `.env` |

> Verify with: `aws sts get-caller-identity`

## Files

- `.env.example` → copy to `.env` and fill values
- `ensure-ecr.ps1` → create/check ECR repository
- `build-push-image.ps1` → build and push image to ECR
- `deploy-ecs.ps1` → create/update cluster + service
- `deploy-all.ps1` → runs all steps

## Quick start

```powershell
Copy-Item .env.example .env
notepad .env          # fill AWS_REGION, AWS_ACCOUNT_ID, credential option, etc.
.\deploy-all.ps1
```

## Step by step

```powershell
.\ensure-ecr.ps1
.\build-push-image.ps1
.\deploy-ecs.ps1
```

## Required `.env` values

| Key | Notes |
|---|---|
| `AWS_REGION` | e.g. `eu-central-1` |
| `AWS_ACCOUNT_ID` | 12-digit account number |
| `ECR_REPOSITORY` | **Repo name only**, e.g. `liferadar/apps` — scripts build the full URI |
| `IMAGE_TAG` | e.g. `v0.1` |
| `ECS_CLUSTER` | |
| `ECS_SERVICE` | |
| `ECS_TASK_FAMILY` | |
| `ECS_EXECUTION_ROLE_ARN` | |
| `ECS_TASK_ROLE_ARN` | |
| `ECS_SUBNET_IDS` | comma-separated |
| `ECS_SECURITY_GROUP_IDS` | comma-separated |
| `DB_URL` | JDBC URL of the target PostgreSQL |
| `DB_USERNAME` | |
| `DB_PASSWORD` | |
| `JWT_BASE64_SECRET` | |

## Validate

```powershell
aws sts get-caller-identity
aws ecs describe-services --cluster <cluster> --services <service> --region <region>
aws ecs list-tasks --cluster <cluster> --service-name <service> --region <region>
```

## Notes

- Uses `prod` Spring profile by default.
- Exposes container port `8080`.
- PostgreSQL can be an external RDS instance (set `DB_URL`) or a container in the same task.
- Uses plain ECS environment variables for a first pass. Move secrets to Secrets Manager/SSM later if needed.
