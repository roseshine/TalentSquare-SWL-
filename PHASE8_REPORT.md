# Phase 8 implementation and verification report

Date: 5 November 2026 (Asia/Dhaka). Workspace: `E:\TalentSquare\3rd Nov`.

Status: complete. The full Django suite, both isolated Chrome regressions, backup restoration rehearsal, real database migration, preservation checks and read-only post-migration API checks have passed.

## Implemented behavior

- Django-backed participant bookmarks on Explore cards and competition details, with saved competitions in the participant workspace.
- Explicit internal/external competition registration mode. Existing and imported competitions default to external. Internal registration is restricted to organizer-owned submissions and retains the existing publication review requirements.
- Internal registrations persist in the account, reject duplicates, enforce both deadline and event start, and support withdrawal before event start. Withdrawal retains history and cannot be reopened.
- External activity supports Interested, Planning to Register, Registered Externally, Participated and Completed. Reports are participant-owned and explicitly self-reported/unverified. They never become internal registrations or verified achievements.
- My Competitions combines saved events, internal registration history and external reports, with search, activity filters and real account counts. Browser-only preview saves are not imported.
- Organizers can view names, registration times and statuses for their own internal competitions. Email, contact data and unrelated profile details are excluded. Another organizer receives 404 for the private registrant endpoint; staff has no implicit ownership bypass.
- Session identity, role/profile checks, CSRF, scoped CORS, strict write inputs, uniqueness/check constraints and concurrency handling protect the activity APIs.

Implementation resides in `backend/competitions/{models,participant_views,participant_serializers,permissions,urls,serializers,admin}.py`, `app.js`, `pages.js`, `workspaces.js`, `styles.css`, and migration `competitions.0002_participant_activity`.

## External-link diagnosis and correction

The frontend uses a normal anchor with `target="_blank"` and `rel="noopener noreferrer"`. It has no registration write handler. The Chrome script called `scrollIntoView({block:'center'})`, then immediately measured coordinates. The application stylesheet sets `scroll-behavior: smooth`; the scroll had not finished when the script measured the anchor. Mouse coordinates could therefore be outside the viewport or stale.

A focused isolated Chrome reproduction (`python -B backend/competitions/browser_phase8_regression.py --diagnose-link`) measured the original click at x=377, y=1795.40625 while the viewport height was 484 and scrollY was still 0. Hit-testing confirmed those original coordinates did not hit the link. The corrected real mouse click opened the separate tab, with zero registration rows, zero self-report rows and zero JavaScript exceptions. Evidence: `backend/.runtime/phase8-link-diagnosis.log`.

The automation now scrolls with `behavior:'instant'` and confirms `document.elementFromPoint` hits the official anchor before dispatching real Chrome mouse events. It verifies a separate target opened at the controlled official fixture, closes that target, and restores focus before subsequent actions. Frontend link behavior and publication policies were unchanged.

The final browser run checked that the first link click creates neither an internal registration nor an external self-report. After explicitly saving a report, a second link click leaves its full database row, including timestamps, unchanged and still creates no internal registration. Backend tests also reject attempts to register internally for external events.

Other automation corrections: guard `document.body` while navigation is in progress; wait for review inputs/filter controls after queue reloads; retry temporary Chrome profile cleanup briefly when Windows still holds files open. These fix script timing and cleanup failures without weakening application assertions.

## Validation

The full Django suite passed **247/247 tests** in **745.169 seconds**: 67 accounts, 54 competitions and 126 discovery. Command: `.venv/Scripts/python.exe -B manage.py test --verbosity 1` from `backend`. Result: `Ran 247 tests ... OK`, exit 0. Expected mail-delivery/source-failure log messages came from failure-path tests; the suite reported no failures or errors. Final result is also recorded in `backend/.runtime/phase8-test-result.json`.

`python -B manage_local.py check`: no issues. `python -B manage_local.py makemigrations --check --dry-run`: no changes detected.

### Chrome Phase 8: 11 workflows passed

Command: `python -B backend/competitions/browser_phase8_regression.py`.

1. Participant login through real Django sessions.
2. Account bookmark survives page refresh.
3. Internal registration and refreshed status persist.
4. Official link opens a separate tab without registration/report side effects.
5. Explicit external self-report persists, carries the unverified label, and is unchanged by another official-link click.
6. My Competitions shows real internal and external activity.
7. Bookmarks, registrations and the exact external report survive logout/login.
8. Explore filters and imported-source attribution remain available.
9. Explore card bookmarks persist through Django.
10. Owning organizer sees registrants without private email.
11. Cross-organizer workspace and direct registrant API access are denied.

Zero uncaught JavaScript exceptions. All fixtures, accounts and migrations used disposable SQLite databases and a dedicated Chrome profile. The external destination was a local controlled page that performs no registration. No API response mocks or real-account writes were used. Evidence: `backend/.runtime/phase8-browser.log`.

### Chrome Phase 7: 9 workflows passed

Command: `python -B backend/discovery/browser_phase7_regression.py`.

Staff login; source health/cooldowns/counts; persisted approval; persisted rejection; reviewed update application; public Explore/tag search/default Upcoming/freshness; Asia/Dhaka calendar requests without date shifts; unavailable-backend error display; authenticated nonstaff denial.

The run used another disposable database and real Django APIs. Evidence: `backend/.runtime/phase8-phase7-browser.log`. The full Django suite additionally covers existing connectors, university parsing, schedules, Facebook authorization, review rules, duplicate handling, publication boundaries and discovery reliability. No real imports, policy changes or source bootstrap were performed for verification.

## Database safety and migration

Only `competitions.0002_participant_activity` was pending. It adds `Competition.registration_mode` with default `external`, three participant activity tables, foreign keys, indexes and constraints. SQLite rebuilds tables to add some constraints; original-column row comparison is required despite the additive model change.

`backend/competitions/verify_phase8_migration.py` creates a SQLite backup, checks integrity and foreign keys, compares every original table's count and sorted row hash, then migrates and verifies a restored disposable copy. `--apply` is reserved for use after the test/browser gates pass and application writers are stopped. It checks the real database has not changed since backup before migration, preserves all original application rows, verifies original framework metadata remains present, and rechecks integrity/foreign keys. Evidence includes hashes and counts without account values or credentials.

All gates passed before application. No application server or import worker was running at the final process check. The final backup and another restored-copy rehearsal passed immediately before applying the migration.

- Applied migration: `competitions.0002_participant_activity` only.
- Verified backup: `backend/.runtime/backups/phase8-before-20261105-131035.sqlite3` (524,288 bytes).
- Backup SHA-256: `2afeac93211b82f3be9201955355e3b3adf97abc272825cc218bdabcb333c695`.
- Detailed before/after columns, counts, row hashes and checks: `backend/.runtime/backups/phase8-before-20261105-131035.verification.json`.
- Every original application row and value preserved, including account password hashes, sessions, source configuration/publication policies, candidate payloads, run history and competition timestamps. All original framework metadata rows remain present.
- Nine existing competitions remain external. All three new activity tables are empty; no test accounts or test activity were added to the real database.
- SQLite `PRAGMA integrity_check`: `ok`. `PRAGMA foreign_key_check`: no violations.
- Original competition indexes remain present. Post-migration `check` reports no issues; `migrate --check` exits 0; both competition migrations are marked applied.
- The backup hash was verified again after migration. Its logical snapshot matched the original and its restored copy migrated successfully.

| Table | Before | After |
| --- | ---: | ---: |
| `accounts_organizerprofile` | 1 | 1 |
| `accounts_participantprofile` | 4 | 4 |
| `accounts_profileimage` | 0 | 0 |
| `accounts_recruiterprofile` | 0 | 0 |
| `accounts_user` | 7 | 7 |
| `accounts_user_groups` | 0 | 0 |
| `accounts_user_user_permissions` | 0 | 0 |
| `auth_group` | 0 | 0 |
| `auth_group_permissions` | 0 | 0 |
| `auth_permission` | 62 | 74 |
| `competitions_competition` | 9 | 9 |
| `competitions_competitionbookmark` | new | 0 |
| `competitions_competitionregistration` | new | 0 |
| `competitions_externalparticipation` | new | 0 |
| `discovery_facebookpage` | 0 | 0 |
| `discovery_importcandidate` | 87 | 87 |
| `discovery_importrun` | 37 | 37 |
| `discovery_importsource` | 19 | 19 |
| `django_admin_log` | 1 | 1 |
| `django_content_type` | 15 | 18 |
| `django_migrations` | 27 | 28 |
| `django_session` | 4 | 4 |

Only expected Django metadata gained rows: 12 permissions and 3 content types for the new models, plus 1 migration record. All application counts are unchanged.

A post-migration API smoke check used SQLite query-only mode: public list and detail returned 200, all 9 public records expose external mode, and anonymous participant/organizer private routes were denied. An independent raw SQLite snapshot then matched every post-migration table hash and count exactly. Evidence: `backend/.runtime/phase8-post-migration-smoke.json`.

The migration verifier intentionally refuses to run again when this migration is already applied. Retain the verified backup privately; it contains real account data. Do not overwrite the current database with it during normal startup.

## Remaining limitations

- External registrations cannot be confirmed by opening a link. External reports remain participant claims and are not shared with organizers.
- Internal registration currently records the individual account; team rosters, capacity, payments, project submission, organizer editing of registration status and email delivery are outside this implementation. Withdrawal cannot be reopened.
- Existing preview hiring, job fairs, results/rankings and other sample workflows remain previews. Legacy local saves are not migrated into account records.
- Phase 7 limitations remain: incomplete upstream metadata, upstream layout/availability changes, no OCR/PDF detail extraction, no automatic cancellation reconciliation, conservative duplicate detection, bounded review/history responses, unconfigured Facebook where credentials are absent, and no production worker supervision.
- Frontend startup depends on external CDN scripts; browser navigation can be slow or fail if those services are unavailable. Tests use controlled event destinations and do not prove availability or registration success on third-party event sites.
- SQLite and local development settings remain in use; production deployment/security hardening is a separate task.

No database reset, account overwrite, publication-policy change, or file copy from the 26 October version was performed.
