---
tags:
  - VibeCoding
  - VibeCoding/Hobby
  - Wisebox
---

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

- **Docker Desktop** (latest) with Docker Compose
- **Node.js 22 LTS** (via nvm recommended)
- **npm 10+**
- **Playwright** (for E2E tests)

### Quick Start (One Command)

```bash
./scripts/dev-setup.sh
```

This script will:
1. Install dependencies (backend + frontend)
2. Copy environment files
3. Start Docker services
4. Run migrations and seeders
5. Start the frontend dev server

### Manual Setup

```bash
# 1. Use Node 22 for frontend compatibility
nvm install 22
nvm use 22

# 2. Start backend services (Laravel + MySQL + Redis)
docker compose up -d

# 3. Run database migrations and seeders
docker compose exec app php artisan migrate --seed

# 4. Clear Laravel config cache (important after env changes)
docker compose exec app php artisan config:clear

# 5. Install frontend dependencies and start dev server
cd frontend
npm install
npm run dev
```

### First-Time Setup Notes

**Backend Authentication**: This project uses **token-based authentication** (not cookie-based):
- Laravel Sanctum configured for stateless JWT tokens
- Frontend stores tokens in localStorage
- No CORS issues with cross-origin requests
- Perfect for SPA + API architecture

**Node Version**: Frontend requires **Node 22** (not 23+). If you see "Unsupported Node.js version" errors, run `nvm use 22`.

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

### Testing

**Backend Tests** (PHPUnit):
```bash
docker compose exec app php artisan test
```

**Frontend E2E Tests** (Playwright - 62 comprehensive tests):
```bash
cd frontend
source ~/.nvm/nvm.sh && nvm use 22

# Run all E2E tests (unauthenticated + authenticated + integration)
npm run test:e2e

# Run specific test suites
npx playwright test tests/unauthenticated  # 24 tests (marketing, assessment, auth)
npx playwright test tests/authenticated    # 37 tests (dashboard, properties, documents, orders, tickets)
npx playwright test tests/integration      # 1 test (full customer journey)

# Debug mode with UI
npx playwright test --ui

# Generate HTML report
npx playwright test --reporter=html
npx playwright show-report
```

**Test Coverage**:
- **Authentication**: Login, register, OTP bypass (`000000` test code), password reset
- **Dashboard**: Hero banner, CTAs, real-time updates, notifications
- **Properties**: CRUD operations, 2-step creation, status indicators (green/yellow/red)
- **Documents**: Upload, primary/secondary classification, progress tracking
- **Orders**: Service catalog, cart management, Stripe checkout (mocked)
- **Tickets**: Comments, Calendly scheduling (mocked), access control
- **Integration**: Full user journey from registration to consultation scheduling

**Validation** (Combined Backend + Frontend):
```bash
# Full validation gate
./scripts/validate.sh

# Frontend-only fast path
./scripts/validate.sh --frontend-only

# Include Playwright smoke E2E
./scripts/validate.sh --with-e2e
```

GitHub Actions runs validation on push and PR via `.github/workflows/validate.yml`.

### Deployment Helpers

```bash
# Backend deploy commands on production host
./scripts/deploy-backend.sh

# Verify Vercel production env export file
./scripts/verify-vercel-env.sh --env-file=frontend/.env.production.vercel

# Production smoke checks after deploy
APP_BASE_URL=https://mywisebox.com API_BASE_URL=https://api.mywisebox.com/api/v1 ./scripts/smoke-production.sh
```

## Architecture

### Authentication Flow

**Token-Based Authentication** (Stateless):
1. User logs in via `/api/v1/auth/login`
2. Backend generates JWT token with `wb_` prefix
3. Frontend stores token in localStorage
4. All API requests include `Authorization: Bearer {token}` header
5. No cookies, no CSRF tokens, no CORS complexity

**Benefits**:
- Works across different origins (localhost:3000 → localhost:8000)
- Mobile-friendly (no cookie restrictions)
- Simpler client code
- Easier to test

### Key Features

**UI Components** (Production-Ready):
- `RadioCardGroup`: Visual card selection for forms
- 2-Step Property Registration: Simplified user flow
- Interactive Document Checklist: "Have/Don't have" quick inventory
- Dashboard: Hero banner with auto-rotation, action CTAs
- Assessment Tool: Mobile-first large buttons (80px height)
- Color-Coded Status: Green (80%+), Yellow (50-79%), Red (<50%)

**E2E Test Suite** (102 tests):
- 62 new comprehensive tests covering all critical flows
- 40 legacy tests from earlier phases
- Hybrid testing: Real backend + mocked externals (Stripe, Calendly)
- Performance optimized: <30s per test (except integration)
- CI/CD ready with parallel execution

**OTP Bypass** (E2E Testing):
- Test code: `000000`
- Automatically bypasses SMS verification in test environments
- Enables fast E2E test execution

## Environment Variables

Copy the example files and configure:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

**Required Backend Variables**:
- `APP_KEY`: Laravel encryption key (generate with `php artisan key:generate`)
- `DB_*`: MySQL connection details
- `SANCTUM_TOKEN_PREFIX`: Token prefix (default: `wb_`)
- `REDIS_*`: Redis connection for cache and queues

**Required Frontend Variables**:
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:8000/api/v1`)

See `.env.example` files for complete configuration options.

## Troubleshooting

### Common Issues

**CORS Errors**: Should not occur with token-based auth. If you see CORS errors:
```bash
# Clear Laravel config cache
docker compose exec app php artisan config:clear
docker compose exec app php artisan config:cache

# Restart services
docker compose restart
```

**Node Version Errors**: Frontend requires Node 22:
```bash
nvm install 22
nvm use 22
cd frontend && npm install
```

**Database Connection Failed**:
```bash
# Check MySQL is running
docker compose ps

# Restart database
docker compose restart mysql

# Re-run migrations
docker compose exec app php artisan migrate:fresh --seed
```

**Frontend Won't Start**:
```bash
# Check Node version
node --version  # Should be v22.x.x

# Clear Next.js cache
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

**E2E Tests Failing**:
```bash
# Ensure backend is running
docker compose ps

# Clear test artifacts
cd frontend
npx playwright clean

# Reinstall Playwright browsers
npx playwright install

# Run tests with debug output
npx playwright test --headed --debug
```

**Admin Panel 404**: Ensure you've run seeders:
```bash
docker compose exec app php artisan migrate --seed
docker compose exec app php artisan db:seed --class=AdminUserSeeder
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

## Related
- [[Vibe Coding/_hobby/README|Hobby Projects Index]]
