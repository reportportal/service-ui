# Backend API integration request — Pipelines and Quality Standard

> **Status:** Proposed — not yet agreed or approved
>
> **Audience:** ReportPortal Backend/API owners, Platform/Security, Frontend, QA, Product and AI Factory PoC stakeholders
>
> **Audit baseline:** OpenAPI 3.0.1, `info.version: feature-pipelines-2767`, server `/api`, audited 2026-10-02
>
> **Published specification:** [OpenAPI JSON](http://tms.epmrpp.reportportal.io/api/api-docs) · [Swagger UI](http://tms.epmrpp.reportportal.io/ui/#organizations/my-organization/projects/superadmin-personal/api)
>
> **Related initiative:** [EPMRPP-118192](https://jiraeu.epam.com/browse/EPMRPP-118192)

This document is a self-contained request for the backend contract needed to integrate the published Pipeline and
Quality Standard APIs into `service-ui`. Please record answers, status, target version/build and supporting
OpenAPI/ADR links directly in the decision table in section 4. Once agreed, this document can be used as the
implementation and acceptance sign-off artifact.

## 1. Executive assessment

The published API is a useful foundation, but a direct frontend cutover is not safe yet. The current OpenAPI leaves
identity fields optional, exposes generic object-valued metrics, does not define status transitions, polling,
operation-specific errors, concurrency/idempotency or an operation-by-role authorization matrix. In addition, the
published discovery origin is plain HTTP while all operations inherit bearer JWT authentication.

The recommended sequence is:

1. **P0 — Foundation:** trusted HTTPS/same-origin access, required/nullability rules, errors, authorization, status
   semantics, polling and safe link/reference rules.
2. **P1 — Pipeline definitions and iteration lists:** LP1 and LP2.
3. **P2 — Generic iteration detail:** LP3, initially without untyped KPI/cost parity.
4. **P3 — Current Quality Standard read:** QS1 as an independent, read-only capability clearly labelled as the
   current rubric.
5. **P4 — Neutral comparison:** LP4 may initially show identity/status changes only; metric deltas remain omitted
   until typed metric and direction semantics are agreed.
6. **P5 — Pipeline settings and stage retry:** LP5 and LP7 after authorization, validation, concurrency and retry
   semantics are complete.
7. **Deferred:** LP6 as a browser Re-run action; QS2–QS4 management; historical Quality Standard association.

Important scope statements:

- **QS1 can be integrated independently** as a current-rubric read after its own contract and security prerequisites
  are closed.
- **QS2–QS4 and historical grading remain future scope.** API availability alone is not approval to expose rubric
  management.
- **LP6 is currently described as an iteration creation endpoint called by CI/the agent.** The frontend must not call
  it as a user-facing Re-run command unless Backend explicitly confirms command semantics, caller authorization and
  all rerun/idempotency invariants. If LP6 is ingestion, a separate Re-run command is required.
- This audit was documentation-only. No authenticated calls and no mutating calls were executed.

## 2. Published endpoint inventory and requested readiness

All paths are relative to the published `/api` server. `projectKey` is a required string; numeric resource IDs are
documented as `int64`. “Observed” below means present in the published OpenAPI, not verified by a live authenticated
request.

| ID and endpoint | Observed success | Intended consumer | Requested readiness | Priority |
|---|---|---|---|---|
| **LP1 — List pipeline definitions:** `GET /v1/project/{projectKey}/pipeline` | `200 PipelineRS[]` | Project Pipeline list | Candidate after P0 and required pipeline identity/type fields are agreed | P1 |
| **LP2 — List iterations of one pipeline:** `GET /v1/project/{projectKey}/pipeline/{pipelineId}/iteration` | `200 PipelineIterationSummaryRS[]` (plain array) | Pipeline list/history | Candidate after P0, bounds/order and iteration invariants are agreed | P1 |
| **LP3 — Get one iteration with stages:** `GET /v1/project/{projectKey}/pipeline/iteration/{iterationId}` | `200 PipelineIterationDetailRS` | Iteration detail | Candidate first as generic detail; specialized panels require typed stage results | P2 |
| **LP4 — Compare two iterations of the same pipeline:** `GET /v1/project/{projectKey}/pipeline/iteration/{iterationId}/compare?with={iterationId}` | `200 PipelineCompareRS` | Iteration comparison | Candidate first as neutral status/identity comparison; typed KPI deltas deferred | P4 |
| **LP5 — Update Auto-Ready settings:** `PATCH /v1/project/{projectKey}/pipeline/{pipelineId}` | `200 PipelineRS` | Pipeline settings UI | Blocked on validation, patch/null, authorization and concurrency semantics | P5 |
| **LP6 — Create a pipeline iteration and its stages:** `POST /v1/project/{projectKey}/pipeline/iteration` | `201 PipelineIterationDetailRS` | CI/agent producer according to published description | Producer contract needs clarification; not approved as UI Re-run | Deferred for UI Re-run |
| **LP7 — Trigger CI rerun for one stage:** `POST /v1/project/{projectKey}/pipeline/iteration/{iterationId}/stage/{stageId}/retry` | `202 PipelineStageRetryRS` | Authorized Pipeline Retry action | Blocked on eligibility, attempt identity, duplicate behavior and post-`202` refresh | P5 |
| **QS1 — Get the project's Quality Standard:** `GET /v1/project/{projectKey}/tms/quality-standard` | `200 TmsQualityStandardRS` | Current-rubric read-only UI | Independent candidate after required fields, absence and read roles are agreed | P3 |
| **QS2 — Create the project's Quality Standard:** `POST /v1/project/{projectKey}/tms/quality-standard` | `201 TmsQualityStandardRS` | Future management UI/API client | Requires separate Product-approved management scope and full write contract | Deferred |
| **QS3 — Update the project's Quality Standard:** `PUT /v1/project/{projectKey}/tms/quality-standard` | `200 TmsQualityStandardRS` | Future management UI/API client | Requires separate Product-approved management scope and full write contract | Deferred |
| **QS4 — Remove the project's Quality Standard:** `DELETE /v1/project/{projectKey}/tms/quality-standard` | `200`, no response schema | Future management UI/API client | Requires separate Product-approved management scope and delete/reference semantics | Deferred |

The OpenAPI currently documents `400`, `401`, `403` and `500` for these operations. It does not document stable
resource-specific `404`, conflict/idempotency `409`, semantic-validation `422` or throttling `429` behavior.

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
| BE-022 | LP7 duplicate and post-`202` behavior | No idempotency/duplicate/polling contract | Double clicks may start duplicate jobs; accepted work may never refresh correctly | Define duplicate/in-flight behavior and conflict/idempotency response; state whether body may be empty; define resource to poll after `202` and expected transition timing | P5 | LP7 |  | Open |  |  |
| BE-023 | QS1 response / absence | Current standard fields are optional; no-standard behavior unclear | Cannot distinguish unconfigured project from error/invalid payload | Guarantee standard/criterion invariants in section 3.1; define no-standard status/body; define timestamps' type/unit and read roles | P3 | QS1 |  | Open |  |  |
| BE-024 | QS1 criterion content | Criterion has name/maxPoints/sequence but no criterion description | UI cannot show criterion guidance from the contract | Confirm a name-only current rubric is intentional, or add a criterion description field; frontend will not invent descriptions | P3 | QS1 content parity |  | Open |  |  |
| BE-025 | QS1 historical meaning | Only current mutable standard is exposed; no version/snapshot link to a grade | Past evaluations cannot be reproduced against the correct rubric | Keep QS1 labelled current-only; separately design immutable version or embedded snapshot linked to each historical grade | Future | Historical grading |  | Open |  |  |
| BE-026 | QS2/QS3 writes | Create-vs-update distinction, score invariants, concurrency, permissions/audit are incomplete | Invalid or lost rubric changes are possible | Before management scope: define existence conflicts, name/sequence uniqueness, max/total score rules, null/replace semantics, version/ETag and audit behavior | Deferred | QS2/QS3 |  | Open |  |  |
| BE-027 | QS4 delete | `200` without body; referenced-standard and audit semantics absent | Historical integrity or ambiguous result is possible | Define soft/hard delete, referenced-standard protection, idempotent repeat behavior, success status/body, permissions and audit event | Deferred | QS4 |  | Open |  |  |

## 5. Authorization and ownership matrix to approve

The following are the only currently known product-role decisions. Blank cells are intentionally open and must not
be inferred. Frontend controls are UX only; Backend remains the authorization boundary.

| Capability / operation | Editor | Organization Manager | Administrator | Project/resource ownership rule | Backend confirmation |
|---|:---:|:---:|:---:|---|---|
| Review actions outside these 11 endpoints | Allowed by known product decision | _Not specified here_ | _Not specified here_ | BE to define for the owning review resource |  |
| Read Pipelines: LP1–LP4 | Open | Open | Open | Must require project membership and prevent cross-project resource access |  |
| Update Pipeline settings: LP5 | Not allowed by known product decision | Allowed | Allowed | Must verify target pipeline belongs to the requested project |  |
| Connect Pipeline to CI | Not allowed by known product decision | Allowed | Allowed | Exact endpoint/resource ownership to be defined |  |
| User-facing Re-run | Not allowed by known product decision | Allowed | Allowed | Must not imply permission to call CI/agent ingestion LP6 |  |
| Retry one stage: LP7 | Not allowed by known product decision | Allowed | Allowed | Must verify project, iteration and stage ownership and current eligibility |  |
| Read Quality Standard: QS1 | Open | Open | Open | Must require project membership |  |
| Create/update/delete Quality Standard: QS2–QS4 | Open | Open | Open | Product approval plus server-side project ownership and audit required |  |
| CI/agent iteration submission: LP6 | Not applicable until caller class is defined | Not implied | Not implied | Prefer dedicated least-privilege machine/service authority scoped to project/pipeline |  |

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
| LP7 | Accepted retry; non-retryable stage; duplicate/in-flight request; forbidden caller; CI-provider failure; empty body only if it is valid by agreement | BE-003–BE-006, BE-021, BE-022 |
| QS1 | No standard, minimum valid standard and representative full current standard | BE-002, BE-003, BE-006, BE-023, BE-024 |
| QS2–QS4 | When management is approved: create/update/delete success, already-exists, invalid criteria, conflict, forbidden and referenced-delete behavior | BE-003, BE-006, BE-026, BE-027 |
| Common security | Missing/expired/invalid token; permitted and denied project/resource combinations; cross-project identifier attempt | BE-001, BE-003, BE-006, BE-007 |

## 7. Acceptance and validation checklist

This checklist defines how the agreed backend behavior will be accepted. Evidence should reference the decision IDs
and the exact API build tested.

### 7.1 Foundation and security

- [ ] **BE-001:** OpenAPI and authenticated smoke tests are available through trusted HTTPS; certificate validation
  stays enabled; bearer tokens are never sent over the published HTTP origin.
- [ ] **BE-002/BE-008:** Deployed responses validate against the versioned OpenAPI and the required/nullability matrix;
  breaking-change policy and build identity are recorded.
- [ ] **BE-003:** Every endpoint's agreed absent, validation, conflict, throttling and server errors return the agreed
  status/envelope, correlation ID and retryability without leaking sensitive data.
- [ ] **BE-006:** Allowed roles succeed and denied/cross-project/direct API requests fail server-side for every enabled
  operation; hiding a frontend control is not used as authorization evidence.
- [ ] **BE-007:** References follow the agreed formats. Disallowed schemes/hosts and malformed internal references are
  rejected or remain non-clickable; no credential-bearing URL is returned.

### 7.2 Pipeline reads and progress

- [ ] **BE-004/BE-005:** Each status follows the agreed transition/terminal matrix; polling/backoff stops on terminal
  state and respects throttling guidance.
- [ ] **BE-009:** LP1 returns stable required IDs/names/types and agreed settings/repository null semantics.
- [ ] **BE-010/BE-011:** LP2 empty, typical and maximum datasets preserve the agreed order/bounds and iteration
  ownership/identity invariants.
- [ ] **BE-012/BE-013:** LP3 stage IDs, keys and sequences are unique/stable; unknown future stage keys remain
  representable; Test Case and CI identifiers follow the agreed reference contract.
- [ ] **BE-014:** Typed/discriminated metrics validate against OpenAPI and produce the agreed units, token totals and
  money aggregation. Until then, acceptance explicitly expects those values to be omitted from the UI.
- [ ] **BE-015:** LP4 rejects or explicitly represents missing/cross-pipeline comparisons and does not imply metric
  direction before that semantic is agreed.

### 7.3 Mutations

- [ ] **BE-016/BE-017:** LP5 validates bounds/combinations, preserves omitted fields according to PATCH semantics,
  returns the agreed full/partial representation and prevents stale lost updates.
- [ ] **BE-018–BE-020:** Before any LP6 consumer is enabled, caller class, purpose, pipeline identity, rerun invariants,
  idempotent replay, same-key conflict, atomicity and synchronous/asynchronous timing all pass the payload scenarios.
- [ ] **BE-021/BE-022:** LP7 enforces eligibility and role/ownership, returns attempt identity, handles duplicate/in-flight
  requests deterministically and exposes the agreed post-`202` polling target.
- [ ] **BE-023/BE-024:** QS1 distinguishes “not configured” from failure, returns ordered valid criteria and supports the
  explicitly agreed name-only or description-bearing current-rubric presentation.
- [ ] **BE-025–BE-027:** No historical claim or QS2–QS4 management release occurs until immutable rubric linkage,
  scoring/concurrency/audit and delete semantics relevant to that release are accepted.

### 7.4 Evidence required for sign-off

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
