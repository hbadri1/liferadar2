[CmdletBinding()]
param(
    [string]$ConfigFile = '',
    [string]$AppConfigFile = ''
)

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }
if (-not $ConfigFile) { $ConfigFile = Join-Path $ScriptDir '.env' }

. (Join-Path $ScriptDir 'common.ps1')
if (-not $AppConfigFile) { $AppConfigFile = Get-DefaultAppConfigFile }

& (Join-Path $ScriptDir 'ensure-ecr.ps1') -ConfigFile $ConfigFile
if ($LASTEXITCODE -ne 0) {
    throw 'ensure-ecr.ps1 failed.'
}

& (Join-Path $ScriptDir 'build-push-image.ps1') -ConfigFile $ConfigFile
if ($LASTEXITCODE -ne 0) {
    throw 'build-push-image.ps1 failed.'
}

& (Join-Path $ScriptDir 'deploy-ecs.ps1') -ConfigFile $ConfigFile -AppConfigFile $AppConfigFile
if ($LASTEXITCODE -ne 0) {
    throw 'deploy-ecs.ps1 failed.'
}
