[CmdletBinding()]
param([switch]$SelfTest, [switch]$UpdateAppCredentials)

$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$secretDirectory = Join-Path $project 'backend/.runtime/facebook-live-test'
$secretFile = Join-Path $secretDirectory 'credentials.clixml'
$pageId = '1450027621530622'
$graphVersion = 'v27.0'

function Convert-SecureStringToProcessValue {
    param([Parameter(Mandatory=$true)][System.Security.SecureString]$Value)
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
    try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

function Set-PrivateFileAcl {
    param([Parameter(Mandatory=$true)][string]$Path)
    $userSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
    $systemSid = New-Object System.Security.Principal.SecurityIdentifier([System.Security.Principal.WellKnownSidType]::LocalSystemSid, $null)
    $userGrant = '*{0}:(F)' -f $userSid.Value
    $systemGrant = '*{0}:(F)' -f $systemSid.Value
    & icacls.exe $Path /inheritance:r /grant:r $userGrant $systemGrant 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Could not restrict credential-file access to this Windows user and SYSTEM.' }
}

function Write-CredentialWithBackup {
    param(
        [Parameter(Mandatory=$true)][string]$Destination,
        [Parameter(Mandatory=$true)]$Record
    )
    $directory = Split-Path -Parent $Destination
    $suffix = [Guid]::NewGuid().ToString('N')
    $temporary = Join-Path $directory ('.credentials-' + $suffix + '.tmp')
    $backup = Join-Path $directory ('credentials.clixml.bak-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + $suffix)
    try {
        $stream = [System.IO.File]::Open($temporary, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
        $stream.Dispose()
        Set-PrivateFileAcl -Path $temporary
        $Record | Export-Clixml -LiteralPath $temporary -Depth 4 -Force
        if (-not (Test-Path -LiteralPath $Destination -PathType Leaf)) {
            throw 'The existing credential file disappeared; no credential was written.'
        }
        Set-PrivateFileAcl -Path $Destination
        [System.IO.File]::Replace($temporary, $Destination, $backup, $true)
        return $backup
    }
    finally {
        if (Test-Path -LiteralPath $temporary -PathType Leaf) {
            Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue
        }
    }
}

function Get-TestPlaintext {
    param([Parameter(Mandatory=$true)][System.Security.SecureString]$Value)
    Convert-SecureStringToProcessValue -Value $Value
}

function Invoke-AppCredentialCheck {
    param(
        [Parameter(Mandatory=$true)][string]$AppId,
        [Parameter(Mandatory=$true)][System.Security.SecureString]$AppSecret
    )
    $names = @('FACEBOOK_VERIFY_APP_ID','FACEBOOK_VERIFY_APP_SECRET','FACEBOOK_VERIFY_GRAPH_VERSION')
    $previous = @{}
    foreach ($name in $names) { $previous[$name] = [Environment]::GetEnvironmentVariable($name, [EnvironmentVariableTarget]::Process) }
    try {
        [Environment]::SetEnvironmentVariable('FACEBOOK_VERIFY_APP_ID', $AppId, [EnvironmentVariableTarget]::Process)
        [Environment]::SetEnvironmentVariable('FACEBOOK_VERIFY_APP_SECRET', (Convert-SecureStringToProcessValue $AppSecret), [EnvironmentVariableTarget]::Process)
        [Environment]::SetEnvironmentVariable('FACEBOOK_VERIFY_GRAPH_VERSION', $graphVersion, [EnvironmentVariableTarget]::Process)
        Push-Location (Join-Path $project 'backend')
        try {
            $output = & python -B -m discovery.facebook_token_validation --check-app 2>$null
            $exitCode = $LASTEXITCODE
        }
        finally { Pop-Location }
        try { $result = (($output -join "`n") | ConvertFrom-Json) }
        catch { throw 'App validation returned no safe structured result. The credential file was not changed.' }
        $result | Add-Member -NotePropertyName ValidatorExitCode -NotePropertyValue $exitCode -Force
        return $result
    }
    finally {
        foreach ($name in $names) { [Environment]::SetEnvironmentVariable($name, $previous[$name], [EnvironmentVariableTarget]::Process) }
    }
}

function Write-SafeValidationFailure {
    param([Parameter(Mandatory=$true)]$Result)
    if ($Result.diagnostic) {
        $d = $Result.diagnostic
        Write-Output ('Meta validation failed safely: stage={0}; status={1}; type={2}; code={3}; subcode={4}; category={5}; endpoint={6}; trace_id={7}.' -f `
            $d.stage, $d.status, $d.type, $d.code, $d.subcode, $d.category, $d.endpoint, $d.trace_id)
    }
    else { Write-Output ('Meta validation stopped safely: stage={0}; category={1}.' -f $Result.stage, $Result.category) }
    if ($Result.safe_details) {
        $s = $Result.safe_details
        Write-Output ('Safe token metadata: type={0}; valid={1}; app_id_matches={2}; app_name_matches={3}; page_profile_matches={4}; user_id_present={5}; required_scopes_present={6}; scopes={7}.' -f `
            $s.token_type, $s.token_valid, $s.app_id_matches, $s.application_matches, $s.page_profile_matches, $s.user_id_present, $s.required_scopes_present, ($s.scopes -join ', '))
    }
}

function Invoke-AtomicStorageSelfTest {
    $tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
    $fixtureDirectory = Join-Path $tempRoot ('.facebook-token-update-selftest-' + [Guid]::NewGuid().ToString('N'))
    [System.IO.Directory]::CreateDirectory($fixtureDirectory) | Out-Null
    $destination = Join-Path $fixtureDirectory 'credentials.clixml'
    $oldToken = ConvertTo-SecureString 'fixture-old-page-token' -AsPlainText -Force
    $newToken = ConvertTo-SecureString 'fixture-new-page-token' -AsPlainText -Force
    $appSecret = ConvertTo-SecureString 'fixture-app-secret' -AsPlainText -Force
    $tokenKey = ConvertTo-SecureString 'fixture-fernet-key' -AsPlainText -Force
    $oldRecord = [PSCustomObject]@{AppId='1234567890123456';AppSecret=$appSecret;PageAccessToken=$oldToken;TokenKey=$tokenKey;PageId=$pageId;GraphVersion=$graphVersion}
    $newRecord = [PSCustomObject]@{AppId=$oldRecord.AppId;AppSecret=$oldRecord.AppSecret;PageAccessToken=$newToken;TokenKey=$oldRecord.TokenKey;PageId=$oldRecord.PageId;GraphVersion=$oldRecord.GraphVersion}
    try {
        $oldRecord | Export-Clixml -LiteralPath $destination -Depth 4
        Set-PrivateFileAcl -Path $destination
        $backup = Write-CredentialWithBackup -Destination $destination -Record $newRecord
        $saved = Import-Clixml -LiteralPath $destination
        $rolledBack = Import-Clixml -LiteralPath $backup
        if ((Get-TestPlaintext $saved.PageAccessToken) -ne 'fixture-new-page-token' -or
            (Get-TestPlaintext $rolledBack.PageAccessToken) -ne 'fixture-old-page-token' -or
            $saved.AppId -ne '1234567890123456' -or
            (Get-TestPlaintext $saved.AppSecret) -ne 'fixture-app-secret' -or
            (Get-TestPlaintext $saved.TokenKey) -ne 'fixture-fernet-key') {
            throw 'The non-secret atomic replacement fixture did not preserve and replace the expected fields.'
        }
        foreach ($loaded in @($saved, $rolledBack)) {
            foreach ($property in @('AppSecret','PageAccessToken','TokenKey')) {
                if ($loaded.$property -is [System.Security.SecureString]) { $loaded.$property.Dispose() }
            }
        }
        Write-Output 'Offline fixture self-test passed: DPAPI round-trip, field preservation, atomic replacement, and rollback backup.'
    }
    finally {
        foreach ($property in @('AppSecret','PageAccessToken','TokenKey')) {
            if ($oldRecord.$property -is [System.Security.SecureString]) { $oldRecord.$property.Dispose() }
        }
        if ($newToken -is [System.Security.SecureString]) { $newToken.Dispose() }
        $resolvedTemp = [System.IO.Path]::GetFullPath($tempRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
        $resolvedFixture = [System.IO.Path]::GetFullPath($fixtureDirectory)
        if ($resolvedFixture.StartsWith($resolvedTemp, [StringComparison]::OrdinalIgnoreCase) -and
            (Split-Path -Leaf $resolvedFixture) -like '.facebook-token-update-selftest-*') {
            Get-ChildItem -LiteralPath $resolvedFixture -Force -File -ErrorAction SilentlyContinue | Remove-Item -Force
            Remove-Item -LiteralPath $resolvedFixture -Force -ErrorAction SilentlyContinue
        }
    }
}

if ($SelfTest) {
    Invoke-AtomicStorageSelfTest
    Push-Location (Join-Path $project 'backend')
    try {
        $fixtureOutput = & python -B -m discovery.facebook_token_validation --self-test 2>$null
        if ($LASTEXITCODE -ne 0) { throw 'The offline Meta diagnostic fixture self-test failed.' }
        $fixtureResult = (($fixtureOutput -join "`n") | ConvertFrom-Json)
        if (-not $fixtureResult.ok -or $fixtureResult.secret_values_emitted) {
            throw 'The offline Meta diagnostic fixture self-test failed.'
        }
        Write-Output 'Offline Meta diagnostic fixture self-test passed: safe fields only.'
    }
    finally { Pop-Location }
    exit 0
}

if (-not (Test-Path -LiteralPath $secretFile -PathType Leaf)) {
    throw 'The existing DPAPI credential file is missing. No credential was written.'
}

$record = Import-Clixml -LiteralPath $secretFile
$replacementToken = $null
$candidateAppSecret = $null
$candidateAppId = $null
$validationRecord = $null
$environmentNames = @(
    'FACEBOOK_VERIFY_APP_ID', 'FACEBOOK_VERIFY_APP_SECRET',
    'FACEBOOK_VERIFY_PAGE_TOKEN', 'FACEBOOK_VERIFY_GRAPH_VERSION'
)
$previousEnvironment = @{}
foreach ($name in $environmentNames) {
    $previousEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, [EnvironmentVariableTarget]::Process)
}

try {
    if ([string]$record.PageId -ne $pageId -or [string]$record.GraphVersion -ne $graphVersion -or
        [string]$record.AppId -notmatch '^[0-9]+$' -or
        $record.AppSecret -isnot [System.Security.SecureString] -or
        $record.PageAccessToken -isnot [System.Security.SecureString] -or
        $record.TokenKey -isnot [System.Security.SecureString]) {
        throw 'The stored configuration is incomplete or does not match the approved App/Page/version. It was not changed.'
    }

    if ($UpdateAppCredentials) {
        $candidateAppId = Read-Host 'Meta App ID for the intended Talent Square application'
        if ($candidateAppId -notmatch '^[0-9]+$') { throw 'The App ID must contain only digits. The credential file was not changed.' }
        $candidateAppSecret = Read-Host 'Meta App Secret for the intended Talent Square application (input is hidden)' -AsSecureString
        if ($candidateAppSecret.Length -lt 16) { throw 'The hidden App Secret input is too short. The credential file was not changed.' }
        $appCheck = Invoke-AppCredentialCheck -AppId $candidateAppId -AppSecret $candidateAppSecret
        if ($appCheck.ValidatorExitCode -ne 0 -or -not $appCheck.ok) {
            Write-SafeValidationFailure -Result $appCheck
            throw 'App credentials were not accepted as the Talent Square application. The previous DPAPI file remains unchanged.'
        }
        $appRecord = [PSCustomObject]@{
            AppId = $candidateAppId
            AppSecret = $candidateAppSecret
            PageAccessToken = $record.PageAccessToken
            TokenKey = $record.TokenKey
            PageId = [string]$record.PageId
            GraphVersion = [string]$record.GraphVersion
        }
        $appBackup = Write-CredentialWithBackup -Destination $secretFile -Record $appRecord
        Write-Output ('Verified Meta application: {0}. App ID/App Secret updated securely; Page token and Fernet key preserved.' -f $appCheck.app_name)
        Write-Output ('Encrypted rollback backup retained at: {0}' -f $appBackup)
        Write-Output 'Run this script again without -UpdateAppCredentials to validate and store the replacement Page token.'
        return
    }

    $replacementToken = Read-Host 'Replacement Page Access Token for Talent Square (input is hidden)' -AsSecureString
    if ($replacementToken.Length -lt 20) {
        throw 'The hidden token input is too short to be a valid Page Access Token. The existing credential was not changed.'
    }

    [Environment]::SetEnvironmentVariable('FACEBOOK_VERIFY_APP_ID', [string]$record.AppId, [EnvironmentVariableTarget]::Process)
    [Environment]::SetEnvironmentVariable('FACEBOOK_VERIFY_APP_SECRET', (Convert-SecureStringToProcessValue $record.AppSecret), [EnvironmentVariableTarget]::Process)
    [Environment]::SetEnvironmentVariable('FACEBOOK_VERIFY_PAGE_TOKEN', (Convert-SecureStringToProcessValue $replacementToken), [EnvironmentVariableTarget]::Process)
    [Environment]::SetEnvironmentVariable('FACEBOOK_VERIFY_GRAPH_VERSION', $graphVersion, [EnvironmentVariableTarget]::Process)

    Push-Location (Join-Path $project 'backend')
    try {
        $validationOutput = & python -B -m discovery.facebook_token_validation 2>$null
        $validationExitCode = $LASTEXITCODE
    }
    finally { Pop-Location }

    $validationText = $validationOutput -join "`n"
    try { $validationRecord = $validationText | ConvertFrom-Json }
    catch { throw 'Meta validation did not return a safe structured result. The existing credential was not changed.' }
    if ($validationExitCode -ne 0 -or -not $validationRecord.ok) {
        Write-SafeValidationFailure -Result $validationRecord
        throw 'Replacement validation failed. The previous DPAPI credential file remains in place.'
    }

    Write-Output ('Validated app: {0}; token type: {1}; valid: {2}; expiry UTC: {3}.' -f $validationRecord.app_name, $validationRecord.token_type, $validationRecord.token_valid, $validationRecord.expires_at_utc)
    Write-Output ('Validated Page: {0} ({1}); Page read: {2}; required scopes present: {3}.' -f $validationRecord.page_name, $validationRecord.page_id, $validationRecord.page_read_task_verified, ($validationRecord.required_scopes_present -join ', '))
    Write-Output ('Known fictional post retrieved: {0}; confirmed fictional: {1}; fields: {2}.' -f $validationRecord.known_test_post_returned, $validationRecord.known_test_post_is_fictional, $validationRecord.post_fields)

    $replacementRecord = [PSCustomObject]@{
        AppId = [string]$record.AppId
        AppSecret = $record.AppSecret
        PageAccessToken = $replacementToken
        TokenKey = $record.TokenKey
        PageId = [string]$record.PageId
        GraphVersion = [string]$record.GraphVersion
    }
    $backupFile = Write-CredentialWithBackup -Destination $secretFile -Record $replacementRecord
    Write-Output 'Replacement token saved encrypted with Windows DPAPI for this Windows account. App ID, App Secret, and Fernet key were preserved.'
    Write-Output ('Encrypted rollback backup retained at: {0}' -f $backupFile)
    Write-Output 'Next run run_facebook_live_test.ps1 to complete the isolated Django verification.'
}
finally {
    foreach ($name in $environmentNames) {
        [Environment]::SetEnvironmentVariable($name, $previousEnvironment[$name], [EnvironmentVariableTarget]::Process)
    }
    foreach ($value in @($replacementToken, $record.AppSecret, $record.PageAccessToken, $record.TokenKey)) {
        if ($value -is [System.Security.SecureString]) { $value.Dispose() }
    }
    $replacementToken = $null
    $candidateAppSecret = $null
    $candidateAppId = $null
    $record = $null
    $validationRecord = $null
}
