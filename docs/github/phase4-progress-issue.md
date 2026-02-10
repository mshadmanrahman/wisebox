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
- [x] Consultant workload/suggestion endpoint (least open tickets)
  - [x] `GET /api/v1/consultants/workload`
- [x] Consultant metrics endpoint for SLA/reporting snapshots
  - [x] `GET /api/v1/consultant/metrics`
- [x] Customer scheduling-link generation flow
  - [x] `POST /api/v1/tickets/{ticket}/schedule-link`
- [x] Customer ticket detail meeting block + status timeline polish
- [x] Notification hooks for assignment, status updates, and comments
- [x] Ticket comment attachments (S3)
  - [x] `POST /api/v1/tickets/{ticket}/comments` with multipart attachments
  - [x] `POST /api/v1/consultant/tickets/{ticket}/comments` with multipart attachments

## Validation Snapshot
- Frontend: typecheck/lint/build passing
- Backend: run locally in Docker to validate final notification + attachment tests

## Remaining (Phase 4)
- [x] None. Phase 4 implementation scope is complete.

## References
- Execution journal: `docs/execution-journal-phase2b-phase4.md`
- Stripe local testing: `docs/stripe-local-testing.md`
- Core commits:
  - `0f1e807`, `d994bad`, `096679e`, `2ad8a79`, `7df0ba6`, `1a32681`, `4a088ff`
