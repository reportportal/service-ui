# 00 · Status board — AI Factory PoC (frontend)

> **Single source of truth for progress.** Update at the start and end of every task / session.
> Legend: ⬜ todo · 🟨 in progress · 🟦 in review · ✅ done · ⛔ blocked · ➖ skipped

**Last updated:** 2026-09-28 · **Branch:** `EPMRPP-121765-foundation` (off `bootcamp-prototype`) · **Phase:** 0 (foundation)

## Now / next

| | |
|---|---|
| Current task | T0.4 URL helpers — implemented, not yet pushed |
| Next task | T0.5 mock backend (spike overlay first) — under EPMRPP-121765 |
| Blockers | none |
| Waiting on answers | Q-ORG-04b demo date, Q-ORG-07 demo project for seeding, Q-BE-01 (F8 contract shape), BA questions in 06 |
| Standing rules | Toggle OFF = no change to current functionality (03 §3) · branch from `bootcamp-prototype`, PR back into it · `[FE]` sub-task per story, created **when that story starts**, assignee Saveli_Savich@epam.com · after every task record the senior-developer hour estimate **in [08-estimations.md](08-estimations.md)** |

## Tasks

Estimates are **not** kept here — they live in [08-estimations.md](08-estimations.md).

| ID | Task | Story | Status | Jira FE sub-task | Branch / PR | Notes |
|----|------|-------|--------|------------------|-------------|-------|
| T0.1 | Requirements digest + plan docs | all | ✅ | — | `bootcamp-prototype` | v0.1, 2026-09-25 |
| T0.2 | Feature toggle | all | 🟨 | EPMRPP-121765 | `EPMRPP-121765-foundation` (not pushed yet) | `isAiFactoryEnabled`/`useAiFactoryEnabled` in `controllers/aiFactory/`, default OFF, no consumers yet |
| T0.3 | Types + format utils | 001 | 🟨 | EPMRPP-121765 | `EPMRPP-121765-foundation` (not pushed yet) | `types/aiFactory.ts` (mirrors 05 §1–8), `common/utils/aiFactoryFormatUtils.ts` (`formatCost`, `formatTokens`); reuses existing `formatDuration` |
| T0.4 | URL helpers | all | 🟨 | EPMRPP-121765 | `EPMRPP-121765-foundation` (not pushed yet) | new block in `common/urls.js`: `tmsPipeline*`, `testCaseAi`/`Lifecycle*`/`ReviewComment*`/`FixRounds`, `tmsAutomation*` (P/C/L/R/F/A ids from 05) |
| T0.5 | Mock backend (adapter, DB, seed, engine, overlay) | 001, 006 | ⬜ | EPMRPP-121765 | | spike overlay first |
| T0.6 | Shared atoms + usePolling | all | ⬜ | EPMRPP-121765 | | |
| T0.7 | Permissions helpers | 005, 012, 013 | ⬜ | EPMRPP-121765 | | F15 |
| T1.1 | Routes + sidebar + pipelines controller | 002 | ⬜ | EPMRPP-121765 | | |
| T1.2 | Iterations list | 002, 016 | ⬜ | EPMRPP-121765 | | |
| T1.3 | Iteration details + stage panels | 003, 006, 016 | ⬜ | | | |
| T2.1 | Lifecycle display + history + toast | 007 | ⬜ | | | Q-BA-01 |
| T2.2 | Library columns + AI chip + flags | 008 | ⬜ | | | |
| T2.3 | Quick filters + Review queue + iteration chip (URL) | 008 | ⬜ | | | |
| T2.4 | Side panel additions | 008, 009, 014 | ⬜ | | | 360 px check |
| T2.5 | AI evaluation panel + rubric | 009 | ⬜ | | | |
| T2.6 | Generation cost + pipeline links | 010 | ⬜ | | | |
| T3.1 | Review comments + AI review strip | 011 | ⬜ | | | Q-BA-03 |
| T3.2 | Approve / Mark as ready (+ bulk, Edit Scenario checkbox) | 013, 007, 008 | ⬜ | | | |
| T3.3 | Push to agent + fix round states + diff modal | 012, 005 | ⬜ | | | |
| T3.4 | Pipeline settings modal | 005 | ⬜ | | | |
| T4.1 | Ready-only gate + In plan · Launch blocked | 014 | ⬜ | | | |
| T4.2 | Test Plan page launch-blocked banner | 014 | ⬜ | | | Q-BA-04 |
| T4.3 | Compare iterations | 004 | ⬜ | | | |
| T5.1 | Automate action + Send to automation dialog | 015 | ⬜ | | | |
| T5.2 | Automation iteration progress | 016 | ⬜ | | | |
| T5.3 | Automation section on case | 017 | ⬜ | | | |
| T5.4 | Launch ↔ case links | 017 | ⬜ | | | Q-FE-07 |
| T6.1 | Roles / read-only states | — | ⬜ | | | |
| T6.2 | BE integration per endpoint group | — | ⬜ | | | see 05 §0 |
| T6.3 | i18n, a11y, responsive | — | ⬜ | | | |
| T6.4 | Demo rehearsal (parity checklist) | — | ⬜ | | | |
| T6.5 | Toggle-OFF regression pass | — | ⬜ | | | before each merge |

## Estimates

All senior-developer hour estimates and the phase roll-up: **[08-estimations.md](08-estimations.md)**.
Current total recorded: **20 h** (T0.1) of a planned **564 h ≈ 14 weeks**.

## Session log

Append one line per working session (newest first): date · who · what changed · next step.

| Date | Who | What | Next |
|------|-----|------|------|
| 2026-09-28 | Claude + Saveli | T0.4 implemented: new URL-helper block in `common/urls.js` (`tmsPipeline`, `tmsPipelineIterations`, `tmsPipelineIterationById`, `tmsPipelineSettings`, `testCaseAi`, `testCaseLifecycle`, `testCaseLifecycleBatch`, `testCaseReviewComments`, `testCaseReviewCommentById`, `discardTestCaseReviewComments`, `testCaseFixRounds`, `tmsAutomationEnvironments`, `tmsAutomation`), each commented with its 05 contract id. No test file (matches: `urls.js` has zero existing test coverage in this codebase); verified with a throwaway smoke test, deleted after. Lint clean | commit T0.4, then T0.5 mock backend |
| 2026-09-28 | Claude + Saveli | T0.3 implemented: `types/aiFactory.ts` (enums + RS/Payload types mirroring 05 §1–8), `common/utils/aiFactoryFormatUtils.ts` (`formatCost`, `formatTokens`, unit-tested); reused the existing `formatDuration`. Same branch `EPMRPP-121765-foundation` (renamed from `-feature-toggle`: it now covers the whole Phase 0 foundation, one commit per task — see the branching note below). Lint/type-check/tests clean | commit T0.3, then T0.4 URL helpers |
| 2026-09-28 | Claude + Saveli | T0.2 implemented: `controllers/aiFactory/featureFlag.ts` (+ `index.ts`, unit tests), default OFF, no consumers yet. Lint/type-check/tests clean. Branch `EPMRPP-121765-foundation` off `bootcamp-prototype` (docs committed there first) | T0.3 |
| 2026-09-25 | Claude + Saveli | Jira PAT renewed; created **EPMRPP-121765** `[FE] Pipelines iterations list + FE foundation` under US-002. New rule: after every task record the senior-developer hour estimate — all estimations moved to **08-estimations.md** (T0.1 = 20 h) | T0.2 feature toggle |
| 2026-09-25 | Claude + Saveli | Process decided: feature toggle mandatory (OFF = no change), per-task branches → PR into `bootcamp-prototype`, `[FE]` sub-task per story, local-only with the remote backend (overlay mocks), one dev. Docs 03/04/06/07 updated | Renew Jira PAT, create the US-002 sub-task, start T0.2 |
| 2026-09-25 | Claude + Saveli | Read epic / 5 features / 17 stories / prototype / flows / scope review; mapped existing TMS code; wrote docs 00–07 + Jira helper | Answer ORG questions, renew Jira PAT, start T0.2 |
