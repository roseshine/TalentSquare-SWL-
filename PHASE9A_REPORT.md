# Phase 9A — university discovery accuracy and source inventory

Report date: **6 November 2026, Asia/Dhaka**. Live network evidence retains its actual **5 November 2026 UTC** retrieval timestamps.

Status: accuracy improvements, source investigation and final verification are complete within the documented access limits. **Coverage remains 15 registered university adapters. No additional adapter was registered or activated without access clearance.** This is not nationwide completeness or a promise that every university can be scraped.

## A–G. Project, inventory, coverage and technical status

Verified workspace: **`E:\TalentSquare\3rd Nov`**. The current README, discovery guide, Phase 7/8 reports, discovery implementation/tests and Phase 9 security implementation were inspected. No files were copied from another project version. The actual pre-change suite was **279 passing tests in 214.747 seconds**, rather than the historical Phase 8 count of 247. The original university-focused suite separately passed **29 tests**, covering all 15 adapters.

The 15 existing registry keys remain: `bd_uiu`, `bd_buet`, `bd_nsu`, `bd_diu`, `bd_ruet`, `bd_ku`, `bd_gstu`, `bd_du`, `bd_aiub`, `bd_iut`, `bd_jnu`, `bd_ju`, `bd_uap`, `bd_ru` and `bd_kuet`. They represent UIU, BUET CSE, NSU ECE, DIU, RUET, Khulna, GSTU Gopalganj, Dhaka University, AIUB, IUT, Jagannath, Jahangirnagar IIT, UAP CSE, Rajshahi University and KUET. These are 15 registry adapters sharing bounded layout-family parsers, not 15 independent crawlers.

The UGC's [public](https://ugc.gov.bd/universities/public-universities), [private](https://ugc.gov.bd/universities/private-universities) and [international](https://ugc.gov.bd/universities/international-universities) page data supplied **180 catalog rows**: 61 public, 116 private and 3 international. The [institution CSV](docs/bangladesh_university_institution_catalog.csv) records authority links and identifiers. These catalog counts are not a claim that every row is a Bangladesh CSE institution or individually investigated; the international category can include out-of-country institutions, and listed domains/names can be stale. UGC headline counts and catalog row counts are not conflated.

**Individually investigated: 23 institutions. Fixed official collection/research endpoints: 26** — 18 existing endpoints and 8 additional channels. One additional channel is a gallery, not a suitable upcoming-event feed. The eight additional universities were SUST, CUET, BRAC, EWU, AUST, IUB, DUET and BUP. APIs/RSS/Atom and official department/club/news/calendar channels were considered; no new approved public competition API/feed was verified. Search results or self-described club domains were never promoted directly into trusted source records.

**New registered adapters: 0. Real source rows added or enabled: 0.** Reasons:

- **SUST:** its official CSE navigation identifies the news page, but direct policy retrieval returned 403. No collection workaround was attempted.
- **CUET:** official news/events channel identified; robots returned 404, so no automated listing request was made. Browser research also showed a largely structural listing without demonstrated readable competition data.
- **BRAC:** robots was readable and its 10-second crawl delay was honored; the archive request returned 403. No alternate user agent, proxy or stealth technique was used.
- **EWU:** official events/contest news identified, but policy returned 404; listing collection was not attempted.
- **AUST:** allowing robots and readable CSE news, but no demonstrated upcoming-contest feed or independently cleared reuse/access terms. Historical news/achievements do not establish future competition coverage.
- **IUB:** allowing robots, but direct HTML was a Next.js loading skeleton with no event records. A reviewed public feed/API and applicable permission remain unresolved; no arbitrary hidden endpoint was reverse-engineered.
- **DUET:** official gallery establishes a carnival announcement channel, but is not an upcoming listing; the researched carnival describes June 2026 events. Its separate host needs separate affiliation/policy review before automated integration.
- **BUP:** the university-hosted club page establishes club identity, but robots returned HTML with no readable policy. A separate club domain was not accepted solely from its self-description.

The full [source inventory](docs/bangladesh_university_sources.md) gives exact university/source URLs, parser functions/families, robots and HTTP outcomes, unchanged enabled/interval settings, last retained collection state, dates/IDs/link extraction, unit coverage, live labels and individual limitations. Sources not connected remain **RESEARCHED — NOT CONNECTED**, **ACCESS OR POLICY RESTRICTED**, **UNREACHABLE** or **UNSUPPORTED** as qualified by evidence. A missing robots file is unresolved permission, not proof the university homepage is down or that collection is prohibited forever.

## H–J. Extraction accuracy, dates, publisher and organizer

New `university_evidence.py` extracts only explicitly labeled information inside a bounded event card. It does not scan arbitrary linked detail pages or use speculative AI classification. Source evidence can include event/deadline dates, location, organizer, explicit host university, event format, eligibility, team size, prizes and fees with an explicit amount/currency. Conflicting labels remain unresolved. The evidence includes the raw source text and original official announcement URL.

An explicit registration anchor within that same card may supply a public HTTP(S) registration link. Generic Learn more, navigation and announcement links are not substituted. Credential-bearing, literal-IP, local/internal and non-HTTP links are rejected. Extracted links are retained for review/users, **not fetched by the collector**.

The relevance filter now rejects seminars, training/activation workshops, orientation, admission/exam/meeting and recruitment contexts. It recognizes explicit programming/ICPC/IUPC/NCPC, hackathon/datathon, CTF, AI/ML, robotics, web/app and software/project competition contexts. A general AI congress without competition evidence is excluded. Filtering is deliberately conservative and can miss hybrid events or titles outside the supported vocabulary; it is not complete semantic understanding.

Date handling supports explicit English day/month and month/day text, aware ISO timestamps, date-only ISO values, same-month multi-day ranges and Bangla digits. Precise Bangladesh local clocks are converted using Asia/Dhaka without shifting the intended local calendar day. A complete date without a clock stays calendar-date evidence, not midnight UTC. Ambiguous numeric dates stay unresolved unless a reviewed site-specific convention is configured; none was invented for the current registry. Invalid/partial/reversed/conflicting dates and timezone-ambiguous values remain unresolved. Explicit old dates/old edition titles are excluded.

Existing dedicated UIU/NSU calendar parsing remains. DIU news dates and explicit publication labels stay publication metadata, never event-start defaults. Publisher is never substituted for organizer or host, and a campus venue never proves host identity or offline format. A source-stated label is not independent verification.

The two retained pre-change live matches were a DIU AI congress and a UAP activation-workshop notice. Replaying the permitted saved HTML through the corrected filter removes both. All nine saved readable sources then yield zero retained candidates. This is a bounded snapshot outcome, **not proof that those universities have no upcoming contests**.

## K. PDFs and posters

**Implemented:** recognition and retention of official PDF announcement links and poster/manual-verification flags. **UNSUPPORTED:** PDF text extraction and OCR. No attachment crawler, document parser or large package was installed. Collectors do not follow PDF/image links or guess information from unreadable posters. Missing PDF/poster facts remain unknown. Any future extractor needs reviewed official attachment scope/permission plus content-type, size and page-count limits.

## L. Duplicate prevention

Canonical official URL hashing remains the stable event identifier. Same-page duplicate links collapse; repeated source runs retain one candidate per source/external ID. Existing cross-source matching-URL/title/host/date warnings remain warnings rather than automatic merges. The browser fixture repeated the same source check, confirmed unchanged candidate count and saw the cross-source warning. Unit tests preserve source-update review and administrator overrides. No manually created organizer competition is overwritten.

## M. Staff review improvements

The existing dark-gradient components now show university publisher separately from organizer/host, explicit Unknown values, date precision and raw date evidence, conflicts, PDF/poster flags, official collection URL, missing host information, and source-stated field evidence without an invented Verified badge. Existing duplicate/freshness warnings, source health, current payload, last-applied payload and staff overrides remain visible.

Future review actions are appended to a private `_review_history` entry in existing JSON overrides: action, aware time, staff ID, note and confirmed fields. No schema migration was needed. API writes remain permission/CSRF protected and transactional. Direct university approvals and Django Admin rejections also retain history; the admin rejection reads/updates its row inside a transaction. Failed publication rolls the attempted history entry back. A prior latest review can be preserved from retained metadata; missing historical actions are not invented or backfilled.

University publication still requires a human review note, precise event start and truthful mandatory host/organizer/format/location data. Date-only evidence cannot satisfy this. Pending/rejected candidates remain private; published source changes remain update-pending until explicitly applied. No university auto-publication flag was enabled or made available.

## N–Q. Public pages and existing features

Chrome verified an approved fixture on **Home, Explore and Competition Details**, including actual host distinct from publisher, category, source attribution, original announcement link, confirmed separate registration link, and private rejected candidates. The original Phase 7 suite retains search, Upcoming, timezone/filter and freshness checks; the complete Django suite retains filtering, sorting and pagination coverage.

Facebook authorization code and disabled state were preserved. No credentials were requested or embedded and no unofficial Facebook collection was performed. Codeforces, AtCoder and MLH connectors and source settings were not rewritten. Retry-After/backoff, worker leases/recovery, duplicate warnings, health/freshness and reviewed updates remain covered by the full suite and Phase 7 browser regression. No recurring worker, scheduled task or system service was created.

Phase 8 models/views/serializers/tests and frontend participant logic were not changed. Its separate 11-workflow Chrome regression passed, including persistent bookmarks/registration, no external-link registration side effect, explicit external self-reports and organizer ownership denial. No rankings, recruitment or job-fair implementation was added. Phase 9 security server/account files were also preserved.

## R. Source files changed

- `backend/discovery/university_connectors.py`: relevance, bounded card evidence, truthful dates/links and fail-closed policy/content-type handling.
- New `backend/discovery/university_evidence.py`: pure date/evidence parsing without network/OCR.
- `backend/discovery/serializers.py`, `views.py`, `review.py`, `admin.py`; new `review_history.py`: staff evidence/history and transactional review handling.
- `workspaces.js`: only Live Imports university review display/history.
- New `backend/discovery/test_phase9a.py`, `browser_phase9a_regression.py`, `audit_university_sources.py`, `verify_phase9a_preservation.py`: deterministic regressions, bounded opt-in audit and preservation checks.
- Documentation: `README.md`, `DISCOVERY.md`, this report, `docs/bangladesh_university_sources.md`, `docs/bangladesh_university_institution_catalog.csv` and `docs/bangladesh_university_investigated_crosswalk.csv`.

No discovery model or migration, participant/security implementation, `app.js`, `pages.js`, stylesheet, server or legacy JSON file was changed. No dependency was installed for this phase.

## S. Schema and real data preservation

No schema migration was generated or applied; therefore no migration backup/application was necessary. Existing private backups were not overwritten. Initial and final table counts/row hashes, complete SQLite file hash, legacy JSON hash and protected participant/security file hashes were compared. Final preservation evidence is recorded under `backend/.runtime/phase9a/preservation.json`.

SQLite SHA-256 remains:

`d0a5901a241c11a2638e9de8729a63c7e519d919272285be3b05d39b62b4b97b`.

Counts remain **7 users**, **4 participant profiles**, **1 organizer profile**, **9 competitions**, **19 sources**, **87 candidates**, **37 import runs**, **4 sessions**, **28 migration records**, and **0 bookmarks/internal registrations/external reports/Facebook Pages**. All original values, including password hashes, staff permissions, source enabled/interval/publication settings and participant activity, are preserved. Codeforces auto-publication remains on, university auto-publication remains off and Facebook remains disabled. SQLite integrity is `ok`; foreign-key violations: **0**.

All write-based integration/browser testing used disposable databases and controlled network/HTML fixtures. Live verification did not call `run_source`, bootstrap or import into the real database and did not publish records.

## T. Automated verification

Baseline: **279 discovered, 279 passed, 0 failed, 0 skipped**. Original university suite: **29 passed**. Original university/Phase 7 focused regression after the initial changes: **65 passed**. New Phase 9A tests: **30 passed**, covering all 15 registry adapters plus date, relevance, source evidence, safe fetch failures, idempotency/duplicates, review rollback/history and permissions. Existing tests additionally cover redirects, pacing, leases, recovery, Retry-After/backoff, updates, manual overrides, staff/CSRF and public Explore.

Final complete-suite result: **309 discovered, 309 passed, 0 failed, 0 skipped in 269.660 seconds**, exit 0. The narrow 30-test suite also passed after the final date-boundary/admin-history checks (0.178 seconds). An earlier expanded full run passed 309 tests as well. Machine-readable counts are in `backend/.runtime/phase9a/summary.json`. `check` reports no issues; `makemigrations --check --dry-run` reports no changes; `migrate --check` reports no pending migrations.

## U. Chrome integration

- **Phase 9A: 9 workflows passed**, zero uncaught JavaScript errors: staff login; fixture-only source checks/idempotency/health; publisher/date/missing/duplicate evidence; incomplete-publication denial; save-confirmed-details and explicit approval/history; rejection; readable history panel; Home/Explore/details attribution and links; nonstaff denial.
- **Phase 7: 9 workflows passed** against a separate disposable database.
- **Phase 8: 11 workflows passed**, zero uncaught JavaScript errors, against another disposable database.

Total: **29 successful workflow executions** across three Chrome runs. Phase 9A replaces only the university collector's external transport with controlled local HTML; login, source-run APIs, parser, lease/idempotency services, review, database persistence and public APIs are genuine. No browser API responses were mocked. A test selector was corrected to handle the review-tab count badge; no application assertion was removed.

Evidence: `backend/.runtime/phase9a/chrome.log`, `phase7-chrome.log`, `phase8-chrome.log` and final test logs. Test services are temporary and stopped after each run. Chrome availability proves these tested workflows, not external site registration success or all browser versions.

## V. Bounded read-only live evidence

The fixed-target audit made **37 requests** across the 23 researched source groups: one policy request and no more than two listing requests per group, with no retries/redirects and at most three independent hosts active. Bounds were 10 seconds/request, 64 KiB policy and 2 MiB audit listing bodies; robots pacing was honored. Production collector limits remain 20 seconds/8 MiB with policy checks and no arbitrary linked fetches. UGC catalog research was separate public-authority reading, not a university crawler.

Nine existing sources were **LIVE VERIFIED for readable transport/listing structure**: NSU, DIU, Khulna, GSTU, Dhaka University, IUT, Jagannath, UAP and Rajshahi University. All returned readable policy and HTTP 200 listing responses. This does not certify accurate future-event coverage. Six existing policy gates stopped before listing retrieval: UIU/KUET transport unavailable; BUET/AIUB/Jahangirnagar IIT policy 404; RUET empty policy 200. No inaccessible listing was claimed healthy solely from a fixture.

Additional-source outcomes and exact statuses are in the inventory. Raw bounded responses, URLs, timestamps, status/content type, policy outcomes and response hashes are retained privately in `live/results.json`; the parser comparison reuses saved HTML in `replay-results.json`. No blocked source was retried with bypass techniques. Missing-policy sites may be publicly readable in a browser; automated collection remains stopped until permission is resolved.

## W. Remaining limitations

New university coverage is **not connected** while access/permission/structure is unresolved. A full UGC catalog is not equivalent to individual CSE-source verification; 157 catalog entries were not individually investigated here. No nationwide completeness is claimed. Future sources may contain events absent from the bounded first listing page. Source structures, institutional names/domains and policies can change.

The parser supports limited explicit labels/formats, not arbitrary prose, every Bangla month/date phrase, cross-month range or flyer layout. Conservative exclusions can omit mixed workshop/competition events. Date-only evidence still needs staff to establish a genuine time; a fabricated midnight is not a solution. No PDF text/OCR extraction, generic detail crawler, automatic cancellation reconciliation or external registration verification was implemented. Staff must resolve duplicates and preserve truthful attribution. Past missing review history cannot be reconstructed.

Existing Phase 9 deployment limitations remain: localhost browser API origins, external floating CDN bundles, HTTPS/production hosting, shared abuse controls, SMTP verification, database/backup operations and supervised deployment need staging work. This phase does not claim production readiness or complete security.

## X. Exact manual verification

From `E:\TalentSquare\3rd Nov`:

```powershell
python -B manage_local.py check
python -B manage_local.py makemigrations --check --dry-run
python -B manage_local.py test --noinput
```

For browser write verification, leave ports 8000/8001 free and run these one at a time; each prepares its own disposable database:

```powershell
python -B backend/discovery/browser_phase9a_regression.py
python -B backend/discovery/browser_phase7_regression.py
python -B backend/competitions/browser_phase8_regression.py
```

For normal read-only local browsing, start `python -B server.py` and `python -B manage_local.py runserver 127.0.0.1:8001 --noreload` in separate terminals. Open `http://127.0.0.1:8000`. Use authorized existing staff only to inspect retained source state; do not run real imports merely to test controls. No migration/bootstrap/worker is required for normal startup. For interactive write tests, use a separately isolated database rather than existing accounts/data.

In Live Imports choose the university source, inspect publisher/host/date precision, missing fields and duplicate/freshness evidence; compare current/last-applied/overrides; enter confirmed missing details with a note; explicitly save and approve/reject; inspect history. Verify public source attribution only after approval. A normal user must be denied these controls. The opt-in `audit_university_sources.py --live` is a one-shot fixed registry audit; review applicable permissions before repeating it.

## Y. Next source priorities

First seek an approved stable feed/API or explicit collection permission for SUST, CUET and BRAC. Then investigate a genuine upcoming-event channel for AUST, a documented public feed/API for IUB, future editions of DUET's official carnival and an approved university-hosted BUP club feed. Preserve organizer submissions/manual review as the fallback. Establish affiliation through university links before accepting independent club domains.

Expand the auditable catalog institution by institution, add bounded fixtures and negative cases for each cleared source, retain review-first publication, and report successful zero-match checks separately from access/parser failures. Do not increase adapter counts at the expense of correct competition facts.
