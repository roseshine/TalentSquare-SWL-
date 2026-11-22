param([switch]$SelfTest, [switch]$RealPilot, [switch]$OAuthPilot, [switch]$EnableMetaConsent)

$ErrorActionPreference = 'Stop'
if (([int][bool]$SelfTest + [int][bool]$RealPilot + [int][bool]$OAuthPilot) -gt 1) { throw 'Choose one pilot mode.' }
if ($EnableMetaConsent -and -not $OAuthPilot) { throw 'Live consent is available only in the OAuth pilot mode.' }
$project = $PSScriptRoot
$credentialPath = Join-Path $project 'backend/.runtime/facebook-live-test/credentials.clixml'
$record = Import-Clixml -LiteralPath $credentialPath
if ($record.AppId -ne '1180640231308611' -or $record.PageId -ne '1450027621530622' -or $record.TokenKey -isnot [securestring]) {
    throw 'The protected record does not match the Talent Square app, Page and Fernet key.'
}
$priorKey = [Environment]::GetEnvironmentVariable('TS_FB_DEV_FERNET_KEY', 'Process')
$priorProof = [Environment]::GetEnvironmentVariable('TS_FB_PILOT_ORIGIN_PROOF', 'Process')
$priorAppSecret = [Environment]::GetEnvironmentVariable('TS_FB_PILOT_APP_SECRET', 'Process')
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($record.TokenKey)
$proofPointer = [IntPtr]::Zero
$appSecretPointer = [IntPtr]::Zero
$rehearsalRecord = $null
try {
    [Environment]::SetEnvironmentVariable('TS_FB_DEV_FERNET_KEY', [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer), 'Process')
    if ($RealPilot -or $OAuthPilot) {
        $rehearsalRecord = Import-Clixml -LiteralPath (Join-Path $project 'backend/.runtime/talent-square-ngrok-rehearsal.clixml')
        if ($rehearsalRecord.OriginProof -isnot [securestring]) { throw 'The protected ngrok origin proof is unavailable.' }
        $proofPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($rehearsalRecord.OriginProof)
        [Environment]::SetEnvironmentVariable('TS_FB_PILOT_ORIGIN_PROOF', [Runtime.InteropServices.Marshal]::PtrToStringBSTR($proofPointer), 'Process')
    }
    [Environment]::SetEnvironmentVariable('TS_FB_PILOT_APP_SECRET', $null, 'Process')
    if ($EnableMetaConsent) {
        if ($record.AppSecret -isnot [securestring] -or $record.AppSecret.Length -eq 0) { throw 'The protected Meta app secret is unavailable.' }
        $appSecretPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($record.AppSecret)
        [Environment]::SetEnvironmentVariable('TS_FB_PILOT_APP_SECRET', [Runtime.InteropServices.Marshal]::PtrToStringBSTR($appSecretPointer), 'Process')
    }
    $scriptArgs = @(
        if ($SelfTest) { '--self-test' }
        elseif ($RealPilot) { '--real-pilot' }
        elseif ($OAuthPilot) { '--oauth-pilot'; if ($EnableMetaConsent) { '--enable-meta-consent' } }
    )
    & python -B (Join-Path $project 'facebook_https_dev.py') @scriptArgs
    if ($LASTEXITCODE -ne 0) { throw 'The isolated HTTPS rehearsal failed.' }
}
finally {
    [Environment]::SetEnvironmentVariable('TS_FB_DEV_FERNET_KEY', $priorKey, 'Process')
    [Environment]::SetEnvironmentVariable('TS_FB_PILOT_ORIGIN_PROOF', $priorProof, 'Process')
    [Environment]::SetEnvironmentVariable('TS_FB_PILOT_APP_SECRET', $priorAppSecret, 'Process')
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    if ($proofPointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($proofPointer) }
    if ($appSecretPointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($appSecretPointer) }
    foreach ($property in @('AppSecret', 'PageAccessToken', 'TokenKey')) {
        if ($record.$property -is [securestring]) { $record.$property.Dispose() }
    }
    if ($rehearsalRecord) {
        foreach ($property in @('AgentToken', 'GatePassword', 'OriginProof')) {
            if ($rehearsalRecord.$property -is [securestring]) { $rehearsalRecord.$property.Dispose() }
        }
    }
}
