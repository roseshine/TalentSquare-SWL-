# Job fairs

Phase 10 adds `backend/jobfairs` to the existing Django project. No sample job fair is imported or silently mixed into the real public directory. The existing demo data remains unused by the public Job Fair routes. Job applications, recruiter hiring, rankings, payments, tickets and certificates are outside this feature.

**Attendance registration records interest or planned attendance. It is not verified attendance, a job application, an interview reservation or recruitment.**

## Models and policies

- `JobFair`: stable integer ID, organizer FK and organization-name snapshot, title/description, venue, city/university, onsite/online/hybrid format, aware start/end/deadline, internal/external attendance mode, official website and registration URL, eligibility, publication/reviewer metadata.
- `JobFairBookmark`: unique participant/fair pair, saved timestamp.
- `JobFairAttendanceRegistration`: unique participant/fair pair, active/withdrawn status, original registration/update/withdrawal timestamps. Database constraints prevent duplicate pairs and inconsistent withdrawal state.
- `JobFairReview`: retained approval/rejection/cancellation decision, reviewer, note and timestamp. Previous decisions survive correction/resubmission.

Drafts may be incomplete. Submission/approval requires confirmed title, description, venue, start/end/deadline, eligibility and organization; a city is required for onsite/hybrid fairs. External mode requires an official registration URL. Dates are explicit ISO timestamps with a timezone; the browser converts locally entered times to aware ISO values. End cannot precede start; deadline cannot exceed start. Submission and approval require future start/deadline. Unknown facts are not invented.

Only published fairs are public. The public directory supports search, city, event format, attendance mode, date range with IANA timezone, upcoming filter, ordering and pagination (12/default, 60 maximum). Default ordering is event start. Past published fairs remain discoverable with closed registration; cancellation hides the public record, preserving private registration history.

## Roles and workflow

Active Organizers with a saved organization profile create owned drafts, edit drafts/rejected records and explicitly submit. Owner and publication fields are never accepted from client input. Pending/published/cancelled records cannot be edited by organizers. Rejection requires a note; the organizer can correct and resubmit without losing decisions.

Active staff require **both `jobfairs.change_jobfair` and `jobfairs.review_jobfair`** to review. Existing superusers inherit these permissions. No existing staff role or explicit permission assignment is changed. The Job Fair queue is separate from competition imports at `/admin?tab=fairs`. Reviewers can approve/reject pending entries, inspect publication history, or cancel a published fair with a note. Django Admin also exposes validated actions; pending corrections are available there to authorized reviewers. Published data is read-only except review notes; cancel rather than silently editing the public listing. Participant registration, bookmark and review records have read-only Admin exposure.

Active Participants with saved profiles can save published fairs and register internally only before both deadline and event start. Registration is unavailable for external/unpublished/cancelled fairs. Duplicate requests return 409; the database uniqueness constraint and SQLite write-before-read transaction prevent race duplicates. A concurrent lock conflict returns 409 so the client can retry. Withdrawals are idempotent before event start, even after registration closes; they retain the original row and timestamp. Withdrawn registrations cannot be reopened in this phase.

External links use HTTP(S) URLs without embedded credentials, open a separate tab with `noopener noreferrer`, and cause no internal record or external confirmation. Optional external self-reporting is **not implemented** for Job Fairs; existing competition self-reporting is separate and unchanged.

Organizer registrant lists are owner-only for internal fairs. They share only a participant reference (`Participant #ID`), registration reference/status and timestamps. No names, email, phone, skills or other private profile details are shared. Recruiters gain no Organizer/Participant/staff rights from browsing. All identities come from Django sessions; CSRF, exact-origin CORS and private response cache controls remain enforced.

## APIs

All endpoints are on Django, normally `http://127.0.0.1:8001`. No frontend-server API is enabled.

| Endpoint | Methods / access |
| --- | --- |
| `/api/job-fairs/` | GET public, published only |
| `/api/job-fairs/{id}/` | GET public, published only |
| `/api/organizer/job-fairs/` | GET owned paginated fairs; POST draft |
| `/api/organizer/job-fairs/{id}/` | GET owned; PATCH editable details |
| `/api/organizer/job-fairs/{id}/submit/` | POST empty JSON, owner |
| `/api/organizer/job-fairs/{id}/registrations/` | GET minimal owned internal registrants |
| `/api/job-fair-review/?status=pending_review` | GET staff queue; `all` includes history states |
| `/api/job-fair-review/{id}/` | GET staff; PATCH `{action: approve/reject/cancel, note: ...}` |
| `/api/participant/job-fair-bookmarks/` | GET own published saved fairs |
| `/api/participant/job-fairs/{id}/bookmark/` | POST empty JSON; DELETE empty JSON |
| `/api/participant/job-fairs/{id}/activity/` | GET own bookmark/registration state |
| `/api/participant/job-fairs/{id}/register/` | POST empty JSON, internal only |
| `/api/participant/job-fair-registrations/` | GET own retained registrations, including cancelled fairs |
| `/api/participant/job-fair-registrations/{id}/withdraw/` | POST empty JSON, owner only |

List responses use `{count,next,previous,results}`. Dates include timezone. Public input filters: `search`, `city`, `event_format`, `attendance_mode`, `upcoming=true/false`, `date_from`, `date_to`, `timezone`, `ordering=start_at/-start_at/title/-published_at`, `page`, `page_size`. Invalid filters are rejected. No user ID is accepted by participation actions.

## Frontend and manual verification

Home retains its Job Fair section but loads actual published records with loading/empty/error states. `/job-fairs` has real cards/search/filters/sorting/pagination. `/job-fairs/{id}` shows confirmed details, bookmark state, internal registration/withdrawal or official external link. No sample fallback is shown during errors.

Participant workspace: `/workspace?role=participant&tab=fairs` separates saved fairs and attendance history from competition activity and preview job applications. Organizer workspace: `/workspace?role=organizer&tab=fairs` provides drafts, submission, correction/resubmission and minimal owned registrants. Admin workspace: `/admin?tab=fairs` is real Job Fair review; other demo admin areas remain explicitly labeled.

For interactive write tests, use a disposable migrated database, temporary accounts and isolated frontend/backend ports. Verify draft → submit → reviewer approve → published directory; participant save/register; refresh and logout/login; duplicate conflict; withdrawal history; external link no false registration; owner registrants and other-owner denial; rejected correction/resubmission. Existing real accounts/candidates must not be used for automated writes.

## Migrations, backup and startup

`jobfairs.0001_initial` is additive: four new tables/indexes/constraints, one migration history row, Job Fair content types/permissions. It does not seed fairs, touch competitions/discovery, change source policies or assign existing user permissions.

Read [PHASE10_REPORT.md](PHASE10_REPORT.md) for whether the real migration was applied. Do not assume model files mean the live database is migrated. Running development servers use `--noreload` and require a coordinated manual restart to load new Django code. The existing worker must not be duplicated or killed during an import.

The real `jobfairs.0001_initial` migration was applied and verified on 6 November 2026. All services were left stopped. The one-time backup/rehearsal verifier below is for a pre-migration database and refuses reapplication; do not rerun it on this migrated database. See the final report for the verified fresh backup and preserved original records.

Safe isolated verification:

```powershell
python -B manage_local.py check
python -B manage_local.py makemigrations --check --dry-run
python -B manage_local.py test --noinput
python -B manage_local.py test jobfairs --noinput
python -B backend/jobfairs/verify_phase10_migration.py
python -B backend/.runtime/phase10_safety/browser_runner.py
```

The migration verifier's default mode uses online SQLite backup and a disposable rehearsal; it never applies to the original. `--apply` requires passed test/browser gates and refuses detected live worker/Django writer processes. Coordinate idle Ctrl+C shutdown of relevant writers before live migration, take a fresh verified backup/rehearsal, and preserve all original row hashes. It never stops or restarts processes. If coordination is unavailable, leave the migration unapplied.

Normal local startup after successful migration, in separate terminals:

```powershell
python -B server.py
python -B manage_local.py runserver 127.0.0.1:8001 --noreload
```

Use `127.0.0.1` consistently. Do not start another process if that port is already served. A deliberately stopped import worker is restarted only with the owner's authorization, manually using `python -B manage_local.py run_import_worker`.

## Limits

No attendee verification, employer invitations/claims, ticketing, capacity management, payments, applications, resume upload/export, certificates or recruitment are implemented. External registration is not confirmed. No real fairs are seeded to fill the empty directory. Real-source correctness and organizer claims still require human review. Existing deployment limits (CDN frontend dependencies, local origins, HTTPS/service supervision and monitoring) remain.
