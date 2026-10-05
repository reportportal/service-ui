# 11 · Backend integration contract — test cases

> **Status: proposed QA suite.** These cases validate the agreed behavior and readiness gates in
> [10-backend-integration-contract.md](10-backend-integration-contract.md). They do not make an Open decision
> executable: a rollout group stays blocked until its §5.6 blockers and decisions satisfy the Definition of Ready.
>
> Cases marked **Future/blocked** are specifications for G8/G9 or unresolved LP6 behavior. They must not be used as
> evidence that those capabilities are currently implemented.

## 1. Test strategy and risk priorities

| Risk | Impact | Test depth |
|---|---|---|
| Bearer token sent over HTTP or to an untrusted origin | Credential disclosure | Critical; automated transport policy tests plus HTTPS integration smoke test |
| Missing server-side project/resource authorization | Cross-project data access or mutation | Critical; direct API tests with permitted and forbidden identities |
| Raw DTO cast or unsafe fallback | Incorrect status, identity, score, cost or navigation | Critical; adapter contract tests with conforming and synthetic negative fixtures |
| LP6 ingestion used as a user Re-run command | Duplicate/fabricated iterations or excessive producer authority | Critical; routing, caller and idempotency tests before G6/UI enablement |
| Global mock/live switch removes the Test Case overlay | Regression of delivered Library workflows | High; integration test for every routing switch and rollback |
| Fan-out or polling failure affects unrelated resources | Blank page, duplicate data or API overload | High; saga/service integration and browser lifecycle tests |
| Mutable Quality Standard presented as historical evidence | Misleading audit and grading results | High; current-only label and G9 immutability tests |
| Undocumented metrics interpreted as KPI/cost | Factually wrong comparison or cost | High; opaque-metric and neutral-comparison tests |
| Untrusted API link rendered as navigation/HTML | XSS, phishing or credential leakage | High; URL-policy unit and component tests |
| CI connection implemented from an invented API or secret-bearing read DTO | Credential disclosure, unauthorized CI changes or false downstream capability | Critical; requirements/OpenAPI readiness gate plus secret-redaction, role, isolation, concurrency and browser tests |

### Test levels

- **Contract/adapter:** deterministic unit tests against versioned payloads and synthetic malformed inputs.
- **Service/controller:** URL, transport selection, cancellation, fan-out, polling and state-reconciliation tests.
- **Component/browser:** visible loading/degraded/error states, permissions, links, overlay preservation and rollback.
- **API/security:** HTTPS, authentication, authorization, resource isolation, concurrency and idempotency checks against
  the approved integration environment.

## 2. Traceability summary

### 2.1 Functional requirement and acceptance-criteria coverage

| Requirement | Acceptance criteria | Covered by |
|---|---|---|
| BackendIntegration_1 | AC1–AC2 | TC-BIC-001, 002 |
| BackendIntegration_1 | AC3–AC5 | TC-BIC-003, 004, 005, 007 |
| BackendIntegration_1 | AC6 | TC-BIC-006, 008 |
| BackendIntegration_2 | AC1 | TC-BIC-009 |
| BackendIntegration_2 | AC2–AC3, AC7 | TC-BIC-010, 033 |
| BackendIntegration_2 | AC4–AC5 | TC-BIC-011 |
| BackendIntegration_2 | AC6 | TC-BIC-012 |
| BackendIntegration_3 | AC1 | TC-BIC-013, 014, 029 |
| BackendIntegration_3 | AC2–AC3 | TC-BIC-015 |
| BackendIntegration_3 | AC4 | TC-BIC-016 |
| BackendIntegration_3 | AC5 | TC-BIC-017 |
| BackendIntegration_3 | AC6–AC7 | TC-BIC-018, 019, 028, 033 |
| BackendIntegration_3 | AC8 | TC-BIC-019 |
| BackendIntegration_4 | AC1–AC3 | TC-BIC-021, 022 |
| BackendIntegration_4 | AC4–AC6 | TC-BIC-024, 025 |
| BackendIntegration_4 | AC7–AC8 | TC-BIC-026, 027 |
| BackendIntegration_4 | AC9 | TC-BIC-024, 025, 027 |
| BackendIntegration_4 | AC10 | TC-BIC-030, 031 |
| BackendIntegration_5 | AC1–AC5 | TC-BIC-032 |
| BackendIntegration_6 | AC1 | TC-BIC-020 |
| BackendIntegration_6 | AC2–AC5 | TC-BIC-023 |
| BackendIntegration_6 | AC6 | TC-BIC-008, 020, 035 |
| T3.6 capability projection | Minimal broad-consumer status versus privileged full configuration; exact roles, org/project membership and cross-project denial | TC-CIC-032–033, 035 |
| T3.6 freshness and revocation | Material save/rotation invalidates Connected; expiry/revocation/disconnect and immediate downstream rechecks | TC-CIC-034–035 |
| T3.6 idempotency | Header key format/scope/fingerprint/retention, in-progress replay and same-key conflict/version interaction | TC-CIC-036–037 |
| T3.6 secret boundary and input safety | Vault boundary, least privilege, pre-WAF/APM redaction, hostile text/control/Unicode/HTML handling and output encoding | TC-CIC-038–039 |
| T3.6 lifecycle/validation decisions | Single state enum, 15-minute bounded freshness TTL, atomic rotation/disconnect and concrete UTF-8/ID/URL/label rules | TC-CIC-034–039 |
| T3.6 concrete input/idempotency rules | Credential/project/provider grammar, collection limits, UUIDv4 requirements, one active probe and crash replay | TC-CIC-040–044 |

### 2.2 Rollout-group coverage

| Group | Primary cases | Required execution state |
|---|---|---|
| G1 Pipeline catalog | TC-BIC-001, 003–006, 013–016, 033 | Execute after G1 DoR |
| G2 Pipeline generic detail | TC-BIC-007, 013–018, 023, 033 | EPMRPP-122041 automated FE foundation coverage complete; authenticated/live execution remains blocked until G1 and G2 DoR |
| G3 Pipeline comparison | TC-BIC-019, 033 | Execute only after D-05 degraded option and D-12 evidence are approved |
| G4 Pipeline settings | TC-BIC-021, 022, 024, 033 | Execute after permission, validation and concurrency decisions |
| G5 Stage Retry | TC-BIC-017, 021–023, 025, 033 | Execute after retry/idempotency decisions |
| G6 Iteration submission | TC-BIC-026, 027, 033 | Future/blocked until D-08 and D-13 are resolved |
| G7 Current Quality Standard read | TC-BIC-028, 029, 033 | Execute after QS1 DoR; current-only behavior |
| G8 Quality Standard management | TC-BIC-030, 031, 033 | Future/blocked until a Product-approved management story |
| G9 Historical grading association | TC-BIC-032, 033 | Future/blocked until immutable snapshot/version contract exists |
| G10 Pipeline CI connection | TC-BIC-036 plus TC-CIC-001–044 in [19](19-ci-connection-api-contract-request.md#11-contract-validation-cases) | Future/blocked until the accepted requirements-repo contract, published API, sanitized payload pack and role/security evidence exist |

## 3. Contract and adapter cases

### TC-BIC-001: Canonical URL builders do not reuse legacy mock paths

- **Related AC:** BackendIntegration_1 AC1–AC2; BackendIntegration_2 AC2
- **Traceability:** EP-01, EP-02; G1–G8
- **Pre-conditions:** Live URL builders and transport-group configuration are implemented; legacy mock handlers remain available.
- **Role:** Automated test client
- **Steps:**
  1. Build URLs for LP1–LP7 and QS1–QS4 using a project key and representative IDs.
  2. Assert Pipeline URLs omit `/tms`, QS URLs retain `/tms/quality-standard`, LP3 contains only `iterationId`, and LP4 uses the required `with` query.
  3. Enable each live group and capture the requested URL.
  4. Enable mock transport and capture the legacy URL.
- **Expected Result:** Live requests use exactly the published canonical paths; mock requests retain their legacy paths; no builder accidentally routes live traffic through a mock handler.
- **Priority:** Critical
- **Risk Level:** Wrong resource or silent mock interception
- **Automation suitability:** Full — unit plus service integration

### TC-BIC-002: Conforming live DTOs are validated and adapted without direct casts

- **Related AC:** BackendIntegration_1 AC1–AC2, AC6
- **Traceability:** EP-04; G1–G8; §10.1
- **Pre-conditions:** Versioned BE-captured payload pack matches the approved OpenAPI build.
- **Role:** Automated test client
- **Steps:**
  1. Pass one conforming success payload for each enabled operation through its runtime parser.
  2. Adapt the parsed DTO into the stable UI model.
  3. Verify renamed fields, ISO date conversion, string-map conversion and explicitly unavailable values.
  4. Search the enabled request path for direct response casts to rich view models.
- **Expected Result:** Every enabled operation uses a dedicated raw parser and adapter; mapped values are contract-backed; no network response is directly cast to `PipelineRS`, `IterationSummaryRS` or `IterationRS`.
- **Priority:** Critical
- **Risk Level:** Silent contract corruption
- **Automation suitability:** Full — contract/unit test and static rule where practical

### TC-BIC-003: Optional fields and invalid entity identity are isolated

- **Related AC:** BackendIntegration_1 AC3–AC4; BackendIntegration_3 AC1–AC2
- **Traceability:** EP-04, PL-01, QS-01; G1, G2, G7
- **Pre-conditions:** Synthetic fixtures omit optional fields and separately omit required agreed identity fields.
- **Role:** Automated test client
- **Steps:**
  1. Parse entities with allowed optional values absent.
  2. Parse a list containing one entity without an agreed required ID/name and two valid entities.
  3. Parse a Quality Standard with one invalid criterion identity/invariant.
  4. Inspect normalized state, diagnostics and visible fallbacks.
- **Expected Result:** Optional omissions become explicit unavailable states. An invalid entity/criterion is rejected or isolated according to the agreed parser policy without removing healthy siblings. Diagnostics identify the operation/entity without exposing sensitive payload data.
- **Priority:** Critical
- **Risk Level:** Whole-screen failure or invented identity
- **Automation suitability:** Full — adapter and reducer/component tests

### TC-BIC-004: Malformed scalar/container/date and unsafe map input fails safely

- **Related AC:** BackendIntegration_1 AC3–AC4, AC6
- **Traceability:** EP-04, IT-01, IT-05, ST-03; G1–G3; §10.2
- **Pre-conditions:** FE synthetic fixtures contain wrong scalar/container types, invalid dates, prototype-like keys and primitive/unknown metric values.
- **Role:** Automated test client
- **Steps:**
  1. Feed each malformed fixture to the appropriate parser.
  2. Verify own-property handling for attribute maps and rejection/ignoring of unsafe keys.
  3. Render any accepted partial model.
- **Expected Result:** Wrong types do not reach components; invalid dates never fall back to the current time; unsafe keys do not modify prototypes; metrics remain opaque and do not produce KPI/cost values.
- **Priority:** Critical
- **Risk Level:** Corrupted UI state or prototype pollution
- **Automation suitability:** Full — fuzzable unit/component test

### TC-BIC-005: Future enum values remain Unknown

- **Related AC:** BackendIntegration_1 AC5–AC6
- **Traceability:** IT-02, ST-02, D-03; G1–G3
- **Pre-conditions:** Synthetic payload uses an unknown future iteration/stage status.
- **Role:** Automated test client
- **Steps:**
  1. Parse and adapt the payload.
  2. Render list, detail and comparison consumers.
  3. Exercise terminal-state and polling checks.
- **Expected Result:** The value maps to an explicit neutral Unknown state, never Passed/success. It is not treated as terminal unless the approved mapping says so, and no evaluative color or success icon is shown.
- **Priority:** Critical
- **Risk Level:** Running or failed work shown as successful
- **Automation suitability:** Full

### TC-BIC-006: LP2 consumes a plain array and applies only approved client behavior

- **Related AC:** BackendIntegration_1 AC6; BackendIntegration_3 AC1
- **Traceability:** EP-03, D-02; G1
- **Pre-conditions:** D-02 defines the maximum array size, stable ordering and approved client-side search/sort behavior.
- **Role:** Project user with Pipeline read permission
- **Steps:**
  1. Return empty, one-item, maximum-size and mixed-status LP2 arrays.
  2. Verify the client does not dereference `.content` or send undocumented `search`, `offset`, `limit` or sort parameters.
  3. Apply approved local search/sort and clear it.
- **Expected Result:** Arrays normalize correctly; empty and maximum cases remain usable; order/search behavior matches D-02; no page-wrapper assumption or undocumented query is used.
- **Priority:** High
- **Risk Level:** Runtime failure or incomplete/unbounded list behavior
- **Automation suitability:** Full — adapter, service and component test

### TC-BIC-007: LP3 route context is validated although the canonical path omits pipelineId

- **Related AC:** BackendIntegration_1 AC3–AC4; BackendIntegration_3 AC6
- **Traceability:** EP-02; G2
- **Pre-conditions:** Pipeline detail route contains `pipelineId`; LP3 fixtures include matching, mismatching and missing `pipelineId` values.
- **Role:** Project user with Pipeline read permission
- **Steps:**
  1. Request LP3 using only the route's `iterationId` in the live URL.
  2. Adapt a matching response.
  3. Repeat with a different returned `pipelineId` and with the agreed invalid/missing identity fixture.
  4. Delay the response, then change project, catalog version/request or detail route before it completes.
  5. Open the Library with an iteration filter and verify its iteration-number label lookup against cached catalog metadata.
- **Expected Result:** Matching data renders. Mismatched identity fails closed with an invalid-resource state and never renders another pipeline's detail; the client never adds `pipelineId` to the canonical LP3 path. Stale completions cannot replace current detail state. Library label lookup accepts only matching project/catalog-version metadata and never issues LP3 directly.
- **Priority:** Critical
- **Risk Level:** Cross-pipeline data confusion or leakage
- **Automation suitability:** Full — service/component integration

### TC-BIC-008: Payload provenance and redaction boundaries are enforced

- **Related AC:** BackendIntegration_1 AC6; BackendIntegration_6 AC6
- **Traceability:** §10.1–§10.2; DoD 2
- **Pre-conditions:** BE capture manifest and FE synthetic fixture directory are available.
- **Role:** QA engineer
- **Steps:**
  1. Verify BE captures contain an OpenAPI commit/build identifier and only conforming successes/real errors.
  2. Verify malformed cases are labelled synthetic and are not presented as observed output.
  3. Scan both sets for bearer tokens, personal data, repository secrets and confidential URL query values.
- **Expected Result:** Provenance is unambiguous, malformed fixtures are FE-owned, and no sensitive value exists in versioned artifacts or test output.
- **Priority:** High
- **Risk Level:** False API evidence or secret disclosure
- **Automation suitability:** Partial — manifest/schema and secret scan automated; provenance review manual

## 4. Routing, lifecycle and read-state cases

### TC-BIC-009: Master feature flag OFF preserves baseline behavior

- **Related AC:** BackendIntegration_2 AC1; Frontend obligation 9
- **Traceability:** D14; all groups
- **Pre-conditions:** Clean browser storage; request observer installed; baseline behavior from `develop` is known.
- **Role:** Any project user
- **Steps:**
  1. Remove or set `show_ai_factory_poc` to its default OFF value and reload.
  2. Navigate Library, side panel, details and existing non-AI routes.
  3. Inspect requests, loaded chunks, navigation and controls.
- **Expected Result:** No AI Factory UI, live Pipeline/Quality Standard request, mock adapter or transport switch activates; existing behavior matches the baseline.
- **Priority:** Critical
- **Risk Level:** Feature leak/regression for all users
- **Automation suitability:** High — browser regression

### TC-BIC-010: Live groups switch independently while the Test Case overlay remains active

- **Related AC:** BackendIntegration_2 AC2–AC3, AC7
- **Traceability:** all G1–G8 transport groups
- **Pre-conditions:** Feature flag ON; per-group integration configuration implemented; overlay fixture available.
- **Role:** PoC operator
- **Steps:**
  1. Enable one live group and leave all other groups mocked.
  2. Exercise the enabled group and an unrelated mocked Pipeline/Test Case workflow.
  3. Repeat for reads, compare, settings, retry and QS1.
  4. Confirm no QS2–QS4 switch is available before G8 approval.
  5. Verify every enabled switch identifies exactly one §5.6 group and links that group's D-12 record.
- **Expected Result:** Only the selected group reaches live transport; unrelated handlers and the Test Case AI overlay continue to work; no global mock opt-out removes delivered behavior. A degradation approval from another group cannot activate the selected switch.
- **Priority:** Critical
- **Risk Level:** Cross-feature regression or accidental future-scope activation
- **Automation suitability:** Full — integration/browser matrix with one representative flow per group

### TC-BIC-011: Demo mocks cannot activate in production

- **Related AC:** BackendIntegration_2 AC4–AC5
- **Traceability:** current FE assumption in §4.2
- **Pre-conditions:** Development and production build configurations are available.
- **Role:** Build/test system
- **Steps:**
  1. Start a development build with the feature enabled and verify the repository-approved development guard.
  2. Build/run production with localStorage flags attempting to enable mocks/fixtures.
  3. Inspect loaded chunks and request interception.
- **Expected Result:** Development can install approved mocks; production contains no active demo adapter/fixture route and storage cannot activate it.
- **Priority:** Critical
- **Risk Level:** Demo data or interception in production
- **Automation suitability:** High — build smoke plus bundle/runtime assertion

### TC-BIC-012: Group rollback restores mocks without clearing unrelated user data

- **Related AC:** BackendIntegration_2 AC6; DoD 7
- **Traceability:** all rollout groups
- **Pre-conditions:** One approved live group is enabled; mock database and unrelated user preferences contain recognizable data.
- **Role:** PoC operator
- **Steps:**
  1. Use the live group and unrelated mocked/standard features.
  2. Apply the documented rollback value and reload if required.
  3. Re-run both workflows and inspect storage.
- **Expected Result:** The target group returns to mock transport, unrelated overlay/mocks/preferences remain intact, and stale live state does not masquerade as mock data.
- **Priority:** High
- **Risk Level:** Failed rollback or user-data loss
- **Automation suitability:** High — browser integration

### TC-BIC-013: Loading, empty and unavailable states are distinct

- **Related AC:** BackendIntegration_3 AC1
- **Traceability:** G1, G2, G7; QS-01
- **Pre-conditions:** Controllable responses for delayed success, empty array, QS1 no-standard and invalid payload.
- **Role:** Permitted project user
- **Steps:**
  1. Delay each read and observe initial loading.
  2. Return an empty Pipeline/iteration array.
  3. Return the agreed QS1 no-standard response.
  4. Return an invalid success payload.
- **Expected Result:** Loading, valid empty, no current standard and invalid/unavailable states have distinct non-misleading presentations; no state invents data or shows a generic success.
- **Priority:** High
- **Risk Level:** Misleading absence or broken screen
- **Automation suitability:** Full — component/browser

### TC-BIC-014: Read failures preserve stable, non-conflated behavior

- **Related AC:** BackendIntegration_3 AC1, AC3
- **Traceability:** EP-05 and the G1/G2/G3/G7 degraded cells
- **Pre-conditions:** Approved error contract plus degraded generic fallback for undocumented distinctions.
- **Role:** Permitted project user
- **Steps:**
  1. Return agreed forbidden, not-found, retryable server, offline/network and invalid-payload outcomes.
  2. Repeat with an error lacking a stable machine code.
  3. Invoke retry where allowed.
- **Expected Result:** Stable documented errors receive their distinct state. An undocumented distinction uses only the Product-approved generic failure state, never parses message text, and retry targets the failed resource.
- **Priority:** High
- **Risk Level:** Wrong remediation or permission disclosure
- **Automation suitability:** Full — service/component tests

### TC-BIC-015: One LP2 failure preserves healthy pipeline groups and retry isolation

- **Related AC:** BackendIntegration_3 AC2–AC3
- **Traceability:** EP-10; G1
- **Pre-conditions:** LP1 returns three pipelines; LP2 succeeds for two and fails for one.
- **Role:** Project user with Pipeline read permission
- **Steps:**
  1. Load the catalog and resolve the three LP2 requests with mixed outcomes.
  2. Verify rendered groups and state.
  3. Retry the failed group, then return success.
- **Expected Result:** Healthy groups remain visible and are not duplicated or refetched unnecessarily; only the failed group shows an inline error and retry; successful retry replaces that group's error.
- **Priority:** Critical
- **Risk Level:** One failure blanks all Pipeline data
- **Automation suitability:** Full — saga/service plus browser

### TC-BIC-016: Stale requests are cancelled or invalidated

- **Related AC:** BackendIntegration_3 AC4
- **Traceability:** G1–G3, G7
- **Pre-conditions:** Controllable delayed responses and cancellation instrumentation.
- **Role:** Permitted project user
- **Steps:**
  1. Start a read, then issue a newer request for the same state.
  2. Resolve the old request last.
  3. Repeat while changing route and while logging out.
- **Expected Result:** Old data never overwrites the newer result; route change/logout prevents stale state updates and user-facing error toasts caused solely by cancellation.
- **Priority:** High
- **Risk Level:** Cross-route or post-logout data exposure
- **Automation suitability:** Full — saga/service integration

### TC-BIC-017: Polling follows terminal, visibility and backoff rules

- **Related AC:** BackendIntegration_3 AC5
- **Traceability:** EP-07, D-03, D-06; G2, G5
- **Pre-conditions:** Approved terminal-state mapping, interval/backoff, rate-limit and `Retry-After` behavior.
- **Role:** Permitted project user
- **Steps:**
  1. Open a non-terminal iteration and advance fake time through polls.
  2. Hide the document, show it again, navigate away, log out and reach a terminal state in separate runs.
  3. Return retryable failure and `429` with `Retry-After`.
- **Expected Result:** Poll frequency follows D-06; polling pauses/stops for hidden, unmounted, logged-out or terminal states; backoff/`Retry-After` is respected; only one poll chain remains active.
- **Priority:** High
- **Risk Level:** Stale UI or API overload
- **Automation suitability:** Full — fake-timer service/component test plus one browser smoke

### TC-BIC-018: Generic detail never leaks mock-only rich values

- **Related AC:** BackendIntegration_3 AC6–AC7
- **Traceability:** IT-03, IT-04, IT-06, ST-03–ST-05; G2, D-12
- **Pre-conditions:** G2 degraded behavior is Product-approved; live payload omits rich detail and metrics remain opaque; old mock state contains recognizable values.
- **Role:** Project user with Pipeline read permission
- **Steps:**
  1. Visit a previously mocked detail, then switch G2 live and load a reduced LP3 payload.
  2. Inspect headers, stage panels, costs, tokens, links and per-case sections.
- **Expected Result:** Only validated stage identity/status and approved metadata render. Unsupported panels and token/cost/KPI values are unavailable or hidden exactly as approved; no stale/mock value is attributed to the backend.
- **Priority:** Critical
- **Risk Level:** Fabricated backend evidence
- **Automation suitability:** High — reducer/component/browser

### TC-BIC-019: G3 comparison is status-only, neutral and non-evaluative

- **Related AC:** BackendIntegration_3 AC6–AC8
- **Traceability:** IT-07, ST-03, IT-06, D-05, D-12; G3
- **Pre-conditions:** G3's degraded option and each omission are approved in D-12; LP4 valid, empty-delta and cross-pipeline fixtures exist.
- **Role:** Project user with compare permission
- **Steps:**
  1. Compare valid same-pipeline iterations containing statuses plus opaque metric/cost data.
  2. Inspect all visible values, labels, icons and colors.
  3. Repeat with empty delta, identity mismatch and cross-pipeline error.
- **Expected Result:** Only stage identity and current/previous status render. Metrics, deltas, costs and cost deltas are omitted; there is no better/worse wording, verdict, evaluative icon or traffic-light styling. Invalid comparisons fail closed.
- **Priority:** Critical
- **Risk Level:** Unsupported KPI interpretation
- **Automation suitability:** Full — adapter/component visual assertions

## 5. Security, authorization and mutation cases

### TC-BIC-020: Authenticated transport fails closed outside trusted HTTPS

- **Related AC:** BackendIntegration_6 AC1, AC6
- **Traceability:** EP-08, D-11; all live groups
- **Pre-conditions:** Approved HTTPS route and certificate; test configurations for HTTP, invalid certificate and unapproved HTTPS origin.
- **Role:** Authenticated test user
- **Steps:**
  1. Call an enabled group through the approved route.
  2. Attempt HTTP downgrade, invalid-certificate connection and unapproved-origin configuration.
  3. Inspect network requests, logs and error telemetry.
- **Expected Result:** Only trusted HTTPS succeeds with normal certificate validation. Unsafe configurations fail before a bearer token is sent; no log, fixture or screenshot contains the token or confidential query data.
- **Priority:** Critical
- **Risk Level:** Credential disclosure
- **Automation suitability:** Partial — policy tests automated; certificate/network smoke in integration environment

### TC-BIC-021: UI capability states match exact roles but server remains authoritative

- **Related AC:** BackendIntegration_4 AC1–AC3
- **Traceability:** EP-09, D-07; G4, G5
- **Pre-conditions:** D-07 is approved; accounts exist for Editor, Organization Manager, Instance Administrator and a denied identity.
- **Role:** Each listed role
- **Steps:**
  1. Inspect Pipeline settings, Retry, Re-run and any approved controls for each role.
  2. Manipulate the client to reveal or invoke a forbidden control.
  3. Send the same request directly to the API.
- **Expected Result:** Organization Manager/Instance Administrator receive only accepted Pipeline capabilities; Editor lacks settings/Retry/Re-run; client manipulation cannot bypass server authorization; forbidden requests return the agreed `403`.
- **Priority:** Critical
- **Risk Level:** Unauthorized mutation
- **Automation suitability:** High — role-based browser plus direct API suite

### TC-BIC-022: Project and nested-resource isolation deny ID enumeration

- **Related AC:** BackendIntegration_4 AC1–AC2
- **Traceability:** EP-02, EP-09; G1–G8
- **Pre-conditions:** Two projects/tenants with separate users and pipeline, iteration, stage and Quality Standard resources.
- **Role:** User authorized only for Project A
- **Steps:**
  1. Access Project A resources normally.
  2. Use Project A `projectKey` with Project B pipeline/iteration/stage IDs for each applicable operation.
  3. Use Project B `projectKey` directly and attempt read/mutation operations.
- **Expected Result:** All cross-project/resource combinations are denied according to the agreed non-enumerating error policy; no metadata or mutation leaks across projects.
- **Priority:** Critical
- **Risk Level:** Tenant/project data breach
- **Automation suitability:** Full — API security integration

### TC-BIC-023: Untrusted backend references cannot create unsafe navigation or HTML

- **Related AC:** BackendIntegration_6 AC2–AC5
- **Traceability:** ST-07, D-10; G2, G5
- **Pre-conditions:** Approved host/internal-route policy; fixtures cover HTTPS allowed/disallowed hosts, HTTP, protocol-relative, user-info credentials, `javascript:`, `data:`, malformed and dangerous relative paths.
- **Role:** Permitted project user
- **Steps:**
  1. Adapt and render each `resultRef`, `runUrl` and `triggeredRunUrl` fixture.
  2. Inspect DOM attributes and attempt navigation.
- **Expected Result:** Only approved HTTPS hosts and documented internal routes become links. Credentials, unsafe schemes/hosts/routes and malformed values remain escaped non-clickable text and are never injected as HTML.
- **Priority:** Critical
- **Risk Level:** XSS, phishing or credential leakage
- **Automation suitability:** Full — URL-policy unit plus DOM test

### TC-BIC-024: LP5 prevents lost updates and reconciles server state

- **Related AC:** BackendIntegration_4 AC4–AC5, AC9
- **Traceability:** EP-05, EP-06, PL-04, PL-05, D-08; G4
- **Pre-conditions:** G4 DoR complete; approved threshold, capability and version/ETag or conflict behavior.
- **Role:** Organization Manager or Instance Administrator
- **Steps:**
  1. Submit a valid settings change and verify the control is disabled in flight.
  2. Modify the same Pipeline from a second client, then submit stale data from the first.
  3. Return validation, conflict and forbidden outcomes in separate runs.
  4. Complete a successful mutation with a server-normalized value.
- **Expected Result:** Stale writes do not silently overwrite newer data; each error follows its stable code; success refetches/reconciles the stored server representation rather than assuming the request body.
- **Priority:** Critical
- **Risk Level:** Lost configuration or false success
- **Automation suitability:** High — API concurrency plus component integration

### TC-BIC-025: LP7 enforces eligibility, duplicate behavior and post-202 reconciliation

- **Related AC:** BackendIntegration_4 AC4, AC6, AC9
- **Traceability:** EP-06, EP-07, ST-06, ST-07, D-08; G5
- **Pre-conditions:** Retryable-state, permission, attempt identity and idempotency/conflict rules are approved.
- **Role:** Organization Manager or Instance Administrator
- **Steps:**
  1. Retry an eligible stage and double-submit while the first request is in flight.
  2. Retry an ineligible/terminal stage and a stage from another project.
  3. Return the approved duplicate/conflict and CI-provider failure outcomes.
  4. Complete `202`, then refresh/poll LP3.
- **Expected Result:** UI prevents accidental duplicate clicks and BE enforces the rule independently; no retry storm or unauthorized attempt is created; success is reconciled from refreshed server state; unsafe run URLs follow TC-BIC-023.
- **Priority:** Critical
- **Risk Level:** Duplicate CI work or unauthorized execution
- **Automation suitability:** High — API plus service/component integration

### TC-BIC-026: UI Re-run never calls unresolved LP6 ingestion

- **Related AC:** BackendIntegration_4 AC7–AC8
- **Traceability:** LP6-01, LP6-02, D-13; G6
- **Pre-conditions:** D-13 remains Open or defines LP6 as ingestion; network observer installed.
- **Role:** Organization Manager or Instance Administrator
- **Steps:**
  1. Open a live iteration and inspect Re-run/CI controls.
  2. Attempt invocation through visible UI, deep link and client-state manipulation.
  3. Inspect requests.
- **Expected Result:** Re-run is unavailable or explicitly blocked; the browser never calls LP6 to simulate execution. Existence of LP6/LP7 does not enable CI connection or Re-run controls.
- **Priority:** Critical
- **Risk Level:** Fabricated iteration or producer privilege exposure
- **Automation suitability:** Full — browser/network assertion

### TC-BIC-027: LP6 producer contract enforces identity, rerun invariants and idempotency

- **Related AC:** BackendIntegration_4 AC7, AC9
- **Traceability:** LP6-01–LP6-06, D-08, D-13; G6
- **Pre-conditions:** **Future/blocked** until G6 DoR; approved machine/interactive caller model, immutable pipeline identity or uniqueness rules, rerun invariants, idempotency and atomicity/timing.
- **Role:** Approved producer identity; denied interactive and cross-project identities
- **Steps:**
  1. Submit a valid first iteration and exact replay with the same idempotency identity.
  2. Reuse the key with a different body and submit duplicate/case-variant/renamed pipeline identity cases.
  3. Exercise every invalid `rerun`/`rerunOfIterationId` combination and cross-project/cross-pipeline source.
  4. Simulate partial processing failure and verify the agreed synchronous `201` or asynchronous `202` recovery model.
- **Expected Result:** Only the approved caller succeeds; exact replay is deterministic; conflicting replay and invalid relationships fail with stable codes; no orphan, duplicate or partially visible iteration is created; returned state is reconciled from the server.
- **Priority:** Critical
- **Risk Level:** Duplicate, misattached or partially persisted iterations
- **Automation suitability:** High — API contract/integration once unblocked

## 6. Quality Standard and governance cases

### TC-BIC-028: QS1 renders only the approved current-rubric subset

- **Related AC:** BackendIntegration_3 AC6–AC7; BackendIntegration_5 AC5
- **Traceability:** QS-01, QS-02, QS-07, D-12; G7
- **Pre-conditions:** G7 DoR; valid current standard without criterion descriptions; QS-02/QS-07 degraded behavior approved.
- **Role:** User with approved QS1 read permission
- **Steps:**
  1. Load minimum and representative full QS1 responses.
  2. Inspect standard/criterion labels, help text, timestamps and relation to any historical evaluation shown elsewhere.
- **Expected Result:** The UI shows only current standard name/top-level description and ordered criterion name/max points as validated. It labels the rubric current, invents no criterion description, hides timestamps with unknown units and never claims this rubric produced a historical score.
- **Priority:** Critical
- **Risk Level:** Misrepresented grading evidence
- **Automation suitability:** Full — adapter/component

### TC-BIC-029: QS1 distinguishes no standard, invalid standard and request failure

- **Related AC:** BackendIntegration_3 AC1
- **Traceability:** EP-05, QS-01; G7
- **Pre-conditions:** QS1 absence response/error is documented; fixtures include invalid invariant and generic unavailable fallback.
- **Role:** User with approved QS1 read permission
- **Steps:**
  1. Return the documented no-standard outcome.
  2. Return an invalid criterion/current-standard success payload.
  3. Return forbidden, retryable and undocumented generic errors.
- **Expected Result:** No-standard, invalid/unavailable, forbidden and retryable states follow the agreed distinctions; message text is not parsed; no current rubric is fabricated from defaults or historical evaluation data.
- **Priority:** High
- **Risk Level:** False standard or wrong remediation
- **Automation suitability:** Full

### TC-BIC-030: QS2–QS4 remain unreachable in current T6.2

- **Related AC:** BackendIntegration_2 AC2; BackendIntegration_4 AC10
- **Traceability:** D-14; G8
- **Pre-conditions:** Current T6.2 build with feature flag and any existing integration flags enabled.
- **Role:** Editor, Organization Manager and Instance Administrator
- **Steps:**
  1. Search navigation, menus, dialogs and transport configuration for Quality Standard management.
  2. Manipulate client routes/state to attempt opening management controls.
  3. Observe network traffic.
- **Expected Result:** No QS2–QS4 UI or active switch exists, and the frontend issues no management mutation. Published API availability alone does not introduce scope.
- **Priority:** Critical
- **Risk Level:** Unapproved destructive administration
- **Automation suitability:** High — browser and configuration test

### TC-BIC-031: Future Quality Standard management satisfies its complete contract

- **Related AC:** BackendIntegration_4 AC1–AC5, AC9–AC10
- **Traceability:** QS-04–QS-09, D-07, D-14; G8
- **Pre-conditions:** **Future/blocked** until a Product-approved story defines UX, permissions, scoring, audit, absence, concurrency and delete behavior.
- **Role:** Each approved and denied management role
- **Steps:**
  1. Verify create-versus-update branching uses the documented absence/status code.
  2. Exercise valid and invalid criteria, totals, names and sequences.
  3. Perform concurrent edits and delete/repeat-delete/referenced-delete scenarios.
  4. Verify direct API authorization, audit metadata/event and refetched state.
- **Expected Result:** Every G8 invariant and permission is server-enforced; no last-write loss occurs unless explicitly accepted; deletion preserves the agreed audit/history guarantees; the UI reconciles server state.
- **Priority:** Critical
- **Risk Level:** Rubric corruption or unauthorized deletion
- **Automation suitability:** High once unblocked — API plus browser

### TC-BIC-032: Historical grades retain an immutable rubric reference

- **Related AC:** BackendIntegration_5 AC1–AC5
- **Traceability:** QS-03, D-09; G9
- **Pre-conditions:** **Future/blocked** until immutable snapshot/version semantics and grading-result linkage are published.
- **Role:** Reviewer
- **Steps:**
  1. Grade against version A and record criterion identities, names, supported descriptions, maxima and order.
  2. Update the current standard to version B and inspect the old result.
  3. Delete/archive the current standard according to the approved rule and inspect the old result again.
  4. Attempt to mutate or resolve the old reference to a different project/version.
- **Expected Result:** Historical result always resolves immutable version A and remains auditable after update/delete. Until this contract exists, only the current rubric is shown and is never associated with the old score.
- **Priority:** Critical
- **Risk Level:** Irreproducible or misleading historical evaluation
- **Automation suitability:** High once unblocked — API/data integrity plus browser

### TC-BIC-033: Group readiness rejects missing blocker or degradation evidence

- **Related AC:** BackendIntegration_2 pre-condition; all requirements' applicable pre-conditions
- **Traceability:** §5.6, D-12, DoR 1–8; G1–G9
- **Pre-conditions:** A readiness record can be assembled for each group.
- **Role:** QA lead/Product approver
- **Steps:**
  1. For each G1–G9 row, map every listed blocker/decision and degraded item to its dated decision, owner and Jira/ADR/evidence link.
  2. Remove one blocker resolution, Product approval or QA scenario and repeat the readiness review.
  3. Verify unrelated future-group decisions are not incorrectly required.
- **Expected Result:** A group is Ready only when every applicable item is resolved and every degradation is individually approved with QA evidence. Missing or unlisted degradation blocks rollout; unrelated future blockers do not.
- **Priority:** Critical
- **Risk Level:** Premature or globally blocked rollout
- **Automation suitability:** Partial — link/status checks automated; approval semantics manual

### TC-BIC-034: Definition of Done is evidenced per group

- **Related AC:** All functional requirements
- **Traceability:** DoD 1–9; G1–G9
- **Pre-conditions:** Candidate group implementation and approved deployed API build are available.
- **Role:** QA lead
- **Steps:**
  1. Collect adapter, negative-fixture, HTTPS smoke, state, authorization, cancellation/polling, reference-security, switch and rollback results applicable to the group.
  2. Verify Product acceptance states whether the UI is full or degraded.
  3. Verify evidence names the deployed API build and documentation status updates occur only in the implementation task.
- **Expected Result:** No group is marked integrated without evidence for every applicable DoD item; excluded cases are justified by the group contract rather than silently omitted.
- **Priority:** High
- **Risk Level:** Unsupported completion claim
- **Automation suitability:** Partial — evidence aggregation automated; sign-off manual

### TC-BIC-035: Diagnostics are actionable and redact sensitive data

- **Related AC:** BackendIntegration_1 AC3; BackendIntegration_6 AC6
- **Traceability:** §10.1 item 11; all live groups
- **Pre-conditions:** Approved correlation header/field and diagnostic sink; failures for parsing, authorization, server and unsafe references.
- **Role:** QA engineer/support user
- **Steps:**
  1. Trigger each failure type and capture browser logs, notifications and telemetry.
  2. Search output for bearer tokens, full sensitive query strings, credentials and confidential payload fields.
  3. Verify operation/group, safe entity context, error category and correlation ID are available.
- **Expected Result:** Diagnostics support incident correlation without secrets or unsafe payloads; user messages are localized-safe and do not expose backend internals.
- **Priority:** High
- **Risk Level:** Secret leakage or untriageable failures
- **Automation suitability:** High — log/telemetry assertions plus manual observability smoke

### TC-BIC-036: CI connection runtime implementation is blocked until its contract is authoritative

- **Related AC:** BackendIntegration_4 AC1–AC4, AC8–AC9; BackendIntegration_6 AC1, AC6
- **Traceability:** EP-11; G10; [CIConnection_1–6](19-ci-connection-api-contract-request.md#4-functional-requirements-table)
- **Pre-conditions:** A candidate T3.6 implementation or rollout request exists.
- **Role:** QA lead / requirements owner
- **Steps:**
  1. Locate the merged source-of-truth contract under
     `reportportal-requirements/domains/projects/df_bootcamp_2026/contracts/` and its US-019 link.
  2. Compare the deployed trusted-HTTPS OpenAPI endpoint methods, paths, required DTO fields, write-only credential
     semantics, status/error/concurrency/idempotency rules and authorization matrix with that contract.
  3. Confirm the sanitized success/error payload pack and allowed/denied role plus two-project isolation accounts
     exist.
  4. Map every applicable TC-CIC-001–044 case from [19](19-ci-connection-api-contract-request.md) to automated or
     integration evidence.
  5. If any prerequisite is absent or contradictory, inspect the UI/network to confirm no CI connection runtime or
     dependent capability has been enabled from the proposal alone.
- **Expected Result:** T3.6 stays blocked until the requirements contract, deployed API and evidence agree. A proposal
  in `service-ui`, stage-level LP3/LP7 CI metadata, or LP6/LP7 availability cannot be used as proof of a CI connection
  contract. No placeholder/real credential appears in read payloads, logs or evidence.
- **Priority:** Critical
- **Risk Level:** Invented integration, credential leakage or unauthorized CI execution
- **Automation suitability:** Partial — schema/evidence comparison can be automated; requirements/security sign-off is
  manual

## 7. Cross-feature and exploratory coverage

### Cross-feature matrix

| Action | Downstream feature | Required check |
|---|---|---|
| Enable G1/G2 live | Test Case Library AI overlay | TC-BIC-010: overlay and lifecycle/review/fix-round mocks remain active |
| Change Pipeline transport | Feature-toggle OFF baseline | TC-BIC-009: no request/UI difference from baseline |
| LP3/LP4 identity mismatch | Project/route isolation | TC-BIC-007 and 022: never render another Pipeline/project |
| LP5 Auto-Ready update | Pipeline list/detail | TC-BIC-024: server state is refetched and reconciled |
| LP7 Retry | Detail polling and navigation | TC-BIC-017, 023 and 025: one poll chain, safe link, refreshed stage |
| QS1 read | Historical evaluation | TC-BIC-028 and 032: current rubric is never presented as historical evidence |
| Rollback a live group | Unrelated mock and user state | TC-BIC-012: no overlay/preference/mock-data loss |

### Exploratory charters

1. **Hybrid-state charter (45 min):** Rapidly switch G1/G2/G7 and routes while requests are delayed, offline or
   unauthorized; look for stale data, duplicate groups, cross-route flashes and mock/live attribution errors.
2. **Authorization charter (60 min):** Attempt ID substitution and direct calls across two projects with every approved
   role; look for metadata leakage, inconsistent `403` behavior and UI controls implying unavailable authority.
3. **Untrusted-data charter (45 min):** Mutate strings, maps, IDs, dates and references with long Unicode, control
   characters, dangerous schemes and prototype-like keys; look for HTML/navigation injection and layout failure.
4. **Polling/retry charter (45 min):** Combine tab hiding, logout, route changes, `429`, slow responses and repeated
   Retry clicks; look for orphan pollers, retry storms, duplicate toasts and state resurrection.

## 8. Known coverage gaps

- Live authenticated execution remains blocked until a trusted HTTPS target, approved accounts and deterministic data
  exist. Unit/component evidence cannot replace those integration checks.
- G6 cannot be executed until D-13 resolves whether LP6 is ingestion or a command and D-08 defines idempotency.
- G8 is deliberately out of current T6.2 scope; TC-BIC-031 is a future specification, not current coverage.
- G9 cannot be executed until the grading-result snapshot/version contract exists.
- G10 cannot be executed until the accepted requirements-repo CI connection contract, matching published API,
  trusted HTTPS target, sanitized payload pack and role/security fixtures exist. The `service-ui` proposal in 19 is
  not an implementation contract by itself.
- Performance thresholds beyond D-02/D-06, accessibility and visual parity belong to their feature/NFR suites; this
  contract suite checks only integration-specific behavior.

## Changelog

| Date | Change |
|---|---|
| 2026-10-02 | Initial risk-based suite for validated contract v1, covering BackendIntegration_1–6 and G1–G9. |
| 2026-10-05 | Added the G10 CI connection readiness gate and linked the detailed proposed TC-CIC-001–044 validation matrix without claiming a published or agreed API. |
