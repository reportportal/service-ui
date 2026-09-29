# 04 · Implementation plan

Frontend plan for the AI Factory PoC, built on mocks first. The order follows the requirements'
*Suggested delivery order* (`_index.md`), with a foundation phase added in front. Live progress
is tracked in [00-status.md](00-status.md) only; this file changes only when the plan changes.

**Sizes:** S ≈ ≤ 1 day · M ≈ 2–3 days · L ≈ 4–5 days (one FE dev, including tests and messages).
**Team: one developer (Saveli Savich)**, so the phases run sequentially. The total is about **9–11 dev-weeks**.

## Per-task workflow (Definition of Ready → Done)

1. **Before starting:** make sure the parent story has a Jira `[FE]` sub-task assigned to Saveli_Savich@epam.com,
   and create it if it is missing ([07-jira-workflow.md](07-jira-workflow.md)). Set the task to `In progress` in
   [00-status.md](00-status.md) and fill in the Jira key.
2. **Branch** from the latest `bootcamp-prototype`: `EPMRPP-<fe-subtask>-<short-desc>` (repo convention).
   One branch per plan task (T-id). Several branches may share one story sub-task.
3. Re-read the story ACs ([01](01-knowledge-base.md), source story) and the prototype screen ([02](02-stories-to-ui.md)).
4. Implement **behind the feature toggle** ([03 §3](03-frontend-architecture.md#3-feature-toggle-mandatory-for-every-change)).
   Mock endpoints come first. If the contract changes, update [05](05-backend-contract.md) first.
5. **PR into `bootcamp-prototype`**, title `EPMRPP-<fe-subtask> || <summary>`. Put the PR link in the Jira sub-task.
   Rebase `bootcamp-prototype` on `develop` about weekly (and before a demo) to keep conflicts with TMS small.
6. **DoD:**
   - `npm run lint` and the relevant tests pass;
   - all texts are in `messages.ts`;
   - there are no hardcoded colours;
   - **toggle OFF: behaviour identical to `develop`.** Go through the OFF checklist in 03 §3 and add a toggle-OFF test for every touched existing component;
   - the prototype behaviour for the task is reproduced on mocks;
   - the demo-parity steps for the task are ticked;
   - **the senior-developer hour estimate is recorded in [08-estimations.md](08-estimations.md)** (see below);
   - 00-status is updated (status, PR, notes) and any new questions are logged in [06](06-open-questions.md).

### Senior-developer hour estimate (required after every task)

After a task is implemented, estimate how long **a senior frontend developer working by hand** would
need for the delivered result — not how long the AI-assisted run took — and write it to
**[08-estimations.md](08-estimations.md)**, which is the only place estimates are kept.

Per entry: the total hours, the split analysis / implementation / tests+review, the date, an updated
phase roll-up, and a *Deviation note* when the result differs from the planned size by more than ~30 %.
The method and the sizes (S = 8 h, M = 20 h, L = 36 h) are defined in 08.

---

## Phase 0 — Foundation (no user-visible feature)

| ID | Task | Stories | Size | Depends | Output / DoD |
|----|------|---------|------|---------|--------------|
| T0.1 | Requirements digest and plan docs (this folder) | all | S | — | docs reviewed by the team |
| T0.2 | Feature toggle `show_ai_factory_poc` (default OFF) + `isAiFactoryEnabled()` / `useAiFactoryEnabled()`; route guard helper for the Pipelines thunks; the toggle-OFF test pattern (test util that renders with the toggle on / off) | all (F11) | S | — | `controllers/aiFactory/featureFlag.ts` + unit tests; the OFF checklist in 03 §3 is the review checklist from now on |
| T0.3 | Domain and DTO types `types/aiFactory.ts` (mirror of 05) + format utils (`formatCost`, `formatTokens`, `formatDuration`) | 001, all | S | T0.1 | types compile; utils have unit tests |
| T0.4 | URL helpers in `common/urls.js` (P*, C*, L*, R*, F*, A*) | all | S | T0.3 | one helper per contract endpoint |
| T0.5 | Mock backend: adapter install, DB + seed (port of the prototype data), engine (status, Auto-Ready, fix-round and automation simulation), overlay for TMS test cases, localStorage persistence, Reset demo, per-group switches | 001, 006 + all | L | T0.3, T0.4 | every contract endpoint answers on mocks; smoke test; README in `controllers/aiFactory/mocks/` |
| T0.6 | Shared atoms: `LifecycleBadge`, `AiChip`, `ScoreChip`, `CostLabel`, `IterationStatusBadge`, `StageStatusDot/Label`, `ScoreBar`, `DeltaCell`, `usePolling` | all | M | T0.3 | component tests; light/dark via UI-kit tokens |
| T0.7 | Permissions: `ACTIONS` + helpers (`canReviewAiTestCases`, `canManagePipelineSettings`, `canAutomateTestCases`) | 005, 012, 013 (F15) | S | — | unit tests on the matrix |

**Spike outcome (2026-09-28):** the remote dev backend (`PROXY_PATH`) is reachable and `/api/info` answers as expected —
mode A (overlay) is viable. Authenticating from a script to fetch a live `TestCase` response for a byte-for-byte
shape check was not completed (the OAuth2 password grant needs a real browser session, not a bare curl call), so
`overlay.ts`'s merge logic is verified with a fabricated `TestCase`-shaped fixture instead (`overlay.test.ts`) —
built directly from the existing `types/testCase.ts`, which already reflects what the real UI parses in production.
Actually seeding AI-marked cases into a real project, and detecting a real scenario edit, are deferred until
Q-ORG-07 (target project/folder) is answered — see `controllers/aiFactory/mocks/README.md`.

## Phase 1 — Factory visible: Pipelines (US-002, 003, 016 view)

| ID | Task | Stories | Size | Depends | Output / DoD |
|----|------|---------|------|---------|--------------|
| T1.1 | Routes + sidebar item **Pipelines** + page shell + `controllers/aiFactory/pipelines` (saga, reducer, selectors) | 002 | M | T0.2, T0.4, T0.5 | the route loads data; the item is hidden when the flag is off |
| T1.2 | Iterations list: collapsible pipeline groups (header meta, Auto-Ready ON ≥ T), iteration cards (status, outcome, meta, stage chips, attribute chips), search, Refresh, "No iterations match", empty state, entry points for Compare and Settings | 002, 016 | L | T1.1, T0.6 | prototype walkthrough step 1 reproduced |
| T1.3 | Iteration details: header + KPIs + actions, status banner (+ Open review queue deep link), stage cards (default Grade / Develop), panels Create / Grade (expandable reasons) / Upload / Review (+ fix-rounds table) / automation per-case panels (Prepare note, Skipped), token usage, polling while running | 003, 006 (display), 016 | L | T1.2 | walkthrough steps 2–4 reproduced; running gen #3 updates by polling |

## Phase 2 — Cases in the Library (US-007, 008, 009, 010)

| ID | Task | Stories | Size | Depends | Output / DoD |
|----|------|---------|------|---------|--------------|
| T2.1 | Lifecycle display: badge in the list / side panel / details header; lifecycle **History** section (❓ Q-FE-01); toast on Ready → Draft after an edit | 007 | M | T0.5, T0.6 | priority-only edit keeps Ready; step edit → Draft + toast |
| T2.2 | Library list: columns **Status** and **AI quality** (`★ N` / obsolete, `≈ $`, `Iteration #N ↗`, "—"), AI chip + tooltip next to the ID, row flags (unsent comments, agent fixing) | 008 | M | T2.1 | walkthrough step 7 (list part) |
| T2.3 | Quick filters Status × AI (AND), preset **Review queue · N**, removable **Iteration #N** chip, Clear, URL-bound (`lifecycle`, `ai`, `iteration`), empty result text | 008 | M | T2.2 | deep link from the iteration works; filters survive a reload |
| T2.4 | Side panel additions: status row (badge, AI chip, score, unsent count), Draft hint, **AI evaluation** mini section (bars, cost, iteration link), footer layout for Draft (disabled add buttons + tooltips, primary slot for Approve), check at 360 px | 008, 009, 014 | M | T2.2, T2.5 | walkthrough step 8 |
| T2.5 | **AI evaluation** panel on details: total, 6 criteria rows (score/max + bar), expandable failure reasons, Evaluated / Obsolete line, rubric help modal, `★ N` in the header | 009 | M | T0.6 | walkthrough step 9; no PASS/FAIL anywhere |
| T2.6 | **Generation cost** panel (≈ total, iteration share with formula, fix rounds, tokens, model) + **Pipeline** links section (source → Grade, fix round → Review) | 010 | S | T2.5 | walkthrough step 10 (TC103 ≈ $0.54) |

## Phase 3 — Review loop (US-011, 013, 005, 012)

| ID | Task | Stories | Size | Depends | Output / DoD |
|----|------|---------|------|---------|--------------|
| T3.1 | Review comments: comment icon with count (orange/gray) on the Precondition + each Step (Steps) / Precondition + Instructions-Expected block (Text), thread (author, time, state, delete own pending, input + Add), **AI review strip** (lifecycle, N not sent, Discard with confirmation, Push to agent · N with disabled hint), AI cases only, read-only while fixing | 011 | L | T2.5 | walkthrough steps 11, 14 |
| T3.2 | Approve / Mark as ready: shared `ApproveButton` (header + side panel footer; disabled with hints; obsolete confirmation), bulk **Approve** with skip report, Edit Scenario hint + checkbox "…along with these changes" (Draft only), toasts | 013, 007, 008 | M | T3.1, T2.4 | walkthrough steps 13, 15; bulk skips are named |
| T3.3 | Push to agent: start a fix round (error path: comments stay not sent), "Agent is fixing… · Fix round K" locked state (Approve / Push / Edit Scenario disabled), polling, success (new evaluation, Draft, addressed comments, cost, Auto-Ready result toast), GRADE_FAILED, FAILED (push again / discard), **What the agent changed** modal | 012, 005 | L | T3.1, T3.2, T2.6 | walkthrough step 12 (TC106 success, TC107 failure) |
| T3.4 | Pipeline settings modal: Auto-Ready toggle + threshold (0–100 integer validation), read-only without permission, "applies from next upload" note, automation pipeline "no settings", entry from the list + iteration | 005 | S | T1.2, T0.7 | walkthrough step 6 |

## Phase 4 — Gate and compare (US-014, 004)

| ID | Task | Stories | Size | Depends | Output / DoD |
|----|------|---------|------|---------|--------------|
| T4.1 | Ready-only gate: Add to Launch / Add to Test Plan disabled for Draft (header, side panel, bulk with skip report) with exact hints; **In plan · Launch blocked** banner on the case page and side panel | 014 | M | T2.1, T2.4 | walkthrough steps 8, 15 (TC108 banner) |
| T4.2 | Test Plan page: Draft badges on plan cases, **Launch** disabled + banner "Launch blocked: N Draft Test Cases" with links (not prototyped — keep it minimal, ❓ Q-BA-04) | 014 | M | T4.1 | approve the Draft → Launch enabled |
| T4.3 | Compare iterations page: pipeline / baseline / candidate selects (pipeline change resets to the latest two), stage row with costs, metrics table with Δ and direction colouring, "Different requirements" note, entries from the list + "Compare with previous" | 004 | M | T1.3 | walkthrough step 5 (score +4 better, cost +$0.13 worse) |

## Phase 5 — Automation (US-015, 016, 017)

| ID | Task | Stories | Size | Depends | Output / DoD |
|----|------|---------|------|---------|--------------|
| T5.1 | **Automate**: ⋯ menu item (details), button in the Automation section, bulk action; **Send to automation** dialog (case list, skipped Draft / in-progress / fixing with names, environment select, "Already automated … Automate again?", start error in the dialog) | 015 | M | T4.1 | walkthrough step 16 |
| T5.2 | Automation iteration live progress (Prepare → Develop → Review → Fix/Skipped) via polling; case shows "Automation · In progress · Iteration #N" | 016 | S | T5.1, T1.3 | a new iteration appears in Pipelines |
| T5.3 | **Automation** section on the case: status, last result (+ defect type), links to Launch and iteration, "Scenario changed after automation" | 017 | S | T5.2 | walkthrough step 17 (TC101) |
| T5.4 | Launch ↔ case links: test item → "Library Test Case ↗" (item info + details modal), launch → automation iteration link from the `pipeline:` attribute | 017 | M | T5.3 | links work on the mock Launch (❓ Q-FE-07 on how to mock a real Launch) |

## Phase 6 — Hardening and backend integration (continuous after Phase 3)

| ID | Task | Size | Output |
|----|------|------|--------|
| T6.1 | Roles / read-only states everywhere (F15) | S | permission matrix test |
| T6.2 | Switch endpoint groups from mock to real as the BE lands (per-group switch), update the status board in 05 | per group S | the 05 table goes 🟢 |
| T6.3 | i18n extraction (`npm run manage:translations`), a11y pass (focus, aria for icons and threads), 360 px side panel | S | — |
| T6.4 | Demo rehearsal: run the 18-step parity checklist end to end, reset demo | S | checklist ticked |
| T6.5 | Toggle-OFF regression pass: with the toggle OFF, walk the Library, side panel, details, Edit Scenario, Test Plans, Manual Launches and Launches; compare against `develop` | S | no difference; repeat before each merge of `bootcamp-prototype` |

---

## Dependency graph (short)

```
T0.2 ─┐
T0.3 ─┼─ T0.4 ─ T0.5 ─┬─ T1.1 ─ T1.2 ─ T1.3 ─────────────┬─ T4.3
T0.6 ─┘               │                  └─ T3.4 (+T0.7) │
                      └─ T2.1 ─ T2.2 ─ T2.3              └─ T5.2
                               └─ T2.5 ─ T2.4 ─ T4.1 ─ T4.2
                                  └─ T2.6        └─ T5.1 ─ T5.2 ─ T5.3 ─ T5.4
                                  └─ T3.1 ─ T3.2 ─ T3.3
```

Order for one developer: Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5, with T6.x running continuously.
T0.5 (mocks) and T0.6 (atoms) are prerequisites for everything, so finish them first.

## Jira mapping (FE sub-task parents)

Each `[FE]` sub-task is capped at **36 h (≈ 5 SP)** and assigned to Saveli_Savich@epam.com.
Split a story or cross-cutting scope further when its estimate exceeds that ceiling.

| Story | Jira parent | FE tasks / sub-task allocation |
|-------|-------------|------------------------------------------------------------|
| 001 | EPMRPP-121674 | T0.5 traceability → EPMRPP-121833 (stored as a split sibling under EPMRPP-121704) |
| 002 | EPMRPP-121704 | T0.2–T0.4, T0.6–T0.7 → EPMRPP-121829; T0.5 → EPMRPP-121833; T1.1–T1.2 → EPMRPP-121765; T1.3 → EPMRPP-121834 |
| 003 | EPMRPP-121705 | T1.3 traceability → EPMRPP-121834 (stored as a split sibling under EPMRPP-121704) |
| 004 | EPMRPP-121706 | T4.3 |
| 005 | EPMRPP-121673 | T3.4, T0.7 |
| 006 | EPMRPP-121675 | (display covered by T1.3) — no FE sub-task unless asked |
| 007 | EPMRPP-121676 | T2.1 |
| 008 | EPMRPP-121677 | T2.2, T2.3, T2.4 |
| 009 | EPMRPP-121678 | T2.5 |
| 010 | EPMRPP-121679 | T2.6 |
| 011 | EPMRPP-121681 | T3.1 |
| 012 | EPMRPP-121703 | T3.3 |
| 013 | EPMRPP-121682 | T3.2 |
| 014 | EPMRPP-121683 | T4.1, T4.2 |
| 015 | EPMRPP-121671 | T5.1 |
| 016 | EPMRPP-121672 | T5.2 |
| 017 | EPMRPP-121680 | T5.3, T5.4 |

---

## Demo parity checklist

The 18 walkthrough steps of the prototype, reproduced in the real UI on mocks.

| # | Step | Tasks | ✔ |
|---|------|-------|---|
| 1 | Pipelines: list with both pipelines, cards with status, requirement, stages, score, cost | T1.2 | ☐ |
| 2 | Iteration #1 · Grade: per-case scores, expandable reasons, no PASS/FAIL | T1.3 | ☐ |
| 3 | Upload panel: Draft / Ready (Auto-Ready), "Auto-Ready: 2 of 4 promoted (threshold 90)" | T1.3 | ☐ |
| 4 | Review panel: who made Ready, unsent comments, fix rounds with cost | T1.3 | ☐ |
| 5 | Compare #1 vs #2: suite +4 better, cost +$0.13 worse, duration delta | T4.3 | ☐ |
| 6 | Pipeline settings: toggle + threshold 90, validation, read-only note | T3.4 | ☐ |
| 7 | Library review queue: Status / AI quality columns, AI chip, quick filters, preset | T2.2, T2.3 | ☐ |
| 8 | Side panel TC106: status row, AI evaluation, disabled add buttons, Approve primary | T2.4, T4.1 | ☐ |
| 9 | Case page TC106 (Steps): AI evaluation panel with reasons | T2.5 | ☐ |
| 10 | TC103 cost ≈ $0.54 = share $0.32 + fix round $0.22, links | T2.6 | ☐ |
| 11 | TC106 step 3 comment thread, strip "1 not sent", Approve disabled, Discard | T3.1 | ☐ |
| 12 | Push to agent TC106 → 81 → 92 → Auto-Ready; TC107 first push fails | T3.3 | ☐ |
| 13 | TC103 (88 < 90) Draft: Approve in the header; add buttons disabled | T3.2, T4.1 | ☐ |
| 14 | TC104 Text template: comments on Precondition / scenario block | T3.1 | ☐ |
| 15 | Edit Scenario TC108: hint + "Approve along with these changes"; In plan · Launch blocked | T3.2, T4.1 | ☐ |
| 16 | TC105 ⋯ → Automate → dialog → automation iteration (Fix Skipped) | T5.1, T5.2 | ☐ |
| 17 | TC101 Automation section: Automated, last result Passed, links | T5.3 | ☐ |
| 18 | (User flows tab: prototype only, not built in the product) | — | n/a |
