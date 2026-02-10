# Phase 9 Slice 3: Orders and Tickets Edge-Case Hardening

Date: 2026-02-10  
Status: Complete (local-first)

## Goal

Expand edge-case coverage for core customer workflows in orders and tickets, and add authenticated E2E checks for those portal screens.

## What was added

1. Order API edge-case feature tests:
- `backend/tests/Feature/OrderApiTest.php`
- Added coverage for:
  - checkout on already-paid orders returns confirmation URL
  - paid orders cannot be cancelled
  - cancelled orders cannot be checked out

2. Ticket API edge-case feature tests:
- `backend/tests/Feature/TicketApiTest.php`
- Added coverage for:
  - customers cannot post internal comments
  - scheduling link generation requires assigned consultant

3. Authenticated E2E expansions:
- `frontend/tests/e2e/authenticated-workflows.spec.js`
- Added workflows for:
  - authenticated orders list and order detail rendering
  - authenticated tickets list and ticket detail rendering

## Behavior guarantee

- No API contract changes were introduced for this slice.
- Changes are test-only hardening and coverage expansion.
- Existing local/CI validation gates remain unchanged.

## Validation commands

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"
docker compose exec app php artisan test --filter='OrderApiTest|TicketApiTest'
./scripts/validate.sh --with-e2e
```
