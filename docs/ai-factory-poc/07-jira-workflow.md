# 07 · Jira workflow

- Epic: [EPMRPP-118192](https://jiraeu.epam.com/browse/EPMRPP-118192) (AI Factory EDD Bootcamp PoC).
- Rule: **before starting a frontend scope, create its frontend sub-task** in the relevant story's Jira issue
  (if one doesn't exist) and record the key in [00-status.md](00-status.md).

## Conventions (decided 2026-09-25)

| Item | Convention |
|------|------------|
| Granularity | A `[FE]` sub-task must be no larger than **36 h (≈ 5 SP)**. Split a story or cross-cutting foundation into multiple cohesive sub-tasks when needed; list the covered T-ids in each description |
| When to create | **One at a time, when work on that story starts** — not in advance (decided 2026-09-25) |
| Summary | `[FE] <short scope>` e.g. `[FE] Pipelines iterations list` |
| Labels | `ai-factory-poc`, `frontend` |
| Assignee | **Saveli_Savich@epam.com** (the script assigns the token owner by default, which is the same person; set `JIRA_ASSIGNEE` if the Jira username differs) |
| Description | FE scope (T-ids), link to this folder, mock/BE status, notes |
| Estimate | Set **Original Estimate when the sub-task is created** and immediately add a Jira comment with the research / implementation / validation breakdown. The value must match [08-estimations.md](08-estimations.md) and remain ≤ 36 h |
| Status flow | as in [docs/11-JIRA.md](../11-JIRA.md): In Progress → Code review (PR link in comments) → Testing |
| Branch | from `bootcamp-prototype`: `EPMRPP-<subtask>-<short-desc>`. **In practice** (2026-09-28): while nothing under a sub-task is pushed yet, small same-sub-task tasks stack as separate commits on one branch (e.g. all of Phase 0 on `EPMRPP-121765-foundation`), so branching doesn't outrun the base before there's anything to review. Once a branch is pushed / has an open PR, the **next** task for that sub-task starts a fresh branch from `bootcamp-prototype` instead of stacking further |
| PR | into `bootcamp-prototype`, title `EPMRPP-<subtask> \|\| <summary>` (repo convention, e.g. `EPMRPP-121541 \|\| Invalidate …`); one PR can cover several commits/tasks when they share a branch as above |

## Story → sub-task registry

Keep this in sync with 00-status (the status file is the source of truth for progress).

| Story | Parent | FE sub-task | Title to use |
|-------|--------|-------------|--------------|
| 001 | EPMRPP-121674 | covered by **[EPMRPP-121833](https://jiraeu.epam.com/browse/EPMRPP-121833)** under EPMRPP-121704 | `[FE] AI Factory mock backend` (T0.5) |
| 002 | EPMRPP-121704 | **[EPMRPP-121829](https://jiraeu.epam.com/browse/EPMRPP-121829)** ✅ · **[EPMRPP-121833](https://jiraeu.epam.com/browse/EPMRPP-121833)** ✅ · **[EPMRPP-121765](https://jiraeu.epam.com/browse/EPMRPP-121765)** ✅ · **[EPMRPP-121834](https://jiraeu.epam.com/browse/EPMRPP-121834)** ✅ · **[EPMRPP-122039](https://jiraeu.epam.com/browse/EPMRPP-122039)** ✅ · **[EPMRPP-122040](https://jiraeu.epam.com/browse/EPMRPP-122040)** ✅ · **[EPMRPP-122041](https://jiraeu.epam.com/browse/EPMRPP-122041)** ✅ · **[EPMRPP-122042](https://jiraeu.epam.com/browse/EPMRPP-122042)** ✅ | Foundation · mock backend · pipelines routes/list · iteration details · T6.1 roles/read-only hardening · T6.2-G1 LP1/LP2 catalog foundation · T6.2-G2 LP3 generic-detail foundation · `[FE] AI Factory accessibility and responsive hardening` (T6.3), branch `EPMRPP-122042-ai-factory-a11y-responsive`; actual 8 h with 2 h research / 4 h implementation / 2 h validation. Focused 9 suites / 62 tests and full Jest 156 suites / 1421 tests PASS with the existing open-handle warning; Node 20 type-check, full lint (199 warnings), diff-check, final code validation after one Major `aria-haspopup` fix and security validation with no findings PASS. Runtime compile succeeded; authenticated 360 px browser validation was not performed. `manage:translations:test` remains blocked by repository-wide existing duplicate/unstable localization backlog; no generated locale changes or localization-sync claim |
| 003 | EPMRPP-121705 | covered by **[EPMRPP-121834](https://jiraeu.epam.com/browse/EPMRPP-121834)** under EPMRPP-121704 | `[FE] Iteration details by stage` (T1.3) |
| 004 | EPMRPP-121706 | **[EPMRPP-122034](https://jiraeu.epam.com/browse/EPMRPP-122034)** 🟨 | `[FE] Compare two iterations` (T4.3), branch `EPMRPP-122034-compare-iterations` |
| 005 | EPMRPP-121673 | **[EPMRPP-122031](https://jiraeu.epam.com/browse/EPMRPP-122031)** 🟨 | `[FE] Pipeline settings: Auto-Ready` (T3.4) |
| 006 | EPMRPP-121675 | — | (no FE sub-task by default) |
| 007 | EPMRPP-121676 | **[EPMRPP-121982](https://jiraeu.epam.com/browse/EPMRPP-121982)** 🟨 | `[FE] Draft/Ready lifecycle display and history` (T2.1) |
| 008 | EPMRPP-121677 | **[EPMRPP-121987](https://jiraeu.epam.com/browse/EPMRPP-121987)** 🟨 · **[EPMRPP-122016](https://jiraeu.epam.com/browse/EPMRPP-122016)** 🟨 · **[EPMRPP-122024](https://jiraeu.epam.com/browse/EPMRPP-122024)** 🟨 | `[FE] Library AI quality columns and row flags` (T2.2) · `[FE] Library quick filters and review queue` (T2.3) · `[FE] Library side panel additions` (T2.4) |
| 009 | EPMRPP-121678 | **[EPMRPP-122022](https://jiraeu.epam.com/browse/EPMRPP-122022)** 🟨 | `[FE] AI evaluation panel` (T2.5) |
| 010 | EPMRPP-121679 | **[EPMRPP-122025](https://jiraeu.epam.com/browse/EPMRPP-122025)** 🟨 | `[FE] Generation cost and iteration links` (T2.6) |
| 011 | EPMRPP-121681 | **[EPMRPP-122027](https://jiraeu.epam.com/browse/EPMRPP-122027)** 🟨 | `[FE] Review comments and AI review strip` (T3.1) |
| 012 | EPMRPP-121703 | — | `[FE] Push review comments to agent` |
| 013 | EPMRPP-121682 | **[EPMRPP-122029](https://jiraeu.epam.com/browse/EPMRPP-122029)** 🟨 | `[FE] Approve and mark as ready` (T3.2) |
| 014 | EPMRPP-121683 | **[EPMRPP-122032](https://jiraeu.epam.com/browse/EPMRPP-122032)** 🟨 · **[EPMRPP-122033](https://jiraeu.epam.com/browse/EPMRPP-122033)** 🟨 | `[FE] Ready-only Test Plan and Launch gate` (T4.1) · `[FE] Test Plan launch-blocked state` (T4.2) |
| 015 | EPMRPP-121671 | **[EPMRPP-122035](https://jiraeu.epam.com/browse/EPMRPP-122035)** 🟨 | `[FE] Send Ready Test Cases to automation` (T5.1) |
| 016 | EPMRPP-121672 | **[EPMRPP-122036](https://jiraeu.epam.com/browse/EPMRPP-122036)** ✅ | `[FE] Automation iteration view` (T5.2), branch `EPMRPP-122036-automation-iteration-view`; Original Estimate 8 h with 2 h research / 4 h implementation / 2 h validation comment |
| 017 | EPMRPP-121680 | **[EPMRPP-122037](https://jiraeu.epam.com/browse/EPMRPP-122037)** ✅ · **[EPMRPP-122038](https://jiraeu.epam.com/browse/EPMRPP-122038)** ✅ | `[FE] Automation results on Test Case` (T5.3), branch `EPMRPP-122037-automation-results`; Original Estimate 8 h with 2 h research / 4 h implementation / 2 h validation comment · `[FE] Launch and Test Case backlinks` (T5.4), branch `EPMRPP-122038-launch-case-backlinks`; Original Estimate 20 h with 4 h research / 10 h implementation / 6 h validation comment; focused 4 suites / 64 tests and full 149 suites / 1273 tests PASS, full lint exit 0 with 201 existing warnings, type-check/diff-check and senior code/security final rechecks PASS; component-fixture integration only, no fake Launch controller/API; live A3/Launch attribute delivery remains unverified |

## Creating a sub-task

Token: `JIRA_API_TOKEN` (Personal Access Token, sent as `Bearer`) and `JIRA_URL`. They are read from
`service-ui/.env` first, then `../prism-ui/.env.local`.
The PAT was renewed on 2026-09-25 and works. If it returns **HTTP 401** again, generate a new one in Jira
(avatar → Profile → Personal Access Tokens → Create token) and put it into `service-ui/.env` (gitignored).

```bash
# dry run (prints the payload, checks auth and whether an [FE] sub-task already exists)
python3 docs/ai-factory-poc/tools/jira_fe_subtask.py EPMRPP-121704 "Pipelines iterations list" \
  --estimate-hours 20 \
  --estimate-comment "4 h research and Jira scope; 10 h implementation; 6 h tests and review"

# create
python3 docs/ai-factory-poc/tools/jira_fe_subtask.py EPMRPP-121704 "Pipelines iterations list" \
  --estimate-hours 20 \
  --estimate-comment "4 h research and Jira scope; 10 h implementation; 6 h tests and review" \
  --yes
```

Optional env: `JIRA_ENV_FILE` (another env file), `JIRA_ASSIGNEE` (Jira username),
`JIRA_SUBTASK_TYPE` (if auto-detection of the sub-task type fails).

The script is idempotent by exact `[FE]` summary, so one story may hold several independently sized
frontend sub-tasks without creating duplicates. For an existing exact match, `--yes` synchronizes its Original
Estimate and adds the exact breakdown comment only once. Estimate arguments are mandatory so a new sub-task can
never be created by this workflow without both pieces of planning evidence.
For an AI agent working on the plan: always run the dry run first, show it to the user, and
create only after confirmation.
