[CmdletBinding()]
param(
    [string]$ConfigFile = '',
    [string]$ImageTag = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Ensure-Command {
    param([Parameter(Mandatory = $true)][string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command not found: ${Name}"
    }
}

function Import-DeploymentConfig {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Config file not found: ${Path}"
    }

    $config = @{}
    foreach ($rawLine in Get-Content -LiteralPath $Path) {
        $line = $rawLine.Trim()
        if (-not $line -or $line.StartsWith('#')) {
            continue
        }

        $parts = $line -split '=', 2
        if ($parts.Count -ne 2) {
            throw "Invalid config line in ${Path}: ${rawLine}"
        }

        $key = $parts[0].Trim()
        $value = $parts[1].Trim()
        if ($value.Length -ge 2) {
            if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
                $value = $value.Substring(1, $value.Length - 2)
            }
        }

        $config[$key] = $value
    }

    return $config
}

function Get-ConfigValue {
    param(
        [Parameter(Mandatory = $true)][hashtable]$Config,
        [Parameter(Mandatory = $true)][string]$Name,
        [string]$DefaultValue = ''
    )

    if ($Config.ContainsKey($Name) -and $null -ne $Config[$Name] -and $Config[$Name] -ne '') {
        return [string]$Config[$Name]
    }

    return $DefaultValue
}

function Get-RequiredConfigValue {
    param(
        [Parameter(Mandatory = $true)][hashtable]$Config,
        [Parameter(Mandatory = $true)][string]$Name
    )

    $value = Get-ConfigValue -Config $Config -Name $Name
    if (-not $value) {
        throw "Missing required config value: ${Name}"
    }

    return $value
}

function Apply-AwsCredentials {
    param([Parameter(Mandatory = $true)][hashtable]$Config)

    foreach ($key in @('AWS_PROFILE', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN')) {
        $val = Get-ConfigValue -Config $Config -Name $key
        if ($val) {
            [System.Environment]::SetEnvironmentVariable($key, $val, 'Process')
        }
    }
}

function Get-ProjectRoot {
    param([Parameter(Mandatory = $true)][string]$LightsailDir)

    return (Resolve-Path (Join-Path $LightsailDir '..\..\..\..\..\..\..')).Path
}

function Get-MavenWrapperPath {
    param([Parameter(Mandatory = $true)][string]$ProjectRoot)

    $mvn = Join-Path $ProjectRoot 'mvnw.cmd'
    if (-not (Test-Path -LiteralPath $mvn)) {
        throw "mvnw.cmd not found at $mvn"
    }

    return $mvn
}

function Get-AwsAccountId {
    param([Parameter(Mandatory = $true)][string]$Region)

    $accountRaw = aws sts get-caller-identity --query Account --output text --region $Region 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $accountRaw) {
        throw 'Unable to resolve AWS account id from AWS CLI. Set AWS_ACCOUNT_ID in your .env or run aws configure.'
    }

    return $accountRaw.Trim()
}

function Ensure-EcrRepository {
    param(
        [Parameter(Mandatory = $true)][string]$Repository,
        [Parameter(Mandatory = $true)][string]$Region
    )

    aws ecr describe-repositories --repository-names $Repository --region $Region 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "ECR repository exists: $Repository"
        return
    }

    Write-Host "Creating ECR repository: $Repository"
    aws ecr create-repository --repository-name $Repository --image-scanning-configuration scanOnPush=true --region $Region | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create ECR repository: $Repository"
    }
}

function Resolve-ImageTag {
    param(
        [string]$RequestedTag = '',
        [Parameter(Mandatory = $true)][hashtable]$Config
    )

    if ($RequestedTag) {
        return $RequestedTag
    }

    $configuredTag = Get-ConfigValue -Config $Config -Name 'IMAGE_TAG'
    if ($configuredTag) {
        return $configuredTag
    }

    $gitSha = ''
    try {
        $gitSha = (git rev-parse --short HEAD 2>$null).Trim()
    } catch {
        $gitSha = ''
    }

    $timestamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmss')
    if ($gitSha) {
        return "${timestamp}-${gitSha}"
    }

    return $timestamp
}

# $PSScriptRoot is not available in param() default values in WinPS 5.1
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }
if (-not $ConfigFile) { $ConfigFile = Join-Path $ScriptDir '.env' }

Ensure-Command -Name 'aws'
$config = Import-DeploymentConfig -Path $ConfigFile
$region = Get-RequiredConfigValue -Config $config -Name 'AWS_REGION'
$repository = Get-RequiredConfigValue -Config $config -Name 'ECR_REPOSITORY'

Apply-AwsCredentials -Config $config   # apply profile/keys from .env before any aws call

$resolvedImageTag = Resolve-ImageTag -RequestedTag $ImageTag -Config $config

$config['IMAGE_TAG'] = $resolvedImageTag
$accountId = Get-ConfigValue -Config $config -Name 'AWS_ACCOUNT_ID'
if (-not $accountId) {
    $accountId = Get-AwsAccountId -Region $region
}

$repositoryUri = "$accountId.dkr.ecr.$region.amazonaws.com/$repository"
$imageUri = "$repositoryUri`:$resolvedImageTag"
$projectRoot = Get-ProjectRoot -LightsailDir $ScriptDir
$mavenWrapper = Get-MavenWrapperPath -ProjectRoot $projectRoot

Ensure-EcrRepository -Repository $repository -Region $region

Write-Host 'Fetching ECR auth token...'
$ecrPassword = (aws ecr get-login-password --region $region).Trim()
if (-not $ecrPassword) {
    throw 'Unable to fetch ECR auth token.'
}

Push-Location $projectRoot
try {
    Write-Host "Building and pushing image: $imageUri"
    & $mavenWrapper '-Pprod' '-DskipTests' "-Djib.to.image=$imageUri" '-Djib.to.auth.username=AWS' "-Djib.to.auth.password=$ecrPassword" 'package' 'jib:build'
    if ($LASTEXITCODE -ne 0) {
        throw 'Maven/Jib image build failed.'
    }
} finally {
    Pop-Location
}

Write-Host "Image pushed: $imageUri"
Write-Output $imageUri

