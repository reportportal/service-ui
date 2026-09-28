# 02 · Stories → frontend scope → prototype → existing code

For each story: what the **frontend** owns, where it shows up in the **HTML prototype**, and which
**existing service-ui code** it extends (reuse first). Tasks referenced as `T<phase>.<n>` are
defined in [04-implementation-plan.md](04-implementation-plan.md).

Paths are relative to `app/src/`. Abbreviations: **TCL** = `pages/inside/testCaseLibraryPage/`,
**TCList** = `pages/inside/common/testCaseList/`.

## Summary matrix

| Story | Jira | Team (req.) | FE share | Prototype (walkthrough step) | Flow | FE tasks |
|-------|------|-------------|----------|------------------------------|------|----------|
| 001 Report generation iterations | [EPMRPP-121674](https://jiraeu.epam.com/browse/EPMRPP-121674) | Factory + RP BE | Data model + mocks only | Pipelines, iteration (1, 2) | A, D | T0.3, T0.5 |
| 002 Iterations list | [EPMRPP-121704](https://jiraeu.epam.com/browse/EPMRPP-121704) | RP UI | **Full** | Pipelines list (1) | D | T1.1, T1.2 |
| 003 Iteration details | [EPMRPP-121705](https://jiraeu.epam.com/browse/EPMRPP-121705) | RP UI | **Full** | Iteration: stages/panels (2, 4) | C, D | T1.3 |
| 004 Compare | [EPMRPP-121706](https://jiraeu.epam.com/browse/EPMRPP-121706) | RP UI | **Full** | Compare (5) | D | T4.3 |
| 005 Auto-Ready settings | [EPMRPP-121673](https://jiraeu.epam.com/browse/EPMRPP-121673) | RP BE + UI | Settings UI; logic is BE (mocked) | Pipeline settings (3, 6, 12) | A, C, D | T3.4 |
| 006 Upload as Draft | [EPMRPP-121675](https://jiraeu.epam.com/browse/EPMRPP-121675) | Factory + RP BE | Display only (Upload panel, Library data) | Upload panel, Library (3) | A | T1.3, T0.5 |
| 007 Draft/Ready lifecycle | [EPMRPP-121676](https://jiraeu.epam.com/browse/EPMRPP-121676) | RP BE + UI | Badges, toast, History | Library, case page, History, Edit Scenario (7, 13, 15) | A, B | T2.1 |
| 008 Review queue + side panel | [EPMRPP-121677](https://jiraeu.epam.com/browse/EPMRPP-121677) | RP UI | **Full** | Library, side panel (7, 8) | A, B, D | T2.2, T2.3, T2.4 |
| 009 AI evaluation | [EPMRPP-121678](https://jiraeu.epam.com/browse/EPMRPP-121678) | RP UI | **Full** | Side panel, case page (8, 9, 14) | A, B, C | T2.5 |
| 010 Cost + iteration links | [EPMRPP-121679](https://jiraeu.epam.com/browse/EPMRPP-121679) | RP UI | **Full** | Case page TC103 (10) | A, B, C | T2.6 |
| 011 Review comments | [EPMRPP-121681](https://jiraeu.epam.com/browse/EPMRPP-121681) | RP BE + UI | **Full** UI | TC106 Steps, TC104 Text (11, 14) | A, B, C | T3.1 |
| 012 Push to agent | [EPMRPP-121703](https://jiraeu.epam.com/browse/EPMRPP-121703) | Factory + RP | Push, running state, results, diff | TC106 success, TC107 failure (4, 12) | A, B, C | T3.3 |
| 013 Approve / Mark as ready | [EPMRPP-121682](https://jiraeu.epam.com/browse/EPMRPP-121682) | RP BE + UI | **Full** UI | Header, side panel, Edit Scenario (13, 15) | A, B, C | T3.2 |
| 014 Ready-only plan/launch | [EPMRPP-121683](https://jiraeu.epam.com/browse/EPMRPP-121683) | RP BE + UI | Gates, banners | Disabled buttons, bulk, TC108 banner (8, 15) | A, B | T4.1, T4.2 |
| 015 Automate | [EPMRPP-121671](https://jiraeu.epam.com/browse/EPMRPP-121671) | Automation + RP | Action + dialog | ⋯ menu, Automation section, bulk, dialog (16) | A, B | T5.1 |
| 016 Automation iterations | [EPMRPP-121672](https://jiraeu.epam.com/browse/EPMRPP-121672) | Automation + RP | Automation variant of Pipelines | Test automation · Iteration #1/#2 (16) | A, D | T1.3 (variant), T5.2 |
| 017 Results on case | [EPMRPP-121680](https://jiraeu.epam.com/browse/EPMRPP-121680) | Automation + RP | Automation section, Launch ↔ case links | TC101 Automation, Launches (17) | A | T5.3, T5.4 |

**Walkthrough parity.** The prototype has an 18-step walkthrough. The PoC demo is "done" when all
18 steps can be reproduced in the real UI on mocks. The checklist is in
[04-implementation-plan.md § Demo parity](04-implementation-plan.md#demo-parity-checklist).

---

## Pipelines (new page) — US-002, 003, 004, 005, 016

**Design language:** Vitalii mockups PL-01, PL-02, PL-05 (not in the repo; the prototype
approximates them). The prototype is in a *different* visual language from TMS. **Recommendation:**
build it from our own UI-kit components (cards, Chip, Table, Button, Tooltip) and match the
prototype's *structure*, not its pixels. Ask the designer for Figma frames if exact visuals matter.

| Prototype element | Build with (reuse) | New code |
|-------------------|--------------------|----------|
| Page shell: breadcrumbs `All > Pipelines`, Refresh | `pages/inside/common/pageHeaderWithBreadcrumbsAndActions`, ui-kit `Button` | `pages/inside/aiFactory/pipelinesPage/` |
| Search field | `components/fields/searchField` | — |
| Pipeline group (collapsible, header meta) | `components/collapsibleSection` | `pipelineGroup/` |
| Iteration card (status badge, meta, stage chips, attribute chips) | ui-kit `Chip`, existing attribute chips (`AdaptiveTagList`) | `iterationCard/`, `stageChip/`, `iterationStatusBadge/` |
| Empty / no match states | `pages/inside/common/emptyStatePage`, `pages/common/emptyPageState` | messages |
| Iteration header KPIs | — | `iterationHeader/`, `kpiTile/` |
| Status banner + "Open review queue" | ui-kit `SystemMessage` / `pages/inside/common/infoPanel` | `iterationStatusBanner/` |
| Stage cards with arrows, selectable | — | `stageCards/` |
| Stage panels (Create / Grade / Upload / Review / automation per-case) | ui-kit `Table`, `componentLibrary/plainTable` | `stagePanels/*` |
| Grade row expanding to failure reasons | ui-kit `Table` with expandable rows or custom row | `gradeTable/` |
| Token usage key-value list | `pages/inside/common/fieldSection` | `tokenUsage/` |
| Score bar | `testPlansPage/testPlansTable/progressBar` (check fit) or tiny new | `scoreBar/` (shared) |
| Compare: selects, stage row, metrics table with Δ | ui-kit `Dropdown`, `Table` | `compareIterationsPage/`, `deltaCell/` |
| Pipeline settings: toggle + threshold | ui-kit `Modal`, `Toggle`, `FieldNumber` (redux-form like other TMS modals) | `pipelineSettingsModal/` |

**Routes (proposal, see [03](03-frontend-architecture.md#routing)):**
`/organizations/:org/projects/:project/pipelines`,
`…/pipelines/:pipelineId/iterations/:iterationId?stage=grade`,
`…/pipelines/compare?pipeline=&baseline=&candidate=`. Settings is a modal (no route).

**Story notes**
- **002:** outcome line, meta and chips differ for automation iterations (TC ids instead of
  requirement, `mr:` chip, "N of N implemented · Launch #12"). The group header shows "Auto-Ready
  ON ≥ 90" for generation only. Never use the word "Launch" for an iteration, and add no tabs.
- **003:** Grade is the default stage (automation: Develop). The Review stage shows `Done`, not
  `Passed`. Deep links only; there is no "go to Library" button. "Open review queue" → Library
  with `status=DRAFT&ai=AI&iteration=<id>`. Case title links → case details.
- **004:** only iterations of the selected pipeline are offered; changing the pipeline resets to its
  two latest. Direction per metric: score ↑ is better, cost/duration ↓ is better, Test Cases is neutral.
- **005:** Settings for generation only; automation shows "has no settings in the PoC". Validation
  message, read-only for roles without rights, note "Applies from the next upload or fix round".
- **016:** same list/details/compare with automation stages, including `Skipped` status; the
  Prepare panel note says "Source: Test Case Library (not Jira)"; the header shows MR and
  Launch links.

---

## Test Case Library (overlay on the existing page) — US-007, 008, 013, 014, 015

Principle: **extend existing TMS components through small injection points**. Keep the AI parts in
separate components under `pages/inside/aiFactory/…` and render them only when the feature flag is
on and the data is present (F11).

| Prototype element | Existing code to extend | New code |
|-------------------|-------------------------|----------|
| AI chip next to ID (tooltip source) | `TCList/testCaseNameCell/testCaseNameCell.tsx` | `aiFactory/common/aiChip/` |
| Row flags "N comments not sent", "agent fixing" | same name cell (tags row) | `aiFactory/common/reviewFlags/` |
| Columns **Status**, **AI quality** before Last execution | `TCList/testCaseList.tsx` (ui-kit `Table`, currently 2 columns) | `lifecycleBadge/`, `aiQualityCell/` |
| Quick filters Status × AI, Review queue · N, Iteration chip, Clear | `TCL/allTestCasesPage/allTestCasesPage.tsx` title row; filters in URL like `filterPriorities` (`filterSidePanel/utils.ts`) | `aiFactory/library/quickFilters/` (ui-kit `SegmentedControl`, `Chip`) |
| Bulk: Approve, Add to Launch, Add to Test Plan, Automate (+ skip reports) | bulk bar in `allTestCasesPage.tsx` (ui-kit `Selection`/`BulkPanel`, `batch*Modal`) | `bulkApprove`, gate wrappers |
| Empty result "No Test Cases match these filters" | `pages/inside/common/noResultsForFilter` | message |
| Create / Import / Duplicate → Draft without AI | BE behavior; UI shows badge | — |

## Side panel — US-008, 009, 013, 014

| Prototype element | Existing code | New code |
|-------------------|---------------|----------|
| Status badge, AI chip, `★ N`, "N comment(s) not sent" under ID / Created | `TCList/testCaseSidePanel/testCaseSidePanel.tsx` header | `aiFactory/common/caseStatusRow/` |
| Draft hint + **In plan · Launch blocked** banner | same header area | `draftHint/`, `planBlockedBanner/` |
| **AI evaluation** section after Tags (bars, cost, iteration link) | `COLLAPSIBLE_SECTIONS_CONFIG` + `components/collapsibleSection` | `aiFactory/evaluation/evaluationMini/` |
| Scenario per template | `testCaseSidePanel/scenario/scenario.tsx` (already does Text/Steps) | step comment count (optional) |
| Footer: Add to Launch / Test Plan disabled for Draft + tooltip; primary **Approve** / **Mark as ready** | footer of side panel, `addToLaunchButton.tsx` | `approveButton/` (shared with header) |

⚠ The footer holds five buttons for a Draft case: check it at 360 px (scope review UX note).

## Test Case details page — US-007, 009, 010, 011, 012, 013, 014, 015, 017

| Prototype element | Existing code | New code |
|-------------------|---------------|----------|
| Header: badge + AI chip + `★ N` next to name; **Approve / Mark as ready** right of existing buttons; Add to Launch / Test Plan disabled for Draft | `TCL/testCaseDetailsPage/testCaseDetailsHeader/testCaseDetailsHeader.tsx` | reuse `approveButton/`, `lifecycleBadge/` |
| ⋯ menu: **Automate** (disabled for Draft with hint) | header ⋯ menu items | menu item |
| Left column sections: AI evaluation, Generation cost, Pipeline, Automation, History | details sidebar (Tags, Description) | `evaluationPanel/`, `generationCost/`, `pipelineLinks/`, `automationSection/`, `lifecycleHistory/` |
| **AI review strip** above Requirements | main content config `MAIN_CONTENT_COLLAPSIBLE_SECTIONS_CONFIG` | `aiFactory/review/reviewStrip/` |
| Comment icon + thread on Precondition row / each Step row (Steps), on Precondition / Instructions+Expected block (Text) | `testCaseDetailsPage/precondition`, `stepsList`, `step`; `pages/inside/common/scenario/scenario.tsx` | `aiFactory/review/commentButton/`, `commentThread/` |
| "Agent is fixing… · Fix round K" state, disabled Edit Scenario | header + strip | polling hook `useFixRoundStatus` |
| **What the agent changed** modal | ui-kit `Modal` via `useModal` + `withModal` | `agentChangesModal/` |
| Discard comments confirmation | ui-kit `Modal` | `discardCommentsModal/` |
| Rubric help modal | ui-kit `Modal` | `rubricModal/` |
| Edit Scenario: hint + checkbox "Approve / Mark as ready along with these changes" | `TCL/editScenarioModal/editScenarioModal.tsx` (redux-form) | footer checkbox and hint |
| Toast "Scenario changed — status set to Draft" | `useNotification` (add keys to `notificationList`) | message keys |
| History of lifecycle events | existing **History of actions** sub-route (`TCL/historyOfActions/`) | decide: new section or activity entries — see Q-FE-01 |

## Test Plans / Launches — US-014, 017

| Prototype element | Existing code | New code |
|-------------------|---------------|----------|
| Test Plan page: Launch disabled + "Launch blocked: N Draft Test Cases" with links (**not prototyped**) | `pages/inside/testPlansPage/testPlanDetailsPage/testPlanDetailsPage.tsx`, `testPlanActions/`, `testPlanModals/createLaunchModal/` | `launchBlockedBanner/` |
| Draft badge on cases inside a plan | `testPlanFolders/allTestCasesPage/` (reuses `TestCaseList`) | reuse `lifecycleBadge/` |
| Launch page: link from test item to Library case | `pages/inside/common/itemInfo/itemInfo.jsx` (additional-info), `testItemDetailsModal.jsx:229` | `libraryCaseLink/` |
| Launch ↔ automation iteration link | launch info / attributes (`pipeline:<iteration>`) | link renderer |

---

## Coverage of the flows (A–D) by FE tasks

| Flow node group | Tasks |
|-----------------|-------|
| A: generation iteration, stages, failure branches | T1.2, T1.3 (display only; the branches are mock scenarios) |
| A/B: Auto-Ready check, Review queue | T2.3, T3.4 (settings), mock engine (T0.5) |
| B: entry paths (queue preset, iteration deep link, browse), empty state, bulk | T2.3, T3.2, T4.1, T5.1 |
| B: side panel decide / Open Details / manual vs AI | T2.4, T3.2 |
| B/C: comments → push → fix round → diff → Auto-Ready | T3.1, T3.3 |
| B: Edit Scenario → Obsolete / Draft / along-with | T3.2 |
| A: Ready → plan / launch / automate / demote | T4.1, T4.2, T5.1 |
| A: automation iteration → Launch → case result | T1.3 (variant), T5.2, T5.3, T5.4 |
| D: list, inspect, compare, tune Auto-Ready (permissions) | T1.2, T1.3, T4.3, T3.4, T6.1 |
