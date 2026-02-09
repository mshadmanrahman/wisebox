# Wisebox MVP Build Log

> Step-by-step documentation of every build action. This file enables freeze/resume at any point.

## Build Status

| Phase | Status | Started | Completed |
|-------|--------|---------|-----------|
| Phase 0: Scaffolding | COMPLETE | 2026-02-09 | 2026-02-09 |
| Phase 1: Authentication | COMPLETE | 2026-02-09 | 2026-02-09 |
| Phase 2: Core Systems | COMPLETE | 2026-02-09 | 2026-02-10 |
| Phase 3: Payments | COMPLETE | 2026-02-10 | 2026-02-10 |
| Phase 4: Consultant Workflow | IN PROGRESS | 2026-02-10 | - |
| Phase 5: Integrations | NOT STARTED | - | - |
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
| Backend containerization | Docker (PHP 8.3 FPM) | No local PHP; portable, production-like |
| Frontend runtime | Native Node.js v24 | Node available locally; faster dev cycle |
| Database | MySQL 8 (Docker) | Matches implementation plan |
| Cache/Queue | Redis 7 (Docker) | Session store, queue driver, caching |
| Frontend framework | Next.js 14 App Router | SSR for marketing, SPA for portal |
| UI library | shadcn/ui + Tailwind | Rapid development with consistent design |
| State management | Zustand | Lightweight, simple for auth + form drafts |
| API client | TanStack Query + Axios | Caching, auto-refetch, interceptors |
| Deployment target | Vercel (frontend) | User requirement; optimized for Next.js |
