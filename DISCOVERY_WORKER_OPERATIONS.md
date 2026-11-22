# Discovery Worker Operations

## Verified execution behavior

The `run_import_worker` Django command polls for enabled, due sources (default 30 seconds, minimum 10), recovers abandoned leases, and delegates source runs to the transactional source service. Per-source database leases prevent overlapping HTTP collection for a source across independent worker processes. Failed runs persist retry/backoff; `Retry-After` is respected. The worker can run unattended without a browser, provided the host keeps the process alive.

`backend/discovery/verify_university_worker.py --save-evidence` was run on 2026-11-15 against a disposable migrated SQLite DB with fixture HTTP transport and controlled clock. It verified all 15 university sources, repeat idempotency, review-only imports, staff approval/update flow, 429 retry scheduling, restart-before-due, stale lease recovery, two-process overlap prevention, and continuous two-poll operation. Evidence is at `backend/.runtime/university_auto_audit/worker-proof.json`.

## Runtime state and actual schedule

The app DB has 15 university sources, all enabled, and the Facebook source disabled. Last stored attempts were on 2026-11-06; current live checks occurred 2026-11-15 as a separate read-only audit. Process inspection found no import worker running, and no OS service/task was installed. Thus scheduling logic is verified in isolation but current production-like automatic scheduling is not active on this machine.

## To operate continuously

Run from the backend environment after configuring the database and settings:

```powershell
python manage.py run_import_worker
```

For a one-pass due-source run:

```powershell
python manage.py run_import_worker --once
```

For actual unattended operation, install this command under the deployment platform's supervised service mechanism, configure restart-on-failure and logs, and monitor the Live Imports health view for overdue runs, retry state, pending candidates, and last run results. Do not treat the interactive terminal command as a persistent service.
