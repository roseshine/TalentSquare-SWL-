# University automatic discovery audit

Verification date: 6 November 2026 (Asia/Dhaka). This report separates actual website retrieval, deterministic worker fixtures, real Chrome workflows and preserved application data. **Nationwide coverage and a continuously operating production worker are not established.**

## 1. Verified project root

`E:\TalentSquare\3rd Nov`. Reviewed the Phase 7, 8, 9 and 9A reports, README, SECURITY, DISCOVERY, university inventory, current discovery modules, commands, review/admin/API/UI, schema and tests. No files were copied from 26 October. The folder is not a Git checkout; changed files are listed explicitly below.

## 2. Institutions investigated

Rechecked all **23 previously investigated institutions**. Additional research covered alternative channels within SUST and BRAC, so the institution total remains 23. The historical UGC inventory contains 180 institutions; the 23 have an existing identity crosswalk. This is a dated catalog, not a claim about today's exact national total.

## 3. Individual sources identified

The registered adapters contain **18 fixed listing URLs for 15 institutions**. Eight additional institutions have eight fixed research targets: **26 primary target URLs across 23 institutions**. The fresh network audit made 36 bounded requests, including policies. Two alternative channel checks added four requests: the SUST carnival root and BRAC engineering club directory. These are separately counted research targets, not two new recurring event feeds. Policies, registration forms, PDFs and search references are not counted as extra operational feeds.

Detailed institution/feed inventory: [coverage CSV](docs/university_auto_scraping_coverage.csv), with 28 separately identified target rows (26 primary and two alternative channels). Historical identity crosswalk: [23-institution mapping](docs/bangladesh_university_investigated_crosswalk.csv). Historical catalog: [UGC inventory](docs/bangladesh_university_institution_catalog.csv).

## 4. Existing university adapters

Preserved all 15: UIU, BUET CSE, NSU ECE, DIU, RUET, Khulna University, GSTU Gopalganj, Dhaka University, AIUB, IUT, Jagannath University, Jahangirnagar IIT, UAP CSE, Rajshahi University and KUET. All remain enabled in the real SQLite database, interval 360 minutes, automatic publication disabled. Enabled means eligible, not collected or verified.

## 5. New university adapters

**Zero activated.** None of the eight research institutions or two alternatives established all prerequisites: stable relevant upcoming listings, verified current content, permitted access, reviewed scope and repeatable parsing. Adding an adapter merely to increase the count would misrepresent coverage. No bootstrap/source/publication settings changed.

Priority research:

- [SUST CSE](https://www.sust.edu/departments/cse/notice-board) remains an official research lead; the configured main-host policy returned 403. Search indexing exposes [carnival registration](https://csecarnival.sust.edu/register) and a 2026 rulebook, but that is not current retrieval proof. A separate bounded fetch of the carnival root returned HTTP 200 with generic university branding and unrelated article cards, rather than a verifiable competition schedule. No registration form, team list or attachment was collected; no connector was activated. Obtain a confirmed maintained event feed from SUST.
- [CUET CSE](https://cuet.ac.bd/department/cse) and [student organizations](https://cuet.ac.bd/student/organizations) establish university channels; the host's robots endpoint returned 404 in direct checks, so additional listings were not scraped. Ask CSE for an approved recurring source.
- [BRAC engineering societies](https://engineering.bracu.ac.bd/societies-clubs) identifies computer societies in search evidence, but its direct listing fetch returned 403 after readable robots. The main news archive likewise returned 403 after its ten-second pacing requirement. [CodeSprint news](https://www.bracu.ac.bd/news/brac-university-organizes-techhub-codesprint-challenge-2026-save-children) describes a completed competition; [competitive programming workshop news](https://www.bracu.ac.bd/news/brac-university-computer-club-organizes-workshop-competitive-programming) is a workshop, not an upcoming contest. Neither justifies creating an upcoming event. External club self-description alone is insufficient affiliation proof.

## 6. Working live source count

**Eight existing adapters** passed policy-gated direct retrieval and parsed the current listing shape: NSU, Khulna, GSTU, Dhaka, IUT, Jagannath, UAP and Rajshahi. All returned zero relevant candidates. This proves bounded retrieval and readable parser shape, not complete event discovery or the correctness of extracting an actual live competition's fields. Policy allowance is not independent legal or terms clearance.

## 7. Sources finding actual competitions

**Zero in this fresh live snapshot.** No live candidate was imported into any application database. Historical candidates remain retained, but are not evidence of fresh discoveries today. Fixture candidates are explicitly excluded from this count.

## 8. Reachable sources with zero matches

The eight live-verified adapters above. A readable archive without a current match is a valid empty result. The research-only AUST news and DUET gallery also responded, but do not have production parsers; IUB returned a client-rendered shell. They are not counted as live-verified adapters.

## 9. Broken parsers

**No parser failure was observed on the eight retrieved registered listings.** Seven adapters could not reach the listing stage, so current parser compatibility there is unverified. All 15 parse controlled fixtures. No status is upgraded from fixture success to live success. An HTML shell with no readable cards is rejected by production parsing rather than recorded as a successful empty run.

## 10. Temporarily unreachable sources

UIU, DIU and KUET failed at policy transport with `URLError`; no listing request followed. DIU was readable in the older audit, which demonstrates that dated observations can change. No automatic retry or bypass was used during this one-shot audit. Production worker retries use retained eligibility times and backoff.

## 11. Policy and permission restrictions

BUET, AIUB and Jahangirnagar IIT policies returned 404; RUET's HTTP 200 policy lacked usable directives. The strict existing collector stops on each. Research SUST returned policy 403; CUET/EWU policies returned 404; BUP returned HTML instead of a usable policy; BRAC listings returned 403. Missing policy is a conservative project gate, not an assertion that the institution legally prohibits all collection. Request a readable policy, documented public feed or explicit approved integration. No CAPTCHA, login, redirect, restriction or rate limit was bypassed.

## 12. Missing universities

Eight researched institutions remain without adapters: SUST, CUET, BRAC, EWU, AUST, IUB, DUET and BUP. AUST lacks a verified stable upcoming feed/approved terms; IUB needs a documented permitted data feed rather than a JS shell; DUET's gallery is historical media. Of the dated 180-row catalog, 157 institutions remain outside this 23-institution investigation and 165 have no registered adapter. No national completion percentage is supplied. Existing UGC/domain differences for GSTU, AIUB and IUB remain documented in the historical inventory.

## 13. Source-by-source evidence

HTTP sequences below include robots first, followed only by permitted fixed listings. “Yes, fixture worker/queue” means the real worker/storage/review path was exercised with controlled HTTP; it does not imply a live worker daemon, live discovered candidate or actual live publication. All registered sources remain configured enabled. Research sources have no executable adapter.

University | Official source | Adapter exists | Access permitted | Live fetch | Competition detection | Automatic schedule verified | Review queue verified | Remaining issue
--- | --- | --- | --- | --- | --- | --- | --- | ---
| United International University | [https://www.uiu.ac.bd/event/](https://www.uiu.ac.bd/event/) | Yes | unresolved | URLError | TEMPORARILY UNREACHABLE | Yes, fixture worker | Yes, fixture queue | Policy transport URLError; no listing requested. Ask for approved feed or submit manually. |
| Bangladesh University of Engineering and Technology | [https://cse.buet.ac.bd/](https://cse.buet.ac.bd/)<br>[https://cse.buet.ac.bd/home/all_event](https://cse.buet.ac.bd/home/all_event) | Yes | policy HTTP 404; no listing requested | 404 | POLICY OR PERMISSION RESTRICTED | Yes, fixture worker | Yes, fixture queue | Robots HTTP 404; strict collector stops. Request a readable policy or approved feed. |
| North South University | [https://ece.northsouth.edu/event/](https://ece.northsouth.edu/event/) | Yes | Robots allows fixed listing; not a legal/terms clearance | 200; 200 | LIVE VERIFIED — NO MATCHING COMPETITIONS FOUND | Yes, fixture worker | Yes, fixture queue | No relevant upcoming candidates in bounded listing snapshot; completeness, attachment text and future availability unverified. |
| Daffodil International University | [https://news.daffodilvarsity.edu.bd/category-news/events](https://news.daffodilvarsity.edu.bd/category-news/events) | Yes | unresolved | URLError | TEMPORARILY UNREACHABLE | Yes, fixture worker | Yes, fixture queue | Policy transport URLError in this check (previous snapshot readable); no listing requested. Retry only when eligible. |
| Rajshahi University of Engineering and Technology | [https://ruet.ac.bd/news-and-event](https://ruet.ac.bd/news-and-event) | Yes | unreadable or no applicable directives; listing not fetched | 200 | POLICY OR PERMISSION RESTRICTED | Yes, fixture worker | Yes, fixture queue | Robots HTTP 200 without usable directives; strict collector stops. Request approved policy/feed. |
| Khulna University | [https://ku.ac.bd/notices](https://ku.ac.bd/notices) | Yes | Robots allows fixed listing; not a legal/terms clearance | 200; 200 | LIVE VERIFIED — NO MATCHING COMPETITIONS FOUND | Yes, fixture worker | Yes, fixture queue | No relevant upcoming candidates in bounded listing snapshot; completeness, attachment text and future availability unverified. |
| Gopalganj Science and Technology University | [https://gstu.edu.bd/dev/notice/](https://gstu.edu.bd/dev/notice/) | Yes | Robots allows fixed listing; not a legal/terms clearance | 200; 200 | LIVE VERIFIED — NO MATCHING COMPETITIONS FOUND | Yes, fixture worker | Yes, fixture queue | No relevant upcoming candidates in bounded listing snapshot; completeness, attachment text and future availability unverified. |
| University of Dhaka | [https://www.du.ac.bd/events](https://www.du.ac.bd/events)<br>[https://www.du.ac.bd/](https://www.du.ac.bd/) | Yes | Robots allows fixed listing; not a legal/terms clearance | 200; 200; 200 | LIVE VERIFIED — NO MATCHING COMPETITIONS FOUND | Yes, fixture worker | Yes, fixture queue | No relevant upcoming candidates in bounded listing snapshot; completeness, attachment text and future availability unverified. |
| American International University-Bangladesh | [https://www.aiub.edu/category/notices](https://www.aiub.edu/category/notices)<br>[https://www.aiub.edu/](https://www.aiub.edu/) | Yes | policy HTTP 404; no listing requested | 404 | POLICY OR PERMISSION RESTRICTED | Yes, fixture worker | Yes, fixture queue | Robots HTTP 404; strict collector stops. Request a readable policy or approved feed. |
| Islamic University of Technology | [https://www.iutoic-dhaka.edu/](https://www.iutoic-dhaka.edu/) | Yes | Robots allows fixed listing; not a legal/terms clearance | 200; 200 | LIVE VERIFIED — NO MATCHING COMPETITIONS FOUND | Yes, fixture worker | Yes, fixture queue | No relevant upcoming candidates in bounded listing snapshot; completeness, attachment text and future availability unverified. |
| Jagannath University | [https://jnu.ac.bd/newsite/noticeview/1](https://jnu.ac.bd/newsite/noticeview/1) | Yes | Robots allows fixed listing; not a legal/terms clearance | 200; 200 | LIVE VERIFIED — NO MATCHING COMPETITIONS FOUND | Yes, fixture worker | Yes, fixture queue | No relevant upcoming candidates in bounded listing snapshot; completeness, attachment text and future availability unverified. |
| Jahangirnagar University | [https://iitju.edu.bd/news-events](https://iitju.edu.bd/news-events) | Yes | policy HTTP 404; no listing requested | 404 | POLICY OR PERMISSION RESTRICTED | Yes, fixture worker | Yes, fixture queue | Robots HTTP 404; strict collector stops. Request a readable policy or approved feed. |
| University of Asia Pacific | [https://cse.uap-bd.edu/office/posts/?type=notice](https://cse.uap-bd.edu/office/posts/?type=notice) | Yes | Robots allows fixed listing; not a legal/terms clearance | 200; 200 | LIVE VERIFIED — NO MATCHING COMPETITIONS FOUND | Yes, fixture worker | Yes, fixture queue | No relevant upcoming candidates in bounded listing snapshot; completeness, attachment text and future availability unverified. |
| University of Rajshahi | [https://www.ru.ac.bd/](https://www.ru.ac.bd/) | Yes | Robots allows fixed listing; not a legal/terms clearance | 200; 200 | LIVE VERIFIED — NO MATCHING COMPETITIONS FOUND | Yes, fixture worker | Yes, fixture queue | No relevant upcoming candidates in bounded listing snapshot; completeness, attachment text and future availability unverified. |
| Khulna University of Engineering and Technology | [https://www.kuet.ac.bd/](https://www.kuet.ac.bd/) | Yes | unresolved | URLError | TEMPORARILY UNREACHABLE | Yes, fixture worker | Yes, fixture queue | Policy transport URLError; no listing requested. Ask for approved feed or submit manually. |
| Shahjalal University of Science and Technology | [https://www.sust.edu/public/145/news-and-events/49](https://www.sust.edu/public/145/news-and-events/49) | No | policy HTTP 403; no listing requested | 403 | POLICY OR PERMISSION RESTRICTED | No | No | Main-host robots HTTP 403. Carnival alternative HTTP 200 serves unrelated article cards; source identity/content unsuitable. |
| Chittagong University of Engineering and Technology | [https://cuet.ac.bd/news-events](https://cuet.ac.bd/news-events) | No | policy HTTP 404; no listing requested | 404 | POLICY OR PERMISSION RESTRICTED | No | No | Robots HTTP 404, no listing fetched; official /department/cse and student organizations are research leads, not verified feeds. |
| BRAC University | [https://www.bracu.ac.bd/news-archive](https://www.bracu.ac.bd/news-archive) | No | readable robots policy | 200; 403 | POLICY OR PERMISSION RESTRICTED | No | No | Robots readable, ten-second crawl delay respected; news archive HTTP 403. Engineering club directory also HTTP 403. |
| East West University | [https://www.ewubd.edu/events](https://www.ewubd.edu/events) | No | policy HTTP 404; no listing requested | 404 | POLICY OR PERMISSION RESTRICTED | No | No | Robots HTTP 404; no listing fetched. Ask for an approved university/club feed. |
| Ahsanullah University of Science and Technology | [https://www.aust.edu/cse/news](https://www.aust.edu/cse/news) | No | Robots allows fixed listing; not a legal/terms clearance | 200; 200 | NOT IMPLEMENTED | No | No | News HTTP 200 but no approved stable upcoming-competition listing/terms; manual curated review until established. |
| Independent University, Bangladesh | [https://iub.ac.bd/news-and-events/latest-news](https://iub.ac.bd/news-and-events/latest-news) | No | Robots allows fixed listing; not a legal/terms clearance | 200; 200 | NOT IMPLEMENTED | No | No | Listing HTTP 200 is client-rendered shell; no stable permitted event API verified. Ask for documented feed. |
| Dhaka University of Engineering and Technology | [https://www.duet.ac.bd/department/cse/galleries](https://www.duet.ac.bd/department/cse/galleries) | No | Robots allows fixed listing; not a legal/terms clearance | 200; 200 | NOT IMPLEMENTED | No | No | Gallery HTTP 200 is historical media, not a recurring future-event feed. Ask CSE for notices/feed. |
| Bangladesh University of Professionals | [https://bup.edu.bd/public/club-home/bup-computer-programming-club](https://bup.edu.bd/public/club-home/bup-computer-programming-club) | No | unreadable or no applicable directives; listing not fetched | 200 | POLICY OR PERMISSION RESTRICTED | No | No | Robots response is HTML/unreadable; no club listing fetched. Request approved feed. |
| Shahjalal University of Science and Technology (alternative channel) | [https://csecarnival.sust.edu/](https://csecarnival.sust.edu/) | No | robots allows fixed listing; no bypass used | 200; 200 | NOT IMPLEMENTED | No | No | HTTP 200 content mismatch: unrelated article cards rather than verifiable competition schedule; no adapter. |
| BRAC University (alternative channel) | [https://engineering.bracu.ac.bd/societies-clubs](https://engineering.bracu.ac.bd/societies-clubs) | No | readable robots policy | 200; 403 | POLICY OR PERMISSION RESTRICTED | No | No | Robots readable but club-directory request HTTP 403; no adapter. |

Raw timestamps, HTTP status/content type, response hashes and bounded snapshots are retained privately at `backend/.runtime/university_auto_audit/live/`; alternative-channel evidence is under `alternatives/`. Stable labels in the CSV/table use the requested status vocabulary. No source is labeled currently finding competitions. `NOT IMPLEMENTED` is retained for reachable research-only targets; restricted targets describe their actual access blocker even though no adapter exists.

## 14. Candidate creation and actual architecture

`verify_university_worker.py` creates a temporary directory, migrates a fresh SQLite database and launches the actual `run_import_worker` command in separate Python processes. Only the university HTTP opener and process-local clock are controlled. The real collector's fixed requests, policy parsing, source-shaped HTML parsing, normalization, candidate services, lease checks and database writes execute. Each fixture request is recorded; unexpected detail, attachment or registration requests fail the proof.

Official fixed listing → bounded fetch/policy check → source-specific readable card parser → conservative evidence/normalization → relevance/past-date filtering → source/external-ID and cross-source duplicate checks → private candidate storage → staff metadata validation and approval → public imported competition. Incomplete candidates are intentionally valid review material; publication, rather than raw candidate storage, requires complete confirmed metadata and model validation. HTML/PDF links never become registration links without an explicit registration anchor. Publisher is distinct from organizer/host. Date-only evidence stays date-only; missing precision is manually confirmed. PDFs/posters are retained as evidence links without fetching/OCR.

The isolated proof created **15 candidates, one per adapter**, with **zero public competitions before approval**. Staff queue API returned all 15; anonymous access was denied. For incomplete attachment/table evidence, fixture staff explicitly confirmed missing values through review overrides. These are test confirmations, not extracted live facts.

## 15. Repeated imports and duplicates

A restarted worker at the next eligible time processed the same 15 payloads: 15 unchanged counts, still 15 candidates. Each source retained its stable external ID; repeated multi-listing sources did not duplicate the same announcement. Changed payloads yielded 15 update-pending records, with existing public titles unchanged and staff eligibility overrides retained. Explicit staff apply updated those 15 public records. Existing cross-source duplicate warnings and organizer-record protection remain covered by the broader suite and Chrome workflow. Duplicate warnings are conservative review evidence, not guaranteed identity resolution.

## 16. Worker automation demonstration

Evidence: `backend/.runtime/university_auto_audit/worker-proof.json` (separate child PIDs, request traces, command output, assertions).

- Real command selected all 15 due enabled sources without `force` or Run now.
- Persisted next-run times prevented a restarted not-yet-due process from making any HTTP request.
- Fixture HTTP 429 persisted failed history and honored a two-hour Retry-After. A second failure increased backoff to at least 30 minutes.
- An expired running lease was finalized failed, preserving a partial created count; a later restarted process succeeded, clearing the error streak.
- Two independent subprocesses overlapped while the first held its active lease during fetch. The contender made zero HTTP requests and did not acquire a second active run. The owner completed without duplicate candidates.
- Continuous command mode completed two due iterations and graceful KeyboardInterrupt shutdown. Its test sleep hook advanced the clock 16 minutes; recorded poll arguments were `[10, 10]`. This is deterministic scheduling evidence, **not 16 minutes of observed real elapsed uptime**.
- Final isolated totals: **15 sources, 15 candidates, 15 explicitly approved competitions, 53 retained runs**. Temporary databases and processes are cleaned up.

Operational finding: no `run_import_worker` process was observed initially; real source check times were mostly 27 October while this audit is 6 November. Thus the actual system was not demonstrated to be collecting continuously. No permanent live worker/service/scheduled task was installed or started, and real candidates were not imported merely to demonstrate scheduling. The production command requires deliberate deployment and supervision. There is no worker heartbeat, so the UI does not infer process liveness from an Enabled badge.

## 17. Staff review and public verification

The proof checks all 15 via genuine staff queue and public list APIs. Explicit approval produces public rows; pending source changes cannot silently edit them. Real Chrome exercises staff login, fixture imports, idempotency, duplicate/evidence display, incomplete-date publication denial, explicit confirmed details, approval, rejection/history retention, Home/Explore/details attribution, separate registration link and nonstaff denial. Review decisions and source/public payloads remain separate. University automatic publication stays unavailable.

## 18. Health dashboard changes

Live Imports now explicitly states that automatic checks require a separately running worker and that the page does not monitor its process. Added total candidates, possible duplicate candidates, and last-success new/updated/unchanged counters, plus collection evidence text. Counts derive from retained records; several warnings on one candidate count once. No successful run displays “No success”, while a successful zero-match run explicitly describes zero as valid. Failed/in-progress collection does not establish successful parsing/saving. Existing attempt, success, failure, next eligibility, cooldown, pending/approved/rejected counts and last error remain visible. Chrome assertions cover the new worker explanation and evidence fields.

## 19. Automated test results

Baseline: **309 passed**, 0 failed, 0 skipped. Final code suite: **313 passed**, 0 failed, 0 skipped. Four targeted tests add enabled-versus-success, empty-versus-failed collection, candidate/duplicate counter accuracy, and the isolated real-worker lifecycle (15 adapters, repeats, permissions, publication, cooldown, recovery, overlap, polling).

`python -B manage_local.py check`: no issues. `python -B manage_local.py makemigrations --check --dry-run`: no changes. No migrations required. Final logs: `backend/.runtime/university_auto_audit/final-tests.log`. Authentication and all other tests use their existing production configuration; no password hashing/security settings were weakened for speed.

## 20. Real Chrome results

**61 workflow assertions passed** across five isolated Chrome runs:

| Workflow | Passed | JavaScript exceptions |
| --- | ---: | ---: |
| University review / health UI | 9 | 0 |
| Phase 7 discovery | 9 | 0 |
| Phase 8 participation / organizer permissions | 11 | 0 |
| Phase 9 security with Python frontend server | 16 | 0 |
| Phase 9 security with Node frontend server | 16 | 0 |

The original 29 discovery/participation workflows remain passing. Phase 9 additionally verifies genuine signup/profile/reset flows, no activity from an external tab, persistent explicit self-reports, owned organizer submissions, cross-organizer denial, withdrawal, role restrictions and legacy login HTTP 410 on both servers. The first extra Python-server security attempt timed out before the signup DOM rendered (no usable body was captured); an unchanged rerun passed all 16. The exact cause of that transient startup failure is unproven and retained as a browser-harness/startup limitation, not silently counted as a pass. Its log is `chrome-security-python-initial-failure.log`. Final successful logs and `browser-totals.json` are in the private audit directory.

All browser writes use disposable migrated SQLite databases and genuine Django APIs. University external transport uses controlled local HTML; other external test pages are controlled fixtures. These results do not certify current university access. Scripts clean up their child servers/browsers; no application database account was overwritten.

## 21. Database preservation

Captured table columns/counts/row hashes, source settings and runs before implementation; SQLite integrity was `ok`, foreign keys clean. Final read-only comparison verifies **all table rows, counts and hashes identical**, including migration history, accounts, source settings, candidates, review data and sessions. The complete SQLite byte hash remains:

`d0a5901a241c11a2638e9de8729a63c7e519d919272285be3b05d39b62b4b97b`

Retained: 7 users, 4 participant profiles, 1 organizer profile, 9 competitions, 19 sources, 87 candidates, 37 import runs, 4 sessions and 28 applied migrations. Bookmark/internal registration/external participation tables remain at their original zero rows; Facebook has zero connected pages and remains disabled. Codeforces, AtCoder, MLH and all source intervals/publication settings are unchanged. Legacy `platform_db.json` and protected account/competition/config/frontend security files are byte-identical. No schema change, backup-triggering migration or original-database write was needed. Historical verified backups remain untouched. Evidence: `baseline.json` and `preservation.json` in the private audit directory.

## 22. Exact changed files

- `backend/discovery/audit_university_sources.py`: separate dated evidence output selection; existing fixed scope retained.
- `backend/discovery/audit_university_alternatives.py`: opt-in bounded research of two fixed alternative channels.
- `backend/discovery/health.py`: evidence and candidate/duplicate/run counters.
- `workspaces.js`: worker requirement and evidence fields in existing Live Imports layout.
- `backend/discovery/worker_fixture_transport.py`: deterministic, scope-asserting HTTP fixtures for all 15 adapters.
- `backend/discovery/worker_probe_child.py`: guarded disposable-database worker subprocess harness.
- `backend/discovery/verify_university_worker.py`: real command lifecycle/review/public proof.
- `backend/discovery/test_auto_audit.py`: four targeted automated regressions.
- `backend/discovery/browser_phase9a_regression.py`: new Chrome assertions for worker/evidence UI.
- `docs/university_auto_scraping_coverage.csv`: dated 28-target inventory, separating the 26 primary URLs and two alternatives.
- `DISCOVERY.md`: audit and safe worker-proof usage documentation.
- `UNIVERSITY_AUTO_SCRAPING_AUDIT.md`: this report.

Generated evidence/helper scripts and logs are confined to `backend/.runtime/university_auto_audit/`; they are not product code or application data. No adapter/publication/authentication/participation policy changes, migrations, recruitment/rankings/job-fair edits or permanent services.

## 23. Exact remaining blockers

No persistent production worker is configured/observed. Eight live parsers found no matching competitions, so actual current competition field extraction is not demonstrated by this snapshot. Seven existing sources could not reach listing retrieval. Eight researched institutions remain unimplemented, for specific reasons above; the alternative SUST content mismatch and BRAC 403 do not justify new coverage. PDFs/OCR and generic JS rendering are unsupported. Terms/permission approval and maintained official feeds remain unresolved for prospective connectors. No nationwide crawling, source heartbeat, automatic cancellation detection, source completeness guarantee or worker supervision was added.

## 24. Startup and verification commands

From the verified root, normal local frontend/backend (separate terminals):

```powershell
python -B server.py
python -B manage_local.py runserver 127.0.0.1:8001 --noreload
```

Safe deterministic worker verification; only disposable fixture data:

```powershell
python -B backend/discovery/verify_university_worker.py --save-evidence
python -B manage_local.py check
python -B manage_local.py makemigrations --check --dry-run
python -B manage_local.py test --noinput
python -B backend/discovery/browser_phase9a_regression.py
python -B backend/discovery/browser_phase7_regression.py
python -B backend/competitions/browser_phase8_regression.py
python -B backend/accounts/browser_phase9_regression.py --frontend python
python -B backend/accounts/browser_phase9_regression.py --frontend node
```

Free ports 8000/8001 before running Chrome scripts. Do not substitute old live-database browser scripts. Optional fixed read-only website audit, respecting source access rules and avoiding repeated probing:

```powershell
python -B backend/discovery/audit_university_sources.py --live --evidence-directory university_auto_audit
python -B backend/discovery/audit_university_alternatives.py --live
```

For deliberate operational collection after reviewing source permissions and backup/monitoring arrangements, run the existing foreground worker in a separate terminal:

```powershell
python -B manage_local.py run_import_worker --poll-seconds 30
```

That command writes real import history/candidates for enabled due sources; it is **not a read-only test**. Do not run bootstrap or migrations to demonstrate collection. No such real-database collection was performed here. Stop with Ctrl+C; use an explicitly configured supervisor for persistent operation.

## 25. Practical next steps

Deliberately deploy and monitor the existing worker once ready for real imports; confirm run timestamps advance rather than relying on enabled flags. Ask the blocked institutions for approved feeds/readable policies and SUST for a maintained carnival endpoint. Prioritize a documented CSE/club source over general news, historical galleries or team lists. Add a connector only with current permitted listing evidence, representative accuracy fixtures and scope/review tests. Review genuine candidates with confirmed event times, hosts and registration instructions; retain unknowns rather than guessing. Expand the dated institution inventory through the same process. **This audit completes verification/improvements within the safe scope; it does not certify a nationwide continuously operating discovery service.**
