# Laravel Forge Production Checklist (Recommended Path)

Date: 2026-02-10

This is the target-specific deployment checklist for Wisebox using Laravel Forge for backend and Vercel for frontend.

## 1) Infrastructure prerequisites

1. AWS account with:
- EC2 instance budget
- RDS MySQL (recommended) or MySQL on server
- ElastiCache Redis (recommended) or Redis on server
- S3 bucket for documents

2. Services and accounts:
- Laravel Forge account
- Vercel account
- Stripe production account
- Calendly production account
- DNS provider access (Cloudflare or equivalent)

3. Repository:
- `main` branch passing validation
- latest commit pushed to GitHub

## 2) Forge server provisioning

1. In Forge, create a new server:
- Provider: AWS
- PHP version: 8.4
- Server type: App server
- Region: same as DB/Redis/S3 when possible

2. Install/enable runtime components:
- Nginx
- PHP-FPM
- Composer
- Redis extension

3. Add server-level daemon for queue workers (after env setup):
- Command:

```bash
cd /home/forge/api.mywisebox.com && php artisan queue:work redis --sleep=1 --tries=3 --max-time=3600
```

## 3) Forge site setup (backend)

1. Create site in Forge:
- Domain: `api.mywisebox.com`
- Project type: Laravel
- Repository: `mshadmanrahman/wisebox`
- Branch: `main`
- Web directory: `backend/public`

2. Configure deployment script in Forge with:

```bash
cd /home/forge/api.mywisebox.com/backend
composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart || true
```

3. Enable Quick Deploy from GitHub pushes (optional but recommended once stable).

## 4) Environment configuration

1. Paste backend production env values into Forge site environment from:
- `docs/deployment/env-matrix.md`

2. Critical backend values to confirm before first deploy:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://api.mywisebox.com`
- `FRONTEND_URL=https://mywisebox.com`
- DB, Redis, S3, Stripe, Calendly, Mail values
- `SANCTUM_STATEFUL_DOMAINS`
- `CORS_ALLOWED_ORIGINS`

3. Generate app key if missing:

```bash
cd /home/forge/api.mywisebox.com/backend
php artisan key:generate --show
```

## 5) Database, cache, and storage

1. Database:
- Prefer RDS MySQL production instance.
- Add restricted DB user for Wisebox app.

2. Redis:
- Prefer managed Redis service.
- Ensure network access from Forge server.

3. S3:
- Create `wisebox-documents-prod` bucket (or chosen prod name).
- Grant least-privilege IAM permissions to object CRUD for app prefix.

## 6) Frontend (Vercel)

1. Connect repo to Vercel project.
2. Production branch: `main`.
3. Set production env vars from `docs/deployment/env-matrix.md`.
4. Verify env file export locally:

```bash
./scripts/verify-vercel-env.sh --env-file=frontend/.env.production.vercel
```

5. Deploy and confirm `mywisebox.com` is serving latest build.

## 7) DNS and TLS

Configure records:
- `mywisebox.com` -> Vercel
- `api.mywisebox.com` -> Forge server IP / load balancer
- `admin.mywisebox.com` -> Forge server (if using Filament admin separately)

In Forge:
- Enable SSL (Let's Encrypt) for backend domains.

In Vercel:
- Ensure TLS active for frontend domain.

## 8) Webhooks

### Stripe

1. Add endpoint:
- `https://api.mywisebox.com/api/v1/webhooks/stripe`

2. Enable events:
- `checkout.session.completed`
- `payment_intent.payment_failed`
- `charge.refunded`

3. Save signing secret to `STRIPE_WEBHOOK_SECRET`.

### Calendly

1. Add endpoint:
- `https://api.mywisebox.com/api/v1/webhooks/calendly`

2. Save signing secret to `CALENDLY_WEBHOOK_SECRET`.

## 9) Post-deploy verification

1. Run scripted smoke checks:

```bash
APP_BASE_URL=https://mywisebox.com \
API_BASE_URL=https://api.mywisebox.com/api/v1 \
./scripts/smoke-production.sh
```

2. Manual spot checks:
- Login and dashboard load
- Property detail + assessment history
- Public `/services` and protected `/workspace/services` behavior
- Create order and verify ticket linkage

3. Integration checks:
- Trigger Stripe test event in dashboard and confirm state transitions.
- Trigger Calendly webhook event and verify ticket scheduling fields.

## 10) Rollback

1. Backend:
- In Forge, redeploy previous known-good commit.
- Re-run cache commands if needed.
- Restart queue workers.

2. Frontend:
- Promote previous healthy deployment in Vercel.

3. Incident capture:
- Document failure point and remediation before next release.
