# 07 · Jira workflow

- Epic: [EPMRPP-118192](https://jiraeu.epam.com/browse/EPMRPP-118192) (AI Factory EDD Bootcamp PoC).
- Rule: **before starting work on a story, create its frontend sub-task** in the story's Jira issue
  (if one doesn't exist) and record the key in [00-status.md](00-status.md).

## Conventions (decided 2026-09-25)

| Item | Convention |
|------|------------|
| Granularity | One `[FE]` sub-task per story; the plan tasks (T-ids) are listed in its description. Phase 0 goes under US-002 (EPMRPP-121704) |
| When to create | **One at a time, when work on that story starts** — not in advance (decided 2026-09-25) |
| Summary | `[FE] <short scope>` e.g. `[FE] Pipelines iterations list` |
| Labels | `ai-factory-poc`, `frontend` |
| Assignee | **Saveli_Savich@epam.com** (the script assigns the token owner by default, which is the same person; set `JIRA_ASSIGNEE` if the Jira username differs) |
| Description | FE scope (T-ids), link to this folder, mock/BE status, notes |
| Status flow | as in [docs/11-JIRA.md](../11-JIRA.md): In Progress → Code review (PR link in comments) → Testing |
| Branch | from `bootcamp-prototype`: `EPMRPP-<subtask>-<short-desc>`. **In practice** (2026-09-28): while nothing under a sub-task is pushed yet, small same-sub-task tasks stack as separate commits on one branch (e.g. all of Phase 0 on `EPMRPP-121765-foundation`), so branching doesn't outrun the base before there's anything to review. Once a branch is pushed / has an open PR, the **next** task for that sub-task starts a fresh branch from `bootcamp-prototype` instead of stacking further |
| PR | into `bootcamp-prototype`, title `EPMRPP-<subtask> \|\| <summary>` (repo convention, e.g. `EPMRPP-121541 \|\| Invalidate …`); one PR can cover several commits/tasks when they share a branch as above |

## Story → sub-task registry

Keep this in sync with 00-status (the status file is the source of truth for progress).

| Story | Parent | FE sub-task | Title to use |
|-------|--------|-------------|--------------|
| 001 | EPMRPP-121674 | — | `[FE] AI Factory data model and mock backend` (covered by EPMRPP-121765) |
| 002 | EPMRPP-121704 | **[EPMRPP-121765](https://jiraeu.epam.com/browse/EPMRPP-121765)** ✅ | `[FE] Pipelines iterations list + FE foundation` (holds Phase 0: T0.2–T0.7, T1.1–T1.2) |
| 003 | EPMRPP-121705 | — | `[FE] Iteration details by stage` |
| 004 | EPMRPP-121706 | — | `[FE] Compare two iterations` |
| 005 | EPMRPP-121673 | — | `[FE] Pipeline settings: Auto-Ready` |
| 006 | EPMRPP-121675 | — | (no FE sub-task by default) |
| 007 | EPMRPP-121676 | — | `[FE] Draft/Ready lifecycle display and history` |
| 008 | EPMRPP-121677 | — | `[FE] Library review queue, AI columns, side panel` |
| 009 | EPMRPP-121678 | — | `[FE] AI evaluation panel` |
| 010 | EPMRPP-121679 | — | `[FE] Generation cost and iteration links` |
| 011 | EPMRPP-121681 | — | `[FE] Review comments on steps` |
| 012 | EPMRPP-121703 | — | `[FE] Push review comments to agent` |
| 013 | EPMRPP-121682 | — | `[FE] Approve / Mark as ready` |
| 014 | EPMRPP-121683 | — | `[FE] Ready-only Test Plan and Launch gate` |
| 015 | EPMRPP-121671 | — | `[FE] Send Ready Test Cases to automation` |
| 016 | EPMRPP-121672 | — | `[FE] Automation iteration view` |
| 017 | EPMRPP-121680 | — | `[FE] Automation results on Test Case` |

## Creating a sub-task

Token: `JIRA_API_TOKEN` (Personal Access Token, sent as `Bearer`) and `JIRA_URL`. They are read from
`service-ui/.env` first, then `../prism-ui/.env.local`.
The PAT was renewed on 2026-09-25 and works. If it returns **HTTP 401** again, generate a new one in Jira
(avatar → Profile → Personal Access Tokens → Create token) and put it into `service-ui/.env` (gitignored).

```bash
# dry run (prints the payload, checks auth and whether an [FE] sub-task already exists)
python3 docs/ai-factory-poc/tools/jira_fe_subtask.py EPMRPP-121704 "Pipelines iterations list"

# create
python3 docs/ai-factory-poc/tools/jira_fe_subtask.py EPMRPP-121704 "Pipelines iterations list" --yes
```

Optional env: `JIRA_ENV_FILE` (another env file), `JIRA_ASSIGNEE` (Jira username),
`JIRA_SUBTASK_TYPE` (if auto-detection of the sub-task type fails).

The script is idempotent (it will not create a second `[FE]` sub-task) and never edits existing issues.
For an AI agent working on the plan: always run the dry run first, show it to the user, and
create only after confirmation.
