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
| Phase 5: Integrations | IN PROGRESS | 2026-02-10 | - |
| Phase 6: Dashboard & Assessment | NOT STARTED | - | - |
| Phase 7: Marketing Site | NOT STARTED | - | - |
| Phase 8: Deployment | NOT STARTED | - | - |

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
