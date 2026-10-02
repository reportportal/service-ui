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

For Jira delivery scope, **5 SP is treated as approximately 36 hours maximum**. A larger story or
cross-cutting scope must be split into cohesive `[FE]` sub-tasks before work continues.

## Jira delivery scopes

| Jira | Scope | Tasks | Actual estimate | Ceiling |
|------|-------|-------|-----------------|---------|
| [EPMRPP-121829](https://jiraeu.epam.com/browse/EPMRPP-121829) | Shared frontend foundation | T0.2–T0.4, T0.6–T0.7 | 27 h | ≤ 36 h |
| [EPMRPP-121833](https://jiraeu.epam.com/browse/EPMRPP-121833) | Mock backend | T0.5 | 26 h | ≤ 36 h |
| [EPMRPP-121765](https://jiraeu.epam.com/browse/EPMRPP-121765) | Pipelines routes and iterations list | T1.1–T1.2 | 34 h | ≤ 36 h |
| [EPMRPP-121834](https://jiraeu.epam.com/browse/EPMRPP-121834) | Iteration details by stage | T1.3 | 30 h | ≤ 36 h |
| [EPMRPP-121977](https://jiraeu.epam.com/browse/EPMRPP-121977) | Iteration details rework (2026-09-29 audit) | T1.3u | 6 h | ≤ 36 h |

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
| T1.2 | Iterations list | 1 | L (36) | **20** | 3 | 13 | 4 | 2026-09-28 |
| T1.3 | Iteration details + stage panels | 1 | L (36) | **30** | 4 | 21 | 5 | 2026-09-28 |
| T1.2u | Rework: CI-connection badge on the pipeline group header | 1 | S (8) | — | | | | |
| T1.3u | Rework: banner wording, live-polling fix, Create panel columns, fix-round/upload wording | 1 | S (8) | **6** | 1 | 4 | 1 | 2026-10-01 |
| T2.1 | Lifecycle display + history + toast | 2 | M (20) | **20** | 4 | 11 | 5 | 2026-10-02 |
| T2.2 | Library columns + AI chip + flags | 2 | M (20) | — | | | | |
| T2.3 | Quick filters + Review queue + iteration chip | 2 | M (20) | — | | | | |
| T2.4 | Side panel additions | 2 | M (20) | — | | | | |
| T2.5 | AI evaluation panel + rubric | 2 | M (20) | — | | | | |
| T2.6 | Generation cost + pipeline links | 2 | S (8) | — | | | | |
| T3.1 | Review comments + AI review strip | 3 | L (36) | — | | | | |
| T3.2 | Approve / Mark as ready (+ bulk, Edit Scenario) | 3 | M (20) | — | | | | |
| T3.3 | Push to agent + fix round states + diff modal | 3 | L (36) | — | | | | |
| T3.4 | Pipeline settings modal | 3 | S (8) | — | | | | |
| T3.6 | CI connection section in Pipeline settings | 3 | M (20) | — | | | | |
| T4.1 | Ready-only gate + In plan · Launch blocked | 4 | M (20) | — | | | | |
| T4.2 | Test Plan page launch-blocked banner | 4 | M (20) | — | | | | |
| T4.3 | Compare iterations | 4 | M (20) | — | | | | |
| T4.4 | Re-run iteration + Retry failed stage | 4 | M (20) | — | | | | |
| T5.1 | Automate action + Send to automation dialog | 5 | M (20) | — | | | | |
| T5.2 | Automation iteration progress | 5 | S (8) | — | | | | |
| T5.3 | Automation section on case | 5 | S (8) | — | | | | |
| T5.4 | Launch ↔ case links | 5 | M (20) | — | | | | |
| T6.1 | Roles / read-only states | 6 | S (8) | — | | | | |
| T6.2 | BE integration per endpoint group | 6 | S (8) ×N | — | | | | |
| T6.3 | i18n, a11y, responsive | 6 | S (8) | — | | | | |
| T6.4 | Demo rehearsal (parity checklist) | 6 | S (8) | — | | | | |
| T6.5 | Toggle-OFF regression pass | 6 | S (8) | — | | | | |
| T6.6 | NFR pass (FE-owned items from US-018) | 6 | S (8) | — | | | | |

## Phase roll-up

`Planned` sums the sizes above. `Actual` sums the completed estimates. Update on every entry.

| Phase | Tasks | Planned (h) | Actual so far (h) | Done / total | Δ |
|-------|-------|-------------|-------------------|--------------|---|
| 0 · Foundation | T0.2–T0.7 (+T0.1 planning) | 88 (+20 planning) | 73 | 7 / 7 | T0.2 −5 h, T0.4 −6 h, T0.5 −10 h, T0.6 −6 h, T0.7 −5 h, T0.3 ≈ planned (see deviation notes) |
| 1 · Pipelines | T1.1–T1.3, **T1.2u, T1.3u** | 108 | 70 | 4 / 5 | T1.1 −6 h, T1.2 −16 h, T1.3 −6 h, T1.3u −2 h; T1.2u still not started, blocked on T3.6 |
| 2 · Library | T2.1–T2.6 | 108 | 20 | 1 / 6 | T2.1 ≈ planned |
| 3 · Review loop | T3.1–T3.4, **T3.6** | 120 | 0 | 0 / 5 | T3.6 new (audit 2026-09-29, US-019) |
| 4 · Gate & compare | T4.1–T4.3, **T4.4** | 80 | 0 | 0 / 4 | T4.4 new (audit 2026-09-29, US-020) |
| 5 · Automation | T5.1–T5.4 | 56 | 0 | 0 / 4 | — |
| 6 · Hardening | T6.1–T6.5, **T6.6** | 48 | 0 | 0 / 6 | T6.6 new (audit 2026-09-29, US-018 FE-owned slice) |
| **Total** | | **608 h + 20 h planning = 628 h** | **163** | 12 / 37 | — |

**628 h ≈ 78,5 working days ≈ 15,7 working weeks** for one developer at 8 h/day. The jump from 564 h is
the 2026-09-29 audit's 3 new stories (018/019/020) plus the two not-yet-started rework tasks it surfaced
on already-shipped work (T1.2u, T1.3u) — see [01 §3a](01-knowledge-base.md#3a-requirements-audit-update-2026-09-29--supersedes-nothing-above-adds-to-it).
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
| T1.2 Iterations list | 36 h (L) | 20 h | Well below planned: the "L" size anticipated a harder problem than the real one turned out to be — fetching iterations for *several* pipelines at once has no precedent anywhere in this codebase (checked directly: no dynamic-id-keyed reducer, no fan-out saga), which sounds like it needs real Redux-architecture design. But there are only 2 pipelines, both loaded together, so a single saga fetching both with `yield all([...])` and one combined reducer slice keyed by pipeline id was enough — no dynamic map, no per-id namespace factory needed. The genuinely new cost was thoroughness on i18n: every fixed word in the outcome line, stage chips and meta row ("Ready", "Score", "cases", "of", "implemented", "fix round(s)", "Automating…") got its own ICU message instead of being inlined as English strings, which is more `messages.ts` entries (18) than most tasks so far. Search is implemented client-side against the already-fetched iterations rather than re-querying P2's `search` param per keystroke — reasonable at the current (and likely long-term demo) data size, called out in the code comment. Surfaced and fixed a real gap in the T0.6 atoms while wiring real DTOs into them for the first time: `IterationStatusBadge`/`StageStatusDot`/`StageStatusLabel` were typed against the nominal `IterationStatus`/`StageStatus` enums, but DTO fields are the `Ai*` string-literal alias types (`types/aiFactory.ts`'s own convention) — fixed by widening those three components' prop types to the alias, which is the correct fix, not a workaround. 17 new tests for the pure formatting/search logic (`pipelinesListUtils.ts`); no tests for the two new page components, matching `milestonesPage.tsx`/`productVersionsPage.jsx`'s own precedent of having none. |
| T1.3 Iteration details + stage panels | 36 h (L) | 30 h | Slightly below planned — this is the largest task so far by file count (~20 new/changed files) but almost every piece had a direct precedent to copy, same as T1.1/T1.2. New route (`PROJECT_PIPELINE_ITERATION_PAGE`) mirrors `PROJECT_TEST_PLAN_DETAILS_PAGE`'s thunk-driven single-item fetch; the controller extension (`GET_PIPELINE_ITERATION_DETAILS`) mirrors the two sagas T1.2 already added, sharing the reducer via `createPageScopedReducer`'s array form so navigating Pipelines → an iteration → back doesn't refetch. `usePolling` (T0.6) plugged in directly for the "iteration is running" 5 s poll — no new async pattern needed. The one real gap: the mock's `toStageRS` never filled `StageRS.create` (the CREATE stage's per-case table), even though `types/aiFactory.ts`/05 §2 both define it — fixed in `controllers/aiFactory/mocks/viewModels.ts` (mirrors the existing `grade`/`upload` mapping) rather than building the Create panel against data that could never arrive. Refactored `outcome`/`stageMetric`/`requirementOrTestCasesLabel`/`startedAndDuration` and the stage-key→label message map out of `pipelinesPage/` into `pages/inside/aiFactory/common/` (`iterationFormatUtils.ts`, `stageLabels.ts`) because this task needed the exact same formatting a second time — real reuse, not speculative sharing; `IterationCard` was updated to import from the new location and its tests re-split accordingly, all still green. Deliberately left the header's "Compare with previous" and "Pipeline settings" actions out: both name a feature (T4.3, T3.4) that doesn't exist yet, so a real button here would either be a dead click or a lie; they'll be added when those tasks land. No component tests for the six new stage-panel components or the page shell, matching every prior AI Factory page's own precedent of testing pure logic (`iterationDetailsUtils.test.ts`, 8 new tests) but not presentational page components. Could not verify in a live browser: the dev server proxies to a real backend that needs real login credentials unavailable in this environment (same limitation as every earlier task in this session) — verified via type-check/eslint/stylelint/the full Jest suite (747 tests) instead. |

## Estimate log

Newest first. One line per estimate recorded.

| Date | Task | Hours | Note |
|------|------|-------|------|
| 2026-10-02 | T2.1 Lifecycle display + history + toast | 20 | 4 h researching US-007/C1/C2/L3, the shared Library surfaces, scenario-edit flow, mock identity mapping, toggle-OFF rules, and Jira scope · 11 h adding the Library-only Status column, side-panel/details lifecycle badges, guarded C2 History UI/hook, mock scenario-change detection and persistence, numeric real-ID aliases, edit-driven refresh, and the exact response-driven Ready → Draft notification · 5 h adding host toggle, mutation, hook/history, scenario comparison, malformed-data, and alias-collision tests; fixing independent review findings for C2 identity, stale Ready→Draft/Draft→Draft history, input normalization and Date range; full 100-suite / 779-test regression plus type-check, lint, and code/security revalidation |
| 2026-09-28 | T1.3 Iteration details + stage panels | 30 | 4 h re-reading 05 §2 (`IterationRS`/`StageRS`), 01 §4.10 (banner/KPI/stage rules) and 03 §6 (the exact route table) to fix the page/route/reducer shape before writing code · 21 h: the route (`PROJECT_PIPELINE_ITERATION_PAGE` in `controllers/pages`, `routes/routesMap.js`, `routes/constants.js`), the controller extension (`GET_PIPELINE_ITERATION_DETAILS` action/saga/reducer slice/selectors in `controllers/aiFactory/pipelines/`, sharing page-scoped state with T1.2's slice), the mock fix for the missing `create` stage data (`viewModels.ts`), the shared-util extraction (`iterationFormatUtils.ts`, `stageLabels.ts` under `pages/inside/aiFactory/common/`), and the new `iterationDetailsPage/` (page shell + toggle gate, header/KPIs/meta/attributes, status banner for RUNNING/IN_REVIEW/FAILED with the "Open review queue" deep link, `StageCards`, and six `stagePanels/*` components — Create/Grade with expandable per-criterion bars/failure reasons/Review with a fix-rounds table/Upload with the Auto-Ready promoted line/automation per-case — plus token usage and case-title links into the Library), all polling every 5 s via `usePolling` while the iteration is RUNNING · 5 h: 8 new tests for `iterationDetailsUtils.ts`, re-splitting `iterationFormatUtils`'s tests out of `pipelinesListUtils.test.ts`, fixing 4 TS errors (a missing `LocationQuery.stage` field, three unnecessary type assertions) and a repeat of T1.2's enum-vs-alias bug in `LifecycleBadge`, and a full regression run (747 tests) — plus an attempted live-browser check, blocked by the same real-backend-login limitation as every prior task |
| 2026-09-28 | T1.2 Iterations list | 20 | 3 h confirming (via research) that no dynamic-id-keyed reducer or fan-out saga exists anywhere in this codebase, then deciding the real problem doesn't need one — 2 known pipelines, fetched together — plus re-reading the prototype spec (01-knowledge-base.md §4.10) for the exact card/group fields · 13 h extending `controllers/aiFactory/pipelines/` with a second saga/reducer slice (`GET_PIPELINE_ITERATIONS`, one `yield all([...])` fetching both pipelines' iterations, reduced into one `{ [pipelineId]: IterationSummaryRS[] }` map), `pipelinesListUtils.ts` (search matching + structured, translatable outcome/stage-metric data), `IterationCard` and `PipelineGroup` components, 18 new `messages.ts` entries, two `.scss` files, and wiring search + the per-pipeline fetch trigger into `pipelinesPageContent.tsx` · 4 h: 17 new tests for `pipelinesListUtils.ts`, widening `IterationStatusBadge`/`StageStatusDot`/`StageStatusLabel` (T0.6) from the nominal `IterationStatus`/`StageStatus` enums to their `Ai*` string-literal alias types once real DTOs were wired in for the first time, and a full regression run (737 tests) |
| 2026-09-28 | T1.1 Routes + sidebar + pipelines controller | 14 | 3 h researching the exact routing (`routes/routesMap.js`+`routes/constants.js`), conditional-sidebar-item (`projectSidebar.jsx`'s `getTmsOverride` spread) and saga-driven-list-controller (`controllers/milestone`) conventions via two research passes · 9 h writing `controllers/aiFactory/pipelines/` (constants, types, actionCreators, sagas, reducer, selectors, index — mirrors `controllers/milestone` exactly, P1 `GET tms/pipeline` returns a flat array so no pagination), the `PROJECT_PIPELINES_PAGE` route (path/thunk/component in both route files, toggle-gated at the thunk level so OFF makes no request), the sidebar item (new inline SVG icon, message, conditional spread before Test Case Library per Q-FE-08), wiring both the reducer and saga into the store, a minimal page shell (`pipelinesPage`/`pipelinesPageContent`: header, Refresh, loading/empty/list states) and one missing notification message · 2 h type-check/eslint/stylelint fixes and a full regression run (719 tests, unchanged — no tests added for the saga/reducer/selectors/sidebar item, matching `controllers/milestone`'s and `projectSidebar.jsx`'s own precedent of having none) |
| 2026-09-28 | T0.7 Permissions helpers | 3 | 1 h reading the real ACL system (`common/constants/permissions.ts`, `createCheckPermission`, `userRolesSelector`, `types/roles.ts`) and confirming there is no separate "Project Manager" project role to map Q-BE-10 onto · 1.5 h adding `REVIEW_AI_TEST_CASES`, `AUTOMATE_TEST_CASES`, `MANAGE_PIPELINE_SETTINGS` to `ACTIONS`/`PERMISSIONS_MAP` (Editor+ for the first two, org `MANAGER`+ only for settings) and the matching `canReviewAiTestCases`/`canAutomateTestCases`/`canManagePipelineSettings` exports (`permissions.ts` + `index.ts`) · 0.5 h a 4-case unit test on the matrix (ADMINISTRATOR, org MANAGER, project EDITOR, project VIEWER) plus lint/type-check. `useUserPermissions` picks the three up automatically (it maps over every `permissions.ts` export); no UI to wire yet — that starts at T3.4/T6.1 |
| 2026-09-28 | T0.6 Shared atoms + usePolling | 14 | 3 h finding patterns to copy (`integrationStatusBadge`, `progressBar`, `useFileUploadProgressSimulation`) and picking the token/colour mapping for each status enum · 7 h writing `LifecycleBadge`, `AiChip`, `ScoreChip`, `CostLabel`, `IterationStatusBadge`, `StageStatusDot`/`StageStatusLabel`, `ScoreBar`, `DeltaCell` (all under `pages/inside/aiFactory/common/`) and `usePolling` (`common/hooks/`), each with its `.scss` (neutral, non-traffic-light colours per Q-FE-05, direction colouring only on `DeltaCell` for Compare) · 4 h tests (43 across 9 suites) and fixing three first-of-their-kind tooling gaps: mocking `useIntl`/`ConditionalTooltip` so a component test doesn't need the real, Jest-untransformable `@reportportal/ui-kit` ESM build, a `jest.mock` variable-hoisting bug, and an ambient `enzyme` type shim in `types/global.d.ts` (no `@types/enzyme` install — it conflicts with the repo's React 18 types). Full app suite (715 tests) still green afterward |
| 2026-09-28 | T0.5 Mock backend | 26 | 3 h re-deriving internal record shapes from the contract and designing the hydrate/view-model split · 18 h writing `seedData.ts` (8 cases, 4 iterations, plan, launch), `db.ts` (hydration, persistence, mutators), `engine.ts` (status derivation, Auto-Ready, cost, automation skip rules), `viewModels.ts` (DTO projection), `handlers.ts` (16 routes + fix-round/automation `setTimeout` simulations), `overlay.ts` (merge + interceptor), `index.ts`, wiring into `index.jsx`, README · 5 h tests (engine, viewModels, handlers smoke test with fake timers, overlay) and fixing lint/type issues surfaced along the way (a real TS narrowing quirk under this repo's `strict: false`, `no-unsafe-enum-comparison`, `no-plusplus`). Full app test suite (672 tests) still green afterward |
| 2026-09-28 | T0.4 URL helpers | 2 | 0.5 h picking names against the existing `tms*`/`testCase*` conventions in `common/urls.js` · 1 h writing 13 URL-helper functions with a traceability comment (05 contract id) on each · 0.5 h verifying every one resolves correctly with a throwaway smoke test (deleted, not committed — no existing test file for `urls.js` to extend) |
| 2026-09-28 | T0.3 Types + format utils | 5 | 1.5 h re-deriving the exact contract shapes from 05 and picking a naming convention consistent with the codebase (enum + `${Enum}` alias, `*RS`/`*Payload`, following `controllers/milestone/constants.ts`) · 2.5 h writing `types/aiFactory.ts` (~30 interfaces/enums across all 8 contract sections) and `aiFactoryFormatUtils.ts` (`formatCost`, `formatTokens`) · 1 h tests, lint, type-check, docs update. Reused the existing `formatDuration` instead of duplicating it |
| 2026-09-28 | T0.2 Feature toggle | 3 | 0.5 h finding the `getTmsOverride`/`getStorageItem` pattern to copy · 1.5 h writing `featureFlag.ts` + `index.ts` + unit tests (5 cases: default, true, false, malformed value, storage throws) · 1 h lint/type-check/test fixes and docs update. No UI consumer yet (that's T1.1/T1.2 wiring it into the sidebar and routes) |
| 2026-09-25 | T0.1 Requirements digest + plan docs | 20 | 12 h reading (epic, 5 features, 17 stories, prototype incl. its JS data model, 4 flows, scope review, TMS code map) · 6 h writing docs 00–07 · 2 h Jira helper + token debugging. No planned size: this task was created together with the plan |
