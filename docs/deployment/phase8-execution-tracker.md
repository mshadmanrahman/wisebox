---
tags:
  - VibeCoding
  - VibeCoding/Hobby
  - Wisebox
---

# Phase 8 Execution Tracker (Forge + Vercel)

Date: 2026-02-10  
Status: Deferred (local pre-prod gate complete)

This is the live execution tracker for production rollout.

Primary references:
- `docs/deployment/forge-production-checklist.md`
- `docs/deployment/forge-ui-paste-blocks.md`
- `docs/deployment/production-runbook.md`
- `docs/deployment/env-matrix.md`

## Current next step

`DEFERRED`: Production cutover steps are paused until a deployment window is chosen.

## Execution table

| # | Step | Owner | Status | Evidence |
|---|------|-------|--------|----------|
| 1 | Preflight validation: `./scripts/validate.sh --with-e2e` | Engineering | DONE | Local validation green before release runs |
| 2 | Confirm remote sync: `git push origin main` | Engineering | DONE | `main` up to date on GitHub |
| 3 | Provision Forge server (PHP 8.4 app server) | Ops | DEFERRED | Awaiting deployment window |
| 4 | Create Forge site for `api.mywisebox.com` (`backend/public`) | Ops | DEFERRED | Awaiting deployment window |
| 5 | Set Forge env vars from `env-matrix.md` | Ops | DEFERRED | Awaiting deployment window |
| 6 | Configure queue daemon and scheduler in Forge | Ops | DEFERRED | Awaiting deployment window |
| 7 | Run backend deploy script in Forge | Ops | DEFERRED | Awaiting deployment window |
| 8 | Connect Vercel project and production env vars | Ops | DEFERRED | Awaiting deployment window |
| 9 | Configure DNS + TLS for `mywisebox.com` and `api.mywisebox.com` | Ops | DEFERRED | Awaiting deployment window |
| 10 | Register Stripe webhook endpoint + secret | Ops | DEFERRED | Awaiting deployment window |
| 11 | Register Calendly webhook endpoint + secret | Ops | DEFERRED | Awaiting deployment window |
| 12 | Run production smoke checks (`scripts/smoke-production.sh`) | Engineering | DEFERRED | Awaiting deployment window |
| 13 | Rollback drill sanity check (commands only) | Engineering | DEFERRED | Awaiting deployment window |
| 14 | Mark Phase 8 done in `BUILD-LOG.md` | Engineering | DEFERRED | To be done after production rollout |

## Minimal go-live command set

```bash
cd "/Users/connectshadman/Documents/Vibe Coding/_hobby/wisebox"
./scripts/validate.sh --with-e2e
git push origin main
APP_BASE_URL=https://mywisebox.com \
API_BASE_URL=https://api.mywisebox.com/api/v1 \
./scripts/smoke-production.sh
```

## Notes

- Use `docs/deployment/forge-ui-paste-blocks.md` to avoid manual copy/paste mistakes in Forge UI.
- Do not mark Phase 8 complete until webhook delivery is verified in both Stripe and Calendly dashboards.
- Local development may continue while this tracker stays in deferred state.

## Related
- [[Vibe Coding/_hobby/README|Hobby Projects Index]]
