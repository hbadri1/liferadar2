# macOS Lightsail scripts

These scripts split deploy into 3 steps:

1. `1-build-push-ecr.sh`  
   Builds and pushes the Docker image to ECR using `IMAGE_TAG` from `../.env`.
2. `2-upload-compose-env.sh`  
   Uploads `docker-compose.yml`, `.env`, and nginx template to Lightsail using `LIGHTSAIL_IP` from `../.env`.
3. `3-ssh-run-containers.sh`  
   Connects by SSH, logs Docker into ECR when needed, then runs `docker compose pull` and `up -d`.

## Required files

- `../.env`
- `../docker-compose.yml`
- `../nginx/default.conf.template`
- SSH key at `../liferadar-lightsail01.pem` (or set `SSH_KEY_PATH`)

## Required `.env` keys

- `AWS_REGION`
- `ECR_REPOSITORY`
- `IMAGE_TAG`
- `AWS_ACCOUNT_ID` (optional; resolved from AWS CLI if missing in step 1)
- `APP_IMAGE` (auto-updated by step 1)
- `LIGHTSAIL_IP`

## One-time setup

```bash
cd /Users/houssem/Work/1-\ Liferadar/src/main/resources/config/hosting/aws/lightsail/macos
chmod +x ./*.sh
```

## Run steps

```bash
cd /Users/houssem/Work/1-\ Liferadar/src/main/resources/config/hosting/aws/lightsail/macos
./1-build-push-ecr.sh
./2-upload-compose-env.sh
./3-ssh-run-containers.sh
```

## Optional overrides

You can override defaults per run:

```bash
SSH_USER=ec2-user SSH_PORT=22 REMOTE_DIR=/opt/liferadar ./2-upload-compose-env.sh
SSH_USER=ec2-user SSH_PORT=22 REMOTE_DIR=/opt/liferadar ./3-ssh-run-containers.sh
```

