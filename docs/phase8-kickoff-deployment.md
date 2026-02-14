---
tags:
  - VibeCoding
  - VibeCoding/Hobby
  - Wisebox
---

# Phase 8 Kickoff: Deployment and Production

Date: 2026-02-10  
Status: Deferred (local pre-prod gate complete)

Preferred backend path selected:
- Laravel Forge (`docs/deployment/forge-production-checklist.md`)

## Objective

Deploy Wisebox to production with a stable release process for backend, frontend, and third-party integrations while preserving all validation gates.

## Scope (from implementation plan)

- Backend deployment (AWS EC2 / Forge) for `api.mywisebox.com`
- Frontend deployment (Vercel) for `mywisebox.com`
- Production DNS and TLS
- Stripe + Calendly production webhook setup
- Post-deploy verification and rollback runbook

## Current readiness snapshot

Completed:
- End-to-end validation matrix is green on `main` (backend + frontend + E2E).
- CI workflow exists at `.github/workflows/validate.yml` and runs `./scripts/validate.sh --with-e2e`.
- Public marketing routes and workspace routes are split and stable (`/services` and `/workspace/services`).
- Health endpoint available at `GET /api/v1`.

Open items for Phase 8 (deferred until production cutover window):
- Provision production backend host and managed DB/Redis.
- Configure production secrets across backend and Vercel.
- Configure DNS records and SSL.
- Register production webhook endpoints for Stripe and Calendly.
- Execute production smoke checks.

Current decision:
- Continue local feature development while keeping production rollout artifacts ready.

## Work tracks

### Track A: Infrastructure and runtime

1. Provision backend runtime (EC2/Forge), MySQL, Redis.
2. Configure PHP/Nginx, supervisor queue workers, scheduler cron.
3. Configure S3 bucket and IAM policy for document storage.

### Track B: Application deployment

1. Backend deploy pipeline (git pull + install + migrate + cache warmup).
2. Frontend deploy pipeline in Vercel from `main`.
3. Environment parity review between local/CI/production.

### Track C: Integrations and domain routing

1. Stripe production keys and webhook endpoint.
2. Calendly production API key + webhook signing secret.
3. DNS setup for app/api/admin hostnames.

### Track D: Verification and rollback

1. Run production smoke tests for auth, property, orders, tickets.
2. Verify webhook delivery and queue processing.
3. Capture rollback steps and incident response commands.

## Artifacts created for this phase

- `docs/deployment/env-matrix.md`
- `docs/deployment/production-runbook.md`
- `docs/deployment/forge-production-checklist.md`
- `docs/deployment/forge-ui-paste-blocks.md`
- `docs/deployment/phase8-execution-tracker.md`
- `scripts/deploy-backend.sh`
- `scripts/verify-vercel-env.sh`
- `scripts/smoke-production.sh`

## Definition of done (Phase 8)

1. Public and authenticated apps accessible on production domains.
2. Backend API, queue, scheduler, and storage integrations healthy.
3. Stripe and Calendly webhooks verified in production.
4. Deployment runbook and env matrix are complete and tested.
5. Post-deploy smoke checklist passes without manual hotfixes.

## Related
- [[Vibe Coding/_hobby/README|Hobby Projects Index]]
