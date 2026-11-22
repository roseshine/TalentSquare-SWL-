# Phase 13A Remaining Work

## Completed in this phase

- University source audit improved with a separated Phase 13A evidence directory and fresh bounded audit.
- Snapshot coverage and research-only institutional leads documented.
- Isolated 15-source worker scheduling verification completed and evidence retained.
- Facebook OAuth now checks the necessary Page permissions and `MODERATE` task before saving Page tokens; setup instructions are permission-ready. Unauthorized collection remains disabled.
- Facebook-specific automated tests passed; no live Meta credentials were used.

## Still needed

1. Review the zero-match results from 9 readable configured listings and improve parsers only where official page structures support it; do not infer candidates from generic links.
2. Resolve UIU/KUET reachability and policy-unresolved sources through normal official access; do not bypass robots or access controls. Decide if BUET, AIUB, JU, CUET, EWU, SUST, BUP and RUET have another official permitted announcement endpoint.
3. Implement production parsers for the readable research-only AUST, BRAC University, DUET and IUB pages only after confirming stable structure, official status, and suitable use.
4. Install and supervise `run_import_worker` on the intended runtime. Worker code and fixture schedule verification do not mean a service is running.
5. Meta app owner must configure app credentials, callback, encryption key and supported Graph API version; complete required permission review/advanced access/business checks; authorize with a Page manager who has `MODERATE`; connect and test an actual managed Page. Non-managed Page access requires separate applicable Meta approval and code review.
6. After authorization, validate real API retrieval end-to-end, source health/run counts, Page-scoped post IDs, review candidate quality, and revocation behavior. Only then describe Facebook automatic collection as live.

## Explicitly unavailable metrics

The current import schema records created, updated, and unchanged candidate records, not raw announcements/cards inspected or relevant-announcement totals per Page. This live university audit records parser matches and request evidence, not all raw cards inspected. Do not present candidate counts as announcements inspected. Dashboard metric schema/UI work remains if those raw per-source/per-Page counts are required.

## Verification results and database preservation

`python -B manage_local.py check`: passed. `python -B manage_local.py makemigrations --check --dry-run`: no changes detected. `python -B manage_local.py test --noinput`: 360 tests passed. `python -B backend/accounts/browser_phase9_regression.py --frontend python`: 20 real-Chrome workflow assertions passed; zero JavaScript exceptions. Facebook-specific test module: 18 tests passed. Worker fixture verification: passed. All test flows used disposable databases; no application data reset or migration occurred.
