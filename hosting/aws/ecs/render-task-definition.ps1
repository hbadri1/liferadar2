[CmdletBinding()]
param(
    [string]$ConfigFile = '',
    [string]$TemplateFile = '',
    [string]$OutFile = ''
)

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }
if (-not $ConfigFile)  { $ConfigFile  = Join-Path $ScriptDir '.env' }
if (-not $TemplateFile){ $TemplateFile = Join-Path $ScriptDir 'task-definition.template.json' }
if (-not $OutFile)     { $OutFile      = Join-Path $ScriptDir 'task-definition.rendered.json' }

. (Join-Path $ScriptDir 'common.ps1')

$config = Import-DeploymentConfig -ConfigFile $ConfigFile
$imageUri = Get-ImageUri -Config $config
$template = Get-Content -LiteralPath $TemplateFile -Raw

function Set-JsonStringToken {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Token,
        [Parameter(Mandatory = $true)][string]$Value
    )

    return $Content.Replace('"' + $Token + '"', (ConvertTo-Json $Value -Compress))
}

function Set-RawToken {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Token,
        [Parameter(Mandatory = $true)][string]$Value
    )

    return $Content.Replace($Token, $Value)
}

$template = Set-JsonStringToken -Content $template -Token '__ECS_TASK_FAMILY__' -Value (Get-RequiredConfigValue -Config $config -Name 'ECS_TASK_FAMILY')
$template = Set-JsonStringToken -Content $template -Token '__APP_NAME__' -Value (Get-ConfigValue -Config $config -Name 'APP_NAME' -DefaultValue 'liferadar')
$template = Set-JsonStringToken -Content $template -Token '__IMAGE_URI__' -Value $imageUri
$template = Set-JsonStringToken -Content $template -Token '__ECS_CPU__' -Value (Get-ConfigValue -Config $config -Name 'ECS_CPU' -DefaultValue '1024')
$template = Set-JsonStringToken -Content $template -Token '__ECS_MEMORY__' -Value (Get-ConfigValue -Config $config -Name 'ECS_MEMORY' -DefaultValue '2048')
$template = Set-JsonStringToken -Content $template -Token '__ECS_EXECUTION_ROLE_ARN__' -Value (Get-RequiredConfigValue -Config $config -Name 'ECS_EXECUTION_ROLE_ARN')
$template = Set-JsonStringToken -Content $template -Token '__ECS_TASK_ROLE_ARN__' -Value (Get-RequiredConfigValue -Config $config -Name 'ECS_TASK_ROLE_ARN')
$template = Set-RawToken -Content $template -Token '__CONTAINER_PORT__' -Value (Get-ConfigValue -Config $config -Name 'CONTAINER_PORT' -DefaultValue '8080')
$template = Set-JsonStringToken -Content $template -Token '__SPRING_PROFILES_ACTIVE__' -Value (Get-ConfigValue -Config $config -Name 'SPRING_PROFILES_ACTIVE' -DefaultValue 'prod')
$template = Set-JsonStringToken -Content $template -Token '__DB_URL__' -Value (Get-RequiredConfigValue -Config $config -Name 'DB_URL')
$template = Set-JsonStringToken -Content $template -Token '__DB_USERNAME__' -Value (Get-RequiredConfigValue -Config $config -Name 'DB_USERNAME')
$template = Set-JsonStringToken -Content $template -Token '__DB_PASSWORD__' -Value (Get-RequiredConfigValue -Config $config -Name 'DB_PASSWORD')
$template = Set-JsonStringToken -Content $template -Token '__SPRING_MAIL_PASSWORD__' -Value (Get-RequiredConfigValue -Config $config -Name 'SPRING_MAIL_PASSWORD')
$template = Set-JsonStringToken -Content $template -Token '__JWT_BASE64_SECRET__' -Value (Get-RequiredConfigValue -Config $config -Name 'JWT_BASE64_SECRET')
$template = Set-JsonStringToken -Content $template -Token '__JHIPSTER_SLEEP__' -Value (Get-ConfigValue -Config $config -Name 'JHIPSTER_SLEEP' -DefaultValue '0')
$template = Set-JsonStringToken -Content $template -Token '__LOG_GROUP_NAME__' -Value (Get-ConfigValue -Config $config -Name 'LOG_GROUP_NAME' -DefaultValue '/ecs/liferadar')
$template = Set-JsonStringToken -Content $template -Token '__AWS_REGION__' -Value (Get-RequiredConfigValue -Config $config -Name 'AWS_REGION')
$template = Set-JsonStringToken -Content $template -Token '__LOG_STREAM_PREFIX__' -Value (Get-ConfigValue -Config $config -Name 'LOG_STREAM_PREFIX' -DefaultValue 'ecs')

[System.IO.File]::WriteAllText($OutFile, $template, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Rendered task definition: $OutFile"
$OutFile

