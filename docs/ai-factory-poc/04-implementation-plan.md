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
| T0.3 | Legacy/mock PoC view-model and proposal DTO types in `types/aiFactory.ts` + format utils (`formatCost`, `formatTokens`, `formatDuration`) | 001, all | S | T0.1 | types compile; utils have unit tests. These types do not mirror the revised 05 live raw OpenAPI schemas; T6.2 adds that adapter boundary |
| T0.4 | URL helpers in `common/urls.js` (P*, C*, L*, R*, F*, A*) | all | S | T0.3 | one helper per contract endpoint |
| T0.5 | Mock backend: adapter install, DB + seed (port of the prototype data), engine (status, Auto-Ready, fix-round and automation simulation), overlay for TMS test cases, localStorage persistence and Reset demo | 001, 006 + all | L | T0.3, T0.4 | every proposal endpoint answers on mocks; smoke test; README in `controllers/aiFactory/mocks/`. The delivered mock/live switch is global; per-group switching is still pending T6.2 |
| T0.6 | Shared atoms: `LifecycleBadge`, `AiChip`, `ScoreChip`, `CostLabel`, `IterationStatusBadge`, `StageStatusDot/Label`, `ScoreBar`, `DeltaCell`, `usePolling` | all | M | T0.3 | component tests; light/dark via UI-kit tokens |
| T0.7 | Permissions: `ACTIONS` + helpers (`canReviewAiTestCases`, `canManagePipelineSettings`, `canAutomateTestCases`) | 005, 012, 013 (F15) | S | — | unit tests on the matrix |

**Spike outcome (2026-09-28):** the remote dev backend (`PROXY_PATH`) is reachable and `/api/info` answers as expected —
mode A (overlay) is viable. Authenticating from a script to fetch a live `TestCase` response for a byte-for-byte
shape check was not completed (the OAuth2 password grant needs a real browser session, not a bare curl call), so
`overlay.ts`'s merge logic is verified with a fabricated `TestCase`-shaped fixture instead (`overlay.test.ts`) —
built directly from the existing `types/testCase.ts`, which already reflects what the real UI parses in production.
Actually seeding AI-marked cases into a real project, and detecting a real scenario edit, are deferred until
Q-ORG-07 (target project/folder) is answered — see `controllers/aiFactory/mocks/README.md`.

**Live-contract alignment note (2026-10-02):** T0.3–T0.5 and T1.1–T1.3 remain completed
mock/proposal-UI delivery; the newly published Pipeline OpenAPI does not reopen or invalidate those tasks.
Its paths and raw DTOs differ from the proposal contract, so adopting it is a separate T6.2 integration slice
with explicit adapters and regression coverage. Source: [live OpenAPI document](http://tms.epmrpp.reportportal.io/api/api-docs).
The published origin is currently plain HTTP, so authenticated live adoption is blocked until a trusted HTTPS
endpoint exists; bearer tokens must never be sent with TLS verification bypassed. For every mutation, backend
authentication and authorization remain mandatory—FE permission checks are gating/disabled-state UX only.

## Phase 1 — Factory visible: Pipelines (US-002, 003, 016 view)

| ID | Task | Stories | Size | Depends | Output / DoD |
|----|------|---------|------|---------|--------------|
| T1.1 | Routes + sidebar item **Pipelines** + page shell + `controllers/aiFactory/pipelines` (saga, reducer, selectors) | 002 | M | T0.2, T0.4, T0.5 | the route loads data; the item is hidden when the flag is off |
| T1.2 | Iterations list: collapsible pipeline groups (header meta, Auto-Ready ON ≥ T), iteration cards (status, outcome, meta, stage chips, attribute chips), search, Refresh, "No iterations match", empty state, entry points for Compare and Settings | 002, 016 | L | T1.1, T0.6 | prototype walkthrough step 1 reproduced |
| T1.3 | Iteration details: header + KPIs + actions, status banner (+ Open review queue deep link), stage cards (default Grade / Develop), panels Create / Grade (expandable reasons) / Upload / Review (+ fix-rounds table) / automation per-case panels (Prepare note, Skipped), token usage, polling while running | 003, 006 (display), 016 | L | T1.2 | walkthrough steps 2–4 reproduced; running gen #3 updates by polling |
| **T1.2u** ⬜ | **Rework (not started, needs go-ahead):** Pipeline group header shows **"Not connected to CI" / "CI connection failed"** (depends on T3.6 landing first) | 002, 019 | S | T1.2, T3.6 | see 01 §3a G1 |
| **T1.3u** ✅ | **Rework, done:** status banner wording for Completed/Running(names the stage)/Failed; Review panel polls while `IN_REVIEW` too, not only `RUNNING`; Create panel gets per-case status/duration + CI job/duration footer; fix-round result wording incl. **Auto-Ready** outcome; Upload result wording alignment | 003 | S | T1.3 | see 01 §3a G2–G6; full diff table there. EPMRPP-121977, branch `EPMRPP-121977-iteration-details-rework` |

## Phase 2 — Cases in the Library (US-007, 008, 009, 010)

| ID | Task | Stories | Size | Depends | Output / DoD |
|----|------|---------|------|---------|--------------|
| T2.1 | Lifecycle display: badge in the list / side panel / details header; lifecycle **History** section (❓ Q-FE-01); toast on Ready → Draft after an edit | 007 | M | T0.5, T0.6 | priority-only edit keeps Ready; step edit → Draft + toast |
| T2.2 | Library list: columns **Status** and **AI quality** (`★ N` / obsolete, `≈ $`, `Iteration #N ↗`, "—"), AI chip + tooltip next to the ID, row flags (unsent comments, agent fixing) | 008 | M | T2.1 | walkthrough step 7 (list part) |
| T2.3 | Quick filters Status × AI (AND), preset **Review queue · N**, removable **Iteration #N** chip, Clear, URL-bound (`lifecycle`, `ai`, `iteration`), empty result text | 008 | M | T2.2 | deep link from the iteration works; filters survive a reload |
| T2.4 | Side panel additions: status row (badge, AI chip, score, unsent count), Draft hint, **AI evaluation** mini section (bars, cost, iteration link), footer layout for Draft (disabled add buttons + tooltips, primary slot for Approve), check at 360 px | 008, 009, 014 | M | T2.2, T2.5 | walkthrough step 8 |
| T2.5 | **AI evaluation** panel on details: total, 6 criteria rows (score/max + bar), expandable failure reasons, Evaluated / Obsolete line, rubric help modal, `★ N` in the header; when live integration lands, `GET /v1/project/{projectKey}/tms/quality-standard` is only a partial source for the current rubric (standard name/top-level description and ordered criterion names/maxima) | 009 | M | T0.6 | walkthrough step 9; no PASS/FAIL anywhere; retain blockers for criterion descriptions, rubric version/snapshot and historical evaluation linkage. Absence/error states remain explicit. Quality Standard create/update/delete UI requires separate product scope and backend authorization |
| T2.6 | **Generation cost** panel (≈ total, iteration share with formula, fix rounds, tokens, model) + **Pipeline** links section (source → Grade, fix round → Review) | 010 | S | T2.5 | walkthrough step 10 (TC103 ≈ $0.54) |

## Phase 3 — Review loop (US-011, 013, 005, 012, 019)

| ID | Task | Stories | Size | Depends | Output / DoD |
|----|------|---------|------|---------|--------------|
| T3.1 | Review comments: comment icon with count (orange/gray) on the Precondition + each Step (Steps) / Precondition + Instructions-Expected block (Text), thread (author, time, state, delete own pending, input + Add), **AI review strip** (lifecycle, N not sent, Discard with confirmation, Push to agent · N with disabled hint), AI cases only, read-only while fixing | 011 | L | T2.5 | walkthrough steps 11, 14 |
| T3.2 | Approve / Mark as ready: shared `ApproveButton` (header + side panel footer; disabled with hints; obsolete confirmation), bulk **Approve** with skip report, Edit Scenario hint + checkbox "…along with these changes" (Draft only), toasts | 013, 007, 008 | M | T3.1, T2.4 | walkthrough steps 13, 15; bulk skips are named |
| T3.3 | Push to agent: start a fix round (error path: comments stay not sent), "Agent is fixing… · Fix round K" locked state (Approve / Push / Edit Scenario disabled), polling, success (new evaluation, Draft, addressed comments, cost, Auto-Ready result toast), GRADE_FAILED, FAILED (push again / discard), **What the agent changed** modal | 012, 005 | L | T3.1, T3.2, T2.6 | walkthrough step 12 (TC106 success, TC107 failure) |
| T3.4 | Pipeline settings modal: Auto-Ready toggle + threshold (0–100 integer validation), read-only without permission, "applies from next upload" note, automation pipeline "no settings", entry from the list + iteration; persist supported settings through `PATCH /v1/project/{projectKey}/pipeline/{pipelineId}` | 005 | S | T1.2, T0.7 | ✅ EPMRPP-122031; walkthrough step 6 verified on desktop and 360 px. FE gating is UX only; production backend authorization, validation and concurrency semantics remain tracked in 12 |
| T3.6 | **New (2026-09-29 audit).** CI connection section inside Pipeline settings: repository / branch / trigger credential (masked after save, never re-shown) / jobs / models / environments; **Test connection**; connection states Not connected / Connected / Connection failed; Organization Manager/Administrator only (D15); disables Push to agent / Automate / Re-run / Retry elsewhere with the "ask an Organization Manager" hint when not connected | 019 | M | T3.4, T0.7 | US-AI-FCTRY-019 ACs; UI↔API contract co-authored by Saveli Savich (see 01 §3a) must exist first |

## Phase 4 — Gate and compare (US-014, 004, 020)

| ID | Task | Stories | Size | Depends | Output / DoD |
|----|------|---------|------|---------|--------------|
| T4.1 | Ready-only gate: Add to Launch / Add to Test Plan disabled for Draft (header, side panel, bulk with skip report) with exact hints; **In plan · Launch blocked** banner on the case page and side panel | 014 | M | T2.1, T2.4 | ✅ EPMRPP-122032; exact hints and toggle-OFF parity are tested; C1 `blockedPlans` supplies plan names. Backend G1 enforcement is still required |
| T4.2 | Test Plan page: Draft badges on plan cases, **Launch** disabled + banner "Launch blocked: N Draft Test Cases" with links (not prototyped — keep it minimal, ❓ Q-BA-04) | 014 | M | T4.1 | ✅ EPMRPP-122033; G2 drives the plan-level count/gate/link targets, C1 drives row badges and the safe loaded-row fallback; approving the last Draft re-enables Launch after refresh |
| T4.3 ✅ | Compare iterations page: pipeline / baseline / candidate selects (pipeline change resets to the latest two), stage row with costs, metrics table with Δ and direction colouring, "Different requirements" note, entries from the list + "Compare with previous"; consume server compare `GET /v1/project/{projectKey}/pipeline/iteration/{iterationId}/compare` with required `with=<iterationId>` | 004 | M | T1.3 | EPMRPP-122034, branch `EPMRPP-122034-compare-iterations`; completed with URL-bound selectors, both entry points, exact-path LP4 identity validation, status-only/neutral live fallback and private versioned mock metrics. Validation: 7 focused suites / 91 tests, full 138 suites / 1072 tests, type-check, focused ESLint, targeted Stylelint, production build, clean dev compile, diff-check and senior code/security PASS. BE-014/BE-015 remain open for live rich metrics/direction semantics |
| T4.4 | **New (2026-09-29 audit).** **Re-run** an iteration (header action, dialog with read-only requirement + environment + model select, creates a new iteration in its own folder through `POST /v1/project/{projectKey}/pipeline/iteration`, offers "Compare with Iteration #N" when done) and **Retry** a failed Create/Upload stage through `POST /v1/project/{projectKey}/pipeline/iteration/{iterationId}/stage/{stageId}/retry` (same iteration, keeps attempt history "Attempt K of N", cost accumulates); both gated on CI connection (T3.6) and Organization Manager/Administrator (D15); disabled while Running | 020 | M | T3.6, T1.3u | US-AI-FCTRY-020 ACs; confirm idempotency and attempt-history semantics before wiring. FE gating is UX only; the backend must authenticate and authorize both mutations |

## Phase 5 — Automation (US-015, 016, 017)

| ID | Task | Stories | Size | Depends | Output / DoD |
|----|------|---------|------|---------|--------------|
| T5.1 ✅ | **Automate**: ⋯ menu item (details), button in the Automation section, bulk action; **Send to automation** dialog (case list, skipped Draft / in-progress / fixing with names, environment select, "Already automated … Automate again?", start error in the dialog) | 015 | M | T4.1 | EPMRPP-122035; shared eligibility/modal flow, cross-page C1 snapshots, persistent client/server re-automation confirmation, authoritative partial-result feedback, stale-request guards and strict provisional A1/A2 mock boundary. Toggle-OFF/no-request parity covered. Validation: focused 10 suites / 139 tests, full 143 suites / 1153 tests, type-check, full lint, diff-check and independent code/security PASS. T5.2 polling is intentionally excluded |
| T5.2 ✅ | Automation iteration live progress (Prepare → Develop → Review → Fix/Skipped) via polling; case shows "Automation · In progress · Iteration #N" | 016 | S | T5.1, T1.3 | EPMRPP-122036; viewer-readable case progress/link is separated from the permission-gated Automate action; Test Case details polls only while its automation is running, Pipelines refreshes only for running automation iterations, and shared polling is hidden-tab-aware/non-overlapping with polling-generation and loading-cycle regression coverage. Mock progression, C2 projection, canonical/internal + requested/external ID persistence across reload, public CaseLink identity and persisted-simulation rehydration remain provisional mock-only behavior. Validation: Node 20.19.1 full Jest 145 suites / 1191 tests, full lint exit 0 with existing baseline warnings only, type-check, diff-check and senior code/security rechecks PASS; browser/runtime visual walkthrough not performed. No live A1/A2/C2 integration claim |
| T5.3 ✅ | **Automation** section on the case: status, last result (+ defect type), links to Launch and iteration, "Scenario changed after automation" | 017 | S | T5.2 | EPMRPP-122037, branch `EPMRPP-122037-automation-results`; all four statuses, viewer-readable last result/defect type, internal Launch/iteration navigation, provisional MR id/state, scenario-change warning and last-good-preserving load/error/retry are implemented against mock-only C2. Validation: full Node 20 Jest 145 suites / 1209 tests, full lint exit 0 with 201 existing warnings, type-check, diff-check and senior code/security final rechecks PASS. Browser/runtime walkthrough was not performed. No live C2 or trusted external MR-link claim; T5.4 backlinks remain separate |
| T5.4 ✅ | Launch ↔ case links: test item → "Library Test Case ↗" (item info + details modal), launch → automation iteration link from the `pipeline:` attribute | 017 | M | T5.3 | EPMRPP-122038, branch `EPMRPP-122038-launch-case-backlinks`; one feature-gated viewer-readable renderer validates A3 and the strict root-Launch `pipeline:<pipelineId>/<iterationId>` key/value contract, requires positive safe integers plus real route context and fails closed for absent/malformed/duplicate data. Existing Item info and Test Item details consume A3. ParentInfo consumes the Launch attribute only when a shared hierarchy selector confirms a single root parent, independent of displayed-child level; nested suite/test attributes are never interpreted as Launch links. Q-FE-07 is resolved with component fixtures only—no fake Launch controller/API. Validation: focused 4 suites / 64 tests, full Node 20 Jest 149 suites / 1273 tests, full lint exit 0 with 201 existing warnings, type-check, scoped ESLint/Stylelint, diff-check and senior code/security final rechecks PASS. Live A3/attribute delivery and browser runtime remain unverified |

## Phase 6 — Hardening and backend integration (continuous after Phase 3)

| ID | Task | Size | Output |
|----|------|------|--------|
| T6.1 ✅ | Roles / read-only states everywhere (accepted D15/F15): Editor, Organization Manager and Administrator may review/approve/push/automate; Organization Manager and Administrator may manage Pipeline settings; Viewer is read-only. Guard both rendered controls and mutation/request hooks so stale or directly mounted UI fails closed without a request | S | EPMRPP-122039; focused 10 suites / 80 tests and full Node 20 Jest 149 suites / 1282 tests PASS; full lint exit 0 with 201 existing warnings; root type-check/diff-check and senior code/security validators PASS with no Major/Critical findings. Browser/runtime walkthrough not performed. FE gating is UX/defence-in-depth only; backend authorization and live read-role semantics remain open |
| T6.2-G1 ✅ | Pipeline catalog LP1/LP2 foundation: canonical live paths, raw OpenAPI DTO → explicit reduced catalog models, per-group transport provenance, per-pipeline loading/error isolation and guards against mixing a future live catalog with mock-only downstream flows | M | EPMRPP-122040; automated validation complete: type-check PASS, full Jest 152 suites / 1364 tests PASS, full lint exit 0 with 201 existing warnings, code validator/security validator/diff-check PASS. Mock remains the default and the live gate is hard closed, so this is **not a live rollout**. LP3 and Quality Standard are not integrated; browser/runtime validation was not performed. Enablement still requires trusted HTTPS, backend read-role decisions, requiredness/status decisions and Product/QA approval of the reduced UI |
| T6.2-G2 ✅ | LP3 generic-detail foundation: canonical iteration-only live URL, strict raw OpenAPI DTO → explicit reduced detail model, separate detail transport/provenance and stale guards, reduced detail presentation, and removal of the Library's direct detail-request leak | M | EPMRPP-122041; focused Jest 8 suites / 171 tests PASS before review remediation, post-race focused saga 32/32 PASS, final full Jest 154 suites / 1417 tests PASS (repository open-handle warning after success), Node 20 type-check PASS, full lint exit 0 with 201 existing warnings, diff-check PASS, senior code validator final PASS after one Major race fix and regression test, security validator PASS with no Critical/Major/Minor findings. Mock remains default and live mode is hard closed. Rich mock P3 is preserved; live KPI/cost/token/Test Case/CI/retry semantics and polling are excluded. No TLS bypass or live backend/browser validation; Product/QA reduced-detail approval and the open backend decisions remain rollout blockers |
| T6.2-G3+ | Continue endpoint groups independently after their contracts and rollout gates are ready; QS1 remains a separate current-standard read candidate | per group S–M | every group goes 🟢 only after its adapter tests, toggle-OFF regression, live error/absence handling and backend/product blockers are closed |
| T6.3 ✅ | Bounded source-level i18n audit, accessibility pass for current AI Factory controls (accessible names/semantics/keyboard behavior), and 360 px Test Case side-panel responsiveness. Excludes T3.6 credential controls, T4.4 Re-run/Retry controls, cost-formatting work and the full 1280 px T6.6 NFR pass | S | EPMRPP-122042; focused 9 suites / 62 tests and full Jest 156 suites / 1421 tests PASS with the existing open-handle warning; Node 20 type-check PASS; full lint exit 0 with 199 warnings; diff-check PASS; code validator final PASS after one Major `aria-haspopup` mismatch fix; security validator PASS with no findings. Runtime dev compile succeeded; authenticated 360 px browser validation was not performed because the browser reached only localhost login. `manage:translations:test` remains blocked by repository-wide existing duplicate/unstable localization data; no generated locale changes or localization-sync claim |
| T6.4-P ✅ | Prerequisite only: supported local mock `Reset demo` action plus a repeatable rehearsal runbook with environment/data preflight, evidence capture, stop/no-write rules and post-run ownership boundaries | S | EPMRPP-122045; actual 8 h split 2 h research / 4 h implementation / 2 h validation. Focused reset 3 suites / 27 tests and full Jest 158 suites / 1439 tests PASS; Node 20 type-check PASS; full lint exit 0 with 121 existing ESLint warnings and 199 existing Stylelint warnings; diff-check and independent code validation PASS. One Major security TOCTOU finding was fixed with post-import/reset and post-import/install state rechecks; security recheck PASS with no findings. Authenticated browser/T6.4 rehearsal not executed; no remote data mutated. Does not complete T6.4 or change the checklist below; Q-ORG-07 remains a hard stop |
| T6.4 ✅ | Demo rehearsal: run the 18-step parity checklist end to end, reset demo | S | EPMRPP-122046; [dated evidence](14-demo-rehearsal-2026-10-04.md) records 15 PASS / 2 FAIL / 0 BLOCKED / 1 N/A. Exact TC101–TC108 identities were found by pagination/display id. Failures: TC106 lacks the expected step-3 pending-comment target; local Push produced `81 → 91` rather than `81 → 92`, and TC107 had no pending comment to trigger the timeout path. Reset demo passed before and after; no remote writes occurred |
| T6.4-F 🟨 | Align the local TC106/TC107 review targets and fix outcomes with the approved remote case shapes, then rerun failed rehearsal steps 11–12 without replacing or mutating the remote scenarios | S | EPMRPP-122047; Original Estimate 12 h split 3 h research / 6 h implementation / 3 h validation. Implementation complete on `EPMRPP-122047-ai-factory-demo-fixture-alignment`: local logical targets normalize per real-case alias, TC107 starts clean seeds with one pending comment and TC106 finishes at 92. Focused 66 tests, full 1440 tests, type-check, lint, diff-check and Node 20 compile PASS; TC106 browser target PASS. Clean-seed TC107 browser timeout remains open because Reset/Push were intentionally skipped to preserve current demo data; see [dated evidence](15-demo-fixture-alignment-2026-10-05.md) |
| T6.5 ✅ | Toggle-OFF regression pass: with the toggle OFF, walk the Library, side panel, details, Edit Scenario, Test Plans, Manual Launches and Launches; compare against `develop` | S | EPMRPP-122048, branch `EPMRPP-122048-ai-factory-toggle-off-regression`; Original Estimate 8 h split 2 h research / 4 h regression-remediation / 2 h validation. Authenticated read-only comparison against fetched `origin/develop` at `fee530755` passed; focused 14 suites / 106 tests passed; no AI-only UI/request leak and no production-code remediation. Browser-local demo data remained unchanged. See [dated evidence](16-toggle-off-regression-2026-10-05.md) |
| T6.6 | **New (2026-09-29 audit, US-018).** NFR pass on FE-owned items only: masked-credential display (T3.6), keyboard reachability + accessible names for new actions (Approve, Push to agent, Automate, Discard, Re-run, Retry), 1280 px minimum width incl. the 360 px side-panel footer check, cost always 2-decimal USD labelled as a pipeline estimate | S | US-018 ACs that are FE's to own; the rest (security, reliability, perf, audit, data) is BE/ops, tracked in the requirements repo, not here |

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

**New tasks from the 2026-09-29 audit** (not yet in the graph above): `T3.6` depends on `T3.4` + `T0.7`;
`T4.4` depends on `T3.6` + `T1.3u`; `T1.2u` depends on `T1.2` + `T3.6`; `T1.3u` depends only on `T1.3`
(no new dependency). `T1.2u`/`T1.3u` are rework of already-shipped code and are **not started** —
see [01 §3a](01-knowledge-base.md#3a-requirements-audit-update-2026-09-29--supersedes-nothing-above-adds-to-it)
for the exact diff before picking them up.

## Jira mapping (FE sub-task parents)

Each `[FE]` sub-task is capped at **36 h (≈ 5 SP)** and assigned to Saveli_Savich@epam.com.
Split a story or cross-cutting scope further when its estimate exceeds that ceiling.

| Story | Jira parent | FE tasks / sub-task allocation |
|-------|-------------|------------------------------------------------------------|
| 001 | EPMRPP-121674 | T0.5 traceability → EPMRPP-121833 (stored as a split sibling under EPMRPP-121704) |
| 002 | EPMRPP-121704 | T0.2–T0.4, T0.6–T0.7 → EPMRPP-121829; T0.5 → EPMRPP-121833; T1.1–T1.2 → EPMRPP-121765; T1.3 → EPMRPP-121834; T6.2-G1 LP1/LP2 foundation → EPMRPP-122040; T6.2-G2 LP3 generic detail → EPMRPP-122041; T6.3 AI Factory i18n/a11y/360 px hardening → EPMRPP-122042; T6.4-P demo reset/runbook prerequisite → EPMRPP-122045; T6.4 rehearsal → EPMRPP-122046; T6.4-F demo fixture alignment → EPMRPP-122047; T6.5 toggle-OFF regression → EPMRPP-122048 |
| 003 | EPMRPP-121705 | T1.3 traceability → EPMRPP-121834 (stored as a split sibling under EPMRPP-121704); T1.3u → EPMRPP-121977 |
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
| 018 | EPMRPP-121841 | T6.6 (FE-owned NFR items only) — `[FE]` sub-task not yet created (created when the task starts, per standing rule) |
| 019 | EPMRPP-121842 | T3.6, T1.2u (partial) — `[FE]` sub-task not yet created |
| 020 | EPMRPP-121843 | T4.4 — `[FE]` sub-task not yet created |

---

## Demo parity checklist

The 18 walkthrough steps of the prototype, reproduced in the real UI on mocks.

| # | Step | Tasks | ✔ |
|---|------|-------|---|
| 1 | Pipelines: list with both pipelines, cards with status, requirement, stages, score, cost | T1.2 | ✅ |
| 2 | Iteration #1 · Grade: per-case scores, expandable reasons, no PASS/FAIL | T1.3 | ✅ |
| 3 | Upload panel: Draft / Ready (Auto-Ready), "Auto-Ready: 2 of 4 promoted (threshold 90)" | T1.3 | ✅ |
| 4 | Review panel: who made Ready, unsent comments, fix rounds with cost | T1.3 | ✅ |
| 5 | Compare #1 vs #2: suite +4 better, cost +$0.13 worse, duration delta | T4.3 | ✅ |
| 6 | Pipeline settings: toggle + threshold 90, validation, read-only note | T3.4 | ✅ |
| 7 | Library review queue: Status / AI quality columns, AI chip, quick filters, preset | T2.2, T2.3 | ✅ |
| 8 | Side panel TC106: status row, AI evaluation, disabled add buttons, Approve primary | T2.4, T4.1 | ☑ desktop + 360 px |
| 9 | Case page TC106 (Steps): AI evaluation panel with reasons | T2.5 | ☑ |
| 10 | TC103 cost ≈ $0.54 = share $0.32 + fix round $0.22, links | T2.6 | ☑ |
| 11 | TC106 step 3 comment thread, strip "1 not sent", Approve disabled, Discard | T3.1 | ❌ remote scenario has one step; visible targets show 0 comments |
| 12 | Push to agent TC106 → 81 → 92 → Auto-Ready; TC107 first push fails | T3.3 | ❌ TC106 ended at 91; TC107 Push unavailable with 0 pending comments |
| 13 | TC103 (88 < 90) Draft: Approve in the header; add buttons disabled | T3.2, T4.1 | ☑ |
| 14 | TC104 Text template: comments on Precondition / scenario block | T3.1 | ☑ |
| 15 | Edit Scenario TC108: hint + "Approve along with these changes"; In plan · Launch blocked | T3.2, T4.1 | ☑ no remote save |
| 16 | TC105 ⋯ → Automate → dialog → automation iteration (Fix Skipped) | T5.1, T5.2 | ☑ local mock only |
| 17 | TC101 Automation section: Automated, last result Passed, links | T5.3 | ☑ |
| 18 | (User flows tab: prototype only, not built in the product) | — | n/a |
