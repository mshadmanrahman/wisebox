---
name: wisebox-pulse
description: Weekly Wisebox product pulse — Linear status, deployment health, analytics summary
user_invocable: true
---

# Wisebox Weekly Pulse

Generate a weekly product status report covering Linear tickets, deployment health, and usage insights.

## Steps

### 1. Linear Status
Query Linear API for Wisebox team ticket stats:

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query": "{ team(id: \"1721427b-41c3-41a5-bed8-b5f94593d420\") { issues(filter: { updatedAt: { gte: \"SEVEN_DAYS_AGO\" } }) { nodes { identifier title state { name } priority assignee { name } updatedAt } } } }"}'
```

Summarize:
- Tickets completed this week
- Tickets in progress
- Tickets created this week
- Blocked/stale tickets (no update in 7+ days)

### 2. Deployment Health
Check latest deployments:
- Vercel: `mcp__claude_ai_Vercel__list_deployments` for wisebox-mvp
- Railway: `railway service status`
- CI: `gh run list --repo mshadmanrahman/wisebox --limit 5`

Report:
- Last deploy date/time
- CI status (pass/fail)
- Any failed deploys this week

### 3. Production Check
Quick health check:
- Hit the API: `curl -s https://wisebox-mvp.up.railway.app/api/v1/health`
- Check frontend: `curl -s -o /dev/null -w "%{http_code}" https://wisebox-mvp.vercel.app`
- Check error count in Railway logs

### 4. Analytics Insights
Note: Amplitude data needs to be checked manually at app.amplitude.com or via Amplitude API if configured.

Suggest checking:
- New user signups (this week vs last week)
- Properties created
- Documents uploaded
- Consultations booked
- Assessment completions
- Most visited pages
- Drop-off points

### 5. Output Format

```markdown
# Wisebox Weekly Pulse — {date}

## Shipped This Week
- WB-XXX: Title (completed by Person)
- WB-XXX: Title (completed by Person)

## In Progress
- WB-XXX: Title (assigned to Person)

## Backlog Highlights
- X tickets in backlog
- Top priority unstarted: WB-XXX

## Deployment Health
- Frontend: {status} (last deploy: {date})
- Backend: {status} (last deploy: {date})
- CI: {X} runs, {Y} passed, {Z} failed

## Production Status
- API: {healthy/unhealthy}
- Frontend: {healthy/unhealthy}

## Analytics Snapshot
(Check Amplitude for this week's numbers)
- Signups:
- Properties created:
- Documents uploaded:
- Consultations booked:

## Recommendations
- Based on the data, suggest what to build/fix next
```
