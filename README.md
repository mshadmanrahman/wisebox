# Wisebox

Digital property management platform for the South Asian diaspora. Manage ancestral properties, verify documents, and connect with legal experts from anywhere in the world.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12 (PHP 8.4 in Docker), Filament 4, Sanctum |
| Frontend | Next.js 14 (TypeScript), Tailwind CSS, shadcn/ui |
| Database | MySQL 8 |
| Cache/Queue | Redis 7 |
| Payments | Stripe |
| Scheduling | Calendly API |
| File Storage | AWS S3 |
| Frontend Hosting | Vercel |
| Backend Hosting | AWS EC2 / Laravel Forge |

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
- Node.js 18+ (v24 recommended)
- npm 9+

### Development Setup

```bash
# 1. Start backend services (Laravel + MySQL + Redis)
docker compose up -d

# 2. Run database migrations and seeders
docker compose exec app php artisan migrate --seed

# 3. Start frontend dev server
cd frontend
npm install
npm run dev
```

### URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/v1 |
| Admin Panel | http://localhost:8000/admin |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

### Validation

```bash
# Full backend + frontend validation gate
./scripts/validate.sh

# Frontend-only fast path
./scripts/validate.sh --frontend-only

# Include Playwright smoke E2E
./scripts/validate.sh --with-e2e
```

## Environment Variables

Copy the example files and configure:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

## Build Log

See [BUILD-LOG.md](./BUILD-LOG.md) for step-by-step documentation of every build action. This enables freeze/resume development at any point.
For a full chronological execution breakdown (Phase 2B through current Phase 4), see [Execution Journal](./docs/execution-journal-phase2b-phase4.md).
For the complete end-to-end dossier covering every commit and artifact from Phase 0 through Phase 4, see [Exhaustive Build Dossier](./docs/phase0-to-phase4-exhaustive-log.md).

## Documentation

- [Implementation Plan](./WISEBOX-IMPLEMENTATION-PLAN.md)
- [Project Bible](./WISEBOX-PROJECT-BIBLE.md)
- [Execution Journal (Phase 2B-4)](./docs/execution-journal-phase2b-phase4.md)
- [Exhaustive Build Dossier (Phase 0-4)](./docs/phase0-to-phase4-exhaustive-log.md)
- [Phase 5 Kickoff (OTP + Notifications)](./docs/phase5-kickoff-otp-notifications.md)
- [Testing & Validation Matrix](./docs/testing-validation-matrix.md)
- [Stripe Local Testing](./docs/stripe-local-testing.md)
- [GitHub Remote Ops Runbook](./docs/github/remote-ops-runbook.md)
- [API Documentation](./docs/api/)
- [Architecture](./docs/architecture/)
