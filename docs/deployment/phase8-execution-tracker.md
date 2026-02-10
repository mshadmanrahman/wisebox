# Phase 8 Execution Tracker (Forge + Vercel)

Date: 2026-02-10  
Status: In progress

This is the live execution tracker for production rollout.

Primary references:
- `docs/deployment/forge-production-checklist.md`
- `docs/deployment/forge-ui-paste-blocks.md`
- `docs/deployment/production-runbook.md`
- `docs/deployment/env-matrix.md`

## Current next step

`PENDING`: Provision Forge server and backend site for `api.mywisebox.com`.

## Execution table

| # | Step | Owner | Status | Evidence |
|---|------|-------|--------|----------|
| 1 | Preflight validation: `./scripts/validate.sh --with-e2e` | Engineering | DONE | Local validation green before release runs |
| 2 | Confirm remote sync: `git push origin main` | Engineering | DONE | `main` up to date on GitHub |
| 3 | Provision Forge server (PHP 8.4 app server) | Ops | PENDING | Forge server URL + screenshot/reference |
| 4 | Create Forge site for `api.mywisebox.com` (`backend/public`) | Ops | PENDING | Forge site config saved |
| 5 | Set Forge env vars from `env-matrix.md` | Ops | PENDING | Env key checklist completed |
| 6 | Configure queue daemon and scheduler in Forge | Ops | PENDING | Daemon + scheduler status shown |
| 7 | Run backend deploy script in Forge | Ops | PENDING | Deploy log with successful migration/cache steps |
| 8 | Connect Vercel project and production env vars | Ops | PENDING | Vercel project + env verification output |
| 9 | Configure DNS + TLS for `mywisebox.com` and `api.mywisebox.com` | Ops | PENDING | DNS records + valid cert checks |
| 10 | Register Stripe webhook endpoint + secret | Ops | PENDING | Stripe webhook dashboard delivery success |
| 11 | Register Calendly webhook endpoint + secret | Ops | PENDING | Calendly webhook delivery success |
| 12 | Run production smoke checks (`scripts/smoke-production.sh`) | Engineering | PENDING | Smoke output attached |
| 13 | Rollback drill sanity check (commands only) | Engineering | PENDING | Rollback commands tested/readable |
| 14 | Mark Phase 8 done in `BUILD-LOG.md` | Engineering | PENDING | Build log status moved to COMPLETE |

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
