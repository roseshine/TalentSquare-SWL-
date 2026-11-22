$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$secretFile = Join-Path $project 'backend/.runtime/facebook-live-test/credentials.clixml'
if (-not (Test-Path -LiteralPath $secretFile -PathType Leaf)) {
    throw 'Run setup_facebook_live_test.ps1 first. It stores credentials encrypted for this Windows account.'
}

$listeners = Get-NetTCPConnection -State Listen -LocalPort 8001 -ErrorAction SilentlyContinue
$existingServers = Get-CimInstance Win32_Process -Filter "Name = 'python.exe'" | Where-Object { $_.CommandLine -match 'manage_local\.py runserver' }
if ($listeners -or $existingServers) {
    $processIds = @($listeners | Select-Object -ExpandProperty OwningProcess -Unique) + @($existingServers | Select-Object -ExpandProperty ProcessId -Unique)
    $processIds = $processIds | Where-Object { $_ } | Select-Object -Unique
    throw "A Django server or listener is already present (PID(s): $($processIds -join ', ')). Verify which local Django process owns it, stop that process yourself, then rerun this launcher. No process was stopped."
}

$record = Import-Clixml -LiteralPath $secretFile
if ($record.PageId -ne '1450027621530622' -or $record.GraphVersion -ne 'v27.0') {
    throw 'The protected local configuration does not match the one authorized Page and Graph API version.'
}

function Set-ProcessSecretFromSecureString {
    param([Parameter(Mandatory=$true)][string]$Name, [Parameter(Mandatory=$true)][System.Security.SecureString]$Value)
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
    try {
        $plainValue = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
        [Environment]::SetEnvironmentVariable($Name, $plainValue, [EnvironmentVariableTarget]::Process)
        $plainValue = $null
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

$environmentNames = @(
    'FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'FACEBOOK_GRAPH_VERSION',
    'FACEBOOK_TOKEN_KEY', 'FACEBOOK_ALLOWED_PAGE_IDS',
    'FACEBOOK_REDIRECT_URI', 'FACEBOOK_FRONTEND_RETURN_URL'
)
$previousEnvironment = @{}
foreach ($name in $environmentNames) {
    $previousEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, [EnvironmentVariableTarget]::Process)
}
try {
    [Environment]::SetEnvironmentVariable('FACEBOOK_APP_ID', [string]$record.AppId, [EnvironmentVariableTarget]::Process)
    Set-ProcessSecretFromSecureString 'FACEBOOK_APP_SECRET' $record.AppSecret
    Set-ProcessSecretFromSecureString 'FACEBOOK_TOKEN_KEY' $record.TokenKey
    [Environment]::SetEnvironmentVariable('FACEBOOK_GRAPH_VERSION', 'v27.0', [EnvironmentVariableTarget]::Process)
    [Environment]::SetEnvironmentVariable('FACEBOOK_ALLOWED_PAGE_IDS', '1450027621530622', [EnvironmentVariableTarget]::Process)
    [Environment]::SetEnvironmentVariable('FACEBOOK_REDIRECT_URI', 'http://127.0.0.1:8001/api/discovery/facebook/callback/', [EnvironmentVariableTarget]::Process)
    [Environment]::SetEnvironmentVariable('FACEBOOK_FRONTEND_RETURN_URL', 'http://127.0.0.1:8000/admin?tab=live-imports', [EnvironmentVariableTarget]::Process)

    Push-Location $project
    try {
        Write-Output 'Starting Django with Facebook credentials injected only into this process. The Page token is not injected; connect through the OAuth UI.'
        & python -B manage_local.py runserver 127.0.0.1:8001 --noreload
        $serverExitCode = $LASTEXITCODE
    }
    finally {
        Pop-Location
    }
}
finally {
    foreach ($name in $environmentNames) {
        [Environment]::SetEnvironmentVariable($name, $previousEnvironment[$name], [EnvironmentVariableTarget]::Process)
    }
    foreach ($property in @('AppSecret', 'PageAccessToken', 'TokenKey')) {
        if ($record.$property -is [System.Security.SecureString]) { $record.$property.Dispose() }
    }
    $record = $null
}

if ($serverExitCode -ne 0) { throw "Django exited with code $serverExitCode." }
