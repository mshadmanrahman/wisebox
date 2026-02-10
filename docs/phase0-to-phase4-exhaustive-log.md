# Wisebox Exhaustive Build Dossier (Phase 0 to Phase 4)

This document is the canonical, exhaustive record of what was built, how it was built, what changed, how it was validated, and how Phase 4 was closed.

Date finalized: 2026-02-10  
Repository: `mshadmanrahman/wisebox`  
Primary merge point: PR #2 into `main` (merged on 2026-02-10)

---

## 1) Scope and Completion State

Covered in this dossier:
- Phase 0: Scaffolding
- Phase 1: Authentication
- Phase 2: Core Systems (property + documents + property frontend)
- Phase 3: Payments and orders
- Phase 4: Consultant workflow, ticketing, scheduling, metrics, notifications, attachments

Final status snapshot:
- Phase 0: COMPLETE
- Phase 1: COMPLETE
- Phase 2: COMPLETE
- Phase 3: COMPLETE
- Phase 4: COMPLETE
- Phase 5+: NOT STARTED

Source-of-truth files this dossier consolidates:
- `BUILD-LOG.md`
- `docs/execution-journal-phase2b-phase4.md`
- `docs/github/phase4-progress-issue.md`
- Git commit history on `main`
- Current backend routes and tests

---

## 2) Architecture and Stack Locked Through Phase 4

Backend:
- Laravel (API-first)
- Sanctum auth
- MySQL 8
- Redis 7
- Dockerized runtime with Nginx + PHP-FPM

Frontend:
- Next.js 14 App Router (TypeScript)
- Tailwind CSS + shadcn/ui
- TanStack Query + Axios
- Zustand for auth/session state

External integrations implemented by end of Phase 4:
- Stripe checkout + webhook processing
- Calendly webhook ingestion

Storage behavior by end of Phase 4:
- Ticket comment attachments: `s3` in production, `local` in non-production

---

## 3) Phase-by-Phase Delivery (What Exists at End of Each Phase)

## Phase 0 (Scaffolding)

Delivered:
- Monorepo skeleton: `backend/`, `frontend/`, `docs/`, `docker/`
- Docker Compose baseline
- Frontend app scaffold and dependency setup
- Full migration set and reference seeders
- Design system baseline and API client/types groundwork

Important outcomes:
- Infrastructure bootstrapped and reproducible in Docker
- Core schema and reference data seeded
- Frontend foundation prepared for auth and product flows

## Phase 1 (Authentication)

Delivered backend auth:
- User model role/status behavior
- Auth controller and routes (register/login/google/forgot/reset, me/logout/verify/resend)

Delivered frontend auth:
- `/login`
- `/register` (multi-step flow)
- `/forgot-password`
- Route middleware protection scaffold

## Phase 2 (Core Systems)

Delivered backend:
- Property domain models + property CRUD
- Property completion scoring service
- Document management API and domain models

Delivered frontend (Phase 2B):
- `/properties`
- `/properties/new`
- `/properties/[id]`
- `/properties/[id]/edit`
- Property hooks/components for list/add/edit/detail and related data loading

## Phase 3 (Payments)

Delivered backend:
- Orders API (`index/store/show/checkout/cancel`)
- `StripeService`
- `OrderFulfillmentService`
- Stripe webhook endpoint and payment state transitions

Delivered frontend:
- `/services`
- `/orders`
- `/orders/[id]`
- `/orders/[id]/confirmation`

## Phase 4 (Consultant Workflow)

Delivered in sequence:
- Customer ticket API/UI baseline (`/tickets`, `/tickets/[id]`)
- Role-aware ticket controls + admin consultant assignment
- Customer-safe internal comment filtering
- Consultant workspace APIs and UI (`/consultant/tickets`, `/consultant/tickets/[id]`)
- Calendly webhook ingestion (`invitee.created`, `invitee.canceled`)
- Consultant workload ranking endpoint
- Consultant metrics endpoint
- Customer scheduling-link generation endpoint
- Ticket detail meeting/timeline polish
- Notification hooks (DB-backed) for assignment/status/comment events
- Multipart comment attachments (customer + consultant endpoints and UI)

Phase 4 close result:
- End-to-end consultant workflow complete and validated
- PR merged and tracking issue closed

---

## 4) Final API Surface Through Phase 4

Authentication:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/google`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/resend-otp`
- `GET /api/v1/auth/me`
- `PUT /api/v1/auth/me`

Properties and documents:
- `apiResource /api/v1/properties`
- `PUT /api/v1/properties/{property}/draft`
- `GET /api/v1/properties/{property}/documents`
- `POST /api/v1/properties/{property}/documents`
- `POST /api/v1/properties/{property}/documents/{documentTypeId}/mark-missing`
- `DELETE /api/v1/properties/{property}/documents/{document}`

Orders and Stripe:
- `GET /api/v1/orders`
- `POST /api/v1/orders`
- `GET /api/v1/orders/{order}`
- `POST /api/v1/orders/{order}/checkout`
- `POST /api/v1/orders/{order}/cancel`
- `POST /api/v1/webhooks/stripe`

Tickets and consultant workflow:
- `GET /api/v1/tickets`
- `POST /api/v1/tickets`
- `GET /api/v1/tickets/{ticket}`
- `PATCH /api/v1/tickets/{ticket}/status`
- `PATCH /api/v1/tickets/{ticket}/assign`
- `POST /api/v1/tickets/{ticket}/schedule-link`
- `GET /api/v1/tickets/{ticket}/comments`
- `POST /api/v1/tickets/{ticket}/comments`
- `GET /api/v1/consultants`
- `GET /api/v1/consultants/workload`
- `GET /api/v1/consultant/dashboard`
- `GET /api/v1/consultant/metrics`
- `GET /api/v1/consultant/tickets`
- `GET /api/v1/consultant/tickets/{ticket}`
- `PUT /api/v1/consultant/tickets/{ticket}`
- `POST /api/v1/consultant/tickets/{ticket}/comments`
- `POST /api/v1/webhooks/calendly`

Reference/public support endpoints:
- Locations (`/locations/divisions`, `/districts`, `/upazilas`, `/mouzas`)
- `/services`, `/service-categories`, `/faqs`, `/sliders`
- `/property-types`, `/ownership-statuses`, `/ownership-types`, `/document-types`

---

## 5) Frontend Route Surface Through Phase 4

Top-level:
- `/`
- `/_not-found`

Auth:
- `/login`
- `/register`
- `/forgot-password`

Portal:
- `/dashboard`
- `/properties`
- `/properties/new`
- `/properties/[id]`
- `/properties/[id]/edit`
- `/services`
- `/orders`
- `/orders/[id]`
- `/orders/[id]/confirmation`
- `/tickets`
- `/tickets/[id]`
- `/consultant/tickets`
- `/consultant/tickets/[id]`

---

## 6) Database Artifacts Through Phase 4

Migrations present:
- 27 migration files in `backend/database/migrations`
- Includes core domain entities and supporting tables:
  - users/profiles/consultant_profiles
  - property taxonomy + location hierarchy
  - properties, co_owners, property_documents
  - orders, order_items
  - tickets, ticket_comments
  - property_assessments
  - notifications, activity_log
  - slider/faq content tables

Seeders present:
- `PropertyTypeSeeder`
- `OwnershipStatusSeeder`
- `OwnershipTypeSeeder`
- `DocumentTypeSeeder`
- `LocationSeeder`
- `ServiceSeeder`
- `FaqSeeder`

---

## 7) Services and Controllers Added

API controllers in `backend/app/Http/Controllers/Api/V1`:
- `AuthController`
- `PropertyController`
- `DocumentController`
- `OrderController`
- `StripeWebhookController`
- `TicketController`
- `ConsultantTicketController`
- `CalendlyWebhookController`

Backend services in `backend/app/Services`:
- `PropertyCompletionService`
- `StripeService`
- `OrderFulfillmentService`
- `CalendlyWebhookService`

---

## 8) Test Inventory and Validation History

Test files present:
- `Tests\\Unit\\ExampleTest`
- `Tests\\Feature\\ExampleTest`
- `Tests\\Feature\\OrderApiTest`
- `Tests\\Feature\\StripeWebhookTest`
- `Tests\\Feature\\TicketApiTest`
- `Tests\\Feature\\ConsultantTicketApiTest`
- `Tests\\Feature\\CalendlyWebhookTest`

Final Phase 4 validation evidence (latest recorded run):
- Backend: `23 passed (104 assertions)`
- Includes explicit passing checks for:
  - consultant metrics/workload
  - scheduling-link generation
  - comment attachments (customer + consultant)
  - notification creation hooks

Frontend validation evidence (latest recorded runs):
- `npx tsc --noEmit` pass
- `npm run lint` pass (no warnings/errors)
- `npm run build` pass (all routes generated successfully)

---

## 9) Issues Encountered and Fixes Applied

Notable implementation incidents and fixes:
- Zod/RHF typing mismatch in property add form (Phase 2B) -> patched schema/typing integration
- Progress component prop mismatch (`indicatorClassName`) -> corrected usage
- Customer was seeing internal comments -> fixed visibility filtering (`7df0ba6`)
- SQLite bulk insert mismatch in consultant profile test -> fixed row parity (`ebba334`)
- Shell execution context confusion (`git` run from `~`) -> corrected by entering repo path
- Intermittent `.next` build cache/export folder conflict in local sandbox -> resolved by isolating old `.next` directory and rebuilding

---

## 10) GitHub Workflow Closure Actions (Phase 4)

Tracking artifacts:
- Issue: `#1` (`Phase 4 progress tracking: consultant workflow & ticketing`)
- PR: `#2` (`Phase 4: consultant workspace APIs + Calendly webhook flow`)

Recorded closure actions:
- PR merged with branch deletion:
  - `gh pr merge 2 -R mshadmanrahman/wisebox --merge --delete-branch`
- Issue closed with validation comment:
  - `gh issue close 1 -R mshadmanrahman/wisebox --comment "Phase 4 is complete and validated (23 tests, 104 assertions)."`

---

## 11) Complete Commit Ledger (Phase 0 Through Phase 4)

Columns:
- `Commit`: short SHA
- `Date`: commit date
- `Files`: number of changed files in commit
- `Message`: commit subject

| Commit | Date | Files | Message |
|---|---|---:|---|
| `5b0662e` | 2026-02-09 | 3 | Phase 0.1-0.2: Initialize monorepo structure and documentation |
| `072965e` | 2026-02-09 | 4 | Phase 0.3: Docker Compose setup (PHP 8.3, Nginx, MySQL 8, Redis 7) |
| `3446401` | 2026-02-09 | 28 | Phase 0.4: Initialize Next.js 14 frontend with TypeScript, Tailwind, and dependencies |
| `04f29cb` | 2026-02-09 | 2 | Add project bible and implementation plan reference docs |
| `40103fc` | 2026-02-09 | 88 | Phase 0.8: Frontend design system, TypeScript types, API client, auth store |
| `556b7f0` | 2026-02-09 | 25 | Phase 0.6: Create all database migrations (25 tables) |
| `5a22812` | 2026-02-09 | 8 | Phase 0.7: Database seeders (property types, ownership, documents, services, locations, FAQs) |
| `e71d1c9` | 2026-02-09 | 2 | Phase 0.9: Verification fixes (PHP 8.4, libicu-dev, .env config, ESLint) |
| `9af707b` | 2026-02-09 | 1 | Update BUILD-LOG: Phase 0 complete |
| `927c6c4` | 2026-02-09 | 5 | Phase 1A: Backend auth - User model, AuthController, API routes, public endpoints |
| `e30cdad` | 2026-02-09 | 8 | Phase 1B: Frontend auth - Login, register (5-step), forgot password, route middleware |
| `3bdf0e8` | 2026-02-09 | 12 | Phase 2A: Property models, CRUD controller, completion scoring service, API routes |
| `047da66` | 2026-02-09 | 11 | Phase 2C: Document management, all domain models, DocumentController, document API routes |
| `0f1e807` | 2026-02-10 | 16 | feat(frontend): implement property management phase 2b |
| `d994bad` | 2026-02-10 | 13 | feat(phase3): add orders flow and stripe checkout integration |
| `096679e` | 2026-02-10 | 12 | feat(phase4): add ticket workflow api/ui and payment feature tests |
| `e0bf094` | 2026-02-10 | 1 | chore(docker): remove obsolete compose version field |
| `2ad8a79` | 2026-02-10 | 7 | feat(phase4): add consultant assignment and role-aware ticket controls |
| `7df0ba6` | 2026-02-10 | 1 | fix(tickets): enforce customer-safe comment filtering in show response |
| `1a32681` | 2026-02-10 | 12 | feat(phase4): add consultant workspace APIs and calendly webhook flow |
| `4a088ff` | 2026-02-10 | 3 | docs: add detailed execution journal for phases 2b-4 |
| `3c9e4e7` | 2026-02-10 | 4 | docs: add full execution journal and github ops templates |
| `3b8deea` | 2026-02-10 | 12 | feat(phase4): add consultant workload metrics and scheduling link flow |
| `ebba334` | 2026-02-10 | 1 | test(phase4): fix consultant profile bulk insert for sqlite |
| `0756ca8` | 2026-02-10 | 9 | feat(phase4): complete notifications and ticket comment attachments |
| `7a2003d` | 2026-02-10 | 0 | Merge pull request #2 from mshadmanrahman/phase4-consultant-workspace-calendly |

---

## 12) Per-Commit Changed File Appendix

This appendix lists file paths touched in each commit, in chronological order.

### `5b0662e` (2026-02-09)

**Message:** Phase 0.1-0.2: Initialize monorepo structure and documentation

**Files changed:**
- `.gitignore`
- `BUILD-LOG.md`
- `README.md`

### `072965e` (2026-02-09)

**Message:** Phase 0.3: Docker Compose setup (PHP 8.3, Nginx, MySQL 8, Redis 7)

**Files changed:**
- `docker-compose.yml`
- `docker/nginx/default.conf`
- `docker/php/Dockerfile`
- `docker/php/php.ini`

### `3446401` (2026-02-09)

**Message:** Phase 0.4: Initialize Next.js 14 frontend with TypeScript, Tailwind, and dependencies

**Files changed:**
- `frontend/.env.local.example`
- `frontend/.eslintrc.json`
- `frontend/.gitignore`
- `frontend/README.md`
- `frontend/next.config.mjs`
- `frontend/package-lock.json`
- `frontend/package.json`
- `frontend/postcss.config.mjs`
- `frontend/src/app/favicon.ico`
- `frontend/src/app/fonts/GeistMonoVF.woff`
- `frontend/src/app/fonts/GeistVF.woff`
- `frontend/src/app/globals.css`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/auth/.gitkeep`
- `frontend/src/components/dashboard/.gitkeep`
- `frontend/src/components/forms/.gitkeep`
- `frontend/src/components/layout/.gitkeep`
- `frontend/src/components/marketing/.gitkeep`
- `frontend/src/components/property/.gitkeep`
- `frontend/src/components/ui/.gitkeep`
- `frontend/src/hooks/.gitkeep`
- `frontend/src/lib/.gitkeep`
- `frontend/src/stores/.gitkeep`
- `frontend/src/styles/.gitkeep`
- `frontend/src/types/.gitkeep`
- `frontend/tailwind.config.ts`
- `frontend/tsconfig.json`

### `04f29cb` (2026-02-09)

**Message:** Add project bible and implementation plan reference docs

**Files changed:**
- `WISEBOX-IMPLEMENTATION-PLAN.md`
- `WISEBOX-PROJECT-BIBLE.md`

### `40103fc` (2026-02-09)

**Message:** Phase 0.8: Frontend design system, TypeScript types, API client, auth store

**Files changed:**
- `backend/.editorconfig`
- `backend/.env.example`
- `backend/.gitattributes`
- `backend/.gitignore`
- `backend/README.md`
- `backend/app/Http/Controllers/Controller.php`
- `backend/app/Models/User.php`
- `backend/app/Providers/AppServiceProvider.php`
- `backend/artisan`
- `backend/bootstrap/app.php`
- `backend/bootstrap/cache/.gitignore`
- `backend/bootstrap/providers.php`
- `backend/composer.json`
- `backend/composer.lock`
- `backend/config/app.php`
- `backend/config/auth.php`
- `backend/config/cache.php`
- `backend/config/cors.php`
- `backend/config/database.php`
- `backend/config/filesystems.php`
- `backend/config/logging.php`
- `backend/config/mail.php`
- `backend/config/queue.php`
- `backend/config/services.php`
- `backend/config/session.php`
- `backend/database/.gitignore`
- `backend/database/factories/UserFactory.php`
- `backend/database/migrations/0001_01_01_000000_create_users_table.php`
- `backend/database/migrations/0001_01_01_000001_create_cache_table.php`
- `backend/database/migrations/0001_01_01_000002_create_jobs_table.php`
- `backend/database/seeders/DatabaseSeeder.php`
- `backend/package.json`
- `backend/phpunit.xml`
- `backend/public/.htaccess`
- `backend/public/favicon.ico`
- `backend/public/index.php`
- `backend/public/robots.txt`
- `backend/resources/css/app.css`
- `backend/resources/js/app.js`
- `backend/resources/js/bootstrap.js`
- `backend/resources/views/welcome.blade.php`
- `backend/routes/api.php`
- `backend/routes/console.php`
- `backend/routes/web.php`
- `backend/storage/app/.gitignore`
- `backend/storage/app/private/.gitignore`
- `backend/storage/app/public/.gitignore`
- `backend/storage/framework/.gitignore`
- `backend/storage/framework/cache/.gitignore`
- `backend/storage/framework/cache/data/.gitignore`
- `backend/storage/framework/sessions/.gitignore`
- `backend/storage/framework/testing/.gitignore`
- `backend/storage/framework/views/.gitignore`
- `backend/storage/logs/.gitignore`
- `backend/tests/Feature/ExampleTest.php`
- `backend/tests/TestCase.php`
- `backend/tests/Unit/ExampleTest.php`
- `backend/vite.config.js`
- `frontend/components.json`
- `frontend/package-lock.json`
- `frontend/package.json`
- `frontend/src/app/globals.css`
- `frontend/src/components/providers.tsx`
- `frontend/src/components/ui/accordion.tsx`
- `frontend/src/components/ui/avatar.tsx`
- `frontend/src/components/ui/badge.tsx`
- `frontend/src/components/ui/button.tsx`
- `frontend/src/components/ui/card.tsx`
- `frontend/src/components/ui/dialog.tsx`
- `frontend/src/components/ui/dropdown-menu.tsx`
- `frontend/src/components/ui/input.tsx`
- `frontend/src/components/ui/label.tsx`
- `frontend/src/components/ui/progress.tsx`
- `frontend/src/components/ui/scroll-area.tsx`
- `frontend/src/components/ui/select.tsx`
- `frontend/src/components/ui/separator.tsx`
- `frontend/src/components/ui/sheet.tsx`
- `frontend/src/components/ui/tabs.tsx`
- `frontend/src/components/ui/textarea.tsx`
- `frontend/src/components/ui/toast.tsx`
- `frontend/src/components/ui/toaster.tsx`
- `frontend/src/hooks/use-toast.ts`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/query-client.ts`
- `frontend/src/lib/utils.ts`
- `frontend/src/stores/auth.ts`
- `frontend/src/types/index.ts`
- `frontend/tailwind.config.ts`

### `556b7f0` (2026-02-09)

**Message:** Phase 0.6: Create all database migrations (25 tables)

**Files changed:**
- `backend/database/migrations/0001_01_01_000000_create_users_table.php`
- `backend/database/migrations/2026_02_09_000001_create_user_profiles_table.php`
- `backend/database/migrations/2026_02_09_000002_create_consultant_profiles_table.php`
- `backend/database/migrations/2026_02_09_000003_create_property_types_table.php`
- `backend/database/migrations/2026_02_09_000004_create_ownership_statuses_table.php`
- `backend/database/migrations/2026_02_09_000005_create_ownership_types_table.php`
- `backend/database/migrations/2026_02_09_000006_create_document_types_table.php`
- `backend/database/migrations/2026_02_09_000007_create_divisions_table.php`
- `backend/database/migrations/2026_02_09_000008_create_districts_table.php`
- `backend/database/migrations/2026_02_09_000009_create_upazilas_table.php`
- `backend/database/migrations/2026_02_09_000010_create_mouzas_table.php`
- `backend/database/migrations/2026_02_09_000011_create_service_categories_table.php`
- `backend/database/migrations/2026_02_09_000012_create_services_table.php`
- `backend/database/migrations/2026_02_09_000013_create_properties_table.php`
- `backend/database/migrations/2026_02_09_000014_create_co_owners_table.php`
- `backend/database/migrations/2026_02_09_000015_create_property_documents_table.php`
- `backend/database/migrations/2026_02_09_000016_create_orders_table.php`
- `backend/database/migrations/2026_02_09_000017_create_order_items_table.php`
- `backend/database/migrations/2026_02_09_000018_create_tickets_table.php`
- `backend/database/migrations/2026_02_09_000019_create_sliders_table.php`
- `backend/database/migrations/2026_02_09_000020_create_faqs_table.php`
- `backend/database/migrations/2026_02_09_000021_create_ticket_comments_table.php`
- `backend/database/migrations/2026_02_09_000022_create_property_assessments_table.php`
- `backend/database/migrations/2026_02_09_000023_create_notifications_table.php`
- `backend/database/migrations/2026_02_09_000024_create_activity_log_table.php`

### `5a22812` (2026-02-09)

**Message:** Phase 0.7: Database seeders (property types, ownership, documents, services, locations, FAQs)

**Files changed:**
- `backend/database/seeders/DatabaseSeeder.php`
- `backend/database/seeders/DocumentTypeSeeder.php`
- `backend/database/seeders/FaqSeeder.php`
- `backend/database/seeders/LocationSeeder.php`
- `backend/database/seeders/OwnershipStatusSeeder.php`
- `backend/database/seeders/OwnershipTypeSeeder.php`
- `backend/database/seeders/PropertyTypeSeeder.php`
- `backend/database/seeders/ServiceSeeder.php`

### `e71d1c9` (2026-02-09)

**Message:** Phase 0.9: Verification fixes (PHP 8.4, libicu-dev, .env config, ESLint)

**Files changed:**
- `docker/php/Dockerfile`
- `frontend/src/hooks/use-toast.ts`

### `9af707b` (2026-02-09)

**Message:** Update BUILD-LOG: Phase 0 complete

**Files changed:**
- `BUILD-LOG.md`

### `927c6c4` (2026-02-09)

**Message:** Phase 1A: Backend auth - User model, AuthController, API routes, public endpoints

**Files changed:**
- `backend/app/Http/Controllers/Api/V1/AuthController.php`
- `backend/app/Models/ConsultantProfile.php`
- `backend/app/Models/User.php`
- `backend/app/Models/UserProfile.php`
- `backend/routes/api.php`

### `e30cdad` (2026-02-09)

**Message:** Phase 1B: Frontend auth - Login, register (5-step), forgot password, route middleware

**Files changed:**
- `frontend/src/app/(auth)/forgot-password/page.tsx`
- `frontend/src/app/(auth)/layout.tsx`
- `frontend/src/app/(auth)/login/page.tsx`
- `frontend/src/app/(auth)/register/page.tsx`
- `frontend/src/app/(portal)/dashboard/page.tsx`
- `frontend/src/app/(portal)/layout.tsx`
- `frontend/src/middleware.ts`
- `frontend/src/stores/auth.ts`

### `3bdf0e8` (2026-02-09)

**Message:** Phase 2A: Property models, CRUD controller, completion scoring service, API routes

**Files changed:**
- `backend/app/Http/Controllers/Api/V1/PropertyController.php`
- `backend/app/Models/CoOwner.php`
- `backend/app/Models/District.php`
- `backend/app/Models/Division.php`
- `backend/app/Models/Mouza.php`
- `backend/app/Models/OwnershipStatus.php`
- `backend/app/Models/OwnershipType.php`
- `backend/app/Models/Property.php`
- `backend/app/Models/PropertyType.php`
- `backend/app/Models/Upazila.php`
- `backend/app/Services/PropertyCompletionService.php`
- `backend/routes/api.php`

### `047da66` (2026-02-09)

**Message:** Phase 2C: Document management, all domain models, DocumentController, document API routes

**Files changed:**
- `backend/app/Http/Controllers/Api/V1/DocumentController.php`
- `backend/app/Models/DocumentType.php`
- `backend/app/Models/Order.php`
- `backend/app/Models/OrderItem.php`
- `backend/app/Models/PropertyAssessment.php`
- `backend/app/Models/PropertyDocument.php`
- `backend/app/Models/Service.php`
- `backend/app/Models/ServiceCategory.php`
- `backend/app/Models/Ticket.php`
- `backend/app/Models/TicketComment.php`
- `backend/routes/api.php`

### `0f1e807` (2026-02-10)

**Message:** feat(frontend): implement property management phase 2b

**Files changed:**
- `frontend/src/app/(portal)/layout.tsx`
- `frontend/src/app/(portal)/properties/[id]/edit/page.tsx`
- `frontend/src/app/(portal)/properties/[id]/page.tsx`
- `frontend/src/app/(portal)/properties/new/page.tsx`
- `frontend/src/app/(portal)/properties/page.tsx`
- `frontend/src/components/property/assessment-section.tsx`
- `frontend/src/components/property/co-owner-fields.tsx`
- `frontend/src/components/property/document-status-list.tsx`
- `frontend/src/components/property/document-upload-item.tsx`
- `frontend/src/components/property/location-cascade.tsx`
- `frontend/src/components/property/property-card.tsx`
- `frontend/src/components/property/property-overview.tsx`
- `frontend/src/hooks/use-documents.ts`
- `frontend/src/hooks/use-locations.ts`
- `frontend/src/hooks/use-properties.ts`
- `frontend/src/hooks/use-reference-data.ts`

### `d994bad` (2026-02-10)

**Message:** feat(phase3): add orders flow and stripe checkout integration

**Files changed:**
- `backend/app/Http/Controllers/Api/V1/OrderController.php`
- `backend/app/Http/Controllers/Api/V1/StripeWebhookController.php`
- `backend/app/Services/OrderFulfillmentService.php`
- `backend/app/Services/StripeService.php`
- `backend/config/services.php`
- `backend/routes/api.php`
- `frontend/src/app/(portal)/layout.tsx`
- `frontend/src/app/(portal)/orders/[id]/confirmation/page.tsx`
- `frontend/src/app/(portal)/orders/[id]/page.tsx`
- `frontend/src/app/(portal)/orders/page.tsx`
- `frontend/src/app/(portal)/services/page.tsx`
- `frontend/src/app/(portal)/tickets/page.tsx`
- `frontend/src/middleware.ts`

### `096679e` (2026-02-10)

**Message:** feat(phase4): add ticket workflow api/ui and payment feature tests

**Files changed:**
- `BUILD-LOG.md`
- `README.md`
- `backend/app/Http/Controllers/Api/V1/OrderController.php`
- `backend/app/Http/Controllers/Api/V1/TicketController.php`
- `backend/app/Models/Ticket.php`
- `backend/routes/api.php`
- `backend/tests/Feature/OrderApiTest.php`
- `backend/tests/Feature/StripeWebhookTest.php`
- `backend/tests/Feature/TicketApiTest.php`
- `docs/stripe-local-testing.md`
- `frontend/src/app/(portal)/tickets/[id]/page.tsx`
- `frontend/src/app/(portal)/tickets/page.tsx`

### `e0bf094` (2026-02-10)

**Message:** chore(docker): remove obsolete compose version field

**Files changed:**
- `docker-compose.yml`

### `2ad8a79` (2026-02-10)

**Message:** feat(phase4): add consultant assignment and role-aware ticket controls

**Files changed:**
- `BUILD-LOG.md`
- `backend/app/Http/Controllers/Api/V1/TicketController.php`
- `backend/routes/api.php`
- `backend/tests/Feature/TicketApiTest.php`
- `frontend/src/app/(portal)/tickets/[id]/page.tsx`
- `frontend/src/app/(portal)/tickets/page.tsx`
- `frontend/src/types/index.ts`

### `7df0ba6` (2026-02-10)

**Message:** fix(tickets): enforce customer-safe comment filtering in show response

**Files changed:**
- `backend/app/Http/Controllers/Api/V1/TicketController.php`

### `1a32681` (2026-02-10)

**Message:** feat(phase4): add consultant workspace APIs and calendly webhook flow

**Files changed:**
- `BUILD-LOG.md`
- `backend/app/Http/Controllers/Api/V1/CalendlyWebhookController.php`
- `backend/app/Http/Controllers/Api/V1/ConsultantTicketController.php`
- `backend/app/Services/CalendlyWebhookService.php`
- `backend/config/services.php`
- `backend/routes/api.php`
- `backend/tests/Feature/CalendlyWebhookTest.php`
- `backend/tests/Feature/ConsultantTicketApiTest.php`
- `frontend/src/app/(portal)/consultant/tickets/[id]/page.tsx`
- `frontend/src/app/(portal)/consultant/tickets/page.tsx`
- `frontend/src/app/(portal)/layout.tsx`
- `frontend/src/middleware.ts`

### `4a088ff` (2026-02-10)

**Message:** docs: add detailed execution journal for phases 2b-4

**Files changed:**
- `BUILD-LOG.md`
- `README.md`
- `docs/execution-journal-phase2b-phase4.md`

### `3c9e4e7` (2026-02-10)

**Message:** docs: add full execution journal and github ops templates

**Files changed:**
- `README.md`
- `docs/github/phase4-progress-issue.md`
- `docs/github/pr-phase4-consultant-workspace.md`
- `docs/github/remote-ops-runbook.md`

### `3b8deea` (2026-02-10)

**Message:** feat(phase4): add consultant workload metrics and scheduling link flow

**Files changed:**
- `BUILD-LOG.md`
- `backend/.env.example`
- `backend/app/Http/Controllers/Api/V1/ConsultantTicketController.php`
- `backend/app/Http/Controllers/Api/V1/TicketController.php`
- `backend/config/services.php`
- `backend/routes/api.php`
- `backend/tests/Feature/ConsultantTicketApiTest.php`
- `backend/tests/Feature/TicketApiTest.php`
- `docs/execution-journal-phase2b-phase4.md`
- `docs/github/phase4-progress-issue.md`
- `frontend/src/app/(portal)/consultant/tickets/page.tsx`
- `frontend/src/app/(portal)/tickets/[id]/page.tsx`

### `ebba334` (2026-02-10)

**Message:** test(phase4): fix consultant profile bulk insert for sqlite

**Files changed:**
- `backend/tests/Feature/ConsultantTicketApiTest.php`

### `0756ca8` (2026-02-10)

**Message:** feat(phase4): complete notifications and ticket comment attachments

**Files changed:**
- `BUILD-LOG.md`
- `backend/app/Http/Controllers/Api/V1/ConsultantTicketController.php`
- `backend/app/Http/Controllers/Api/V1/TicketController.php`
- `backend/tests/Feature/ConsultantTicketApiTest.php`
- `backend/tests/Feature/TicketApiTest.php`
- `docs/execution-journal-phase2b-phase4.md`
- `docs/github/phase4-progress-issue.md`
- `frontend/src/app/(portal)/consultant/tickets/[id]/page.tsx`
- `frontend/src/app/(portal)/tickets/[id]/page.tsx`

### `7a2003d` (2026-02-10)

**Message:** Merge pull request #2 from mshadmanrahman/phase4-consultant-workspace-calendly

**Files changed:**
- none (merge commit; tree matches merged head)
