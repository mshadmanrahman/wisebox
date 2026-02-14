---
tags:
  - VibeCoding
  - VibeCoding/Hobby
  - Wisebox
---

# Phase 6 Polish CI and Release Snapshot

Date: 2026-02-10  
Release commit: `5efc818`  
Branch: `main`

## Scope in snapshot

- Dashboard aggregate API:
  - `GET /api/v1/dashboard/summary`
- Notification filtering and pagination:
  - `GET /api/v1/notifications?status=&type=&q=&page=&per_page=`
- Assessment history endpoint:
  - `GET /api/v1/properties/{property}/assessments`
- Portal updates:
  - Dashboard consumes summary API
  - Notification center supports filter/search/pagination
  - Property detail renders assessment history

## Validation status

### Local validation (completed)

- `docker compose exec app php artisan test`  
  Result: 42 passing tests, 217 assertions
- `./scripts/validate.sh --with-e2e`  
  Result: backend + frontend + e2e passing

### Route surface validation (completed)

- `docker compose exec app php artisan route:list | grep -E 'api/v1/(dashboard/summary|properties/.*/assessments|notifications)'`

Confirmed routes:
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/read-all`
- `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/{notificationId}/read`
- `GET /api/v1/properties/{property}/assessments`

## GitHub Actions runbook

Use these commands to inspect CI and retrieve evidence after push:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"

# Latest workflow runs
gh run list -R mshadmanrahman/wisebox --workflow validate.yml --limit 5

# Inspect latest run in terminal
RUN_ID=$(gh run list -R mshadmanrahman/wisebox --workflow validate.yml --limit 1 --json databaseId -q '.[0].databaseId')
gh run view "$RUN_ID" -R mshadmanrahman/wisebox --log

# Download artifacts (Playwright report + test results)
gh run download "$RUN_ID" -R mshadmanrahman/wisebox -D /tmp/wisebox-ci-artifacts
```

## Playwright report notes

- During local runs from `frontend`, report path is:
  - `frontend/playwright-report`
- Open it with:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox/frontend"
npx playwright show-report
```

## Related
- [[Vibe Coding/_hobby/README|Hobby Projects Index]]
