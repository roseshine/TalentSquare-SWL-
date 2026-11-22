$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$secretFile = Join-Path $project 'backend/.runtime/facebook-live-test/credentials.clixml'
if (-not (Test-Path -LiteralPath $secretFile -PathType Leaf)) {
    throw 'Run setup_facebook_live_test.ps1 first. It will prompt for credentials without displaying them.'
}

$record = Import-Clixml -LiteralPath $secretFile
if ($record.PageId -ne '1450027621530622' -or $record.GraphVersion -ne 'v27.0') {
    throw 'The protected local test configuration does not match the single approved Page ID and Graph API version.'
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
    'FACEBOOK_TOKEN_KEY', 'FACEBOOK_ALLOWED_PAGE_IDS', 'FACEBOOK_PAGE_ACCESS_TOKEN'
)
$previousEnvironment = @{}
foreach ($name in $environmentNames) {
    $previousEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, [EnvironmentVariableTarget]::Process)
}
try {
    [Environment]::SetEnvironmentVariable('FACEBOOK_APP_ID', [string]$record.AppId, [EnvironmentVariableTarget]::Process)
    Set-ProcessSecretFromSecureString 'FACEBOOK_APP_SECRET' $record.AppSecret
    Set-ProcessSecretFromSecureString 'FACEBOOK_TOKEN_KEY' $record.TokenKey
    Set-ProcessSecretFromSecureString 'FACEBOOK_PAGE_ACCESS_TOKEN' $record.PageAccessToken
    [Environment]::SetEnvironmentVariable('FACEBOOK_GRAPH_VERSION', 'v27.0', [EnvironmentVariableTarget]::Process)
    [Environment]::SetEnvironmentVariable('FACEBOOK_ALLOWED_PAGE_IDS', '1450027621530622', [EnvironmentVariableTarget]::Process)

    Push-Location $project
    try {
        & python -B manage_local.py test discovery.test_facebook.FacebookFlowTests.test_controlled_live_talent_square_page_integration --noinput --verbosity 1
        $testExitCode = $LASTEXITCODE
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

if ($testExitCode -ne 0) { throw "The credential-gated Facebook integration test failed (exit code $testExitCode). Review its sanitized output; no token was printed." }
