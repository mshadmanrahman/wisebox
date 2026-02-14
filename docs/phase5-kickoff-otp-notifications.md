---
tags:
  - VibeCoding
  - VibeCoding/Hobby
  - Wisebox
---

# Phase 5 Kickoff: OTP Integration and Notification Delivery Baseline

Date: 2026-02-10

## Objective

Start Phase 5 with a test-first integration slice focused on OTP verification and notification delivery readiness.

## Implemented

### 1) OTP service

File: `backend/app/Services/OtpService.php`

Capabilities:
- Generates 6-digit OTP codes.
- Stores hashed OTP payload in cache.
- OTP expiry: 10 minutes.
- Resend cooldown: 60 seconds per user.
- Supports channels:
  - `email` via Laravel notification
  - `sms` via Twilio SDK when credentials exist
- Graceful SMS fallback:
  - if Twilio credentials are missing, logs warning and does not crash.

### 2) OTP email notification

File: `backend/app/Notifications/OtpCodeNotification.php`

Behavior:
- Sends OTP via mail channel.
- Includes expiry reminder.
- Used by `OtpService` for `email` channel sends.

### 3) Auth controller integration

File: `backend/app/Http/Controllers/Api/V1/AuthController.php`

Changes:
- Injects `OtpService`.
- Sends OTP automatically on successful registration.
- `POST /api/v1/auth/resend-otp`:
  - validates `channel` (`email` or `sms`)
  - enforces resend cooldown (via `OtpService`)
- `POST /api/v1/auth/verify-otp`:
  - verifies code against cached hashed OTP
  - rejects invalid/expired code with `422`
  - marks verified field by channel:
    - email channel -> `email_verified_at`
    - sms channel -> `phone_verified_at`

### 4) Twilio config mapping

File: `backend/config/services.php`

Added:
- `services.twilio.sid`
- `services.twilio.auth_token`
- `services.twilio.from`
- `services.twilio.verify_sid`

## Tests Added

File: `backend/tests/Feature/AuthOtpTest.php`

Coverage:
- registration sends OTP notification
- resend then verify OTP success
- invalid OTP fails with validation error
- resend is rate limited to 1 request / 60 seconds
- SMS OTP requires phone number

## Validation Checklist

Run from repo root:

```bash
docker compose exec app php artisan test
docker compose exec app php artisan route:list | grep -E "api/v1/auth/(verify-otp|resend-otp|register)"
```

Optional focused run:

```bash
docker compose exec app php artisan test --filter=AuthOtpTest
```

## Notes

- This kickoff slice intentionally avoids adding DB schema for OTP storage by using cache-based OTP payloads.
- Twilio Verify-specific flow is not yet implemented; current SMS support uses direct Twilio message send path when configured.
- Follow-up fix after first validation run:
  - Added Sanctum migration `create_personal_access_tokens_table` because OTP registration uses `createToken()` and tests run against sqlite in-memory DB.
  - Added `email_verified_at` and `phone_verified_at` to `User::$fillable` so OTP verification persists channel verification timestamps.

## Phase 5 Progress Update

Follow-on slices completed after this kickoff:

- Calendly outbound scheduling link integration:
  - `backend/app/Services/CalendlyService.php`
  - API-first scheduling link generation using `CALENDLY_API_KEY`, `CALENDLY_BASE_URL`, and `CALENDLY_EVENT_TYPE_URI`
  - fallback to consultant profile `calendly_url` and global `CALENDLY_BOOKING_URL`
- Transactional queued email notifications:
  - `backend/app/Notifications/OrderLifecycleNotification.php`
  - `backend/app/Notifications/TicketLifecycleNotification.php`
  - `backend/app/Services/TransactionalEmailService.php`
  - wired into order, stripe webhook, and ticket lifecycle controllers
- CI validation automation:
  - `.github/workflows/validate.yml`
  - executes `./scripts/validate.sh --with-e2e` on push/PR

## Related
- [[Vibe Coding/_hobby/README|Hobby Projects Index]]
