---
name: wisebox-feedback
description: Intake user feedback and create prioritized Linear tickets for Wisebox
user_invocable: true
---

# Wisebox Feedback Intake

When the user shares feedback (from WhatsApp, meetings, testing, user reports), process it into actionable Linear tickets.

## Steps

1. **Parse the feedback** — Extract:
   - What's the issue or request?
   - Is it a bug, enhancement, or new feature?
   - Which part of the app? (User Portal, Consultant Portal, Admin, Landing, Assessment, etc.)
   - How severe? (blocks user, annoying, nice-to-have)
   - Steps to reproduce (if bug)

2. **Create Linear ticket** via API (`$LINEAR_API_KEY` env var):
   - Team: Wiseboxinc (`1721427b-41c3-41a5-bed8-b5f94593d420`)
   - State: Todo (`1382f789-7ae6-4593-91b2-3d4848e67dec`)
   - Priority: 1=Urgent, 2=High, 3=Medium, 4=Low
   - Labels (pick relevant):
     - Bug: `be3266ad-7482-45d3-aff8-86827208ec08`
     - Enhancement: `5b651696-773a-4cba-908b-fadee8d71c90`
     - Feature: `ea358575-f298-419f-8899-451866376181`
     - User Portal: `8e457028-ba9d-45cc-8484-5be80b1b7f5f`
     - Consultant Portal: `a3ee7557-c3c3-4a0d-9b0c-f3ada15d53b3`
     - Admin Panel: `bb037f3f-3c8a-49b8-adb7-ca4de7bde3b9`
     - i18n: `e4244345-786b-4003-a8d0-4b8d0bd4187b`
     - auth: `02f9db6a-200f-490d-b24f-37ef041c43ad`
     - infrastructure: `68392767-9cf1-4c59-bc46-7b1110cdb79e`

3. **Assign** based on the fix type:
   - UI/frontend/design → Sakib (note in description: "Assign to Sakib")
   - Backend/API/infra → Rahman (note in description: "Assign to Rahman")
   - Both needed → create 2 sub-tickets

4. **Report back** with:
   - Ticket number (WB-XXX)
   - Title
   - Priority
   - Who should work on it

## GraphQL Template

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"mutation { issueCreate(input: { teamId: \"1721427b-41c3-41a5-bed8-b5f94593d420\", title: \"TITLE\", description: \"DESCRIPTION\", priority: PRIORITY, stateId: \"1382f789-7ae6-4593-91b2-3d4848e67dec\", labelIds: [\"LABEL_IDS\"] }) { success issue { identifier url } } }"}'
```

## Example

User says: "The consultation booking page doesn't show the price on mobile"

→ Creates:
- Title: "Consultation booking page doesn't show price on mobile"
- Priority: 3 (Medium)
- Labels: Bug, User Portal
- Description: "## Bug\n\nConsultation booking page doesn't display service price on mobile viewport.\n\n## Steps to Reproduce\n1. Open /workspace/services on mobile\n2. Select a consultation service\n3. Price is not visible\n\n## Assignment\nAssign to Sakib (UI/responsive fix)"
