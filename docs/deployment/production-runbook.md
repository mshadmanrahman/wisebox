# Production Deployment Runbook

Date: 2026-02-10

This runbook is the operational path for deploying Wisebox production safely.

Preferred backend target:
- Laravel Forge path: `docs/deployment/forge-production-checklist.md`
- Forge UI paste blocks: `docs/deployment/forge-ui-paste-blocks.md`

## 0) Preflight (required before every release)

1. Ensure `main` is green locally:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"
./scripts/validate.sh --with-e2e
```

2. Confirm latest commit is on remote:

```bash
git checkout main
git pull --ff-only
git push origin main
```

3. Confirm env matrix values are complete:
- See `docs/deployment/env-matrix.md`.
- Verify frontend production env export:

```bash
./scripts/verify-vercel-env.sh --env-file=frontend/.env.production.vercel
```

## 1) Backend deployment (EC2/Forge)

1. SSH into backend host.
2. Deploy application code to target release path.
3. Install/optimize dependencies:

```bash
composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

4. Restart queue workers and php-fpm/nginx if needed.
5. Verify scheduler is active (`* * * * * php artisan schedule:run`).
6. Optional helper script for repeatable deploy step execution:

```bash
./scripts/deploy-backend.sh
```

## 2) Frontend deployment (Vercel)

1. Verify Vercel project is linked to `main` branch.
2. Confirm Vercel env vars match `docs/deployment/env-matrix.md`.
3. Trigger production deployment from Vercel dashboard (or git push to `main`).
4. Wait for deployment health checks to pass.

## 3) Domain and TLS verification

Required hostnames:
- `mywisebox.com` -> Vercel
- `api.mywisebox.com` -> backend host/load balancer
- `admin.mywisebox.com` -> backend admin host

Checks:
1. DNS records resolve correctly.
2. TLS certs are valid (no browser warnings).
3. HSTS and HTTPS redirects enabled.

## 4) Webhook and integration verification

### Stripe

1. Configure production endpoint:
- `https://api.mywisebox.com/api/v1/webhooks/stripe`
2. Enable required events:
- `checkout.session.completed`
- `payment_intent.payment_failed`
- `charge.refunded`
3. Save webhook secret to `STRIPE_WEBHOOK_SECRET`.

### Calendly

1. Configure production endpoint:
- `https://api.mywisebox.com/api/v1/webhooks/calendly`
2. Save signing secret to `CALENDLY_WEBHOOK_SECRET`.
3. Validate event delivery in Calendly logs.

## 5) Production smoke test checklist

Run scripted smoke checks:

```bash
APP_BASE_URL=https://mywisebox.com \
API_BASE_URL=https://api.mywisebox.com/api/v1 \
./scripts/smoke-production.sh
```

### API and auth

- `GET https://api.mywisebox.com/api/v1` returns `{ "status": "ok" }`.
- Login + OTP path works.
- Protected endpoints reject unauthenticated requests.

### Core business workflows

- Property create/update/detail works.
- Services flow reachable at `/services`; authenticated workspace at `/workspace/services`.
- Order checkout flow works end-to-end.
- Ticket creation/commenting works.
- Dashboard summary + notifications load.

### Async and integrations

- Queue processes notification jobs.
- Stripe webhook updates order state.
- Calendly webhook updates ticket scheduling fields.

## 6) Rollback plan

1. Backend:
- Roll back to previous release directory/tag.
- Re-run cache warmup commands.
- Restart queue workers.

2. Frontend:
- Promote previous healthy Vercel deployment.

3. Data rollback:
- Avoid down-migrations in production unless incident policy explicitly requires it.
- Use DB snapshot restore for critical data incidents.

4. Incident logging:
- Record incident timeline, failing step, and remediation in ops notes before next deploy.
