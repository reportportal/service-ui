# 08 · Estimations

> **All estimations live here. Nowhere else.** After finishing any task, add its estimate to this file
> and to nothing else. [00-status.md](00-status.md) tracks status only and links here.

## Method

An estimate answers one question: **how many hours would a senior frontend developer need,
working by hand, to produce the result that was actually delivered?** It is not the AI-assisted runtime.

| Rule | |
|------|---|
| Unit | Hours of focused work. 1 working day = 8 h |
| Level | Senior FE developer, familiar with React / Redux but new to this feature |
| Included | Reading the requirements and prototype, design decisions, implementation, tests, messages / i18n, self-review, fixing review comments |
| Excluded | Waiting for review, meetings, environment or token problems, blockers outside the task |
| Breakdown | Split into **analysis / implementation / tests + review** |
| When | Right after the task meets its DoD, before moving on |
| Planned sizes | S = 8 h · M = 20 h · L = 36 h (from [04](04-implementation-plan.md)) |

If an estimate differs from the planned size by more than ~30 %, write why in *Deviation notes*
and re-check the remaining sizes.

## Per-task estimates

Filled in as tasks complete. `—` = not done yet.

| ID | Task | Phase | Planned | **Actual (h)** | Analysis | Impl. | Tests+review | Date |
|----|------|-------|---------|----------------|----------|-------|--------------|------|
| T0.1 | Requirements digest + plan docs | 0 | — | **20** | 12 | 6 | 2 | 2026-09-25 |
| T0.2 | Feature toggle | 0 | S (8) | **3** | 0.5 | 1.5 | 1 | 2026-09-28 |
| T0.3 | Types + format utils | 0 | S (8) | **5** | 1.5 | 2.5 | 1 | 2026-09-28 |
| T0.4 | URL helpers | 0 | S (8) | **2** | 0.5 | 1 | 0.5 | 2026-09-28 |
| T0.5 | Mock backend (adapter, DB, seed, engine, overlay) | 0 | L (36) | **26** | 3 | 18 | 5 | 2026-09-28 |
| T0.6 | Shared atoms + usePolling | 0 | M (20) | **14** | 3 | 7 | 4 | 2026-09-28 |
| T0.7 | Permissions helpers | 0 | S (8) | **3** | 1 | 1.5 | 0.5 | 2026-09-28 |
| T1.1 | Routes + sidebar + pipelines controller | 1 | M (20) | **14** | 3 | 9 | 2 | 2026-09-28 |
| T1.2 | Iterations list | 1 | L (36) | — | | | | |
| T1.3 | Iteration details + stage panels | 1 | L (36) | — | | | | |
| T2.1 | Lifecycle display + history + toast | 2 | M (20) | — | | | | |
| T2.2 | Library columns + AI chip + flags | 2 | M (20) | — | | | | |
| T2.3 | Quick filters + Review queue + iteration chip | 2 | M (20) | — | | | | |
| T2.4 | Side panel additions | 2 | M (20) | — | | | | |
| T2.5 | AI evaluation panel + rubric | 2 | M (20) | — | | | | |
| T2.6 | Generation cost + pipeline links | 2 | S (8) | — | | | | |
| T3.1 | Review comments + AI review strip | 3 | L (36) | — | | | | |
| T3.2 | Approve / Mark as ready (+ bulk, Edit Scenario) | 3 | M (20) | — | | | | |
| T3.3 | Push to agent + fix round states + diff modal | 3 | L (36) | — | | | | |
| T3.4 | Pipeline settings modal | 3 | S (8) | — | | | | |
| T4.1 | Ready-only gate + In plan · Launch blocked | 4 | M (20) | — | | | | |
| T4.2 | Test Plan page launch-blocked banner | 4 | M (20) | — | | | | |
| T4.3 | Compare iterations | 4 | M (20) | — | | | | |
| T5.1 | Automate action + Send to automation dialog | 5 | M (20) | — | | | | |
| T5.2 | Automation iteration progress | 5 | S (8) | — | | | | |
| T5.3 | Automation section on case | 5 | S (8) | — | | | | |
| T5.4 | Launch ↔ case links | 5 | M (20) | — | | | | |
| T6.1 | Roles / read-only states | 6 | S (8) | — | | | | |
| T6.2 | BE integration per endpoint group | 6 | S (8) ×N | — | | | | |
| T6.3 | i18n, a11y, responsive | 6 | S (8) | — | | | | |
| T6.4 | Demo rehearsal (parity checklist) | 6 | S (8) | — | | | | |
| T6.5 | Toggle-OFF regression pass | 6 | S (8) | — | | | | |

## Phase roll-up

`Planned` sums the sizes above. `Actual` sums the completed estimates. Update on every entry.

| Phase | Tasks | Planned (h) | Actual so far (h) | Done / total | Δ |
|-------|-------|-------------|-------------------|--------------|---|
| 0 · Foundation | T0.2–T0.7 (+T0.1 planning) | 88 (+20 planning) | 73 | 7 / 7 | T0.2 −5 h, T0.4 −6 h, T0.5 −10 h, T0.6 −6 h, T0.7 −5 h, T0.3 ≈ planned (see deviation notes) |
| 1 · Pipelines | T1.1–T1.3 | 92 | 14 | 1 / 3 | T1.1 −6 h |
| 2 · Library | T2.1–T2.6 | 108 | 0 | 0 / 6 | — |
| 3 · Review loop | T3.1–T3.4 | 100 | 0 | 0 / 4 | — |
| 4 · Gate & compare | T4.1–T4.3 | 60 | 0 | 0 / 3 | — |
| 5 · Automation | T5.1–T5.4 | 56 | 0 | 0 / 4 | — |
| 6 · Hardening | T6.1–T6.5 | 40 | 0 | 0 / 5 | — |
| **Total** | | **544 h + 20 h planning = 564 h** | **87** | 8 / 32 | — |

**564 h ≈ 70,5 working days ≈ 14 working weeks** for one developer at 8 h/day.
This prices every task at its nominal size, so it is the pessimistic end; the earlier
headline of 9–11 weeks assumed a faster pace on the small tasks. Re-check after phase 1 and,
if the trend holds, apply the scope cut list in the [README](README.md#scope-cut-list-if-the-demo-date-is-tight).

## Deviation notes

| Task | Planned | Actual | Why |
|------|---------|--------|-----|
| T0.2 Feature toggle | 8 h (S) | 3 h | Smaller than typical S: no Redux state, no server flag to integrate against (F11 still open), and the pattern (`getTmsOverride`) already existed in the codebase to copy. Re-check whether other "S" foundation tasks with a close existing pattern (e.g. T0.7 permissions) should also be sized down. |
| T0.3 Types + format utils | 8 h (S) | 5 h | Close to planned: the contract (05) was already fully designed, so this was transcription into ~30 TS interfaces/enums plus two small formatters — mechanical but sizeable (one ~350-line file). |
| T0.4 URL helpers | 8 h (S) | 2 h | Pure string-template functions with zero logic, one clear existing pattern to copy (100+ neighbours in the same file), and the endpoint list was already finalized in 05. No test file needed (no precedent for testing `urls.js` in this codebase). |
| T0.5 Mock backend | 36 h (L) | 26 h | Below planned mainly because the contract (05) and the codebase's own DTO-naming convention (`controllers/milestone/constants.ts`) removed most of the design decisions before writing code; the size still landed close to L because of the sheer surface (16 routes, two async simulations, an overlay merge, 52 tests). The largest real gap from the plan: seeding real cases into a project and detecting a live scenario edit are deferred to Q-ORG-07, so `overlay.ts`'s live-backend half is typed and unit-tested but not exercised end-to-end. |
| T0.7 Permissions helpers | 8 h (S) | 3 h | Below planned: the ACL system (`common/constants/permissions.ts`, `createCheckPermission`) already existed and already had a same-level precedent (`MANAGE_TEST_CASES`) to mirror exactly; adding three `ACTIONS` entries and three `canX` exports was mechanical. The only design call was mapping "Project Manager and above" (Q-BE-10) onto the real role model, which turned out to need no new role at all — the existing checker already grants org `MANAGER` (and instance `ADMINISTRATOR`) everything before it even looks at the project role, so `MANAGE_PIPELINE_SETTINGS` only needed to be left ungranted for `EDITOR`/`VIEWER`. |
| T0.6 Shared atoms + usePolling | 20 h (M) | 14 h | Below planned: 9 small presentational atoms plus one hook is a lot of files but each is a few lines, and the codebase already had a close pattern for every one of them (`integrationStatusBadge`, `progressBar`, `useFileUploadProgressSimulation`). Real, unplanned cost showed up in tooling, not design: this is the first TS test in the repo to mount/shallow-render a component that calls `useIntl()` or imports something that pulls in `@reportportal/ui-kit`, and the first to unit-test a hook — neither had a working pattern to copy, so time went into finding one (mocking `react-intl`'s `useIntl`, mocking `ConditionalTooltip` to dodge an ESM-only dependency Jest can't transform, and adding a minimal ambient `enzyme` type shim to `types/global.d.ts` since `@types/enzyme` conflicts with this repo's React 18 types). Those three fixes are now reusable by every later AI Factory test. |
| T1.1 Routes + sidebar + pipelines controller | 20 h (M) | 14 h | Below planned even though 15 files were touched: every piece had an exact, already-shipped pattern to mirror (`controllers/milestone` for the saga/reducer/selectors, `productVersionsPage.jsx` for the toggle-off redirect, `getTmsOverride`'s conditional sidebar-item spread), so there were almost no design decisions left, just faithful copying with AI-Factory-specific names. One real design call: the route's redux-first-router *thunk* also had to check `isAiFactoryEnabled()` before dispatching, not just the page component — `productVersionsPage.jsx`'s own gating only redirects after the thunk has already run, which would have sent a request to the mock/real backend even with the toggle off; this is called out directly in the new thunk's comment so it isn't missed later. No tests were added for the new saga/reducer/selectors/sidebar item, matching this codebase's own precedent — `controllers/milestone` and `controllers/testPlan` (the closest analogues) and `projectSidebar.jsx` have none either. |

## Estimate log

Newest first. One line per estimate recorded.

| Date | Task | Hours | Note |
|------|------|-------|------|
| 2026-09-28 | T1.1 Routes + sidebar + pipelines controller | 14 | 3 h researching the exact routing (`routes/routesMap.js`+`routes/constants.js`), conditional-sidebar-item (`projectSidebar.jsx`'s `getTmsOverride` spread) and saga-driven-list-controller (`controllers/milestone`) conventions via two research passes · 9 h writing `controllers/aiFactory/pipelines/` (constants, types, actionCreators, sagas, reducer, selectors, index — mirrors `controllers/milestone` exactly, P1 `GET tms/pipeline` returns a flat array so no pagination), the `PROJECT_PIPELINES_PAGE` route (path/thunk/component in both route files, toggle-gated at the thunk level so OFF makes no request), the sidebar item (new inline SVG icon, message, conditional spread before Test Case Library per Q-FE-08), wiring both the reducer and saga into the store, a minimal page shell (`pipelinesPage`/`pipelinesPageContent`: header, Refresh, loading/empty/list states) and one missing notification message · 2 h type-check/eslint/stylelint fixes and a full regression run (719 tests, unchanged — no tests added for the saga/reducer/selectors/sidebar item, matching `controllers/milestone`'s and `projectSidebar.jsx`'s own precedent of having none) |
| 2026-09-28 | T0.7 Permissions helpers | 3 | 1 h reading the real ACL system (`common/constants/permissions.ts`, `createCheckPermission`, `userRolesSelector`, `types/roles.ts`) and confirming there is no separate "Project Manager" project role to map Q-BE-10 onto · 1.5 h adding `REVIEW_AI_TEST_CASES`, `AUTOMATE_TEST_CASES`, `MANAGE_PIPELINE_SETTINGS` to `ACTIONS`/`PERMISSIONS_MAP` (Editor+ for the first two, org `MANAGER`+ only for settings) and the matching `canReviewAiTestCases`/`canAutomateTestCases`/`canManagePipelineSettings` exports (`permissions.ts` + `index.ts`) · 0.5 h a 4-case unit test on the matrix (ADMINISTRATOR, org MANAGER, project EDITOR, project VIEWER) plus lint/type-check. `useUserPermissions` picks the three up automatically (it maps over every `permissions.ts` export); no UI to wire yet — that starts at T3.4/T6.1 |
| 2026-09-28 | T0.6 Shared atoms + usePolling | 14 | 3 h finding patterns to copy (`integrationStatusBadge`, `progressBar`, `useFileUploadProgressSimulation`) and picking the token/colour mapping for each status enum · 7 h writing `LifecycleBadge`, `AiChip`, `ScoreChip`, `CostLabel`, `IterationStatusBadge`, `StageStatusDot`/`StageStatusLabel`, `ScoreBar`, `DeltaCell` (all under `pages/inside/aiFactory/common/`) and `usePolling` (`common/hooks/`), each with its `.scss` (neutral, non-traffic-light colours per Q-FE-05, direction colouring only on `DeltaCell` for Compare) · 4 h tests (43 across 9 suites) and fixing three first-of-their-kind tooling gaps: mocking `useIntl`/`ConditionalTooltip` so a component test doesn't need the real, Jest-untransformable `@reportportal/ui-kit` ESM build, a `jest.mock` variable-hoisting bug, and an ambient `enzyme` type shim in `types/global.d.ts` (no `@types/enzyme` install — it conflicts with the repo's React 18 types). Full app suite (715 tests) still green afterward |
| 2026-09-28 | T0.5 Mock backend | 26 | 3 h re-deriving internal record shapes from the contract and designing the hydrate/view-model split · 18 h writing `seedData.ts` (8 cases, 4 iterations, plan, launch), `db.ts` (hydration, persistence, mutators), `engine.ts` (status derivation, Auto-Ready, cost, automation skip rules), `viewModels.ts` (DTO projection), `handlers.ts` (16 routes + fix-round/automation `setTimeout` simulations), `overlay.ts` (merge + interceptor), `index.ts`, wiring into `index.jsx`, README · 5 h tests (engine, viewModels, handlers smoke test with fake timers, overlay) and fixing lint/type issues surfaced along the way (a real TS narrowing quirk under this repo's `strict: false`, `no-unsafe-enum-comparison`, `no-plusplus`). Full app test suite (672 tests) still green afterward |
| 2026-09-28 | T0.4 URL helpers | 2 | 0.5 h picking names against the existing `tms*`/`testCase*` conventions in `common/urls.js` · 1 h writing 13 URL-helper functions with a traceability comment (05 contract id) on each · 0.5 h verifying every one resolves correctly with a throwaway smoke test (deleted, not committed — no existing test file for `urls.js` to extend) |
| 2026-09-28 | T0.3 Types + format utils | 5 | 1.5 h re-deriving the exact contract shapes from 05 and picking a naming convention consistent with the codebase (enum + `${Enum}` alias, `*RS`/`*Payload`, following `controllers/milestone/constants.ts`) · 2.5 h writing `types/aiFactory.ts` (~30 interfaces/enums across all 8 contract sections) and `aiFactoryFormatUtils.ts` (`formatCost`, `formatTokens`) · 1 h tests, lint, type-check, docs update. Reused the existing `formatDuration` instead of duplicating it |
| 2026-09-28 | T0.2 Feature toggle | 3 | 0.5 h finding the `getTmsOverride`/`getStorageItem` pattern to copy · 1.5 h writing `featureFlag.ts` + `index.ts` + unit tests (5 cases: default, true, false, malformed value, storage throws) · 1 h lint/type-check/test fixes and docs update. No UI consumer yet (that's T1.1/T1.2 wiring it into the sidebar and routes) |
| 2026-09-25 | T0.1 Requirements digest + plan docs | 20 | 12 h reading (epic, 5 features, 17 stories, prototype incl. its JS data model, 4 flows, scope review, TMS code map) · 6 h writing docs 00–07 · 2 h Jira helper + token debugging. No planned size: this task was created together with the plan |
