# Facebook Live Token Verification

**Status: awaiting local token replacement.** The fresh Page token is not available to this process, so no live validation or Django live test has been run in this continuation.

## Prior diagnosis

Meta rejected the previously stored Page token with OAuthException code `190` and no subcode. Meta documents that this means the token or login is expired, revoked, or otherwise invalid; the response did not identify which. The prior `/debug_token` request also returned code `190`, so the configured App ID/App Secret pair and the token's app association were not verified.

## Prepared changes

- Added `update_facebook_page_token.ps1`. It prompts for the replacement token with hidden input, validates the configured app and token against Meta before writing, preserves the App ID, App Secret, and Fernet key, and only then atomically replaces the DPAPI file while retaining an encrypted rollback copy.
- Added `backend/discovery/facebook_token_validation.py`. It checks app identity, token type/validity/expiry, read scopes, Page identity, and the known fictional post. Output is restricted to safe metadata and sanitized error fields.
- Existing Graph error reporting records status, endpoint, type, numeric code/subcode, category, and safe trace ID. It does not emit response bodies or token-bearing URLs.

## Offline verification

- `update_facebook_page_token.ps1 -SelfTest`: passed DPAPI fixture round-trip, field preservation, atomic replacement, rollback backup, and safe-diagnostic fixtures.
- Facebook Django suite: 28 passed, 1 credential-gated live test skipped.
- Django system check: passed with no issues.
- The offline fixture did not alter the existing encrypted credential file. Live database preservation and post exclusion remain to be reconfirmed during the live run.

## Live results still pending

App identity, replacement token acceptance, PAGE type, validity/expiry, scopes, Page identity/tasks, post retrieval, fictional-post exclusion, Django live-test results, and real database hash comparison are all pending. No additional Page was connected and no worker was started.

## Follow-up: app credential failure isolated

The reported `/1180640231308611` endpoint is the configured App ID used as a Graph API Application node (`GET /{app_id}?fields=id,name`). It is the correct resource for validating the app identity. The local DPAPI record's App ID matches that endpoint, but Meta has not confirmed that it is the intended `Talent Square` app.

The request fails in **app credential validation**, before token debugging or either Page request. I separately retried the app check using Meta's `access_token` query transport; it also returned `HTTP 400`, `OAuthException`, code `190`, no subcode (trace ID `AWku_N5vzV5Ys9wRRFWBiOY`). The earlier Bearer-form app check returned HTTP 401/code 190. The result is that the configured App ID/App Secret pair is not accepted. This does not establish whether the App ID points to the wrong app or the App Secret is stale/incorrect, and it does not establish that the new Page token is invalid. Token debugging, Page identity, and post retrieval were not attempted.

The Page-token `appsecret_proof` implementation uses HMAC-SHA256 with the App Secret as key and the Page token as message, as Meta documents. Page-token requests use the connector's Bearer-header transport. The only transport adjustment was to pass the app access token using the Graph API `access_token` parameter for app identity and `/debug_token` checks; no Page-token auth behavior was changed.

## Latest offline checks

- Five isolated validator tests passed: rejected App Secret, expired token, wrong Page ID, sanitized HTTP authentication failure, and app-token query transport.
- Updater fixture self-test passed. The existing DPAPI credential file hash was unchanged, and no SQLite test database was created by these checks.
- Django system check passed.

If the app credential pair needs correction, run the updater with `-UpdateAppCredentials`. It prompts for the App ID and requests the App Secret with hidden input, verifies that Meta identifies the app as `Talent Square`, and only then atomically updates those two values while retaining the Page token and Fernet key. After that succeeds, run the updater normally to validate and store the fresh Page token. Live Django verification must wait until both steps pass.

## Follow-up: token type validation

The prior updater reached `token_is_not_page_access_token`, which means the app ID and application-name checks passed before the type check. This confirms that the token-debug response associated the submitted token with the configured Talent Square app. The validator failed before checking `profile_id` or making the Page identity request. The owner reports that Meta's Access Token Debugger showed type PAGE and the expected Page ID; those values were not present in the sanitized output from the failed updater, so the API response's exact `type` representation is not independently confirmed here.

The validator now normalizes the debug `type` by trimming whitespace and comparing case-insensitively, while continuing to require the exact PAGE enum. It reports only an allowlisted token type, validity, app identity match booleans, whether `profile_id` matches the approved Page, whether `user_id` exists (never its value), and safe scope names. It does not treat `user_id` as a Page ID. Meta documents `profile_id` as a Page ID for impersonated tokens and `user_id` separately as the token's user identity. The validator retains the independent Page identity request as a required check.

Ten isolated token-validation tests passed, covering PAGE normalization, USER rejection, invalid responses, expiration, wrong Page IDs, app mismatch, app-secret rejection, and authentication diagnostics. Combined Facebook Django tests passed: 38 passed, 1 credential-gated live test skipped. The updater offline fixture self-test and Django system check also passed. The replacement token remains unsaved; the live Page identity and post checks remain pending.

## Safe update and next steps

Run the updater locally under the same Windows account that created the DPAPI file:

```powershell
Set-Location -LiteralPath 'E:\Project\TalentSquare\3rd Nov'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\update_facebook_page_token.ps1
```

Enter the Page token only at its hidden terminal prompt. The updater leaves the existing encrypted credential unchanged if Meta validation fails. On success, it prints the rollback backup path and asks you to run `run_facebook_live_test.ps1`; after you confirm the updater succeeded, the live Django verification can proceed.

For token expiry, obtain a fresh Page token in the approved `Talent Square` app, verify it in Meta's debugger, and use the updater again; do not rotate the Fernet key. For university Page collection, first obtain explicit Page authorization and validate each Page individually before allowlisting or enabling collection. Keep collection review-first and do not start a worker until that approval and verification are complete.

References: [Meta token debugging](https://developers.facebook.com/docs/graph-api/reference/debug_token/), [Meta Graph API errors](https://developers.facebook.com/docs/graph-api/guides/error-handling), [Page read requirements](https://developers.facebook.com/docs/graph-api/reference/page/).

## Final live verification (2026-11-21)

This section supersedes earlier pending/live-status statements above. The owner successfully updated the Page token through the secure updater. Under the same Windows account, the protected credential file was present and the configured Page ID matched `1450027621530622`; no credential contents were displayed.

- Fixed the live-test defect: SQLite does not support the JSON `contains` lookup used by the fictional-post assertion. The test now reads candidate JSON payloads and compares the exact canonical post permalink in Python. Added regression coverage proving the helper rejects the known fictional post when it appears in a candidate payload. Searched related test code; the other JSON `startswith` lookup was also replaced with a SQLite-compatible Python check.
- Focused Facebook suite: **28 passed, 1 skipped** (29 tests total; the isolated live case is gated in this suite).
- Full Django suite: **380 passed, 1 skipped, 0 failed** (381 tests total).
- Django system check: passed, no issues.
- Live harness: **passed** (1 isolated live test, 0 failures). Safe Meta debug metadata confirmed app `Talent Square`, app ID `1180640231308611`, valid token, type `PAGE`, matching profile/Page ID `1450027621530622`, and scopes `pages_show_list`, `pages_read_engagement`, and `public_profile`. The test retrieved the expected fictional Graph post and passed the assertions that it creates no `ImportCandidate` and no competition publication; candidate records remain review-first with auto-publication disabled.
- The real SQLite database SHA-256 was unchanged across both the explicit system check and live harness. Django destroyed its temporary test database after the live test. The temporary test DB is absent. No worker was started and no publication settings, source settings, encryption key, or additional Page connections were changed.

The connector behavior did not need modification. The confirmed failure was a test-only SQLite JSON lookup incompatibility; replacing it with exact Python-side payload inspection preserved the exclusion assertion. The live Django integration is now verified for this authorized Page and the known fictional test post. This does not authorize collection from other Pages or change the review-first publication policy.
