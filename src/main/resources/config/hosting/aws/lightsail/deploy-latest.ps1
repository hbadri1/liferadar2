<#
.SYNOPSIS
    Build image as "latest", push to ECR, then deploy to the Lightsail instance.

.DESCRIPTION
    Orchestrates the full pipeline in three steps:
      1. Build the Spring Boot Docker image with tag "latest" via Maven / Jib
         and push it to ECR  (delegates to 1-build-push-image.ps1)
      2. Patch APP_IMAGE in .env to point at the "latest" tag
      3. Upload compose files + .env to the Lightsail instance and start
         all containers  (delegates to 3-deploy-lightsail.ps1)

.PARAMETER ServerHost
    Public IP or hostname of the Lightsail instance.
    Defaults to the known static IP: 63.180.243.80

.PARAMETER SshKeyPath
    Path to the .pem SSH private key.
    Defaults to liferadar-lightsail01.pem in this directory.

.PARAMETER User
    SSH user on the remote host.  Default: ec2-user

.PARAMETER SshPort
    SSH port.  Default: 22

.PARAMETER RemoteDir
    Working directory on the remote host.  Default: /opt/liferadar

.EXAMPLE
    # Use all defaults (IP + key bundled in this directory)
    ./deploy-latest.ps1

.EXAMPLE
    # Override the server host
    ./deploy-latest.ps1 -ServerHost 203.0.113.42
#>
[CmdletBinding()]
param(
    [string]$ServerHost = '3.126.92.141',
    [string]$SshKeyPath = '',
    [string]$User       = 'ec2-user',
    [int]   $SshPort    = 22,
    [string]$RemoteDir  = '/opt/liferadar'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }

# Default SSH key is in the same directory as this script
if (-not $SshKeyPath) {
    $SshKeyPath = Join-Path $ScriptDir 'liferadar-lightsail01.pem'
}

$envFile            = Join-Path $ScriptDir '.env'
$buildScript        = Join-Path $ScriptDir '1-build-push-image.ps1'
$deployScript       = Join-Path $ScriptDir '3-deploy-lightsail.ps1'

# ── Sanity checks ─────────────────────────────────────────────────────────────
foreach ($f in @($envFile, $buildScript, $deployScript, $SshKeyPath)) {
    if (-not (Test-Path -LiteralPath $f)) {
        throw "Required file not found: $f"
    }
}

# ── STEP 1 – Build + push image as "latest" ───────────────────────────────────
Write-Host ''
Write-Host '════════════════════════════════════════════════════════════════'
Write-Host ' STEP 1/3  Build & push Docker image  (tag: latest)'
Write-Host '════════════════════════════════════════════════════════════════'

$imageUri = & $buildScript -ConfigFile $envFile -ImageTag 'latest'
if ($LASTEXITCODE -ne 0) {
    throw 'Build/push step failed.'
}
$imageUri = ($imageUri | Select-Object -Last 1).Trim()
Write-Host "Image pushed: $imageUri"

# ── STEP 2 – Patch APP_IMAGE in .env ──────────────────────────────────────────
Write-Host ''
Write-Host '════════════════════════════════════════════════════════════════'
Write-Host " STEP 2/3  Updating APP_IMAGE in .env -> $imageUri"
Write-Host '════════════════════════════════════════════════════════════════'

$envContent = Get-Content -LiteralPath $envFile -Raw

if ($envContent -match '(?m)^APP_IMAGE=.*$') {
    $envContent = $envContent -replace '(?m)^APP_IMAGE=.*$', "APP_IMAGE=$imageUri"
} else {
    $envContent += "`nAPP_IMAGE=$imageUri`n"
}

# Also keep IMAGE_TAG in sync
$envContent = $envContent -replace '(?m)^IMAGE_TAG=.*$', 'IMAGE_TAG=latest'

Set-Content -LiteralPath $envFile -Value $envContent -NoNewline
Write-Host ".env updated."

# ── STEP 3 – Deploy to Lightsail ──────────────────────────────────────────────
Write-Host ''
Write-Host '════════════════════════════════════════════════════════════════'
Write-Host " STEP 3/3  Deploying to Lightsail  ($ServerHost)"
Write-Host '════════════════════════════════════════════════════════════════'

& $deployScript `
    -ServerHost $ServerHost `
    -SshKeyPath $SshKeyPath `
    -User       $User `
    -SshPort    $SshPort `
    -RemoteDir  $RemoteDir

if ($LASTEXITCODE -ne 0) {
    throw 'Deploy step failed.'
}

Write-Host ''
Write-Host '════════════════════════════════════════════════════════════════'
Write-Host ' All done.  liferadar:latest is live on Lightsail.'
Write-Host '════════════════════════════════════════════════════════════════'

