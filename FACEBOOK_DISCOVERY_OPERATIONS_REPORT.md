# Talent Square Facebook discovery operations

## Handover status · 21 November 2026

The only approved target is the **Talent Square** Page `1450027621530622`, using the **Talent Square** Meta app `1180640231308611` and the project's verified Graph API version `v27.0`. The previously used Page token has expired according to the handover. This review made no credential or Graph API requests.

- Git is on `main`, tracking `origin/main`. Before this report was added, there were 12 modified tracked files, 20 untracked paths and no staged changes. Existing changes were preserved. The requested operations report did not previously exist.
- Read-only inspection of `backend/db.sqlite3` found that Facebook source #2 is disabled, automatic publication is off, the interval is 60 minutes, no lease is active, and no next run is scheduled. There are zero Facebook Page connections, zero Facebook runs, zero Facebook candidates and 14 competition rows in total. `PRAGMA integrity_check` returned `ok`, `PRAGMA foreign_key_check` returned zero rows, and the database SHA-256 was unchanged. No SQLite sidecars were present during inspection.
- No matching Python discovery worker or listener on ports 8000 or 8001 was visible to this inspection. The existing development environment was left untouched. Recheck ports and process ownership before operating, as availability can change.

## Verification record

| Check | Recorded result and evidence |
| --- | --- |
| Full Django suite | **385 passed, 1 skipped**, from the handover. The earlier final entry in [Facebook live token verification](FACEBOOK_LIVE_TOKEN_VERIFICATION_REPORT.md#final-live-verification-2026-11-21) records **380 passed, 1 skipped**, **28 focused passes, 1 skip**, and a clean Django system check. No separate workspace result for the later full-suite total was located. |
| Isolated live Facebook discovery | The earlier report records one passing credential-gated integration test and an unchanged real database hash. The current [test](backend/discovery/test_facebook.py) contains two live `run_source` calls within that one test. The handover records both passing. Assertions cover the authorized Page, the known fictional post, review-first status, zero competition rows and zero new or updated candidates on the unchanged repeat. Both calls use disposable Django test data. |
| Token health and protected storage | The [health command](backend/discovery/management/commands/check_facebook_token_health.py) and [tests](backend/discovery/test_facebook_token_health.py) are present. The command reads allowlisted database connections, checks identity, PAGE type, scopes, validity and expiry, and emits sanitized status. It exits nonzero for conditions that need attention, including expiry within 14 days, and has a successful empty-result path when no Page is connected. The live-token report records DPAPI updater fixture passes, including atomic replacement, rollback and key preservation. The protected file and encrypted rollback copies are present. |
| Chrome review queue | **9 checks passed, zero JavaScript exceptions**, from the handover. The [current regression](backend/discovery/browser_phase9a_regression.py) implements nine checks and uses dynamic loopback ports, copied frontend assets in a temporary directory, and disposable SQLite data. This browser regression uses university fixtures and real Django review routes. |

This documentation pass checked the implementation, the available reports and the database state. The backup and inspection snippets passed on a disposable SQLite fixture, including rejection of an enabled Facebook source at the pre-pilot check. The completed suites were not rerun.

## 1. Renew the protected local Page test token

1. In [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/), select app **Talent Square** (`1180640231308611`) and Graph API `v27.0`. Sign in as the approved Page manager. Generate a User access token with `pages_show_list` and `pages_read_engagement`, granting the app access to the Talent Square Page. With that User token selected, submit `GET /me/accounts?fields=id,name,access_token,tasks` inside Explorer. Use only the `access_token` field of the row with ID `1450027621530622` and confirm `MODERATE` appears in its tasks. Keep the response in Meta's tool. [Explorer guide](https://developers.facebook.com/docs/graph-api/guides/explorer/) · [Pages API account lookup](https://developers.facebook.com/documentation/pages-api/getting-started)
2. In [Meta Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/), verify app ID `1180640231308611`, type `PAGE`, validity, Page/profile ID `1450027621530622`, the two read scopes and any reported token and data-access expiry. Keep the token out of command arguments, shell history, screenshots and shared logs. [Meta token metadata reference](https://developers.facebook.com/docs/graph-api/reference/debug_token/)
3. Under the Windows account that owns the DPAPI record, run the updater. Paste the Page token only into the hidden input. The updater validates the app, token metadata, Page identity and post access before replacing the protected record. Record the encrypted rollback path printed on success. If validation fails, stop and review the sanitized stage and error. Preserve the existing App Secret and Fernet key.

   ```powershell
   Set-Location -LiteralPath 'E:\Project\TalentSquare\3rd Nov'
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\update_facebook_page_token.ps1
   ```

4. This updates `backend/.runtime/facebook-live-test/credentials.clixml` for the isolated live harness. Django obtains its own Page token during OAuth in step 3 below. Renewing the protected test token alone does not connect Django or refresh an existing Django connection. The prior isolated harness remains available as `run_facebook_live_test.ps1` if a separate retest is requested.

## 2. Create and verify the pre-run database backup

Before Django login or OAuth, confirm the intended database is `backend/db.sqlite3`. The local settings honor `DJANGO_SQLITE_PATH`, so check for an override in the shell that will start Django and resolve it before proceeding. Schedule a quiet window with no database writers or import workers, including manual discovery by other staff. If resolving a port or writer conflict would require touching the existing development server, defer the pilot.

From the project root, in PowerShell, take a fresh private snapshot with SQLite's backup API. It reads the source and creates a consistent snapshot even when SQLite uses a journal. The verification reopens the destination read-only, checks integrity and foreign keys, and checks that the Facebook baseline is safe. The existing November 6 backups predate this pilot and are not its restore point.

```powershell
$sourceDb = (Resolve-Path -LiteralPath '.\backend\db.sqlite3').Path
$backupDir = (Resolve-Path -LiteralPath '.\backend\.runtime\backups').Path
$stamp = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffffffZ')
$backupDb = Join-Path $backupDir "facebook-pre-pilot-$stamp.sqlite3"
if (Test-Path -LiteralPath $backupDb) { throw 'Backup path already exists.' }
$snapshot = @'
from contextlib import closing
from pathlib import Path
import sqlite3
import sys

source, destination = map(Path, sys.argv[1:])
with closing(sqlite3.connect(source.as_uri() + "?mode=ro", uri=True)) as live:
    with closing(sqlite3.connect(destination)) as backup:
        live.backup(backup)
'@
$inspect = @'
from contextlib import closing
from pathlib import Path
import json
import sqlite3
import sys

database = Path(sys.argv[1]).resolve(strict=True)
with closing(sqlite3.connect(database.as_uri() + "?mode=ro", uri=True)) as db:
    if db.execute("PRAGMA integrity_check").fetchall() != [("ok",)]:
        raise SystemExit("Integrity check failed.")
    if db.execute("PRAGMA foreign_key_check").fetchone() is not None:
        raise SystemExit("Foreign key check failed.")
    source = db.execute(
        "SELECT id, enabled, auto_publish, is_running, interval_minutes "
        "FROM discovery_importsource WHERE connector = 'facebook'"
    ).fetchone()
    if source is None:
        raise SystemExit("Expected the existing Facebook source row.")
    pages = db.execute("SELECT page_id, enabled FROM discovery_facebookpage").fetchall()
    runs = db.execute(
        "SELECT id, status, created_count, updated_count, skipped_count "
        "FROM discovery_importrun WHERE source_id = ? ORDER BY id DESC",
        (source[0],),
    ).fetchall()
    candidates = db.execute(
        "SELECT external_id, status, payload FROM discovery_importcandidate WHERE source_id = ?",
        (source[0],),
    ).fetchall()
    urls = [json.loads(payload).get("source_url") for _, _, payload in candidates]
    excluded = "https://www.facebook.com/1450027621530622/posts/122097102111558247"
    competitions = [row[0] for row in db.execute(
        "SELECT id FROM competitions_competition ORDER BY id"
    )]
    print("integrity=ok; foreign_key_violations=0")
    print("source (id, enabled, auto_publish, is_running, interval):", source)
    print("Page rows (Page ID, enabled):", pages)
    print("Facebook runs (id, status, new, updated, skipped):", runs)
    print("Facebook candidate count/statuses:", len(candidates), sorted({row[1] for row in candidates}))
    print("Repeated external IDs:", len(candidates) - len({row[0] for row in candidates}))
    print("Repeated canonical URLs:", len(urls) - len(set(urls)))
    print("Known fictional candidate count:", urls.count(excluded))
    print("Competition IDs:", competitions)
    if "--pre-pilot" in sys.argv[2:] and (source[1:4] != (0, 0, 0) or pages or runs or candidates):
        raise SystemExit("Facebook baseline differs from this handover. Reconcile before proceeding.")
'@
$snapshot | python -B - $sourceDb $backupDb
if ($LASTEXITCODE -ne 0) { throw 'Snapshot failed.' }
$inspect | python -B - $backupDb --pre-pilot
if ($LASTEXITCODE -ne 0) { throw 'Do not use this backup for the pilot.' }
Get-FileHash -LiteralPath $backupDb -Algorithm SHA256
```

Save the verified path, hash and baseline results privately. Keep this PowerShell window open to reuse `$inspect` and the paths. The backup contains application data. Keep it and the DPAPI record in private storage, with the credential record separate from the database snapshot.

## 3. Connect the authorized Page through Django

1. In the approved Meta app's Facebook Login settings, verify **Valid OAuth Redirect URIs** permits the exact callback `http://127.0.0.1:8001/api/discovery/facebook/callback/`, including the trailing slash. Confirm the app mode and granted access cover the approved manager. If Meta rejects the loopback redirect or required access, stop and resolve the app configuration before attempting a connection. [Meta OAuth redirect configuration](https://developers.facebook.com/documentation/facebook-login/guides/advanced/manual-flow)
2. Use the already configured loopback Django instance if available and approved for the pilot. If the port is free and no other project Django instance is running, start the pilot backend from the project root in a dedicated Windows PowerShell window using `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\run_facebook_local_django.ps1`. The launcher binds port 8001 and injects the existing app secret and Fernet key only for its process and child. It pins `v27.0`, the one approved Page ID and the loopback URLs. If it reports an existing server or listener, leave that process running and defer unless the approved existing instance already has the required configuration.
3. Use the project frontend at `http://127.0.0.1:8000`. If port 8000 is free and the frontend is absent, start `python -B server.py` from the project root in another dedicated terminal. Use `127.0.0.1` for both sides so the staff session survives the callback. Sign in at `http://127.0.0.1:8000/login` using an existing active staff account with `discovery.manage_discovery`.
4. Open `http://127.0.0.1:8000/admin?tab=live-imports`. In **Sources → Facebook Pages**, click **Connect Facebook Pages**. Complete the Meta dialog in the same browser session within ten minutes. Select Talent Square and grant `pages_show_list` and `pages_read_engagement`. Django checks the grants and stores only an allowlisted Page returned with `MODERATE` and a Page token. The callback's missing-permission message also names `pages_read_user_content`. The actual requested and enforced scope set contains the two read scopes above. Investigate any additional permission requirement before expanding access.
5. After return, confirm exactly one Page row, **Talent Square · 1450027621530622 · Paused**, and a paused Facebook source. On a failed callback, fix the cause and restart from **Connect Facebook Pages** to obtain fresh single-use state. The optional `python -B manage_local.py check_facebook_token_health` command checks the Django-stored token from a shell provisioned with the same app settings, allowlist, database and Fernet key. The launcher does not export those values to other terminals.

## 4. Perform one supervised Facebook discovery run

1. In **Facebook Pages**, click **Enable Page** for Talent Square. Find the Facebook source below it and click **Enable source**. Keep the existing hourly interval and verify the publication control says staff verification is required.
2. Click **Run now** on the **Facebook source row** once. This calls the single-source service used by the worker. Avoid `run_import_worker --once` for this pilot because it processes all enabled, due sources and attempts lease recovery across sources.
3. In **Run history**, check for exactly one new Facebook run relative to the backup. Record its ID, status, start/finish times and new, updated and skipped counts. A successful run with zero eligible candidates is valid. In **Review queue**, choose the Facebook entry under **Review source** and **All statuses**. Confirm new entries are pending, from the authorized Page, and unique by canonical permalink. The fictional post `1450027621530622_122097102111558247` must be absent. Leave candidates unapproved. A failed response can still have a persisted run and partial candidate writes. If the request times out, refresh and inspect history and the lease before deciding what happened. Honor the recorded cooldown on failure and stop after the single attempt.
4. After the run finishes, click **Pause source**, then **Pause Page**. Leave the paused connection available to the operator, or disconnect it if the goal is to return to zero local connections. Stop only pilot processes that were started in dedicated terminals after they finish serving. With database writers quiesced, run `$inspect | python -B - $sourceDb` and compare with the saved baseline. Expect one finished Facebook run, zero active leases, disabled Facebook collection and auto-publication, zero repeated IDs or canonical URLs, zero fictional candidates, and the same competition IDs. Review any discrepancy before further collection.

## Expected writes

| Operation | Expected local effect |
| --- | --- |
| Secure token renewal | Atomic replacement of the DPAPI CLIXML record, with an encrypted rollback copy. No SQLite write. |
| Django sign-in and OAuth | Session/auth bookkeeping, including OAuth state creation and consumption. The callback creates or refreshes the Page ID, name, authorizing staff ID, connection time, Fernet-encrypted Page token and error state. A new Page starts paused. The callback can create the Facebook source if it is absent or rename its legacy placeholder. The real database already has that source. |
| Page and source controls | Toggle `discovery_facebookpage.enabled` and `discovery_importsource.enabled`. The existing interval and disabled auto-publication should be preserved. Disconnect deletes the local Page row and encrypted token. |
| Collection | Leases the Facebook source and creates a `discovery_importrun` row. The run records counts and terminal status. The source records the last check, error and next eligible time, and releases the lease. The connector clears or sets the Page error and can pause an enabled Page outside the allowlist if such a row exists. Eligible posts create pending candidates keyed by source and hashed canonical permalink. Unchanged candidates update `last_seen_at`; changed candidates may update payload, warnings and review status. Candidate writes commit individually, so a failed or interrupted attempt can leave partial results. |
| Publication | The Facebook collector writes no competitions or publication changes. Publishing or applying changes requires separate staff review and approval outside the supervised run. |

## Rollback

- **Stop collection and keep the evidence.** Pause the Facebook source first, then pause the Page. If a request is still running, allow it to finish and inspect the run and lease. An interrupted lease normally becomes recoverable after 15 minutes. The underlying service can finalize it on a subsequent source check. Avoid clearing a lease by hand or initiating another fetch merely to clean up. Disconnect the Page to remove the stored OAuth token. Run history and pending candidates remain. To withdraw Meta-side consent as well, the Page manager can remove the Talent Square app authorization in Meta account settings.
- **Restore the database only for a full rollback.** A restore discards every database write after the snapshot, including unrelated changes. Confirm the operator has approved that loss. Stop or quiesce all processes and clients that hold the database open in an approved maintenance window. Take and verify a separate pre-restore safety snapshot using the same `$snapshot` and `$inspect` blocks and a new private destination. Do not perform a file swap while a WAL, shared-memory or journal sidecar exists. Resolve any sidecar by closing the owning processes cleanly and completing SQLite recovery. Retain the files if recovery fails. Recheck the approved snapshot hash against the saved SHA-256. Stage a copy beside the live DB, verify it, then use Windows file replacement to retain the superseded file privately:

  ```powershell
  $expectedHash = Read-Host 'Enter the saved pre-pilot SHA-256'
  if ((Get-FileHash -LiteralPath $backupDb -Algorithm SHA256).Hash -ne $expectedHash) {
      throw 'Backup SHA-256 does not match.'
  }
  foreach ($suffix in '-wal', '-shm', '-journal') {
      if (Test-Path -LiteralPath ($sourceDb + $suffix)) { throw "SQLite sidecar present: $suffix" }
  }
  $restoreId = [guid]::NewGuid().ToString('N')
  $stagedDb = "$sourceDb.restore-$restoreId"
  $retiredDb = Join-Path $backupDir "facebook-superseded-$restoreId.sqlite3"
  Copy-Item -LiteralPath $backupDb -Destination $stagedDb
  $inspect | python -B - $stagedDb --pre-pilot
  if ($LASTEXITCODE -ne 0) { throw 'Staged restore failed verification.' }
  if ((Get-FileHash -LiteralPath $stagedDb -Algorithm SHA256).Hash -ne $expectedHash) {
      throw 'Staged restore hash differs.'
  }
  [System.IO.File]::Replace($stagedDb, $sourceDb, $retiredDb)
  $inspect | python -B - $sourceDb --pre-pilot
  if ($LASTEXITCODE -ne 0) { throw 'Restored database failed verification. Keep all DB clients stopped.' }
  if ((Get-FileHash -LiteralPath $sourceDb -Algorithm SHA256).Hash -ne $expectedHash) {
      throw 'Restored database hash differs. Keep all DB clients stopped.'
  }
  ```

  Compare the restored baseline with the saved results before restarting application clients. If the restored file fails verification, use the independently verified safety snapshot with the same staging-and-replacement procedure. Omit the `--pre-pilot` flag for that safety snapshot and compare against its own recorded results and hash. Local database restoration does not change Meta consent or the DPAPI record.

- **Roll back the protected record separately if needed.** Under the same Windows account, close launchers and updater processes. Use the exact encrypted backup path printed by the successful updater. In the private credential directory, copy that backup to a new staging file with the same restricted access, then atomically replace `credentials.clixml` with the staged copy using `[System.IO.File]::Replace`, retaining the superseded record in a separate private file. An expired or revoked token stays unusable after restoration. The DB-stored OAuth token is unaffected by this file restore. Preserve the existing Fernet key.
