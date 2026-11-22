# Facebook Competition Discovery Report

**Reviewed:** 15 November 2026 (Asia/Dhaka)  
**Project:** `E:\Project\TalentSquare\3rd Nov`

## Outcome

**Update — 19 November 2026:** The project owner reports a successful live v27.0 Page-post retrieval for the Talent Square Page (ID `1450027621530622`), returning the one known post `1450027621530622_122097102111558247` with `pages_show_list` and `pages_read_engagement`. The post is explicitly a fictional test announcement and is now hard-excluded from automatic imports and manual link submissions. This workspace has no local Meta credentials, allowlist or connected encrypted Page record, so the report below reflects the 15 November pre-verification audit; the Django pipeline has not independently repeated the API request or processed a live API response here.

The **15 November database snapshot** had Facebook collection disabled, 0 connected Pages and no local Meta credentials. Subsequent owner-provided evidence (19 November) reports a successful live v27.0 Page-post retrieval as detailed above. The local database remains unconnected and no live post has been independently processed through the Django worker in this workspace.

## Permission and API review

Meta's published automated-collection guidance says automated access requires prior permission; public visibility alone is not permission. See [Meta: How We Combat Scraping](https://about.fb.com/news/2021/04/how-we-combat-scraping/) and the [Automated Data Collection Terms](https://www.facebook.com/legal/automated_data_collection_terms). Do not use browser automation, cookies, login workarounds, or rate-limit bypasses.

The supported Pages Graph API is permission-scoped. The current [Page reference](https://developers.facebook.com/docs/graph-api/reference/page/) describes Page-owned data access with Page permissions and identifies Page Public Content/Metadata Access features for public data. The [Page Post reference](https://developers.facebook.com/docs/graph-api/reference/page-post/) documents additional endpoint and feature limitations. The application requests `pages_show_list` and `pages_read_engagement`, uses a Page-manager OAuth flow, and accepts only Page IDs returned for that authorization. Exact permissions and app review/feature approval must be confirmed in the app's Meta dashboard. These scopes do **not** grant general discovery or arbitrary access to unrelated Pages. Meta's [Graph API version documentation](https://developers.facebook.com/docs/graph-api/changelog/versions/) is versioned; configure a currently supported version explicitly instead of assuming one in code.

The separate [Meta Content Library](https://developers.facebook.com/docs/content-library-and-api/content-library-api/overview) serves approved research use in its controlled research environment, and its documentation prohibits downloading data. It is not a permissible feed for this production competition importer.

## Facebook Page leads reviewed

Page URLs below were checked as identity leads, not treated as accessible feeds. Search/official-site evidence can establish a likely Page name or club identity; it cannot establish API permission or prove the Page's current announcement contents.

| Organization (existing 15-source inventory unless marked) | Page name / URL | Category; official identity evidence | Competition-announcement history | Access method; permission required/status | Last success / last failure | Automation eligibility; confidence |
|---|---|---|---|---|---|---|
| North South University | NSU ACM Student Chapter — [facebook.com/nsuacmc](https://www.facebook.com/nsuacmc) | Computing student chapter; organization listing links Page, chapter site confirms identity. | Chapter competition activity is evidenced; not confirmed on this Page. | Search metadata and direct web-reader attempt; Graph needs Page-manager authorization and approved `pages_show_list` / `pages_read_engagement` use. No authorization. | Success: none. Failure: web reader throttled. | No; medium identity confidence, no Page permission. |
| Daffodil International University (DIU) | CSE — [facebook.com/cse.daffodilvarsity.edu.bd](https://www.facebook.com/cse.daffodilvarsity.edu.bd/) | Department Page lead in a DIU-hosted document; exact current Page identity needs reconfirmation. | Not established for this Page. | University document and direct web-reader attempt; Graph requires cooperating authorization and approved permissions. None. | Success: none. Failure: web reader denied by robots policy. | No; medium lead confidence, no Page permission. |
| United International University (UIU) | Page name/URL not verified | Category and official status unknown. | Unknown. | No Page URL or Graph permission. | Success: none. Failure: no Page fetch attempted; identity lead not confirmed. | No; low confidence. |
| Bangladesh University of Engineering and Technology (BUET) | Page name/URL not verified | Category and official status unknown. | Unknown. | No Page URL or Graph permission. | Success: none. Failure: no Page fetch attempted; identity lead not confirmed. | No; low confidence. |
| Rajshahi University of Engineering & Technology (RUET) | Page name/URL not verified | Category and official status unknown. | Unknown. | No Page URL or Graph permission. | Success: none. Failure: no Page fetch attempted; identity lead not confirmed. | No; low confidence. |
| Khulna University | Page name/URL not verified | Category and official status unknown. | Unknown. | No Page URL or Graph permission. | Success: none. Failure: no Page fetch attempted; identity lead not confirmed. | No; low confidence. |
| Gopalganj Science and Technology University (GSTU) | Page name/URL not verified | Category and official status unknown. | Unknown. | No Page URL or Graph permission. | Success: none. Failure: no Page fetch attempted; identity lead not confirmed. | No; low confidence. |
| University of Dhaka | Page name/URL not verified | Category and official status unknown. | Unknown. | No Page URL or Graph permission. | Success: none. Failure: no Page fetch attempted; identity lead not confirmed. | No; low confidence. |
| American International University-Bangladesh (AIUB) | Page name/URL not verified | Category and official status unknown. | Unknown. | No Page URL or Graph permission. | Success: none. Failure: no Page fetch attempted; identity lead not confirmed. | No; low confidence. |
| Islamic University of Technology (IUT) | Page name/URL not verified | Category and official status unknown. | Unknown. | No Page URL or Graph permission. | Success: none. Failure: no Page fetch attempted; identity lead not confirmed. | No; low confidence. |
| Jagannath University | Page name/URL not verified | Category and official status unknown. | Unknown. | No Page URL or Graph permission. | Success: none. Failure: no Page fetch attempted; identity lead not confirmed. | No; low confidence. |
| Jahangirnagar University / IIT | Page name/URL not verified | Category and official status unknown. | Unknown. | No Page URL or Graph permission. | Success: none. Failure: no Page fetch attempted; identity lead not confirmed. | No; low confidence. |
| University of Asia Pacific (UAP) | Page name/URL not verified | Category and official status unknown. | Unknown. | No Page URL or Graph permission. | Success: none. Failure: no Page fetch attempted; identity lead not confirmed. | No; low confidence. |
| University of Rajshahi | Page name/URL not verified | Category and official status unknown. | Unknown. | No Page URL or Graph permission. | Success: none. Failure: no Page fetch attempted; identity lead not confirmed. | No; low confidence. |
| Khulna University of Engineering & Technology (KUET) | Page name/URL not verified | Category and official status unknown. | Unknown. | No Page URL or Graph permission. | Success: none. Failure: no Page fetch attempted; identity lead not confirmed. | No; low confidence. |
| Dhaka University of Engineering & Technology (DUET; additional lead) | DUET Computer Society — [facebook.com/duetcs](https://www.facebook.com/duetcs) | Official DUET club listing names this the official Page and describes programming, ML, data-science, cybersecurity and inter-university contests. | Yes in the official club description; Page itself unread. | Official source and direct web-reader attempt; Graph requires Page-manager authorization and approved app permissions. None. | Success: none. Failure: web reader throttled. | No; high Page-link identity confidence, no Page permission. |

**Pages investigated:** 3 candidate URLs identified and attempted through the available web reader; none yielded Page content. Two requests were throttled and one was denied by robots policy. **Pages readable through approved Graph access: 0.** These web-reader outcomes do not prove Meta itself denied API access; no authorized API request could be made.

Evidence links for the identified leads: [DUET's official Computer Society listing](https://duet.ac.bd/clubs-communities/1/duet-computer-society-duetcs), [NSU ACM Student Chapter listing](https://www.linkedin.com/company/nsuacmsc), and [NSU ACM Student Chapter site](https://nsusc.acm.org/). The Daffodil link is mentioned in a university-hosted [CSE document](https://daffodilvarsity.edu.bd/noticeFile/First%20Semester%20Information%20%28Day%20%26%20EVE%29_b9cc3f5fd7d1d6c1921b353a64b5860c.pdf); it is a Page lead, not permission evidence.

## Existing implementation and safety

The project already contains an authorized-Page adapter in `backend/discovery/facebook.py` and OAuth/review endpoints in `backend/discovery/facebook_views.py`:

- Fixed Graph API host and permitted endpoint shapes; no arbitrary URL or response-provided pagination URL is followed.
- Server-only credentials, Fernet-encrypted Page tokens, bounded timeouts/responses, at most two 50-post batches per Page, and a bounded candidate result count.
- Only Page IDs returned from an explicit Page-manager connection are imported. New Page records start paused; staff must enable them. Facebook sources require human review; automatic publication is prohibited.
- Manual organizer-submitted Facebook links are private review candidates. They are not represented as scraped posts.
- Post publication time remains separate from event dates; missing event fields remain unknown. Only candidates reach staff review; no comments, profiles, or attendee data are collected.

Existing fixtures cover allowed Page-owned posts, unrelated Page ID rejection, duplicate runs, encrypted tokens, OAuth state/replay, permission/CSRF checks, sanitized errors, and no auto-publication. These are **fixture-tested**, not live-verified.

## Alternative discovery routes

The existing 15 Bangladesh university adapters and official Codeforces, AtCoder and MLH adapters remain in place. The active flags in the current SQLite source table are configuration, not proof that a worker is running:

| Configured source | Enabled now | Last recorded check | Latest dated live verification |
|---|---:|---|---|
| Codeforces | Yes | 6 Nov 2026 | Existing official API adapter; no run was started during this phase. |
| AtCoder | Yes | 6 Nov 2026 | Existing official schedule adapter; no run was started during this phase. |
| MLH | Yes | 6 Nov 2026 | Existing official schedule adapter; no run was started during this phase. |
| UIU, BUET CSE, NSU ECE, DIU, RUET, Khulna University, GSTU, Dhaka University, AIUB, IUT, Jagannath University, Jahangirnagar IIT, UAP CSE, Rajshahi University, KUET | Yes (15) | 6 Nov 2026 | The [dated audit](UNIVERSITY_AUTO_SCRAPING_AUDIT.md) reports eight bounded readable listings: NSU, Khulna, GSTU, Dhaka, IUT, Jagannath, UAP and Rajshahi. They found zero relevant matches at that check. UIU, BUET, DIU, RUET, AIUB, Jahangirnagar IIT and KUET did not reach the listing stage in that check. |
| Facebook | No | Never | No Page is connected; no API request succeeded. |

The live website currently has no observed persistent worker process, and the latest source checks are nine days old. These sources are enabled/configured, not currently verified as collecting. The dated audit records eight university listings that passed bounded live retrieval on 6 November 2026, with zero relevant candidates in that snapshot; it does not establish continuous freshness. Preserve permitted official event pages, RSS/Atom feeds, and documented organizer feeds. The app also supports staff-reviewed details and organizer-submitted Facebook permalinks. A submitted permalink is evidence supplied by a person, not an automatically collected Facebook post.

## Findings and prerequisites

- Genuine Facebook competition announcements retrieved: **0**.
- Facebook candidates added to review: **0**; Facebook competitions published: **0**.
- Current database connected/authorized Pages: **0**; Facebook source: disabled/unconfigured.
- Live API status: **BLOCKED pending credentials, a Meta app's approved permission/feature status, and a cooperating Page manager's authorization**.
- Before activation, verify current app-specific permission and feature requirements in Meta's dashboard, obtain participating organizers' authorization, configure server-only credentials/encryption key, connect one Page, and verify a successful bounded retrieval. Keep the source review-first and disabled until that verification succeeds.
