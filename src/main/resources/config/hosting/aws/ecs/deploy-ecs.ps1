[CmdletBinding()]
param(
    [string]$ConfigFile = '',
    [string]$AppConfigFile = ''
)

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }
if (-not $ConfigFile) { $ConfigFile = Join-Path $ScriptDir '.env' }

. (Join-Path $ScriptDir 'common.ps1')
if (-not $AppConfigFile) { $AppConfigFile = Get-DefaultAppConfigFile }

Ensure-Command -Name 'aws'
$config = Import-DeploymentConfig -ConfigFile $ConfigFile
$region = Get-RequiredConfigValue -Config $config -Name 'AWS_REGION'
$cluster = Get-RequiredConfigValue -Config $config -Name 'ECS_CLUSTER'
$service = Get-RequiredConfigValue -Config $config -Name 'ECS_SERVICE'
$desiredCount = Get-ConfigValue -Config $config -Name 'ECS_DESIRED_COUNT' -DefaultValue '1'
$assignPublicIp = Get-ConfigValue -Config $config -Name 'ECS_ASSIGN_PUBLIC_IP' -DefaultValue 'ENABLED'
$subnets = ConvertTo-QuotedList -Value (Get-RequiredConfigValue -Config $config -Name 'ECS_SUBNET_IDS')
$securityGroups = ConvertTo-QuotedList -Value (Get-RequiredConfigValue -Config $config -Name 'ECS_SECURITY_GROUP_IDS')
$logGroup = Get-ConfigValue -Config $config -Name 'LOG_GROUP_NAME' -DefaultValue '/ecs/liferadar'
$taskDefinitionFile = & (Join-Path $ScriptDir 'render-task-definition.ps1') -ConfigFile $ConfigFile -AppConfigFile $AppConfigFile

# --- ECS cluster ---
$clusterJson = aws ecs describe-clusters --clusters $cluster --region $region --output json | ConvertFrom-Json
if (-not $clusterJson.clusters -or $clusterJson.clusters[0].status -eq 'INACTIVE') {
    Write-Host "Creating ECS cluster $cluster..."
    aws ecs create-cluster --cluster-name $cluster --region $region | Out-Null
} else {
    Write-Host "ECS cluster exists: $cluster"
}

# --- CloudWatch log group ---
if (-not (Invoke-AwsProbe logs describe-log-groups --log-group-name-prefix $logGroup --region $region)) {
    throw 'Unable to query CloudWatch log groups.'
}
$logGroupExistsRaw = aws logs describe-log-groups --log-group-name-prefix $logGroup --region $region `
    --query "logGroups[?logGroupName=='$logGroup'].logGroupName" --output text
$logGroupExists = "{0}" -f $logGroupExistsRaw
$logGroupExists = $logGroupExists.Trim()
if (-not $logGroupExists) {
    Write-Host "Creating CloudWatch log group $logGroup..."
    aws logs create-log-group --log-group-name $logGroup --region $region | Out-Null
}

# --- Task definition ---
Write-Host 'Registering task definition...'
$taskRegistration = aws ecs register-task-definition --cli-input-json "file://$taskDefinitionFile" --region $region --output json | ConvertFrom-Json
$taskDefinitionArn = $taskRegistration.taskDefinition.taskDefinitionArn
if (-not $taskDefinitionArn) {
    throw 'Task definition registration failed.'
}

# --- ECS service ---
$networkConfiguration = "awsvpcConfiguration={subnets=[$subnets],securityGroups=[$securityGroups],assignPublicIp=$assignPublicIp}"
$serviceJson = aws ecs describe-services --cluster $cluster --services $service --region $region --output json | ConvertFrom-Json
$serviceExists = $serviceJson.services -and $serviceJson.services.Count -gt 0 -and $serviceJson.services[0].status -ne 'INACTIVE'

if (-not $serviceExists) {
    Write-Host "Creating ECS service $service..."
    aws ecs create-service --cluster $cluster --service-name $service `
        --task-definition $taskDefinitionArn --desired-count $desiredCount `
        --launch-type FARGATE --network-configuration $networkConfiguration `
        --region $region | Out-Null
} else {
    Write-Host "Updating ECS service $service..."
    aws ecs update-service --cluster $cluster --service $service `
        --task-definition $taskDefinitionArn --desired-count $desiredCount `
        --region $region | Out-Null
}

Write-Host 'Waiting for ECS service to stabilise...'
aws ecs wait services-stable --cluster $cluster --services $service --region $region
Write-Host "ECS service is stable: $service"

