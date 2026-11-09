# Talent Square — Phase 10 implementation report

6 November 2026, Asia/Dhaka. **IMPLEMENTED AND VERIFIED:** `jobfairs.0001_initial` applied after fresh backup/rehearsal and writer shutdown. Post-migration original-row preservation, integrity and foreign keys passed.

## A. Verified project folder

`E:\TalentSquare\3rd Nov`. Existing Python 3.13 / Django 6.1.2 project; genuine accounts/profiles and DRF session/CSRF infrastructure retained. No older-project files copied, no project rebuild and no new dependencies installed. Frontend/server restrictions and dark gradient layout remain.

## B. Baseline checks

Independently reran the previous full suite before implementation: **313 passed**, exit 0. Reviewed current account/competition/discovery/config modules, frontend Job Fair previews, inventories and previous reports. Initial source/schema/read-only database snapshots and verified online backups were captured before writes to application source. The live database already had the manually started worker's newer history: 94 candidates, 55 runs, 84 pending plus 4 update-pending; old reports' 87/37 totals were not assumed current.

## C. Existing previews identified

Public Job Fair routes previously read `DATA.jobFairs`; Home used the sample `JobFairSection`; details described sample companies, roles and attendance. Saved-event previews used browser-local storage. Admin fairs edited demo store entries. Public routes/Home now use real Django records, without sample fallback. Participant Job Fairs, Organizer Job Fairs and Admin Job Fair review are real separate views. Old sample data remains isolated/unused by real public listing and participation; no local preview records are copied into authenticated data.

## D. Models implemented

**IMPLEMENTED AND VERIFIED in isolated databases.** Dedicated `jobfairs` app: `JobFair`, `JobFairBookmark`, `JobFairAttendanceRegistration`, `JobFairReview`. Stable integer public IDs; real organizer FK/name snapshot; description, venue/university/city, format, aware start/end/deadline, internal/external mode and safe URLs, eligibility, publication/reviewer metadata. Draft/pending/published/rejected/cancelled choices. Unique participant/fair pairs and consistent withdrawal constraints; PROTECT for registration/history relationships. Staff decision history is retained independently of the latest metadata.

Drafts can be incomplete. Submission/approval requires confirmed details, explicit aware dates, valid date ordering and future start/deadline; external mode requires a registration URL. No missing times, company counts or organizer claims are fabricated. Public default ordering is start date. Cancellation removes public access while retaining private attendance history.

## E. Migrations created and applied

Additive migration **`jobfairs.0001_initial`**, dependent on the existing real user model. Four new tables, indexes and constraints; only new Job Fair content types/permissions and one migration history row. No seeded fairs/users, no alterations to competition/discovery tables, source policies or old migrations. `makemigrations --check --dry-run`: no changes detected.

**IMPLEMENTED AND VERIFIED:** `jobfairs.0001_initial` applied after fresh backup/rehearsal and writer shutdown. Post-migration original-row preservation, integrity and foreign keys passed.

Rehearsal plan was exactly `[('jobfairs','0001_initial',False)]`. Applying it to an isolated copy of the real verified backup succeeded. Every original application table's rows/counts/hashes stayed identical; every pre-existing migration/content-type/permission row was checked individually, with additive metadata allowed. All four new tables were empty. Integrity `ok`, foreign-key violations 0. The verifier refuses live application with detected worker/Django writers and incomplete test/browser gates; it never stops/restarts a process or restores/replaces SQLite.

## F. Organizer workflow

Active Organizer/profile required. Own paginated list, draft create/edit, explicit submit, rejected correction/resubmission. Client owner, status, reviewer and user IDs are rejected. Pending/published/cancelled fairs are not organizer-editable. Other owners receive 404. Submission never publishes automatically; previous rejection/approval decisions remain retained.

## G. Staff approval

Separate Job Fair review queue at `/admin?tab=fairs`, plus Django Admin. Requires active staff with **both `jobfairs.change_jobfair` and `jobfairs.review_jobfair`**; superusers inherit these. No existing account/group permission assignment was changed. Approve/reject only pending fairs; reject/cancel require notes; published cancellation retains history. Pending corrections use validated Django Admin fields. Published details are read-only except review notes. No permission grants are inferred from a frontend role selector. Competition imports/review remain separate and unchanged.

## H. Public directory

**IMPLEMENTED AND VERIFIED in Chrome and tests.** Published-only Home cards, `/job-fairs` and stable-ID details. Search, city/format/date filters, sorting, bounded pagination (12 default, 60 max), IANA timezone date filtering, loading/empty/error/retry states. No sample records fill an empty or failed real request. Published fair details show organizer, event information, eligibility, official website and accurate attendance mode. Draft/pending/rejected/cancelled details return 404 publicly.

## I. Participant bookmarks

Published-only save/unsave, unique idempotent bookmark creation, own paginated saved items and refreshed detail status. Existing account/profile required. Persistence through page refresh and logout/login verified. Browser-local saved samples are not imported.

## J. Internal attendance registration

Active Participant/profile, published internal fair, and strict `now < deadline` and `now < start` required. Unique lifetime registration pair; duplicate requests return 409; SQLite write-before-read lock plus DB uniqueness prevents duplicate races. Lock contention returns 409 for retry. No capacity/ticket/payment promises. Withdrawals before event start preserve row, original registration time and withdrawal timestamp, including after registration deadline. Repeated withdrawal is idempotent; withdrawn registrations cannot be reopened in this phase.

## K. External registration behavior

HTTP(S) links without embedded credentials, separate tab with `noopener noreferrer`. Staff approves the source-stated URL; no automated remote registration verification is claimed. External link opening creates **no internal registration, no self-report and no verified attendance**. A real Chrome mouse click opened the controlled external fixture tab and confirmed zero attendance rows. Optional external Job Fair self-reporting is **NOT IMPLEMENTED**; competition self-reporting remains separate.

## L. Participant workspace

`/workspace?role=participant&tab=fairs`: separate saved fairs and retained attendance records, date/location/mode/status, withdrawal timestamps and public links. Cancelled fair status remains visible in owned registration history even though public detail becomes unavailable. Competition My Competitions/saved/activity are retained. Job applications are **PREVIEW ONLY**.

## M. Organizer workspace

`/workspace?role=organizer&tab=fairs`: real owned drafts/submissions/statuses, edit/resubmit and paginated registrants. Registrants expose only participant reference, registration ID/status and timestamps, with no names, email/contact, skills or private profile fields. Other organizers cannot access the list. Recruiter browse access confers no organizer/participant/staff privileges; no recruitment workflow was implemented.

## N. APIs

See [JOB_FAIRS.md](JOB_FAIRS.md) for the complete route/method table. Main routes are `/api/job-fairs/`, `/api/job-fairs/{id}/`, `/api/organizer/job-fairs/` (GET/POST), owned detail PATCH and submit POST, owned registrants GET, participant bookmarks/activity/register endpoints, participant own registration list/withdraw POST, and staff `/api/job-fair-review/` plus detail/decision PATCH. All are Django-only. Lists use count/next/previous/results. Identity comes from session; unsupported owner/publication fields are rejected.

## O. Security validation

**IMPLEMENTED AND VERIFIED:** session auth, CSRF, exact-origin credentialed CORS, active role/profile checks, staff permission separation, owner-only private records, private no-store responses, unpublished denial, URL/date/unknown-field validation and duplicate race protection. CORS extensions are restricted to new Job Fair PATCH/DELETE routes; existing methods/policies remain. Anonymous/regular/inactive users cannot obtain review/management privileges. Public serializers omit reviewer/owner-private data. Legacy frontend authentication/competition APIs remain HTTP 410; private-file and loopback protections still pass. No password/secret/session-cookie value is exposed by the report or audit logs.

## P. Automated tests

**359 discovered; 359 passed; 0 failed; 0 skipped; exit 0**, 126.524 seconds. The original 313 remain passing plus **46** targeted Job Fair tests. Model/date/URL validation, complete workflow and unauthorized publication, non-superuser permission matrix, inactive accounts, search/filter/pagination, registration boundaries/external denial, idempotence, concurrent requests, withdrawal history, bookmarks, private records, cross-owner denial, CSRF/CORS/cache controls and DB uniqueness are covered.

System check: no issues, exit 0. Migration consistency: no changes detected, exit 0. Separate all-15 university worker lifecycle proof: exit 0. Tests use disposable configured databases and normal security/hash settings. Expected simulated source/mail failure messages are negative tests, not suite failures.

## Q. Real Chrome workflows

Chrome workflow | Assertions passed | Exit | Uncaught JS exceptions
--- | ---: | ---: | ---:
chrome-phase10 | 17 | 0 | 0
chrome-university | 11 | 0 | 0
chrome-phase7 | 9 | 0 | 0
chrome-phase8 | 11 | 0 | 0
chrome-security-python | 16 | 0 | 0
chrome-security-node | 16 | 0 | 0

**80 final workflow assertions passed**, zero final failures and zero uncaught JavaScript exceptions. New Job Fair workflows cover public filtering/hidden drafts, login/bookmark persistence, internal/duplicate registration, logout/login, actual external tab/no false records, workspace, withdrawal, draft submission, staff approval/rejection, correction/resubmission and owner/cross-owner registrants. Existing Phase 7/8/9/9A and signed-out/access-retry assertions remain passing. Both Python and Node frontend servers were exercised for security.

All browser writes used temporary accounts/migrated databases. During pre-migration testing, real servers occupied ports 8000/8001, so a temporary source mirror changed only literal port numbers, and two existing audit-only signed-out/retry assertions were injected into the copied university harness. Final mirror ports: [60081, 60082]. No original account/cookies or live import was used. A prior rerun stalled at “Getting Talent Square ready…” before authentication; it was retained as `chrome-university-startup-failure.log`. An unchanged retry passed. Its precise transient startup/CDN cause is unproven and remains a limitation, not hidden as a pass. Temporary test mirrors/junctions/processes were cleaned up. These are the final pre-migration full-suite/browser results; post-migration checks separately reran all 46 Job Fair tests successfully with no servers or worker started.

## R. Backup and preservation evidence

Verified online backup: `E:\TalentSquare\3rd Nov\backend\.runtime\backups\phase10-pre-migration-20261106T133238101530Z.sqlite3`. SHA-256:

`e9edd03b0d0b46fbfea6f3f9534b97baee8bb2e737fb0c7501c4440d31bf407a`

SQLite URI read-only/query-only source plus a consistent read transaction and `Connection.backup`; no unsafe active-file copy, reset or restore. Backup integrity, foreign keys and full logical snapshot match passed and were reverified. Rehearsal used a separate temporary copy of that backup. Original rows/IDs and metadata subsets were verified after migration there. Keep backups private.

Final real-database read-only check: `2026-11-06T13:34:35.402531+00:00`; integrity `ok`, foreign-key violations **0**, active runs **0**, leases **0** at inspection. Original application tables show no unexpected differences from the migration baseline. Live processes can legitimately write later; file hashes alone are not used to attribute changes while a worker is running. No source/candidate write was made for testing.

Table | Before migration / rehearsal baseline | Current real rows
--- | ---: | ---:
accounts_organizerprofile | 1 | 1
accounts_participantprofile | 4 | 4
accounts_profileimage | 0 | 0
accounts_recruiterprofile | 0 | 0
accounts_user | 7 | 7
accounts_user_groups | 0 | 0
accounts_user_user_permissions | 0 | 0
auth_group | 0 | 0
auth_group_permissions | 0 | 0
auth_permission | 74 | 91
competitions_competition | 10 | 10
competitions_competitionbookmark | 0 | 0
competitions_competitionregistration | 0 | 0
competitions_externalparticipation | 0 | 0
discovery_facebookpage | 0 | 0
discovery_importcandidate | 94 | 94
discovery_importrun | 55 | 55
discovery_importsource | 19 | 19
django_admin_log | 1 | 1
django_content_type | 18 | 22
django_migrations | 28 | 29
django_session | 6 | 6

## S. Scraping worker preservation

The owner stopped the one worker invocation (launcher 13692 / child 948) with Ctrl+C; it previously displayed “Import worker stopped.” It remained absent during shutdown/migration/post-checks. No second worker was started and no worker was killed or automatically restarted.

Remaining development servers required separate shutdown. Revalidated full commands, executable paths, creation times and parent/child pairs matched project-venv invocations: frontend 4376 → 23756, Django 26404 → 27028, and additional frontend 5544 → 2824. Their owning VS Code-integrated PowerShell PIDs were 19680, 16016 and 27256, respectively. Exact terminal-tab names and current directories were not exposed by Win32 process information; the project association was established from the absolute project interpreter command, expected scripts and known port owners. Console membership included the PowerShell shells, so a broad Ctrl+C broadcast was deliberately not sent. A guarded helper used open, revalidated process identity handles to terminate only the three server children; launchers then exited. **This fallback was process-specific termination, not graceful Ctrl+C.** There were no active import rows or leases before it. All three owning PowerShell shells remained alive.

For an available owning terminal, focus it and press Ctrl+C. The audited fallback command was `python -B backend/.runtime/phase10_safety/stop_verified_servers.py`; it validates project commands, parentage, creation identities, descendants and idle import state before any termination. Its historical target equivalent was `Stop-Process -Id 23756,27028,2824`, but **do not reuse bare PIDs without revalidation**. No global Python/PowerShell kill was used.

Before migration and again afterward: no project server/worker process remained and no listener existed on ports 8000/8001. All servers and the worker remain stopped. Evidence: `server-shutdown.json`, `server-console-attempts.json`, `shutdown-port-verification.json`, `post-migration-verification.json`.

No connector, registry, schedule/backoff/lease/review policy, Facebook setting or university auto-publication setting changed. Protected discovery and competition source hashes match baseline. Isolated worker fixtures are explicitly separate from the running real worker.

## T. Competition review queue

The existing **94 candidates** (84 pending, 4 update-pending, 6 approved), **55 import runs**, 19 sources and **10 competitions** are preserved. The fresh migration baseline also contains 7 users and 6 sessions; this supersedes earlier development snapshot counts. Real users/profiles, participation records and source settings were not edited. Job Fair migration does not delete/seed/approve/reject competition records; all university sources remain review-first and Facebook disabled. No existing staff roles/passwords or explicit permission assignments were modified.

## U. Files modified or added

- `backend/accounts/middleware.py`
- `backend/accounts/browser_phase9_regression.py`
- `backend/config/settings.py`
- `backend/config/urls.py`
- `pages.js`
- `workspaces.js`
- `README.md`
- `JOB_FAIRS.md`
- `PHASE10_REPORT.md`
- `backend/jobfairs/__init__.py`
- `backend/jobfairs/admin.py`
- `backend/jobfairs/browser_phase10_regression.py`
- `backend/jobfairs/migrations/0001_initial.py`
- `backend/jobfairs/migrations/__init__.py`
- `backend/jobfairs/models.py`
- `backend/jobfairs/permissions.py`
- `backend/jobfairs/serializers.py`
- `backend/jobfairs/services.py`
- `backend/jobfairs/tests.py`
- `backend/jobfairs/urls.py`
- `backend/jobfairs/verify_phase10_migration.py`
- `backend/jobfairs/views.py`

Safety evidence/helpers and private verified backups are under `backend/.runtime/phase10_safety/` and `backend/.runtime/backups/`. They are not public assets. Existing competition/discovery models, migrations and collectors were not changed; `app.js`, frontend server security and stylesheet remain unchanged.

## V. Remaining limitations

**IMPLEMENTED AND VERIFIED:** `jobfairs.0001_initial` applied after fresh backup/rehearsal and writer shutdown. Post-migration original-row preservation, integrity and foreign keys passed.

The migration is applied, but all services intentionally remain stopped. Start the frontend/backend manually when ready; no live HTTP availability is claimed while they are stopped. No real fairs are seeded, so the genuine directory is empty until an organizer submits and staff approves a real event. Optional external self-reports, actual attendance verification, attendee contact export, capacity/tickets/payments, employer management, job applications/recruitment/rankings/certificates are **NOT IMPLEMENTED**. Other unrelated demo areas remain **PREVIEW ONLY**. Production origin/build/CDN/HTTPS/supervision/monitoring limitations remain.

## W. Startup and manual verification

From the verified root, inspect processes and do not duplicate a server or worker. Safe deterministic checks:

```powershell
python -B manage_local.py check
python -B manage_local.py makemigrations --check --dry-run
python -B manage_local.py test --noinput
python -B backend/.runtime/phase10_safety/browser_runner.py
# Migration already applied; do not rerun the one-time migration verifier.
```

The audit test wrapper explicitly configured isolated DB paths. The live verifier already completed its one-time apply operation successfully; it refuses reapplication when Job Fair tables already exist. Do not rerun it now. Read-only post-verification found `jobfairs.0001_initial` recorded once, 29 total migrations, no pending migrations, four new empty tables, four added content types and 17 added Job Fair permissions. All original metadata rows were individually preserved. Post-migration Job Fair tests: **46 passed**, zero failures/skips, exit 0; Django check and migration consistency passed. No additional HTTP server or worker was started for these checks.

Normal local frontend/backend after successful migration, in separate terminals:

```powershell
python -B server.py
python -B manage_local.py runserver 127.0.0.1:8001 --noreload
```

If a worker was deliberately stopped, do **not** automatically restart it; manual authorized command is `python -B manage_local.py run_import_worker`. The worker is stopped and requires a manual owner-authorized restart when desired; no restart was performed here. Use 127.0.0.1 consistently. Test writes with isolated temporary accounts: Organizer Job Fairs → create/save/submit; Admin Job Fairs → inspect/approve/reject; public directory/details; Participant My Job Fairs → save/register/refresh/logout-login/withdraw; owner registrants and cross-owner denial. Never test by approving pending competition imports.

## X. Recommended next phase

Phase 10 implementation, tests, additive real migration and preservation checks are complete. Services remain intentionally stopped. When manually started, verify a truthful owner-submitted real fair through human review, and prepare isolated staging/deployment with pinned frontend builds, configurable API origins, HTTPS, monitored backups and supervised services. Add recruitment or hiring only as a separate authorized phase; attendance registration is not evidence of those capabilities.
