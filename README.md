# Wisebox

Digital property management platform for the South Asian diaspora. Manage ancestral properties, verify documents, and connect with legal experts from anywhere in the world.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 11 (PHP 8.3), Filament 3, Sanctum |
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
├── backend/          # Laravel 11 API + Filament admin
├── frontend/         # Next.js 14 (App Router) portal + marketing
├── docker/           # Docker configs (Nginx, PHP)
├── docs/             # Architecture, API, design docs
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

## Environment Variables

Copy the example files and configure:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

## Build Log

See [BUILD-LOG.md](./BUILD-LOG.md) for step-by-step documentation of every build action. This enables freeze/resume development at any point.

## Documentation

- [Implementation Plan](./WISEBOX-IMPLEMENTATION-PLAN.md)
- [Project Bible](./WISEBOX-PROJECT-BIBLE.md)
- [Stripe Local Testing](./docs/stripe-local-testing.md)
- [API Documentation](./docs/api/)
- [Architecture](./docs/architecture/)
