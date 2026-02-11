# Phase 9 Slice 8: Dashboard and Notifications Caching Pass

Date: 2026-02-11  
Status: Complete

## Objective

Improve response efficiency on high-traffic portal surfaces by reducing repeated query cost for dashboard summary and notification unread count endpoints, while preserving correctness after read mutations.

## Scope

Updated files:

- `backend/app/Http/Controllers/Api/V1/DashboardController.php`
- `backend/app/Http/Controllers/Api/V1/NotificationController.php`
- `backend/tests/Feature/NotificationApiTest.php`

## What Changed

1. Dashboard summary query optimization
- Added cache for active hero slides (`dashboard:hero-slides:v1`) with a 5-minute TTL.
- Reduced ticket count query load by consolidating:
  - total ticket count
  - open ticket count
  into one aggregate SQL query instead of two separate count queries.

2. Notifications unread count caching
- Added per-user unread-count caching key:
  - `notifications:user:{id}:unread-count`
- Added 30-second TTL for `GET /api/v1/notifications/unread-count`.
- Added cache invalidation on:
  - `PATCH /api/v1/notifications/{notificationId}/read`
  - `PATCH /api/v1/notifications/read-all`

3. Test hardening for cache invalidation
- Extended `NotificationApiTest` to assert unread-count refresh after `markRead` before `markAllRead`, ensuring stale cache is cleared correctly during read mutations.

## Why This Matters

- Dashboard and notification center are among the most frequently visited authenticated pages.
- These optimizations reduce repeated DB work under navigation refresh and polling patterns.
- Cache invalidation keeps unread counters accurate after state-changing actions.

## Validation

Run:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"
./scripts/validate.sh --with-e2e
```

Expected:

- Backend feature tests stay green, including `NotificationApiTest`.
- Frontend static checks and E2E remain green.

## Artifacts Updated

- `BUILD-LOG.md`
- `docs/phase9-kickoff-local-first.md`
- `docs/testing-validation-matrix.md`
- `docs/phase9-slice8-dashboard-notification-caching.md`
