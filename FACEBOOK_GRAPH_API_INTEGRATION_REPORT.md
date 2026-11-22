# Facebook Graph API Integration Report

**Date:** 19 November 2026 (Asia/Dhaka)  
**Project:** `E:\Project\TalentSquare\3rd Nov`

## Result

The authorized Page Graph API connector is now constrained to a server-configured allowlist, checks Page identity before retrieval, classifies token/permission/rate-limit failures, and passes eligible post candidates into the existing leased discovery worker and staff review queue. Facebook remains review-first; its source is currently disabled. The verified fictional post is explicitly excluded by its exact Graph post ID and by test/demo/fictional announcement markers, both during API retrieval and organizer link submission.

**Automatic collection is not complete or live in this workspace.** The owner reports a successful real API retrieval for the Talent Square Page, but this local environment has no Meta app credentials, encryption key, Page token, allowlist, or connected encrypted Page row. Consequently, no real API request or worker import was performed here. The live integration test is opt-in and skipped unless the owner securely configures the local authorized Page token.

## Implemented

- Official Graph API v27.0 remains environment-configured; no version or credentials are hardcoded. Requests use HTTPS, bearer authorization, app-secret proof, fixed endpoint patterns, redirects disabled, 20-second timeout, 2 MiB response limit, and no response-provided paging URLs.
- `FACEBOOK_ALLOWED_PAGE_IDS` is a server-only comma-separated Page ID allowlist. OAuth saves only an allowlisted Page returned from `me/accounts`, with its Page token and `MODERATE` task. Collection filters to this allowlist and pauses any previously enabled database Page removed from it.
- OAuth checks the granted `pages_show_list` and `pages_read_engagement` permissions used in the owner-reported successful Page-post retrieval. The local token remains Fernet-encrypted. User and Page tokens are never returned by the API or deliberately logged.
- Collection validates each encrypted Page token against `GET /{page-id}?fields=id,name` and requires the response ID to equal the configured Page ID before calling `/{page-id}/posts`.
- Pagination is limited to two batches of at most 50 posts per allowlisted enabled Page per run, at most ten Pages per run, and at most 300 candidate payloads returned. The cursor is bounded and used only as a query parameter; arbitrary URLs are never followed.
- Meta error code 190 produces a clear expired/invalid-token status; permission codes 10/200/299 are reported without exposing Meta response text; rate-limit codes (including Page-specific code 80001) receive a 15-minute retry time. HTTP 429/503 `Retry-After` and existing exponential source backoff are retained. Page errors and source `ImportRun` history feed existing Live Imports health reporting.
- Post permalink hash is the stable external identifier. Same-page duplicate URLs are collapsed during pagination; existing importer idempotency and duplicate warnings cover repeats and cross-source URLs. Facebook sources require staff review regardless of a source auto-publish flag, and no event date is inferred from `created_time`.
- Test/demo/fictional marker checks run before classification. Exact excluded post: `1450027621530622_122097102111558247`. The post is rejected by both API collection and manual link submission. Its text must never become a candidate or public competition.
- A conditional live test calls `run_source` for only the Talent Square allowlisted Page, stores the environment token only encrypted in the disposable test database, captures returned post IDs without retaining token data, asserts the known test post was actually returned by Meta and is absent from candidate imports, and confirms any other candidates remain pending with no publication. It skips unless a local token, app credentials, Fernet key, v27.0 setting, and the one Page ID allowlist are present.

## Live verification evidence

The project owner reports that Meta Graph API v27.0 returned one actual post from Page **Talent Square**, Page ID **1450027621530622**, through `GET /1450027621530622/posts?fields=id,message,created_time,permalink_url`, using `pages_show_list`, `pages_read_engagement`, and an authorized Page access token. That returned post was `1450027621530622_122097102111558247`, explicitly marked **TEST ANNOUNCEMENT — NOT A REAL EVENT**.

This is owner-provided successful API evidence, not an independently reproduced test in the Django worker. Local inspection found no Facebook credentials/token-related environment values configured, no connected Page row, and no allowlist. Thus this run has **0 worker-confirmed live Page fetches, 0 live Facebook candidates, and 0 Facebook publications**. No secret value was read into output or placed in a file.

## Fixture and project checks

- `python -B manage_local.py test discovery.test_facebook --noinput --verbosity 1`: **28 tests passed, 1 conditional live test skipped**.
- `python -B manage_local.py check`: passed.
- `python -B manage_local.py makemigrations --check --dry-run`: no changes detected.
- `python -B manage_local.py test --noinput`: **370 tests passed, 1 skipped**.
- Application SQLite `PRAGMA integrity_check`: **ok**; `PRAGMA foreign_key_check`: **0 violations**.
- Existing database after verification: **14 competitions**, **94 discovery candidates**, **0 connected Facebook Page rows**. Facebook source settings remain `enabled=0`, `auto_publish=0`.
- No migration or application-database write was made by these checks. Django tests used their isolated test database; integrity checks used SQLite read-only mode.

Fixture tests include successful Page identity and posts retrieval, two-page cursor pagination, same-post duplicate suppression and repeated-run idempotency, missing event-date preservation, expired-token messaging, permission failures, rate-limit retry timestamps, fixed Page ID validation, unauthorized Page exclusion, fictional post hard exclusion, and review-first safety even if a source auto-publish flag is forced true.

## Secure local setup

Set these as server process environment variables or in the deployment secrets manager, never in JavaScript, committed files, logs, chat, or command-line arguments:

- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_GRAPH_VERSION=v27.0` (only if enabled for this app)
- `FACEBOOK_TOKEN_KEY` (private Fernet key)
- `FACEBOOK_ALLOWED_PAGE_IDS=1450027621530622` (only after Page owner authorization)
- `FACEBOOK_REDIRECT_URI` (exact callback registered in Meta)

For this Windows development machine, use the added `setup_facebook_live_test.ps1` instead of writing secrets into an `.env` file. It prompts for the app secret and Page token with hidden `SecureString` input, generates the Fernet key without displaying it, and stores those secure values in `backend/.runtime/facebook-live-test/credentials.clixml`, encrypted by Windows DPAPI for the current Windows account. `.runtime` is Git-ignored. Run `run_facebook_live_test.ps1` to inject the values into the test process and execute only the one-Page integration test; it clears the process environment afterward. `run_facebook_local_django.ps1` loads the same app credentials and stable key for the local Django OAuth flow, injects only the fixed Talent Square Page allowlist, and does not put the temporary test Page token into the web process. All three scripts are scoped to Page ID `1450027621530622` and Graph API v27.0.

The setup script itself performs no database writes. The live integration test makes network GETs only to the allowlisted Page identity and posts endpoints. Django's test runner creates a temporary migrated test database; the test writes a single Talent Square Page row with an encrypted token, one Facebook source row, its ImportRun, and any eligible pending candidates, asserts no publication and no test-post candidate, then destroys that test database. The project's `backend/db.sqlite3` is not opened for the integration-test writes.

The later OAuth connection through Django is a separate real-database action. Its callback creates/updates one `FacebookPage` row containing the Page ID, display name, Fernet-encrypted Page token, authorizing staff user, and connection timestamp; it does **not** enable that Page or the source. The Facebook `ImportSource` is already present and disabled in this database, so OAuth leaves its `enabled=0` and `auto_publish=0` settings unchanged. If a future callback needs to create the source, its defaults are disabled/review-first. Only after you explicitly enable the Page and Facebook source will a worker run write run-history rows and eligible `pending` candidates; the review-required policy prevents automatic publication.

Then staff can use the existing Facebook Pages Connect flow. After consent, explicitly enable the participating Page and Facebook source in Live Imports; run one controlled collection and confirm its `ImportRun`, page health, and review candidate before relying on scheduled runs. Remove any temporary `FACEBOOK_PAGE_ACCESS_TOKEN` after running the opt-in integration test. Do not paste the token into chat or source code.

For each future university club, obtain the club's agreement; have a Page manager with `MODERATE` access authorize the app; obtain that Page's numeric ID and add only that ID to the server allowlist; complete the relevant Meta app review/advanced access and business verification required for users outside app roles; then have the Page manager grant `pages_show_list` and `pages_read_engagement` in the Connect flow. A Talent Square Page token grants no access to another university's Page.

Access to Pages the app does not manage may require Meta Page Public Content Access (PPCA) or another approved feature. The integration does not request or claim PPCA. A Page ID allowlist is an operator boundary, not Meta authorization. Do not collect a non-managed Page unless Meta has granted the exact required access and the connector is deliberately reviewed for that use.

## Remaining blockers

1. Configure the real Meta app credentials, encryption key, and allowlist locally or in the deployment secret manager.
2. Connect Page ID `1450027621530622` through the Django OAuth flow, or securely provide the authorized test token only through the documented local environment variable for the one-page integration test.
3. Run the conditional integration test / worker collection and inspect the resulting success history and review queue. The exact fictional test post must remain absent.
4. Have each future university Page separately authorize access and confirm Meta approval/permissions; no cross-Page authorization is inferred.
5. Keep the Facebook source disabled until the first worker-mediated authorized retrieval completes successfully. Continue to require staff approval before publication.

No unrelated Codeforces, AtCoder, MLH, or university source setting was changed. No database migration was added.

## Official Meta references

- The current [Graph API versioning guide](https://developers.facebook.com/docs/graph-api/guides/versioning/) identifies **v27.0** as the latest Graph API version as of this report date.
- The [Page Feed endpoint reference](https://developers.facebook.com/docs/graph-api/reference/page/feed/) documents Page feed access and its post count limits. This connector uses the Page `/posts` edge verified by the owner, not an unrestricted Page search.
- The [Page Feed reference](https://developers.facebook.com/docs/graph-api/reference/page/feed/) lists `pages_read_engagement` and `pages_read_user_content` for its `/feed` edge. The [Page reference](https://developers.facebook.com/docs/graph-api/reference/page/) documents the `MODERATE` task requirement for permission-based Page access and permissions/features applicable to Page-owned versus public data. The owner-provided `/posts` example succeeded with `pages_show_list` and `pages_read_engagement`; endpoint/app requirements can vary. If Meta requires additional permission or feature approval, collection stops and reports that denial rather than widening access silently.
