---
tags:
  - VibeCoding
  - VibeCoding/Hobby
  - Wisebox
---

# Wisebox MVP Build Log

> Step-by-step documentation of every build action. This file enables freeze/resume at any point.
> Detailed chronology and implementation method for Phase 2B-4: `docs/execution-journal-phase2b-phase4.md`.
> Full exhaustive dossier (Phase 0-4, including commit-by-commit file appendix): `docs/phase0-to-phase4-exhaustive-log.md`.

## Build Status

| Phase | Status | Started | Completed |
|-------|--------|---------|-----------|
| Phase 0: Scaffolding | COMPLETE | 2026-02-09 | 2026-02-09 |
| Phase 1: Authentication | COMPLETE | 2026-02-09 | 2026-02-09 |
| Phase 2: Core Systems | COMPLETE | 2026-02-09 | 2026-02-10 |
| Phase 3: Payments | COMPLETE | 2026-02-10 | 2026-02-10 |
| Phase 4: Consultant Workflow | COMPLETE | 2026-02-10 | 2026-02-10 |
| Phase 5: Integrations | COMPLETE | 2026-02-10 | 2026-02-10 |
| Phase 6: Dashboard & Assessment | COMPLETE | 2026-02-10 | 2026-02-10 |
| Phase 7: Marketing Site | COMPLETE | 2026-02-10 | 2026-02-10 |
| Phase 8: Deployment | DEFERRED (PRE-PROD COMPLETE) | 2026-02-10 | - |
| Phase 9: Local-First Feature Development | IN PROGRESS | 2026-02-10 | - |
| Phase 10: Ticket Lifecycle Production Hardening | COMPLETE | 2026-02-14 | 2026-02-14 |

---

## Phase 0: Project Scaffolding

### 0.1 Create monorepo structure
- **Date:** 2026-02-09
- **Action:** Created directory skeleton
- **Directories:** backend/, frontend/, docs/, docker/, .github/workflows/
- **Git:** Initialized repository

### 0.2 Create root configuration files
- **Date:** 2026-02-09
- **Action:** Created BUILD-LOG.md, README.md, .gitignore
- **Purpose:** Project documentation, ignore rules for Laravel + Next.js + Docker

### 0.3 Docker Compose setup
- **Status:** COMPLETE
- **Plan:** PHP 8.4 FPM + Nginx + MySQL 8 + Redis 7
- **Reason:** No local PHP/Composer; full backend runs in Docker

### 0.4 Initialize Next.js frontend
- **Status:** COMPLETE
- **Plan:** create-next-app with App Router, TypeScript, Tailwind, shadcn/ui

### 0.5 Initialize Laravel backend
- **Status:** COMPLETE
- **Plan:** Laravel 12 via Docker, install Sanctum, Filament, Stripe, Twilio

### 0.6 Database migrations
- **Status:** COMPLETE
- **Plan:** 33 tables from implementation plan schema

### 0.7 Reference data seeders
- **Status:** COMPLETE
- **Plan:** Property types, ownership statuses, document types, services, locations

### 0.8 Design system setup
- **Status:** COMPLETE
- **Plan:** Tailwind theme tokens, shadcn/ui components, TypeScript types, API client

### 0.9 Phase 0 verification
- **Status:** COMPLETE
- **Plan:** Docker up, migrations, seeders, dev servers, CORS check

### Phase 0 Final State (2026-02-09)
- **Commits:** 8 on main branch
- **Docker:** PHP 8.4 FPM + Nginx + MySQL 8 + Redis 7 (all healthy)
- **Database:** 33 tables, 27 migrations, 7 seeders run
- **Seeded data:** 5 property types, 7 ownership statuses, 3 ownership types, 11 document types, 17 services, 3 service categories, 8 divisions, 65 districts, 133 upazilas, 8 FAQs
- **Frontend:** Next.js 14 with 18 shadcn/ui components, TypeScript types, API client, auth store
- **Verification:** All services up, migrations pass, seeders pass, CORS working, frontend builds
- **Issues fixed during verification:** PHP 8.3->8.4 (Laravel 12 requirement), libicu-dev missing, .env SQLite->MySQL, ESLint use-toast fix

---

## Phase 3: Service & Payment Layer (2026-02-10)

- Enabled order API endpoints:
  - `GET /api/v1/orders`
  - `POST /api/v1/orders`
  - `GET /api/v1/orders/{id}`
  - `POST /api/v1/orders/{id}/checkout`
  - `POST /api/v1/orders/{id}/cancel`
- Added Stripe webhook endpoint:
  - `POST /api/v1/webhooks/stripe`
- Added backend services:
  - `StripeService` for checkout session creation + webhook signature verification
  - `OrderFulfillmentService` for post-payment ticket creation
- Implemented customer portal pages:
  - `/services` (service selection and order creation)
  - `/orders` (history)
  - `/orders/{id}` (detail + checkout/cancel)
  - `/orders/{id}/confirmation` (payment confirmation)
- Added local Stripe checklist document:
  - `docs/stripe-local-testing.md`

## Phase 4: Consultant Workflow (Started 2026-02-10)

- Added initial ticket workflow API:
  - `GET /api/v1/tickets`
  - `POST /api/v1/tickets`
  - `GET /api/v1/tickets/{id}`
  - `PATCH /api/v1/tickets/{id}/status`
  - `POST /api/v1/tickets/{id}/comments`
- Replaced ticket placeholder frontend with working pages:
  - `/tickets` (ticket list)
  - `/tickets/{id}` (ticket detail + threaded comments)
- Enhanced ticket operations:
  - `PATCH /api/v1/tickets/{id}/assign` (admin consultant assignment)
  - `GET /api/v1/tickets/{id}/comments` (comment list endpoint)
  - `GET /api/v1/consultants` (admin consultant directory with open-ticket counts)
  - Internal notes are hidden from customers in ticket detail/comment responses
  - Role-aware ticket filters and status controls in portal ticket UI
- Consultant workflow expansion:
  - Added consultant API scope:
    - `GET /api/v1/consultant/dashboard`
    - `GET /api/v1/consultant/metrics`
    - `GET /api/v1/consultant/tickets`
    - `GET /api/v1/consultant/tickets/{id}`
    - `PUT /api/v1/consultant/tickets/{id}`
    - `POST /api/v1/consultant/tickets/{id}/comments`
  - Added consultant assignment intelligence endpoint:
    - `GET /api/v1/consultants/workload`
  - Added Calendly webhook ingestion:
    - `POST /api/v1/webhooks/calendly`
    - Supports `invitee.created` and `invitee.canceled` ticket schedule updates
    - Signature verification using `CALENDLY_WEBHOOK_SECRET`
  - Added customer scheduling-link endpoint:
    - `POST /api/v1/tickets/{id}/schedule-link`
    - Uses consultant Calendly URL and falls back to `CALENDLY_BOOKING_URL`
  - Added consultant portal pages:
    - `/consultant/tickets`
    - `/consultant/tickets/{id}`
  - Improved customer ticket detail:
    - Status timeline chips
    - Meeting block with schedule metadata and scheduling-link action
  - Added notification hooks (DB-backed) for:
    - consultant assignment
    - status updates
    - public comment updates
  - Added ticket comment attachment support:
    - multipart upload support on customer + consultant comment endpoints
    - attachment persistence in `ticket_comments.attachments`
    - file handling uses S3 in production and local disk in non-production
  - Added automated tests:
    - `ConsultantTicketApiTest`
    - `CalendlyWebhookTest`
    - notification hook assertions
    - ticket comment attachment assertions

## Phase 5: Integrations (Started 2026-02-10)

- OTP integration kickoff:
  - Added `OtpService` with:
    - 6-digit OTP generation
    - 10-minute OTP expiry
    - 60-second resend cooldown per user
    - hashed OTP storage in cache
    - channel support: `email` and `sms`
  - Added `OtpCodeNotification` (email OTP delivery template).
  - `AuthController` now uses `OtpService` for:
    - OTP send on registration
    - OTP resend endpoint with channel validation and rate limiting
    - OTP verify endpoint with invalid/expired handling
  - Added Twilio service config mapping in `config/services.php`:
    - `sid`, `auth_token`, `from`, `verify_sid`
- Testing and quality:
  - Added `backend/tests/Feature/AuthOtpTest.php`
  - Covers: registration OTP send, resend + verify success, invalid code rejection, resend rate limiting, SMS phone requirement validation.
- Documentation:
  - Added `docs/phase5-kickoff-otp-notifications.md` for implementation notes and verification commands.
  - Added `docs/testing-validation-matrix.md` to standardize unit/functional/integration/frontend/E2E validation gates.
- Stability fixes from validation feedback:
  - Added Sanctum migration for `personal_access_tokens` to support token creation in registration tests.
  - Updated `User` model fillable fields to include `email_verified_at` and `phone_verified_at` so OTP verification updates persist.
- E2E harness kickoff:
  - Added Playwright config at `frontend/playwright.config.js`
  - Added smoke spec at `frontend/tests/e2e/smoke.spec.js` covering `/login`, `/register`, `/forgot-password`
  - Added frontend scripts:
    - `npm run test:e2e`
    - `npm run test:e2e:headed`
    - `npm run test:e2e:ui`
  - Extended root validation script with `--with-e2e` option.
  - Installed `@playwright/test` and committed lockfile updates for reproducible E2E runs.
  - Added `allowedDevOrigins` in `frontend/next.config.mjs` to align dev-server origin policy for Playwright (`127.0.0.1` and `localhost`).
- Calendly outbound scheduling integration:
  - Added `CalendlyService` with API-first scheduling link generation using `CALENDLY_API_KEY` + `CALENDLY_EVENT_TYPE_URI`.
  - Added graceful fallback to consultant `calendly_url` or `CALENDLY_BOOKING_URL` when API calls fail or are not configured.
  - Extended scheduling endpoint response with `mode` (`api` or `fallback`) for observability.
- Transactional email notifications (queued):
  - Added `OrderLifecycleNotification` and `TicketLifecycleNotification` (both `ShouldQueue`).
  - Added `TransactionalEmailService` and wired events into:
    - order create/cancel flows
    - Stripe webhook payment status transitions (paid, failed, refunded)
    - ticket assignment, status updates, and public comment updates
- CI automation:
  - Added GitHub Actions workflow `.github/workflows/validate.yml` for push/PR validation.
  - Workflow runs full matrix including Playwright via `./scripts/validate.sh --with-e2e`.

## Phase 6: Dashboard & Assessment (Started 2026-02-10)

- Backend assessment system:
  - Added `assessment_questions` table + `AssessmentQuestionSeeder` (15 weighted yes/no questions).
  - Added public endpoints:
    - `GET /api/v1/assessments/questions`
    - `POST /api/v1/assessments/free`
  - Added authenticated endpoint:
    - `GET /api/v1/properties/{property}/assessment`
  - Added `PropertyAssessmentService` for weighted scoring, risk factors, and service recommendations.
- Notification center backend:
  - Added `NotificationController` and `InAppNotification` model.
  - Added endpoints:
    - `GET /api/v1/notifications`
    - `GET /api/v1/notifications/unread-count`
    - `PATCH /api/v1/notifications/{notificationId}/read`
    - `PATCH /api/v1/notifications/read-all`
- Settings backend enhancements:
  - Added `PUT /api/v1/auth/change-password`.
  - Extended `PUT /api/v1/auth/me` to persist `notification_preferences`.
  - Added `notification_preferences` JSON column to `user_profiles`.
- Frontend portal updates:
  - Replaced placeholder dashboard with hero, quick actions, property preview, activity feed, and notification preview.
  - Added public lead-magnet page: `/assessment`.
  - Added full notification center page: `/notifications`.
  - Added account settings page: `/settings`.
  - Added header bell with unread badge + dropdown interactions.
  - Protected `/notifications` in middleware.
- Test additions for Phase 6:
  - `AssessmentApiTest`
  - `NotificationApiTest`
  - `AuthSettingsTest`
  - Playwright smoke test now includes `/assessment`.
- Phase 6 polish completion:
  - Added dedicated aggregate endpoint: `GET /api/v1/dashboard/summary`.
  - Added property assessment history endpoint: `GET /api/v1/properties/{property}/assessments`.
  - Extended notification listing with `status`, `type`, and `q` filters plus pagination support.
  - Refactored portal dashboard to use aggregate summary API (single query).
  - Upgraded `/notifications` with server-backed filter/search/pagination controls.
  - Added assessment history panel in property detail UI.
  - Added/updated test coverage:
    - `DashboardSummaryApiTest`
    - `AssessmentApiTest` (history endpoint assertions)
    - `NotificationApiTest` (filters/search/pagination assertions)

## Phase 7: Marketing Site (Started 2026-02-10)

- Kickoff documentation added:
  - `docs/phase7-kickoff-marketing-site.md`
- CI/release evidence snapshot added:
  - `docs/github/phase6-polish-ci-release-snapshot.md`
- E2E expansion beyond smoke:
  - Added authenticated workflow suite:
    - `frontend/tests/e2e/authenticated-workflows.spec.js`
  - New coverage includes:
    - protected-route redirect enforcement (`/dashboard` -> `/login`)
    - login-to-dashboard authenticated flow with API mocking
    - notification center filter + pagination interactions
    - property detail assessment history rendering
- Marketing implementation (current slice):
  - Added reusable marketing component layer:
    - `frontend/src/components/marketing/content.ts`
    - `frontend/src/components/marketing/marketing-header.tsx`
    - `frontend/src/components/marketing/marketing-footer.tsx`
    - `frontend/src/components/marketing/faq-accordion.tsx`
    - `frontend/src/components/marketing/pricing-table.tsx`
  - Replaced default Next.js starter home page with complete marketing landing page on `/`.
  - Added new public marketing pages:
    - `/about`
    - `/faq`
    - `/contact`
    - `/services`
  - Resolved services route collision:
    - Moved authenticated service ordering workspace to `/workspace/services`
    - Updated portal navigation and action links to use `/workspace/services`
    - Updated middleware protection from `/services` to `/workspace`
  - Added SEO surface:
    - root metadata + Open Graph baseline in `frontend/src/app/layout.tsx`
    - canonical + Open Graph page metadata for public marketing pages
    - richer JSON-LD on landing and services pages
    - `frontend/src/app/robots.ts`
    - `frontend/src/app/sitemap.ts`
  - Expanded smoke E2E route coverage for public pages (`/`, `/about`, `/faq`, `/contact`, `/services`).
  - Added E2E assertion for `/services` CTA auth behavior:
    - unauthenticated click on "Open Services Workspace" redirects to `/login?redirect=%2Fworkspace%2Fservices`

## Phase 8: Deployment and Production (Started 2026-02-10)

- Kickoff and planning artifacts created:
  - `docs/phase8-kickoff-deployment.md`
  - `docs/deployment/env-matrix.md`
  - `docs/deployment/production-runbook.md`
  - `docs/deployment/forge-production-checklist.md`
  - `docs/deployment/forge-ui-paste-blocks.md`
  - `docs/deployment/phase8-execution-tracker.md`
- Deployment execution scripts added:
  - `scripts/deploy-backend.sh`
  - `scripts/verify-vercel-env.sh`
  - `scripts/smoke-production.sh`
- Deployment path decision:
  - Preferred backend target set to Laravel Forge
- Phase 8 initial scope locked:
  - backend production rollout path (EC2/Forge)
  - frontend production rollout path (Vercel)
  - DNS/TLS verification
  - Stripe + Calendly production webhook verification
  - post-deploy smoke + rollback procedure
- Validation discipline retained:
  - preflight requires `./scripts/validate.sh --with-e2e` before release execution
- Phase 8 execution tracking:
  - Added live rollout tracker with status/evidence rows in `docs/deployment/phase8-execution-tracker.md`
  - Deployment cutover steps set to deferred state pending release window selection
  - Local validation baseline confirmed green before defer decision:
    - backend: 42 tests passing (217 assertions)
    - frontend: typecheck + lint + build passing
    - e2e: 14 tests passing

## Phase 9: Local-First Feature Development (Started 2026-02-10)

- Kickoff artifact created:
  - `docs/phase9-kickoff-local-first.md`
- Direction locked:
  - Continue feature delivery and testing in local/CI while production cutover remains deferred
- Validation discipline retained:
  - `./scripts/validate.sh --with-e2e` is required before push
- Slice 1 completed: Government adapter readiness layer
  - Added contract + null/mock implementations:
    - `backend/app/Contracts/GovernmentGatewayAdapter.php`
    - `backend/app/Services/Government/NullGovernmentGatewayAdapter.php`
    - `backend/app/Services/Government/MockGovernmentGatewayAdapter.php`
  - Added container wiring + config flags:
    - `backend/app/Providers/AppServiceProvider.php`
    - `backend/config/services.php`
  - Added gated no-op runtime hook in order flow:
    - `backend/app/Http/Controllers/Api/V1/OrderController.php`
  - Added unit tests:
    - `backend/tests/Unit/GovernmentGatewayAdapterTest.php`
  - Added slice note:
    - `docs/phase9-slice1-government-adapter.md`
- Slice 2 completed: Service catalog API filters and pagination
  - Replaced public service catalog route closures with controller:
    - `backend/app/Http/Controllers/Api/V1/ServiceCatalogController.php`
    - `backend/routes/api.php`
  - Added optional filters/search/pagination support on `GET /api/v1/services`
  - Added feature tests:
    - `backend/tests/Feature/ServiceCatalogApiTest.php`
  - Added slice note:
    - `docs/phase9-slice2-service-catalog-api.md`
- Slice 3 completed: Orders and tickets edge-case hardening
  - Added order edge-case feature coverage:
    - `backend/tests/Feature/OrderApiTest.php`
    - checkout on already-paid orders returns confirmation URL
    - paid orders cannot be cancelled
    - cancelled orders cannot be checked out
  - Added ticket edge-case feature coverage:
    - `backend/tests/Feature/TicketApiTest.php`
    - customers cannot post internal comments
    - scheduling link requires assigned consultant
  - Expanded authenticated E2E coverage:
    - `frontend/tests/e2e/authenticated-workflows.spec.js`
    - orders list/detail rendering flow
    - tickets list/detail rendering flow
  - Added slice note:
    - `docs/phase9-slice3-orders-tickets-edge-hardening.md`
- Slice 4 completed: Authenticated E2E expansion
  - Expanded authenticated workflow suite:
    - `frontend/tests/e2e/authenticated-workflows.spec.js`
    - settings profile save + password change request coverage
    - services workspace order-initiation coverage
    - consultant workspace list/detail rendering coverage
  - Added role-aware authenticated session seeding helper for Playwright tests
  - Added slice note:
    - `docs/phase9-slice4-authenticated-e2e-expansion.md`
- Slice 5 completed: Mutation + empty-state E2E hardening
  - Extended authenticated workflow suite for mutation assertions:
    - settings profile/password payload checks
    - customer ticket comment payload checks
    - consultant ticket update/internal comment payload checks
  - Added authenticated empty-state assertions for:
    - orders list (`/orders`)
    - tickets list (`/tickets`)
    - properties list (`/properties`)
  - Added slice note:
    - `docs/phase9-slice5-mutation-and-empty-state-e2e.md`
- Slice 6 completed: Negative-path + role-boundary E2E hardening
  - Extended authenticated workflow suite:
    - customer scheduling-link failure path (`/tickets/{id}/schedule-link`)
    - customer ticket comment failure path (`/tickets/{id}/comments`)
    - consultant update/comment failure paths (`/consultant/tickets/{id}` + `/consultant/tickets/{id}/comments`)
    - consultant workspace role gate for non-consultant users
  - Added explicit UI error-surface assertions for backend message propagation in ticket workflows
  - Added slice note:
    - `docs/phase9-slice6-negative-path-and-role-boundary-e2e.md`
- Slice 7 completed: UI resilience + retry/recovery hardening
  - Added retry-aware error states for key portal pages:
    - `frontend/src/app/(portal)/dashboard/page.tsx`
    - `frontend/src/app/(portal)/notifications/page.tsx`
    - `frontend/src/app/(portal)/orders/page.tsx`
    - `frontend/src/app/(portal)/tickets/page.tsx`
  - Added safer stale-data behavior in notifications and tickets queries:
    - `frontend/src/hooks/use-notifications.ts`
    - query retries and previous-data preservation during refetch
  - Expanded authenticated E2E suite with transient-failure recovery coverage for:
    - dashboard summary
    - notifications list
    - orders list
    - tickets list
  - Added slice note:
    - `docs/phase9-slice7-ui-resilience-retry-recovery.md`
- Slice 8 completed: Dashboard and notifications caching/performance pass
  - Optimized dashboard summary endpoint:
    - `backend/app/Http/Controllers/Api/V1/DashboardController.php`
    - cached active hero slides for 5 minutes
    - consolidated ticket total/open counts into one aggregate query
  - Added unread-count caching + mutation invalidation:
    - `backend/app/Http/Controllers/Api/V1/NotificationController.php`
    - per-user unread count cache with 30-second TTL
    - cache invalidation on `markRead` and `markAllRead`
  - Extended notification feature coverage:
    - `backend/tests/Feature/NotificationApiTest.php`
    - unread-count assertions after read mutation to verify cache refresh
  - Added slice note:
    - `docs/phase9-slice8-dashboard-notification-caching.md`
- Slice 9 completed: Service workspace discovery and filtering pass
  - Enriched service category metadata for filter UX:
    - `backend/app/Http/Controllers/Api/V1/ServiceCatalogController.php`
    - category payload now includes `active_services_count` scoped to active services
  - Expanded category endpoint feature coverage:
    - `backend/tests/Feature/ServiceCatalogApiTest.php`
    - active-only service counts asserted in sorted category response
  - Upgraded authenticated services workspace UX:
    - `frontend/src/app/(portal)/workspace/services/page.tsx`
    - added catalog search/category/pricing/featured filters
    - added server-driven pagination controls
    - preserved selected services across filter/page transitions
  - Updated frontend contract + E2E coverage:
    - `frontend/src/types/index.ts`
    - `frontend/tests/e2e/authenticated-workflows.spec.js`
    - added service-filter + pagination workflow assertions
    - stabilized notifications transient-failure E2E retry threshold in dev strict-mode runs
  - Added slice note:
    - `docs/phase9-slice9-service-workspace-discovery.md`
- Slice 10 completed: Service catalog sorting + workspace ranking controls
  - Extended service catalog API sorting contract:
    - `backend/app/Http/Controllers/Api/V1/ServiceCatalogController.php`
    - added `sort` query validation and ordering modes:
      - `recommended` (default)
      - `price_low`
      - `price_high`
      - `name_asc`
      - `name_desc`
  - Expanded service catalog feature coverage:
    - `backend/tests/Feature/ServiceCatalogApiTest.php`
    - added assertions for price and name sorting paths
  - Added authenticated workspace sort controls:
    - `frontend/src/app/(portal)/workspace/services/page.tsx`
    - added sort selector wired to server query params
    - preserved compatibility with existing filters/pagination/selection persistence
  - Expanded E2E coverage for ranking behavior:
    - `frontend/tests/e2e/authenticated-workflows.spec.js`
    - verifies sorting by price and name plus restore to recommended ranking
  - Added slice note:
    - `docs/phase9-slice10-service-catalog-sorting.md`
- Slice 11 completed: Local QA hardening + dashboard CTA/data-shape resilience
  - Hardened dashboard hero CTA handling in portal UI:
    - `frontend/src/app/(portal)/dashboard/page.tsx`
    - Added malformed URL fallback and localhost URL normalization for local routing safety
  - Added server-side sanitation for hero slide CTA payloads:
    - `backend/app/Http/Controllers/Api/V1/DashboardController.php`
    - Prevents malformed `cta_url` values from propagating to clients
  - Added dashboard summary regression assertions:
    - `backend/tests/Feature/DashboardSummaryApiTest.php`
    - Verifies malformed local CTA values normalize to safe internal routes
  - Local QA follow-up hardening touched onboarding/document flow safety paths:
    - `frontend/src/components/property/document-upload-item.tsx`
    - `frontend/src/components/property/document-status-list.tsx`
    - `frontend/src/components/property/co-owner-fields.tsx`
    - `frontend/src/components/property/location-cascade.tsx`
  - Added slice note:
    - `docs/phase9-slice11-local-qa-hardening.md`

## Phase 10: Ticket Lifecycle Production Hardening (2026-02-14)

Full audit and fix of the end-to-end ticket lifecycle:
**signup > property > order > ticket > consultant assignment > scheduling > meeting > completion**

### Audit Methodology
- 3 parallel codebase explorations: auth flow, property/order flow, consultant/scheduling flow
- 7 bugs and gaps identified across admin UI, webhooks, and notification paths
- All fixes verified against 68 passing tests (324 assertions, zero regressions)

### Bugs Fixed

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `Schemas/TicketForm.php` | Form reads `meet_link` but controllers write `meeting_url`; admin sees empty meeting link | Replaced `meet_link` with `meeting_url`, updated label |
| 2 | `Schemas/TicketForm.php` | Status dropdown missing 4 of 9 statuses | Added `in_progress`, `awaiting_customer`, `awaiting_consultant`, `cancelled` |
| 3 | `Schemas/TicketInfolist.php` | Same `meet_link` field mismatch + missing 4 status colors | Replaced field, added color mappings |
| 4 | `Tables/TicketsTable.php` | Badge column missing colors/icons for 4 statuses; filter missing 4 options | Added closure-based color mapping (avoids PHP duplicate key issue), icons, and filter options |
| 5 | `CalendlyWebhookController.php` | `invitee.created` updates ticket silently (no email, no notification) | Added `TransactionalEmailService::sendMeetingScheduled()` + in-app notification; parity with Google Calendar path |
| 6 | `CalendlyWebhookController.php` | `invitee.canceled` clears ticket data but sends no notification | Added status update email + in-app notification to customer |
| 7 | `Pages/EditTicket.php` | Filament edit doesn't set `resolved_at` when status becomes `completed` | Added `resolved_at = now()` on completion, `null` when moving away |
| 8 | `TicketController.php` | No admin notification when ticket completes (only customer notified) | Added notification to all admin/super_admin users |
| 9 | `FreeConsultationController.php` | Customer submits free consultation but receives no confirmation email | Added `sendTicketCreated()` call after ticket creation |

### Technical Notes
- **Closure-based BadgeColumn colors**: PHP arrays can't have duplicate string keys. When mapping multiple statuses to the same color, use closures: `'warning' => fn ($state) => in_array($state, ['open', 'awaiting_customer'])`
- **Notification parity**: The Google Calendar path had full branded email + ICS + notification. The Calendly webhook path was silent. Now both paths send equivalent notifications.
- **`resolved_at` sync**: The API controller already handled this, but the Filament admin edit page didn't. Both paths now behave identically.
- **`meet_link` column**: Still exists in the DB but we no longer read it. Can be dropped via migration after verifying nothing else references it.

### What Was NOT Changed (and why)

| Item | Reason |
|------|--------|
| GoogleCalendarService token TODOs | Calendly is primary scheduling; Google Calendar is optional alternative |
| Login rate limiting | Infrastructure concern (Cloudflare/nginx), not app code |
| Email verification middleware | Frontend concern; token is issued at registration |
| Refresh token mechanism | 24hr Sanctum tokens are fine for current use case |
| `meet_link` DB column removal | Migration can happen separately after verifying no references |

### Commits
```
e8e2858 Fix ticket lifecycle: 7 bugs across admin UI, webhooks, and notifications
253a67f Add consultation forms, scheduling, and notification infrastructure
4ae3899 Update backend: auth, orders, tickets, routes, tests, and config
616d4d4 Update frontend: auth flows, portal pages, components, and tests
2e65ddc Add documentation, deployment guides, and project setup scripts
```

### Lifecycle Status (Post-Fix)

| Step | Status |
|------|--------|
| Registration + Email OTP | Working |
| Dashboard | Working |
| Property creation | Working |
| Free assessment | Working |
| Service catalog | Working |
| Order + Stripe payment | Working |
| Ticket auto-creation | Working |
| Free consultation + confirmation email | Working |
| Admin assigns consultant | Working |
| Calendly booking webhook + email/notification | Working |
| Google Calendar confirmSlot | Working |
| Admin panel: all 9 statuses with colors/icons | Working |
| Admin panel: meeting_url field | Working |
| Status > completed with resolved_at | Working |
| Admin notified on ticket completion | Working |

---

## Resume Instructions

To resume building after a stop:

1. Read this BUILD-LOG.md to understand current state
2. Check the last completed step
3. Look at the next PENDING step
4. Run `docker compose ps` to check if services are running
5. Run `cd frontend && npm run dev` to start frontend if needed
6. Continue from the next pending step

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend containerization | Docker (PHP 8.4 FPM) | No local PHP; portable, production-like |
| Frontend runtime | Native Node.js v24 | Node available locally; faster dev cycle |
| Database | MySQL 8 (Docker) | Matches implementation plan |
| Cache/Queue | Redis 7 (Docker) | Session store, queue driver, caching |
| Frontend framework | Next.js 14 App Router | SSR for marketing, SPA for portal |
| UI library | shadcn/ui + Tailwind | Rapid development with consistent design |
| State management | Zustand | Lightweight, simple for auth + form drafts |
| API client | TanStack Query + Axios | Caching, auto-refetch, interceptors |
| Deployment target | Vercel (frontend) | User requirement; optimized for Next.js |

## Related
- [[Vibe Coding/_hobby/README|Hobby Projects Index]]
