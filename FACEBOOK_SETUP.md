# Facebook Page connection setup

The importer uses the official Pages API and only Page IDs explicitly allowlisted by the server and returned through the signed-in Page manager's authorization. Manual link suggestions work without Meta credentials. It does not search all Facebook, scrape public pages, access groups or personal profiles, or read images/PDFs.

## Install the optional encryption dependency

Install backend/requirements-facebook.txt into the same Python environment used by Django. Existing local bundled environments need the dependency in backend/.venv/Lib/site-packages. New deployments should install the project's Django dependencies and this file normally with pip. Page tokens are Fernet-encrypted before being saved; API responses never include tokens. Back up the encryption key separately from the database. Losing it requires reconnecting Pages.

## Server environment

Set these in the server's secret/environment settings, never frontend files or Git:

- FACEBOOK_APP_ID: the app ID from your own Meta developer app.
- FACEBOOK_APP_SECRET: its secret.
- FACEBOOK_GRAPH_VERSION: a supported version enabled for that app. Meta's current Graph API version is v27.0; confirm that the version is enabled for your app before setting it. No version is silently assumed.
- FACEBOOK_TOKEN_KEY: a Fernet key generated with `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`. Keep the result private.
- FACEBOOK_ALLOWED_PAGE_IDS: comma-separated numeric Page IDs that the server is explicitly allowed to connect and collect, such as the cooperating Page's ID. Add an ID only after that Page's manager has agreed to authorize it. A Page token for one ID never authorizes other Pages.
- FACEBOOK_REDIRECT_URI: register this exact OAuth callback in Meta. Local default: http://127.0.0.1:8001/api/discovery/facebook/callback/
- FACEBOOK_FRONTEND_RETURN_URL: local default http://127.0.0.1:8000/admin?tab=live-imports

For localhost usage use the same hostname consistently for browser login and the callback; localhost and 127.0.0.1 have different sessions. Public deployment requires HTTPS callback/frontend URLs, proper allowed hosts/CORS, secure cookies and production settings. Do not expose the current development server directly.

## Connect participating Pages

1. Configure Facebook Login and Pages API access for your app in Meta's dashboard. The OAuth request asks for `pages_show_list` and `pages_read_engagement`, the two permissions used in the supplied successful v27.0 `/posts` verification. The callback checks that both are granted, requests each Page's `tasks`, and stores an ID only when it is explicitly allowlisted, has a Page token, and the authorizing account has the `MODERATE` task. Pages outside the allowlist or without that task are not connected. Meta's current [Page Feed reference](https://developers.facebook.com/docs/graph-api/reference/page/feed/) lists `pages_read_user_content` alongside `pages_read_engagement` for `/feed`; endpoint, app, or content-specific requirements can differ. If Meta requires more access for this app/Page, errors are surfaced for dashboard review and collection stops; permissions are never silently widened.
2. Start Django and sign in as existing staff with discovery.manage_discovery.
3. Open Admin -> Live imports -> Sources -> Facebook Pages -> Connect Facebook Pages.
4. Authorize using an account with sufficient access to the participating Pages.
5. Returned Page tokens are encrypted on the server. New Pages are paused. Select Enable Page for the ones to collect (maximum ten enabled), then enable the Facebook source and choose its interval.
6. Run now to test, then keep the existing run_import_worker process running for scheduled checks.

The flow exchanges the authorization code, extends the user authorization, verifies the granted permissions through `me/permissions`, and requests Page tokens and tasks via `me/accounts`. User tokens are not persisted. Before reading posts, collection validates the Page token against the fixed Page identity endpoint and requires the returned ID to match the allowlisted ID. OAuth state expires after ten minutes and is single-use. Reconnect when permission is revoked or credentials expire; disconnect deletes the local encrypted Page token. To revoke the app's access at Meta, also remove it through the account's Meta settings.

For a future university club: (a) obtain the club's agreement and have a Page manager with `MODERATE` task access; (b) add that exact numeric Page ID to `FACEBOOK_ALLOWED_PAGE_IDS` on the server; (c) ensure the Meta app has the required standard/advanced access and review approval for the intended users and use case; (d) have the manager sign in through the staff Connect flow and grant `pages_show_list` and `pages_read_engagement`; (e) verify the connected Page and enable it explicitly. Each club Page must authorize individually; Talent Square's test Page token does not confer access to it.

For Pages the app does not manage, do not connect or collect unless Meta has approved the applicable Page Public Content Access (PPCA) feature or other required feature access. This integration currently does not request or claim PPCA, and allowlisting an ID alone is not authorization.

Collection reads at most two batches of fifty posts per enabled Page per run and retains up to 300 matching announcements. It uses bounded fixed Graph endpoints, stops redirects, applies timeouts and never follows arbitrary paging URLs. Existing text matching covers programming contests, ICPC, hackathons, datathons, CTFs and CSE festivals. Missing or image-only details stay unknown. Recent post coverage does not guarantee discovery of every competition. Publication timestamps are never event dates.

## Manual post links

Signed-in organizers can open Submit Competition and use Found a competition on Facebook. Provide a full post permalink and a title; notes are optional. These suggestions are stored privately, not fetched from Facebook. Tracking parameters and mobile hosts are normalized; repeated equivalent links reuse the same candidate. Maximum ten new suggestions per organizer in a rolling 24 hours. Short share links must be replaced with a full post permalink.

Both imported posts and manual suggestions appear in the existing Live imports review queue under Facebook. Staff must save confirmed competition details, add evidence in a review note, and explicitly approve before publication. Manual suggestions can be approved even while automatic Page collection is disconnected. Automatic publication is disabled for Facebook.

## Validation and limits

Offline tests cover OAuth state/replay, permissions, CSRF/CORS, encrypted storage, secret-free responses and errors, allowlisted Page-only collection, pagination, idempotency, token/permission failures, rate limits, test-post exclusion and manual suggestion approval. The project owner reports a successful real v27.0 retrieval for the Talent Square Page (ID `1450027621530622`) using `pages_show_list` and `pages_read_engagement`; this workspace currently has no configured Meta credentials/token, authorized Page row, or allowlist, so this implementation's live retrieval pipeline has not yet been independently run against that token. The exact known post `1450027621530622_122097102111558247` and posts explicitly marked test/demo/fictional are excluded from API collection and manual suggestions.

For a controlled local integration test, configure the authorized Page token as the server-only `FACEBOOK_PAGE_ACCESS_TOKEN` environment variable, set the app credentials, encryption key, Graph version `v27.0`, and allowlist containing only `1450027621530622`, then run `python -B manage_local.py test discovery.test_facebook.FacebookFlowTests.test_controlled_live_talent_square_page_integration --noinput`. The test encrypts the token only in the disposable test DB, calls only that Page's identity and `/posts` endpoints, checks returned links stay on that Page, and asserts the supplied fictional post is absent. Never add the token to chat, source files, shell history, or logs. Remove the environment variable after the test. This test is skipped automatically when a required local value is absent.

References: https://developers.facebook.com/docs/pages-api/ ; https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/ ; https://developers.facebook.com/docs/graph-api/reference/page/ ; https://developers.facebook.com/docs/graph-api/reference/page/feed/ ; https://developers.facebook.com/docs/graph-api/guides/versioning . Verify exact current requirements in your Meta dashboard before enabling the integration.
