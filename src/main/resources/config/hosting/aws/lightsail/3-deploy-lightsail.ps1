param(
    [Parameter(Mandatory = $true)]
    [string]$ServerHost,

    [Parameter(Mandatory = $true)]
    [string]$SshKeyPath,

    [string]$User = "ec2-user",
    [int]$SshPort = 22,
    [string]$RemoteDir = "/opt/liferadar"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$sshOptions = @('-F', 'NUL', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=20', '-o', 'StrictHostKeyChecking=accept-new')

function Invoke-NativeChecked {
    param(
        [Parameter(Mandatory = $true)][string]$Description,
        [Parameter(Mandatory = $true)][scriptblock]$Command
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$Description failed (exit code: $LASTEXITCODE)."
    }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$setupScriptFile = Join-Path $scriptDir "0-setup-docker"
$composeFile = Join-Path $scriptDir "docker-compose.yml"
$envFile = Join-Path $scriptDir ".env"
$nginxTemplateFile = Join-Path $scriptDir "nginx/default.conf.template"

if (-not (Test-Path -LiteralPath $setupScriptFile)) {
    throw "Missing file: $setupScriptFile"
}
if (-not (Test-Path -LiteralPath $composeFile)) {
    throw "Missing file: $composeFile"
}
if (-not (Test-Path -LiteralPath $envFile)) {
    throw "Missing file: $envFile"
}
if (-not (Test-Path -LiteralPath $nginxTemplateFile)) {
    throw "Missing file: $nginxTemplateFile"
}
if (-not (Test-Path -LiteralPath $SshKeyPath)) {
    throw "SSH key not found: $SshKeyPath"
}

Write-Host "[1/5] Ensuring remote directories exist: $RemoteDir"
Invoke-NativeChecked -Description "Create remote directories" -Command {
    ssh @sshOptions -i $SshKeyPath -p $SshPort "$User@$ServerHost" "mkdir -p $RemoteDir/nginx"
}

Write-Host "[2/5] Uploading docker-compose, .env and nginx template"
Invoke-NativeChecked -Description "Upload setup script" -Command {
    scp @sshOptions -i $SshKeyPath -P $SshPort $setupScriptFile "$User@$ServerHost`:$RemoteDir/0-setup-docker"
}
Invoke-NativeChecked -Description "Upload docker-compose.yml" -Command {
    scp @sshOptions -i $SshKeyPath -P $SshPort $composeFile "$User@$ServerHost`:$RemoteDir/docker-compose.yml"
}
Invoke-NativeChecked -Description "Upload .env" -Command {
    scp @sshOptions -i $SshKeyPath -P $SshPort $envFile "$User@$ServerHost`:$RemoteDir/.env"
}
Invoke-NativeChecked -Description "Upload nginx template" -Command {
    scp @sshOptions -i $SshKeyPath -P $SshPort $nginxTemplateFile "$User@$ServerHost`:$RemoteDir/nginx/default.conf.template"
}
Invoke-NativeChecked -Description "Normalize remote text file line endings" -Command {
    ssh @sshOptions -i $SshKeyPath -p $SshPort "$User@$ServerHost" "sed -i 's/\r$//' $RemoteDir/.env $RemoteDir/docker-compose.yml $RemoteDir/nginx/default.conf.template"
}

Write-Host "[3/5] Ensuring Docker is installed on remote host"
$ensureDockerCmd = "if ! command -v docker >/dev/null 2>&1; then " +
    "echo 'Docker not found. Running bootstrap script...'; " +
    "chmod +x $RemoteDir/0-setup-docker; " +
    "if command -v sudo >/dev/null 2>&1; then sudo $RemoteDir/0-setup-docker; else $RemoteDir/0-setup-docker; fi; " +
    "else echo 'Docker already installed.'; fi"
Invoke-NativeChecked -Description "Ensure Docker is installed remotely" -Command {
    ssh @sshOptions -i $SshKeyPath -p $SshPort "$User@$ServerHost" $ensureDockerCmd
}

Write-Host "[4/6] Authenticating Docker to ECR (if APP_IMAGE uses ECR)"
$ecrLoginCmdTemplate = @'
cd __REMOTE_DIR__
sed -i 's/\r$//' ./.env
set -a
. ./.env
set +a

# Guard against accidental CRLF values after sourcing .env
AWS_REGION="${AWS_REGION%$'\r'}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID%$'\r'}"
APP_IMAGE="${APP_IMAGE%$'\r'}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID%$'\r'}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY%$'\r'}"
AWS_SESSION_TOKEN="${AWS_SESSION_TOKEN%$'\r'}"

if echo "$APP_IMAGE" | grep -q "\.dkr\.ecr\."; then
  if ! command -v aws >/dev/null 2>&1; then
    echo "AWS CLI is required for ECR login but is not installed on remote host."
    exit 1
  fi

  : "${AWS_REGION:?AWS_REGION must be set in .env}"
  : "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID must be set in .env}"

  # If static credentials are supplied in .env, prefer them over instance role.
  if [ -n "${AWS_ACCESS_KEY_ID:-}" ] && [ -n "${AWS_SECRET_ACCESS_KEY:-}" ]; then
    export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY
    export AWS_SESSION_TOKEN="${AWS_SESSION_TOKEN:-}"
    unset AWS_PROFILE || true
    echo "Using static AWS credentials from .env for ECR login."
  else
    echo "Using instance role/default AWS credentials for ECR login."
  fi

  LOGIN_PASSWORD="$(aws ecr get-login-password --region "$AWS_REGION" 2>&1)"
  if [ $? -ne 0 ] || [ -z "$LOGIN_PASSWORD" ]; then
    echo "$LOGIN_PASSWORD"
    echo "Failed to retrieve ECR login token."
    echo "Provide AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env, or grant the instance role ecr:GetAuthorizationToken."
    exit 1
  fi

  printf '%s' "$LOGIN_PASSWORD" \
    | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
else
  echo "APP_IMAGE is not ECR; skipping ECR login."
fi
'@
$ecrLoginCmd = $ecrLoginCmdTemplate.Replace('__REMOTE_DIR__', $RemoteDir).Replace("`r", '')
Invoke-NativeChecked -Description "Authenticate Docker to ECR" -Command {
    ssh @sshOptions -i $SshKeyPath -p $SshPort "$User@$ServerHost" $ecrLoginCmd
}

Write-Host "[5/6] Pulling images, ensuring nginx is running, and starting all containers"
$remoteCmdTemplate = @'
cd __REMOTE_DIR__
docker compose --env-file .env pull
docker compose --env-file .env up -d --remove-orphans
NGINX_ID=$(docker compose --env-file .env ps -q nginx)
if [ -z "$NGINX_ID" ] || [ "$(docker inspect -f '{{.State.Running}}' $NGINX_ID 2>/dev/null)" != "true" ]; then
  echo 'nginx is not running, starting it...'
  docker compose --env-file .env up -d nginx
fi
docker compose --env-file .env up -d
'@
$remoteCmd = $remoteCmdTemplate.Replace('__REMOTE_DIR__', $RemoteDir).Replace("`r", '')
Invoke-NativeChecked -Description "Start docker compose services" -Command {
    ssh @sshOptions -i $SshKeyPath -p $SshPort "$User@$ServerHost" $remoteCmd
}

Write-Host "[6/6] Requesting/refreshing Let's Encrypt certificate (requires DNS -> Lightsail IP)"
$certInitCmd = "cd $RemoteDir && docker compose --env-file .env --profile init run --rm certbot-init && docker compose --env-file .env exec -T nginx nginx -s reload"
try {
    Invoke-NativeChecked -Description "Initialize/renew Let's Encrypt certificate" -Command {
        ssh @sshOptions -i $SshKeyPath -p $SshPort "$User@$ServerHost" $certInitCmd
    }
}
catch {
    Write-Warning "Let's Encrypt init failed. Ensure DOMAIN_NAME points to this Lightsail instance, then rerun cert init manually."
}

Write-Host "[done] Current service status"
Invoke-NativeChecked -Description "Read compose service status" -Command {
    ssh @sshOptions -i $SshKeyPath -p $SshPort "$User@$ServerHost" "cd $RemoteDir && docker compose ps"
}

Write-Host "Deploy finished."

