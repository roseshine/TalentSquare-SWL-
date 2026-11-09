## Phase 9A accuracy and university inventory

See [the university source inventory](docs/bangladesh_university_sources.md), [UGC institution catalog](docs/bangladesh_university_institution_catalog.csv) and [Phase 9A report](PHASE9A_REPORT.md). The 15 existing adapters/source IDs and real source settings remain unchanged. Eight additional universities were researched; no unapproved connector was activated.

The collector now treats a missing, empty, HTML/challenge or unreadable robots response as a stop condition. A listing with no relevant events is distinct from a policy/transport/structure failure. Explicit labeled facts and raw date evidence stay separate from staff overrides. Dates without clocks do not become invented midnight timestamps; unknown numeric conventions stay unresolved. Publication timestamps, university publishers, host identities, campus venues and registration links remain distinct.

The university review panel shows source evidence, unknown/conflicting metadata, attachment/manual-review flags and future decision history. Historical missing actions are not backfilled. University auto-publication remains prohibited; incomplete timestamps still block publication. PDF text extraction/OCR is not implemented. No new dependency, model migration, real import or worker was introduced.

Use `python -B backend/discovery/browser_phase9a_regression.py` with ports 8000/8001 free for a disposable fixture-based source-run/review/public-display workflow. It never writes the real database or contacts universities. Run `python -B manage_local.py test --noinput` for the complete deterministic suite. Do not use older live-database write scripts or real imports as UI tests.

# Competition discovery — Phase 7

Project: `E:\TalentSquare\3rd Nov`. Verification date: 4 November 2026 (Asia/Dhaka).

This extends the existing discovery system. It does not implement participant registration,
job fairs, recruitment, rankings or certificates. No new dependencies or schema migration
are required. The application database is not used for test writes.

## Publication and evidence

- Codeforces keeps its existing automatic-publication setting. New valid, nonduplicate
  events can publish automatically. Duplicate warnings hold a new candidate for review.
- AtCoder and MLH retain administrator review; Phase 7 does not enable automatic publication.
- All 15 university sources and Facebook always require staff verification. A publisher,
  campus venue or publication date does not establish the organizer, host or event date.
- New university and Facebook candidates do not turn an announcement URL into a registration URL.
  Reviewers must confirm the real registration/event participation link before publication.
- UIU/NSU explicit event schedules use Asia/Dhaka. Unknown dates remain null. Invalid dates
  do not become guessed dates. Other adapters collect titles and evidence links, not complete
  event records. Images and PDFs are not downloaded or OCR'd.
- A dated competition announcement is distinguished from a possible undated announcement.
  General news, achievement recaps, explicit previous-year editions and known past schedules
  are excluded. An undated notice can still be historical: it stays private for review.
- Raw source data, last-applied data and staff overrides remain separate. Source changes
  to published competitions still require update approval. Administrator edits are preserved.
- Original source links remain available. No missing event is automatically cancelled,
  deleted, unpublished, registered, endorsed or marked as a verified result.

## Supported international connectors

| Connector | Fixed endpoint | Method | Limited live result on 4 November |
| --- | --- | --- | --- |
| Codeforces | https://codeforces.com/api/contest.list?gym=false | Official JSON API; UTC epoch timestamps | 9 upcoming records parsed |
| AtCoder | https://atcoder.jp/contests/?lang=en | Upcoming/daily HTML schedule; explicit timezone offsets | 9 upcoming records parsed |
| MLH | https://www.mlh.com/seasons/2027/events/ | Embedded public schedule JSON; aware timestamps | 67 upcoming records parsed |

MLH's academic-season URL advances in July. All three have fixture/network/workflow tests.
Live retrieval tested fetching and parsing only: it did not save candidates or publish events.
Official event links are retained; MLH organizer websites are not crawled.

## All 15 university adapters

Every adapter shares bounded requests, same-host evidence-link validation, robots checks,
keyword/edition filtering, deduplication and mandatory staff review. Every adapter has fixture
coverage. A zero result verifies a readable collection path, not the absence of competitions.
Failures below are availability failures, not proof that access policies prohibit collection.

| Publisher | Configured official listing | Current verification |
| --- | --- | --- |
| UIU | https://www.uiu.ac.bd/event/ | Fixture tested; live request unavailable |
| BUET CSE | https://cse.buet.ac.bd/ and https://cse.buet.ac.bd/home/all_event | Live parsed 1 announcement |
| NSU ECE | https://ece.northsouth.edu/event/ | Fixture tested; live request unavailable |
| DIU | https://news.daffodilvarsity.edu.bd/category-news/events | Live parsed 1 announcement |
| RUET | https://ruet.ac.bd/news-and-event | Live parsed 2 announcements |
| Khulna University | https://ku.ac.bd/notices | Fixture tested; live request unavailable |
| GSTU Gopalganj | https://gstu.edu.bd/dev/notice/ | Live parsed, 0 matches; fixture tested |
| Dhaka University | https://www.du.ac.bd/events and https://www.du.ac.bd/ | Fixture tested; live request unavailable |
| AIUB | https://www.aiub.edu/category/notices and https://www.aiub.edu/ | Fixture tested; live request unavailable |
| IUT | https://www.iutoic-dhaka.edu/ | Fixture tested; live request unavailable |
| Jagannath University | https://jnu.ac.bd/newsite/noticeview/1 | Fixture tested; live request unavailable |
| Jahangirnagar IIT | https://iitju.edu.bd/news-events | Live parsed, 0 matches; fixture tested |
| UAP CSE | https://cse.uap-bd.edu/office/posts/?type=notice | Live parsed 1 announcement |
| Rajshahi University | https://www.ru.ac.bd/ | Live parsed, 0 matches; fixture tested |
| KUET | https://www.kuet.ac.bd/ | Fixture tested; live request unavailable |

UIU/NSU have explicit schedule extraction. Other adapters generally leave event dates unknown.
No dedicated ICPC, ICPC Asia, Devpost, SUST, CUET or BRAC connector was added. A university
notice mentioning ICPC is not a dedicated ICPC integration. No JavaScript, CAPTCHA, login or
access-policy barrier is bypassed. A successful archive request is not a complete policy audit.

## Facebook

The OAuth flow, encrypted Page tokens, authorized Graph API collection, suggestions and
permissions remain in place. Facebook remains disabled and unconfigured, with zero connected
Pages in the preserved application database. No credentials were requested or Page activated.
Only mocked tests were used for Facebook. See [FACEBOOK_SETUP.md](FACEBOOK_SETUP.md).
HTTP rate-limit cooldown metadata is retained without exposing tokens or response bodies.

## Worker reliability

The worker is a separate Django command, not Celery/Redis or an installed operating-system
service. Opening the website does not start it. Polling defaults to 30 seconds, minimum 10.

- Successful runs schedule from completion time using the configured interval (minimum 15 minutes).
- Consecutive failures use interval × 1, 2, 4, 8... up to a 24-hour backoff. An interval already
  longer than 24 hours is not shortened. A successful collection resets the failure streak.
- Valid HTTP 429/503 Retry-After delta-seconds or HTTP dates can extend that delay. Invalid,
  negative, expired or overflowing values safely fall back to normal backoff.
- HTML collectors honor robots Crawl-delay/Request-rate pacing up to their 20-second bounded
  adapter limit. Longer declared delays stop page collection for staff review rather than
  ignoring the policy. HTML challenge pages returned as robots.txt also stop collection.
- Run now/--force may bypass an ordinary successful refresh interval, but never an active
  failure cooldown, disabled source, active lease or source access policy.
- Lease acquisition and initial run creation are atomic. HTTP is outside that transaction.
- Leases expire after 15 minutes. Recovery finalizes old running history as interrupted/failed,
  preserves counts, clears expired leases, and schedules a later check. Active leases protect
  their history, including when a source is paused. An old worker cannot release a newer lease
  or resurrect a finalized run. Candidate writes verify the owned lease transactionally.
- Partial successes retain completed candidate transactions and counts. A failed run is not
  represented as a fresh successful check. One source failure does not stop other sources.
- Ctrl+C records an interrupted run and releases the owned lease. Abrupt termination relies
  on expiry/recovery. No worker or persistent service was started against application data.

Backoff and source health are calculated from existing retained run history, so there is no
migration. Recovery changes operational history only when the worker or an import is invoked;
merely reading the health API does not repair or modify records.

## Source health and review

Open `/admin?tab=live-imports` on the frontend. Sources show actual last attempt/success/failure,
next eligible check, consecutive failures, retry state, review counts, total runs and last result.
Skipped runs do not count as successful checks or reset failures. Paused sources remain paused.
There are no invented health scores or percentages. Overdue means no success or more than
two configured refresh intervals since the last success.

The review queue shows missing metadata, last seen, source evidence, previous/applied version,
staff overrides, field changes and duplicate warnings. Similar normalized titles need matching
dates, organizer information or same-source identity to generate a duplicate warning. Official
URL matches are also flagged. Ambiguous records are never automatically merged.

Staff need `discovery.manage_discovery`; publication/update approval also needs
`competitions.change_competition` and `competitions.review_competition`. Session writes require
CSRF. Sources cannot supply arbitrary fetch endpoints. Ordinary users cannot read/manage health
or review records. Legacy demo authentication is not used by discovery or these tests.

## Public Explore

Home discovery and Explore start with Upcoming, including future events with open, closed or
unknown registration deadlines. Completed events remain accessible through explicit filters and
their original detail URLs. The public API keeps its unfiltered behavior for compatibility.
Tag search is included. Calendar filters send the browser's IANA timezone and local calendar
date, so Bangladesh midnight does not shift to the previous UTC date.

Public notices include Source check overdue, Source unavailable, Update pending, Date passed,
and Needs manual verification when applicable. Not seen in the latest successful collection
is explicitly not proof of cancellation; a failed fetch does not establish disappearance.

## Windows PowerShell startup and verification

From the existing project, use separate PowerShell terminals. Do not activate a copied venv:

```powershell
Set-Location 'E:\TalentSquare\3rd Nov'
python -B server.py
```

```powershell
Set-Location 'E:\TalentSquare\3rd Nov'
python -B manage_local.py runserver 127.0.0.1:8001 --noreload
```

Only when you intend collection to write candidates/history and potentially publish Codeforces:

```powershell
Set-Location 'E:\TalentSquare\3rd Nov'
python -B manage_local.py run_import_worker
# Ctrl+C stops it. This is not an installed permanent service.
```

No migration/bootstrap is necessary for the existing Phase 7 database. Before any future real
migration, make and verify a SQLite backup. Never reset or replace the application database.

```powershell
python -B manage_local.py check
python -B manage_local.py makemigrations --check --dry-run
python -B manage_local.py test --noinput
```

Django tests use isolated test databases. A real Chrome regression is also provided:

```powershell
# Ports 8000 and 8001 must be free; the script starts/stops its own test servers.
python -B backend/discovery/browser_phase7_regression.py
```

That script creates a new disposable SQLite database, migrates/seeds only that database,
logs in through the real frontend/Django API, exercises staff review and public discovery,
checks unauthorized access and an unavailable-backend error, and cleans up its own processes.
No API responses are mocked. It never opens the existing application database or runs imports.
Older live browser scripts elsewhere in the project write to the configured application database;
do not use those as a substitute for this isolated script.

Manual verification: inspect health timestamps, compare source/applied/override evidence in the
review queue, and check public Upcoming/search/date filters. Use the isolated script for approval,
rejection and update writes. Do not approve existing pending notices merely to test a button.

## Troubleshooting and limitations

The [November university auto-scraping audit](UNIVERSITY_AUTO_SCRAPING_AUDIT.md) separates
fresh live retrieval from isolated worker and Chrome evidence. For a real command lifecycle
proof without writing application data, run `python -B backend/discovery/verify_university_worker.py --save-evidence`.
It creates its own migrated temporary database and controls only HTTP transport and elapsed time.
Live Imports now shows candidate/duplicate counts and successful-run counters, and explicitly
states that Enabled does not establish a running worker. See the audit for dated blockers and startup commands.

- An enabled source is not proof that a worker is running. Start a separate process deliberately.
- An HTTP error, timeout, inaccessible robots policy or changed layout is an error, not an empty
  successful result. Inspect run history and wait for the displayed cooldown.
- A readable archive with zero matches is not proof of comprehensive university coverage.
- Robots denial and redirects stop collection; fix/review the approved endpoint instead of bypassing.
- Fixed schedules can change upstream. Keep fixtures and run limited permitted retrieval checks.
- Duplicate warnings are conservative and require human comparison; they are not an identity proof.
- Unknown announcement dates, hosts, registration links and image-only details still require staff.
- No automatic cancellation reconciliation or permanent worker supervision is provided.
- Production still needs deployment URLs, HTTPS/secrets/cookies, backups, monitoring and supervision.
- Separate legacy frontend-server demo authentication remains outside this phase and must not be
  exposed as production authentication. Participant registration and careers features remain outside scope.
