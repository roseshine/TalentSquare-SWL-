# Facebook Page Access Inventory — Phase 13A

## Application state

The project owner reports one real authorized retrieval for Talent Square Page ID `1450027621530622` on Graph API v27.0. This workspace's SQLite DB still contains 0 connected encrypted Page records; Meta credentials and an allowlist are not configured here, and the Facebook source is disabled. The reported one-post retrieval was successful at Meta, but has not been independently rerun through the Django worker pipeline in this workspace.

## Known public Page leads (not authorization)

| Lead | Public URL | Evidence status |
|---|---|---|
| Talent Square | Page ID `1450027621530622` (Page profile URL not separately verified) | Owner reports successful authorized v27.0 retrieval; Page OAuth token is not configured in this workspace; test-only post is excluded |
| NSU ACM Student Chapter | https://www.facebook.com/nsuacmc | Previously identified lead; Page ownership and current API availability not verified |
| Daffodil CSE | https://www.facebook.com/cse.daffodilvarsity.edu.bd/ | University-hosted reference previously identified; current Page and API availability not verified |
| DUET Computer Science and Engineering | https://www.facebook.com/duetcs | Official DUET listing previously identified; Page/API availability not verified |

No access token is present in the workspace. The Talent Square Page ID is provided by the owner as a successful test integration; the other links are leads for human review only. The integration does not search Facebook, access groups or profiles, or scrape pages.

## Permission-ready authorization gate

The OAuth callback requires the two permissions used in the owner's successful `/posts` retrieval: `pages_show_list` and `pages_read_engagement`. It requests Page `tasks` and saves a Page only if its numeric ID is explicitly allowlisted, a Page token is returned, and the authorizing account has `MODERATE`. Saved Pages start disabled; the source itself starts disabled. Tokens are Fernet-encrypted and never returned by the API. Meta's current [Page Feed reference](https://developers.facebook.com/docs/graph-api/reference/page/feed/) separately lists `pages_read_user_content` for `/feed`; app/endpoint-specific access errors must be checked against the current dashboard and Meta review requirements.

The connector is intended for Pages the authorizing account manages. Public content access for Pages the app does not manage can require PPCA or another applicable Meta feature approval. That access is not requested or claimed here. To connect a lead, a Page manager must authorize the app after the app has the necessary review/advanced access; then staff can enable that Page and the source deliberately.

## Meta setup required from the app owner

1. Create/configure the Meta developer app and Facebook Login callback. Register the exact server callback URL from `FACEBOOK_REDIRECT_URI`.
2. Configure `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_GRAPH_VERSION` (supported and enabled in the app dashboard), HTTPS callback/front-end URLs in production, and a private Fernet `FACEBOOK_TOKEN_KEY`.
3. Request `pages_show_list` and `pages_read_engagement`; complete the use-case configuration, business verification, and Meta app review/advanced access Meta requires for the intended users. Other endpoints or content types may require additional Meta permissions.
4. Have an administrator/page manager with the Page `MODERATE` task sign in and grant those permissions. The callback rejects incomplete grants and Pages without that task.
5. After authorization, staff explicitly enable only the participating Page(s), enable the Facebook source, and run a bounded collection. Verify real API response and review queue before considering live retrieval operational.

Current references: [Graph API versioning](https://developers.facebook.com/docs/graph-api/guides/versioning), [Page reference](https://developers.facebook.com/docs/graph-api/reference/page/), [Page Feed endpoint](https://developers.facebook.com/docs/graph-api/reference/page/feed/), and [Pages API](https://developers.facebook.com/docs/pages-api/). The current documented Graph API version is v27.0; check app dashboard availability before configuration.
