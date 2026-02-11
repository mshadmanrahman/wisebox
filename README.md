# Wisebox

Digital property management platform for the South Asian diaspora. Manage ancestral properties, verify documents, and connect with legal experts from anywhere in the world.

## Tech Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Backend          | Laravel 12 (PHP 8.4 in Docker), Filament 4, Sanctum |
| Frontend         | Next.js 14 (TypeScript), Tailwind CSS, shadcn/ui    |
| Database         | MySQL 8                                             |
| Cache/Queue      | Redis 7                                             |
| Payments         | Stripe                                              |
| Scheduling       | Calendly API                                        |
| File Storage     | AWS S3                                              |
| Frontend Hosting | Vercel                                              |
| Backend Hosting  | AWS EC2 / Laravel Forge                             |

## Project Structure

```
wisebox/
├── backend/          # Laravel 12 API + Filament admin
├── frontend/         # Next.js 14 (App Router) portal + marketing
├── docker/           # Docker configs (Nginx, PHP)
├── docs/             # Architecture, API, design docs
├── scripts/          # Validation and automation scripts
├── .github/          # CI/CD workflows
├── docker-compose.yml
└── BUILD-LOG.md      # Step-by-step build documentation
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- nvm (recommended) + Node.js 22 LTS
- npm 10+

### Development Setup

```bash
# 0. From repo root
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"

# 1. Use the supported Node runtime for Next.js 14
nvm install 22
nvm use 22

# 2. Start backend services (Laravel + MySQL + Redis)
docker compose up -d

# 3. Run database migrations and seeders
docker compose exec app php artisan migrate --seed

# 4. Start frontend dev server
cd frontend
npm install
npm run dev
```

### URLs

| Service | URL |
|---------|-----|
| Frontend (marketing + auth pages) | http://localhost:3000 |
| Frontend portal (after login) | http://localhost:3000/dashboard |
| Backend API | http://localhost:8000/api/v1 |
| Admin Panel | http://localhost:8000/admin |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

If `npm run dev` fails with a Node version message, run `nvm use 22` and retry.

### Local Admin Login

After `docker compose up -d` and `php artisan migrate --seed`, a local admin user is auto-seeded:

- URL: `http://localhost:8000/admin/login`
- Email: `admin@wisebox.local`
- Password: `Admin123!`

You can override these in `backend/.env` with `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`, then run:

```bash
docker compose exec app php artisan db:seed --class=AdminUserSeeder
```

### Validation

```bash
# Full backend + frontend validation gate
./scripts/validate.sh

# Frontend-only fast path
./scripts/validate.sh --frontend-only

# Include Playwright smoke E2E
./scripts/validate.sh --with-e2e
```

GitHub Actions runs the same command on push and PR via `.github/workflows/validate.yml`.

### Deployment Helpers

```bash
# Backend deploy commands on production host
./scripts/deploy-backend.sh

# Verify Vercel production env export file
./scripts/verify-vercel-env.sh --env-file=frontend/.env.production.vercel

# Production smoke checks after deploy
APP_BASE_URL=https://mywisebox.com API_BASE_URL=https://api.mywisebox.com/api/v1 ./scripts/smoke-production.sh
```

## Environment Variables

Copy the example files and configure:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

## Build Log

See [BUILD-LOG.md](./BUILD-LOG.md) for step-by-step documentation of every build action. This enables freeze/resume development at any point.
For a full chronological execution breakdown (Phase 2B through Phase 4), see [Execution Journal](./docs/execution-journal-phase2b-phase4.md).
For the complete end-to-end dossier covering every commit and artifact from Phase 0 through Phase 4, see [Exhaustive Build Dossier](./docs/phase0-to-phase4-exhaustive-log.md).

## Documentation

- [Implementation Plan](./WISEBOX-IMPLEMENTATION-PLAN.md)
- [Project Bible](./WISEBOX-PROJECT-BIBLE.md)
- [Execution Journal (Phase 2B-4)](./docs/execution-journal-phase2b-phase4.md)
- [Exhaustive Build Dossier (Phase 0-4)](./docs/phase0-to-phase4-exhaustive-log.md)
- [Phase 5 Kickoff (OTP + Notifications)](./docs/phase5-kickoff-otp-notifications.md)
- [Phase 6 Dashboard & Assessment](./docs/phase6-dashboard-assessment.md)
- [Phase 7 Marketing Kickoff](./docs/phase7-kickoff-marketing-site.md)
- [Phase 8 Deployment Kickoff](./docs/phase8-kickoff-deployment.md)
- [Phase 9 Local-First Kickoff](./docs/phase9-kickoff-local-first.md)
- [Phase 9 Slice 1: Government Adapter Readiness](./docs/phase9-slice1-government-adapter.md)
- [Phase 9 Slice 2: Service Catalog API](./docs/phase9-slice2-service-catalog-api.md)
- [Phase 9 Slice 3: Orders and Tickets Edge Hardening](./docs/phase9-slice3-orders-tickets-edge-hardening.md)
- [Phase 9 Slice 4: Authenticated E2E Expansion](./docs/phase9-slice4-authenticated-e2e-expansion.md)
- [Phase 9 Slice 5: Mutation and Empty-State E2E](./docs/phase9-slice5-mutation-and-empty-state-e2e.md)
- [Phase 9 Slice 6: Negative-Path and Role-Boundary E2E](./docs/phase9-slice6-negative-path-and-role-boundary-e2e.md)
- [Phase 9 Slice 7: UI Resilience and Retry Recovery](./docs/phase9-slice7-ui-resilience-retry-recovery.md)
- [Phase 9 Slice 8: Dashboard and Notification Caching](./docs/phase9-slice8-dashboard-notification-caching.md)
- [Phase 9 Slice 9: Service Workspace Discovery](./docs/phase9-slice9-service-workspace-discovery.md)
- [Phase 9 Slice 10: Service Catalog Sorting](./docs/phase9-slice10-service-catalog-sorting.md)
- [Phase 9 Slice 11: Local QA Hardening](./docs/phase9-slice11-local-qa-hardening.md)
- [Progress Summary (Phase 1-9)](./docs/progress-summary-phase1-9.md)
- [Production Deployment Runbook](./docs/deployment/production-runbook.md)
- [Forge Production Checklist](./docs/deployment/forge-production-checklist.md)
- [Forge UI Paste Blocks](./docs/deployment/forge-ui-paste-blocks.md)
- [Phase 8 Execution Tracker](./docs/deployment/phase8-execution-tracker.md)
- [Production Environment Matrix](./docs/deployment/env-matrix.md)
- [Testing & Validation Matrix](./docs/testing-validation-matrix.md)
- [Stripe Local Testing](./docs/stripe-local-testing.md)
- [GitHub Remote Ops Runbook](./docs/github/remote-ops-runbook.md)
- [API Documentation](./docs/api/)
- [Architecture](./docs/architecture/)
