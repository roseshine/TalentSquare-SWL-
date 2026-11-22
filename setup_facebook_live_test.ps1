$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$secretDirectory = Join-Path $project 'backend/.runtime/facebook-live-test'
$secretFile = Join-Path $secretDirectory 'credentials.clixml'

$appId = Read-Host 'Meta App ID (numeric; not a secret)'
if ($appId -notmatch '^[0-9]+$') { throw 'The Meta App ID must contain only digits.' }
$appSecret = Read-Host 'Meta App Secret (input is hidden)' -AsSecureString
$pageToken = Read-Host 'Authorized Page Access Token for Talent Square Page 1450027621530622 (input is hidden)' -AsSecureString

$oldPythonPath = $env:PYTHONPATH
$dependencyPath = Join-Path $project 'backend/.venv/Lib/site-packages'
$backendPath = Join-Path $project 'backend'
try {
    $env:PYTHONPATH = @($dependencyPath, $backendPath) -join ';'
    $keyText = (& python -B -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())' | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or $keyText -notmatch '^[A-Za-z0-9_-]{43}=$') {
        throw 'Could not generate a valid Fernet key with this Python environment.'
    }
    $keySecure = ConvertTo-SecureString -String $keyText -AsPlainText -Force
    $keyText = $null

    [System.IO.Directory]::CreateDirectory($secretDirectory) | Out-Null
    $record = [PSCustomObject]@{
        AppId = $appId
        AppSecret = $appSecret
        PageAccessToken = $pageToken
        TokenKey = $keySecure
        PageId = '1450027621530622'
        GraphVersion = 'v27.0'
    }
    $record | Export-Clixml -LiteralPath $secretFile
    Write-Output 'Local test credentials saved encrypted with Windows DPAPI for this Windows account.'
    Write-Output 'The file is under backend/.runtime/, which is ignored by Git. No credential value was printed.'
}
finally {
    $appId = $null
    $keyText = $null
    if ($null -ne $appSecret) { $appSecret.Dispose() }
    if ($null -ne $pageToken) { $pageToken.Dispose() }
    if ($null -ne $keySecure) { $keySecure.Dispose() }
    if ($null -eq $oldPythonPath) { Remove-Item Env:PYTHONPATH -ErrorAction SilentlyContinue }
    else { $env:PYTHONPATH = $oldPythonPath }
}
