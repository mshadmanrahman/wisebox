# Wisebox Post-Launch Operations

## Team

| Person | Role | Handles | Linear Assignment |
|--------|------|---------|-------------------|
| Shadman Rahman | PM/Backend/Infra | Product decisions, backend fixes, Railway, Vercel, analytics, feedback triage | `Shadman Rahman` |
| Shadman Sakib | Frontend/UI | All UI changes, components, design, responsive fixes | `Shadman Sakib` |

## Weekly Cadence

### Monday — Plan
- Review Linear backlog (sorted by priority)
- Pick 3-5 tickets for the week
- Move to "In Progress"

### Daily — Build
- Each person works on assigned tickets
- Commit with ticket ref: `fix: description (WB-XXX)`
- CI runs automatically on push

### Friday — Review + Report
- Run `/wisebox-pulse` to generate weekly analytics
- Review what shipped, what's pending
- Update Linear ticket statuses

## Feedback Intake Workflow

When feedback comes in (WhatsApp, meeting, testing):

1. **Capture** — Run `/wisebox-feedback` in Claude Code
2. **Triage** — Claude creates Linear ticket with:
   - Title, description, reproduction steps
   - Priority (Urgent/High/Medium/Low)
   - Labels (Bug, Enhancement, User Portal, Consultant Portal, etc.)
   - Assignment (Sakib for UI, Rahman for backend)
3. **Track** — All work references ticket numbers in commits
4. **Close** — Mark done in Linear with comment explaining the fix

## Git Workflow

```
main (production — auto-deploys to Vercel + Railway)
  |
  +-- feature/WB-XXX-description (for new features)
  +-- fix/WB-XXX-description (for bug fixes)
```

### Rules
- Always branch from `main`
- Always reference ticket: `WB-XXX: description`
- CI must pass before merge
- Small, focused PRs (1 ticket = 1 PR)
- `main` is always deployable

### Rollback
- Vercel: Instant rollback via dashboard (Deployments → previous → Promote)
- Railway: `railway service redeploy` or revert commit

## Analytics (Amplitude)

Events tracked:
- Auth: login, registration, Google sign-in
- Properties: added, viewed, documents uploaded
- Engagement: services viewed, consultation booked
- Payment: order created, payment completed

Weekly report covers:
- New signups this week
- Properties created
- Documents uploaded
- Consultations booked
- Active users (DAU/WAU)
- Drop-off points in funnel

## Monitoring

| What | Tool | Dashboard |
|------|------|-----------|
| Frontend errors | Vercel Runtime Logs | vercel.com → wisebox-mvp → Logs |
| Backend errors | Railway Logs (stderr) | railway.app → wisebox → Logs |
| Analytics | Amplitude | app.amplitude.com |
| Uptime | Vercel (built-in) | Deployment status |
| CI/CD | GitHub Actions | github.com → Actions tab |
| Tickets | Linear | linear.app/wiseboxinc |

## Emergency Procedures

### Production is down
1. Check Railway status: `railway service status`
2. Check Vercel: deployment dashboard
3. Check backend logs: `railway service logs --tail 50`
4. If bad deploy: rollback via Vercel/Railway dashboard

### User reports bug
1. Get screenshot + steps to reproduce
2. Run `/wisebox-feedback` to create Linear ticket
3. Fix → commit with `WB-XXX` ref → push → auto-deploy
4. Verify fix on production
5. Close ticket with comment

### Secret exposed
1. Rotate immediately in Railway/Vercel env vars
2. Redeploy both services
3. Audit git history for exposure
