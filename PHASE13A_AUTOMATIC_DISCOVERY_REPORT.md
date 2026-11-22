# Phase 13A — Automatic Discovery Implementation Report

Date: 2026-11-15. Scope: university source collection and evidence, worker scheduling verification, and permission-ready Meta Pages integration.

## Delivered

- Strengthened Facebook OAuth: asks for `pages_show_list`, `pages_read_engagement`, and `pages_read_user_content`; verifies all three are granted through `me/permissions`; requests each Page's `tasks`; stores only numeric Page IDs with a Page access token and the `MODERATE` task. Pages lacking required permissions/tasks are rejected. Stored Page tokens remain encrypted and connected Pages remain paused until staff enables them.
- Updated [FACEBOOK_SETUP.md](FACEBOOK_SETUP.md) with current permission requirements, app setup, version configuration, and the distinction between managed Pages and access requiring Meta feature approval.
- Added a current fixed-endpoint, robots-aware source snapshot under private ignored runtime evidence: `backend/.runtime/phase13a/live/results.json`. It made bounded read-only requests and did not update the application database.
- Completed the isolated worker verification: all 15 university source connectors ran against fixtures, candidates remained in review, repeated runs were idempotent, changes remained review-pending, backoff and `Retry-After` persisted, stale leases recovered, overlapping worker processes did not duplicate requests, and continuous polling completed two cycles. Evidence: `backend/.runtime/university_auto_audit/worker-proof.json`.
- Added source, Facebook lead, scheduling, and outstanding work inventories in the accompanying Phase 13A reports.

## Current live state

The local app database has 19 sources total, including 15 Bangladesh university connectors; 18 sources are enabled, while Facebook is disabled. There are zero connected Facebook Pages. The last stored source runs are dated 2026-11-06. The live audit on 2026-11-15 verified robots-readable fixed listings for 9 of 15 university connectors, but all returned zero parser-matched competition candidates. This is a snapshot, not proof that the universities have no competitions.

## Validation

`discovery.test_facebook`: 18 tests passed. `verify_university_worker.py --save-evidence`: passed. No Meta credentials were available, so no real Facebook retrieval was attempted or claimed. The worker proof is isolated fixture verification; a persistent worker process/service is not installed or currently running.

## Verification totals and preservation

- Configured university sources: **15**. Bounded live listing retrieval permitted and parsed: **9**. These are accessible live checks, not verified discoveries. **0** parser-matched competitions and **0** new candidates came from this audit. The other **6**: three robots.txt HTTP 404 cases (BUET, AIUB, Jahangirnagar IIT), one empty/unreadable robots response (RUET), and two transport failures (UIU, KUET).
- Additional institutional targets: **8** researched. Four fixed listings were readable (AUST, BRAC University, DUET, IUB), but remain research-only; four were policy-limited/unreadable (BUP, CUET, EWU, SUST).
- Facebook inventory: **3 unverified Page leads**, **0 verified Page identities/IDs**, **0 authorized Pages**, **0 successful real API post retrievals**. Facebook source is disabled.
- Audit results generated: **0 genuine competitions**, **0 candidates sent to review**, **0 approved or published** by this Phase 13A live snapshot. Existing app DB is separate: 94 discovery candidates (80 pending, 10 approved, 4 update-pending) and 14 published competitions; these are historical/current records, not discoveries from this audit.
- Worker: isolated scheduling verification passed for 15 connectors including two-poll continuous operation; no worker/service was active or installed on the local machine.
- Django: `manage_local.py check` passed; `makemigrations --check --dry-run` reported no changes; full suite **360 tests passed** in 251.181 seconds.
- Chrome: `browser_phase9_regression.py --frontend python` passed **20 workflow assertions**, **0 JavaScript exceptions**, real Chrome, no API mocks.
- Database: no application DB reset or migration was performed. The university audit was read-only; worker and Chrome verifications used disposable SQLite databases. `makemigrations --check` confirms no pending model changes.
