# 10 · Backend/frontend integration contract — Pipeline and Quality Standard

> **Status: proposed, not yet agreed.** This document is the hand-off and acceptance contract between
> ReportPortal backend, `service-ui`, QA and AI Factory PoC stakeholders. It records the decisions that must
> be made before the frontend can replace its Pipeline mocks or consume the Quality Standard API.
>
> The schema inventory and TypeScript-like raw DTOs remain in
> [05-backend-contract.md](05-backend-contract.md). This file adds the integration gaps, ownership, blocking
> level and readiness gates; it does not redefine the published OpenAPI.

## 1. Problem Statement table

| # | Date | Problem statement & Description | Source | Author | Description | Jira |
|---:|---|---|---|---|---|---|
| 1 | 2026-10-02 | The implemented AI Factory UI consumes a rich, legacy mock contract, while the published Pipeline API uses different paths, response envelopes, statuses and DTO fields. Directly switching URLs would cause invalid rendering and runtime failures. | [OpenAPI JSON](http://tms.epmrpp.reportportal.io/api/api-docs), [05](05-backend-contract.md), current `service-ui` code | FE analysis | Agree a raw API contract, explicit mappings and a staged switch from mocks to live reads. | [EPMRPP-118192](https://jiraeu.epam.com/browse/EPMRPP-118192) |
| 2 | 2026-10-02 | The Quality Standard API exposes the current rubric and conditional CRUD operations but does not identify the rubric/version used for historical grades. | OpenAPI `feature-pipelines-2767`, [05 §1.5](05-backend-contract.md#15-quality-standard-requests-and-responses) | FE analysis | Separate current-rubric read-only display, future management and reproducible historical evaluation into independent scopes. | [EPMRPP-118192](https://jiraeu.epam.com/browse/EPMRPP-118192) |
| 3 | 2026-10-02 | The currently published API URL is HTTP while all operations inherit bearer JWT authentication. | OpenAPI server and security scheme | FE analysis | A trusted same-origin HTTPS route is required before authenticated browser acceptance testing. | [EPMRPP-118192](https://jiraeu.epam.com/browse/EPMRPP-118192) |

## 2. Assumptions and agreements table

| # | Assumptions and agreements |
|---:|---|
| 1 | The audited baseline is OpenAPI `3.0.1`, `info.version = feature-pipelines-2767`, server `/api`, inspected on 2026-10-02. A later document must be diffed against this baseline. |
| 2 | “Observed” means present in the published OpenAPI. It does not prove that an authenticated request has succeeded in the target environment. No mutating endpoint was invoked during discovery. |
| 3 | Live API DTOs are transport types. The FE must validate and adapt them into existing view models; raw responses must not be cast directly to `PipelineRS`, `IterationSummaryRS` or `IterationRS`. |
| 4 | The existing mock remains the accepted PoC fallback until every hard blocker for the selected endpoint group is closed. Unknown data is displayed as unavailable/unknown; it is never invented or silently coerced. |
| 5 | Backend authorization is the security boundary and is deny-by-default for project and resource access. FE permissions, hidden controls and feature flags are UX only. |
| 6 | Live authenticated browser traffic is permitted only through trusted HTTPS with certificate validation enabled. Tokens must never be sent to the currently documented plain-HTTP origin. |
| 7 | Pipeline reads/mutations and Quality Standard read are independently releasable groups. Quality Standard CRUD is a conditional future group. Enabling one group must not disable the Test Case AI overlay or unrelated mocks. |
| 8 | This proposal becomes an agreed contract for a rollout group only after the backend/API owner and Product resolve every **blocker/decision ID applicable to that approved group** in §5.6 and record the decision in §9. Blockers in a future or excluded group do not block an independent group. |

## 3. Designs table

| Name / Description | Link |
|---|---|
| Live schema inventory and provisional PoC contracts | [05-backend-contract.md](05-backend-contract.md) |
| Open decisions and prior defaults | [06-open-questions.md](06-open-questions.md) |
| FE architecture and mock boundary | [03-frontend-architecture.md](03-frontend-architecture.md) |
| Published interactive API | [Swagger UI](http://tms.epmrpp.reportportal.io/ui/#organizations/my-organization/projects/superadmin-personal/api) |

## 4. Integration baseline

### 4.1 Observed endpoint inventory

All paths below are relative to `/api`. `projectKey` is a required string. Numeric IDs are `int64`.

| ID | Method and path | Observed success response | Proposed release group |
|---|---|---|---|
| LP1 | `GET /v1/project/{projectKey}/pipeline` | `200 PipelineRS[]` | Pipeline reads |
| LP2 | `GET /v1/project/{projectKey}/pipeline/{pipelineId}/iteration` | `200 PipelineIterationSummaryRS[]` | Pipeline reads |
| LP3 | `GET /v1/project/{projectKey}/pipeline/iteration/{iterationId}` | `200 PipelineIterationDetailRS` | Pipeline reads |
| LP4 | `GET /v1/project/{projectKey}/pipeline/iteration/{iterationId}/compare?with={iterationId}` | `200 PipelineCompareRS` | Pipeline compare |
| LP5 | `PATCH /v1/project/{projectKey}/pipeline/{pipelineId}` | `200 PipelineRS` | Pipeline settings |
| LP6 | `POST /v1/project/{projectKey}/pipeline/iteration` | `201 PipelineIterationDetailRS` | Iteration submission by agent/CI; semantics must be resolved before any UI Re-run use |
| LP7 | `POST /v1/project/{projectKey}/pipeline/iteration/{iterationId}/stage/{stageId}/retry` | `202 PipelineStageRetryRS` | Pipeline retry |
| QS1 | `GET /v1/project/{projectKey}/tms/quality-standard` | `200 TmsQualityStandardRS` | Quality Standard read |
| QS2 | `POST /v1/project/{projectKey}/tms/quality-standard` | `201 TmsQualityStandardRS` | Conditional future Quality Standard management; excluded from current T6.2 |
| QS3 | `PUT /v1/project/{projectKey}/tms/quality-standard` | `200 TmsQualityStandardRS` | Conditional future Quality Standard management; excluded from current T6.2 |
| QS4 | `DELETE /v1/project/{projectKey}/tms/quality-standard` | `200`, no body schema | Conditional future Quality Standard management; excluded from current T6.2 |

Observed common errors are `400`, `401`, `403`, `500`. The specification does not document resource-specific
`404`, concurrency `409`, semantic validation `422`, or throttling `429` behavior.

**Current scope decision:** T6.2 may consume **QS1 read-only** as its own rollout group to show the current project
rubric. QS2–QS4 are not part of T6.2 and must not be wired merely because they are published. They remain a
conditional future contract until Product approves a dedicated Quality Standard management story, permissions,
UX and acceptance criteria. Historical grading association is another independent future capability; its blockers
do not prevent a correctly labelled, validated current-rubric QS1 view.

### 4.2 Current FE assumptions that must not leak into transport code

| Current assumption | Current evidence | Why direct cutover fails |
|---|---|---|
| Pipeline namespace is `/tms/pipeline` | `common/urls.js` | Live Pipeline paths omit `/tms`. |
| Iteration detail path contains both `pipelineId` and `iterationId` | `URLS.tmsPipelineIterationById` | LP3 is addressed by `iterationId` only. |
| LP2 returns `{ content, page }` and accepts search/offset/limit | `IterationPageRS`, Pipeline saga and mock handler | Live LP2 is a plain array with no documented query parameters. |
| Responses already match required FE types | Direct casts in `controllers/aiFactory/pipelines/sagas.ts` | All live response fields are formally optional and shapes differ materially. |
| Pipeline mock enablement is global | `ai_factory_mocks` | Turning it off also removes unrelated handlers and the Test Case overlay. |
| Non-production guard is `!process.env.production` | `app/src/index.jsx` | This is not the project-standard environment test and can install demo behavior in unintended builds. |

## 5. Contract gap matrices

Blocking levels:

- **Hard blocker** — unsafe or impossible to integrate without a backend/product decision or platform change.
- **Degraded** — integration may proceed only with the stated, product-approved reduced behavior.
- **Non-blocking** — FE can adapt deterministically once the mapping is recorded.

### 5.1 Endpoint and protocol gaps

| ID | Observed API | Current FE/mock | Impact | Required decision or action | Owner | Level |
|---|---|---|---|---|---|---|
| EP-01 | Pipeline path is `/pipeline`; Quality Standard remains `/tms/quality-standard`. | All proposed Pipeline URLs use `/tms/pipeline`. | Requests reach the wrong resource after mocks are disabled. | FE adds separate live URL builders; BE confirms paths are stable for the PoC release. | FE + BE | Non-blocking |
| EP-02 | LP3 is `/pipeline/iteration/{iterationId}`. | Route and action carry `pipelineId`; legacy request path uses it. | Incorrect live URL and possible cross-pipeline context mismatch. | FE uses `iterationId` for transport and verifies returned `pipelineId` against route context; mismatch renders an error, not another pipeline's data. | FE | Non-blocking |
| EP-03 | LP2 returns a plain array and documents no paging, sorting or search. | Saga dereferences `.content`; UI search assumes all displayed data is locally available. | Runtime failure now; unbounded payload later. | For PoC, Product must approve client-side search/sort over the returned array and BE must state a safe maximum. Otherwise BE adds a page contract with stable ordering. | Product + BE | Hard blocker |
| EP-04 | Response properties have no OpenAPI `required` declarations. | FE view models require most properties. | Missing IDs/names/status/stages can make routes and cards invalid. | BE marks invariant fields required, or supplies a written nullability matrix. FE validates raw DTOs and rejects only the affected entity. | BE + FE | Hard blocker |
| EP-05 | Documented errors are generic `400/401/403/500`. | Mock also models `404` and `409`; UI needs not-found/conflict handling. | FE cannot reliably choose retry, empty, forbidden, stale or conflict states. | BE documents status codes and stable machine-readable error codes for each operation, including `404`, `409`/idempotency conflict and retryable failures where applicable. | BE | Hard blocker for mutations; Degraded for reads |
| EP-06 | No caching, ETag, idempotency or concurrency semantics are documented. | Settings and retry actions assume a single current value/action. | Duplicate retry or lost settings update is possible. | BE defines LP5 concurrency behavior and LP7 duplicate-click/idempotency behavior; FE disables in-flight actions and handles the agreed conflict response. | BE + FE | Hard blocker for LP5/LP7 |
| EP-07 | No polling/refresh contract is documented. | Running mock states evolve locally. | Live UI can stay stale or overload the API. | BE states terminal statuses, recommended poll interval/backoff and rate limits. FE polls only non-terminal entities, pauses when hidden, and stops on logout/unmount/terminal status. | BE + FE | Hard blocker for live-progress acceptance |
| EP-08 | Operations inherit bearer JWT; available discovery origin is HTTP. | Browser normally uses the application's shared authenticated client. | Sending a token over HTTP exposes credentials. | Platform/BE provides a trusted same-origin HTTPS route or approved HTTPS API origin. No TLS bypass or HTTP fallback is allowed. | Platform + BE | Hard blocker |
| EP-09 | Project/resource permission requirements are undocumented beyond possible `403`. | FE can hide feature UI by flag/role. | Unauthorized read or mutation could occur if BE trusts the UI. | Product defines roles; BE enforces project membership plus resource-level authorization and denies by default; QA receives allowed/denied accounts. | Product + BE + QA | Hard blocker |
| EP-10 | LP1/LP2 are fan-out reads in the current UI. | A single rejected `Promise.all`/saga call fails all pipeline iterations. | One inaccessible/broken pipeline hides healthy pipelines. | FE isolates errors per pipeline and offers per-group retry; Product confirms partial-results behavior. | FE + Product | Degraded |

### 5.2 Pipeline list and iteration mapping gaps

| ID | FE field/behavior | Observed live source | Discrepancy and impact | Required decision or fallback | Owner | Level |
|---|---|---|---|---|---|---|
| PL-01 | `PipelineRS.id`, `name` are required. | `id?`, `name?` | Formally optional; without them a stable key/route/title cannot be built. | BE marks both required and non-empty. Invalid entities are skipped with telemetry; the whole page is not failed. | BE + FE | Hard blocker |
| PL-02 | `type` (`GENERATION` or `AUTOMATION`) drives columns, KPI and stage panels. | No pipeline type field. | FE cannot choose the correct presentation. | Preferred: BE adds a stable enum. Temporary option: Product approves an explicit, versioned `attributes.pipelineType` key. Never infer from name or stages. | BE + Product | Hard blocker |
| PL-03 | `repository` is shown on list/detail. | No top-level repository; CI stage may expose `ci.repo`. | A pipeline-wide repository cannot be inferred reliably from one stage. | BE adds pipeline repository metadata, or Product accepts omission. FE displays “Not provided” if omitted. | BE + Product | Degraded |
| PL-04 | Settings shape is `{ autoReady, threshold, editable }`. | LP1/LP5 expose `autoReadyEnabled?`, `autoReadyThreshold?`; no `editable`. | Rename is deterministic; edit permission is not. | FE maps the two values. `editable` comes only from an agreed permission/capability, never from absence of `403`. | FE + BE | Hard blocker for edit; Non-blocking for display |
| PL-05 | Threshold is an integer `0..100`. | Request threshold is `int32` with no range. | FE and BE may accept different values. | Product confirms inclusive range and meaning; BE adds validation constraints and stable validation error. | Product + BE | Hard blocker for LP5 |
| IT-01 | Iteration number is `number`; dates are epoch milliseconds. | `iterationNumber?`; dates are `string(date-time)` and duration is `durationMillis?`. | Naming/date conversion differs. | FE maps names and parses valid ISO dates. Invalid dates remain unavailable and are reported; no `Date.now()` fallback. | FE | Non-blocking |
| IT-02 | FE iteration states include running/review/completed semantics. | `PENDING`, `PASSED`, `FAILED`, `NEEDS_HUMAN`. | Labels, terminal-state logic and polling cannot be safely inferred. | Product/BE publishes a total mapping and meaning of `PENDING`/`NEEDS_HUMAN`; unknown future values map to an explicit Unknown state. | Product + BE | Hard blocker |
| IT-03 | `trigger`, `startedBy`, model and environment are displayable strings. | `trigger?`, numeric `createdBy?`, generic `metrics?`/`attributes?`. | Actor label and metadata keys are undefined. | BE documents canonical string attribute keys. Any value carried in `metrics` additionally must satisfy ST-03; a key registry alone cannot change the published object-only value schema. User ID resolution must use an existing approved service/pattern. | BE + Product | Degraded |
| IT-04 | Requirement/test-case references, counts, score, cost, ready/fix counts, launch/MR/CI links feed cards. | Only generic maps, stage `testCaseIds?`, result and CI metadata. | Rich iteration cards cannot be reproduced from documented data. | BE adds typed DTO fields or an explicit OpenAPI `oneOf`/documented typed metric envelope with conforming examples. Product identifies the minimum fields for first cutover; until then metric-derived KPI parity is excluded and absent values render as unavailable. | BE + Product | Hard blocker for parity; Degraded for reduced card |
| IT-05 | `attributes` is `[{ key, value }]`. | `Record<string,string>?`. | Shape differs but information is compatible. | FE converts own enumerable string entries in stable key order; unsafe/prototype keys are ignored. | FE | Non-blocking |
| IT-06 | Cost is numeric currency-bearing data. | No typed cost; possible generic metric is unspecified. | Currency, precision and aggregation could be wrong. | BE defines amount type, currency, inclusion rules and rounding. FE does not show a currency total until agreed. | BE + Product | Degraded |
| IT-07 | Compare expects a previous iteration and meaningful deltas. | LP4 returns `current?`, `previous?`, `stageDeltas?`; all optional. | Empty/mismatched comparisons are ambiguous. | BE defines same-pipeline enforcement, not-found behavior and required identifiers; FE validates both pipeline IDs before displaying. | BE + FE | Hard blocker for compare |

### 5.3 Stage/detail mapping gaps

| ID | FE field/behavior | Observed live source | Discrepancy and impact | Required decision or fallback | Owner | Level |
|---|---|---|---|---|---|---|
| ST-01 | Fixed typed stage keys and ordered columns/panels. | Arbitrary `stageKey?`, `sequence?`, `parentStageId?`. | New/missing/duplicate values can break ordering and panel selection. | BE guarantees unique `stageKey` and `sequence` within an iteration and documents known keys. FE preserves unknown stages as generic panels ordered by valid sequence then stable key. | BE + FE | Hard blocker for specialized panels; Degraded for generic view |
| ST-02 | Stage status has UI-specific running/skipped/review variants. | Same four-value live status enum as iteration. | Existing status casts are invalid. | Product/BE agrees a stage mapping and whether skipped/cancelled states can occur. Unknown values use neutral Unknown, never Passed. | Product + BE | Hard blocker |
| ST-03 | Stage metric and cost are typed numbers. | `metrics?: Record<string, object>` (`additionalProperties: { type: object }`). | Primitive numeric/string values do not conform to the published schema; a key registry alone cannot repair the value type or make parsing safe. | BE exposes typed DTO fields, or changes OpenAPI to an explicit `oneOf`/discriminated metric envelope covering every allowed value type, key, unit and nullability, with conforming examples. Until then FE treats `metrics` as opaque, does not derive KPIs/costs from it and excludes KPI parity from that rollout. | BE | Hard blocker for KPI parity; Degraded for generic view |
| ST-04 | Detail panels need Create cases, Grade criterion/case scores, Upload results, Review lifecycle/fix rounds and automation per-case rows. | LP3 exposes only generic metrics/attributes/result/testCaseIds/CI. | Existing detail screen cannot be populated from LP3. | BE provides typed stage-result schemas/discriminator, or Product approves a generic stage summary for the first live release while specialized panels stay mocked/off. | BE + Product | Hard blocker for full detail; Degraded for generic detail |
| ST-05 | Token usage by model includes input/cache/output and cost. | No typed token usage. | The footer shown in the PoC cannot be reproduced or audited. | BE adds typed usage with integer token counts, amount/currency and aggregation semantics, or Product removes it from live mode. | BE + Product | Degraded |
| ST-06 | Retry control needs stable eligibility and attempt feedback. | Stage has `ci.retryable?`, last retry metadata; LP7 returns optional `stageId`, `status`, `triggeredRunUrl`. | Eligibility, duplicate attempts and post-202 refresh are underspecified. | BE makes returned `stageId`/`status` required, defines retryable state/permission and attempt identity; FE refreshes LP3 according to polling contract. | BE + FE | Hard blocker for retry |
| ST-07 | Stage/test-case links must target existing internal routes. | `testCaseIds?: string[]`, `resultRef?`, URLs in CI/retry. | ID kind and navigation target are undefined; values may be malicious. | BE documents identifier formats and reference types. FE validates references per BackendIntegration_6 in §6 and renders invalid/unapproved values as plain text. | BE + FE | Hard blocker for clickable links; Non-blocking for text |

### 5.4 Quality Standard gaps

| ID | Required product behavior | Observed live contract | Discrepancy and impact | Required decision or fallback | Owner | Level |
|---|---|---|---|---|---|---|
| QS-01 | Display the current project rubric through QS1 read-only. | Current standard has `name?`, `description?`, criteria `{ id?, name?, maxPoints?, sequence? }[]?`. | Response invariants are formally optional. | BE marks current standard and criterion invariants required, and documents the no-standard response. FE runtime-validates and shows an unavailable state for an invalid document. This blocks QS1 read only, not Pipeline groups. | BE + FE | Hard blocker for QS1 read |
| QS-02 | Explain each grading criterion. | No criterion description. | Users cannot see criterion-specific guidance unless it is embedded in the name. | BE adds `description`, or Product explicitly accepts name-only criteria for the PoC. | BE + Product | Degraded |
| QS-03 | Reproduce historical evaluation against the rubric used at that time. | Only the current mutable standard is exposed; no version/snapshot association. | Old scores can no longer be explained after PUT/DELETE. | BE provides immutable version/snapshot ID and includes it in every grading result. Until then FE labels the standard as current and must not claim it produced a historical grade. | BE + Product | Hard blocker for historical detail |
| QS-04 | Future management UI chooses create vs update correctly. | GET not-found behavior is undocumented; POST and PUT are separate. | A future FE cannot reliably decide which mutation to use. | After a management story is approved, BE documents QS1 absence response and stable error code; optionally expose an upsert/version. FE branches only on documented status, not message text. | BE | Future management blocker; not applicable to T6.2 QS1 read |
| QS-05 | Safe concurrent future administration. | No ETag/version/revision in the response. | One administrator can silently overwrite another. | After a management story is approved, BE adds optimistic concurrency or Product explicitly accepts last-write-wins. | BE + Product | Future management blocker; not applicable to T6.2 QS1 read |
| QS-06 | Deterministic score model for future editing. | Each criterion is `1..100`; no total, uniqueness or sequence constraints are documented. | A future editor cannot validate totals, names, sequence uniqueness or ordering. | Product defines scoring invariants; BE validates them and documents stable error codes before QS2–QS4 integration. | Product + BE | Future management blocker; not applicable to T6.2 QS1 read |
| QS-07 | Display timestamps consistently. | `createdAt?`/`updatedAt?` are `int64`, unit unspecified. | Seconds vs milliseconds renders different dates. | BE declares unit/format or changes to OpenAPI `date-time`; FE does not guess. | BE | Degraded |
| QS-08 | Future CRUD is role-restricted and auditable. | Only a possible `403` is documented; no actor/audit fields. | A future FE cannot show correct controls and changes lack traceability. | Product must define Quality Standard permissions in the dedicated management story; BE enforces them and exposes agreed audit metadata or an existing audit event. | Product + BE | Future management blocker; not applicable to T6.2 QS1 read |
| QS-09 | Future DELETE has deterministic completion semantics. | `200` without a body schema. | A future FE needs post-delete and repeat-delete behavior. | After a management story is approved, BE documents idempotency, subsequent QS1 response and whether `204` is preferred. FE refetches after success. | BE + FE | Future management blocker; not applicable to T6.2 QS1 read |

### 5.5 LP6 iteration submission versus user Re-run

The OpenAPI description says LP6 creates a pipeline iteration and its stages and is called by CI/the agent. That is
evidence of an **iteration/result submission API**, not evidence of a user execution command. The current contract
must not claim that LP6 powers the UI <Re-run> action. Re-run remains unavailable in live mode until the questions
below are resolved or BE publishes a separate command endpoint.

| ID | Unresolved contract point | Impact | Required decision or action | Owner | Level |
|---|---|---|---|---|---|
| LP6-01 | Is LP6 ingestion of externally executed results, a command that starts execution, or both? | FE could duplicate records instead of starting work, or expose a privileged producer API to users. | BE states one unambiguous purpose. If LP6 is ingestion, publish a separate Re-run command with request/response semantics; FE never calls ingestion to simulate Re-run. | BE + Product | Hard blocker for Re-run and LP6 consumer integration |
| LP6-02 | Which caller may invoke LP6? | A browser user token may gain agent/CI write authority, or a CI credential may be over-broad. | BE defines machine/service versus interactive caller authentication, project scope and least-privilege authorization. Organization Manager/Administrator authorization for UI Re-run does not automatically authorize LP6 ingestion. | BE + Security | Hard blocker |
| LP6-03 | Request identifies a pipeline by `pipelineName`, not `pipelineId`. | Duplicate names, rename, casing or implicit create-on-submit can attach iterations incorrectly. | BE defines uniqueness scope, case sensitivity, rename behavior and whether the call resolves only an existing pipeline or may create one. Prefer immutable `pipelineId` for updates to an existing definition. | BE + Product | Hard blocker |
| LP6-04 | `rerun?` and `rerunOfIterationId?` invariants are undocumented. | Orphan/cross-project/cross-pipeline links and ambiguous rerun chains are possible. | BE requires a valid same-project/same-pipeline source when `rerun=true`, rejects `rerunOfIterationId` otherwise, defines whether reruns point to the root or immediate predecessor and returns stable validation/not-found/conflict errors. | BE | Hard blocker |
| LP6-05 | No idempotency key or duplicate-submission rule is documented. | CI retries can create duplicate iterations and stages. | BE defines an idempotency key/natural producer identity, replay window and same-key/different-body conflict behavior. | BE | Hard blocker |
| LP6-06 | LP6 returns `201` detail, but persistence/execution timing is undocumented. | Callers cannot know whether stages/results are final, partially persisted or merely accepted. | BE defines whether `201` means synchronously persisted submission or changes to `202` for asynchronous processing; document atomicity, polling/resource location and failure recovery. | BE | Hard blocker |

### 5.6 Blocker applicability by rollout group

Only blocker/decision IDs listed for the approved group gate that group. Every degraded item requires a D-12 record
with Product approval of the exact reduced behavior and QA evidence. Unrelated future functionality does not block an
independent rollout.

**Selected G3 first-rollout contract:** comparison is neutral and non-evaluative: show stage identity plus current and
previous status only. Omit all metric values/deltas and all cost/cost deltas. Use no improvement/regression verdict,
traffic-light color, evaluative icon or “better/worse” wording. D-05 and IT-06 are resolved for this rollout only by
Product/BE accepting that explicit omission, and Product/QA recording approval and evidence through D-12. A later
richer comparison requires conforming ST-03 metric types plus per-metric direction semantics, including whether higher,
lower or neither is better.

| Group | Endpoints/capability | Current scope | Applicable blocker/decision IDs | Applicable degraded items and exact reduced behavior | Explicitly not gating this group |
|---|---|---|---|---|---|
| G1 Pipeline catalog | LP1, LP2 | Candidate staged integration | EP-03, EP-04, EP-08, EP-09, PL-01, PL-02, IT-02, D-12 | EP-05: one generic read-failure state where no stable specific code exists. EP-10: healthy pipeline groups remain visible with an inline failed-group state and group retry. PL-03: repository displays “Not provided”. IT-03: omit unresolved actor/model/environment metadata. IT-04: reduced cards omit requirement/test-case references, score, ready/fix counts, launch/MR/CI and metric KPIs unless supplied by agreed typed fields. IT-06: omit cost. ST-01: unknown/non-specialized stages use validated generic labels/order. ST-03: metrics remain opaque and stage summaries are status-only. | LP5–LP7, QS2–QS4, QS-03 |
| G2 Pipeline generic detail | LP3, after G1 | Candidate only with Product-approved generic view | EP-04, EP-07, EP-08, EP-09, IT-02, ST-01, ST-02, D-12 | EP-05: generic read-failure state where no stable specific code exists. PL-03: repository displays “Not provided”. IT-03: omit unresolved actor/model/environment metadata. IT-04: omit unsupported header KPIs/references. IT-06: omit cost. ST-03: metrics remain opaque and no metric KPI is rendered. ST-04: specialized Create/Grade/Upload/Review/per-case panels stay off; show validated generic stage identity/status only. ST-05: token-usage footer is hidden. ST-07: references render as text only unless they pass the agreed typed-reference and route/host policy. | LP5–LP7, QS2–QS4, QS-03 |
| G3 Pipeline comparison | LP4, after G2 | Proposed first rollout: neutral comparison; approval pending | EP-04, EP-08, EP-09, IT-07, ST-03, IT-06, D-05, D-12 | EP-05: generic comparison failure where no stable specific code exists. IT-03/IT-04: omit unresolved metadata and rich KPI comparison. ST-03/D-05: omit metric values/deltas; show current/previous stage status only with neutral styling and no direction, verdict or better/worse wording. IT-06: omit cost and cost delta. ST-05: omit token comparison. | LP5–LP7, QS2–QS4 |
| G4 Pipeline settings | LP5 | Candidate only for Organization Manager/Administrator | EP-04, EP-05, EP-06, EP-08, EP-09, PL-04, PL-05 | None. Settings mutation requires the complete agreed validation, permission and concurrency contract. | LP6, LP7, QS1–QS4 |
| G5 Stage Retry | LP7 | Candidate only for Organization Manager/Administrator | EP-04, EP-05, EP-06, EP-07, EP-08, EP-09, ST-06, D-08, D-12 | ST-07: `triggeredRunUrl` and other references are non-clickable text unless they pass the agreed typed-reference and route/host policy; retry success/status remains available without navigation. | LP5, LP6, QS1–QS4 |
| G6 Iteration submission | LP6 agent/CI producer | Not a UI Re-run contract; independent producer integration | EP-04, EP-05, EP-08, EP-09, LP6-01–LP6-06, D-08, D-13 | None. Producer identity, authorization, rerun invariants, idempotency, atomicity and timing must be complete. | LP5, LP7, QS1–QS4 |
| G7 Current Quality Standard read | QS1 | Current T6.2 read-only candidate | EP-04, EP-08, EP-09, QS-01, D-12 | EP-05: generic unavailable state where no stable absence/error code exists. QS-02: show criterion name only and do not invent explanatory text. QS-07: hide created/updated timestamps until their unit is defined. | QS2–QS4, QS-03–QS-06, QS-08, QS-09 |
| G8 Quality Standard management | QS2, QS3, QS4 | Excluded from current T6.2; requires Product-approved story | EP-04, EP-05, EP-06, EP-08, EP-09, QS-01, QS-04, QS-05, QS-06, QS-08, QS-09, D-12, D-14 | QS-02: a future story may approve name-only criteria and must not invent descriptions. QS-07: hide audit timestamps until their unit is defined. No degradation is allowed for permissions, concurrency, score invariants or delete semantics. | Pipeline groups and QS-03; implementation must not start from API availability alone |
| G9 Historical grading association | Version/snapshot plus grading result contract | Independent future capability | QS-03, D-09, D-12 | QS-02: if Product explicitly approves, historical snapshots may show criterion names without descriptions and must state that no criterion explanation was stored. No degradation is allowed for immutable version/snapshot association. | QS1 current-rubric read |

## 6. Functional Requirements table

| ID | Name | Description | Link to test case | Status |
|---|---|---|---|---|
| BackendIntegration_1 | Raw contract boundary | Validate live Pipeline/Quality Standard DTOs before adapting them to UI view models. | To be added by QA | Proposed |
| BackendIntegration_2 | Independent transport switches | Enable live groups independently without removing unrelated mocks/overlays. | To be added by QA | Proposed |
| BackendIntegration_3 | Safe read experience | Support loading, empty, invalid, partial, forbidden and retryable failure states. | To be added by QA | Proposed |
| BackendIntegration_4 | Authorized mutations | Apply exact role rules, caller separation, concurrency and deterministic errors to Pipeline mutations and any separately approved future Quality Standard management. | To be added by QA | Proposed |
| BackendIntegration_5 | Historical grading integrity | Conditional future capability: associate evaluation output with an immutable Quality Standard version/snapshot without blocking QS1 current-rubric read. | To be added by QA | Future proposal |
| BackendIntegration_6 | Secure references and transport | Use trusted HTTPS and validate every backend-provided navigation reference. | To be added by QA | Proposed |

### BackendIntegration_1 — Raw contract boundary

**User Story:** **As a** frontend engineer **I want to** isolate live transport DTOs from UI view models
**So that** backend evolution or malformed data cannot silently corrupt the AI Factory UI.

**Pre-condition:** the final OpenAPI and sanitized payload pack in §10 are available.

**Acceptance Criteria:**

1. FE owns separate `Live*` transport types and runtime parsers for each enabled operation.
2. No network response is directly cast to the existing rich view models.
3. Required identity failures isolate the affected pipeline/iteration/criterion and are observable in diagnostics.
4. Optional missing values render the agreed unavailable state; FE does not invent identifiers, statuses, dates,
   metrics, costs, links, permissions or business values.
5. Unknown enum values remain distinguishable as Unknown and do not map to Passed/success.
6. Contract-adapter tests cover the payload pack, omitted optional fields, wrong types and future enum values.

### BackendIntegration_2 — Independent transport switches

**User Story:** **As a** PoC operator **I want to** switch one API group from mocks to live transport
**So that** integration can be staged without breaking unfinished AI Factory workflows.

**Pre-condition:** the group has passed its Definition of Ready in §11.

**Acceptance Criteria:**

1. The master feature flag remains default OFF and preserves existing product behavior when OFF.
2. Pipeline reads, compare, settings, retry and Quality Standard read can be enabled independently using an agreed
   non-production integration configuration. Conditional future Quality Standard mutations get a separate switch
   only after the G8 management story is approved.
3. Disabling Pipeline mocks does not disable the Test Case overlay or lifecycle/review/fix-round mocks.
4. Mock installation uses `process.env.NODE_ENV === 'development'` (or the repository-approved equivalent).
5. Production builds contain no active demo adapter/fixture path unless separately product-approved.
6. Every switch has an explicit rollback value and the rollback is verified without clearing unrelated user data.
7. Every enabled switch identifies one §5.6 rollout group and links its group-specific D-12 record; approval of a
   degradation in one group does not enable the same or a similar degradation in another group.

### BackendIntegration_3 — Safe read experience

**User Story:** **As a** project member **I want to** see available pipeline and standard data even when one
resource fails **So that** an isolated API or data problem does not make the complete screen unusable.

**Pre-condition:** HTTPS, authentication and read permissions are configured.

**Acceptance Criteria:**

1. Each screen distinguishes initial loading, empty result, partial result, forbidden, not found, invalid payload,
   retryable server failure and offline/network failure.
2. A failed iteration request does not remove successfully loaded pipeline groups.
3. Retry affects only the failed resource group and does not duplicate healthy data.
4. Logout, route change or a newer request cancels/invalidates stale in-flight work.
5. Polling follows the agreed terminal states, interval/backoff and rate limit; it stops when no longer needed.
6. Reduced/generic detail never displays mock-only values as if they came from the backend.
7. QA verifies every accepted item in the rollout group's §5.6 degraded-items cell, including both the stated omission
   and the absence of invented replacement data, and records evidence against D-12.
8. G3 comparison follows the selected neutral contract: cost and all metric values/deltas are absent; only current
   versus previous stage status is shown, without improvement/regression color, icon, verdict or better/worse wording.
   Richer comparison requires a later Product-approved contract with the full D-05 typing and direction semantics.

### BackendIntegration_4 — Authorized mutations

**User Story:** **As an** authorized Editor, Organization Manager or Administrator **I want to** perform only the
actions granted to my exact role **So that** review and Pipeline operations cannot be changed through UI bypasses.

**Pre-condition:** Product and BE approve the following minimum permission matrix.

| Capability | Editor | Organization Manager | Administrator | Contract status |
|---|:---:|:---:|:---:|---|
| Review actions | ✅ | Open; no role inheritance assumed | Open; no role inheritance assumed | Accepted for Editor; exact additional-role behavior remains explicit, never inferred |
| Read pipelines/iterations | Open | Open | Open | Product/BE decision required |
| Compare iterations | Open | Open | Open | Product/BE decision required |
| Update Pipeline settings | ❌ | ✅ | ✅ | Accepted roles; backend enforcement required |
| Manage CI connection | ❌ | ✅ | ✅ | Accepted roles; endpoint contract is not present in this audited API |
| Re-run pipeline/iteration | ❌ | ✅ | ✅ | Accepted roles; command endpoint semantics remain Open and LP6 must not be assumed |
| Retry a stage | ❌ | ✅ for eligible stage | ✅ for eligible stage | Accepted roles; backend eligibility enforcement required |
| Read Quality Standard (QS1) | Open | Open | Open | Explicit Product/BE decision required before G7 |
| Create/update/delete Quality Standard (QS2–QS4) | Open | Open | Open | Out of current T6.2; decide only in a Product-approved management story |

**Acceptance Criteria:**

1. BE validates project membership, target-resource membership and operation permission for every request.
2. Direct requests from a user lacking permission return the agreed `403` error even if the UI is manipulated.
3. FE capability checks hide/disable controls for usability but never replace server enforcement.
4. Mutation controls are disabled while in flight and handle the agreed validation, conflict and authorization codes.
5. LP5 does not silently overwrite a newer value under the agreed concurrency model.
6. LP7 duplicate invocation follows the agreed idempotency/conflict rule and never creates accidental retry storms.
7. LP6 caller authorization, purpose, identity, rerun invariants, idempotency and response timing satisfy §5.5 before
   any consumer enables it; the UI does not call LP6 as Re-run unless that purpose is explicitly agreed.
8. Re-run and CI connection controls are not enabled merely because LP6/LP7 exists; each requires its own agreed
   endpoint/capability and Organization Manager/Administrator server authorization.
9. Successful mutations refetch/reconcile server state; FE does not assume the submitted body is the stored result.
10. QS2–QS4 controls do not exist in current T6.2. Their permissions and mutation ACs are defined by a separate,
    Product-approved management story before G8 implementation.

### BackendIntegration_5 — Historical grading integrity

**User Story:** **As a** reviewer **I want to** see which Quality Standard produced a stored evaluation
**So that** I can interpret historical scores after the current rubric changes.

**Pre-condition:** BE and Product choose snapshot or immutable-version semantics.

**Acceptance Criteria:**

1. Every persisted grading result references an immutable standard version/snapshot ID.
2. The referenced artifact includes criterion identity, name, description if supported, maximum points and sequence.
3. PUT creates a new version/snapshot for future grades and does not rewrite historical meaning.
4. DELETE behavior for standards already referenced by evaluations is explicitly defined and preserves auditability.
5. Until 1–4 exist, FE may show only the current standard and labels it as current; it does not associate it with a
   historical score.

### BackendIntegration_6 — Secure references and transport

**User Story:** **As a** security owner **I want to** constrain authenticated transport and API-provided links
**So that** tokens and users are not exposed to insecure or attacker-controlled destinations.

**Pre-condition:** the approved HTTPS origin and host/route policy are documented.

**Acceptance Criteria:**

1. Authenticated calls use trusted HTTPS with normal certificate validation; HTTP and certificate bypasses fail closed.
2. `resultRef`, `runUrl` and `triggeredRunUrl` are treated as untrusted input.
3. External navigation permits HTTPS only and only approved hosts; credentials and script/data schemes are rejected.
4. Relative navigation permits only documented internal application routes and identifiers.
5. Invalid/unapproved references render as non-clickable text and never as HTML.
6. Logs, telemetry, fixtures and screenshots do not expose bearer tokens or confidential URL query data.

## 7. Frontend implementation obligations

1. Add live URL builders beside the legacy/mock builders; do not repurpose a mock path while its handler is active.
2. Introduce raw transport DTOs and runtime validation at the API boundary.
3. Map raw DTOs to stable UI models using total functions with explicit Unknown/unavailable outcomes.
4. Replace global mock opt-out with per-group selection while retaining backward-compatible default mock behavior.
5. Isolate LP2 failures per pipeline and preserve successful groups.
6. Apply the repository's shared authentication, cancellation, notification and localization patterns.
7. Treat all maps, IDs, date strings, URLs and generic metric values as untrusted input.
8. Add adapter, saga/service, reducer/state and component-state tests before changing the default transport.
9. Keep `show_ai_factory_poc` default OFF; transport configuration must not make the feature visible by itself.

## 8. Backend/API obligations

1. Publish an HTTPS-accessible OpenAPI document matching the deployed target environment.
2. Resolve hard blockers applicable to the approved rollout group in §5.6 by updating OpenAPI requiredness, enums,
   constraints, error schemas and descriptions.
3. For metric-derived UI, expose typed DTO fields or an explicit OpenAPI `oneOf`/discriminated envelope for all
   allowed metric value types, keys, units and nullability, with conforming examples. A key registry alone is
   insufficient while `additionalProperties` is constrained to `type: object`; until corrected, metrics stay opaque.
4. Define role/resource authorization and enforce it server-side for reads and mutations.
5. Provide polling, terminal-state, retry, concurrency and idempotency semantics.
6. Provide the sanitized success/error payload pack in §10 from the same deployed version.
7. Preserve backward compatibility for the agreed PoC window or publish a versioned breaking-change notice.

## 9. Required decision register

Each rollout group is not ready while any decision applicable to that group is `Open`; see §5.6. An open decision
for an excluded/future group does not block an independent group.

| Decision | Question | Options to approve | Required owner | Status |
|---|---|---|---|---|
| D-01 | How is pipeline type represented? | Typed top-level enum (preferred); versioned attribute key | BE + Product | Open |
| D-02 | Is LP2 bounded and client-pageable? | Max-size array for PoC; server page/search/sort contract | BE + Product | Open |
| D-03 | What is the total status mapping and terminal set? | Publish business meaning and FE mapping for iteration/stage, including future values | BE + Product | Open |
| D-04 | What is the minimum live-detail experience? | Typed rich stage results; product-approved generic detail | Product + BE | Open |
| D-05 | How are metric values typed and interpreted, including comparison direction? | Full option: typed fields (preferred), or explicit OpenAPI `oneOf`/discriminated envelope with keys, types, units, nullability and conforming examples; for every comparable metric define whether higher, lower or neither is better and whether evaluative styling is permitted. Selected degraded G3 option: omit every metric value/delta and show status transitions neutrally, with richer comparison deferred. Registry-only is invalid against the object-only schema. | BE + Product | Open; G3 requires explicit selection plus D-12 approval |
| D-06 | What are the polling and rate-limit rules? | Recommended interval/backoff, terminal state, `429`/`Retry-After` behavior | BE | Open |
| D-07 | Which accepted roles may perform each operation? | Keep Editor for review actions and Organization Manager/Administrator for Pipeline settings, CI connection, Re-run and Retry; decide read roles, additional role behavior and all Quality Standard permissions explicitly; provide QA accounts | Product + BE | Open |
| D-08 | How are settings, Retry and LP6 submission concurrency/duplicates handled? | LP5 version/ETag; LP7 retry idempotency/conflict; LP6 producer idempotency key, replay window and same-key/different-body behavior | BE | Open |
| D-09 | How are historical grades tied to a rubric? | Immutable snapshot; immutable version reference | BE + Product | Open |
| D-10 | What is the safe navigation policy? | Approved external hosts and internal route/reference formats | Product + Security | Open |
| D-11 | Where is the trusted live browser endpoint? | Same-origin HTTPS proxy (preferred); approved HTTPS CORS origin | Platform + BE | Open |
| D-12 | Which exact degraded behaviors are accepted for a rollout? | Approve each item in that group's “Applicable degraded items and exact reduced behavior” cell in §5.6; link Product approval plus QA scenario/evidence for every item. Approval is group-specific and cannot be reused implicitly by another group. | Product + QA | Open per group |
| D-13 | What is LP6 and how does a user Re-run start? | Define LP6 as ingestion or execution command, caller class, pipeline identity, rerun invariants and response timing; if ingestion, publish a separate Re-run command | BE + Product + Security | Open |
| D-14 | Is Quality Standard management in current scope? | Decided for T6.2: QS1 read-only may roll out independently; QS2–QS4 remain excluded until a Product-approved management story defines UX, permissions and ACs | Product | Decided 2026-10-02 |

Record an approved option, decision date, Jira/ADR link and approver in this table; do not replace evidence with a
verbal agreement.

## 10. Required sanitized payload and test-data pack

### 10.1 BE-owned conforming captures

BE supplies **schema-conforming** success responses and real error responses captured from the integration
environment, with tokens, personal data and sensitive repository details removed while preserving shape:

1. LP1: zero, one and multiple pipelines; Auto-Ready on/off; every allowed pipeline type after D-01 is resolved.
2. LP2: empty list; mixed statuses; maximum supported iteration count; valid responses omitting fields that remain
   optional in the agreed schema.
3. LP3: each pipeline type and documented stage status; representative known and forward-compatible stage keys;
   valid responses with optional collections absent.
4. LP4: valid neutral comparison plus actual documented cross-pipeline, missing-iteration and empty-delta
   error/response cases; after D-05 is resolved, conforming typed examples for higher-is-better, lower-is-better and
   non-evaluative metrics with their expected interpretation.
5. LP5: success plus actual invalid-threshold, forbidden, stale/conflict and missing-pipeline errors.
6. LP6, before G6: accepted caller success; forbidden interactive/wrong-project caller; first submission; exact replay;
   same idempotency key with different body; invalid pipeline identity; every invalid `rerun`/`rerunOfIterationId`
   combination; same-project and cross-project source; synchronous or asynchronous response chosen in D-13.
7. LP7: success plus actual not-retryable, duplicate/in-flight, forbidden and CI-provider failure errors.
8. QS1: absent standard, minimum valid standard and representative full current standard.
9. QS2–QS4 only after G8 is Product-approved: success plus actual invalid criterion, duplicate sequence/name if
   forbidden, concurrent update, referenced delete and forbidden errors.
10. Authentication: expired/invalid token response; authorization: allowed and denied project/resource combinations.
11. For every error: HTTP status, content type, stable machine code, localized-safe message fields and correlation ID.

Captures must be versioned with the OpenAPI commit/build identifier. BE is **not** asked to produce or capture a
malformed success response; such data would contradict the agreed backend contract.

### 10.2 FE-owned synthetic negative fixtures

FE creates synthetic fixtures solely to prove parser and fail-safe behavior. They are deliberately non-conforming
and are never presented as observed backend output:

1. missing required identity fields, wrong scalar/container types and invalid date strings;
2. unknown future enum values and duplicate/invalid stage ordering;
3. primitive, malformed or unknown values under the current object-only `metrics` schema;
4. malicious/unapproved `resultRef`, `runUrl` and `triggeredRunUrl` schemes, hosts and internal paths;
5. route/response pipeline identity mismatch and malformed Quality Standard criteria.

Synthetic negative fixtures supplement but never replace BE-owned conforming examples and real error captures.

## 11. Definition of Ready for an integration group

An endpoint group may enter implementation only when:

1. its exact deployed OpenAPI version and trusted HTTPS base route are identified;
2. every **blocker/decision ID listed for that group in §5.6** is resolved and linked in §9; items explicitly listed as
   not gating the group remain tracked but do not delay it;
3. required response fields, enum semantics, constraints and error codes are documented;
4. the permission rows applicable to the group and server enforcement are confirmed using only the accepted roles;
5. representative BE-owned conforming success and real error captures exist for the group;
6. QA has permitted/forbidden accounts and deterministic seed data;
7. D-12 records Product approval for **every individual degraded item** in that group's §5.6 cell, and QA links the
   planned scenario/evidence for each omission, text-only fallback or neutral presentation; unlisted degradation is
   not permitted;
8. rollback to the mock group is documented and does not affect unrelated AI Factory features.

## 12. Definition of Done for an integration group

An endpoint group is integrated only when:

1. live transport DTOs are runtime-validated and adapted without direct casts;
2. contract tests pass against the approved conforming payload pack and FE synthetic negative fixtures, and the
   deployed API smoke checks pass over HTTPS;
3. loading, empty, partial, invalid, forbidden, not-found, conflict and retryable-error states are verified as applicable;
4. authorization is tested both through UI controls and direct API calls;
5. cancellation/polling and per-resource failure isolation are verified;
6. unsafe link/reference cases remain non-clickable and security tests pass;
7. the group's mock/live switch and rollback are verified while unrelated mocks and overlays remain active;
8. Product accepts the full UI or the exact group-specific D-12 degradation list; QA records passing evidence for
   every listed degradation (including required omissions and absence of evaluative styling) and the deployed API build;
9. [05-backend-contract.md](05-backend-contract.md) integration status and
   [00-status.md](00-status.md) are updated in the implementation task, not pre-emptively in this proposal.

## 13. Risks

| Risk | Consequence | Mitigation |
|---|---|---|
| Open generic maps become an undocumented parallel API. | Silent FE/BE drift and incorrect KPI/cost rendering. | Require typed DTO fields or an explicit OpenAPI `oneOf`/discriminated metric envelope with conforming examples; a registry alone is insufficient. |
| Direct cast appears to work with one happy-path payload. | Missing optional data fails later in production. | Runtime parsers, negative fixtures and entity isolation. |
| Hybrid integration switch removes the Test Case overlay. | Pipeline cutover regresses already implemented Library behavior. | Per-group transport selection and regression test with overlay active. |
| Status meaning differs between UI and BE. | A running/needs-human iteration can be shown as complete or passed. | Approved total mapping and explicit Unknown state. |
| Mutable Quality Standard is presented as historical evidence. | Reviewers interpret past grades against the wrong rubric. | Immutable snapshot/version association and honest current-only label until available. |
| Browser uses the documented HTTP origin for convenience. | Bearer-token disclosure. | HTTPS readiness gate; fail closed; no TLS bypass. |
| Partial fan-out failure is handled as global failure. | One pipeline hides all data. | Per-pipeline state and retry. |

## 14. Alternative Approaches

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| Replace mock URLs and cast live DTOs directly. | Lowest initial code change. | Known shape/path/status mismatches; unsafe optional fields; no controlled fallback. | Rejected. |
| Wait for complete rich backend parity before any live use. | Simplest UI behavior and strongest parity. | Delays validation of already available reads and adapter architecture. | Not preferred; use readiness groups. |
| Add a FE anti-corruption adapter and staged endpoint-group switches. | Isolates API drift, supports reduced states and rollback, preserves unrelated mocks. | Additional types/tests/configuration. | Recommended. |
| Encode missing typed data in generic metrics/attributes with only a key registry. | Avoids new DTO fields. | The current object-only schema cannot represent/validate all required values; weak discoverability and evolution safety. | Rejected. Use typed fields or an explicit OpenAPI `oneOf`/discriminated envelope. |
| Treat the current Quality Standard as the rubric for all historical grades. | No backend storage change. | Factually unreliable after update/delete. | Rejected. |

## 15. Open Questions

1. Does the deployed backend currently return stronger invariants than OpenAPI documents, and will those invariants
   be made normative?
2. What maximum LP2 payload has been load-tested, and what stable default ordering is guaranteed?
3. Are pipeline names unique within a project, and can IDs/iteration numbers ever be reused?
4. Can LP3 return an iteration from another project when addressed only by ID, and how is project ownership checked?
5. Which CI providers and approved URL hosts are required beyond the two documented provider enum values?
6. Which Product story, UX and audit requirements will authorize the future G8 Quality Standard management scope?
7. Which audit/event service records LP5, LP7 and QS2–QS4 actor/time changes?
8. What correlation header/field should FE surface when reporting a backend failure?

## Changelog

| Date | Change |
|---|---|
| 2026-10-02 | QA iteration 2: made G3 comparison status-only and neutral pending metric/cost semantics, and added group-specific degraded behavior plus Product/QA evidence gates for G1–G9. |
| 2026-10-02 | QA iteration 1: clarified LP6 producer/Re-run semantics, corrected role names, split Quality Standard scopes, added rollout-group blocker dependencies, strengthened metric typing and separated BE captures from FE negative fixtures. |
| 2026-10-02 | Initial proposed FE/BE integration contract based on OpenAPI `feature-pipelines-2767` and the implemented mock-backed UI. |
