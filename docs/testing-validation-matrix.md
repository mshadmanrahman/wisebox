# Wisebox Testing and Validation Matrix

Date: 2026-02-10
Owner: Engineering

## Purpose

Define the minimum validation gates for every feature slice across backend and frontend.

## Test Layers

### 1. Unit tests

- Backend: PHPUnit unit tests under `backend/tests/Unit`
- Command:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"
docker compose exec app php artisan test --testsuite=Unit
```

### 2. Functional tests

- Backend API behavior and authorization under `backend/tests/Feature`
- Command:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"
docker compose exec app php artisan test --testsuite=Feature
```

### 3. Integration tests

- Current integration coverage is implemented via Feature tests for:
  - Stripe webhook and checkout flow
  - Calendly webhook sync
  - Consultant workload and ticket assignment flows
  - OTP delivery and verification flow
- Command:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"
docker compose exec app php artisan test
```

### 4. Frontend build and static checks

- Type safety:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox/frontend"
npx tsc --noEmit
```

- Lint:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox/frontend"
npm run lint
```

- Production build:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox/frontend"
npm run build
```

### 5. E2E tests

- Tooling: Playwright smoke harness under `frontend/tests/e2e`.
- Current smoke coverage:
  - `/`
  - `/about`
  - `/faq`
  - `/contact`
  - `/services`
  - `/login`
  - `/register`
  - `/forgot-password`
  - `/assessment`
- Current authenticated workflow coverage:
  - Protected route redirect (`/dashboard` requires auth)
  - Public services CTA redirect behavior (`/services` -> `/login?redirect=%2Fworkspace%2Fservices` for unauthenticated users)
  - Login form flow to `/dashboard` (mocked API)
  - Notification center filter + pagination behaviors
  - Property detail assessment history rendering
- Dev server origin policy:
  - `frontend/next.config.mjs` includes `allowedDevOrigins` host entries for both `127.0.0.1` and `localhost`.
- Command:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox/frontend"
npm run test:e2e
```

- First-time setup (local machine):

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox/frontend"
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

## Route Surface Validation

Use route checks after backend feature additions:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"
docker compose exec app php artisan route:list | grep -E 'api/v1/(orders|tickets|consultant|consultants|notifications|assessments|webhooks/stripe|webhooks/calendly|auth/verify-otp|auth/resend-otp|auth/change-password)'
docker compose exec app php artisan route:list | grep -E 'api/v1/(dashboard/summary|properties/.*/assessment|properties/.*/assessments|notifications)'
```

## Release Gate (Required Before Push)

All commands below must pass:

1. `docker compose exec app php artisan test`
2. `cd frontend && npx tsc --noEmit`
3. `cd frontend && npm run lint`
4. `cd frontend && npm run build`

One-command shortcut:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"
./scripts/validate.sh
```

Include E2E in the same run:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"
./scripts/validate.sh --with-e2e
```

## Daily Workflow

1. Implement feature slice.
2. Add or update tests first.
3. Run full validation matrix.
4. Update docs (`BUILD-LOG.md` + slice-specific doc).
5. Commit with clear scope.
6. Push and verify branch status.

## CI Enforcement

- Workflow: `.github/workflows/validate.yml`
- Trigger: push + pull request against `main`
- CI gate command: `./scripts/validate.sh --with-e2e`
- Artifacts: Playwright report and test results are uploaded on each run.

## Phase 8 Production Smoke Gate

After each production deployment, run the checklist in:

- `docs/deployment/production-runbook.md`

Minimum required smoke checks:

1. `GET /api/v1` health endpoint responds `200`.
2. Login + protected route redirect behavior works.
3. One end-to-end service -> order -> ticket path succeeds.
4. Stripe and Calendly webhook deliveries are confirmed.

Automated baseline smoke script:

```bash
APP_BASE_URL=https://mywisebox.com \
API_BASE_URL=https://api.mywisebox.com/api/v1 \
./scripts/smoke-production.sh
```
