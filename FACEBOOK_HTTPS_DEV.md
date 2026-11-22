# Talent Square HTTPS OAuth rehearsal

The rehearsal uses `algebra-unblessed-protector.ngrok-free.dev`. Its isolated origin listens on `127.0.0.1:18080` and serves the frontend and selected Django routes together. Each launch creates a fresh SQLite database and one test staff account. The protected launcher reads the existing Fernet key. Live Meta consent is disabled in the rehearsal.

## Local verification

Run the loopback-only Chrome test in PowerShell.

```powershell
Set-Location -LiteralPath 'E:\Project\TalentSquare\3rd Nov'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\run_facebook_https_dev.ps1 -SelfTest
```

The test uses a disposable Chrome profile, a temporary certificate pinned only for that profile, and an isolated Django database. It checks staff login, same-origin API routing, the origin guard, secure cookies, CSRF, the Business Login redirect URI, and state rejection, expiration and replay.

## Before opening the tunnel

1. The signed Windows agent is staged under `backend/.runtime/ngrok-rehearsal-agent-*/ngrok.exe`. The launch block below checks its signature and reads the agent authtoken from the Windows-account-encrypted staging record.
2. In the ngrok dashboard open **Vaults & Secrets**, create a vault named `talent-square-dev`, and add these two secrets. Use a password manager to generate distinct values. [ngrok vaults](https://ngrok.com/blog/secrets-for-traffic-policy-ga-announcement)

   | Secret | Value |
   | --- | --- |
   | `gate-password` | A new random password of 20 to 128 characters. The browser uses it at the ngrok prompt with username `pilot`. |
   | `origin-proof` | A new random string of 32 to 128 characters using only letters, digits, underscores or hyphens. Enter this same value at the local origin prompt. |

3. In ngrok account **Settings → Observability**, leave **Full Capture** off. Use the supplied policy, which requires HTTPS and Basic Auth, strips any client-provided origin-proof header, and sets the proof from the vault. [ngrok capture settings](https://ngrok.com/docs/obs/traffic-inspection/http-requests)
4. In Meta for Developers open app `1180640231308611`, then **Facebook Login for Business → Settings → Valid OAuth Redirect URIs**. Add the URI below, save, reload, and confirm the value is retained. Paste the same URI into the **Redirect URI Validator**. Keep HTTPS enforcement and strict matching enabled. [Meta redirect settings](https://developers.facebook.com/documentation/facebook-login/guides/advanced/manual-flow)

   `https://algebra-unblessed-protector.ngrok-free.dev/api/discovery/facebook/callback/`

## Prepared commands for the protected rehearsal

The offline check verifies the policy file. ngrok attaches that file when it creates the agent endpoint. Verify the live gate immediately at startup, before opening the app or entering either password.

1. In the first PowerShell window start the isolated origin. Enter the vault's `origin-proof` at the first hidden prompt and choose a new, separate password of at least 16 characters for the disposable staff account at the second. Leave the window open.

   ```powershell
   Set-Location -LiteralPath 'E:\Project\TalentSquare\3rd Nov'
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\run_facebook_https_dev.ps1
   ```

2. In a second PowerShell window run this block once cleared to start the protected endpoint. It passes the HTTPS-only and Basic Auth rules in the same command that creates the endpoint. The token is supplied through a temporary process environment variable. [ngrok agent configuration](https://ngrok.com/docs/gateway/agent/config/) · [ngrok CLI](https://ngrok.com/docs/gateway/agent/cli)

   ```powershell
   Set-Location -LiteralPath 'E:\Project\TalentSquare\3rd Nov'
   $agentDir = Get-ChildItem -LiteralPath '.\backend\.runtime' -Directory -Filter 'ngrok-rehearsal-agent-*' |
       Sort-Object LastWriteTime -Descending | Select-Object -First 1
   if (-not $agentDir) { throw 'The staged ngrok agent is missing.' }
   $agent = Join-Path $agentDir.FullName 'ngrok.exe'
   $signature = Get-AuthenticodeSignature -LiteralPath $agent
   if ($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -notmatch '\bngrok[ ,]+(Inc\.?|LLC)\b') {
       throw 'The ngrok agent signature could not be verified.'
   }
   $policy = (Resolve-Path -LiteralPath '.\ngrok-facebook-https-dev.yml' -ErrorAction Stop).Path
   $record = Import-Clixml -LiteralPath '.\backend\.runtime\talent-square-ngrok-rehearsal.clixml' -ErrorAction Stop
   $talentTunnelPointer = [IntPtr]::Zero
   $talentPriorAuthtoken = [Environment]::GetEnvironmentVariable('NGROK_AUTHTOKEN', 'Process')
   try {
       if ($record.AgentToken -isnot [securestring] -or $record.AgentToken.Length -eq 0) { throw 'The protected authtoken is unavailable.' }
       $talentTunnelPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($record.AgentToken)
       $env:NGROK_AUTHTOKEN = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($talentTunnelPointer)
       & $agent http http://127.0.0.1:18080 --url https://algebra-unblessed-protector.ngrok-free.dev --traffic-policy-file $policy --inspect=false
   }
   finally {
       [Environment]::SetEnvironmentVariable('NGROK_AUTHTOKEN', $talentPriorAuthtoken, 'Process')
       Remove-Variable talentPriorAuthtoken
       if ($talentTunnelPointer -ne [IntPtr]::Zero) {
           [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($talentTunnelPointer)
       }
       foreach ($field in @('AgentToken', 'GatePassword', 'OriginProof')) {
           if ($record.$field -is [securestring]) { $record.$field.Dispose() }
       }
   }
   ```

3. Check the gate from a third terminal before signing in. The loopback request must return `403`. Both unauthenticated HTTPS requests must return `401`, including the request with a forged origin header. The last request uses plain HTTP with no credentials. It must be rejected, unavailable, or redirected to the exact HTTPS host. Do not follow that redirect during the check. If any request reaches the app without the required proof or authentication, stop the tunnel with Ctrl+C.

   ```powershell
   $rehearsalHost = 'algebra-unblessed-protector.ngrok-free.dev'
   curl.exe -sS -o NUL -w "%{http_code}\n" -H "Host: $rehearsalHost" -H 'X-Forwarded-Proto: https' http://127.0.0.1:18080/login
   curl.exe -sS -o NUL -w "%{http_code}\n" "https://$rehearsalHost/api/auth/me/"
   curl.exe -sS -o NUL -w "%{http_code}\n" -H 'X-Talent-Square-Origin: invalid-probe' "https://$rehearsalHost/api/auth/me/"
   curl.exe -sS -o NUL -w "%{http_code} %{redirect_url}\n" "http://$rehearsalHost/api/auth/me/"
   ```

4. Open `https://algebra-unblessed-protector.ngrok-free.dev/login` in a private browser window. Sign in at the ngrok prompt as `pilot` using the vault's `gate-password`. Then sign in to Talent Square as `staff@talent-square-https.example.test` using the disposable staff password. Open **Admin → Live Imports → Sources → Facebook Pages**. Expect zero connected Pages, a paused Facebook source, and an unavailable connect button. In browser developer tools confirm the login and Facebook status requests use the same HTTPS hostname and the `sessionid` and `csrftoken` cookies are host-only, Secure, HttpOnly, and SameSite=Lax. Keep cookie values private.
5. On the signed-in rehearsal page, run these checks in the browser console. The only output is the HTTP status. Missing CSRF must give `403`, and the fabricated OAuth state with no code must give `400`. The local self-test already verifies expiry and replay with a disposable session.

   ```javascript
   fetch('/api/auth/logout/', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{}'}).then(r => r.status)
   fetch('/api/discovery/facebook/callback/?state=invalid-rehearsal-probe', {headers: {Accept: 'application/json'}}).then(r => r.status)
   ```

6. If Meta rejected the URI while the host was offline, run the validator again with the protected tunnel up. If it still rejects the URI, note whether the value was saved and report the validator message. Keep the authentication gate enabled. Stop the tunnel first, then the origin, with Ctrl+C in their respective windows.

The HTTPS launcher sets Business Login configuration `1125531993600400` for **Talent Square Page Access**. The disposable self-test verifies that configuration and the exact callback URI without contacting Meta. Real consent is a separate step. The callback requires both configured grants, `pages_show_list` and `pages_read_engagement`, plus the `MODERATE` Page task and the sole allowlisted Page ID `1450027621530622`. The server exchanges the authorization code with Meta over HTTPS using GET and the same redirect URI as the login request. [Meta Business Login configurations](https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business/#get-started) · [Meta code exchange](https://developers.facebook.com/documentation/facebook-login/guides/advanced/manual-flow#exchangecode)

## Recover an origin-proof mismatch

1. Keep the tunnel stopped. If your password manager holds the value you saved in the vault, compare it against the encrypted local record. The prompt is hidden and the command writes no files.

   ```powershell
   Set-Location -LiteralPath 'E:\Project\TalentSquare\3rd Nov'
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\backend\.runtime\stage-talent-square-ngrok.ps1 -CheckOriginProof
   ```

2. If the values differ or the vault value is unavailable, generate a strong random URL-safe value in your password manager. Edit only **Vaults & Secrets → talent-square-dev → origin-proof** in the ngrok dashboard. Then run the following and enter that same value at both hidden prompts. The script replaces only the protected local origin proof and retains an encrypted rollback copy. [ngrok vault secret rotation](https://ngrok.com/docs/gateway/traffic-policy/secrets)

   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\backend\.runtime\stage-talent-square-ngrok.ps1 -RotateOriginProof
   ```

3. Repeat the private comparison. The running loopback pilot reads its proof at startup. The port `18080` process must reload the staged value before any public retest.

## Controlled real-database OAuth pilot

1. Wait for explicit approval to switch modes. Stop only the verified Talent Square pilot on `127.0.0.1:18080` and start the prepared OAuth mode from the project directory. Keep ngrok pointed exclusively to that port. The approved cutover keeps the OAuth routes closed and withholds the Meta app secret.

   ```powershell
   Set-Location -LiteralPath 'E:\Project\TalentSquare\3rd Nov'
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\run_facebook_https_dev.ps1 -OAuthPilot
   ```

2. Reverify Basic Auth, HTTPS redirection, origin-proof replacement, secure cookies, CSRF, staff access, closed OAuth routes and the unchanged database. Stop ngrok immediately if a control fails. Wait for separate approval for live Meta authorization.
3. After that separate approval, restart only the pilot with the command below. It loads the existing protected app secret and opens the OAuth connect and callback routes. Staff login and OAuth state use process-local sessions. Django still reads SQLite through a read-only connection.

   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\run_facebook_https_dev.ps1 -OAuthPilot -EnableMetaConsent
   ```

4. In a private browser window, open `https://algebra-unblessed-protector.ngrok-free.dev/login`. Sign in at ngrok as `pilot` and then with your existing Talent Square staff account. Go to **Admin → Live Imports → Sources → Facebook Pages → Connect Facebook Pages**. In the same browser session, choose only Talent Square Page `1450027621530622` and authorize the two read permissions. Keep the callback URL and credentials private.
5. On a successful callback, the writer reserves SQLite, checks the disabled Facebook baseline, and uses SQLite's backup API to create and verify `backend/.runtime/backups/facebook-pre-consent-write-*.sqlite3`. It then inserts one encrypted, paused Page row. The Page ID sequence is the only automatic SQLite bookkeeping. The OAuth state is consumed from the in-memory staff session. Check the fresh backup, Page status, and unchanged source settings, candidates, runs, and competitions before closing the pilot.
