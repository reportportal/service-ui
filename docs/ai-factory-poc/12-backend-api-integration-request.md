# AI Factory backend API integration request

> **Status:** Proposed — not yet agreed or approved
>
> **Audience:** ReportPortal Backend/API owners, Platform/Security, Frontend, QA, Product and AI Factory PoC stakeholders
>
> **Audit baseline:** OpenAPI 3.0.1, `info.version: feature-pipelines-2767`, server `/api`, re-audited 2026-10-05 with no material drift from 2026-10-02
>
> **Published specification:** [OpenAPI JSON](http://tms.epmrpp.reportportal.io/api/api-docs) · [Swagger UI](http://tms.epmrpp.reportportal.io/ui/#organizations/my-organization/projects/superadmin-personal/api)
>
> **Related initiative:** [EPMRPP-118192](https://jiraeu.epam.com/browse/EPMRPP-118192)

**Send this file to the Backend/API owner as the primary hand-off.** It consolidates the decisions and deliverables
required to replace AI Factory development mocks with backend contracts. Attach or link
[05-backend-contract.md](05-backend-contract.md) for complete DTOs, implemented-consumer traceability and raw
OpenAPI mappings. The decision source is [10-backend-integration-contract.md](10-backend-integration-contract.md)
and its QA coverage is [11-backend-integration-contract-test-cases.md](11-backend-integration-contract-test-cases.md);
use [19-ci-connection-api-contract-request.md](19-ci-connection-api-contract-request.md) for the separate US-019 CI
connection decision.

Please record answers, status, target version/build and supporting OpenAPI/ADR links directly in the decision table
in section 4. Once agreed and reflected in the authoritative requirements repository and OpenAPI, this document can
be used as the implementation and acceptance sign-off artifact.

## 1. Executive assessment

The published Pipeline/Quality Standard API is a useful foundation, but a direct frontend cutover is not safe yet.
The implemented AI Factory UI also depends on Test Case AI, lifecycle, review/fix-round, Ready-only gate,
automation and backlink contracts that are **absent** from the audited OpenAPI. The current OpenAPI leaves
identity fields optional, exposes generic object-valued metrics, does not define status transitions, polling,
operation-specific errors, concurrency/idempotency or an operation-by-role authorization matrix. In addition, the
published discovery origin is plain HTTP while all operations inherit bearer JWT authentication.

Frontend EPMRPP-122040 provides a mock-default, hard fail-closed LP1/LP2 DTO/adapter/transport foundation, and
EPMRPP-122041 adds the corresponding LP3 generic-detail foundation: a strict reduced adapter, separate detail
transport/provenance with stale guards, canonical iteration-only live URL behind the closed gate and an honest
reduced-detail presentation. This does not change the requested backend decisions or constitute a live rollout:
trusted HTTPS, read roles, requiredness/status/polling semantics and Product/QA approval of the reduced catalog and
detail UI are still required before either live gate can be opened. No authenticated backend/browser validation or
live polling has been performed; rich KPI/cost/token/Test Case/CI/retry semantics remain excluded. Quality Standard
is not integrated by either scope. The LP3 foundation passed focused, full, type, lint, diff, senior code and
security validation after one Major request-race finding was fixed and regression-tested; this automated evidence
does not replace the still-blocked authenticated backend/browser acceptance.

Frontend EPMRPP-122052 adds presentation evidence for the still-blocked US-020 flow: a Re-run modal with
mock-supplied Model/Environment choices and a failed-Upload panel with rollback, current CI job and Retry Upload
affordances. Both final actions are disabled and send no request. This makes the missing command/capability and
attempt-history contracts concrete; it does not complete T4.4, enable LP6/LP7 or establish LP6 as an interactive
Re-run command.

The recommended sequence is:

1. **P0 — Foundation:** trusted HTTPS/same-origin access, required/nullability rules, errors, authorization, status
   semantics, polling and safe link/reference rules.
2. **P0-TC — Implemented Test Case workflows:** agree and publish C1–C3, L1–L3, R1–R3, F1–F2, G1–G2 and A1–A3
   as independently releasable endpoint/DTO groups.
3. **P1 — Pipeline definitions and iteration lists:** LP1 and LP2.
4. **P2 — Generic iteration detail:** LP3, initially without untyped KPI/cost parity.
5. **P3 — Current Quality Standard read:** QS1 as an independent, read-only capability clearly labelled as the
   current rubric.
6. **P4 — Neutral comparison:** LP4 may initially show identity/status changes only; metric deltas remain omitted
   until typed metric and direction semantics are agreed.
7. **P5 — Pipeline settings and stage retry:** LP5 and LP7 after authorization, validation, concurrency and retry
   semantics are complete.
8. **Separate blocked contract:** US-019 CI connection from 19; it gates T3.6/T1.2u and dependent actions.
9. **Separate blocked command contract:** US-020 user-facing Re-run, including server-owned Model/Environment
   capabilities; LP6 ingestion must not be assumed to satisfy it.
10. **Deferred:** QS2–QS4 management and historical Quality Standard association.

Important scope statements:

- **QS1 can be integrated independently** as a current-rubric read after its own contract and security prerequisites
  are closed.
- **QS2–QS4 and historical grading remain future scope.** API availability alone is not approval to expose rubric
  management.
- **LP6 is currently described as an iteration creation endpoint called by CI/the agent.** The frontend must not call
  it as a user-facing Re-run command unless Backend explicitly confirms command semantics, caller authorization and
  all rerun/idempotency invariants. If LP6 is ingestion, a separate Re-run command is required.
- **T6.7 Re-run and Retry Upload controls are contract probes only.** Re-run confirmation and Retry Upload are
  disabled; the frontend sends neither LP6 nor LP7. Mock `rerunOptions`, rollback text and a single CI job are
  presentation fixtures, not a backend DTO agreement.
- **The C/L/R/F/G/A/U contracts are implemented frontend expectations, not published backend facts.** Backend should
  accept them, propose equivalent normative paths/DTOs preserving the invariants, or explicitly defer each group.
- This audit was documentation-only. No authenticated calls and no mutating calls were executed.

### Related contract-readiness handoffs

| Capability | Published API status | Contract handoff | Implementation status |
|---|---|---|---|
| Complete AI Factory contract | LP1–LP7 and QS1–QS4 are published; C/L/R/F/G/A/U are absent | [Implementation-aligned contract](05-backend-contract.md) — complete DTOs, mock/live status, roles, polling, errors and source traceability | T0–T6.7 frontend surfaces are represented; T6.7 command affordances are disabled and most Test Case/automation workflows remain mock-only until backend publication |
| US-019 Pipeline CI connection | No read/save/test endpoint or DTO is present in the audited OpenAPI | [CI connection API contract request](19-ci-connection-api-contract-request.md) — proposed endpoint/DTO, write-only credential, state, permission, concurrency, audit, URL-security and downstream-gating decisions | EPMRPP-122050 completes documentation only. T3.6 remains blocked until the agreed source of truth is merged in `reportportal-requirements/.../contracts/` and a matching API is published |
| Contract validation | Published and provisional groups require negative, role, isolation and drift evidence | [Backend integration contract test cases](11-backend-integration-contract-test-cases.md) | Test plan exists; execution requires an identified backend build and sanitized payload pack |

## 2. Published endpoint inventory and requested readiness

All paths are relative to the published `/api` server. `projectKey` is a required string; numeric resource IDs are
documented as `int64`. “Observed” below means present in the published OpenAPI, not verified by a live authenticated
request.

| ID and endpoint | Observed success | Intended consumer | Requested readiness | Priority |
|---|---|---|---|---|
| **LP1 — List pipeline definitions:** `GET /v1/project/{projectKey}/pipeline` | `200 PipelineRS[]` | Project Pipeline list | Candidate after P0 and required pipeline identity/type fields are agreed | P1 |
| **LP2 — List iterations of one pipeline:** `GET /v1/project/{projectKey}/pipeline/{pipelineId}/iteration` | `200 PipelineIterationSummaryRS[]` (plain array) | Pipeline list/history | Candidate after P0, bounds/order and iteration invariants are agreed | P1 |
| **LP3 — Get one iteration with stages:** `GET /v1/project/{projectKey}/pipeline/iteration/{iterationId}` | `200 PipelineIterationDetailRS` | Iteration detail | FE generic-detail foundation exists behind a hard-closed live gate; rollout still requires P0 decisions and Product/QA approval, while specialized panels require typed stage results | P2 |
| **LP4 — Compare two iterations of the same pipeline:** `GET /v1/project/{projectKey}/pipeline/iteration/{iterationId}/compare?with={otherIterationId}` | `200 PipelineCompareRS` | Iteration comparison | T4.3 PoC calls this exact path through an identity-validating adapter and a same-path mock. Production remains a candidate first as neutral status/identity comparison; typed KPI/cost deltas and evaluative direction remain deferred until BE-014/BE-015 are closed | P4 |
| **LP5 — Update Auto-Ready settings:** `PATCH /v1/project/{projectKey}/pipeline/{pipelineId}` | `200 PipelineRS` | Pipeline settings UI | T3.4 implements the canonical request/body with 0–100 client validation and list refresh, but the current modal requires mock-catalog provenance and is not enabled from a live catalog. Rollout additionally requires validation, patch/null, authorization, concurrency and live-provenance decisions | P5 |
| **LP6 — Create a pipeline iteration and its stages:** `POST /v1/project/{projectKey}/pipeline/iteration` | `201 PipelineIterationDetailRS` | CI/agent producer according to published description | Producer contract needs clarification; not approved as UI Re-run | Deferred for UI Re-run |
| **LP7 — Trigger CI rerun for one stage:** `POST /v1/project/{projectKey}/pipeline/iteration/{iterationId}/stage/{stageId}/retry` | `202 PipelineStageRetryRS` | Authorized Pipeline Retry action | Blocked on eligibility, attempt identity, duplicate behavior and post-`202` refresh | P5 |
| **QS1 — Get the project's Quality Standard:** `GET /v1/project/{projectKey}/tms/quality-standard` | `200 TmsQualityStandardRS` | Current-rubric read-only UI | Independent candidate after required fields, absence and read roles are agreed | P3 |
| **QS2 — Create the project's Quality Standard:** `POST /v1/project/{projectKey}/tms/quality-standard` | `201 TmsQualityStandardRS` | Future management UI/API client | Requires separate Product-approved management scope and full write contract | Deferred |
| **QS3 — Update the project's Quality Standard:** `PUT /v1/project/{projectKey}/tms/quality-standard` | `200 TmsQualityStandardRS` | Future management UI/API client | Requires separate Product-approved management scope and full write contract | Deferred |
| **QS4 — Remove the project's Quality Standard:** `DELETE /v1/project/{projectKey}/tms/quality-standard` | `200`, no response schema | Future management UI/API client | Requires separate Product-approved management scope and delete/reference semantics | Deferred |

The OpenAPI currently documents `400`, `401`, `403` and `500` for these operations. It does not document stable
resource-specific `404`, conflict/idempotency `409`, semantic-validation `422` or throttling `429` behavior.

### 2.1 Frontend-required contracts absent from the published OpenAPI

Paths below are relative to `/api/v1/project/{projectKey}/`. They are implemented frontend/mock expectations from
[05](05-backend-contract.md), not claims about existing backend endpoints. Backend should accept these shapes or
publish equivalent normative contracts that preserve the documented behavior and migration path.

| Group | Requested operation/extension | Implemented consumer | Backend response requested |
|---|---|---|---|
| C1 | Add lifecycle, AI origin, evaluation/cost summary, review/fix, automation and blocked-plan fields to Test Case list/details/plan rows | Library, details, side panel, gates, automation dialog | Confirm additive DTO placement, requiredness, absence semantics and list/detail consistency |
| C2 | `GET tms/test-case/{id}/ai` | Evaluation, cost, lifecycle history, agent diff, automation result/progress | Publish the complete project-scoped response or an equivalent split resource with snapshot consistency |
| C3 | `filter.eq.lifecycle`, `filter.eq.ai`, `filter.eq.iterationId` plus review-queue total on Test Case list/count | Library quick filters and Review queue | Implement server-side AND filtering, pagination/count semantics and maximum bounds |
| L1–L2 | Single and batch lifecycle mutation | Approve / Mark as ready | Publish actions, exact updated/skipped partition, stable conflict reasons and authorization |
| L3 | Existing scenario update extension `promoteToReady` and response `lifecycleChanged` | Edit Scenario | Guarantee atomic scenario/lifecycle/evaluation/automation/history transition semantics |
| R1–R3 | List/create/delete/discard review comments | AI review strip | Define target identity, ownership, states, delete eligibility and fix-running conflicts |
| F1–F2 | Start and read/poll fix rounds | Push to agent | Define accepted/terminal states, comment transitions, job-start failure, score/cost result and idempotency |
| G1–G2 | Ready-only add/launch enforcement and Test Plan Draft summary | Test Case and Test Plan launch gates | Enforce server-side rejection and return compact complete Draft references across pagination |
| A1–A2 | Read automation environments and start automation | Send to automation and live progress | Publish environment source, exact accepted/skipped partition, re-automation confirmation and job-start errors |
| A3 | Test item `tmsTestCase` reference and root Launch `pipeline` attribute | Launch ↔ Library/Pipeline backlinks | Confirm reporting owner, identity types, absence/duplicate policy and safe internal-link correlation |
| U1 | User-facing Re-run command plus allowed Model/Environment capability values | Disabled T6.7 Re-run modal | Publish an interactive command distinct from ingestion unless LP6 is explicitly redefined; return stable option values/labels/defaults and the new iteration identity |
| U2 | Typed failed-Upload result and ordered retry-attempt history across LP3/LP7 or an equivalent resource | Failed-Upload panel and disabled Retry Upload | Guarantee all-or-nothing Library persistence; publish structured failure, attempt/job identity, downstream reset rules, cost/token accounting and post-`202` polling |

Requested first response from Backend for every row: **Accept**, **Replace with equivalent contract** (attach the
exact proposed path/DTO), or **Defer** (owner, reason, dependency and target date). Silence or mock behavior is not
backend agreement.

## 3. Observed contract versus integration need

### 3.1 Minimum response invariants requested

The following fields are **requested for integration**. They must not be interpreted as fields already guaranteed by
the published OpenAPI. Backend may confirm the proposed names or provide equivalent normative fields.

| Resource | Minimum invariant requested | Why it is required |
|---|---|---|
| Pipeline definition | Stable non-null `id`; non-blank `name`; stable `type` enum; repository metadata or explicit confirmation that it is unavailable | Stable list key/routing, correct generation-vs-automation presentation and honest repository display |
| Iteration | Stable non-null `id`; owning `pipelineId`; positive/stable `iterationNumber`; `status`; valid created/started/completed timestamps when applicable; actor identity contract | Route ownership validation, ordering, polling and audit presentation |
| Stage | Stable non-null `id`; unique non-blank `stageKey` within the iteration; unique `sequence`; `status`; owning iteration/pipeline derivable or explicit | Stable ordered detail rendering and safe retry targeting |
| Retry response | Required `stageId`; accepted `status`; stable attempt/job identity; optional validated run reference | Confirm the accepted action and track the correct attempt after `202` |
| Re-run capability/command | Stable Model/Environment machine values and labels; explicit defaults/availability; source iteration and immutable Pipeline identity; accepted command returns the new iteration identity and source linkage | Populate options without hardcoding, prevent stale/forged choices and navigate/poll the correct new iteration |
| Upload attempt | Stable attempt identity/number; status and timestamps; structured safe failure code/reason; validated CI job reference; explicit cost/token inclusion and rollback outcome | Render truthful attempt history and prove that a failed all-or-nothing Upload left the Library unchanged |
| Quality Standard | Stable standard `id`; non-blank `name`; optional top-level description with defined null semantics; timestamps with defined format/unit if exposed | Correct current-rubric identity and presentation |
| Quality Standard criterion | Stable `id`; non-blank `name`; positive/defined `maxPoints`; unique deterministic `sequence` | Deterministic ordered rubric and total score calculation |

Please publish these invariants through OpenAPI `required`, enum, format, minimum/maximum and description keywords,
or attach an explicit normative nullability matrix if an OpenAPI update cannot be made immediately.

### 3.2 Status semantics to complete

Please complete every cell. Also confirm whether `SKIPPED`, `CANCELLED` or any other statuses can occur now or are
planned, and how clients must handle forward-compatible unknown values.

| Published status | Business meaning | Applies to iteration | Applies to stage | Terminal? | Allowed transitions | Retry eligible? | Expected UI guidance |
|---|---|:---:|:---:|:---:|---|:---:|---|
| `PENDING` | _BE to complete_ | _BE_ | _BE_ | _BE_ | _BE to complete_ | _BE_ | _BE to complete_ |
| `PASSED` | _BE to complete_ | _BE_ | _BE_ | _BE_ | _BE to complete_ | _BE_ | _BE to complete_ |
| `FAILED` | _BE to complete_ | _BE_ | _BE_ | _BE_ | _BE to complete_ | _BE_ | _BE to complete_ |
| `NEEDS_HUMAN` | _BE to complete_ | _BE_ | _BE_ | _BE_ | _BE to complete_ | _BE_ | _BE to complete_ |
| Other/unknown future value | Client must fail safe; please define compatibility expectation | _BE_ | _BE_ | _BE_ | _BE to complete_ | _BE_ | Neutral Unknown state; never silently treat as Passed |

### 3.3 Metrics and typed stage results

The published `metrics: Record<string, object>` cannot safely represent primitive numeric/string KPIs and does not
define keys, value types, units, nullability, aggregation or comparison direction. A key registry by itself is not
sufficient while the value schema remains object-only.

For every UI-supported metric, please provide one of the following:

1. preferred: explicit typed DTO fields; or
2. an explicit discriminated OpenAPI `oneOf`/envelope defining metric key, value type, value, unit, nullability and
   schema-conforming examples.

The agreed contract must additionally define:

- whether higher, lower or neither is better for each comparable metric;
- token categories and aggregation rules, including input, cached input and output tokens;
- money amount representation, currency, precision, rounding and aggregation/inclusion rules;
- typed/discriminated stage results for generation, grading, upload, review/fix and automation, including stable Test
  Case identifiers/references and CI metadata.

Until this is agreed, the frontend will treat metrics as opaque and omit metric-derived KPIs, evaluative delta
colouring, token totals and costs. A generic stage/status detail remains possible after the minimum invariants are
closed.

## 4. Backend decisions and actions

Suggested status values: `Open`, `In discussion`, `Accepted`, `Implemented`, `Rejected`, `Deferred`.

| ID | Endpoint / DTO | Observed in published OpenAPI | Impact | Exact Backend answer or change requested | Priority | Blocks | BE answer | Status | Target version / build | Evidence / ADR |
|---|---|---|---|---|---|---|---|---|---|---|
| BE-001 | All operations / transport | Server is `/api`; published discovery origin is HTTP; global bearer JWT | Browser authentication over HTTP would expose credentials | Provide a trusted same-origin HTTPS route or approved HTTPS CORS origin with valid certificate; no HTTP/TLS-bypass fallback | P0 | All authenticated integration |  | Open |  |  |
| BE-002 | All response DTOs | Response properties are generally optional | Missing identity/status fields can invalidate routes and state | Publish endpoint-specific required/nullability/default rules, including the minimum invariants in section 3.1 | P0 | LP1–LP7, QS1–QS4 |  | Open |  |  |
| BE-003 | All operations / errors | Generic `400/401/403/500`; no endpoint-specific `404/409/422/429` contract | Client cannot reliably distinguish empty, absent, conflict, validation and retryable failures | Define per-endpoint statuses and an error envelope containing stable machine code, safe message, correlation ID and retryability; define `Retry-After` for `429` | P0 | Reads in degraded mode; all writes fully |  | Open |  |  |
| BE-004 | Iteration and stage status | Enum is `PENDING/PASSED/FAILED/NEEDS_HUMAN` | Terminal-state, polling, labels and actions are ambiguous | Complete section 3.2: meaning, applicability, terminal set, transitions, retry eligibility and skipped/cancelled policy | P0 | LP2–LP4, LP7 |  | Open |  |  |
| BE-005 | Live progress | No polling, cache or rate-limit contract | Clients may stay stale or overload the API | State recommended initial interval, backoff/jitter, terminal stop rules, visibility behavior, cache semantics and rate limits | P0 | LP2, LP3, LP7 acceptance |  | Open |  |  |
| BE-006 | Authorization | Possible `403` only; no operation-by-role/resource rules | Frontend visibility cannot enforce security | Publish and enforce server-side operation×role permissions, project membership and resource ownership; deny by default for absent/unknown authority; provide allowed/denied QA identities | P0 | All operations |  | Open |  |  |
| BE-007 | API references and URLs | `resultRef`, CI `runUrl` and retry `triggeredRunUrl` formats/trust are unspecified | Unsafe navigation or broken internal routing | Define each value's identifier/URL format, allowed schemes/hosts, internal route mapping, lifetime and sensitivity; never require credentials in query strings | P0 | Clickable links in LP3/LP7 |  | Open |  |  |
| BE-008 | API lifecycle | No compatibility window/breaking-change policy recorded | FE and BE may drift between deployments | State versioning policy, compatibility window and breaking-change notification/deprecation process; identify exact build behind OpenAPI | P0 | Release sign-off |  | Open |  |  |
| BE-009 | `PipelineRS` (LP1/LP5) | `id`, `name`, settings fields are optional; no pipeline type or pipeline-wide repository | Stable routing and correct presentation are not guaranteed | Make `id`/`name` required; add stable `type` enum; define repository metadata or confirm omission; define requiredness/null semantics of `autoReadyEnabled`/`autoReadyThreshold` | P1 | LP1; LP5 display |  | Open |  |  |
| BE-010 | LP2 | Plain array; no pagination/search/sort parameters | Unbounded list and unstable display order are possible | State load-tested safe maximum and deterministic default order; otherwise add server pagination plus stable sort/search contract | P1 | LP2 |  | Open |  |  |
| BE-011 | LP2 iteration summary | Identity, status, dates and actor fields are optional/underspecified | Iteration route, ordering and audit display can be invalid | Guarantee iteration `id`, `pipelineId`, stable `iterationNumber`, status and applicable dates; define `createdBy` identity and actor resolution | P1 | LP2 |  | Open |  |  |
| BE-012 | LP3 detail | Stages use generic fields/maps; stage identities/order and result variants are not normative | Specialized detail cannot be rendered safely | Guarantee stage `id`, unique `stageKey` and unique `sequence`; publish known and forward-compatible stage-key behavior; add discriminated typed stage results or approve generic status detail | P2 | LP3 full detail |  | Open |  |  |
| BE-013 | LP3 Test Case / CI data | `testCaseIds`, references and CI fields lack identifier/navigation semantics | Wrong entity linking and untrusted URLs are possible | Define Test Case ID type/system, reference format and CI provider/job/run/attempt fields; align URL rules with BE-007 | P2 | LP3 links and per-case detail |  | Open |  |  |
| BE-014 | Metrics / token usage / cost | `Record<string, object>` and generic attributes | Primitive KPI values and financial/token totals cannot be parsed or audited | Provide typed fields or a discriminated `oneOf` metric envelope with keys, types, units, nullability and examples; define token and money aggregation semantics | P2 | KPI/cost parity, rich LP3/LP4 |  | Open |  |  |
| BE-015 | LP4 compare | `current`, `previous` and deltas are optional; same-pipeline/error rules are unspecified | Cross-pipeline or empty comparisons may be misrepresented | Enforce same project/pipeline; guarantee compared identities; define missing/cross-pipeline/empty behavior; define metric direction before evaluative deltas | P4 | LP4 rich compare |  | Open |  |  |
| BE-016 | LP5 PATCH request | Threshold is `int32` without range; full-vs-partial, omitted-vs-null semantics unspecified | Client/server validation may differ and settings may be unintentionally cleared | Define threshold range/meaning, valid field combinations, PATCH merge rules, null handling and whether response is full current representation | P5 | LP5 |  | Open |  |  |
| BE-017 | LP5 concurrency | No version/ETag or lost-update rule | Concurrent settings edits may overwrite data | Define optimistic concurrency mechanism and stale-write response, plus audit actor/time behavior | P5 | LP5 |  | Open |  |  |
| BE-018 | LP6 purpose/caller | Described as CI/agent create; request uses `pipelineName`; includes rerun fields | Browser Re-run may expose producer authority or duplicate data | State whether LP6 is ingestion, execution command or both; define machine vs interactive authentication/least privilege; if ingestion, publish a separate UI Re-run command | Deferred for UI | LP6 integration and UI Re-run |  | Open |  |  |
| BE-019 | LP6 pipeline/rerun invariants | Pipeline identified by name; `rerun` and `rerunOfIterationId` rules absent | Rename/duplicates and cross-pipeline rerun chains are possible | Define name uniqueness/case/rename/create-on-submit behavior or use immutable ID; require same-project/same-pipeline source and define root-vs-previous rerun linkage | Deferred for UI | LP6 |  | Open |  |  |
| BE-020 | LP6 idempotency/atomicity/timing | `201` detail; no replay, atomicity or processing-state semantics | Producer retries may duplicate partial iterations/stages | Define idempotency key/natural identity, replay window, same-key/different-body conflict, transaction boundary, recovery, and whether `201` is final persistence or `202` asynchronous acceptance | Deferred for UI | LP6 producer acceptance |  | Open |  |  |
| BE-021 | LP7 eligibility | Stage has optional retry metadata; response fields optional | UI cannot know who/what is retryable or track accepted attempt | Define eligible stage/status/provider/role rules; require response `stageId`, status and attempt/job identity; define unavailable CI-provider failure | P5 | LP7 |  | Open |  |  |
| BE-022 | LP7 duplicate and post-`202` behavior | No idempotency/duplicate/polling contract | Double clicks may start duplicate jobs; accepted work may never refresh correctly | Define duplicate/in-flight behavior and conflict/idempotency response; define resource to poll after `202` and expected transition timing | P5 | LP7 |  | Open |  |  |
| BE-022A | LP7 request body | A JSON `PipelineStageRetryRQ` with optional `comment` is documented, but the request body itself is not marked required | Clients cannot know whether omitting the body and sending `{}` are both valid, or how an optional comment is validated | State whether a request body is required; separately define behavior for no body, `{}`, `{"comment":"..."}`, blank comment, null comment and invalid/oversized comment, including content type and validation errors | P5 | LP7 request construction |  | Open |  |  |
| BE-022B | LP7 `202` response body | OpenAPI documents `202 PipelineStageRetryRS`, whose fields are optional | Clients cannot know whether every accepted retry has a JSON representation or whether `202` may legally have no response body | Confirm whether every `202` returns `PipelineStageRetryRS` and which fields are required; if a bodyless `202` is valid, document its content type/body semantics and the authoritative resource/identity used for subsequent polling | P5 | LP7 response handling |  | Open |  |  |
| BE-023 | QS1 response / absence | Current standard fields are optional; no-standard behavior unclear | Cannot distinguish unconfigured project from error/invalid payload | Guarantee standard/criterion invariants in section 3.1; define no-standard status/body; define timestamps' type/unit and read roles | P3 | QS1 |  | Open |  |  |
| BE-024 | QS1 criterion content | Criterion has name/maxPoints/sequence but no criterion description | UI cannot show criterion guidance from the contract | Confirm a name-only current rubric is intentional, or add a criterion description field; frontend will not invent descriptions | P3 | QS1 content parity |  | Open |  |  |
| BE-025 | QS1 historical meaning | Only current mutable standard is exposed; no version/snapshot link to a grade | Past evaluations cannot be reproduced against the correct rubric | Keep QS1 labelled current-only; separately design immutable version or embedded snapshot linked to each historical grade | Future | Historical grading |  | Open |  |  |
| BE-026 | QS2/QS3 writes | Create-vs-update distinction, score invariants, concurrency, permissions/audit are incomplete | Invalid or lost rubric changes are possible | Before management scope: define existence conflicts, name/sequence uniqueness, max/total score rules, null/replace semantics, version/ETag and audit behavior | Deferred | QS2/QS3 |  | Open |  |  |
| BE-027 | QS4 delete | `200` without body; referenced-standard and audit semantics absent | Historical integrity or ambiguous result is possible | Define soft/hard delete, referenced-standard protection, idempotent repeat behavior, success status/body, permissions and audit event | Deferred | QS4 |  | Open |  |  |
| BE-028 | C1/C2/C3 Test Case AI read model | Required fields and filters exist only in FE types/mocks | Library/details may display incomplete, stale or unpageable AI data | Accept or replace C1–C3; publish DTO placement, snapshot consistency, server-side filtering/counting, bounds and absence/error semantics; for C2 `pipelineLinks`, confirm immutable route IDs plus optional display-only `pipelineName` and `requirementId` | P0-TC | T2.1–T2.6, T5.1–T5.3 |  | Open |  |  |
| BE-029 | L1–L3 lifecycle transactions | Lifecycle actions and scenario coupling exist only in FE proposal | Concurrent edits may lose state or leave lifecycle/evaluation/automation inconsistent | Publish atomic single/batch/scenario transitions, stable conflicts, obsolete confirmation, exact result partitions and optimistic-concurrency behavior | P0-TC | T2.1, T3.2 |  | Open |  |  |
| BE-030 | R1–R3 review comments | Comment targets, ownership and states are provisional | Comments may attach to the wrong scenario element or be deleted without authority | Publish stable target identity, author/ownership, state machine, delete/discard rules, pagination/order and fix-running conflicts | P0-TC | T3.1 |  | Open |  |  |
| BE-031 | F1–F2 fix rounds | Start/poll/result semantics are mock-only | Duplicate jobs, lost comments or incorrect lifecycle/evaluation/cost are possible | Publish idempotent start, polling resource, terminal states, comment rollback/commit, score/evaluation/lifecycle effects, cost provenance and downstream failures | P0-TC | T3.3 |  | Open |  |  |
| BE-032 | G1–G2 Ready-only enforcement | FE guards exist; server contract is absent | Direct requests or off-page Draft cases can bypass launch integrity | Enforce Ready-only rules server-side; publish batch skips, complete Test Plan Draft summary and `PLAN_HAS_DRAFT_CASES` conflict | P0-TC | T4.1–T4.2 |  | Open |  |  |
| BE-033 | A1–A2 automation | Environment/start contract is mock-only | Wrong environment, duplicate automation or dishonest accepted/skipped feedback is possible | Publish environment source and bounds, exact accepted/skipped partition, re-automation confirmation, idempotency, connection/permission gates and job-start failures | P0-TC | T5.1–T5.3 |  | Open |  |  |
| BE-034 | A3 Launch/Test Case backlinks | Test item field and root Launch attribute are fixture-only | Links can be missing, ambiguous, cross-project or spoofed | Confirm reporting producer and immutable identity correlation; publish additive DTO/attribute rules, absence/duplicate behavior and project isolation | P0-TC | T5.4 |  | Open |  |  |
| BE-035 | US-019 CI connection | No published read/save/test contract | T3.6, T1.2u and server-authoritative dependent-action gating cannot start safely | Resolve and publish the accepted contract from 19, including write-only credential, roles, state, concurrency, audit and safe provider access | Separate blocker | T3.6/T1.2u; Push/Automate/Re-run/Retry gating |  | Open |  |  |
| BE-036 | US-020 user-facing Re-run | T6.7 has a disabled modal using mock `PipelineRS.rerunOptions`; LP6 is described as CI/agent creation | The browser may call an ingestion API, hardcode stale options or create a duplicate/wrong iteration | Publish a dedicated interactive Re-run command, or explicitly redefine LP6 for this caller; define capability/options source, stable values/labels/defaults, same-requirement/source-link invariants, role/CI gates, idempotency and the accepted/new-iteration response | Separate blocker | T4.4 Re-run |  | Open |  |  |
| BE-037 | Failed Upload rollback and Retry attempt history | T6.7 displays one mock failure reason and stage CI job; LP3 has no typed Upload result and LP7 lacks attempt history/downstream semantics | UI cannot prove rollback, distinguish attempts or account for retried downstream work/cost | Guarantee atomic all-or-nothing Library write; publish typed failure code/reason, ordered attempt/job records, retry eligibility, downstream reset/re-execution, accumulated cost/token rules and authoritative post-`202` refresh | P5 | T4.4 Retry Upload and failed LP3 detail |  | Open |  |  |

## 5. Authorization and ownership matrix to approve

The following are the only currently known product-role decisions. Unresolved role cells are marked
`Decision required`; blank Backend-confirmation cells are awaiting an answer. Frontend controls are UX only;
Backend remains the authorization boundary.

Role-cell legend: `Allowed`, `Denied`, `Decision required`, `Not applicable`. `Decision required` means that access
has not been agreed and must not be interpreted as public or permitted access.

| Capability / operation | Viewer | Editor | Organization Manager | Instance Administrator | Project/resource ownership rule | Backend confirmation |
|---|:---:|:---:|:---:|:---:|---|---|
| Read Test Case AI data: C1–C3/C2 | Decision required | Decision required | Decision required | Decision required | Must require project membership and Test Case visibility; no cross-project identity leakage |  |
| Review comments, lifecycle and fix rounds: R/L/F | Denied | Allowed | Allowed | Allowed | Must verify project, Test Case, comment ownership and current lifecycle/fix state |  |
| Start automation: A2 | Denied | Allowed | Allowed | Allowed | Must verify project, every Test Case, Ready/fix/automation state and effective CI capability |  |
| Ready-only enforcement: G1–G2 | Existing add/launch permission plus mandatory Ready validation | Same | Same | Same | Server must validate every requested/plan case, including off-page rows |  |
| Read Launch/Test Case backlinks: A3 | Decision required | Decision required | Decision required | Decision required | Only return links visible to the caller in the same project context |  |
| Read Pipelines: LP1–LP4 | Decision required | Decision required | Decision required | Decision required | Must require project membership and prevent cross-project resource access |  |
| Update Pipeline settings: LP5 | Denied | Denied | Allowed | Allowed | Must verify target pipeline belongs to the requested project |  |
| Connect Pipeline to CI | Denied | Denied | Allowed | Allowed | Exact endpoint/resource ownership to be defined |  |
| User-facing Re-run | Denied | Denied | Allowed | Allowed | Must not imply permission to call CI/agent ingestion LP6 |  |
| Retry one stage: LP7 | Denied | Denied | Allowed | Allowed | Must verify project, iteration and stage ownership and current eligibility |  |
| Read Quality Standard: QS1 | Decision required | Decision required | Decision required | Decision required | Must require project membership |  |
| Create/update/delete Quality Standard: QS2–QS4 | Decision required | Decision required | Decision required | Decision required | Product approval plus server-side project ownership and audit required |  |
| CI/agent iteration submission: LP6 | Not applicable | Not applicable | Not applicable | Not applicable | Prefer dedicated least-privilege machine/service authority scoped to project/pipeline |  |

Please add any real ReportPortal role not shown here only through an explicit Product decision; do not widen access
because a role is absent from this table.

## 6. Required sanitized payload pack

Backend should provide **schema-conforming** sanitized success payloads and real error responses from one identified
integration build. Preserve shape while removing tokens, personal data and confidential repository details. Each
capture must include HTTP status, content type and, for errors, machine code, safe message, correlation ID and
retryability. Frontend owns synthetic malformed/wrong-type/unknown-enum security fixtures; Backend is not asked to
produce malformed success responses.

| Endpoint | Required backend captures | Related decisions |
|---|---|---|
| LP1 | Empty, one and many pipelines; each supported pipeline type; Auto-Ready on/off | BE-002, BE-009 |
| LP2 | Empty list, mixed statuses, maximum supported size, stable order, valid omission of every agreed optional field | BE-002, BE-004, BE-005, BE-010, BE-011 |
| LP3 | Every supported pipeline/stage type and status; known plus forward-compatible stage key; optional collections absent; Test Case and CI references | BE-002, BE-004, BE-007, BE-012–BE-014 |
| LP4 | Valid comparison, empty comparison, cross-pipeline request and missing iteration; after metric agreement, higher/lower/non-evaluative examples | BE-003, BE-014, BE-015 |
| LP5 | Successful full response; invalid threshold; forbidden; stale/conflict; not found | BE-003, BE-006, BE-016, BE-017 |
| LP6 | First submission; exact replay; same idempotency key/different body; invalid pipeline; invalid rerun combinations; cross-project source; forbidden caller | BE-003, BE-006, BE-018–BE-020 |
| LP7 request | No request body; `{}`; valid optional comment; blank/null/invalid/oversized comment; unsupported content type, with the exact accepted/rejected behavior agreed in advance | BE-003, BE-006, BE-022A |
| LP7 response | Accepted retry returning `PipelineStageRetryRS`; if contractually supported, separately capture accepted retry with no response body; non-retryable stage; duplicate/in-flight request; forbidden caller; CI-provider failure | BE-003–BE-006, BE-021, BE-022, BE-022B |
| User-facing Re-run | Capability response with zero/one/many Model and Environment options, explicit defaults and temporarily unavailable choices; accepted command, exact replay, changed-body replay, stale option, disconnected CI, forbidden caller and cross-project/source iteration | BE-003, BE-006, BE-035, BE-036 |
| Failed Upload / Retry history | Failed attempt with confirmed rollback and zero Library writes; multiple ordered attempts with distinct CI jobs; passed/ineligible stage; downstream reset/re-execution; accumulated and per-attempt cost/token examples | BE-003–BE-006, BE-021, BE-022, BE-037 |
| QS1 | No standard, minimum valid standard and representative full current standard | BE-002, BE-003, BE-006, BE-023, BE-024 |
| QS2–QS4 | When management is approved: create/update/delete success, already-exists, invalid criteria, conflict, forbidden and referenced-delete behavior | BE-003, BE-006, BE-026, BE-027 |
| C1–C3 | Manual and AI cases; absent/complete/obsolete evaluation; list/detail parity; each filter alone and combined; empty/multi-page/count results | BE-002, BE-003, BE-006, BE-028 |
| L1–L3 | Single/batch success, every stable skip/conflict, obsolete confirmation, concurrent scenario edit and atomic promote-to-Ready | BE-003, BE-006, BE-029 |
| R1–R3 | Every target/state, empty/multiple comments, own/foreign delete, discard, fix-running conflict and stale scenario target | BE-003, BE-006, BE-030 |
| F1–F2 | Accepted/running/PASSED/GRADE_FAILED/FAILED, duplicate start, no comments, downstream failure, comment rollback and cost/evaluation/lifecycle effects | BE-003, BE-006, BE-031 |
| G1–G2 | Single and mixed batch, off-page Draft case, zero/one/many plan Drafts, concurrent lifecycle change and launch conflict | BE-003, BE-006, BE-032 |
| A1–A3 | Environment absence/default/bounds; full/partial automation acceptance; re-automation conflict; in-progress/terminal projection; valid/absent/malformed/duplicate backlinks | BE-003, BE-006, BE-033, BE-034 |
| CI connection | Use the sanitized pack and redaction requirements from 19; never include real or placeholder credentials in read/evidence payloads | BE-001, BE-003, BE-006, BE-007, BE-035 |
| Common security | Missing/expired/invalid token; permitted and denied project/resource combinations; cross-project identifier attempt | BE-001, BE-003, BE-006, BE-007 |

## 7. Acceptance and validation checklist

The following QA-authored scenarios define the minimum acceptance set. Each execution must identify the exact API
build and OpenAPI version under test. “Automated” means a repeatable API/contract check; manual review supplements but
does not replace authorization or schema assertions.

### 7.1 QA acceptance scenarios

| ID | Precondition / input | Expected API and integration behavior | Traceability | Suggested automation |
|---|---|---|---|---|
| QA-BE-01 | Use a trusted HTTPS endpoint, then attempt HTTP, invalid-certificate and unapproved-origin access with an authenticated client | Only trusted HTTPS succeeds with certificate validation enabled; no bearer token, credential-bearing URL or sensitive query value appears in logs, evidence or errors | BE-001, BE-007 | Automated transport/security check plus log review |
| QA-BE-02 | Validate minimum, representative and agreed optional-field success payloads; separately exercise missing required identity, wrong type, invalid date and malformed nested entity fixtures | Deployed success payloads conform to required/nullability rules; malformed data is rejected or isolated to the affected entity and never becomes valid state through invented defaults | BE-002 | Automated schema/contract checks |
| QA-BE-03 | Call each enabled operation with missing, expired and invalid tokens; allowed and denied roles; foreign-project pipeline, iteration, stage and standard IDs | Authentication returns the agreed `401`; denied roles and cross-project/resource access return the agreed `403` or non-disclosing not-found response; no foreign resource data or existence detail leaks | BE-003, BE-006 | Automated API authorization matrix |
| QA-BE-04 | Trigger each agreed absent, validation, conflict, throttling and server-failure condition | Status and error envelope match the endpoint contract and include stable machine code, safe message, correlation ID and retryability; `429` includes the agreed `Retry-After` behavior | BE-003 | Automated negative API checks |
| QA-BE-05 | Request LP1 and LP2 for zero, one, typical and maximum supported datasets, including duplicate-looking names and mixed statuses | LP1 identities/names/types satisfy invariants; LP2 remains within the agreed bound and deterministic order, with stable iteration ownership and numbering | BE-009, BE-010, BE-011 | Automated API/contract checks |
| QA-BE-06 | Advance iterations and stages through every allowed status transition; provide terminal states and an unknown future enum value | Transitions and terminal states follow the approved matrix; polling stops at terminal state; unknown values remain neutral/unknown and are never interpreted as Passed | BE-004, BE-005 | Automated state-transition checks |
| QA-BE-07 | Return LP3 with multiple ordered stages, nested relationships, known and forward-compatible stage keys; include duplicate/missing IDs or sequences in negative fixtures | Valid stage IDs, keys and sequences are stable and uniquely ordered; route/project ownership is preserved; invalid stage identity/order is rejected or isolated; non-terminal detail refresh follows the polling/backoff contract | BE-004, BE-005, BE-012, BE-013 | Automated API/contract and polling checks |
| QA-BE-08 | Compare valid same-pipeline iterations, empty deltas, missing iterations and cross-pipeline IDs while metrics remain object-only or otherwise unagreed | Opaque metrics do not produce KPI, token or cost claims; permitted comparison is identity/status-only and neutral; invalid or cross-pipeline comparison follows the agreed error contract | BE-014, BE-015 | Automated API assertions plus presentation review |
| QA-BE-09 | Submit LP5 valid values, boundary/invalid thresholds, invalid field combinations, omitted/null fields and two concurrent updates using the agreed revision mechanism | Validation and PATCH merge semantics match the contract; stale updates fail deterministically without lost data; success returns or allows retrieval of authoritative stored state and audit metadata | BE-016, BE-017 | Automated API validation/concurrency checks |
| QA-BE-10 | Invoke LP6 using allowed machine/service authority and forbidden interactive/wrong-project callers; use existing, renamed, duplicate-case and unknown pipeline identities | Only the agreed caller class succeeds; pipeline resolution follows immutable-ID or explicit name rules; forbidden callers and ambiguous/unknown identities fail without creating an iteration | BE-006, BE-018, BE-019 | Automated API authorization/identity checks |
| QA-BE-11 | Submit LP6 first request, exact replay, same idempotency key with a different body, valid and invalid rerun combinations, cross-pipeline/project source, and simulated partial failure | Replay and conflict behavior match the contract; rerun linkage is valid and scoped; no duplicate/partial iteration escapes the atomicity rule; `201`/`202`, recovery and polling semantics match the agreed timing model | BE-018, BE-019, BE-020 | Automated API idempotency/transaction checks |
| QA-BE-12 | Invoke LP7 with no request body, `{}`, valid comment, blank/null comment, invalid/oversized comment and unsupported content type | Each request form is accepted or rejected exactly as documented, with the agreed validation status and stable error envelope | BE-003, BE-022A | Automated request-contract checks |
| QA-BE-13 | Retry eligible and ineligible stages; repeat/double-submit while in flight; exercise both structured and, only if agreed, bodyless `202` variants | Eligibility and authorization are enforced; duplicates follow the idempotency/conflict rule; accepted retry exposes the agreed attempt/polling identity, and subsequent LP3 state follows documented transitions | BE-006, BE-021, BE-022, BE-022B | Automated API idempotency/polling checks |
| QA-BE-14 | Request QS1 for no configured standard, minimum valid standard and representative full standard with ordered criteria | Absence is distinguishable from failure; valid identity, criterion and timestamp invariants hold; the response is presented only as the current rubric, with no invented criterion description | BE-002, BE-023, BE-024, BE-025 | Automated API/contract checks plus label review |
| QA-BE-15 | Inspect enabled endpoint scope before Product approval, then exercise future QS2–QS4 and historical-grade scenarios only after their decisions are accepted | QS2–QS4 management is unavailable in current scope; no mutable current standard is claimed as historical evidence; future writes/deletes enforce scoring, concurrency, audit, reference and immutable-history rules | BE-025, BE-026, BE-027 | Automated scope/API checks plus Product/QA sign-off |
| QA-BE-16 | Return HTTPS allowed/disallowed hosts, HTTP, protocol-relative, credential-bearing, malformed internal paths, `javascript:` and `data:` values in every reference field | Only approved HTTPS hosts and documented internal routes are actionable; every unsafe or malformed reference is rejected or remains non-clickable text and is never treated as markup | BE-007, BE-013, BE-021 | Automated reference-security checks |
| QA-BE-17 | Execute the complete applicable scenario set against the payload pack and deployed API advertised for sign-off; then compare build/version identifiers and compatibility policy | OpenAPI, payloads, contract results and environment identify the same deployed build; drift or an unannounced breaking change blocks sign-off | BE-008 | Automated provenance/version check plus release review |
| QA-BE-18 | Execute C1–C3, L1–L3, R1–R3 and F1–F2 success/conflict/concurrency cases from the sanitized pack | Test Case list/details/C2 remain snapshot-consistent; lifecycle, comments and fix rounds follow the accepted atomic state machines and exact result partitions | BE-028–BE-031 | Automated API/contract/state-transition checks |
| QA-BE-19 | Execute G1–G2 and A1–A3 with mixed/off-page/cross-project resources, partial automation acceptance and malformed backlink identities | Draft cases cannot bypass server gates; automation partitions every requested ID exactly; backlink data is project-safe and malformed/duplicate identity fails closed | BE-032–BE-034 | Automated API authorization/integrity checks plus navigation review |
| QA-BE-20 | Attempt T3.6 or dependent CI gating before and after the requirements/OpenAPI/payload prerequisites in 19 are satisfied | Runtime CI integration stays disabled while the contract is only proposed; after approval, write-only credentials, roles, isolation, concurrency and downstream capabilities match the authoritative contract | BE-035 | Readiness gate plus automated security/contract suite from 19 |
| QA-BE-21 | Open Re-run capabilities for zero/one/many options, then submit as allowed/denied roles with a valid, stale and forged option; repeat the same command and replay its idempotency key with a changed body | Options are server-owned and scoped; only an authorized caller with a fresh connected CI capability succeeds; exact replay is deterministic, changed-body replay conflicts, and success creates one new same-requirement iteration while leaving the source unchanged | BE-006, BE-035, BE-036 | Automated capability/authorization/idempotency checks plus presentation review |
| QA-BE-22 | Fail Upload before commit, during an atomic write and after a retry is accepted; inspect Library visibility and ordered attempt history; retry a passed/ineligible stage and repeat an in-flight retry | Every failed all-or-nothing attempt leaves zero partial Library cases; attempts/jobs/reasons and cost/token accounting are stable and ordered; invalid or duplicate retries fail per contract; accepted retry refreshes the correct iteration and only the documented downstream stages | BE-021, BE-022, BE-037 | Automated transaction, retry and polling checks plus Library integrity assertion |

### 7.2 Evidence required for sign-off

- [ ] OpenAPI URL and exact version/build under test.
- [ ] Completed decision/action and authorization tables.
- [ ] Sanitized payload pack tied to the same build.
- [ ] Automated backend contract/integration test report for required fields, validation, errors, authorization,
  ownership, concurrency/idempotency and state transitions.
- [ ] QA evidence for allowed and denied accounts, cross-project attempts and endpoint-specific edge cases.
- [ ] Product acceptance of every intentionally reduced behavior, such as generic stage detail, name-only criteria or
  neutral status-only comparison.

## 8. Backend acceptance checklist

Before an endpoint set is declared ready, Backend/API owner confirms:

- [ ] All applicable P0 decisions are `Accepted` or `Implemented` and supported by published evidence.
- [ ] Required/nullability, enum, constraint and error definitions match the deployed implementation.
- [ ] Operation×role and resource-ownership rules are enforced server-side and tested deny-by-default.
- [ ] Polling, terminal states, rate limits, retry, concurrency and idempotency are documented where applicable.
- [ ] The sanitized payload/error pack is available for the same deployed build.
- [ ] Forward-compatible unknown enum/stage/metric behavior is documented.
- [ ] API versioning and breaking-change notification owners are identified.
- [ ] Any accepted degraded behavior and deferred scope are explicitly recorded; silence is not approval.

## 9. Response and sign-off

Please use this section for the consolidated decision after filling section 4.

| Field | Response |
|---|---|
| Backend/API owner |  |
| Platform/Security owner |  |
| Product owner |  |
| QA owner |  |
| Frontend owner |  |
| Agreed endpoint scope for first integration |  |
| C/L/R/F/G/A disposition (`Accept` / `Replace` / `Defer`) |  |
| CI connection contract disposition |  |
| US-020 Re-run/Retry contract disposition |  |
| Explicitly deferred scope |  |
| OpenAPI version / backend build |  |
| Trusted HTTPS base URL |  |
| Payload pack location |  |
| Contract test evidence |  |
| ADR / Jira / meeting decision links |  |
| Target environment and date |  |
| Final status (`Approved` / `Approved with conditions` / `Not approved`) |  |
| Conditions and expiry/review date |  |

### Approvals

| Role | Name | Decision | Date | Evidence / comment |
|---|---|---|---|---|
| Backend/API |  |  |  |  |
| Platform/Security |  |  |  |  |
| Product |  |  |  |  |
| QA |  |  |  |  |
| Frontend |  |  |  |  |

## 10. Changelog

| Date | Change |
|---|---|
| 2026-10-05 | Synchronized the hand-off with T6.7. Recorded that Re-run and Retry Upload are disabled presentation shells; added the user-facing Re-run capability/command decision, failed-Upload atomic rollback and structured attempt-history decision, C2 backlink display context, payload requirements and QA-BE-21/22. No LP6/LP7 integration is claimed. |
| 2026-10-05 | Expanded the sendable backend hand-off from Pipeline/Quality Standard only to the complete implemented AI Factory contract. Added C/L/R/F/G/A inventory and decisions, corrected LP5 live availability, linked the detailed 05/11/19 artifacts, and extended payload, authorization, QA and sign-off requirements. Re-audited published OpenAPI with no material drift. |
| 2026-10-02 | Initial Pipeline and Quality Standard backend integration request. |
