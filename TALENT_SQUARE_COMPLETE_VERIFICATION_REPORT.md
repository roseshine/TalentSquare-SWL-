# Talent Square complete verification report

Read-only audit, 6 November 2026, Asia/Dhaka. No application repairs or feature changes were authorized or performed. Evidence labels: **LIVE VERIFIED** = current direct HTTP or process/database observation; **ISOLATED TEST VERIFIED** = actual services/Chrome with temporary records and controlled external responses; **CODE INSPECTED ONLY** = implementation observation without corresponding live operation; **NOT VERIFIED** = evidence unavailable; **BLOCKED** = current access/transport gate prevented verification.

## 1. Verified project folder

`E:\TalentSquare\3rd Nov`. Frontend entry: `server.py` serving `index.html`, React code in `app.js`, `pages.js` and `workspaces.js`; their actual served bytes match this workspace. Django entry: `manage_local.py` → `backend/manage.py`, settings `backend/config/settings.py`, database `backend/db.sqlite3`. Existing VS Code server commands use `backend/.venv/Scripts/python.exe`; Windows process inspection also identifies its global Python 3.13 child interpreter. Audit interpreter: `C:\Users\USER\AppData\Local\Programs\Python\Python313\python.exe`, with this project's existing dependency directory. Both report Django **6.1.2**. No packages installed or VS Code configuration changed.

Reviewed the existing README, DISCOVERY, SECURITY, Phase 7/8/9/9A reports, university audit and docs inventories against the current modules, URLs, permissions, settings, serializers, worker/review services and tests. Historical reports are not fresh verification. The current database differs from the previous audit's old hash/session count; this audit captured a new independent baseline before testing.

## 2. Executive summary

The local application, genuine Django session login, staff permission boundary, review-first import pipeline, automatic scheduling mechanism and previous phases pass verification. **Nine university adapters currently fetched and parsed real listings, but zero genuine matching competition announcements were found. Six adapters could not reach their listing stage. No live recurring worker was observed.** Therefore current unattended nationwide competition discovery is not demonstrated. The administrator warning is expected permission handling for a signed-out or unauthorized session; no defect reproduces in isolated sign-in/permission tests. Your exact existing browser session is intentionally unknown.

## 3. Running server status

**LIVE VERIFIED.** Frontend `http://127.0.0.1:8000/` and `/admin?tab=live-imports`: HTTP 200 HTML. Django `/api/competitions/`: HTTP 200, nine public records. `/api/auth/csrf/`: HTTP 200 with CSRF field/cookie; no token or cookie value retained. Listeners are exclusively `127.0.0.1:8000` (PID 19848) and `127.0.0.1:8001` (PID 12240). Commands: `-B server.py` and `-B manage_local.py runserver 127.0.0.1:8001 --noreload`. Multiple launcher/child process entries exist, but exactly one observed listening socket per requested port; no conflicting live listener was observed. The servers were not stopped or restarted.

Available root `server.err.log` and `server.out.log` contain no traceback; they are old files, not a complete live VS Code terminal log. Current probes returned expected results without HTTP 500. Existing terminal output and every historical server exception are **NOT VERIFIED**. Process/listener evidence is retained privately.

## 4. Authentication and staff access findings

`DiscoveryView` enforces DRF `IsAuthenticated` plus `CanManageDiscovery` in Django. `can_manage()` requires an authenticated, active, staff user with **`discovery.manage_discovery`**. Superusers inherit permissions through Django. Viewing sources/candidates/runs and managing/collecting sources require this boundary. Approving, rejecting, applying source updates or confirming details additionally requires **`competitions.change_competition` and `competitions.review_competition`**. University auto-publication is prohibited regardless of the staff UI.

Regular Participant, Organizer and Recruiter accounts are denied; a staff flag alone is insufficient. Query-string preview roles cannot authorize API requests. These checks are backend enforcement, not merely hidden buttons. Frontend login uses `/api/auth/login/` on Django; `requestApi` includes credentials, requests a CSRF token from Django for writes and sends the CSRF header. Authentication is not stored as a frontend bearer token/localStorage identity.

**LIVE VERIFIED / CODE INSPECTED / ISOLATED TEST VERIFIED:** real server responses allow the exact 127.0.0.1 and localhost frontend origins with credentials; CSRF cookie is HttpOnly, SameSite=Lax and non-Secure for local HTTP. Session cookie defaults are HttpOnly/Lax with local HTTP non-Secure; isolated real-login workflows verify browser cookie/session behavior. Cross-port requests are cross-origin but remain same-site when the hostname is consistent. Mixing `localhost` with `127.0.0.1` creates different cookie hosts. No real browser cookies were read, extracted or reused.

## 5. Existing staff account and permission summary

Aggregate | Count
--- | ---
total_users | 7
active_staff | 2
superusers | 2
explicit_direct_or_group_manage | 0
effective_active_manage | 2
legitimate_live_import_users | 2

Two existing active staff superusers are structurally eligible to access Live Imports, even though no explicit user/group permission rows exist. No real credentials were tested, so ownership of a valid password/current session is not established. No need to expose an account identity, email or private profile to demonstrate this. Account structure is consistent; no account was created, promoted, reset or changed in the real database.

## 6. Why the current screen says Staff access is required

`workspaces.js` loads sources, candidates and runs with `Promise.all`. If an API request returns 401 or 403, it sets `status='forbidden'` and renders exactly the reported warning. Cookie-free requests to all three real endpoints returned **403, Authentication credentials were not provided**; `/api/auth/me/` returned **401, Authentication required**. Those requests represent this auditor's anonymous HTTP client, **not your current browser**.

The reported screen is consistent with a signed-out user, an ordinary account, a staff account missing permissions, or a session unavailable on the chosen hostname. No screenshot/cookie evidence establishes which applies to your browser. A backend connectivity failure normally renders a separate “Import service unavailable” state. Isolated Chrome reproduced the warning signed out, denied a regular account, and successfully loaded imports after authorized staff login. No frontend/backend permission defect reproduced. The “Check access again” control increments revision, reruns the effect and makes a fresh authorization request; this was verified in Chrome.

## 7. Safe steps to access using an existing authorized account

1. Use `http://127.0.0.1:8000` consistently and visit `http://127.0.0.1:8000/login`.
2. Sign in with the email and password of an **existing authorized administrator account you recognize**. Do not use a Participant/Organizer/Recruiter preview selector as a substitute for login.
3. Return to `http://127.0.0.1:8000/admin?tab=live-imports` and click **Check access again**, or refresh.
4. Optionally open `http://127.0.0.1:8001/admin/` on the same hostname to confirm the expected Django account. Django Admin may use its username field; the frontend login requests email.
5. If still denied, inspect DevTools Network for the status and error message of GET `/api/auth/me/` and the three discovery GETs. Do not copy cookies or CSRF values. An authenticated nonstaff account needs an owner-reviewed account/permission resolution outside this audit; no promotion or password reset was performed.

## 8. Live Imports API verification

Actual routes are defined in `backend/discovery/urls.py`. Real-database requests were **GET only, without cookies**: `/api/discovery/sources/`, `/candidates/`, `/runs/` each returned 403 with no source/review/run rows exposed. Isolated matrix:

Principal | Sources GET | Candidates GET | Runs GET | Incomplete approve PATCH
--- | --- | --- | --- | ---
anonymous | 403 | 403 | 403 | 403
participant | 403 | 403 | 403 | 403
organizer | 403 | 403 | 403 | 403
recruiter | 403 | 403 | 403 | 403
staff-no-permission | 403 | 403 | 403 | 403
manager | 200 | 200 | 200 | 403
reviewer | 200 | 200 | 200 | 400
inactive-superuser | 403 | 403 | 403 | 403

Each allowed fixture GET returns the seeded source, candidate and run. Source serializers expose explicit configuration/health fields; run and candidate serializers expose review evidence only behind staff permissions. They do not serialize user password/session/secret values or Facebook tokens. Manager-only approval receives 403. Fully permitted reviewer passes authorization but receives 400 for an intentionally incomplete candidate, preserving publication validation. All privilege tests use a separately migrated temporary SQLite database. Successful real-account authenticated GETs against the existing database were **NOT PERFORMED**, by design.

## 9. All 15 university source settings

**LIVE VERIFIED through read-only SQLite.** All existing keys remain registered and enabled, interval 360 minutes, auto-publication false. Candidate/run counts below are retained real history, not this audit's discoveries. Pending includes `pending` plus `update_pending`.

University | Connector | Enabled | Interval | Auto-publish | Candidates | Pending | Successful runs | Failed runs
--- | --- | --- | --- | --- | --- | --- | --- | ---
UIU | bd_uiu | True | 360 min | False | 0 | 0 | 1 | 0
BUET | bd_buet | True | 360 min | False | 1 | 1 | 1 | 0
NSU | bd_nsu | True | 360 min | False | 0 | 0 | 1 | 0
DIU | bd_diu | True | 360 min | False | 1 | 1 | 1 | 0
RUET | bd_ruet | True | 360 min | False | 2 | 2 | 2 | 0
Khulna University | bd_ku | True | 360 min | False | 0 | 0 | 2 | 0
GSTU Gopalganj | bd_gstu | True | 360 min | False | 0 | 0 | 2 | 0
Dhaka University | bd_du | True | 360 min | False | 0 | 0 | 2 | 0
AIUB | bd_aiub | True | 360 min | False | 0 | 0 | 2 | 0
IUT | bd_iut | True | 360 min | False | 0 | 0 | 2 | 0
Jagannath University | bd_jnu | True | 360 min | False | 0 | 0 | 2 | 0
Jahangirnagar IIT | bd_ju | True | 360 min | False | 0 | 0 | 2 | 0
UAP CSE | bd_uap | True | 360 min | False | 1 | 1 | 2 | 0
Rajshahi University | bd_ru | True | 360 min | False | 0 | 0 | 2 | 0
KUET | bd_kuet | True | 360 min | False | 0 | 0 | 0 | 1

Times below are the retained SQLite UTC values. Historical success does not prove present accessibility. “None” means no retained evidence, not an invented date.

University | Last attempted UTC | Last successful UTC | Last failed UTC | Next eligible UTC | Latest retained source error
--- | --- | --- | --- | --- | ---
UIU | 2026-10-27 23:02:22.202834 | 2026-10-27 23:02:22.510785 | None | 2026-10-28 05:02:22.138423 | None
BUET | 2026-10-27 23:02:22.660206 | 2026-10-27 23:02:22.982401 | None | 2026-10-28 05:02:22.616751 | None
NSU | 2026-10-27 23:02:23.125782 | 2026-10-27 23:02:26.014460 | None | 2026-10-28 05:02:23.082150 | None
DIU | 2026-10-27 23:02:26.327842 | 2026-10-27 23:02:27.008227 | None | 2026-10-28 05:02:26.282733 | None
RUET | 2026-10-27 23:41:58.713092 | 2026-10-27 23:41:59.238936 | None | 2026-10-28 05:41:58.669759 | None
Khulna University | 2026-10-27 23:41:59.372889 | 2026-10-27 23:41:59.748389 | None | 2026-10-28 05:41:59.328625 | None
GSTU Gopalganj | 2026-10-27 23:41:59.877810 | 2026-10-27 23:42:00.040284 | None | 2026-10-28 05:41:59.833188 | None
Dhaka University | 2026-10-27 23:42:00.215260 | 2026-10-27 23:42:00.634219 | None | 2026-10-28 05:42:00.163080 | None
AIUB | 2026-10-27 23:42:00.786115 | 2026-10-27 23:42:01.243749 | None | 2026-10-28 05:42:00.723737 | None
IUT | 2026-10-27 23:42:01.372464 | 2026-10-27 23:42:01.585486 | None | 2026-10-28 05:42:01.328380 | None
Jagannath University | 2026-10-27 23:42:01.730082 | 2026-10-27 23:42:02.077193 | None | 2026-10-28 05:42:01.685442 | None
Jahangirnagar IIT | 2026-10-27 23:42:02.228450 | 2026-10-27 23:42:02.461756 | None | 2026-10-28 05:42:02.183674 | None
UAP CSE | 2026-10-27 23:42:02.601607 | 2026-10-27 23:42:04.041315 | None | 2026-10-28 05:42:02.548931 | None
Rajshahi University | 2026-10-27 23:42:04.178052 | 2026-10-27 23:42:05.141937 | None | 2026-10-28 05:42:04.131916 | None
KUET | 2026-10-27 23:41:58.424732 | None | 2026-10-27 23:41:58.549208 | 2026-10-28 05:41:58.380662 | University source returned HTTP 500. Try again later.

Codeforces remains enabled/60 minutes/auto-publish true; AtCoder enabled/60 minutes/review-first; MLH enabled/360 minutes/review-first. Facebook remains disabled with zero connected Pages. No source field was altered.

## 10. University-by-university live retrieval

University | Adapter Exists | Enabled | Official URL | Live Fetch Status | Genuine Competitions Found | Pending Candidates | Scheduling Verified | Remaining Problem
--- | --- | --- | --- | --- | --- | --- | --- | ---
United International University | Yes | True | [https://www.uiu.ac.bd/event/](https://www.uiu.ac.bd/event/) | TIMEOUT OR NETWORK ERROR | Not established (no listing) | 0 | ISOLATED TEST VERIFIED | Policy transport failed; listing not requested.
Bangladesh University of Engineering and Technology | Yes | True | [https://cse.buet.ac.bd/](https://cse.buet.ac.bd/)<br>[https://cse.buet.ac.bd/home/all_event](https://cse.buet.ac.bd/home/all_event) | HTTP ERROR | Not established (no listing) | 1 | ISOLATED TEST VERIFIED | Robots HTTP 404; strict collector stopped before listings.
North South University | Yes | True | [https://ece.northsouth.edu/event/](https://ece.northsouth.edu/event/) | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES | 0 | 0 | ISOLATED TEST VERIFIED | No current match in bounded listings; event completeness and live competition metadata unverified.
Daffodil International University | Yes | True | [https://news.daffodilvarsity.edu.bd/category-news/events](https://news.daffodilvarsity.edu.bd/category-news/events) | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES | 0 | 1 | ISOLATED TEST VERIFIED | No current match in bounded listings; event completeness and live competition metadata unverified.
Rajshahi University of Engineering and Technology | Yes | True | [https://ruet.ac.bd/news-and-event](https://ruet.ac.bd/news-and-event) | FETCH BLOCKED BY POLICY | Not established (no listing) | 2 | ISOLATED TEST VERIFIED | unreadable or no applicable directives; listing not fetched
Khulna University | Yes | True | [https://ku.ac.bd/notices](https://ku.ac.bd/notices) | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES | 0 | 0 | ISOLATED TEST VERIFIED | No current match in bounded listings; event completeness and live competition metadata unverified.
Gopalganj Science and Technology University | Yes | True | [https://gstu.edu.bd/dev/notice/](https://gstu.edu.bd/dev/notice/) | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES | 0 | 0 | ISOLATED TEST VERIFIED | No current match in bounded listings; event completeness and live competition metadata unverified.
University of Dhaka | Yes | True | [https://www.du.ac.bd/events](https://www.du.ac.bd/events)<br>[https://www.du.ac.bd/](https://www.du.ac.bd/) | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES | 0 | 0 | ISOLATED TEST VERIFIED | No current match in bounded listings; event completeness and live competition metadata unverified.
American International University-Bangladesh | Yes | True | [https://www.aiub.edu/category/notices](https://www.aiub.edu/category/notices)<br>[https://www.aiub.edu/](https://www.aiub.edu/) | HTTP ERROR | Not established (no listing) | 0 | ISOLATED TEST VERIFIED | Robots HTTP 404; strict collector stopped before listings.
Islamic University of Technology | Yes | True | [https://www.iutoic-dhaka.edu/](https://www.iutoic-dhaka.edu/) | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES | 0 | 0 | ISOLATED TEST VERIFIED | No current match in bounded listings; event completeness and live competition metadata unverified.
Jagannath University | Yes | True | [https://jnu.ac.bd/newsite/noticeview/1](https://jnu.ac.bd/newsite/noticeview/1) | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES | 0 | 0 | ISOLATED TEST VERIFIED | No current match in bounded listings; event completeness and live competition metadata unverified.
Jahangirnagar University | Yes | True | [https://iitju.edu.bd/news-events](https://iitju.edu.bd/news-events) | HTTP ERROR | Not established (no listing) | 0 | ISOLATED TEST VERIFIED | Robots HTTP 404; strict collector stopped before listings.
University of Asia Pacific | Yes | True | [https://cse.uap-bd.edu/office/posts/?type=notice](https://cse.uap-bd.edu/office/posts/?type=notice) | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES | 0 | 1 | ISOLATED TEST VERIFIED | No current match in bounded listings; event completeness and live competition metadata unverified.
University of Rajshahi | Yes | True | [https://www.ru.ac.bd/](https://www.ru.ac.bd/) | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES | 0 | 0 | ISOLATED TEST VERIFIED | No current match in bounded listings; event completeness and live competition metadata unverified.
Khulna University of Engineering and Technology | Yes | True | [https://www.kuet.ac.bd/](https://www.kuet.ac.bd/) | TIMEOUT OR NETWORK ERROR | Not established (no listing) | 0 | ISOLATED TEST VERIFIED | Policy transport failed; listing not requested.

Fresh direct-check evidence, robots first then permitted listing(s):

University | Checked UTC | HTTP/status sequence | Access evidence | Classification
--- | --- | --- | --- | ---
UIU | 2026-11-06T11:29:29.779403+00:00 | URLError | unresolved | TIMEOUT OR NETWORK ERROR
BUET | 2026-11-06T11:29:30.102359+00:00 | 404 | policy HTTP 404; no listing requested | HTTP ERROR
NSU | 2026-11-06T11:29:30.284513+00:00 | 200; 200 | robots allows fixed listing; no bypass used | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES
DIU | 2026-11-06T11:29:34.727655+00:00 | 200; 200 | robots allows fixed listing; no bypass used | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES
RUET | 2026-11-06T11:29:36.869586+00:00 | 200 | unreadable or no applicable directives; listing not fetched | FETCH BLOCKED BY POLICY
Khulna University | 2026-11-06T11:29:37.063252+00:00 | 200; 200 | robots allows fixed listing; no bypass used | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES
GSTU Gopalganj | 2026-11-06T11:29:38.818319+00:00 | 200; 200 | robots allows fixed listing; no bypass used | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES
Dhaka University | 2026-11-06T11:29:40.951273+00:00 | 200; 200; 200 | robots allows fixed listing; no bypass used | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES
AIUB | 2026-11-06T11:29:43.982860+00:00 | 404 | policy HTTP 404; no listing requested | HTTP ERROR
IUT | 2026-11-06T11:29:44.558754+00:00 | 200; 200 | robots allows fixed listing; no bypass used | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES
Jagannath University | 2026-11-06T11:29:46.115913+00:00 | 200; 200 | robots allows fixed listing; no bypass used | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES
Jahangirnagar IIT | 2026-11-06T11:29:48.768034+00:00 | 404 | policy HTTP 404; no listing requested | HTTP ERROR
UAP CSE | 2026-11-06T11:29:49.205967+00:00 | 200; 200 | robots allows fixed listing; no bypass used | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES
Rajshahi University | 2026-11-06T11:29:52.045635+00:00 | 200; 200 | robots allows fixed listing; no bypass used | LIVE FETCH AND PARSE SUCCESSFUL — ZERO MATCHES
KUET | 2026-11-06T11:29:55.232970+00:00 | URLError | unresolved | TIMEOUT OR NETWORK ERROR

Requests were bounded (10-second audit timeout; robots 64 KiB, listing 2 MiB), fixed URLs only, no redirects/retries/detail/registration/attachment crawling. Robots policy and pacing were checked before listings. Missing/unreadable policy stops the existing collector; robots 404 is reported as HTTP ERROR rather than claiming a legal prohibition. Robots allowance is not blanket terms/permission clearance. No new access scope or source activation was introduced. Raw HTML/status/hash evidence stays in the ignored audit directory. **Zero parser-shape errors were observed on the nine readable registered listings; compatibility of six non-fetched listings remains unverified.**

## 11. Actual university competitions found

**Zero matching competition announcements in this fresh bounded live check.** No source-supported live event title/date/original-URL extraction could therefore be validated on an actual current competition. No test fixture was counted as a real discovery. Nine readable archives with zero matches do not prove that their universities have no competitions or that other official departments/clubs are covered. The real 87 candidate rows are retained historical data, not new live findings. No live candidate was saved to the real database.

## 12. Isolated import pipeline verification

**ISOLATED TEST VERIFIED.** Executed the existing `verify_university_worker.py` independently of the full suite. It creates a disposable migrated SQLite database and runs the actual worker in fresh subprocesses with controlled HTTP transport and clock. All 15 connector dispatch/parser/storage paths create one private candidate each; repeated due imports retain 15 rows with unchanged counts; changed payloads become 15 update-pending records without changing public titles; staff overrides survive. Explicit fixture staff confirmation supplies missing publication details rather than pretending they were extracted. Explicit approvals/apply-updates publish 15 controlled competitions via the real review/public API path. Before approval, public count is zero.

An additional isolated HTTP-429 failure probe covers **every one of the 15 adapters**: failed history/error retained, retry scheduled, lease released and no false candidate created. Separate API and Chrome permission tests deny unauthorized reviews. Nothing from these isolated databases is copied into the real application.

## 13. Automatic worker verification

`backend/discovery/management/commands/run_import_worker.py` exists. It polls enabled, supported, due sources, skips paused/future sources, recovers abandoned history and calls normal collection without force. Verified retained due times across restarted subprocesses, two-hour Retry-After, increasing failure backoff, stale-lease finalization with partial counts, recovery then successful error reset, and overlap between two independent worker PIDs with only one active HTTP collector. Repeated imports remain duplicate-free; university results remain review-first.

The real continuous command completed two simulated due cycles with the test clock advanced 16 minutes and recorded poll sleep arguments `[10,10]`. This is **simulated elapsed time**, not observed production uptime. Final fixture totals: 15 sources, 15 candidates, 15 explicitly reviewed public competitions, 53 retained runs. Worker code and isolated automatic scheduling are verified; real unattended collection is a separate condition.

## 14. Is a live recurring worker running?

| Condition | Finding |
| --- | --- |
| Worker code verified | ISOLATED TEST VERIFIED plus code inspection |
| Automatic due scheduling verified | ISOLATED TEST VERIFIED, controlled clock/HTTP |
| Live recurring worker process currently running | No matching live worker observed in process inspection |
| Real unattended repeated university fetching | NOT VERIFIED |

Existing frontend and Django development servers do not automatically start the import worker. Enabled flags and next-run timestamps do not execute work by themselves. Real check history is mostly 27 October; no new real import run was created here. No permanent worker, scheduled task or service was started. An unobserved external scheduler is not ruled out by a point-in-time process snapshot; no evidence establishes one.

## 15. Database preservation and integrity

Opened `backend/db.sqlite3` with SQLite URI `mode=ro`, `PRAGMA query_only=ON`, and a consistent read transaction. Captured table columns, counts and sorted row hashes without retaining sensitive field values; retained source settings/run aggregates separately. Integrity is `ok`, foreign-key violations zero. Final snapshot exactly matches the initial snapshot, including all application/source/account/session rows and schema/migration records. No application command used the real database for test writes.

Byte SHA-256 before and after: `64289bf3e086ea421825398667714b70642aad8f2f93075f8841f24cf944b079`.

Table | Original rows | Final rows
--- | --- | ---
accounts_organizerprofile | 1 | 1
accounts_participantprofile | 4 | 4
accounts_profileimage | 0 | 0
accounts_recruiterprofile | 0 | 0
accounts_user | 7 | 7
accounts_user_groups | 0 | 0
accounts_user_user_permissions | 0 | 0
auth_group | 0 | 0
auth_group_permissions | 0 | 0
auth_permission | 74 | 74
competitions_competition | 9 | 9
competitions_competitionbookmark | 0 | 0
competitions_competitionregistration | 0 | 0
competitions_externalparticipation | 0 | 0
discovery_facebookpage | 0 | 0
discovery_importcandidate | 87 | 87
discovery_importrun | 37 | 37
discovery_importsource | 19 | 19
django_admin_log | 1 | 1
django_content_type | 18 | 18
django_migrations | 28 | 28
django_session | 5 | 5

All original non-runtime application/configuration/documentation file hashes match. No candidate was imported/approved/rejected, source changed, account/password modified, migration applied, dependency installed or live worker started. No backup/migration was necessary because no real-database writes were undertaken. Active user servers remained running; these are before/after observations and cannot prohibit an owner/external process from making future changes.

## 16. Phase 7 preservation

**ISOLATED TEST VERIFIED.** Full suite retains Codeforces API, AtCoder/MLH parsing, duplicate checks, Retry-After/backoff, lease recovery, review and health tests. Nine real Chrome discovery workflows verify staff sources/history/review, private candidate states and public Explore filters including Asia/Dhaka calendar handling, backend-unavailable state and nonstaff denial. International services were not live-refetched in this university-focused audit; their current external availability is **NOT VERIFIED**.

## 17. Phase 8 preservation

**ISOLATED TEST VERIFIED.** Eleven real Chrome workflows plus full automated suite verify bookmarks, internal registration, external link with no registration/self-report side effects, explicit unverified self-report, refresh and logout/login persistence, My Competitions, Explore activity and owned organizer access with cross-organizer denial. Phase 9 browser flows also verify confirmed withdrawal. All use temporary accounts/records.

## 18. Phase 9 preservation

**ISOLATED TEST VERIFIED.** Both frontend servers pass 16 real Chrome workflows each. Full suite covers HTTP-410 legacy auth/competition APIs, private-file/traversal protections, loopback binding, deployment settings and private cache headers. Genuine signup/profile/password-recovery/session and role ownership checks remain enforced. Existing security files were not altered. Production HTTPS, real SMTP, public-origin deployment and shared abuse controls are still deployment work, not certified here.

## 19. Phase 9A preservation

**ISOLATED TEST VERIFIED.** Conservative date precision, ambiguous dates, relevance filtering, original-versus-registration link distinction, publisher/host separation, attachment flags, source/applied/override separation and review history remain tested. Current university Chrome run includes original nine workflows and two audit-only signed-out/retry checks. All 15 adapters retain fixture tests. Historical inventory maps 23 institutions/26 primary targets, plus two previously researched alternative channels in the later inventory; no connector was added or changed now.

## 20. Django automated test results

**313 discovered; 313 passed; 0 failed; 0 skipped; exit code 0.** Runtime 189.767 seconds. System check: no issues (0 silenced), exit 0. Migration consistency: `No changes detected`, exit 0. Commands were actually executed through `run_checks.py`, with `DJANGO_SQLITE_PATH` set to a temporary private path before invoking `manage_local.py`; the standard test runner then creates/destroys its isolated test database. No hashing/auth/security settings were changed. Expected simulated mail/source-failure messages in tests are negative-case output; the suite ended OK.

## 21. Chrome workflow results

Chrome workflow | Passed assertions | Exit | JS exceptions
--- | --- | --- | ---
chrome-university | 11 | 0 | 0
chrome-phase7 | 9 | 0 | 0
chrome-phase8 | 11 | 0 | 0
chrome-security-python | 16 | 0 | 0
chrome-security-node | 16 | 0 | 0

Total **63 workflow assertions passed**, zero final failures, zero uncaught JavaScript exceptions. Original application files were never edited. To avoid interfering with the running servers, the harness created a temporary source mirror, replaced only literal frontend/backend port numbers with free loopback ports 65478 / 65479, and used existing dependencies through a temporary junction. It added two assertions only to the copied university browser harness: anonymous access warning and real authorization retry. Each copied browser script creates/removes its own migrated database, temporary users and child servers/browser profile. No existing credentials/cookies were used. Temporary mirror and dependency junction were removed after the runs. This is real Chrome with genuine Django APIs and controlled external fixtures, not real university browser scraping.

## 22. Remaining scraping blockers

UIU and KUET: policy transport `URLError`, listing unrequested. BUET CSE, AIUB and Jahangirnagar IIT: robots HTTP 404, strict collection gate stops. RUET: robots HTTP 200 without usable directives, listing unrequested. Their current listing parser/data extraction remains unverified. Nine live-readable sources found no matching announcement. Missing competition facts, poster/PDF text and unknown dates still need staff confirmation; PDF extraction/OCR is unsupported. There is no worker heartbeat or proven persistent operation. No repair was attempted during this audit.

## 23. Missing university coverage

Fifteen registered university adapters do not cover every university or every CSE/club channel. The existing eight researched but unimplemented institutions are SUST, CUET, BRAC, EWU, AUST, IUB, DUET and BUP. Historical blockers are documented in the existing inventory: policy/HTTP restrictions, no stable approved upcoming feed, JS shell, gallery/history instead of a future schedule, or alternative content mismatch. They were **CODE INSPECTED ONLY / NOT LIVE RECHECKED in this assignment**; this audit's fresh live network scope is the existing 15. The dated 180-row UGC inventory leaves 157 outside the 23-institution investigation and 165 without adapters. These are dated catalog arithmetic, not a claim about today's exact national count. No invented completion percentage.

## 24. Recommended next fixes by impact

1. Operationally sign in with an existing authorized administrator; no account creation or privilege bypass is needed to resolve the reproduced access restriction.
2. Deliberately deploy/supervise the existing worker with approved source access, backups and monitoring; verify advancing real run timestamps. This has not been done here and would write real candidate/history rows.
3. Obtain readable policies or explicitly approved feeds for blocked institutions; do not bypass gates. Confirm maintained CSE/club sources for SUST/CUET/BRAC before adding adapters.
4. Add a worker heartbeat/operational status only in a separately authorized implementation task; enabled/source health currently cannot establish process liveness.
5. Expand representative genuine upcoming-event fixtures from permitted source evidence, documented date conventions and accurate registration links. Consider bounded attachment support only with reviewed scope/permission and tests. Keep incomplete candidates private.
6. Continue institution-by-institution coverage and staging/deployment work without changing publication policy or weakening account security.

These are recommendations, not changes performed by this verification-only assignment.

## 25. Exact commands and browser steps

Existing user servers were kept running. Do not restart, migrate, bootstrap or use real Run Now merely to inspect them. Read-only browser steps: open `http://127.0.0.1:8000/`, sign in personally with the existing authorized account, open Live Imports, inspect source cards/run times/review queue and retry access. A displayed enabled card is not a live-fetch or worker certificate.

Reproduce this audit's safe checks from the verified root:

```powershell
python -B backend/.runtime/complete_verification/run_checks.py
python -B backend/.runtime/complete_verification/api_permissions.py
python -B backend/.runtime/complete_verification/failures_all_adapters.py
python -B backend/discovery/verify_university_worker.py
python -B backend/.runtime/complete_verification/browser_runner.py
```

The wrapper executes `python -B manage_local.py check`, `makemigrations --check --dry-run` and `test --noinput` with an isolated configured database. The browser wrapper uses alternate ports; do not invoke the older fixed-8000/8001 Chrome scripts while your servers occupy those ports. Optional bounded read-only university recheck, only when appropriate for source pacing:

```powershell
python -B backend/.runtime/complete_verification/live_check.py
```

This retrieves policies/fixed pages and writes only ignored evidence, never candidate rows. For a future intentionally authorized real-data operation, the existing worker command is `python -B manage_local.py run_import_worker --poll-seconds 30`; it is not a read-only verification command and was **not run against the real database**. Actual live import/publication would require a separate operational decision; simulated fixture passes do not prove unattended live collection.

### Audit file additions

The only persistent project addition outside the ignored runtime directory is this report. All temporary/evidence files created for this audit are listed below; live snapshots contain only bounded public source content. No credentials, passwords, cookie/session values or secret keys were collected. Browser temporary mirrors and test databases have been removed.

- `TALENT_SQUARE_COMPLETE_VERIFICATION_REPORT.md`
- `backend/.runtime/complete_verification/after.json`
- `backend/.runtime/complete_verification/api-permissions.json`
- `backend/.runtime/complete_verification/api-permissions.log`
- `backend/.runtime/complete_verification/api_permissions.py`
- `backend/.runtime/complete_verification/before.json`
- `backend/.runtime/complete_verification/browser-results.json`
- `backend/.runtime/complete_verification/browser_runner.py`
- `backend/.runtime/complete_verification/build_report.py`
- `backend/.runtime/complete_verification/check.log`
- `backend/.runtime/complete_verification/chrome-phase7.log`
- `backend/.runtime/complete_verification/chrome-phase8.log`
- `backend/.runtime/complete_verification/chrome-security-node.log`
- `backend/.runtime/complete_verification/chrome-security-python.log`
- `backend/.runtime/complete_verification/chrome-university.log`
- `backend/.runtime/complete_verification/failures-all-adapters.json`
- `backend/.runtime/complete_verification/failures_all_adapters.py`
- `backend/.runtime/complete_verification/http-results.json`
- `backend/.runtime/complete_verification/http_probe.py`
- `backend/.runtime/complete_verification/listeners.json`
- `backend/.runtime/complete_verification/live/bd_diu/listing-0.html`
- `backend/.runtime/complete_verification/live/bd_diu/robots.txt`
- `backend/.runtime/complete_verification/live/bd_du/listing-0.html`
- `backend/.runtime/complete_verification/live/bd_du/listing-1.html`
- `backend/.runtime/complete_verification/live/bd_du/robots.txt`
- `backend/.runtime/complete_verification/live/bd_gstu/listing-0.html`
- `backend/.runtime/complete_verification/live/bd_gstu/robots.txt`
- `backend/.runtime/complete_verification/live/bd_iut/listing-0.html`
- `backend/.runtime/complete_verification/live/bd_iut/robots.txt`
- `backend/.runtime/complete_verification/live/bd_jnu/listing-0.html`
- `backend/.runtime/complete_verification/live/bd_jnu/robots.txt`
- `backend/.runtime/complete_verification/live/bd_ku/listing-0.html`
- `backend/.runtime/complete_verification/live/bd_ku/robots.txt`
- `backend/.runtime/complete_verification/live/bd_nsu/listing-0.html`
- `backend/.runtime/complete_verification/live/bd_nsu/robots.txt`
- `backend/.runtime/complete_verification/live/bd_ru/listing-0.html`
- `backend/.runtime/complete_verification/live/bd_ru/robots.txt`
- `backend/.runtime/complete_verification/live/bd_ruet/robots.txt`
- `backend/.runtime/complete_verification/live/bd_uap/listing-0.html`
- `backend/.runtime/complete_verification/live/bd_uap/robots.txt`
- `backend/.runtime/complete_verification/live/results.json`
- `backend/.runtime/complete_verification/live.log`
- `backend/.runtime/complete_verification/live_check.py`
- `backend/.runtime/complete_verification/metadata.json`
- `backend/.runtime/complete_verification/metadata.py`
- `backend/.runtime/complete_verification/migration-check.log`
- `backend/.runtime/complete_verification/process_probe.ps1`
- `backend/.runtime/complete_verification/processes.json`
- `backend/.runtime/complete_verification/run_checks.py`
- `backend/.runtime/complete_verification/snapshot.py`
- `backend/.runtime/complete_verification/tests.log`
- `backend/.runtime/complete_verification/worker-proof.json`
- `backend/.runtime/complete_verification/worker-proof.stderr.log`
