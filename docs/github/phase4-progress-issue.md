# Phase 4 Progress Tracking: Consultant Workflow & Ticketing

## Objective
Track implementation and remaining work for Phase 4 (consultant workflow and ticketing) after completing Phase 2B and Phase 3.

## Completed
- [x] Customer ticket APIs and UI
- [x] Admin consultant assignment endpoint and UI controls
- [x] Role-aware ticket filtering and status controls
- [x] Customer-safe internal comment visibility rules
- [x] Consultant API scope
  - [x] `GET /api/v1/consultant/dashboard`
  - [x] `GET /api/v1/consultant/tickets`
  - [x] `GET /api/v1/consultant/tickets/{id}`
  - [x] `PUT /api/v1/consultant/tickets/{id}`
  - [x] `POST /api/v1/consultant/tickets/{id}/comments`
- [x] Consultant portal pages
  - [x] `/consultant/tickets`
  - [x] `/consultant/tickets/{id}`
- [x] Calendly webhook ingestion
  - [x] `POST /api/v1/webhooks/calendly`
  - [x] `invitee.created` handling
  - [x] `invitee.canceled` handling
  - [x] signature verification via `CALENDLY_WEBHOOK_SECRET`
- [x] Automated tests for consultant APIs + Calendly webhooks

## Validation Snapshot
- Backend tests: `18 passed (72 assertions)`
- Frontend: typecheck/lint/build all passing

## Remaining (Phase 4)
- [ ] Notification hooks for assignment, status updates, and comments
- [ ] Ticket comment attachments (S3)
- [ ] Consultant workload/suggestion endpoint (least open tickets)
- [ ] Customer ticket detail: richer meeting block and status timeline polish
- [ ] Optional: consultant-only metrics endpoint for SLA/reporting

## References
- Execution journal: `docs/execution-journal-phase2b-phase4.md`
- Stripe local testing: `docs/stripe-local-testing.md`
- Core commits:
  - `0f1e807`, `d994bad`, `096679e`, `2ad8a79`, `7df0ba6`, `1a32681`, `4a088ff`
