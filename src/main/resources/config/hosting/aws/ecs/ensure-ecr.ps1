[CmdletBinding()]
param(
    [string]$ConfigFile = ''
)

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }
if (-not $ConfigFile) { $ConfigFile = Join-Path $ScriptDir '.env' }

. (Join-Path $ScriptDir 'common.ps1')

Ensure-Command -Name 'aws'
$config = Import-DeploymentConfig -ConfigFile $ConfigFile
$region = Get-RequiredConfigValue -Config $config -Name 'AWS_REGION'

Apply-AwsCredentials -Config $config
Assert-AwsCredentials -Region $region

$repository = Get-RequiredConfigValue -Config $config -Name 'ECR_REPOSITORY'
$repositoryUri = Get-EcrRepositoryUri -Config $config

if (Invoke-AwsProbe ecr describe-repositories --repository-names $repository --region $region) {
    Write-Host "ECR repository already exists: $repository"
} else {
    Write-Host "Creating ECR repository $repository in $region..."
    aws ecr create-repository --repository-name $repository --image-scanning-configuration scanOnPush=true --region $region | Out-Null
}

Write-Host "ECR URI: $repositoryUri"
