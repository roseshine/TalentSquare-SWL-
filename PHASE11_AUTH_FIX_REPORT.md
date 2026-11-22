# Phase 11 — Authentication Repair Report

**Date:** 15 November 2026 (Asia/Dhaka)  
**Project:** `E:\Project\TalentSquare\3rd Nov`

## Finding and root cause

The Django session was not being randomly deleted. Signup and login call Django's `login()`, API requests send `credentials: 'include'`, and the frontend selects `localhost` or `127.0.0.1` consistently with the page hostname. CSRF, credentialed CORS, session middleware and secure logout were present. The existing session-backed browser flows had passed before this phase.

The confirmed user-visible cause was frontend auth-state handling around a temporary account-service failure:

1. On browser focus, `WorkspacePage` immediately replaced its loaded authenticated account with `{status: 'loading', account: null}` while rechecking `/api/auth/me/`.
2. A timeout/network/5xx error then set `{status: 'error', account: null}`. The workspace lost its authenticated identity and looked unavailable/signed out, although Django's session remained valid.
3. `useParticipantSession` cached a rejected in-flight `/auth/me/` promise in a module variable. A transient failure could therefore poison later reads until a successful auth event or reload.

A disposable real-Chrome reproduction logged in through the real Django API, caused the next `/auth/me/` request to reject as a controlled temporary network failure, and confirmed the UI retained its authenticated Django account while the session remained usable. There was no evidence of hostname mismatch, missing credentials, CSRF weakening, localStorage identity overriding Django, duplicate logout requests or password recovery invalidating sessions outside its intended behavior.

## Changes made

- `workspaces.js`: keep an already-loaded authenticated account through a focus refresh and through temporary non-401 service errors. A real HTTP 401 still clears the account; a first-load failure still presents an error state. Existing request-generation checks continue to discard stale overlapping responses.
- `pages.js`: clear the shared current-user promise after it settles, and use a per-hook request generation so an older overlapping response cannot overwrite a newer account result. A genuine 401 remains a signed-out state; a temporary failure preserves any previously authenticated account and can be retried.
- `manage_local.py`: if the copied portable environment's Pillow native extension is incompatible with the machine's Python, use the machine's already-installed matching Pillow binary. This does not rebuild or modify the copied `.venv`; it lets the requested test command import the profile-image test module under Python 3.14.
- `backend/accounts/browser_phase9_regression.py`: added real-browser checks for temporary `/auth/me/` failure recovery, same-browser second-tab persistence, and mobile navigation/overflow.

No authentication security checks were disabled. No token storage was added to localStorage. API roles and authorization remain based on Django's authenticated session.

## Verification

### Required Django commands

- `python -B manage_local.py check` — passed, no issues.
- `python -B manage_local.py makemigrations --check --dry-run` — passed, no model changes.
- `python -B manage_local.py test --noinput` — **359 tests passed, 0 failures, 0 skips**, exit 0.
- An earlier full-suite run had a transient Windows socket-aborted error in one Node frontend security test; its 9-test class passed on isolated rerun, and the final complete run passed.
- `accounts.test_profiles` separately passed all 11 tests after the launcher fallback was corrected.

### Real-browser tests (isolated SQLite databases)

`python -B backend/accounts/browser_phase9_regression.py --frontend python` — **20 workflow assertions passed**, 0 uncaught JavaScript exceptions. It verified:

- Participant, Organizer and Recruiter signup creates the expected Django account and automatically signs in.
- Login, profile update, valid/invalid role route behavior, and role redirects.
- Session persistence through navigation, full refresh, a second Chrome tab and explicit logout/login.
- A temporary current-user API failure does not discard authenticated workspace state.
- Overlapping current-user requests cannot let a delayed stale 401 clear a newer authenticated response.
- Mobile menu navigation reaches Explore at a 390px viewport without horizontal overflow.
- CSRF-protected registration/profile/competition flows, recovery request, internal registration/withdrawal, external self-report, owner scoping and cross-role denial.
- No uncaught JavaScript exceptions.

The same phase sequence also passed the current real-Chrome suites for discovery/review (9), participant competition activity (11), university review (9), and Job Fair workflows (17): **46 additional workflow assertions**, all with zero uncaught JavaScript exceptions. Combined browser result: **66 successful workflow assertions**. Each script used a disposable SQLite database and temporary accounts; no real account or import rows were used.

Django tests additionally cover invalid credentials, signup validation and CSRF, expired/invalid sessions, permission boundaries, password reset/token/session behavior and concurrent writes. The browser check used a controlled client-side network failure; it did not claim a real production outage test.

## Database and process safety

- Active database: `backend/db.sqlite3`, SQLite; 27 tables and 29 recorded migrations.
- Read-only integrity check: `PRAGMA integrity_check = ok`; `PRAGMA foreign_key_check` returned 0 rows.
- Read-only before/after row counts remained the same: 7 users; 4 participant profiles; 1 organizer profile; 0 recruiter profiles; 14 competitions; 19 import sources; 94 candidates; 55 import runs; 0 connected Facebook Pages; 6 Django sessions; 29 migration records.
- No migration was applied and there are no model changes. Test/browser databases were isolated. No real data were reset, seeded, or modified by this phase.
- No new backup was created because there was no real-database schema or data write. Historical Phase 8/10 verified backups remain in `backend/.runtime/backups`; they predate this phase and are not represented as a fresh snapshot of the current database.
- Before work, no Django server, frontend server or discovery worker was running. Browser scripts started and stopped only their own disposable test processes. No import worker was started.

## Limits

The report diagnoses and fixes the reproduced user-visible false logout behavior, not a reported production outage at a deployed domain. No production cookies, accounts, external mail server or Facebook credentials were available. The full site control-by-control audit remains partial; see `FEATURE_FUNCTIONALITY_AUDIT.md`.

## Local startup commands

From separate PowerShell terminals:

```powershell
Set-Location 'E:\Project\TalentSquare\3rd Nov'
python -B server.py
```

```powershell
Set-Location 'E:\Project\TalentSquare\3rd Nov'
python -B manage_local.py runserver 127.0.0.1:8001 --noreload
```

Only when deliberately running real scheduled imports, use a third terminal:

```powershell
Set-Location 'E:\Project\TalentSquare\3rd Nov'
python -B manage_local.py run_import_worker
```

The worker writes import history/candidates and can publish Codeforces records under the existing policy. It is not installed or supervised; start it intentionally and stop with Ctrl+C.
