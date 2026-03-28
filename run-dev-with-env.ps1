[CmdletBinding()]
param(
    [string]$EnvFile = '.env.dev.local',
    [string]$Profile = 'dev',
    [string]$MavenCommand = '.\\mvnw',
    [switch]$NoRun,
    [string]$CheckVar = 'SPRING_MAIL_PASSWORD'
)

if (-not (Test-Path -LiteralPath $EnvFile)) {
    throw "Env file not found: $EnvFile"
}

Get-Content -LiteralPath $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) {
        return
    }

    $idx = $line.IndexOf('=')
    if ($idx -lt 1) {
        return
    }

    $name = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1)

    # Remove wrapping single or double quotes if present.
    if ($value.Length -ge 2) {
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
    }

    [System.Environment]::SetEnvironmentVariable($name, $value, 'Process')
}

Write-Host "Loaded environment variables from $EnvFile"
if ([string]::IsNullOrWhiteSpace([System.Environment]::GetEnvironmentVariable($CheckVar, 'Process'))) {
    Write-Warning "$CheckVar is empty in current process"
} else {
    Write-Host "$CheckVar is set in current process"
}

if ($NoRun) {
    Write-Host "NoRun set; server start skipped."
    exit 0
}

Write-Host "Starting Spring Boot with profile '$Profile'..."

& $MavenCommand "-Dspring.profiles.active=$Profile"

