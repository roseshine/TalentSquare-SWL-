# Local security and deployment guide

Phase 9 hardens local development. This application is **not production-ready**.

## Which server handles accounts

The frontend is served on `http://127.0.0.1:8000`. Django handles real APIs on `http://127.0.0.1:8001/api/`.

| API | Current behavior |
| --- | --- |
| Django `/api/auth/register/`, `/api/auth/login/`, `/api/auth/logout/`, `/api/auth/me/` | Genuine accounts, password verification and session cookies |
| Django `/api/auth/csrf/`, `/api/auth/profile/`, `/api/auth/password/forgot/`, `/api/auth/password/reset/` | CSRF bootstrap, owner profile updates and expiring password recovery |
| Django `/api/competitions/`, `/organizer/competitions/`, `/participant/...` | Reviewed competition submissions, public listings and private account activity |
| Django `/api/discovery/...` | Existing staff-protected discovery controls; suggestion permissions remain as implemented |
| Frontend `/api/auth` and every `/api/auth/...` route | HTTP 410; no login, tokens, reset action or account writes |
| Frontend `/api/competitions` and every `/api/competitions/...` route | HTTP 410; no demo submission or publication |
| Frontend `/api/health` | Read-only frontend health; does not authenticate or prove Django is available |
| Frontend `/api/job-fairs`, `/api/rankings` | Read-only responses marked `demo: true` |

The disabled namespaces also reject trailing-slash variants and other supported methods. They do not redirect password-bearing requests. An HTTP 410 means the old endpoint has been retired; use the real forms rather than changing the URL manually.

Signup logs the new user into a genuine Django session. Login verifies Django's stored password hash. The HTTP-only session cookie identifies the account on later requests. The frontend obtains a masked CSRF token and includes it on writes; permissions always use the backend session, never a workspace query parameter, browser localStorage, or a fabricated bearer token.

Job fairs, recruitment, job applications, results, rankings, sample admin tabs and support delivery remain previews. Real participant competitions, profiles, organizer submissions and Live Imports retain their existing backend behavior. Old JSON records remain on disk but are no longer read or modified by either frontend server.

## Local startup

From `E:\TalentSquare\3rd Nov`, use separate terminals:

```powershell
python -B server.py
python -B manage_local.py runserver 127.0.0.1:8001 --noreload
```

For the Node alternative, replace the first command with `node server.js` or `npm start`. Do not run both frontend servers on port 8000 together. Node must be installed or its executable must be addressed directly. The Phase 9 test-only portable executable, when retained, is `backend/.runtime/tools/node.exe`; it is not a global installation.

Open `http://127.0.0.1:8000` and use that hostname consistently. `localhost` also works if used for both frontend and backend. Existing database migrations are already applied; normal startup needs no reset, bootstrap or migration. No import worker is started by these commands. Run imports only when deliberately authorized.

Both frontend servers bind to `127.0.0.1`; `PORT` optionally changes their port, not their bind address. Browser code and Django development CORS currently expect port 8000. Other frontend ports are useful for HTTP tests, but require matching configuration to use real browser account workflows.

## Local file and request restrictions

Only the entry HTML and five explicit frontend JS/CSS assets can be downloaded. Known page routes, including sample event slugs, serve the entry HTML. Private backend paths, SQLite/WAL files, JSON account data, environment files, logs, outboxes, Python/Node source and documentation are not public assets. GET and HEAD have the same file boundary. Encoded traversal, backslashes, double encoding and malformed paths are rejected. Resolved asset paths must stay in the public root. Nonlocal Host headers are rejected.

Frontend APIs send no CORS allowance. Genuine Django credentialed CORS uses exact origins, and CSRF remains enabled. Read-only endpoints reject writes; other API paths return JSON errors. Frontend responses use no-store, nosniff, no-referrer and frame-denial headers. Python logs omit query strings; Node does not log request bodies. Private Django account/activity/organizer/discovery responses use no-store, including access-denied responses.

These restrictions do not replace operating-system permissions. Keep the repository, database, private backups and outbox readable only by trusted local users. Avoid writing credentials or reset tokens in logs. No background service or internet tunnel was installed.

## Production environment configuration

Keep development on HTTP. Set production values only in a separately prepared deployment environment; do not paste secrets into this repository or overwrite the current local secret. `config/deployment.py` validates the explicit production mode.

| Environment variable | Meaning |
| --- | --- |
| `DJANGO_ENV=production` | Explicit production opt-in; default is development |
| `DJANGO_DEBUG=0` | Required in production; production defaults to 0 |
| `DJANGO_SECRET_KEY` | Required strong private value, at least 50 characters; the development fallback is rejected |
| `DJANGO_ALLOWED_HOSTS` | Required comma-separated backend hostnames, without schemes, ports or `*` |
| `DJANGO_FRONTEND_ORIGIN` | Required exact HTTPS frontend origin; also used to construct recovery links |
| `DJANGO_CORS_ALLOWED_ORIGINS` | Exact comma-separated HTTPS origins; production defaults to frontend origin |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Exact HTTPS origins; defaults to CORS list |
| `DJANGO_SECURE_COOKIES=1` | Required in production; default there is 1; cookies remain HTTP-only and SameSite=Lax |
| `DJANGO_SSL_REDIRECT=1` | Required in production; production default is 1 |
| `DJANGO_HSTS_SECONDS` | Production default 3600; development default 0; use only after verifying HTTPS |
| `DJANGO_HSTS_INCLUDE_SUBDOMAINS`, `DJANGO_HSTS_PRELOAD` | Default 0; change only after domain-wide HTTPS and preload review |
| `DJANGO_TRUST_PROXY` | Default 0; set to 1 only behind a controlled proxy that strips untrusted forwarded headers and sets `X-Forwarded-Proto` itself |
| `DJANGO_EMAIL_MODE=smtp` | Required in production; development defaults to the private file outbox |
| `DJANGO_SMTP_HOST`, `DJANGO_SMTP_USERNAME`, `DJANGO_SMTP_PASSWORD` | Existing server-only SMTP settings; no real credentials were added |
| `DJANGO_SMTP_PORT`, `DJANGO_SMTP_TLS`, `DJANGO_SMTP_SSL` | Existing defaults 587, 1, 0; configure provider-appropriate encryption |
| `DJANGO_DEFAULT_FROM_EMAIL` | Verified sending identity for the deployment |
| `DJANGO_SQLITE_PATH` | Optional absolute private SQLite path; default remains `backend/db.sqlite3` |
| `DJANGO_CACHE_BACKEND`, `DJANGO_CACHE_LOCATION` | Optional shared cache for coordinated limits; location is required with a configured backend |

This backend configuration follows the [Django deployment checklist](https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/). Trusting forwarded HTTPS headers requires a correctly controlled proxy; see [Django's proxy-header guidance](https://docs.djangoproject.com/en/6.1/ref/settings/#secure-proxy-ssl-header). HSTS subdomains and preload are deliberately separate choices.

## Deployment work still required

- Use a production WSGI/ASGI server and a configured HTTPS reverse proxy. The bundled frontend servers and Django runserver are development tools, even after these restrictions.
- Browser API URLs still intentionally target the localhost Django service on port 8001 over HTTP. Before public deployment, provide reviewed frontend API-origin/build configuration and align HTTPS, CORS, CSRF and cookie-site behavior. Merely setting backend environment variables does not deploy a working public frontend.
- Replace floating external CDN script dependencies with a reviewed, pinned build and suitable CSP/SRI strategy. The current React/Babel/Tailwind/font setup remains unchanged to preserve the local UI.
- Existing login limits apply per IP/email pair; recovery limits apply by IP/email. The default local-memory cache is process-local. Add shared limits and gateway controls for signup, credential stuffing and multiworker operation. Do not trust arbitrary client-IP headers.
- Choose database capacity, access controls, backup retention, restoration procedures, monitoring and worker supervision. A multi-host database/caching deployment is not provided here.
- Verify SMTP delivery in the intended environment, upload request limits at the proxy, TLS termination and logging. Existing upload normalization rejects unsupported formats, large files and dangerous images, re-encodes supported images and preserves profile visibility checks.
- The lockfile records the verified existing Python packages; it is not a dependency vulnerability audit. No public-host penetration test or real SMTP delivery was performed.
- Review legal/privacy drafts, account deletion/retention policies, administrator access and abuse controls before launch. Facebook remains disabled/unconfigured where it was before.

## Security testing

The complete Django suite uses test databases. New frontend tests copy only the current server/assets into temporary filesystem fixtures, supply canary private files and run real Python and Node HTTP servers on random loopback ports. `NODE_BIN` can point to an existing executable. Missing Node is reported as skipped, not tested; it was available through the verified portable runtime during Phase 9 verification.

```powershell
python -B manage_local.py check
python -B manage_local.py makemigrations --check --dry-run
python -B manage_local.py test --noinput
python -B manage_local.py test accounts.test_frontend_security accounts.test_security_phase9 --noinput
```

Run these Chrome suites one at a time with ports 8000/8001 free. They start and stop their own services, use temporary databases/accounts and never run live imports:

```powershell
python -B backend/competitions/browser_phase8_regression.py
python -B backend/discovery/browser_phase7_regression.py
python -B backend/accounts/browser_phase9_regression.py --frontend python
python -B backend/accounts/browser_phase9_regression.py --frontend node
```

Do not substitute the older `live_profile_browser_regression.py` or `live_competition_browser_regression.py`: those target an active database. Use disposable suites for write testing.

`python -B manage_local.py check --deploy` intentionally flags the development outbox (`mail.E001`) and development security settings. Run it again against actual production environment values before deployment. Phase 9 also ran an isolated configuration-only simulation using temporary credentials and a disposable SQLite path; it did not send mail or deploy anything. A passing settings check does not establish production readiness.

Phase 9 evidence is private under `backend/.runtime/phase9/`. `verify_phase9_preservation.py` compares the current real database and JSON against this phase's original baseline; it is an audit helper, not a reusable expectation after future legitimate data changes. See [PHASE9_REPORT.md](PHASE9_REPORT.md) for results and manual checks.
