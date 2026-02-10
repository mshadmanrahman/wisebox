# Production Environment Matrix

Date: 2026-02-10

This document defines required production environment variables and where each value must be configured.

## Backend (`backend/.env` on production host)

| Variable | Required | Purpose | Example / Notes |
|---|---|---|---|
| `APP_ENV` | Yes | Laravel environment | `production` |
| `APP_DEBUG` | Yes | Debug mode | `false` |
| `APP_KEY` | Yes | App encryption key | generated via `php artisan key:generate --show` |
| `APP_URL` | Yes | Public backend URL | `https://api.mywisebox.com` |
| `FRONTEND_URL` | Yes | Public frontend URL | `https://mywisebox.com` |
| `DB_CONNECTION` | Yes | Database driver | `mysql` |
| `DB_HOST` | Yes | MySQL host | RDS/private host |
| `DB_PORT` | Yes | MySQL port | `3306` |
| `DB_DATABASE` | Yes | Database name | production DB name |
| `DB_USERNAME` | Yes | Database user | least-privileged user |
| `DB_PASSWORD` | Yes | Database password | secret |
| `REDIS_HOST` | Yes | Redis host | managed Redis/private host |
| `REDIS_PORT` | Yes | Redis port | `6379` |
| `QUEUE_CONNECTION` | Yes | Queue backend | `redis` |
| `CACHE_STORE` | Yes | Cache backend | `redis` |
| `SESSION_DRIVER` | Yes | Session backend | `redis` |
| `SESSION_DOMAIN` | Yes | Session cookie domain | `.mywisebox.com` if shared subdomains are needed |
| `SANCTUM_STATEFUL_DOMAINS` | Yes | SPA auth domains | `mywisebox.com,app.mywisebox.com` |
| `CORS_ALLOWED_ORIGINS` | Yes | Allowed browser origins | include production frontend origins only |
| `FILESYSTEM_DISK` | Yes | Storage disk | `s3` |
| `AWS_ACCESS_KEY_ID` | Yes | S3 IAM access key | restricted IAM user/role |
| `AWS_SECRET_ACCESS_KEY` | Yes | S3 IAM secret | secret |
| `AWS_DEFAULT_REGION` | Yes | AWS region | e.g. `ap-southeast-1` |
| `AWS_DOCUMENTS_BUCKET` | Yes | Document bucket name | e.g. `wisebox-documents-prod` |
| `STRIPE_KEY` | Yes | Stripe publishable key (backend usage) | production key |
| `STRIPE_SECRET` | Yes | Stripe secret key | production key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signature secret | from Stripe endpoint |
| `CALENDLY_API_KEY` | Yes | Calendly API key | production key |
| `CALENDLY_WEBHOOK_SECRET` | Yes | Calendly webhook signing secret | from Calendly webhook subscription |
| `CALENDLY_BOOKING_URL` | Conditional | fallback booking URL | required if using fallback flow |
| `CALENDLY_EVENT_TYPE_URI` | Conditional | event type for scheduling-link flow | required for API-generated links |
| `MAIL_MAILER` + SMTP vars | Yes | outbound email for OTP/notifications | production SMTP provider |
| `TWILIO_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` / `TWILIO_VERIFY_SID` | Conditional | SMS OTP | required if SMS OTP enabled |

## Frontend (Vercel project env vars)

| Variable | Required | Purpose | Example / Notes |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL | `https://api.mywisebox.com/api/v1` |
| `NEXT_PUBLIC_APP_URL` | Yes | Frontend canonical base URL | `https://mywisebox.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Conditional | Google auth client | set if Google login is enabled |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Conditional | Stripe publishable key for frontend checkout UI | set if needed by frontend flow |

## GitHub Actions secrets (optional for deployment automation)

| Secret | Required if automated deploy | Purpose |
|---|---|---|
| `PROD_SSH_HOST` | Yes | Backend server hostname |
| `PROD_SSH_USER` | Yes | SSH user for deploy |
| `PROD_SSH_PRIVATE_KEY` | Yes | SSH private key for deploy job |
| `VERCEL_TOKEN` | Yes | Vercel CLI auth token |
| `VERCEL_ORG_ID` | Yes | Vercel org id |
| `VERCEL_PROJECT_ID` | Yes | Vercel project id |

## Secret management policy

1. Never commit production secrets to git.
2. Rotate Stripe/Calendly/API keys after incident or team-member offboarding.
3. Keep separate credentials for staging and production.
4. Use least-privilege IAM policies for S3 access.
