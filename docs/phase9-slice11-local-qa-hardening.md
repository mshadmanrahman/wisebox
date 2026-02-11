# Phase 9 Slice 11: Local QA Hardening and Navigation/Data-Shape Resilience

_Date: 2026-02-11_

## Objective

Stabilize local user flows based on real manual QA findings (dashboard CTA navigation errors, onboarding/document flow runtime errors, and local environment confusion), without introducing external deployment work.

## Scope Completed

### 1. Dashboard CTA Safety (Frontend)

- Added client-side CTA URL normalization and fallback behavior:
  - `frontend/src/app/(portal)/dashboard/page.tsx`
- Behavior:
  - Empty/malformed CTA URLs now fall back to `/properties/new`
  - Localhost absolute links are normalized to internal paths
  - Invalid values (for example bare `localhost`-style strings) are blocked from breaking navigation

### 2. Dashboard CTA Safety (Backend API)

- Added server-side CTA URL sanitation so payloads are safe regardless of client version:
  - `backend/app/Http/Controllers/Api/V1/DashboardController.php`
- Added normalization methods for slide `cta_url` values returned by `/api/v1/dashboard/summary`
- Prevents malformed local links from propagating to the frontend

### 3. Regression Coverage

- Extended dashboard summary feature tests to cover malformed CTA input normalization:
  - `backend/tests/Feature/DashboardSummaryApiTest.php`
- Assertion verifies malformed local CTA value is normalized to a valid internal route

### 4. Onboarding/Document Flow Hardening (Local QA Follow-ups)

- Data-shape/runtime guard fixes in property document workflow components:
  - `frontend/src/components/property/document-upload-item.tsx`
  - `frontend/src/components/property/document-status-list.tsx`
- Additional onboarding/form behavior updates in property creation flow touched during local QA:
  - `frontend/src/components/property/co-owner-fields.tsx`
  - `frontend/src/components/property/location-cascade.tsx`
  - `frontend/src/app/(portal)/properties/new/page.tsx`

## Validation Executed

- Backend feature test:
  - `php artisan test tests/Feature/DashboardSummaryApiTest.php`
- Frontend static validation:
  - `npm run lint`
- Manual browser verification:
  - Dashboard CTA routes to valid local pages (no `localhost refused to connect` dead-end on broken CTA payload)

## Current Local Test URLs

- Frontend: `http://localhost:3000`
- Dashboard: `http://localhost:3000/dashboard`
- Tickets: `http://localhost:3000/tickets`
- Admin: `http://localhost:8000/admin`
- API: `http://localhost:8000/api/v1`

## Notes

- External deployment/cutover remains out of scope in this slice.
- This slice is focused on local usability, reliability, and QA feedback closure.

