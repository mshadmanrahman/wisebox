# Phase 9 Slice 6: Negative-Path and Role-Boundary E2E Hardening

Date: 2026-02-10  
Status: Complete

## Objective

Increase authenticated Playwright confidence by validating failure-path UX and role boundaries, not only happy paths.

## Scope

Updated file:

- `frontend/tests/e2e/authenticated-workflows.spec.js`

## Coverage Added

1. Customer ticket scheduling link error handling
- Route: `POST /api/v1/tickets/{id}/schedule-link`
- Behavior asserted: backend `422` error message is rendered in ticket detail UI.

2. Customer ticket comment mutation error handling
- Route: `POST /api/v1/tickets/{id}/comments`
- Behavior asserted: backend `422` validation failure is shown in the conversation action error surface.

3. Consultant ticket update/comment mutation error handling
- Routes:
  - `PUT /api/v1/consultant/tickets/{id}`
  - `POST /api/v1/consultant/tickets/{id}/comments`
- Behavior asserted: backend failure responses render clear inline errors.

4. Consultant workspace role boundary
- Route: `/consultant/tickets/{id}`
- Behavior asserted: customer session is blocked with `Consultant access required.`.

## Why This Slice

Previous slices focused on positive mutation flows and empty states. This slice closes a reliability gap where APIs can fail but UX must remain explicit and actionable.

## Local Validation

Run:

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"
./scripts/validate.sh --with-e2e
```

Expected result:

- Backend tests pass
- Frontend type/lint/build pass
- Playwright suite passes including new negative-path and role-boundary cases

## Artifacts Updated

- `BUILD-LOG.md`
- `docs/phase9-kickoff-local-first.md`
- `docs/testing-validation-matrix.md`
- `docs/phase9-slice6-negative-path-and-role-boundary-e2e.md`
