# Backend integration handoff: Pipeline tasks 1–5c

**As of:** 2026-10-19

**Audience:** Pipeline backend, Product, QA

**Frontend tickets:** [1 / EPMRPP-122411](https://jiraeu.epam.com/browse/EPMRPP-122411), [2 / EPMRPP-122412](https://jiraeu.epam.com/browse/EPMRPP-122412), [3 / EPMRPP-122413](https://jiraeu.epam.com/browse/EPMRPP-122413), [4 / EPMRPP-122414](https://jiraeu.epam.com/browse/EPMRPP-122414), [5a / EPMRPP-122415](https://jiraeu.epam.com/browse/EPMRPP-122415), [5b / EPMRPP-122416](https://jiraeu.epam.com/browse/EPMRPP-122416), [5c / EPMRPP-122417](https://jiraeu.epam.com/browse/EPMRPP-122417).

This is the current request for backend answers and test data for the frontend work implemented in tasks 1–5c. It supersedes the older LP1–LP5 assumptions in [12-backend-api-integration-request.md](12-backend-api-integration-request.md); other API families in that document remain separate. The [implementation log](21-live-pipeline-integration-2026-10-18.md), [progress board](00-status.md) and [temporary-solutions register](23-temporary-solutions-register.md) contain the detailed history.

## Evidence and current state

- Backend source was inspected at [`service-api` commit `3e9a6454e0b5755cb2b2f44ccb305c01f3356d4f`](https://github.com/reportportal/service-api/commit/3e9a6454e0b5755cb2b2f44ccb305c01f3356d4f). This is **not** a verified deployed SHA.
- On 2026-10-19, unauthenticated `GET http://tms.epmrpp.reportportal.io/api/api-docs` returned OpenAPI version `feature-pipelines-2876` (JSON SHA-256 `2ce553356e46ec529286798ead31e6db5658a5d861859824972ca73eede40526`). This proves the published schema at that HTTP address, not authenticated response behavior or the exact deployed commit. HTTPS on the host previously presented an untrusted default Traefik certificate. Credentials must not be sent over HTTP for further verification.
- An authenticated empty LP1 `200` was observed in Swagger; later, nonempty LP1, LP2 and LP3 were seen in the UI through the localhost proxy for `superadmin_personal`. That verifies this local UI path only; multi-page, negative-case, role and trusted-HTTPS checks are still missing.
- In the authenticated localhost UI on 2026-10-19, the Review panel resolved four LP3-linked display IDs (`TC25602`–`TC25605`) through Library list reads and displayed four numeric-ID links, three `READY` statuses, one `DRAFT` status and their scores. This agrees with that LP3 Review aggregate of `3/4 Ready` for this snapshot; it does not establish the identity rule for other projects or iterations.
- The initial localhost comparison showed `Not found` because the development `axios-mock-adapter` still intercepted LP4 and returned a mock `404` before any network request. Its LP4 handler has been removed. After a full browser reload, the authenticated localhost UI sent `GET /api/v1/project/superadmin_personal/pipeline/iteration/2/compare?with=1`, received `200 OK`, and displayed the returned iteration identities, four stage comparisons and five metrics. This proves the local proxy path for this pair, not the backend's deployed SHA, alternate scopes or error cases. The separate LP1/LP4 state race that hid comparison errors has also been fixed.
- The supplied `pipeline-iteration-e2e-journey.md`, the Postman collection and [source-example fixtures](pipeline-contract-fixtures/README.md) are examples, **not** deployed payload captures. Their IDs, URLs, amounts, timestamps and business values must not become frontend defaults.
- Frontend LP1–LP4 now request the real API by default. Their runtime fallback handlers have been removed: an empty or failed API response stays empty or failed. Other AI Factory mocks remain for later integrations. Task 4's specialized renderer is coded but cannot activate with the published stage responses; task 5a displays live Auto-Ready settings read-only and sends no live PATCH. Tasks 5b/5c now have provisional read-only integrations based on the published Library and LP4 schemas, verified through the authenticated localhost proxy for the cases above but not on a trusted authenticated deployment.

The paths below are the frontend URLs including the `/api` proxy prefix. OpenAPI lists the same operations under `/v1`.

| Task | Current frontend request/use | Current boundary |
|---|---|---|
| 1: contract | LP1–LP5 schema/source review and source-example validation | Matching deployed SHA, trusted transport and authoritative success/error captures still needed. |
| 2: catalog/list | `GET /api/v1/project/{projectKey}/pipeline?offset=&limit=&search=` (LP1); `GET /api/v1/project/{projectKey}/pipeline/{pipelineId}/iteration?offset=&limit=&search=` (LP2). `content/page` is validated, with independent page/error states. | Name-only catalog search differs from backend search; multi-page and permission QA pending. |
| 3: detail | `GET /api/v1/project/{projectKey}/pipeline/iteration/{iterationId}` (LP3), including a direct deep link; identity, statuses, times, attributes, stages, warnings and sections are displayed when supplied. | No polling contract; case/CI links and raw-value presentation need confirmation. |
| 4: generation panels | LP3 `pipelineType`, stage identity and `sections` drive Create/Grade/Upload styling only when the semantic keys are explicit and recognized. Unknown data remains in a generic stage view. | Published LP2/LP3 stage response schemas omit `stageKey`; current live data cannot reliably select those panels. |
| 5a: Auto-Ready | The catalog's LP1 `settings.autoReady.enabled/threshold` is shown read-only. An iteration can open it only when its pipeline exists in the loaded catalog for the current project. | No single-pipeline GET; no live LP5 write until permissions, validation and concurrency are agreed. |
| 5b: Review/Library | For a Review stage, LP3 `relatedEntities` of type `TEST_CASE` supply display IDs. The frontend calls `GET /api/v1/project/{projectKey}/tms/test-case?filter.eq.displayId={displayId}&offset=0&limit=2` for each ID and shows current Library name/status/score; a unique exact result yields a numeric-ID details link. | One four-case authenticated localhost join was observed. No authoritative Review case-list/filter endpoint, lifecycle/comment/fix-round contract or broader identity/role evidence. Missing or ambiguous matches stay unavailable. |
| 5c: comparison | `GET /api/v1/project/{projectKey}/pipeline/iteration/{candidateId}/compare?with={baselineId}` (LP4) now feeds a live comparison view. Both returned iterations must match the selected IDs and pipeline. Stage statuses, costs/durations, metric values/deltas and same-scope section rows are displayed; the complete server response is available in an expandable panel. | One authenticated localhost LP4 `200` with four stages, five metrics and empty `sections` was observed after removing the dev mock interceptor. Same/different-scope rows, complete baseline selection across LP2 pages, verdict/unit semantics and error behavior remain unverified. Mock-rich comparison values are not used for live responses. |

## Task 1 — version, access and response contract

**Known from pinned source:** LP1, LP2 and LP3 read methods check `ALLOWED_TO_VIEW_PROJECT`; LP5 PATCH checks `ALLOWED_TO_EDIT_PROJECT`. OpenAPI describes LP1/LP2 page wrappers but does not mark `content`/`page` required. It describes several error responses, but does not establish their actual body or all runtime status codes. `statusCategory` is the stable category (`PENDING`, `RUNNING`, `WAITING`, `PASSED`, `FAILED`, `SKIPPED`, `UNKNOWN`); `status` is display text and may change. Source aggregation priority is `FAILED > RUNNING > WAITING > PENDING > PASSED`, with skipped/unknown stages excluded from the ordinary aggregate.

**Backend requests:**

1. Provide an HTTPS URL with a trusted certificate chain (or the corporate CA distribution path), the **deployed Git SHA/build identifier**, and an OpenAPI document generated by that same deployment. State whether `feature-pipelines-2876` maps to the pinned source commit.
2. Confirm the required wire fields for LP1, LP2 and LP3, especially `content`, `page` and page metadata; update OpenAPI requiredness if runtime always emits them. Confirm whether empty collection is always `200 {content: [], page: ...}` and whether detail can legitimately return `200` with an empty body or `204`.
3. Supply sanitized authenticated examples from that build: nonempty and empty success; `400`, `401`, `403`, `404`, `409` and `429` where applicable, including error body, headers and retry guidance. Confirm cross-project IDs yield `403` or `404` consistently, without disclosing another project's data. No tokens or credentials in captures.
4. Confirm final project permission mapping and which roles may **view** settings versus **edit** them. The prototype's Organization Manager/Administrator UI rule is narrower than the source's project `ALLOWED_TO_EDIT_PROJECT` guard; Product and backend should approve one user-facing policy.

## Task 2 — LP1/LP2 catalog, search and pagination

**Known from pinned source:** `offset` is a count of skipped records, starting at 0; `limit` defaults to 100 and is capped at 200. LP1 sorts by name then ID; LP2 sorts newest `iterationNumber` first. The page envelope is `{content, page}`, and the generated `page.number` is **1-based**; it has `size`, `totalElements`, `totalPages`, with no `hasNext`. The frontend calculates next-page availability from those fields and validates the requested offset against the returned page. LP2 additionally advertises `status` and `attribute` filters; source treats status filters as normalized categories and repeated `attribute=key:value` values as AND conditions, and rejects malformed attributes with `400`. The current UI does not expose all those filters.

**Blocking mismatch:** Product asked for Pipeline search **by pipeline name only**. Backend LP1 `search` also matches iteration number/attributes. Frontend currently removes non-name matches **within the returned page**, but backend `totalElements` still includes them. A page may therefore appear empty although a later page contains name matches; counts and page navigation can be misleading. Client filtering cannot correct server pagination.

**Backend requests:**

1. Add/confirm a server-side name-only LP1 search option (for example, a separate `name` parameter or an explicit `searchField=name` mode) with `totalElements` and ordering calculated **after** that filter. Specify case folding, whitespace, substring behavior and whether the existing broad `search` remains available for other clients. Please choose the public parameter name; the example names here are proposals.
2. Confirm deployed offset/limit bounds, sort stability, 1-based metadata and behavior when an offset is beyond the last page or data changes between pages. Supply a real multi-page LP1 and LP2 capture, including the last page and a search where iteration metadata matches but the pipeline name does not.
3. Confirm LP2 query encoding and semantics for `search` (`#` iteration number versus attribute text), repeated/comma-separated `status`, repeated `attribute`, and invalid filters; provide one valid and one `400` capture. Clarify whether `statusCategory` is the intended UI filter value throughout.

## Task 3 — LP3 direct iteration detail and generic sections

The frontend opens LP3 directly by project and iteration ID, without first loading LP1 or LP2. It checks positive route IDs, compares returned `pipelineId` with the route pipeline ID, and ignores late responses from a previous project/request. Invalid URLs, `403`, `404`, and empty `200`/`204` have separate states. Real response fields populate the summary, stage cards and generic panels; absent optional numbers are not silently converted to zero. The raw JSON and mapped-field expanders are temporary inspection aids, tracked in the [temporary-solutions register](23-temporary-solutions-register.md).

**Backend requests:**

1. Confirm LP3 identity and project isolation: can `iterationId` be read in a project other than its owner; is `pipelineId` always present and stable; what are the exact missing/forbidden responses? Supply successful, missing and forbidden captures.
2. Document status transitions and terminal states for iteration and stage, including Review after a Library status change, Retry and re-run. Specify whether/when frontend polling is expected, the interval or backoff, rate limits, and whether a terminal iteration can become active again. The frontend currently does **not** poll LP3.
3. Publish the `sections` contract: stable `key`, `role` (`RESULT`, `DETAILS`, etc.), ordered column keys, cell value types, optional row details, empty/partial/failure shapes, and whether unknown keys/columns must be preserved. Clarify unit and rounding for duration, cost, token usage, scores and percentages; distinguish absent from actual zero.
4. For `relatedEntities`, table-cell targets and CI job links, provide a stable **numeric Library Test Case ID** or a validated internal details target alongside the display ID (`TC…`). The current display-ID link falls back to Library **name search**, which can find the wrong case when names repeat. Provide a trust policy for external CI/MR URLs (schemes, hosts, encoding and who controls the value); arbitrary response URLs are currently rendered as text where untrusted.
5. Agree which raw fields may be shown in the temporary JSON inspector, especially `rawOutput`, links, CI metadata and potential secrets. A public, redacted detail DTO would remove the need for client-side guesses about sensitive values.

## Task 4 — Create, Grade and Upload stage presentation

The frontend deliberately selects generation-specific panels only when LP3 has `pipelineType=TEST_CASE_GENERATION`, the stage carries an explicit semantic `stageKey` (`create`, `grade` or `upload`), and a `RESULT` section has the expected signature: `authoredCases` with `name`/`status`, `gradedCases` with `name`/`total`, or `uploadReport` with `testCase`/`result`. Additional server columns and rows still render. Stage name, stage sequence and generated UI IDs never substitute for `stageKey`. Review currently renders only the aggregate LP3 information; per-case Library state belongs to task 5b.

**Blocking schema gap:** Reporting **requests** support `stageKey`, but the published `PipelineStageSummaryRS` (LP2) and `PipelineStageRS` (LP3) **responses** list `id`, `name`, `sequence`, status and other fields without `stageKey`. The specialized cards/panels therefore remain generic with the current deployed schema, even if their visible names happen to be Create/Grade/Upload.

**Backend requests:**

1. Return an immutable semantic `stageKey` in both LP2 and LP3 stage responses and mark/document its requiredness in OpenAPI. Confirm canonical values and uniqueness within an iteration, including retries, custom stages and future pipeline types.
2. Confirm the three RESULT section keys, roles and minimum column keys against a **real deployed** generation iteration. Specify whether grading criteria/score breakdowns and upload result/status are stable fields or table rows, and how failed/partial/empty stages represent them.
3. Provide a sanitized generation example with all four stages and meaningful Create/Grade/Upload rows, plus a custom/unknown stage and retry attempt if supported. This is needed for browser visual verification without embedding the journey's fixture values as mocks.

## Task 5a — live Auto-Ready settings, read-only for now

LP1 can contain `settings.autoReady: {enabled, threshold}`; missing settings are displayed as **unavailable**, not as `false` or threshold `0`. The live modal is read-only. It opens from a catalog pipeline, or from an iteration only if the same pipeline has already loaded in the current project's catalog. A direct iteration link with no LP1 catalog cannot show settings because OpenAPI has `PATCH /api/v1/project/{projectKey}/pipeline/{pipelineId}` but no single-pipeline `GET`. The older mock editor and its flat request fields are isolated from live data.

Published LP5 request shape is `{ "settings": { "autoReady": { "enabled": true, "threshold": 90 } } }` and the response schema is `PipelineRS`; the source-example journey says settings keys merge at the top level and `null` removes a named setting. The source and published schema expose **no revision, ETag or conditional write precondition**. The frontend sends **no live PATCH** by agreement until this is resolved.

**Backend/Product requests:**

1. Add a single-pipeline read endpoint, or include current settings in the LP3 detail with a documented source of truth and authorization. Specify how the frontend refreshes values after a catalog page change or someone else's update.
2. Define `autoReady` requiredness, the allowed integer threshold range and whether threshold is required when disabled, retained when toggled off, or removed; specify `null` and unknown settings key behavior. Publish valid/invalid examples and the exact `400` error body. The frontend's mock editor currently uses 0–100, which is **not** proof of the live validator's bounds.
3. Agree the edit role policy against `ALLOWED_TO_EDIT_PROJECT`. For safe concurrent edits, return a revision/ETag on read and require `If-Match` or an equivalent revision in PATCH, with a documented `409`/`412` conflict response; alternatively obtain an explicit Product decision accepting last-write-wins and its overwrite risk. Clarify audit identity/timestamp and response freshness after a write.
4. Confirm the exact PATCH merge behavior, response body, error bodies (`400/401/403/404/409/429`) and whether toggling Auto-Ready affects an in-progress iteration or only future ones. No frontend save action will be enabled from this request alone; it needs the agreed contract and verification.

## Task 5b — Review and Library case join

LP3's Upload `relatedEntities` contain `TEST_CASE` display IDs in the source example. The published Library list API exposes `filter.eq.displayId` and returns `TmsTestCaseRS` with numeric `id`, `displayId`, `name`, `status` (`DRAFT`/`READY`) and optional `metrics.overallScore`. The frontend now uses that exact filter for each distinct linked ID (maximum 50), accepts only one case whose `displayId` exactly matches, and renders current status/score in the Review panel. The numeric ID enables the existing Library details route. A manual Refresh repeats the Library reads. Empty, failed or ambiguous lookups produce plain text and an unavailable value, never a guessed route or mock status. The AI Factory development overlay may add provisional AI extension fields to Library responses, but this join reads only the published base fields above.

This is a bounded **read-only join**, not a full Review queue. LP3 Review currently gives aggregate `ready`/`total` and message, while its per-case list, comments, maker of a Ready transition, fix rounds and Library filter by iteration are absent from the published contracts. The frontend performs up to one Library request per linked case; large iterations are explicitly not loaded in this panel. A case status may change after the LP3 response, so the Review aggregate and live per-case list can briefly differ.

**Backend/Product requests:**

1. Confirm that LP3 `TEST_CASE` `entityId` is always the project's unique Library `displayId`, and that `filter.eq.displayId` performs an exact project-scoped lookup with stable `content/page` semantics. Supply nonempty, missing, duplicate/ambiguous, forbidden and wrong-project captures, with the resulting numeric case ID. Confirm whether the existing AI overlay can be removed from this read path during verification.
2. Prefer a documented bulk or iteration-scoped Library read with pagination and numeric IDs over one request per case. Publish the authoritative relation for Review cases when Upload has no `relatedEntities` or an unresolved target, plus the route/filter to open a Review queue for **this iteration**. The existing frontend `filter.eq.iterationId` is supplied by a mock overlay and is not published by the backend OpenAPI.
3. Define the case-level fields required by the prototype: current lifecycle/status, who made it Ready and when, unsent review comments, current/historical score, fix rounds and Auto-Ready outcome. State whether those fields belong to Library, Review stage, or dedicated APIs, their permissions and freshness, and how Review's aggregate count reconciles with them.
4. Confirm the refresh/event model for a Library status change (including Ready → Draft) and whether LP3's Review/iteration status can move back from completed. Specify polling/backoff or push semantics before automatic updates are enabled.

## Task 5c — LP4 live comparison

The published LP4 schema describes `baseline`, `candidate`, `sameScope`, `note`, `stages`, `metrics` and `sections`; none are marked required in `PipelineCompareRS`. The frontend now calls the exact LP4 URL and rejects a response whose baseline/candidate IDs or pipeline IDs differ from the requested pair. A mismatched project response is not shown after project navigation. The live view shows colored backend status categories, stage costs/durations when provided, metric baseline/candidate/delta text, optional `valueType`/`verdict` and section `stageName`, plus side-by-side section cells only when `sameScope=true`. The complete LP4 payload, including nested iteration and stage details, is available in a collapsed raw-response panel. If `sameScope=false` or is missing, it hides case-by-case rows and explains the uncertainty. `LINK` values and cell targets are text until a trusted target policy exists; `verdict` is deliberately not converted into better/worse colors without agreed valueType/unit semantics. Mock-only metric calculations are isolated from the live response.

The comparison page can take a full pair of IDs in its URL even when LP1/LP2 are not loaded. With a candidate-only link from the iteration header, it looks for the immediately preceding iteration number among the LP2 options loaded on the page (currently the first 200); older candidates or pagination boundaries may require manual selection or a backend previous-ID hint. The server response, rather than the dropdown's partial page, decides whether two IDs truly belong to the same pipeline and project.

**Observed local runtime:** The initial `Not found` was generated by the local mock handler; it was not a backend failure. With that handler removed, the authenticated localhost proxy returned LP4 `200` for pipeline 1, baseline 1 and candidate 2. The UI displayed four stage comparisons and five metrics, with candidate values unavailable while iteration 2 was running. Backend still needs to supply representative same-scope and different-scope section data, negative responses and metric semantics from a versioned deployment. The inline error/Retry state remains available for real failures.

**Backend/Product requests:**

1. Provide sanitized deployed LP4 captures for same scope with nonempty stages/metrics/sections, different scope with `note`, empty comparison, missing baseline/candidate, cross-pipeline and wrong-project IDs, plus the exact `400/401/403/404` bodies. Make baseline/candidate identity fields and `sameScope` required in OpenAPI if they are runtime invariants.
2. Confirm whether LP4 enforces same-pipeline/project ownership itself, what `sameScope` compares (which attributes and normalization), and whether `sections` must be empty when false. Clarify duplicate/missing stage or row keys and the order of stage/metric/section arrays.
3. Specify `metrics[].valueType`, units/format/rounding, sign of `delta`, treatment of absent values and the meaning of `verdict` for each metric. Clarify whether section-cell `url`/`target` may be navigated and provide the approved internal/external link policy. Until then the frontend displays raw values and neutral deltas without directional claims.
4. Expose `previousIterationId` or a paginated previous-iteration lookup for a candidate, or confirm that first-page-only selection is acceptable for the PoC. The client must not infer an iteration ID by subtracting one from `iterationNumber`.

## Requested verification pack

Please attach sanitized HTTP method/path, status, response body, relevant headers and backend build SHA for each case below. Remove credentials, tokens and sensitive `rawOutput`; preserve field names, types and realistic empty/optional cases.

| Priority | Capture / decision | Unblocks |
|---|---|---|
| P0 | Trusted HTTPS/CA, deployed SHA and matching OpenAPI | All live rollout claims and task 1 completion |
| P0 | LP1 name-only search with correct totals, plus LP1/LP2 multi-page cases | Accurate task 2 search and pagination |
| P0 | LP2 and LP3 stage response `stageKey` and real generation sections | Task 4 specialized panels and visual QA |
| P0 | LP5 settings read/role/validation/concurrency decision | Task 5a direct-link read and eventual save |
| P0 | Exact LP3-to-Library identity and bulk/iteration read contract | Complete task 5b Review queue and case lifecycle |
| P0 | Authenticated LP4 same-scope and different-scope payloads, identity/error rules | Complete task 5c runtime comparison QA |
| P1 | LP1 empty/nonempty; LP2 empty/nonempty and filter `400`; LP3 success/empty/forbidden/not-found | Tasks 1–3 negative-path and permission QA |
| P1 | Status transition/polling, Library numeric case identity, link and raw-field policies | Task 3 refresh, navigation and data presentation |
| P1 | LP4 metric/verdict units and previous-iteration selection | Directional comparison and complete dropdown navigation |

Interactive re-run, failed-stage Retry, Review comments/fix rounds and the remaining AI Factory mutations are separate follow-up contracts; their existence in OpenAPI or the prototype does not mean those actions are live-integrated here.
