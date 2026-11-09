# Facebook Page connection setup

The importer is implemented but no real Page is connected by installing this update. Manual link suggestions work without Meta credentials. Automatic collection uses the official Pages API and only Pages returned by the signed-in Page manager's authorization. It does not search all Facebook, scrape public pages, access groups or personal profiles, or read images/PDFs.

## Install the optional encryption dependency

Install backend/requirements-facebook.txt into the same Python environment used by Django. Existing local bundled environments need the dependency in backend/.venv/Lib/site-packages. New deployments should install the project's Django dependencies and this file normally with pip. Page tokens are Fernet-encrypted before being saved; API responses never include tokens. Back up the encryption key separately from the database. Losing it requires reconnecting Pages.

## Server environment

Set these in the server's secret/environment settings, never frontend files or Git:

- FACEBOOK_APP_ID: the app ID from your own Meta developer app.
- FACEBOOK_APP_SECRET: its secret.
- FACEBOOK_GRAPH_VERSION: a supported version enabled for that app, for example v26.0 if supported in your Meta dashboard. No version is silently assumed.
- FACEBOOK_TOKEN_KEY: a Fernet key generated with `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`. Keep the result private.
- FACEBOOK_REDIRECT_URI: register this exact OAuth callback in Meta. Local default: http://127.0.0.1:8001/api/discovery/facebook/callback/
- FACEBOOK_FRONTEND_RETURN_URL: local default http://127.0.0.1:8000/admin?tab=live-imports

For localhost usage use the same hostname consistently for browser login and the callback; localhost and 127.0.0.1 have different sessions. Public deployment requires HTTPS callback/frontend URLs, proper allowed hosts/CORS, secure cookies and production settings. Do not expose the current development server directly.

## Connect participating Pages

1. Configure Facebook Login and Pages API access for your app in Meta's dashboard. This implementation requests pages_show_list and pages_read_engagement. Confirm current requirements and approved use cases in the dashboard. App review/advanced access or business verification may be required for users beyond app roles. Approval is not guaranteed.
2. Start Django and sign in as existing staff with discovery.manage_discovery.
3. Open Admin -> Live imports -> Sources -> Facebook Pages -> Connect Facebook Pages.
4. Authorize using an account with sufficient access to the participating Pages.
5. Returned Page tokens are encrypted on the server. New Pages are paused. Select Enable Page for the ones to collect (maximum ten enabled), then enable the Facebook source and choose its interval.
6. Run now to test, then keep the existing run_import_worker process running for scheduled checks.

The flow exchanges the authorization code, extends the user authorization, and requests Page tokens via me/accounts. User tokens are not persisted. OAuth state expires after ten minutes and is single-use. Reconnect when permission is revoked or credentials expire; disconnect deletes the local encrypted Page token. To revoke the app's access at Meta, also remove it through the account's Meta settings.

Collection reads at most two batches of fifty posts per enabled Page per run and retains up to 300 matching announcements. It uses bounded fixed Graph endpoints, stops redirects, applies timeouts and never follows arbitrary paging URLs. Existing text matching covers programming contests, ICPC, hackathons, datathons, CTFs and CSE festivals. Missing or image-only details stay unknown. Recent post coverage does not guarantee discovery of every competition. Publication timestamps are never event dates.

## Manual post links

Signed-in organizers can open Submit Competition and use Found a competition on Facebook. Provide a full post permalink and a title; notes are optional. These suggestions are stored privately, not fetched from Facebook. Tracking parameters and mobile hosts are normalized; repeated equivalent links reuse the same candidate. Maximum ten new suggestions per organizer in a rolling 24 hours. Short share links must be replaced with a full post permalink.

Both imported posts and manual suggestions appear in the existing Live imports review queue under Facebook. Staff must save confirmed competition details, add evidence in a review note, and explicitly approve before publication. Manual suggestions can be approved even while automatic Page collection is disconnected. Automatic publication is disabled for Facebook.

## Validation and limits

Offline tests cover OAuth state/replay, permissions, CSRF/CORS, encrypted storage, secret-free responses and errors, authorized Page-only collection, duplicate handling and manual suggestion approval. A real Meta app/authorized Page is required for end-to-end API verification. No real credentials were supplied during implementation, so live Meta permission approval and successful collection are not claimed.

Reference: https://developers.facebook.com/docs/pages-api/ and https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/ . If access to documentation is rate-limited, verify the exact current settings in your Meta dashboard before enabling the integration.
