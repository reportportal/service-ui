# 03 · Frontend architecture (mock-first)

Status: **proposal v0.1**. Items marked ❓ wait for a decision in
[06-open-questions.md](06-open-questions.md).

## 1. Principles

1. **Contract-first mocks.** The UI calls real URL helpers (`common/urls.js`) with the DTOs proposed in
   [05-backend-contract.md](05-backend-contract.md). Mocks answer at the **HTTP level**, so moving
   to the real backend means switching off a handler. No component or saga code changes.
2. **Backend rules live in the mock layer, not in components.** Auto-Ready, iteration status,
   Ready → Draft on scenario change, fix-round results, cost shares and Obsolete are **backend
   behaviour**. The mock engine simulates them. Components only render DTO fields (`lifecycle`,
   `evaluation.state`, `iteration.status`, …). Small UI-only derivations (for example, whether a button is disabled) are
   fine.
3. **Overlay, don't fork.** Existing TMS components get small, flag-guarded injection points. AI
   parts live in separate components under `pages/inside/aiFactory/`. This keeps rebases on
   `develop` cheap, because TMS changes daily.
4. **Follow the TMS house style.** Use TypeScript, a colocated `messages.ts`, SCSS modules with
   `createClassnames`, sagas for route and list data, hooks with `fetch()` for mutations, and
   `useModal` + `withModal` for modals. Everything goes through the ui-kit first.
5. **Everything new sits behind one feature toggle.** With the toggle **OFF**, the product behaves exactly as
   it does on `develop` today: no new UI, no new requests, no changed rules on existing buttons, no mocks installed
   (see §3). With it ON, AI parts still render nothing when their data is null (F11).

## 2. Folder layout (target)

```
app/src/
├── types/aiFactory.ts                      # domain + DTO types (mirror of 05-backend-contract)
├── common/urls.js                          # + AI Factory URL block (aiFactory*)
├── controllers/aiFactory/
│   ├── pipelines/                          # list, iteration, compare — saga-driven
│   │   ├── actionCreators.ts constants.ts reducer.ts sagas.ts selectors.ts types.ts index.ts
│   ├── featureFlag.ts                      # isAiFactoryEnabled / useAiFactoryEnabled
│   └── mocks/                              # mock backend (dev + opt-in demo)
│       ├── index.ts                        # installAiFactoryMocks(axios)
│       ├── db.ts                           # in-memory DB + localStorage persistence + reset
│       ├── seed/                           # fixtures ported from the prototype (TC101…TC108, gen #1–#3, auto #1)
│       ├── engine.ts                       # simulated BE rules (autoReady, status, fix rounds, automation)
│       ├── handlers/                       # axios-mock-adapter routes per resource
│       │   ├── pipelines.ts iterations.ts settings.ts
│       │   ├── testCaseAi.ts comments.ts fixRounds.ts lifecycle.ts automation.ts
│       └── overlay.ts                      # enrich real TMS test-case responses with AI fields
├── pages/inside/aiFactory/
│   ├── common/                             # atoms: lifecycleBadge, aiChip, scoreChip, costLabel,
│   │                                       #        statusBadge, stageStatusDot, scoreBar, deltaCell
│   ├── pipelinesPage/                      # US-002 list
│   ├── iterationPage/                      # US-003/016 details: header, banner, stageCards, stagePanels
│   ├── compareIterationsPage/              # US-004
│   ├── pipelineSettingsModal/              # US-005
│   ├── library/                            # US-008 quickFilters, aiQualityCell, bulk approve, reviewFlags
│   ├── evaluation/                         # US-009 evaluationPanel, evaluationMini, rubricModal
│   ├── cost/                               # US-010 generationCost, pipelineLinks
│   ├── review/                             # US-011/012 reviewStrip, commentButton, commentThread,
│   │                                       #            discardCommentsModal, agentChangesModal, hooks
│   ├── lifecycle/                          # US-007/013 approveButton, lifecycleHistory, planBlockedBanner
│   └── automation/                         # US-015/017 automateModal, automationSection, libraryCaseLink
└── analyticsEvents/…                       # (optional) GA4 events for the demo, later
```

No new path alias is needed. Everything sits under the existing `controllers/`, `pages/`, `types/`
and `common/`.

## 3. Feature toggle (mandatory for every change)

**Rule (decided 2026-09-25):** every part of the AI Factory PoC is behind a single feature toggle.
**Toggle OFF = no difference from current functionality**, so the branch can be merged or demoed with
the feature switched off safely.

| Layer | PoC implementation | Later |
|-------|--------------------|-------|
| Toggle source | localStorage key `show_ai_factory_poc` = `'true'` (anything else = OFF, default OFF), read through `getStorageItem` inside try/catch, the same pattern as `getTmsOverride()` in `controllers/appInfo/utils.js` | server flag `server.features.aiFactory` or a project attribute — BE decides (F11). Only `featureFlag.ts` changes |
| API | `isAiFactoryEnabled()` (plain function, for sagas / routes / sidebar / mocks) + `useAiFactoryEnabled()` (hook) in `controllers/aiFactory/featureFlag.ts`. **The only allowed way to check the toggle** | same API |
| Switch on / off | DevTools console: `localStorage.setItem('show_ai_factory_poc','true'); location.reload()` · off: `localStorage.removeItem('show_ai_factory_poc'); location.reload()` | — |

### What OFF must guarantee (checklist for every PR)

| Area | With the toggle OFF |
|------|---------------------|
| Sidebar / routes | no **Pipelines** item; Pipelines routes redirect to the project's default page (the thunk checks `isAiFactoryEnabled()`) |
| Library list | the same columns (no Status / AI quality), no AI chip, no quick filters, no row flags, the same bulk actions |
| Side panel / details page | the same sections, header and footer buttons; no Approve / Mark as ready, no review strip, no comment icons, no AI / cost / pipeline / automation / history sections |
| **Existing rules** | Add to Launch / Add to Test Plan / plan Launch are enabled or disabled **exactly as today**. The Ready-only gate (US-014) and Draft-on-edit toasts apply only when the toggle is ON |
| Edit Scenario modal | no hint, no "…along with these changes" checkbox; the save payload is unchanged (no `promoteToReady`) |
| Network | no requests to new endpoints; no new query params (`lifecycle`, `ai`, `iteration`) on existing ones; URL params from shared links are ignored |
| Mocks | not installed and the mock chunk is not loaded (the install happens only when the toggle is ON **and** mocks are enabled) |
| Launch pages | no Library-case links, no pipeline links |

### How to implement injection points
- Existing components get **one guarded line** each, e.g. `{isAiFactoryEnabled && <AiQualityCell … />}`, or a column
  list built as `[...baseColumns, ...(isAiFactoryEnabled ? aiColumns : [])]`. The AI logic stays in `pages/inside/aiFactory/…`.
- Changed rules on existing buttons go through one helper, e.g. `getAddToPlanDisabledState(testCase, { aiFactoryEnabled })`.
  With the toggle OFF it returns the current behaviour unchanged.
- **Tests:** every modified existing component gets a test for **toggle OFF → renders and behaves as before**, plus toggle-ON tests.
- Data guard (toggle ON): AI components return `null` when `testCase.ai` / `evaluation` / `lifecycle` are absent.

## 4. Mock layer

### 4.1 How it hooks in
- All HTTP goes through the global `axios.request` in `common/utils/fetch.ts`.
  `axios-mock-adapter` (already a devDependency) is attached to the **global axios instance** and
  registered with `onNoMatch: 'passthrough'`, so every non-AI request still reaches the real backend.
- Install point: `index.jsx`, before `configureStore`, only when **`isAiFactoryEnabled()` AND
  `isAiFactoryMocksEnabled()`** (localStorage `ai_factory_mocks` ≠ `'false'`, so mocks are on by default while
  the toggle is on) **AND** it is not a production build (`!process.env.production`). The code is loaded through
  a dynamic `import()`, so it becomes a separate chunk that is never fetched unless enabled. Decided: the PoC
  runs **locally only** (`npm run dev` with the remote backend via `PROXY_PATH`), so mocks never ship to a
  deployed environment.
- **Per-endpoint switch.** Each handler group has a key (`pipelines`, `testCaseAi`,
  `comments`, …). `ai_factory_mocks_off=comments,pipelines` disables selected groups once the
  real BE endpoints exist. This allows gradual integration.

### 4.2 Two data modes (decided: **A · Overlay**, 2026-09-25)

The local dev server proxies to the remote backend, so real TMS data is available. Mode B stays only as the
fallback if the overlay spike fails.

| Mode | What is real | What is mocked | Use for |
|------|--------------|----------------|---------|
| **A · Overlay (chosen)** | Existing TMS endpoints (folders, test cases, plans, launches) against a real dev backend | New resources (pipelines, iterations, comments, fix rounds, settings, automation) + **AI/lifecycle fields merged into real test-case DTOs** by `overlay.ts` (response interceptor keyed by test-case `id`) | Realistic demo on real TMS data; exercises real Library code paths |
| **B · Full mock** | nothing TMS | also mocks `tms/folder`, `tms/test-case` list/details | Working without any TMS backend |

In overlay mode:
- Unknown test-case ids default to `lifecycle: READY, ai: null`, which is the migration rule from US-007.
- **Seeding real cases.** The mock "Simulate generation iteration" action (a dev button on Pipelines)
  calls the **real** `POST tms/test-case` to create the prototype's cases in a folder, then
  registers them in the mock DB as AI cases with their evaluation and cost. This mirrors the
  real Upload stage (US-006).
  ⚠ **The remote backend is shared.** Seeding runs only on an explicit click, only into a dedicated demo
  project / folder (e.g. `AI Factory demo`), and asks for confirmation. Mocks never delete real data.
  "Reset demo" clears only the local mock DB.
- **Scenario-edit detection.** A request interceptor sees successful `PUT/PATCH tms/test-case/{id}`
  calls and compares precondition, steps, instructions and expected result with the previous snapshot. When they changed,
  the engine sets `DRAFT` and `evaluation.state = OBSOLETE` and writes a history entry. Name, priority,
  tags, folder, execution time and requirements are ignored.
- **Library filters `lifecycle` / `ai` / `iterationId`.** The real BE does not know these
  parameters. The overlay strips them, fetches the folder page with a large `limit`, filters on the
  client and re-paginates. This is a known PoC limitation (fine for demo sizes), and the BE implements it properly
  later (see 05 §3).

### 4.3 Engine (simulated backend rules)
- `deriveIterationStatus`, `deriveStageStatus` (Review: `IN_PROGRESS` / `DONE`).
- `applyAutoReady(case, settings)`: after upload and after a fix-round re-grade.
- `startFixRound(caseId)` → a timer (≈ 3–5 s) → success / `GRADE_FAILED` / `FAILED`, driven by
  scenario scripts (TC106 success 81 → 92 → Auto-Ready, TC107 fails once with "job timeout").
- `startAutomation(caseIds, env)` → the stages progress one by one → a Launch record is created (mock) →
  `automation.status = AUTOMATED`.
- Cost helpers: `iterationShare = (create + grade + upload) / n`, `caseCost = share + Σ fixRounds`.
- Persistence in localStorage (`ai_factory_mock_db_v1`) plus **Reset demo**, available in dev
  from a small floating dev menu on the Pipelines page.

### 4.4 Async and polling
Fix rounds and automation are asynchronous. The UI polls:
- case AI status `GET …/tms/test-case/{id}/ai` every **3 s** while `fixRound.status = RUNNING` or
  `automation.status = IN_PROGRESS`;
- the iteration every **5 s** while `status = RUNNING`.
Use one hook `usePolling(fn, { interval, enabled })` in `pages/inside/aiFactory/common/hooks/`.
Switching to push (websocket) later is transparent to the components.

## 5. State management

| Data | Where | Why |
|------|-------|-----|
| Pipelines list, iteration details, compare pair | `controllers/aiFactory/pipelines` (saga, reducer) — loaded by route thunks | route data, like Milestones or Test Plan |
| Pipeline settings | hook `usePipelineSettings` (fetch + mutate) | a modal-scoped read and write |
| Test-case AI info (evaluation, cost, comments, fix round, automation, history) | hook `useTestCaseAi(testCaseId)` in the details page and side panel; list fields come in the list DTO | per-case, mutation-heavy; the existing TMS details page uses hooks |
| Lifecycle mutations (approve, mark ready, bulk) | hook `useLifecycleActions` → then re-dispatch the existing list/details refresh (`useRefetchCurrentTestCases`, `GET_TEST_CASE_DETAILS`) | reuse the existing refresh paths |
| Comments, push, discard | hook `useReviewComments(testCaseId)` | local |
| Automate | hook `useAutomate()` + `automateModal` | local |
| Library quick filters | **URL query** (`lifecycle`, `ai`, `iteration`) via `updatePagePropertiesAction`, like `filterPriorities` | shareable queue link (US-008) |

## 6. Routing

Add to `controllers/pages/constants.js`, `routes/routesMap.js` and `routes/constants.js` (`pageRendering`):

| Page constant | Path (under `/organizations/:organizationSlug/projects/:projectSlug`) | Component |
|---------------|------------------------------------------------------------------------|-----------|
| `AI_PIPELINES_PAGE` | `/pipelines` | `PipelinesPage` |
| `AI_PIPELINE_ITERATION_PAGE` | `/pipelines/:pipelineId/iterations/:iterationId` (query `stage`) | `IterationPage` |
| `AI_PIPELINES_COMPARE_PAGE` | `/pipelines/compare` (query `pipeline`, `baseline`, `candidate`) | `CompareIterationsPage` |

- Sidebar: a new item **Pipelines** in `layouts/projectLayout/projectSidebar/projectSidebar.jsx`
  (`getSidebarItems`), placed **before Test Case Library** as in the prototype. It is guarded by the flag, and its
  message goes in `layouts/messages.js` (`Sidebar.pipelines`). The icon is a new inline SVG in `common/img/sidebar/` ❓ (design).
- Deep link "Open review queue" → `TEST_CASE_LIBRARY_PAGE` with query
  `lifecycle=DRAFT&ai=AI&iteration=<iterationId>`.
- Link to a case → `TEST_CASE_LIBRARY_PAGE` with `testCasePageRoute: test-cases/<id>`.
- Link to an iteration stage → `AI_PIPELINE_ITERATION_PAGE` with `?stage=grade|review|develop`.

## 7. Permissions (F15 is open)

Add to `common/constants/permissions.ts` (`ACTIONS` + `PERMISSIONS_MAP`) and
`common/utils/permissions/permissions.ts`:

| Action | Proposal | Helper |
|--------|----------|--------|
| `REVIEW_AI_TEST_CASES` (comment, push, approve, mark ready) | same as `MANAGE_TEST_CASES` (Editor+) | `canReviewAiTestCases` |
| `MANAGE_AI_PIPELINE_SETTINGS` | Project Manager+ ❓ map to org `MANAGER` / ADMIN (Q-BE-10) | `canManagePipelineSettings` |
| `AUTOMATE_TEST_CASES` | Editor+ | `canAutomateTestCases` |

When a user has no permission, the UI shows controls as hidden or read-only: comments are read-only, there are no Approve or Push buttons, and settings are read-only.

## 8. Shared UI atoms (Phase 0, T0.6)

| Atom | Based on | Notes |
|------|----------|-------|
| `LifecycleBadge` (DRAFT / READY) | ui-kit `Chip` or `components/statusBar` colours | UI-kit tokens only, no hex |
| `AiChip` (+ tooltip "Generated by Iteration #N [· modified by agent]") | ui-kit `Chip` + `Tooltip` | — |
| `ScoreChip` (`★ N`, gray + "obsolete") | ui-kit `Chip` | — |
| `CostLabel` (`≈ $0.32`) | text + `formatCost` util | amounts come from the DTO and are never recalculated |
| `IterationStatusBadge` (RUNNING / IN REVIEW / COMPLETED / FAILED) | ui-kit `Chip` variants | — |
| `StageStatusDot` + `StageStatusLabel` (Pending, Running, Passed, Failed, In progress, Done, Skipped) | — | Review shows Done, not Passed |
| `ScoreBar` (share of max) | check `testPlansTable/progressBar` first | no pass/fail colours on criteria ❓ the prototype colours bars by share; the requirement forbids "traffic-light verdicts" → use a single neutral colour (Q-FE-05) |
| `DeltaCell` (better/worse colouring) | — | Compare only |
| `formatTokens` (k / M), `formatCost` | `common/utils/aiFactoryFormatUtils.ts` | unit-tested; `formatDuration` (ms → `1d 2h 3m`) already exists in `common/utils/timeDateUtils.js` and is reused as-is, not duplicated |

## 9. Testing strategy
- Unit tests (Jest + jsdom, existing setup) for: engine rules, formatters, delta direction, the
  filter/URL mapping, and the permission helpers.
- Component tests for: `ApproveButton` states, `ReviewStrip` states, `EvaluationPanel`
  (Evaluated / Obsolete / no reasons at max), and the automate modal skip lists.
- Mock-layer smoke test: install the adapter and assert that each contract endpoint answers with the DTO shape.
- Manual: demo parity checklist (18 walkthrough steps) — [04](04-implementation-plan.md#demo-parity-checklist).
