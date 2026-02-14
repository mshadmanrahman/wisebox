---
tags:
  - VibeCoding
  - VibeCoding/Hobby
  - Wisebox
---

# Remote GitHub Ops Runbook (for local execution)

Because Codex sandbox may not have outbound network access, run these commands locally to complete GitHub operations.

## 1) Review existing issues and PRs

```bash
gh issue list -R mshadmanrahman/wisebox --state all --limit 50
gh pr list -R mshadmanrahman/wisebox --state all --limit 50
```

## 2) Create Phase 4 progress issue

```bash
gh issue create \
  -R mshadmanrahman/wisebox \
  --title "Phase 4 progress tracking: consultant workflow & ticketing" \
  --body-file docs/github/phase4-progress-issue.md
```

## 3) Open PR for consultant workspace slice

```bash
# create and switch branch from current HEAD
git checkout -b phase4-consultant-workspace-calendly

# push branch
git push -u origin phase4-consultant-workspace-calendly

# open PR
gh pr create \
  -R mshadmanrahman/wisebox \
  --base main \
  --head phase4-consultant-workspace-calendly \
  --title "Phase 4: consultant workspace APIs + Calendly webhook flow" \
  --body-file docs/github/pr-phase4-consultant-workspace.md
```

## 4) Optional: quick status checks after PR creation

```bash
gh pr view -R mshadmanrahman/wisebox --web
gh pr checks -R mshadmanrahman/wisebox
```


## Related
- [[Vibe Coding/_hobby/README|Hobby Projects Index]]
