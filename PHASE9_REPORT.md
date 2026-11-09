# Phase 9 implementation report

Date: 5 November 2026, Asia/Dhaka.

Status: complete for the requested Phase 9 local security hardening and regression scope. The final full Django suite, all four Chrome runs, configuration checks and final data-preservation audit have finished. This is not a claim of complete security or production readiness.

## A. Verified project

`E:\TalentSquare\3rd Nov`. The Phase 7 and Phase 8 reports were read before editing. The current models, routes, frontend API calls, server code and migration state were inspected. Phase 8 is applied; the real database initially contained 7 users, 9 competitions, 19 sources, 87 candidates and 37 import runs. Initial integrity and foreign-key checks passed. No files were taken from the 26 October version.

## B. Confirmed legacy authentication findings

Both old frontend servers accepted a nonempty password without verifying it. A known JSON user received a fabricated token; an unknown email received a fabricated participant identity. Python filtered its synthetic password-hash field from login output, while Node returned the matching JSON user object. Neither response established a genuine Django session.

Both legacy registration implementations could add JSON demo accounts without genuine Django authentication. Python's recovery endpoint created timestamp-based reset entries and claimed instructions were dispatched; the legacy recovery behavior did not use Django's actual token/email workflow. The demo competition submission endpoints accepted unauthenticated submissions into JSON storage, and the demo competition listing exposed that storage.

These were real misleading frontend-server behaviors, not a Django password-verification bypass. They could convince a visitor they had an account/session when Django had never authenticated them. Their wildcard CORS made these legacy endpoints unnecessarily available cross-origin. Node also listened on all interfaces by default.

The current frontend does not require these APIs. Inspection of `app.js`, `pages.js` and `workspaces.js` confirmed that real account forms, profiles, competition discovery, organizer submission and participant activity already call Django on port 8001. Login state is not taken from localStorage. Therefore no genuine feature needed migration to a second authentication system.

## C. Security fixes

- Removed legacy password acceptance, fabricated identities/tokens, demo registration and JSON writes from both servers.
- Frontend `/api/auth` and its descendants, plus `/api/competitions` and its descendants, return explicit HTTP 410 JSON. Trailing slashes and supported methods cannot revive them. Responses contain no tokens, identities, cookies or redirect locations and do not echo submitted passwords.
- Kept safe health and explicitly labeled read-only rankings/job-fair previews. Unknown frontend APIs return JSON 404; writes to read-only endpoints return 405.
- Kept both frontend hosts on loopback. Added nonlocal Host rejection, strict decoded-path checks, explicit page/asset allowlists, resolved asset-boundary checks and GET/HEAD protection. Sample job-fair detail slugs remain valid.
- Removed wildcard frontend CORS. Added no-store, no-referrer, nosniff and frame-denial headers. Query strings are excluded from Python request logs; neither server logs request bodies.
- Added no-store/private headers to Django account, participant, organizer, discovery and admin responses, including denied requests. Authentication, permissions and CSRF logic were not weakened.
- Added explicit environment configuration and fail-closed production validation. Local HTTP behavior and the existing local development secret remain unchanged.

## D. Python frontend server

`server.py` now hosts only approved public assets/page routes and safe read-only preview/health responses. It no longer loads, seeds, repairs, overwrites or saves `platform_db.json`. Retired APIs do not parse password-bearing JSON. The server uses the script's public directory instead of exposing an arbitrary working directory. Default address remains `127.0.0.1:8000`; `PORT` can change the local port only.

## E. Node frontend server

`server.js` now has the same API/file boundary as Python, binds explicitly to `127.0.0.1`, rejects untrusted hosts and unsafe paths, and limits headers/request timeouts. It has no JSON account-storage or request-body authentication parser. The real HTTP security tests executed Node, not a mock.

Node was absent from PATH. A portable Node v24.22.2 executable was downloaded from nodejs.org into the private `.runtime/tools` folder after its archive SHA-256 matched the official checksum list. No npm/Python packages, global PATH changes or system service were installed. Provenance/checksums are recorded in `backend/.runtime/tools/node-runtime.json`.

## F. Genuine Django authentication

The real `/api/auth/register/`, `/api/auth/login/`, `/api/auth/logout/`, `/api/auth/me/`, profile, CSRF and recovery routes remain present and use Django sessions. Password hashes, role profiles, owner checks and existing records were preserved. Tests cover signup for participant/organizer/recruiter, bad-password denial, login/logout, session persistence, private profiles, profile updates, recovery expiration/single use, CSRF/CORS, role-field rejection and inactive/unauthorized access.

New regressions confirm fabricated bearer tokens do not authenticate, users cannot promote themselves through signup/profile fields, and workspace role query strings cannot confer organizer/staff rights. Existing account tests continue to cover role-specific registration and profile validation.

## G. Phase 7 discovery preservation

All discovery Python file hashes match the baseline; connectors and policies were not edited. The full suite preserves Codeforces, AtCoder, MLH, all 15 Bangladesh university adapters, disabled Facebook authorization, scheduling, retries, Retry-After, duplicate warnings, lease/run recovery, source health, review-first boundaries, freshness and staff permissions.

The existing Phase 7 Chrome script passed all 9 workflows against a disposable database: real staff login, health/cooldowns/counts, approval, rejection, reviewed updates, public discovery/search/Upcoming/freshness, Dhaka dates, backend-failure display and nonstaff denial. No live imports or worker were run on the project database. Existing upstream-availability/metadata limitations still apply.

## H. Phase 8 participation preservation

The existing Phase 8 Chrome script passed all 11 workflows with zero uncaught JavaScript errors. It verifies real bookmarks, registration, external-link side-effect protection, explicit unverified external reports, refresh/login persistence, Explore saves, minimal organizer data and cross-organizer denial. Its official destination is a controlled local page.

The full Django suite also preserves withdrawal history/deadlines, uniqueness/concurrent registration, participant ownership, strict write input, external/internal separation and organizer ownership. Existing activity tables were empty at baseline and remain empty in the real database; all write testing used disposable databases.

## I. Files modified or added

Application changes: `server.py`, `server.js`, `backend/config/settings.py`, new `backend/config/deployment.py`, and `backend/accounts/middleware.py`.

Verification: new `backend/accounts/frontend_test_support.py`, `test_frontend_security.py`, `test_security_phase9.py`, `browser_phase9_regression.py`, and `verify_phase9_preservation.py`.

Documentation/reproducibility: `README.md`, new `SECURITY.md`, `PHASE9_REPORT.md`, and `backend/requirements-lock.txt`.

Private evidence and the portable test runtime are under the already ignored `backend/.runtime` directory. `app.js`, `pages.js`, `workspaces.js`, `styles.css`, discovery implementation, Django auth views/URLs, models and migrations were not changed.

## J. Database changes

None. No schema migration was necessary or applied. No account/password, competition, participation, source, candidate, run, session or publication-policy record was changed. No reset, deletion, source bootstrap or live import was performed. The existing Phase 8 verified backups remain private and untouched.

## K. Automated test results

`python -B manage_local.py check`: no issues. `makemigrations --check --dry-run`: no changes. `migrate --check`: no pending migrations.

`python -B manage_local.py test --noinput`: **279 tests passed in 482.608 seconds**, exit 0. This includes all original 247 tests plus 32 new regressions: 18 real frontend HTTP tests (9 Python, 9 Node), 8 Django trust-boundary tests and 6 deployment-configuration tests. There were no skips or failures. Expected error-path log messages do not represent failed tests. Final targeted rerun of all 32 new tests also passed, including the sample event slug compatibility assertion.

Frontend tests run copied current code/assets with disposable private canary files, demo JSON and random loopback ports. They verify login/register/recovery retirement, no fake sessions or token disclosure, all supported methods, private DB/outbox/source/environment/log denial, traversal rejection, preserved pages/assets/headers, Host restrictions, scoped methods/CORS and labeled previews. Django write tests use test databases.

Evidence: `backend/.runtime/phase9/django-tests.log`, the Phase 7/8 Chrome logs in that directory, and the machine-readable `summary.json`. All temporary test servers and Chrome profiles were shut down after verification; no permanent worker or service remains running.

## L. Expanded Chrome integration

**Python frontend: 16/16 passed. Node frontend: 16/16 passed.** Both processes exited 0, with zero uncaught JavaScript exceptions. These runs use real Chrome, genuine forms/APIs, isolated migrated databases, temporary accounts/private email outboxes and a controlled official destination; they do not mock API responses or run imports.

Each frontend passed:

1. Participant signup creates a real hashed-password account/session without staff privileges.
2. Profile editing persists to the correct account.
3. Internal registration and bookmark create real Django records.
4. External link opens a separate tab without creating activity; explicit external self-report persists.
5. Password recovery uses Django and the isolated private outbox without exposing a token.
6. Full refresh and logout/login preserve session/account activity.
7. Workspace query parameters cannot grant organizer/staff permissions.
8. Organizer signup uses Django.
9. Organizer submission retains its owner and internal mode, stays Pending Review and is not published.
10. The owning organizer sees minimal registrant data; another organizer receives 404.
11. Confirming withdrawal retains the registration/history and withdrawal timestamp.
12. Recruiter signup uses Django.
13. Job-fair/rankings preview labels remain available.
14. Staff participants cannot read another participant's registration.
15. Staff can inspect Live Imports without running an import.
16. A real browser POST to legacy login receives explicit 410 without a token.

Chrome network assertions also confirm form writes go to Django rather than the frontend demo API. Withdrawal is confirmed through the actual browser confirmation dialog. The test harness scopes form controls, waits for React route changes, checks displayed status labels and independently inspects stored fixture rows. Initial harness selector/expectation failures were corrected; final runs had no suppressed application assertions.

Evidence: `backend/.runtime/phase9/python-chrome.log` and `node-chrome.log`. Together with the original 11 Phase 8 and 9 Phase 7 workflows, this phase completed **52 successful browser workflow executions** across four runs. Node compatibility was tested on v24.22.2, not every Node release.

## M. Production configuration assessment

Development `check --deploy` correctly reports **1 error and 6 warnings**: `mail.E001` for the development file outbox, plus `security.W004`, `W008`, `W009`, `W012`, `W016` and `W018` for HSTS, HTTPS redirection, the development secret, insecure-over-HTTP cookies and DEBUG. These settings preserve localhost development and must not be used publicly.

An isolated production-mode settings check used temporary random configuration-check credentials, reserved test hostnames, SMTP configuration without sending mail, and a disposable SQLite path. It completed with **0 errors and 2 intentional warnings**: `security.W005` (HSTS subdomains) and `W021` (preload). Those switches stay off until domain-wide HTTPS/preload review. No production credentials or deployment were changed. This was a configuration simulation, not validation of a real hosting environment.

Production mode rejects DEBUG, missing/weak/development secrets, missing/wildcard hosts, non-HTTPS or wildcard origins, insecure cookies, disabled HTTPS redirection and the local mail outbox. Proxy-scheme trust is explicit and off by default. Environment variables, including cache and absolute SQLite-path overrides, are explained in [SECURITY.md](SECURITY.md). Existing SMTP configuration remains available. [Django's deployment checklist](https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/) and [proxy-header settings](https://docs.djangoproject.com/en/6.1/ref/settings/#secure-proxy-ssl-header) informed this assessment.

The existing image pipeline already bounds sizes/dimensions, validates and re-encodes supported still images, strips metadata, rejects unsafe formats, checks ownership/CSRF and respects profile privacy. External event/profile links are validated by existing serializers and opened with the existing safety attributes; opening an official link does not verify a registration. The icon HTML sink was inspected and uses the application-owned SVG lookup, not submitted user HTML.

## N. Existing data preservation

Before/after table counts and sorted original row hashes match exactly, including all users/password hashes, profiles, activity, source configuration and publication policies. The **entire SQLite file** SHA-256 is unchanged:

`d0a5901a241c11a2638e9de8729a63c7e519d919272285be3b05d39b62b4b97b`.

The legacy JSON file hash and all discovery Python hashes are also unchanged. SQLite integrity is `ok`; foreign-key violations: **0**. Evidence: `backend/.runtime/phase9/baseline.json` and `preservation.json`. The post-browser comparison reconfirmed this state; `final-preservation-check.log` records the final audit output.

| Record type | Before | After |
| --- | ---: | ---: |
| Users | 7 | 7 |
| Participant profiles | 4 | 4 |
| Organizer profiles | 1 | 1 |
| Recruiter profiles / profile images | 0 / 0 | 0 / 0 |
| Competitions | 9 | 9 |
| Bookmarks / internal registrations / external reports | 0 / 0 / 0 | 0 / 0 / 0 |
| Discovery sources | 19 | 19 |
| Candidates | 87 | 87 |
| Import runs | 37 | 37 |
| Facebook Pages | 0 | 0 |
| Sessions | 4 | 4 |
| Migration records | 28 | 28 |

## O. Remaining security/deployment risks

This is a hardened local development application, not complete security or production readiness. Outstanding work includes HTTPS/proxy/production process hosting; public frontend API-origin configuration (the current browser bundles deliberately target localhost HTTP port 8001); replacing floating CDN scripts with a reviewed pinned frontend build/CSP strategy; shared/gateway rate limits and signup abuse controls; real SMTP delivery verification; database scaling, private file permissions, backup retention/restore operations, monitoring and supervised workers.

The existing local-memory rate limiter is process-local; login keys use an IP/email pair, so it is not a complete credential-stuffing defense. Deployments must review proxy/client-IP handling. The lockfile records the installed Python environment but does not certify packages against all vulnerabilities. No public-host penetration test, multiworker load test, real SMTP delivery or external event registration was performed. Existing discovery metadata/upstream-layout limitations and legal/privacy draft limitations remain.

## P. Local startup

From the verified project folder, in separate PowerShell terminals:

```powershell
python -B server.py
python -B manage_local.py runserver 127.0.0.1:8001 --noreload
```

Use `node server.js` instead of `server.py` for the alternative frontend. Open `http://127.0.0.1:8000`. Normal startup of the preserved database requires no reset, migration, bootstrap or worker. Do not run both frontends on port 8000 simultaneously. See [SECURITY.md](SECURITY.md) for all commands and restrictions.

## Q. Manual browser verification

Use a disposable database for signup, profile edits, registrations, withdrawal and organizer submissions. The supplied Chrome scripts prepare that environment automatically; do not use old scripts that write to the active database.

1. Run `browser_phase9_regression.py --frontend python`, then repeat with `--frontend node`, with ports 8000/8001 free.
2. For interactive checking, start an explicitly isolated Django database/server, visit signup for each role, check automatic login, edit the matching profile and refresh.
3. Bookmark/register for a published internal fixture, track an external fixture, refresh and log out/in. Confirm the official link opens separately without changing activity.
4. Submit an organizer fixture and confirm Pending Review. Confirm the owning organizer sees minimal registrant data and another organizer cannot access it.
5. Visit Live Imports as staff and as nonstaff; verify the access boundary without running an import. Query-string role changes must not grant backend rights.
6. Confirm job fairs/rankings still show previews. In DevTools, a POST to the frontend legacy `/api/auth/login` must return 410 with no token. GET/HEAD for private database, source, outbox and `.env` paths must fail.

## R. Recommended next phase

Prepare and verify an isolated staging deployment: pinned frontend build and API-origin configuration, production HTTPS/process hosting, secrets/SMTP, shared abuse controls, supervised services, monitoring and restoration drills. Complete deployment/security review before adding Job Fairs, Recruitment or Rankings. No such product features were implemented in Phase 9.
