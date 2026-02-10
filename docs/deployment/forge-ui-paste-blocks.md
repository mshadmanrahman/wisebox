# Forge UI Paste Blocks (Wisebox)

Date: 2026-02-10

Use these exact values in Laravel Forge for the Wisebox backend deployment path.

## 1) Site settings (Forge -> Sites -> api.mywisebox.com)

- Domain: `api.mywisebox.com`
- Branch: `main`
- Repository: `mshadmanrahman/wisebox`
- Web directory: `backend/public`
- Project path on server: `/home/forge/api.mywisebox.com`
- Laravel app path: `/home/forge/api.mywisebox.com/backend`

## 2) Deploy Script (Forge -> Sites -> Deploy Script)

```bash
cd /home/forge/api.mywisebox.com/backend

composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear || true

php artisan migrate --force

php artisan config:cache
php artisan route:cache
php artisan view:cache

php artisan queue:restart || true
```

## 3) Queue Daemon (Forge -> Daemons)

Name suggestion: `wisebox-queue-default`

Command:

```bash
cd /home/forge/api.mywisebox.com/backend && php artisan queue:work redis --queue=default --sleep=1 --tries=3 --max-time=3600 --timeout=120
```

Recommended process count:
- Start with `2` workers, tune based on load.

## 4) Scheduler (Forge -> Scheduler)

Command:

```bash
cd /home/forge/api.mywisebox.com/backend && php artisan schedule:run
```

Frequency:
- Every minute.

## 5) Environment quick checklist (Forge -> Environment)

Must-have values:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://api.mywisebox.com`
- `FRONTEND_URL=https://mywisebox.com`
- `QUEUE_CONNECTION=redis`
- `CACHE_STORE=redis`
- `SESSION_DRIVER=redis`
- `FILESYSTEM_DISK=s3`
- `SANCTUM_STATEFUL_DOMAINS=mywisebox.com,app.mywisebox.com`
- `CORS_ALLOWED_ORIGINS=https://mywisebox.com,https://app.mywisebox.com`
- Stripe + Calendly + AWS + Mail secrets present

Reference:
- `docs/deployment/env-matrix.md`

## 6) SSL and DNS

- Enable Let's Encrypt on `api.mywisebox.com` in Forge.
- DNS:
  - `mywisebox.com` -> Vercel
  - `api.mywisebox.com` -> Forge server IP / LB

## 7) Post-deploy quick checks

Run from local machine:

```bash
APP_BASE_URL=https://mywisebox.com \
API_BASE_URL=https://api.mywisebox.com/api/v1 \
./scripts/smoke-production.sh
```

Expected critical checks:
- `GET /api/v1` returns 200 and `{ "status": "ok" }`.
- `/services` returns 200.
- `/workspace/services` redirects unauthenticated users to login.
- unauthenticated `GET /api/v1/orders` returns 401.
