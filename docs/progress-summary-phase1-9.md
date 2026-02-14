---
tags:
  - VibeCoding
  - VibeCoding/Hobby
  - Wisebox
---

# Wisebox Progress Summary (Phase 1-9)

_Last updated: 2026-02-11_

This document is the concise, current-state summary of all completed work so far, with local-first testing guidance.

## 1. Delivery Status

| Phase | Status | Scope Outcome |
|---|---|---|
| Phase 1: Authentication | Complete | Registration/login/logout, OTP verification, profile bootstrap, role-aware auth state |
| Phase 2: Core Systems | Complete | Properties, ownership/co-owner model, document workflow, location hierarchy, seeded reference data |
| Phase 3: Payments | Complete | Service ordering, Stripe checkout flow, order lifecycle API |
| Phase 4: Consultant Workflow | Complete | Ticket lifecycle, assignment, comments, consultant dashboard/workspace, scheduling hooks |
| Phase 5: Integrations | Complete | OTP service wiring, transactional notification events, CI validation baseline |
| Phase 6: Dashboard & Assessment | Complete | Dashboard summary API, notifications center, assessment scoring/history |
| Phase 7: Marketing Site | Complete | Public pages, SEO metadata/robots/sitemap, auth-safe route split |
| Phase 8: Deployment | Deferred (pre-prod complete) | Runbooks/scripts/checklists complete, external cutover intentionally paused |
| Phase 9: Local-First Development | In progress | 10 feature slices completed + local QA hardening underway |

## 2. What Is Production-Ready Locally

- Full customer flow is runnable on localhost:
  - auth -> dashboard -> properties -> documents -> assessments -> orders -> tickets
- Admin panel is runnable on localhost:
  - Filament admin on `/admin` with seeded local admin account
- Service catalog and workspace support filters, pagination, and server sorting
- Consultant flows are available through role-aware endpoints and portal views
- CI/local validation stack is in place with backend tests + frontend lint/build + Playwright suites

## 3. Phase 9 Completed Slices

1. Government adapter readiness (contract + mock/null adapter)
2. Service catalog API filtering and pagination
3. Orders/tickets edge-case hardening
4. Authenticated E2E expansion
5. Mutation and empty-state E2E hardening
6. Negative-path and role-boundary E2E hardening
7. UI resilience and retry/recovery behavior
8. Dashboard/notification caching and count performance
9. Service workspace discovery/filters/pagination UX
10. Service catalog sorting controls (recommended/price/name)

## 4. Local-First QA Hardening (Current)

Recent local manual testing issues were addressed across onboarding/dashboard:

- Dashboard CTA link hardening for malformed `cta_url` values (client + API sanitation)
- Data-shape hardening in document workflows where backend payloads can vary
- Additional stabilization around registration/property onboarding edge paths
- Ongoing alignment of UI behavior to local test expectations

For implementation details and exact file-level notes, see:
- `docs/phase9-slice11-local-qa-hardening.md`

## 5. Local Run/Test Endpoints

- Frontend app: `http://localhost:3000`
- Portal dashboard: `http://localhost:3000/dashboard`
- Backend API base: `http://localhost:8000/api/v1`
- Admin panel: `http://localhost:8000/admin`

## 6. Important Local Constraints

- Node runtime for frontend must be `>=20 <24` (Node 22 LTS recommended)
- Backend services are Dockerized (`app`, `nginx`, `mysql`, `redis`)
- Phase 8 external deployment tasks are intentionally deferred right now

## 7. Source-of-Truth Logs

- Full build chronology: `BUILD-LOG.md`
- Phase 0-4 exhaustive dossier: `docs/phase0-to-phase4-exhaustive-log.md`
- Phase 5-9 slice notes: `docs/phase5-kickoff-otp-notifications.md` and `docs/phase9-slice*.md`


## Related
- [[Vibe Coding/_hobby/README|Hobby Projects Index]]
