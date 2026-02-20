# Wisebox Production Deployment Guide

Last updated: 2026-02-15

## Architecture Overview

```
                    ┌─────────────────────┐
                    │   wisebox-mvp.       │
                    │   vercel.app         │
                    │   (Next.js 14)       │
                    └──────────┬──────────┘
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │   wisebox-mvp.up.    │
                    │   railway.app        │
                    │   (Laravel 12 +      │
                    │    FrankenPHP/Caddy)  │
                    └──┬──────┬──────┬────┘
                       │      │      │
              ┌────────┘      │      └────────┐
              ▼               ▼               ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │ Railway MySQL│ │ Cloudflare   │ │ Third-Party  │
     │ (database)   │ │ R2 (docs)    │ │ Services     │
     └──────────────┘ └──────────────┘ └──────────────┘
                                         - Resend (email)
                                         - Google OAuth
                                         - Stripe
                                         - Calendly
```

## Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://wisebox-mvp.vercel.app |
| Backend API | https://wisebox-mvp.up.railway.app/api/v1 |
| Admin Panel | https://wisebox-mvp.up.railway.app/admin |
| Health Check | https://wisebox-mvp.up.railway.app/api/health |

## Hosting

### Railway (Backend)

- **Runtime**: PHP 8.3 via FrankenPHP + Caddy (auto-detected by Railpacks)
- **Framework**: Laravel 12 + Filament v4 admin panel
- **Database**: Railway MySQL plugin (auto-provisioned)
- **Build system**: Railpacks (Railway's newer builder, replaces Nixpacks)

#### How Railpacks Works

Railpacks auto-detects Laravel and handles the full deploy lifecycle:

1. Installs PHP extensions from `composer.json` via `install-php-extensions`
2. Runs `composer install --no-dev`
3. Runs `php artisan migrate --force`
4. Runs `php artisan storage:link`
5. Runs `php artisan optimize` (config:cache, route:cache, view:cache, event:cache)
6. Starts FrankenPHP + Caddy as the production web server

**Critical**: Do NOT add a `Procfile` or `[start]` section in `nixpacks.toml`. Both override the default Laravel flow, skipping migrations and optimization. The current `nixpacks.toml` is comments-only by design.

#### Key Deployment Lessons

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Migrations not running | `Procfile` overrode Railpacks default startup | Deleted Procfile entirely |
| CSS/JS not loading (unstyled pages) | `asset()` generated `http://` URLs behind reverse proxy | Added `$middleware->trustProxies(at: '*')` in `bootstrap/app.php` |
| Admin seeder skipped | `env()` returns null when config is cached | Changed to `getenv()` in seeders |
| Seeder never executed | Railpacks doesn't run `db:seed`, only `migrate --force` | Created migration files for user seeding instead |

#### Railway Environment Variables

All env vars are set in Railway dashboard > Project > Variables. See `.credentials` file for actual values. The template is in `backend/.env.production.example`.

### Vercel (Frontend)

- **Framework**: Next.js 14
- **Config**: `vercel.json` with security headers and rewrites
- **Key env var**: `NEXT_PUBLIC_API_URL=https://wisebox-mvp.up.railway.app`

## Third-Party Services

### 1. Cloudflare R2 (Document Storage)

- **Purpose**: S3-compatible object storage for property verification documents
- **Bucket**: `wisebox-documents`
- **Cost**: Free tier (10GB storage, no egress fees)
- **Dashboard**: https://dash.cloudflare.com > R2 Object Storage

Laravel config uses the `s3` driver with a custom endpoint:
```
AWS_ENDPOINT=https://{account_id}.r2.cloudflarestorage.com
AWS_USE_PATH_STYLE_ENDPOINT=true
```

No code changes needed; R2 is a drop-in S3 replacement.

### 2. Resend (Transactional Email)

- **Purpose**: OTP verification codes, meeting notifications, ticket status updates
- **Transport**: SMTP (no extra Laravel package needed)
- **Dashboard**: https://resend.com
- **Current sender**: `onboarding@resend.dev` (Resend default)

**Pending**: Verify `wiseboxinc.com` domain in Resend to send from `noreply@wiseboxinc.com`. Requires DNS access to add MX/TXT/CNAME records.

SMTP config:
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USERNAME=resend
MAIL_PASSWORD={resend_api_key}
MAIL_ENCRYPTION=tls
```

### 3. Google OAuth

- **Purpose**: "Sign in with Google" for customers and consultants
- **Console**: https://console.cloud.google.com (project: Wisebox)
- **OAuth consent screen**: External, Testing mode
- **Redirect URI**: `https://wisebox-mvp.up.railway.app/api/v1/auth/google/callback`

**Pending**: Before public launch, publish the OAuth app from Testing to Production in Google Cloud Console. Google may require app verification (privacy policy, homepage URL).

### 4. Stripe (Payments)

- **Purpose**: Consultant service payments, subscription billing
- **Mode**: TEST (use test cards like `4242 4242 4242 4242`)
- **Dashboard**: https://dashboard.stripe.com
- **Webhook URL**: `https://wisebox-mvp.up.railway.app/api/v1/webhooks/stripe`
- **Webhook events**: All events (can be narrowed later)

**Pending**: Complete Stripe account activation and switch to Live keys for real payments.

Test cards: https://docs.stripe.com/testing#cards

### 5. Calendly (Consultation Scheduling)

- **Purpose**: Booking property verification consultations
- **Plan**: Free
- **Timezone**: America/New_York (Wisebox is US-registered)
- **Booking URL**: https://calendly.com/shadman-rahman-wiseboxinc/30min
- **Dashboard**: https://calendly.com

Webhook subscription:
- **Callback**: `https://wisebox-mvp.up.railway.app/api/v1/webhooks/calendly`
- **Events**: `invitee.created`, `invitee.canceled`
- **Signing key**: None (free plan); signature validation skipped when `CALENDLY_WEBHOOK_SECRET` is empty
- **Created**: 2026-02-15

How it works:
1. Customer clicks Calendly booking link (embedded in ticket flow)
2. Customer books a time slot on Calendly
3. Calendly POSTs `invitee.created` to the webhook endpoint
4. `CalendlyWebhookController` resolves the ticket (via tracking params or Q&A)
5. Ticket status updated to "scheduled", meeting URL stored
6. Email notification + in-app notification sent to customer
7. If cancelled, Calendly POSTs `invitee.canceled`, ticket reverts to previous state

## Email System

### OTP Verification Flow

The backend uses a cache-based OTP system (no database table needed):

1. User requests OTP via `POST /api/v1/verify-otp` or during registration
2. `OtpService::send()` generates a 6-digit code, bcrypt-hashes it, stores in cache (10-min TTL)
3. `OtpCodeNotification` sends the code via Laravel's mail channel (Resend SMTP)
4. User enters the code; `OtpService::verify()` checks against the hash
5. Rate-limited: 1 OTP per 60 seconds per user

Key files:
- `app/Services/OtpService.php` : generation, verification, rate limiting
- `app/Notifications/OtpCodeNotification.php` : email template
- Routes: `POST /api/v1/verify-otp`, `POST /api/v1/resend-otp`

### Transactional Emails Sent

| Email | Trigger | Service |
|-------|---------|---------|
| OTP verification code | Registration, login, password reset | OtpService |
| Meeting scheduled | Calendly `invitee.created` webhook | TransactionalEmailService |
| Ticket status updated | Status changes, meeting cancellations | TransactionalEmailService |

## Test Accounts

Created via migrations (run automatically on deploy):

| Role | Email | Password | Migration |
|------|-------|----------|-----------|
| Admin (super_admin) | Set via `ADMIN_EMAIL` env var | Set via `ADMIN_PASSWORD` env var | `2026_02_15_000001_seed_admin_user.php` |
| Consultant | consultant@wiseboxinc.com | Wisebox2026! | `2026_02_15_000002_seed_test_consultant.php` |
| Customer | customer@wiseboxinc.com | Wisebox2026! | `2026_02_15_000003_seed_test_customer.php` |

**Why migrations instead of seeders?** Railpacks runs `php artisan migrate --force` but does NOT run `db:seed`. Migrations are the only reliable way to bootstrap data during Railway deploys.

## Key Backend Files Modified During Deployment

| File | Change | Why |
|------|--------|-----|
| `Procfile` | DELETED | Overrode Railpacks' default Laravel startup, skipping migrations |
| `nixpacks.toml` | Comments only, no `[start]` section | Railpacks ignores `[start]`; a Procfile overrides the default flow |
| `bootstrap/app.php` | Added `trustProxies(at: '*')` | Fix HTTPS detection behind Railway's reverse proxy (Caddy + LB) |
| `database/seeders/AdminUserSeeder.php` | Changed `env()` to `getenv()` | `env()` returns null when config is cached |
| `database/migrations/2026_02_15_000001_seed_admin_user.php` | NEW | Admin user creation via migration (seeders don't run in Railpacks) |
| `database/migrations/2026_02_15_000002_seed_test_consultant.php` | NEW | Test consultant account |
| `database/migrations/2026_02_15_000003_seed_test_customer.php` | NEW | Test customer account |
| `routes/api.php` | Cleaned up `/health` endpoint | Removed debug info (raw env vars) from health check response |

## Queue Worker (Email Delivery)

The consultation flow sends transactional emails (meeting scheduled, ticket updates, form invitations). These are dispatched via Laravel's queue system.

### How It Works

1. `QUEUE_CONNECTION=database` stores jobs in the `jobs` table (migration: `0001_01_01_000002_create_jobs_table.php`)
2. `routes/console.php` schedules `queue:work --stop-when-empty` to run every minute
3. Railway's cron executes `php artisan schedule:run`, which triggers the queue worker
4. The worker processes all pending jobs then exits, so it doesn't block the scheduler

### Required Railway Environment Variables

```
QUEUE_CONNECTION=database
DB_QUEUE_CONNECTION=mysql
```

### Verifying Email Delivery

1. Submit a consultation request from the frontend
2. Check Railway logs for `[queue:work]` output
3. Verify the `jobs` table is empty (all jobs processed)
4. If jobs are stuck in `failed_jobs`, inspect with `php artisan queue:failed`

### Consultation Flow Checklist

- [ ] `QUEUE_CONNECTION=database` set on Railway
- [ ] `DB_QUEUE_CONNECTION=mysql` set on Railway
- [ ] `MAIL_MAILER=smtp` with Resend SMTP credentials configured
- [ ] `MAIL_TIMEOUT=5` set (prevents slow SMTP from blocking requests)
- [ ] Railway cron runs `php artisan schedule:run` every minute
- [ ] Google Calendar OAuth tokens are valid (run `php artisan google:auth` if expired)
- [ ] Test: submit consultation, verify instant response (no "Submitting..." hang)
- [ ] Test: check email arrives within 1-2 minutes

## Remaining TODOs

### Before Public Launch

- [ ] Verify `wiseboxinc.com` domain in Resend (requires DNS access)
- [ ] Change `MAIL_FROM_ADDRESS` to `noreply@wiseboxinc.com` after domain verification
- [ ] Publish Google OAuth app from Testing to Production
- [ ] Complete Stripe account activation and switch to Live keys
- [ ] Change test account passwords (consultant, customer) to something stronger
- [ ] Rotate all API keys shared during setup session
- [ ] Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_STRIPE_KEY` to Vercel if frontend uses them
- [ ] Narrow Stripe webhook events to only the ones actually handled

### Nice to Have

- [ ] Set up Twilio for SMS OTP as fallback to email
- [ ] Upgrade Calendly to paid plan for webhook signing keys
- [ ] Add Redis plugin on Railway for better cache/session performance
- [ ] Set up custom domain (wisebox.com or app.wiseboxinc.com)
- [ ] Configure error monitoring (Sentry or similar)

## Credentials

All API keys, secrets, and passwords are stored in `.credentials` at the project root. This file is gitignored and should never be committed. Keep it backed up securely.
