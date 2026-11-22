# Next Development Roadmap

**Prepared:** 15 November 2026 (Asia/Dhaka)

## 1. Deploy and operate the verified core safely

- Configure production HTTPS, allowed hosts, exact frontend origins, secure session/CSRF cookies, secret storage, email delivery and shared login throttling.
- Choose and document a supported deployment/build path for the React frontend and Django API; remove development-only localhost/CDN assumptions from production configuration.
- Run Django and the import worker under a supervisor with one-worker locking, health/heartbeat visibility, alerting and graceful shutdown.
- Add monitored, tested database backups and a restore rehearsal. Establish a staging environment using a sanitized/disposable dataset.
- Acceptance: production configuration checklist passes, email delivery and account recovery are observed end-to-end, worker heartbeat/failure recovery alerts are verified, and a restore test recovers known fixture records.

## 2. Maintain source quality and freshness

- Recheck university source contacts and access policies; obtain approved feeds for blocked or unstable sites.
- Keep the current bounded parsers and review-first policies. Expand the source catalog only when official identity, permitted access, current event evidence, fixture coverage and failure behavior are demonstrated.
- Add worker health/heartbeat and freshness alerts without treating an enabled source as an active worker.
- Acceptance: source-specific collection runs under the supervisor, history/freshness updates accurately, and failed/blocked upstreams never create false successful-empty status.

## 3. Facebook pilot with cooperating organizers

- Obtain a Meta app and verify its current app-review/feature/permission requirements.
- Ask one named university club or organizer to authorize its official Page using the existing Page-manager flow.
- Keep the Page disabled until a bounded live API read is successful and fields/source attribution are reviewed. Keep Facebook candidate publication staff-controlled.
- Add a Page inventory entry with official identity evidence, consent contact, granted permission status, successful-check time and a revocation procedure.
- Acceptance: a successful authorized Page API retrieval is recorded; no unrelated Page is accessible; fixture tests and one live response agree on pagination, rate limits, expiry and sanitized errors. Add more Pages one cooperating owner at a time.

## 4. Decide whether to build job applications and hiring

- Define application, job-post, recruiter, participant consent, visibility, retention, review and withdrawal rules before adding models or migrations.
- Keep sample applicant/shortlist data clearly preview-only until a real, owner-scoped workflow is designed and security-reviewed.
- Acceptance: an isolated end-to-end recruiter creates a job, a participant applies/withdraws, ownership and consent boundaries pass, and no sample record appears as real data.

## 5. Define verifiable rankings and notifications

- Specify trusted result sources, identity matching, score calculation, correction/appeal rules and anti-cheating safeguards before publishing ratings.
- Define persisted notification events, delivery preferences, retries and email/SMS consent before turning demonstration notifications into product data.
- Acceptance: public ranking values are traceable to approved source evidence and deterministic tests; notifications are persisted, consent-aware and observable.

## 6. Product-wide interaction inventory and accessibility

- Turn `FEATURE_FUNCTIONALITY_AUDIT.md` into a maintained release checklist with a stable control inventory per route and role.
- Add repeatable desktop/mobile browser coverage for navigation, keyboard access, focus, validation, loading/error states and network recovery.
- Acceptance: every visible control has a documented live action, an explicit preview label, or is hidden/disabled; no critical workflow relies on browser-only identity/data.

## Recommended next phase

**Phase 14: Staging and operations hardening.** Complete production configuration, backup/restore, supervised worker, SMTP, monitoring and staging before expanding into Facebook or hiring. In parallel, begin a one-Page Facebook pilot only after Meta app permission review and a cooperating Page owner are available. Keep all new Facebook items review-first.
