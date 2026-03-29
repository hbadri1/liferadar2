Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Ensure-Command {
    param([Parameter(Mandatory = $true)][string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command not found: ${Name}"
    }
}

# Runs an aws command whose non-zero exit code is expected (e.g. existence probes).
# Returns $true if the command exited 0, $false otherwise.
# Never throws on non-zero exit, never leaks stderr.
function Invoke-AwsProbe {
    param([Parameter(Mandatory = $true, ValueFromRemainingArguments = $true)][string[]]$Arguments)

    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        aws @Arguments 2>&1 | Out-Null
        return ($LASTEXITCODE -eq 0)
    } finally {
        $ErrorActionPreference = $prev
    }
}

# Reads optional credential-related keys from the config hashtable and applies
# them as process-level environment variables so that every subsequent aws call
# in this session picks them up automatically.
#
# Supported .env keys (all optional):
#   AWS_PROFILE            – named profile from ~/.aws/config  (e.g. "default", "myprofile")
#   AWS_ACCESS_KEY_ID      – static access key
#   AWS_SECRET_ACCESS_KEY  – static secret key
#   AWS_SESSION_TOKEN      – session token (for temporary credentials / STS assume-role)
function Apply-AwsCredentials {
    param([Parameter(Mandatory = $true)][hashtable]$Config)

    $credKeys = @('AWS_PROFILE', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN')
    foreach ($key in $credKeys) {
        $val = Get-ConfigValue -Config $Config -Name $key
        if ($val) {
            [System.Environment]::SetEnvironmentVariable($key, $val, 'Process')
            Write-Verbose "Applied credential env var: $key"
        }
    }
}

# Calls aws sts get-caller-identity and throws a friendly message if it fails.
# Call this once early in each script, after Apply-AwsCredentials.
function Assert-AwsCredentials {
    param([Parameter(Mandatory = $true)][string]$Region)

    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $out = aws sts get-caller-identity --region $Region 2>&1
    $ok  = $LASTEXITCODE -eq 0
    $ErrorActionPreference = $prev

    if (-not $ok) {
        Write-Host ''
        Write-Host '=== AWS CREDENTIALS NOT FOUND ===' -ForegroundColor Red
        Write-Host 'Options to fix this:' -ForegroundColor Yellow
        Write-Host '  1) Run "aws configure" to set up a default profile (Access Key + Secret).'
        Write-Host '  2) Run "aws configure sso" then "aws sso login --profile <name>"'
        Write-Host '     and set AWS_PROFILE=<name> in your .env file.'
        Write-Host '  3) Add AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY (+ optionally AWS_SESSION_TOKEN)'
        Write-Host '     directly in your .env file.'
        Write-Host ''
        throw 'AWS credentials not found. See instructions above.'
    }

    Write-Host "AWS identity verified: $($out | ConvertFrom-Json | Select-Object -ExpandProperty Arn)" -ForegroundColor Green
}


function Import-DeploymentConfig {
    param([Parameter(Mandatory = $true)][string]$ConfigFile)

    if (-not (Test-Path -LiteralPath $ConfigFile)) {
        throw "Config file not found: ${ConfigFile}"
    }

    $config = @{}
    foreach ($rawLine in Get-Content -LiteralPath $ConfigFile) {
        $line = $rawLine.Trim()
        if (-not $line -or $line.StartsWith('#')) {
            continue
        }

        $parts = $line -split '=', 2
        if ($parts.Count -ne 2) {
            throw "Invalid config line in ${ConfigFile}: ${rawLine}"
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

function Merge-DeploymentConfig {
    param(
        [Parameter(Mandatory = $true)][hashtable]$BaseConfig,
        [Parameter(Mandatory = $true)][hashtable]$OverrideConfig
    )

    $merged = @{}
    foreach ($key in $BaseConfig.Keys) {
        $merged[$key] = $BaseConfig[$key]
    }

    foreach ($key in $OverrideConfig.Keys) {
        $merged[$key] = $OverrideConfig[$key]
    }

    return $merged
}

function Import-CombinedDeploymentConfig {
    param(
        [Parameter(Mandatory = $true)][string]$HostingConfigFile,
        [string]$AppConfigFile = ''
    )

    $hostingConfig = Import-DeploymentConfig -ConfigFile $HostingConfigFile
    if (-not $AppConfigFile) {
        return $hostingConfig
    }

    if (-not (Test-Path -LiteralPath $AppConfigFile)) {
        Write-Warning "App config file not found: ${AppConfigFile}"
        Write-Warning "Copy src/main/resources/config/.env/.env.prod.example to .env.prod and fill in real values."
        Write-Warning "Continuing with hosting config only – task definition env vars may be incomplete."
        return $hostingConfig
    }

    $appConfig = Import-DeploymentConfig -ConfigFile $AppConfigFile
    return Merge-DeploymentConfig -BaseConfig $hostingConfig -OverrideConfig $appConfig
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

function Get-ProjectRoot {
    # common.ps1 lives at src/main/resources/config/hosting/aws/ecs/ → go up 7 levels
    #   ecs → aws → hosting → config → resources → main → src → <project-root>
    $commonDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.ScriptName }
    return (Resolve-Path (Join-Path $commonDir '..\..\..\..\..\..\..')).Path
}

function Get-DefaultAppConfigFile {
    $projectRoot = Get-ProjectRoot
    return (Join-Path $projectRoot 'src\main\resources\config\.env\.env.prod')
}

function Get-MavenWrapperPath {
    $projectRoot = Get-ProjectRoot
    $mavenWrapper = Join-Path $projectRoot 'mvnw.cmd'
    if (-not (Test-Path -LiteralPath $mavenWrapper)) {
        throw "mvnw.cmd not found at $mavenWrapper"
    }

    return $mavenWrapper
}

function Get-AwsAccountId {
    param([Parameter(Mandatory = $true)][string]$Region)

    Ensure-Command -Name 'aws'
    $accountRaw = aws sts get-caller-identity --query Account --output text --region $Region 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $accountRaw) {
        throw 'Unable to resolve AWS account id from AWS CLI. Set AWS_ACCOUNT_ID in .env or run aws configure.'
    }

    $accountId = $accountRaw.Trim()

    return $accountId
}

function Get-EcrRepositoryUri {
    param([Parameter(Mandatory = $true)][hashtable]$Config)

    $region = Get-RequiredConfigValue -Config $Config -Name 'AWS_REGION'
    $accountId = Get-ConfigValue -Config $Config -Name 'AWS_ACCOUNT_ID'
    if (-not $accountId) {
        $accountId = Get-AwsAccountId -Region $region
    }

    $repository = Get-RequiredConfigValue -Config $Config -Name 'ECR_REPOSITORY'
    return "$accountId.dkr.ecr.$region.amazonaws.com/$repository"
}

function Get-ImageUri {
    param([Parameter(Mandatory = $true)][hashtable]$Config)

    $repositoryUri = Get-EcrRepositoryUri -Config $Config
    $imageTag = Get-RequiredConfigValue -Config $Config -Name 'IMAGE_TAG'
    return "$repositoryUri`:$imageTag"
}

function ConvertTo-QuotedList {
    param([Parameter(Mandatory = $true)][string]$Value)

    $items = $Value.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ }
    if (-not $items) {
        throw 'Expected a comma-separated list with at least one value.'
    }

    return ($items | ForEach-Object { '"{0}"' -f $_ }) -join ','
}

