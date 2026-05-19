# Lightsail Deployment (Centralized)

All build and deployment scripts are centralized in this folder.

## Main scripts

- `build-and-push-ecr.sh`
  - Builds the app image and pushes `${IMAGE_TAG}` + `latest` to ECR.
- `deploy-lightsail.sh`
  - Uploads and executes `lightsail-backup-postgres.sh` on Lightsail.
  - Backs up PostgreSQL before container restart/deploy.
  - Pulls and starts the new image.
- `lightsail-backup-postgres.sh`
  - Creates timestamped backups on Lightsail:
    - `$HOME/liferadar-backups/postgres_YYYYMMDD_HHMMSS.sql.gz`

## Usage

Run from project root:

```bash
cd /Users/houssem/Work/1-\ Liferadar
./src/main/resources/config/hosting/aws/lightsail/build-and-push-ecr.sh 1.15
./src/main/resources/config/hosting/aws/lightsail/deploy-lightsail.sh 1.15
```

## Environment file

These scripts load deployment variables from:

- `src/main/resources/config/.env.prod`

