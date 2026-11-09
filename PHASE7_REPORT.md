# Phase 7 delivery report

Verified project: **E:\TalentSquare\3rd Nov**. Date: **4 November 2026, Asia/Dhaka**.
No files were copied from another project version.

## A–F. Scope and connectors

**IMPLEMENTED AND VERIFIED:** Existing Codeforces, AtCoder and MLH connectors are preserved.
Limited read-only retrieval parsed **9, 9 and 67** upcoming records respectively. Retrieval
did not execute imports, create candidates or publish competitions in the application database.

All 15 Bangladesh adapters remain implemented: UIU, BUET CSE, NSU ECE, DIU, RUET, Khulna
University, GSTU, Dhaka University, AIUB, IUT, Jagannath University, Jahangirnagar IIT, UAP CSE,
Rajshahi University and KUET. Shared parsing/validation improvements are fixture verified:

- A campus venue no longer invents a university host or format.
- Announcement links are no longer invented as university registration links.
- Explicit previous-year editions are excluded; undated candidates remain private.
- Dated and possible/undated competition announcements have separate classifications.
- Explicit UIU/NSU schedules retain Asia/Dhaka parsing; publication dates are never event dates.
- Robots challenges, pacing rules, redirects, errors, response sizes and timeouts are controlled.

**PARTIALLY IMPLEMENTED:** University discovery remains announcement collection, not comprehensive
automatic extraction of complete event metadata. Current live checks parsed BUET 1, DIU 1,
RUET 2 and UAP 1. GSTU, Jahangirnagar IIT and Rajshahi University returned readable zero-match
responses. UIU, NSU, Khulna, Dhaka University, AIUB, IUT, Jagannath and KUET were unavailable
during the Phase 7 check. Every adapter has fixture coverage. Zero matches do not establish
that a university has no upcoming competition. Availability errors are not classified as policy blocks.

**Facebook:** Integration preserved and fixture verified; **PARTIALLY IMPLEMENTED operationally**.
OAuth, encryption, suggestions and staff review remain. Facebook stays disabled/unconfigured with
zero connected Pages. No credentials were requested. A Facebook permalink is retained as evidence,
not guessed as a registration link. No OAuth security behavior was weakened.

**NOT IMPLEMENTED:** Dedicated ICPC/Asia regional, Devpost, SUST, CUET and BRAC connectors.
These were not added merely to increase scraper count. No current source was conclusively
classified BLOCKED BY ACCESS POLICY from this phase's live failures. Policy denial or unsupported
pacing, when encountered, stops the adapter; the implementation does not bypass it.

## G–I. Worker reliability

**IMPLEMENTED AND VERIFIED:**

- Failure backoff: configured interval × 1, 2, 4, 8... capped at 24 hours without shortening
  longer configured intervals. Successful collection resets the failure streak.
- HTTP 429/503 Retry-After supports seconds and aware HTTP dates; a valid later server deadline
  extends normal backoff. Invalid/negative/past/overflowing values fall back safely.
- Manual force bypasses ordinary intervals, not failure cooldowns, leases or paused sources.
- Atomic lease acquisition and initial history creation; network requests remain outside transactions.
- Expired 15-minute leases permit interrupted run finalization without deleting history/counts.
- Active leases protect running history. Obsolete workers cannot release successor leases or
  resurrect recovered runs. Candidate writes verify lease ownership inside a transaction.
- Recovery of older orphan history does not overwrite newer successful source health/scheduling.
- Partial import counts are retained. One source failure does not stop other sources.
- Ctrl+C marks interruption and releases the owned lease. Abrupt termination uses later recovery.
- Robots Crawl-delay/Request-rate is honored within the bounded adapter; longer pacing stops
  collection for staff review instead of ignoring it.

No Celery, Redis, Task Scheduler entry, service or permanent worker was installed or started.
Automatic operation still requires a separate worker process. Production supervision is **NOT IMPLEMENTED**.

## J–L. Duplicates, source health and staff review

**IMPLEMENTED AND VERIFIED:** Source/external-ID uniqueness and canonical competition URL checks
remain. Candidate URL checks and normalized-title warnings add date, confirmed organizer or same-source
corroboration. Similarity alone never merges cross-source events. Warnings hold automatic publication
for review. A published event is not warned as a duplicate of its own candidate. Organizer-created
records are not overwritten.

Live Imports now displays actual attempted/successful/failed timestamps, next eligible collection,
failure streak, retry state, pending/approved/rejected totals, total runs and latest result. Skipped
runs do not masquerade as successful checks. Health uses retained history, not invented scores.
Per-response health caching avoids recalculating the same source for every candidate.

The review queue shows last seen, missing metadata, classification, freshness, raw source data,
last-applied data, staff overrides, source changes and duplicate warnings. Existing notes, permissions,
CSRF, update approval and administrator-edit preservation remain. University records cannot publish
without staff-confirmed required details and an evidence note.

## M–N. Public Explore and security

**IMPLEMENTED AND VERIFIED:**

- Tag search reaches the real Django query.
- Upcoming includes future competitions with open, closed or unknown registration deadlines.
- Home and Explore default to Upcoming; explicit filters/detail URLs preserve historical access.
- Calendar ranges use local calendar dates and the browser's IANA timezone, including Asia/Dhaka.
- Public notices truthfully show overdue/unavailable sources, pending updates, passed dates,
  manual-verification needs and absence from a successful feed without asserting cancellation.
- Imported listings link to an event website without claiming that every link is a registration form.
- Public freshness does not expose staff snapshots, overrides or secrets.
- Staff/reviewer permissions, session authentication, CSRF, fixed endpoints, private-file protection,
  redirect denial and bounded requests remain. No extra permissions were granted.

Separate legacy frontend-server demo authentication remains a known issue outside this phase.
Discovery and browser verification use real Django authentication, never those demo endpoints.

## O–P. Database and files

**No model/schema changes, migration files or real database migrations.** No backup/restore was needed
because the application database was never migrated or changed. Temporary browser databases were
created from migrations independently; the existing application database was not copied into them.

Files added:

- `DISCOVERY.md`
- `PHASE7_REPORT.md`
- `backend/discovery/health.py`
- `backend/discovery/test_phase7.py`
- `backend/discovery/browser_phase7_regression.py`

Existing files modified:

- `README.md`
- `app.js`
- `pages.js`
- `workspaces.js`
- `styles.css`
- `backend/discovery/connectors.py`
- `backend/discovery/schedule_connectors.py`
- `backend/discovery/university_connectors.py`
- `backend/discovery/facebook.py`
- `backend/discovery/services.py`
- `backend/discovery/serializers.py`
- `backend/discovery/management/commands/run_import_worker.py`
- `backend/discovery/test_universities.py`
- `backend/discovery/test_facebook.py`
- `backend/competitions/views.py`
- `backend/competitions/serializers.py`

Existing university/Facebook test expectations were updated to require explicit confirmed registration
links and to reject campus-as-host inference; no existing test was deleted. Accounts, models,
permissions, URL routes, historical migrations, job fairs, recruitment and ranking implementations
were not changed. The dark gradient interface and existing URLs are retained.

## Q–S. Verification results

- `python -B manage_local.py check`: passed, no issues.
- `python -B manage_local.py makemigrations --check --dry-run`: no changes detected.
- `python -B manage_local.py test --noinput`: **212 tests passed**, zero failures/skips,
  **282.991 seconds**. Baseline was 176; this phase adds 36 tests.
- The final worker/duplicate edge-case edits were additionally verified by rerunning all
  **53 tests** in `discovery.test_phase7` and `discovery.test_services`; all passed.
- A focused **115-test** discovery run also passed.
- All test database writes were isolated from the application database.

**Real browser testing: IMPLEMENTED AND VERIFIED.** The new Chrome script uses real frontend
assets and real Django responses with a disposable SQLite database. It tests staff login, source
health/cooldown/counts, candidate approval/rejection, published-update approval, public listings,
tag-search requests, default Upcoming, freshness, a Dhaka calendar-range request, an unavailable
backend and authenticated nonstaff denial. No API responses are mocked. No uncaught JavaScript
exceptions were reported. It starts/stops only its own test processes and does not run imports.

Live source retrieval results are described above and in DISCOVERY.md. Facebook was not live tested.
No claim is made that unknown university event details were independently verified.

## T. Existing data preservation

Verified before implementation and after testing:

| Item | Before | After |
| --- | ---: | ---: |
| Users | 7 | 7 |
| Competitions, all published/imported | 9 | 9 |
| Import sources | 19 | 19 |
| Import candidates | 87 | 87 |
| Import runs | 37 | 37 |
| Facebook Pages | 0 | 0 |
| Approved candidates | 9 | 9 |
| Pending candidates | 78 | 78 |

Every SQLite table count and ordered-row digest matched the baseline. The complete SQLite file
SHA-256 also remained identical:

`c89ecb0959e3aba34bffe5b7edb1d218fcfb3a4bc8e24a5f6b288bbe254fa928`

SQLite quick_check returned `ok`; foreign_key_check returned no issues. Passwords, accounts,
competitions, candidates, run history and all source settings remained intact. Codeforces alone
retains automatic publication; AtCoder/MLH remain review-first and university/Facebook rules remain.

## U–X. Limitations, startup, manual checks and next phase

Remaining limitations: incomplete/undated university metadata, upstream availability/layout changes,
no OCR/PDF detail extraction, no automatic cancellation reconciliation, conservative rather than
definitive duplicate identity, fixed queue/history response limits, unconfigured Facebook and no
production worker supervision. Production settings and legacy demo authentication need separate work.

PowerShell startup from `E:\TalentSquare\3rd Nov`, in separate terminals:

```powershell
python -B server.py
python -B manage_local.py runserver 127.0.0.1:8001 --noreload
```

When deliberately enabling actual recurring collection in a separate terminal:

```powershell
python -B manage_local.py run_import_worker
```

No migration or source bootstrap is necessary for this existing database. The website alone does
not run imports. Ctrl+C stops the worker; this is not a supervised permanent service.

Manual checks:

1. Open `http://127.0.0.1:8000/login` and sign in with an authorized Django staff account.
2. Open `/admin?tab=live-imports`; inspect actual health, timestamps, counts and next eligibility.
3. Open Review queue; inspect original evidence, missing fields and separate snapshots/overrides.
4. Open `/competitions`; verify Upcoming, tag search, calendar filters, original links and freshness.
5. Use `python -B backend/discovery/browser_phase7_regression.py` with ports 8000/8001 free for
   isolated approval/rejection/update and error testing. Do not approve real pending notices just
   to test the UI, and do not run older live-data browser scripts for this check.

Recommended next phase: deployment/security hardening, supervised worker operation, monitoring and
backup restoration checks; then implement participant registration/tracking as a separate product phase.

Detailed beginner-friendly instructions and troubleshooting: [DISCOVERY.md](DISCOVERY.md).
