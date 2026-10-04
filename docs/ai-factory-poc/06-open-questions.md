# 06 · Open questions, gaps and decisions log

Each question has an ID, an owner group and a **default** that the FE proceeds with until it is answered.
When a question is answered, move it to the *Decisions log* (bottom) with the date and who decided.

Owner groups: **ORG** (team or organisation, asked to the FE lead), **BA** (requirements owner, Anatolii Fedosik),
**BE** (backend, Hleb / Vadim), **FE** (our own design decisions), **DES** (design).

## ORG: organisation and process

| ID | Question | Default until answered |
|----|----------|------------------------|
| Q-ORG-04b | Demo date? (Team size answered: one dev) | Plan ≈ 9–11 weeks; cut list in the README |
| Q-ORG-07 | Which remote project / folder may the mock seeding write real test cases into (the backend is shared)? | A dedicated demo project or folder `AI Factory demo`; ask before the first seed |
| ~~Q-ORG-05~~ | ~~Jira PAT returns 401~~ → **resolved 2026-09-25**: renewed in `service-ui/.env`; the script authenticates and creates sub-tasks | — |
| Q-ORG-06 | Does code review happen by the regular service-ui reviewers or inside the bootcamp team only? | Bootcamp team |

## BA: requirement gaps (to Anatolii)

| ID | Gap / ambiguity | Where | Default |
|----|-----------------|-------|---------|
| Q-BA-01 | Where do lifecycle **History** entries live? The prototype has a "History" section on the case page. The product already has a **History of actions** sub-route | US-007 | A new collapsible "History" (lifecycle) section in the details left column; the BE may also write activity (Q-FE-01) |
| Q-BA-02 | Can reviewers comment on the **Ready** case of a manual case? AC: comments are for AI cases only. Push works on Ready AI cases. Confirm that comments on Ready AI cases are allowed | US-011, US-012 | Allowed on AI cases in any lifecycle; manual → no comments |
| Q-BA-03 | Comment anchoring after an agent fix: steps are replaced. Addressed comments stay attached to step **position**? What if the agent removes or reorders steps? | US-011/012 | Addressed comments are kept by position; comments whose position no longer exists are shown under the Precondition as "on removed step N" |
| Q-BA-04 | Test Plan page "Launch blocked" banner is **not prototyped**: exact place, link format, and how Draft cases are marked in the plan list | US-014 | A `SystemMessage` above the plan content, listing the Draft case IDs as links; a Draft badge in the plan rows |
| Q-BA-05 | Manual Launch from the Test Plan page ("Add to Launch" of the whole plan) is also gated? | US-014 | Yes, blocked while the plan has Draft cases |
| Q-BA-06 | Bulk Approve of cases with an **Obsolete** evaluation: is a confirmation needed (single approve asks)? | US-008/013 | Bulk approves them and lists them as "approved with obsolete evaluation" in the result message |
| Q-BA-07 | Iteration **Failed** for automation: "at least one case failed". Does the Launch still get linked? Is the case status `FAILED`? | US-016/017 | Launch linked if created; case `FAILED` with stage + reason |
| Q-BA-08 | Colours of score bars: the prototype colours them by share (green / amber / red), and the AC forbids "traffic-light verdicts". Which one wins? | US-009 | Neutral single-colour bars (Q-FE-05) |
| Q-BA-09 | "Trigger" values for iterations (Web form · REQUIREMENT, Automate · Test Case Library, …): a closed list? | US-002 | Free string from the BE |
| Q-BA-10 | Environment list for Automate (beta5, qa, dev5): where does it come from? | US-015 | From the BE (A1), default `beta5` |
| Q-BA-11 | Library side panel for a Draft AI case has ⋯, Open Details, Add to Launch, Add to Test Plan and Approve (5 buttons). Is overflow into ⋯ acceptable at narrow widths? | US-008 | Keep 5; at < 400 px, move Add to Launch into ⋯ |
| Q-BA-12 | Priority names differ: the prototype uses Critical / Major / Medium / Minor, the product uses blocker / critical / high / medium / low / unspecified | prototype | Use the product priorities |

## BE: contract (to Hleb / Vadim), see [05](05-backend-contract.md)

### Confirmed by the live OpenAPI audit (2026-10-02)

Source: [live OpenAPI document](http://tms.epmrpp.reportportal.io/api/api-docs) (`3.0.1`, version
`feature-pipelines-2767`, server `/api`); it is also rendered in the
[TMS API UI](http://tms.epmrpp.reportportal.io/ui/#organizations/my-organization/projects/superadmin-personal/api).

| Fact | Confirmed value |
|------|-----------------|
| Published namespaces | Pipeline operations use `/v1/project/{projectKey}/pipeline`; Quality Standard operations use `/v1/project/{projectKey}/tms/quality-standard`. The proposed Test Case C/L/R/F/A resources are not published in these groups and remain open |
| Published operation count | 11 total: 7 Pipeline operations (list definitions, list iterations, iteration detail, compare, create iteration, retry stage, update pipeline) and 4 Quality Standard CRUD operations |
| Compare query | `GET …/pipeline/iteration/{iterationId}/compare` requires the query parameter `with=<iterationId>` |
| Pipeline list queries | The published Pipeline definition-list and iteration-list operations expose no pagination, search, sort or filter query parameters. This is a live-spec fact, not a decision that such parameters will never be added |
| Live status enum | Both live iteration and stage schemas expose `PENDING \| PASSED \| FAILED \| NEEDS_HUMAN`; mapping these four values to the current richer UI state model remains open |
| Authentication | Global `bearerAuth`: HTTP bearer token, bearer format JWT |
| Transport | The published source/origin is plain HTTP. Authenticated integration is blocked until a trusted HTTPS endpoint exists; do not send bearer tokens to this origin and do not bypass TLS verification |
| Success responses | Pipeline GETs, compare and PATCH: `200`; create iteration: `201`; retry stage: `202`. Quality Standard GET: `200`; POST: `201`; PUT: `200`; DELETE: `200` with no response-body schema |
| Documented errors | Every one of the 11 operations documents `400`, `401`, `403` and `500`; `401` is `string \| ErrorRS`, the other documented errors use `ErrorRS`. The spec does **not** document `404`, `409` or `422`; that absence is a contract gap, not proof those situations cannot occur |
| Integration state | Published does not mean integrated: the current FE still uses proposal-shaped mock DTOs. Live adoption needs raw DTO adapters, path/schema alignment and per-group rollout under T6.2 |

| ID | Question | Default |
|----|----------|---------|
| Q-BE-01 | Test Case C1/C2/L3: where are lifecycle / AI / evaluation / cost summaries and details returned, and what exact write response signals Ready → Draft? None of these Test Case operations is present in the audited Pipeline/Quality Standard groups | Keep the current mock contract only; do not treat it as live API evidence |
| ~~Q-BE-02~~ | ~~Namespace for Pipeline and Quality Standard resources~~ → **resolved 2026-10-02**: Pipeline is `/pipeline`; Quality Standard is `/tms/quality-standard` | See the confirmed-facts table above |
| Q-BE-03 | Filter parameter naming for `lifecycle` / `ai` / `iterationId` following the existing TMS convention | As in 05 C3 |
| Q-BE-04 | What are the names, units and direction semantics of dynamic stage `metrics` and `attributes`? Are values always numeric, and which metrics mean "higher is better"? | Preserve unknown entries through the adapter; format only recognised metrics and do not infer delta colouring |
| Q-BE-05 | Async notification of fix rounds / automation: polling OK for the PoC? | Polling 3 s / 5 s |
| Q-BE-06 | Is the "What the agent changed" snapshot stored by the BE (before / after scenario)? | Yes, `lastAgentChange` in C2 |
| Q-BE-07 | Do batch add-to-plan / add-to-launch return a `skipped` part for Draft cases? | FE pre-filters; the BE rejects |
| Q-BE-08 | Mapping from the automation `testCaseId` (string) → Library numeric id for Launch links | `tmsTestCase` on the test item (A3) |
| ~~Q-BE-09~~ | ~~F11: is the feature flag a server feature, a project attribute or nullable fields?~~ → **resolved 2026-09-29** via D14: UI flag OFF by default, switched by an Administrator, backend additive | — |
| ~~Q-BE-10~~ | ~~F15: how does "Project Manager and above" map onto the current roles?~~ → **resolved 2026-09-29** via D15: Editor — review actions; Organization Manager/Administrator — Pipeline settings, CI connection, Re-run/Retry. Matches T0.7 exactly | — |
| Q-BE-11 | Several fields required by the current T1 UI are optional in the live OpenAPI schemas. Which response fields are guaranteed for each pipeline type/stage, and which missing fields represent a valid partial response rather than bad data? | Raw adapters accept omission; stable UI models use explicit unknown/empty states and never invent values |
| Q-BE-12 | How do live iteration/stage statuses `PENDING`, `PASSED`, `FAILED`, `NEEDS_HUMAN` map to the current UI's richer iteration states, especially running/in-progress, `IN_REVIEW`, completed and stage `SKIPPED`? | Keep the current mock state machine until a BE mapping is agreed; adapters must handle unknown values safely and must not cast the live enum directly |
| Q-BE-13 | The live Pipeline definition does not expose all current UI fields, including the proposal's pipeline type, repository/CI metadata and some group-header values. Are these fields planned, derived elsewhere or intentionally removed? | Show only contract-backed data in live mode; do not derive generation/automation type from names |
| Q-BE-14 | For `PATCH …/pipeline/{pipelineId}`, is the response the complete updated resource or only changed fields; how are omitted vs `null` properties interpreted; which ranges/field combinations are validated; must the FE GET again after success; and which status represents missing pipeline or validation conflict since `404`/`409`/`422` are undocumented? | Send only explicitly edited supported fields and refetch after success until read-back semantics are confirmed |
| Q-BE-15 | For create iteration and stage retry: what is the idempotency/replay contract, which stage states are retryable, how are concurrent requests rejected, where are attempt history and accumulated cost returned, and which status represents missing/conflicting state since `404`/`409`/`422` are undocumented? | Disable duplicate submission client-side, but do not claim exactly-once behavior; require a refreshed server representation after success |
| Q-BE-16 | Quality Standard: which roles may GET/create/update/delete; what does absence return; is there a version/history model; how are concurrent edits detected; and which statuses represent absent/conflicting/invalid state since `404`/`409`/`422` are undocumented? The published response supplies only the current standard `name`/top-level `description` and criteria `name`/`maxPoints`/`sequence` (plus ids/timestamps); it has no criterion descriptions, rubric version/snapshot or historical evaluation linkage | T2.5 may use GET read-only only for the current-rubric subset, with explicit absent/error states; the missing rubric metadata remains blocked. Do not add management CRUD UI without separate product scope |
| Q-BE-17 | What are the final namespaces and operations for the proposed Test Case C/L/R/F/A groups and automation APIs? | Keep the proposal groups mock-only until each live operation is published and audited |
| Q-BE-18 | What is the server-side permission matrix for each Pipeline and Quality Standard operation, and does every mutation deny by default when the caller's role/ownership is absent or unknown? The OpenAPI only advertises possible `403`; FE role checks cannot enforce authorization | Treat FE permission checks as UX only. Do not enable live mutations until backend authorization and deny-by-default behavior are confirmed |
| Q-BE-19 | Which response fields containing external URLs (for example repository, CI job, merge request or launch links) are trusted, and what scheme/host allowlist must the FE apply before rendering them as navigation targets? | Treat all API URL strings as untrusted; render no clickable external link until a product-owned scheme/host policy is agreed, then allowlist it |

## FE: our own decisions (defaults applied, revisit if needed)

| ID | Decision | Rationale |
|----|----------|-----------|
| Q-FE-01 | Lifecycle History shown as a collapsible section in the details left column (from `lifecycleHistory` in C2) | Matches the prototype; no dependency on the activity service |
| Q-FE-02 | Pipeline settings as a **modal**, not a page | Simpler; reuses ui-kit Modal + Toggle + FieldNumber; no extra route |
| Q-FE-03 | Pipelines built from UI-kit and TMS components, following the prototype's structure (not Vitalii's pixel design) | Reuse the requirement; no Figma for PL-* in the repo (❓ DES) |
| ~~Q-FE-04~~ | ~~The Compare page computes deltas on the FE from two iteration DTOs~~ → **superseded 2026-10-02** by the published server compare operation with required `with=<iterationId>` | T4.3 consumes the server comparison response; FE formatting and safe fallbacks only |
| Q-FE-05 | Neutral colour for criterion bars (no red / amber / green) | AC "no traffic-light verdicts" |
| Q-FE-06 | Mock DB persisted in localStorage + Reset demo | Demo survives a reload |
| ~~Q-FE-07~~ | ~~A Launch for automation results in mock mode~~ → **resolved 2026-10-04**: T5.4 validates the link renderer through component fixtures on the existing real Item info, details-modal and root-Launch ParentInfo hosts. It does not intercept or fabricate the Launch controller/API | Real end-to-end Launch verification waits for CI/BE to report A3 and `pipeline:<pipelineId>/<iterationId>` on an actual Launch |
| Q-FE-08 | Pipelines sidebar item placed before Test Case Library | Prototype order |

## DES: design

| ID | Question | Default |
|----|----------|---------|
| Q-DES-01 | Figma for the Pipelines screens (Vitalii PL-01/02/05) and the new icons (Pipelines sidebar icon, AI chip, comment icon)? | Existing icon set + a simple inline SVG |
| Q-DES-02 | Dark theme support needed for the demo? | Use UI-kit tokens (works in both themes), no extra checks |

---

## Decisions log

| Date | ID | Decision | By |
|------|----|----------|----|
| 2026-09-23 | D1–D10 | Grooming decisions (see 01 §3) | grooming |
| 2026-09-25 | — | Plan v0.1 written; defaults above applied | FE |
| 2026-09-25 | FF | **Every new part is behind one feature toggle; toggle OFF = current functionality unchanged** (incl. existing button rules, requests, mocks). See 03 §3 | Saveli Savich |
| 2026-09-25 | Q-ORG-01 | Per-task branches from `bootcamp-prototype` (`EPMRPP-<subtask>-<desc>`), PRs back into `bootcamp-prototype` | Saveli Savich |
| 2026-09-25 | Q-ORG-02 | One `[FE]` sub-task per story, assignee Saveli_Savich@epam.com; Phase 0 goes under US-002 (EPMRPP-121704) | Saveli Savich |
| 2026-09-25 | Q-ORG-03 | Local only: `npm run dev` with the remote backend (`PROXY_PATH`) → mock mode A (overlay); mocks are never in production builds | Saveli Savich |
| 2026-09-25 | Q-ORG-04 | One FE developer (Saveli Savich); phases run sequentially | Saveli Savich |
| 2026-09-25 | — | Docs stay in `docs/ai-factory-poc/` on `bootcamp-prototype` | Saveli Savich |
| 2026-09-25 | Q-ORG-02b | `[FE]` sub-tasks are created **one at a time, when the story starts** (not in advance). First one: EPMRPP-121765 under US-002 | Saveli Savich |
| 2026-09-25 | EST | **After every task, record the hours a senior human FE developer would need** for the delivered result. All estimations live in **08-estimations.md** and nowhere else | Saveli Savich |
| 2026-09-25 | Q-ORG-05 | Jira PAT renewed; sub-task creation via the script works | Saveli Savich |
| 2026-09-28 | — | Mode A (overlay) confirmed viable: the remote dev backend is reachable and `/api/info` answers as expected. A live authenticated shape check needs a real browser login, not a bare script; `overlay.ts` is verified against a fixture instead — see T0.5 in 00-status and 08-estimations | Claude + Saveli |
| 2026-09-28 | — | Seeding real AI-marked cases and detecting a live scenario edit are **deferred until Q-ORG-07 is answered** (target project/folder for a shared dev backend write) | Claude + Saveli |
| 2026-09-29 | Q-ORG-02c | Supersedes the one-sub-task-per-story granularity: every `[FE]` sub-task is capped at **36 h (≈ 5 SP)**; split stories and cross-cutting work into cohesive scopes when needed | Saveli Savich |
| 2026-09-29 | D11–D19 | Requirements audit accepted: iteration-per-folder upload (D11), fix-round case identity by Library id (D12), automation Launch/MR semantics (D13), AI Factory flag = D14 (resolves Q-BE-09), roles = D15 (resolves Q-BE-10), all 20 stories in scope incl. 3 new ones — 018 NFR, 019 Connect pipeline to CI, 020 Re-run/Retry (D16), pipeline-as-entity BE modelling (D17), retry-inside-Create (D18), Re-run/Retry scope (D19). Full detail + FE-impact table: [01 §3a](01-knowledge-base.md#3a-requirements-audit-update-2026-09-29--supersedes-nothing-above-adds-to-it). New rework tasks T1.2u/T1.3u logged in 04, **not implemented — pending go-ahead** | audit (Claude, requested by Anatolii Fedosik) |
| 2026-10-02 | API-AUDIT | Live OpenAPI publishes Pipeline under `/pipeline` and Quality Standard under `/tms/quality-standard` (11 operations total). Server compare with required `with` supersedes Q-FE-04. Existing T1 delivery stays complete on mocks/proposal models; live adoption is a future adapter-backed T6.2 slice and is blocked on trusted HTTPS plus the remaining security contract. Quality Standard GET supports only T2.5's current standard name/top-level description and ordered criterion names/maxima; criterion descriptions, version/snapshot and historical linkage are absent. CRUD management UI is out of scope without a separate product decision | Codex + Saveli |
