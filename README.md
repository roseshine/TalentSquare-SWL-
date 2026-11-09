# Talent Square

Competition discovery, organizer submissions, accounts, real job fairs, and rankings previews in the existing dark gradient design.

## Phase 10 job fairs

Job fairs now have a dedicated Django app, organizer drafts/submission, staff publication review and history,
published-only public directory, participant bookmarks, internal attendance registration/withdrawal and
private organizer registrant lists. External official links never create registrations. Attendance registration
records interest or planned attendance; it is not a job application, recruitment, hiring or verified attendance.
The dark gradient layout and existing competition flows are retained. See [JOB_FAIRS.md](JOB_FAIRS.md)
for endpoints, policies and isolated testing, and [PHASE10_REPORT.md](PHASE10_REPORT.md) for actual
migration/test status. The live worker must not be duplicated or stopped merely to browse the UI.

## Phase 9A university discovery accuracy

The existing 15 university adapters now retain explicit source/date evidence, keep date-only and ambiguous schedules unresolved, reject misleading workshop/congress matches, and stop on missing or unreadable robots policies. Live Imports separates publisher from organizer/host, shows missing/conflicting evidence, and retains future staff review decisions. University publication remains review-first.

[University source inventory](docs/bangladesh_university_sources.md) documents 23 individually investigated institutions and 26 fixed collection/research URLs, alongside an authoritative 180-row UGC catalog snapshot. No additional university adapter was activated where permission or a reliable listing was unresolved. Fixture-tested parsing and live access are reported separately; PDF text extraction/OCR and nationwide completeness are not claimed. See [PHASE9A_REPORT.md](PHASE9A_REPORT.md) for source-by-source results, tests and real-data preservation.

## Phase 9 security hardening

Both frontend servers reject legacy authentication and competition API routes with HTTP 410. Real accounts, profiles, reviewed competitions, participant activity, Live Imports and Phase 10 job fairs use Django on port 8001. Recruitment, rankings, sample admin areas and support delivery remain previews.

The frontend hosts bind to loopback, expose only explicit public assets, reject traversal/private-file requests and send no wildcard CORS. Genuine Django session authentication, CSRF and role/ownership checks remain enabled. Private API responses are not cacheable. Production configuration is an explicit environment opt-in and does not enable HTTPS-only settings on localhost.

See [SECURITY.md](SECURITY.md) for disabled/real API routes, local security restrictions, production environment variables, deployment limitations and deterministic security/Chrome test instructions. See [PHASE9_REPORT.md](PHASE9_REPORT.md) for verification and data-preservation evidence. This application is not production-ready: public API-origin configuration, pinned frontend builds, HTTPS hosting, operational controls and deployment testing remain required.

## Phase 8 participant activity

Account-backed bookmarks, internal competition registration and withdrawal, external self-reported activity, My Competitions, and organizer-owned registrant lists are implemented. Official external links never register a participant. See [PHASE8_REPORT.md](PHASE8_REPORT.md) for verification, migration evidence and limitations.

## Phase 7 discovery stabilization

See [DISCOVERY.md](DISCOVERY.md) for current connector verification, retry/backoff, source health, duplicate warnings, review rules, isolated Chrome testing and troubleshooting. No database migration is required by Phase 7. Existing source settings and application records are preserved.

## Local startup

Use the machine's Python with the bundled Django dependencies through manage_local.py; it adds this project's existing dependency directory without requiring environment activation or package installation. For a new machine, recreate a Python 3.13 environment from backend/requirements-lock.txt rather than copying virtual-environment executables.

From this project folder, run in separate terminals:

    python -B server.py

    python -B manage_local.py runserver 127.0.0.1:8001 --noreload

The existing database is already migrated. Normal startup does not need bootstrap, migration or a worker. Run import workers only when intentionally collecting data.

Open in the default browser:

    Start-Process "http://127.0.0.1:8000/"

Use 127.0.0.1 consistently for frontend, account sessions and Django Admin (http://127.0.0.1:8001/admin/). Use `node server.js` or `npm start` as the alternative frontend server; it also binds to 127.0.0.1. Run only one frontend at a time. Real passwords are verified by Django, which uses an HTTP-only session cookie and CSRF-protected writes; no frontend bearer tokens or localStorage identities authenticate an account.

The worker checks due sources every 30 seconds; default source refresh is 60 minutes (minimum 15). It needs no browser, but it stops when its process or computer stops. Production hosting needs a persistent worker service alongside Django. No Windows scheduled task or external automation is installed.

## Thirteen page types

Home, Login (including recovery), Signup, Explore competitions, Competition details, Job fairs, Job-fair details, Rankings, My workspace, Admin workspace, Help, Privacy, and Terms.

Workspace roles use query-string tabs. The previous /forgot-password and /organizer/competitions/new URLs remain compatible aliases. Loading/access-denied previews and the 404/empty states are reusable interface states.

## Connected and preview features

- Django/SQLite implements registration with automatic session login, session login/logout, current-user lookup, private role profiles and profile updates. Successful signup opens the new account's role workspace without a second login.
- Organizer competition drafts/submissions and public published-listing APIs are connected. Django Admin supports review and publication.
- Public Explore supports CSE categories, host types, combined search/filters, sorting and pagination.
- Admin **Live imports** uses real staff-protected Django APIs. Older sample admin tabs and **Simulate check** controls remain clearly labeled demonstrations.
- Competition bookmarks, internal registrations, external self-reports and organizer registrant lists use Django. Job fair bookmarks, internal attendance registrations and owned registrant lists also use Django. Project submissions, hiring, ranking scores and support delivery remain previews.
- Other sample workspace data and preferences use browser localStorage. Participant saved competitions use Django; browser preview saves are not imported. Support messages are downloadable drafts rather than delivered messages.
- Privacy and Terms are prototype drafts and must match the deployed service before launch.
- Existing account/database records are retained. Legacy platform_db.json records are preserved privately; both frontend servers have stopped reading and writing that obsolete demo store.

## Live competition discovery

Programming-platform connectors read official public listings:

| Source | Fixed schedule | Default refresh | New listings |
| --- | --- | --- | --- |
| Codeforces | https://codeforces.com/api/contest.list?gym=false | 60 minutes | Existing source policy retained |
| AtCoder | https://atcoder.jp/contests/?lang=en | 60 minutes | Staff review first |
| Major League Hacking | https://www.mlh.com/seasons/2027/events/ (current academic season) | 360 minutes | Staff review first |

AtCoder imports upcoming and daily contests, including the published time-zone offset and duration. MLH imports future pending hackathons from the page's embedded public schedule data: original UTC timestamps, location, event format and organizer website. It does not fetch organizer websites, private APIs or full event announcements. MLH is a listing source; actual event hosts and university affiliation remain unknown when the schedule does not establish them.

MLH season URLs roll to the next academic year in July. A missing page or changed page structure creates a visible failed run, rather than silently falling back to a private API. These HTML adapters depend on the official page structure, so changes may require maintenance.

AtCoder and MLH adapters check each site's robots policy before fetching its schedule, stop on denied/unreachable policy, block redirects, and bound response sizes, record counts and request timeouts. Only the fixed official schedule and robots endpoints are fetched. Facebook supports authorized Page connections as described in FACEBOOK_SETUP.md; it needs a configured Meta app and Page-owner authorization. A direct ICPC-site adapter and Devpost are not connected. Selected university pages are supported as described below.

Bootstrap adds the two new sources enabled in review-first mode and Facebook disabled. It never changes existing source settings. Existing Codeforces auto-publication stays as configured. Run the worker in addition to the frontend and Django API; opening the website does not start the worker.

### Publication and accuracy

- New source/contest IDs are unique; original-event URL matching also catches organizer-listing duplicates. Manual organizer records are never overwritten.
- Event IDs, names, dates and other available metadata come from the official listing. Unavailable deadlines, eligibility, hosts, team size, fees and prizes remain unknown. No source listing is proof of organizer endorsement or verification.
- New contests publish automatically only when the trusted source's auto_publish policy is enabled. Otherwise, they stay private for review.
- Changes to already published contests enter update_pending and need explicit approval. Administrator field edits are preserved against the last applied source snapshot.
- Identical rejected imports stay rejected. A materially new version of a rejected published update can be reviewed again.
- Missing announcements are not treated as evidence of cancellation. Public pages retain original source links and last-check times. Imported does not mean endorsed or manually verified.
- Run history records failures and partial counts. Timestamped leases prevent overlapping workers and recover expired leases; Phase 7 also finalizes abandoned run history without deleting records.

### Staff controls

Open /admin?tab=live-imports and use **Sources**, **Review queue**, or **Run history**. All writes use CSRF-protected sessions.

Read/source/run controls require active staff with discovery.manage_discovery. Approval, applying updates and enabling auto-publication additionally require competitions.change_competition and competitions.review_competition. Existing Django superusers have these permissions. No administrator account or credentials are created by the importer.

The API lives under /api/discovery/. Source configuration accepts only enable/pause, interval and auto-publication preferences. Arbitrary endpoints and secrets cannot be supplied.

### One-time checks and tests

    python -B manage_local.py import_competitions --source 1 --force
    python -B manage_local.py run_import_worker --once
    python -B manage_local.py check
    python -B manage_local.py makemigrations --check --dry-run
    python -B manage_local.py test

--force bypasses the interval only, never a paused or unsupported source. Tests mock external requests and use isolated test databases.

## Source files

- app.js: navigation, original homepage, discovery filters/cards and public API mapping.
- pages.js: routes, account forms, competition details/submission, supporting pages.
- workspaces.js: member/admin layouts, previews and real import controls.
- styles.css: shared original visual system and responsive layouts.
- backend/accounts: account API, profiles, CSRF and local-origin middleware.
- backend/competitions: competition models, organizer API, public listings and Django Admin.
- backend/discovery: fixed official connectors, collector, review, source/candidate/run API, admin and worker commands.
- manage_local.py: portable entry to the bundled Django dependencies.

The frontend still uses CDN-loaded React, Babel, Tailwind and fonts. Before public deployment, build bundled frontend assets, configure HTTPS/private secrets/secure cookies/shared rate-limit storage, and review permissions, retention, backups and production worker supervision.


## Password recovery

Forgot password at /login?view=recovery now calls the Django API. Reset links expire after one hour, become invalid after use or a password/email change, and require an explicit password-confirmation POST. Resetting logs out existing sessions for that account; passwords are never returned. Email requests use a generic reply for unknown/inactive accounts and rate limits. Use the exact registered email, including any registration typo, until an administrator corrects it.

Local development defaults to a file outbox at backend/.runtime/emails. Open the newest message locally and follow its reset URL. Messages are not sent to an inbox in this mode. Never upload the outbox, its tokens, SQLite database, logs, or environment secrets to GitHub. Both frontend servers deny downloads of backend files and outbox messages.

To deliver real email, configure environment variables before starting Django:

- DJANGO_EMAIL_MODE=smtp
- DJANGO_SMTP_HOST, DJANGO_SMTP_PORT (default 587), DJANGO_SMTP_USERNAME and DJANGO_SMTP_PASSWORD
- DJANGO_SMTP_TLS=1 and DJANGO_SMTP_SSL=0 for STARTTLS; for implicit TLS typically port 465, TLS=0 and SSL=1
- DJANGO_DEFAULT_FROM_EMAIL: a sender verified by the provider
- DJANGO_FRONTEND_ORIGIN: the fixed website origin (default http://127.0.0.1:8000); use the deployed HTTPS origin in production

Django 6.1 MAILERS configures delivery. No SMTP credentials are included. A shared cache is needed for rate limits across production workers. Keep email messages private and remove expired development messages when no longer needed. The UI does not expose token contents or outbox messages through an API.


## Bangladesh university announcements

The official-source registry in backend/discovery/university_connectors.py provisions fifteen enabled university sources with a default six-hour interval:

| Publisher | Checked pages |
| --- | --- |
| BUET CSE | https://cse.buet.ac.bd/ and https://cse.buet.ac.bd/home/all_event |
| United International University | https://www.uiu.ac.bd/event/ |
| North South University ECE | https://ece.northsouth.edu/event/ |
| Daffodil International University | https://news.daffodilvarsity.edu.bd/category-news/events |
| RUET | https://ruet.ac.bd/news-and-event |
| Khulna University | https://ku.ac.bd/notices |
| GSTU, Gopalganj (formerly BSMRSTU) | https://gstu.edu.bd/dev/notice/ |
| University of Dhaka | https://www.du.ac.bd/events and https://www.du.ac.bd/ |
| AIUB | https://www.aiub.edu/category/notices and https://www.aiub.edu/ |
| IUT | https://www.iutoic-dhaka.edu/ |
| Jagannath University | https://jnu.ac.bd/newsite/noticeview/1 |
| Jahangirnagar University IIT | https://iitju.edu.bd/news-events |
| University of Asia Pacific CSE | https://cse.uap-bd.edu/office/posts/?type=notice |
| University of Rajshahi | https://www.ru.ac.bd/ |
| KUET | https://www.kuet.ac.bd/ |

Bootstrap preserves existing source settings. The worker discovers enabled supported sources without a platform-only hardcoded filter. This is configured-page coverage, not all universities or all historical pages. Each additional university requires an approved public source and a verified adapter/fixture. UIU club's JavaScript-only shell, MIST's historical multi-university archive, Facebook-only announcements and notices whose titles appear only inside a PDF/image are not connected. For Khulna, Jagannath and Gopalganj, readable HTML notice titles can point to an official PDF as evidence; PDF contents are not downloaded or interpreted.

Collectors use fixed HTTPS URLs, validate same-host announcement links, respect robots restrictions, reject redirects, and bound time, response size, node count and candidate counts. A missing robots.txt (HTTP404) means no published restriction; robots errors, denied paths or an HTML login page stop collection visibly. They read only the configured listing pages, not arbitrary links, PDF files, private groups or organizer sites. Titles and source metadata are retained with original links, rather than copying full announcements.

Title matching covers programming contests, ICPC/IUPC/NCPC, hackathons, datathons, CTFs and selected CSE festivals. Results, champion announcements, unrelated events, explicitly old editions, and known past event dates are excluded. The initial pass is limited to visible listing cards, so a successful check with zero candidates does not mean the university never holds contests.

Announcement publication dates are stored separately and NEVER used as event dates. UIU and NSU calendar date/time fields are interpreted in Asia/Dhaka; unavailable dates stay null. A university publisher is not assumed to be the organizer/host. A campus venue does not establish the host or event format. Host identity, university affiliation, format and registration links stay unknown until staff confirms them from evidence. Keyword matches can include a festival with multiple segments and must be checked before publication.

These university sources ALWAYS require manual verification. Automatic publication is disabled in the model, API and collector, even if the database flag is bypassed. The first scan can produce undated or historical notices for review; these are private and cannot be approved without a future competition start date, confirmed host, organizer, format and location, and a review note.

In Admin -> Live imports -> Review queue, filter by source, open the original announcement, add a review note, then expand **Confirm missing university event details**. Save confirmed details before approving. Times in this form use the reviewer's displayed local timezone and are submitted as timezone-aware ISO dates. Confirm the hosting university explicitly when choosing University-hosted; the source publisher and actual host are separate concepts. A confirmed published university listing becomes available through existing public university filters.

Verified details are stored as review_overrides, separately from the immutable source payload. Collector reruns preserve them. Material source changes enter update_pending; their raw source diff is retained for review. Publication still preserves administrator edits on the public listing. Existing accounts and manual competitions are unaffected.

Run locally from the project root:

    python -B manage_local.py run_import_worker

The website does not start this worker automatically. No scheduled OS service or Codex automation is installed. Source health and failures appear under Live imports -> Sources/Run history. Review permissions and CSRF remain required; ordinary accounts cannot change source settings, save verified details or approve events.


The expanded batch was checked against live official pages on 28 October 2026. Ten new sources completed collection; RUET produced two candidate announcements and UAP one. Together with the four earlier sources, fourteen university collectors have readable listing pages. KUET is configured as the fifteenth university, but its robots.txt currently returns HTTP 500: the collector records this failure and retries on its next scheduled run, without fetching the announcement page until the policy is readable. This is a temporary source blocker, not successful empty collection.

BRAC University (HTTP 403), SUST (robots policy inaccessible), CUET and DUET (listing data needs an additional JavaScript/API adapter), and University of Chittagong (HTTP 403 during the policy check) remain unconnected. Access restrictions are not bypassed. All collection remains bounded to configured public pages; no Facebook crawling, arbitrary crawling, authenticated access, PDF downloads or OCR is added. Collection only repeats while the existing background worker is running. Bootstrap does not start the worker or change existing source preferences.


## Facebook announcements

See [FACEBOOK_SETUP.md](FACEBOOK_SETUP.md) for server configuration and Page authorization. Admin -> Live imports -> Sources contains the connection and Page controls. Organizers can suggest a Facebook post link through Submit Competition even without a connected Page. Both paths require staff verification before publication. No Meta credentials or real Page connections are included with this update.


## Account profiles, privacy and images

Participant profiles support department, graduation year, Codeforces and AtCoder handles, portfolio, education, experience and self-reported competition achievements alongside the existing name, institution, bio, skills and professional links. Organizer profiles include a contact person and organization details; public organizer profiles show only their published competitions. Recruiter profiles include hiring interests, designation, company details and LinkedIn.

All three roles can edit their own profiles under My workspace. Photos are optional at signup and can be uploaded, replaced or removed later. Organizers use an organization logo as their main image. Recruiters can have a personal photo and a separate company logo. A failed optional signup upload does not undo account creation or require signup again: the new account stays logged in and opens its profile to retry.

Profiles remain private by default. The owner can opt in to a public page at /profiles/<account-id>; that page publishes the displayed profile details and images. Login email and contact phone are hidden unless separate sharing switches are enabled. Returning the profile to private also hides its image endpoints immediately. Availability preferences are not included in the public response. Self-reported achievements are explicitly labeled and do not create verified badges or ranking points. Public profiles are shareable links; the existing sample participants/rankings pages are not replaced with a public directory in this update.

Install backend/requirements-profile-images.txt in the Django Python environment. This local upgrade installs Pillow into the existing bundled environment. The upload endpoint accepts one still JPEG, PNG or WebP image up to 5 MB and 20 million pixels, re-encodes it as WebP with a maximum dimension of 512 pixels, and strips metadata. SVGs, animated images and invalid files are rejected. Small normalized images are stored in the profile_images table in SQLite, keeping local backups self-contained; a larger production deployment can move this storage to private object storage while preserving the permission checks. Private images are served through Django with owner/public visibility checks, never exposed through the frontend static file server.

Owner image endpoints: POST/DELETE /api/auth/profile/images/photo/ and, for recruiters, company_logo/. The authenticated upload uses multipart form data and CSRF protection. Public profile reads use /api/profiles/<id>/. Profile images use /api/profiles/<id>/images/<kind>/. Client-supplied account IDs, roles, image URLs and admin privileges cannot be changed through profile editing.
