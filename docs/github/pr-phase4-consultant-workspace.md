---
tags:
  - VibeCoding
  - VibeCoding/Hobby
  - Wisebox
---

# Phase 4: Consultant Workspace APIs + Calendly Webhook Flow

## Summary
This PR advances Phase 4 by introducing a dedicated consultant ticket workspace, consultant-scoped APIs, and Calendly webhook ingestion for meeting scheduling updates.

## Backend
- Added `ConsultantTicketController`
  - `GET /api/v1/consultant/dashboard`
  - `GET /api/v1/consultant/tickets`
  - `GET /api/v1/consultant/tickets/{id}`
  - `PUT /api/v1/consultant/tickets/{id}`
  - `POST /api/v1/consultant/tickets/{id}/comments`
- Added `CalendlyWebhookController`
  - `POST /api/v1/webhooks/calendly`
  - Handles `invitee.created` and `invitee.canceled`
- Added `CalendlyWebhookService` for signature verification and payload handling support.
- Added `calendly` config block in `backend/config/services.php`.
- Updated API routes to expose consultant and calendly webhook endpoints.

## Frontend
- Added consultant portal pages:
  - `/consultant/tickets`
  - `/consultant/tickets/{id}`
- Updated portal nav to include consultant workspace entry for consultant/admin roles.
- Updated middleware to protect `/consultant/*` routes.

## Tests
- Added `backend/tests/Feature/ConsultantTicketApiTest.php`
- Added `backend/tests/Feature/CalendlyWebhookTest.php`

## Local Verification
- Backend:
  - `docker compose exec app php artisan test`
  - `docker compose exec app php artisan route:list | grep -E "api/v1/(consultant|webhooks/calendly)"`
- Frontend:
  - `cd frontend && npx tsc --noEmit`
  - `npm run lint`
  - `npm run build`

## Notes
- No PAT secrets are committed.
- Calendly webhook verification honors `CALENDLY_WEBHOOK_SECRET`.
- Meeting scheduling fields on tickets are updated from webhook events.

## Related
- [[Vibe Coding/_hobby/README|Hobby Projects Index]]
