[CmdletBinding()]
param(
    [string]$ConfigFile = ''
)

# $PSScriptRoot is not available in param() default values in WinPS 5.1
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }
if (-not $ConfigFile) { $ConfigFile = Join-Path $ScriptDir '.env' }

. (Join-Path $ScriptDir 'common.ps1')

Ensure-Command -Name 'aws'
$config = Import-DeploymentConfig -ConfigFile $ConfigFile
$region = Get-RequiredConfigValue -Config $config -Name 'AWS_REGION'

Apply-AwsCredentials -Config $config   # apply profile/keys from .env before any aws call

$imageUri = Get-ImageUri -Config $config
$mavenWrapper = Get-MavenWrapperPath
$projectRoot = Get-ProjectRoot

& (Join-Path $ScriptDir 'ensure-ecr.ps1') -ConfigFile $ConfigFile

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

