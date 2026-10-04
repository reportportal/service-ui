# 05 · Backend integration contract

> **Status: mixed live inventory and provisional frontend contract.** Pipeline and Quality Standard
> operations below are taken from the published OpenAPI document. Test-case lifecycle, review, fix-round,
> gate and automation contracts remain frontend proposals backed only where explicitly marked by mocks.
> A documented live operation is **not** the same as a frontend integration.

## 0. Sources, scope and status legend

- Audited on **2026-10-02** from [OpenAPI JSON](http://tms.epmrpp.reportportal.io/api/api-docs) and the
  [interactive API UI](http://tms.epmrpp.reportportal.io/ui/#organizations/my-organization/projects/superadmin-personal/api).
- Published document: OpenAPI `3.0.1`, `info.version = feature-pipelines-2767`, server `/api`.
- Global authentication: HTTP bearer token, `bearerFormat: JWT`. Every operation listed here inherits it.
- **Transport-security blocker:** the currently published documentation source is available over plain HTTP.
  Never send a bearer JWT to that origin. Live authenticated integration remains blocked until the backend is
  exposed through a trusted HTTPS endpoint with a valid certificate. Production integration must be HTTPS-only;
  certificate validation must not be disabled or bypassed.
- The audit inspected documentation only. It did **not** execute endpoint requests; in particular, no
  mutating `POST`, `PUT`, `PATCH` or `DELETE` operation was invoked.
- Live Pipeline timestamps use OpenAPI `string(date-time)`. Quality Standard `createdAt`/`updatedAt` are
  `int64`, but the document does not state their unit. The live Pipeline schemas expose no dedicated money
  fields; possible cost values live in open-ended `metrics`, so currency, precision and aggregation remain unknown.
- All live **response** schemas listed below omit JSON Schema `required`; consequently every response field,
  including array fields such as `stages`, `stageDeltas` and `criteria`, is formally optional and must be
  normalised defensively by an adapter.

Legend used in the board:

- **Live documented** — path and operation are present in the published OpenAPI.
- **Schema verified** — request/response schema was inspected in that same document.
- **Mock implemented** — the current PoC intercepts the legacy/mock contract, which may differ from the live DTO.
- **FE consumes live** — the application calls the live operation without the PoC mock owning that request.

### 0.1 Live Pipeline and Quality Standard inventory

All operations document common error responses `400`, `401`, `403`, `500` with the ReportPortal `ErrorRS`
shape (the `401` response is `string | ErrorRS`). The OpenAPI does not document `404` or `409` for these operations.
Every `{projectKey}` is a required string path parameter; `{pipelineId}`, `{iterationId}` and `{stageId}` are
required `int64` path parameters wherever present.

Every mutating `PATCH`, `POST`, `PUT`, `DELETE` and retry operation must enforce project and resource
authorization on the server and deny access by default. Frontend role checks, hidden controls and feature flags
are UX measures only and are never a security boundary. Exact permissions are not documented in this OpenAPI
and remain an open backend/product agreement.

| ID | Method and path below `/api` | Success | Live documented | Schema verified | Mock implemented | FE consumes live |
|---|---|---:|:---:|:---:|:---:|:---:|
| LP1 | `GET /v1/project/{projectKey}/pipeline` | `200 PipelineRS[]` | ✅ | ✅ | ⚠️ legacy P1 | ❌ |
| LP2 | `GET /v1/project/{projectKey}/pipeline/{pipelineId}/iteration` | `200 PipelineIterationSummaryRS[]` | ✅ | ✅ | ⚠️ legacy P2 | ❌ |
| LP3 | `GET /v1/project/{projectKey}/pipeline/iteration/{iterationId}` | `200 PipelineIterationDetailRS` | ✅ | ✅ | ⚠️ legacy P3 | ❌ |
| LP4 | `GET /v1/project/{projectKey}/pipeline/iteration/{iterationId}/compare?with={otherIterationId}` | `200 PipelineCompareRS` | ✅ | ✅ | ✅ same-path mock + raw-response adapter (T4.3 complete) | ❌ |
| LP5 | `PATCH /v1/project/{projectKey}/pipeline/{pipelineId}` | `200 PipelineRS` | ✅ | ✅ | ✅ same-path mock adapter; legacy P4 retained | ✅ T3.4 |
| LP6 | `POST /v1/project/{projectKey}/pipeline/iteration` | `201 PipelineIterationDetailRS` | ✅ | ✅ | ❌ | ❌ |
| LP7 | `POST /v1/project/{projectKey}/pipeline/iteration/{iterationId}/stage/{stageId}/retry` | `202 PipelineStageRetryRS` | ✅ | ✅ | ❌ | ❌ |
| QS1 | `GET /v1/project/{projectKey}/tms/quality-standard` | `200 TmsQualityStandardRS` | ✅ | ✅ | ❌ | ❌ |
| QS2 | `POST /v1/project/{projectKey}/tms/quality-standard` | `201 TmsQualityStandardRS` | ✅ | ✅ | ❌ | ❌ |
| QS3 | `PUT /v1/project/{projectKey}/tms/quality-standard` | `200 TmsQualityStandardRS` | ✅ | ✅ | ❌ | ❌ |
| QS4 | `DELETE /v1/project/{projectKey}/tms/quality-standard` | `200`, no response body schema | ✅ | ✅ | ❌ | ❌ |

### 0.2 Provisional test-case contract status

These operations are **not verified by the audited live OpenAPI**. “Mock” means only that the PoC implements
the proposed behavior locally; it must not be read as backend availability or integration.

| # | Provisional contract | Story | Mock | Live schema verified | FE consumes live |
|---|---|---|:---:|:---:|:---:|
| C1 | TestCase DTO extensions (list + details) | 007, 008 | ✅\* | ❌ | ❌ |
| C2 | `GET tms/test-case/{id}/ai` | 009, 010, 012, 017 | ✅ | ❌ | ❌ |
| C3 | List filters `lifecycle`, `ai`, `iterationId` + review-queue count | 008 | ❌ | ❌ | ❌ |
| L1 | `POST tms/test-case/{id}/lifecycle` | 013 | ✅ | ❌ | ❌ |
| L2 | `POST tms/test-case/lifecycle/batch` | 008, 013 | ✅ | ❌ | ❌ |
| L3 | Existing scenario update extensions and `promoteToReady` | 007, 013 | ✅\* | ❌ | ❌ |
| R1–R3 | Review comment read/create/delete/discard | 011 | ✅ | ❌ | ❌ |
| F1–F2 | Fix-round start/read | 012 | ✅ | ❌ | ❌ |
| G1–G2 | Ready-only gates and test-plan DTO extensions | 014 | ⚠️ FE guard + C1 mock data only | ❌ | ❌ |
| A1–A2 | Automation environment/start | 015 | ✅ | ❌ | ❌ |
| A3 | Test item `tmsTestCase` extension | 017 | ❌ | ❌ | ❌ |

\* Types and mock overlay/merge logic exist, but this is not evidence of a live backend contract.

---

## 1. Live raw DTOs (verified OpenAPI)

The following TypeScript-like notation mirrors OpenAPI requiredness. `?` is intentional for all response
properties because the response schemas declare no `required` list.

### 1.1 Shared Pipeline types

```ts
type LivePipelineStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'NEEDS_HUMAN';
type LiveCiProvider = 'GITHUB_ACTIONS' | 'GITLAB_CI';
type JsonObject = Record<string, object>; // OpenAPI additionalProperties: object
type StringMap = Record<string, string>;

interface PipelineStepResultRQ { resultType?: string; resultRef?: string }
interface PipelineStepResultRS { resultType?: string; resultRef?: string }

interface PipelineStageCiRQ {
  provider: LiveCiProvider;
  repo?: string;
  workflowRef?: string;
  runId?: string;
  jobId?: string;
  runUrl?: string;
  retryable?: boolean;
}
interface PipelineStageCiRS {
  provider?: LiveCiProvider;
  repo?: string;
  workflowRef?: string;
  runId?: string;
  jobId?: string;
  runUrl?: string;
  retryable?: boolean;
}
```

### 1.2 Create iteration and retry requests

```ts
interface PipelineIterationRQ {
  pipelineName: string;                 // required, minLength 1
  stages: PipelineStageRQ[];            // required, minItems 1
  trigger?: string;
  startedAt?: string;                   // date-time
  finishedAt?: string;                  // date-time
  rerun?: boolean;
  rerunOfIterationId?: number;          // int64
  metrics?: JsonObject;
  attributes?: StringMap;
}
interface PipelineStageRQ {
  stageKey: string;                     // required; no enum documented
  sequence: number;                     // required, int32
  status: LivePipelineStatus;           // required
  name?: string;
  shortName?: string;
  parentStageKey?: string;
  metrics?: JsonObject;
  attributes?: StringMap;
  result?: PipelineStepResultRQ;
  testCaseIds?: string[];
  ci?: PipelineStageCiRQ;               // if present, ci.provider is required
}
interface PipelineStageRetryRQ { comment?: string }
interface PipelineStageRetryRS {
  stageId?: number;                     // int64
  status?: LivePipelineStatus;
  triggeredRunUrl?: string;
}
```

`LP6` requires the request body. `LP7` documents the JSON request body but does not mark the body itself as
required; an empty body is therefore formally allowed by the specification.

`resultRef`, `runUrl` and `triggeredRunUrl` are untrusted response data. Before making any of them clickable,
the adapter must parse and validate the value, allow HTTPS URLs only, restrict external URLs to approved hosts,
and restrict internal links to approved application routes. Relative internal references are allowed only where
the contract explicitly defines them. Invalid or unapproved values must be rendered as non-clickable text;
the frontend must not bypass this validation or treat backend output as trusted markup/navigation.

### 1.3 Pipeline settings, list and iteration responses

```ts
interface PipelineSettingsRQ {
  autoReadyEnabled: boolean;            // required
  autoReadyThreshold?: number;          // int32; no min/max documented
}
interface LivePipelineRS {
  id?: number;                          // int64
  name?: string;
  description?: string;
  autoReadyEnabled?: boolean;
  autoReadyThreshold?: number;          // int32
  iterationsCount?: number;             // int64
  latestIteration?: PipelineIterationSummaryRS;
  createdAt?: string;                   // date-time
}
interface PipelineIterationSummaryRS {
  id?: number;                          // int64
  pipelineId?: number;                  // int64
  pipelineName?: string;
  iterationNumber?: number;             // int32
  status?: LivePipelineStatus;
  metrics?: JsonObject;
  attributes?: StringMap;
  trigger?: string;
  rerun?: boolean;
  rerunOfIterationId?: number;          // int64
  stagesCount?: number;                 // int32
  stages?: PipelineStageSummaryRS[];
  startedAt?: string;                   // date-time
  finishedAt?: string;                  // date-time
  durationMillis?: number;              // int64
  createdBy?: number;                   // int64
  createdAt?: string;                   // date-time
}
interface PipelineStageSummaryRS {
  id?: number;                          // int64
  stageKey?: string;
  name?: string;
  shortName?: string;
  sequence?: number;                    // int32
  parentStageId?: number;               // int64
  status?: LivePipelineStatus;
  metrics?: JsonObject;
}
```

`LP1` and `LP2` return plain arrays. The OpenAPI documents no `search`, `offset`, `limit`, sorting or page
wrapper for `LP2`.

### 1.4 Iteration detail and server comparison

```ts
interface PipelineIterationDetailRS {
  id?: number;                          // int64
  pipelineId?: number;                  // int64
  pipelineName?: string;
  iterationNumber?: number;             // int32
  status?: LivePipelineStatus;
  metrics?: JsonObject;
  trigger?: string;
  rerun?: boolean;
  rerunOfIterationId?: number;          // int64
  startedAt?: string;                   // date-time
  finishedAt?: string;                  // date-time
  durationMillis?: number;              // int64
  createdBy?: number;                   // int64
  createdAt?: string;                   // date-time
  attributes?: StringMap;
  stages?: PipelineStageRS[];
}
interface PipelineStageRS {
  id?: number;                          // int64
  stageKey?: string;
  name?: string;
  shortName?: string;
  sequence?: number;                    // int32
  parentStageId?: number;               // int64
  status?: LivePipelineStatus;
  metrics?: JsonObject;
  attributes?: StringMap;
  result?: PipelineStepResultRS;
  testCaseIds?: string[];
  ci?: PipelineStageCiRS;
  lastRetriedAt?: string;               // date-time
  lastRetriedBy?: number;               // int64
}
interface PipelineCompareRS {
  current?: PipelineIterationDetailRS;
  previous?: PipelineIterationDetailRS;
  stageDeltas?: PipelineStageDeltaRS[];
}
interface PipelineStageDeltaRS {
  stageKey?: string;
  current?: PipelineStageDeltaEntryRS;
  previous?: PipelineStageDeltaEntryRS;
}
interface PipelineStageDeltaEntryRS {
  status?: LivePipelineStatus;
  metrics?: JsonObject;
}
```

`LP3` is keyed by `iterationId` only; there is no `pipelineId` segment. `LP4` requires the query parameter
`with` (`int64`) and returns both iteration details plus per-stage current/previous entries.

### 1.5 Quality Standard requests and responses

```ts
interface TmsQualityStandardCriterionRQ {
  id?: number;                          // int64
  name: string;                        // required, minLength 1
  maxPoints: number;                   // required, int32, 1..100
  sequence: number;                    // required, int32; no min/max documented
}
interface TmsQualityStandardRQ {
  name: string;                        // required, minLength 1
  description?: string;
  criteria: TmsQualityStandardCriterionRQ[]; // required, minItems 1
}
interface TmsQualityStandardCriterionRS {
  id?: number;                          // int64
  name?: string;
  maxPoints?: number;                   // int32
  sequence?: number;                    // int32
}
interface TmsQualityStandardRS {
  id?: number;                          // int64
  name?: string;
  description?: string;
  criteria?: TmsQualityStandardCriterionRS[];
  createdAt?: number;                   // int64; unit unspecified
  updatedAt?: number;                   // int64; unit unspecified
}
```

`POST` and `PUT` require `TmsQualityStandardRQ`; `GET` has no body; `DELETE` documents no response body.
The OpenAPI does not state create/update/delete role permissions beyond possible `403`.

QS1 returns only the current project standard: top-level `name`/`description` and criteria with
`id`, `name`, `maxPoints` and `sequence`. It provides no per-criterion description, rubric version or immutable
snapshot reference, and no association between a historical test-case evaluation and the standard used to
produce it. It therefore supports only the current-rubric portion of T2.5, not reliable historical score detail.

## 2. Compatibility with the PoC mock contract and safe adoption

### 2.1 Material deltas from legacy P1–P4

| Area | Legacy/mock view model | Verified live contract | Required FE action |
|---|---|---|---|
| Namespace | `/tms/pipeline…` | `/pipeline…` | Change URL builders only when live integration is enabled. |
| Iteration detail | `/{pipelineId}/iteration/{iterationId}` | `/iteration/{iterationId}` | Remove `pipelineId` from the request path; retain it only for routing/context if useful. |
| Iteration list | `Page<IterationSummaryRS>` plus search/offset/limit | Plain `PipelineIterationSummaryRS[]`; no documented query parameters | Add client-side adaptation/paging or agree backend pagination before replacing the mock. |
| Status | UI-specific running/review/completed and stage variants | `PENDING | PASSED | FAILED | NEEDS_HUMAN` for iteration and stage | Map live status into existing presentation states; do not cast directly. |
| Settings | `GET/PUT .../{id}/settings`, `{ autoReady, threshold }` | `PATCH .../{pipelineId}`, `{ autoReadyEnabled, autoReadyThreshold? }` | Replace settings mutation through an adapter; no standalone live settings GET exists. |
| Compare | FE compares two details; optional proposal | Dedicated server `GET .../{iterationId}/compare?with=...` | T4.3 calls the exact live path through a raw-response adapter and validates the selected iteration/pipeline identities; the mock intercepts that path. Live metric keys and direction semantics remain unverified. |
| CI reporting | Reference-only proposal | Create iteration (`201`) and retry stage (`202`) are documented | Keep out of current read-only screens; use in T4.4 when its workflow is designed. |
| Rich UI fields | Typed fields for requirement, model, environment, cost, score, tokens, stage panels | Open-ended `metrics`/`attributes` and generic result/CI objects | Define and agree metric/attribute keys; adapt raw DTOs at one boundary. |

### 2.2 What can safely be used now

- **T1.1–T1.3:** the three live GET operations LP1–LP3 are integration candidates, but only behind a raw DTO
  adapter that provides defaults for optional fields and maps live statuses/metrics/attributes to current UI view models.
  They are not drop-in replacements for the mock endpoints.
- **T2.1/T2.2:** not covered. Pipeline and Quality Standard schemas contain no Test Case lifecycle, AI evaluation,
  origin, cost, unsent-comment or agent-fixing fields. C/L/R/F/A contracts remain provisional.
- **T2.5:** QS1 is a candidate for reading the current project rubric, but only partially supports the story:
  per-criterion descriptions, version/snapshot identity and historical evaluation association are absent. CRUD UI
  and permission behavior still require product scope and backend agreement before QS2–QS4 are consumed.
- **T3.4:** integrated through LP5 (`PATCH`) for Auto-Ready settings. The UI sends
  `{ autoReadyEnabled, autoReadyThreshold }`, ignores the mutation response, and refreshes the Pipeline list as the
  authoritative read-back. The same-path mock adapter keeps the PoC deterministic; production validation,
  authorization and concurrency semantics remain open in 12.
- **T4.3:** frontend PoC implementation is complete on EPMRPP-122034. It uses LP4 rather than fetching two details and
  assuming client-only comparison: the candidate is the path `{iterationId}`, the baseline is the required `with`
  query value, and the adapter rejects missing/mismatched iteration or pipeline identities before updating UI state.
  Rich demo data is accepted only when the response carries the private versioned marker
  `mock.kind = REPORTPORTAL_AI_FACTORY_COMPARE_DEMO` and `mock.version = 1`. Under that marker, the same-path mock
  supplies private `mockMetrics` containing `testCasesCount`, `suiteScore`, `readyCount`, `fixRoundsCount`,
  `costTotal`, `durationMs`, stage metric/cost/duration, all six criterion averages and the Auto-Ready promoted
  count. The marker and every `mockMetrics` field are PoC-private and are **not published LP4 fields**. An unmarked
  live LP4 response is therefore normalised as status-only and neutral: the frontend does not infer rich KPIs,
  costs, criterion averages, Auto-Ready counts or evaluative delta direction from opaque live `metrics`. BE-014 and
  BE-015 remain open; live KPI/cost deltas and evaluative colouring must not be signed off from mock evidence.
- **T4.4:** LP6 and LP7 provide the documented create-iteration and retry-stage operations; their user flow,
  permissions and error handling still need requirements.

### 2.3 Legacy/mock frontend enums and view models

The remainder of this document is retained as the current PoC view-model/provisional contract. It is useful
for existing UI behavior and mocks but must not be presented as the live raw DTO.

```ts
type Lifecycle = 'DRAFT' | 'READY';
type PipelineType = 'GENERATION' | 'AUTOMATION';
type IterationStatus = 'RUNNING' | 'IN_REVIEW' | 'COMPLETED' | 'FAILED';        // automation: RUNNING | COMPLETED | FAILED
type StageKey = 'CREATE' | 'GRADE' | 'UPLOAD' | 'REVIEW'                          // generation
              | 'PREPARE' | 'DEVELOP' | 'AUTOMATION_REVIEW' | 'FIX';            // automation
type StageStatus = 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED'
                 | 'IN_PROGRESS' | 'DONE';                                        // IN_PROGRESS/DONE only for REVIEW
type EvaluationState = 'EVALUATED' | 'OBSOLETE';
type CriterionKey = 'atomicity' | 'clear_steps' | 'expected_results'
                  | 'no_invented_logic' | 'no_invented_ui' | 'coherence';        // max 15/20/20/20/15/10
type CommentTargetType = 'PRECONDITION' | 'STEP' | 'TEXT_SCENARIO';
type CommentState = 'PENDING' | 'SENT' | 'ADDRESSED' | 'NOT_ADDRESSED';
type FixRoundStatus = 'RUNNING' | 'PASSED' | 'GRADE_FAILED' | 'FAILED';
type AutomationStatus = 'NOT_AUTOMATED' | 'IN_PROGRESS' | 'AUTOMATED' | 'FAILED';
type LifecycleReason = 'CREATED' | 'UPLOADED' | 'MIGRATED' | 'APPROVED' | 'MARKED_AS_READY'
  | 'APPROVED_WITH_CHANGES' | 'MARKED_AS_READY_WITH_CHANGES' | 'AUTO_READY'
  | 'SCENARIO_CHANGED' | 'AGENT_FIX';
type LifecycleRejectReason = 'NOT_DRAFT' | 'UNSENT_COMMENTS' | 'FIX_RUNNING'
  | 'EVALUATION_OBSOLETE_CONFIRM_REQUIRED' | 'NO_PERMISSION';
type SkipReason = 'NOT_READY' | 'AUTOMATION_IN_PROGRESS' | 'FIX_RUNNING' | 'UNSENT_COMMENTS'
  | 'ALREADY_READY';
```

### Legacy P1 `GET tms/pipeline` → mock `PipelineRS[]`

```ts
interface PipelineRS {
  id: number;
  type: PipelineType;
  name: string;
  repository: string;
  iterationsCount: number;
  settings?: PipelineSettingsRS;
}
interface PipelineSettingsRS { autoReady: boolean; threshold: number; editable: boolean; }
```

### Legacy P2 `GET tms/pipeline/{pipelineId}/iteration` → mock `Page<IterationSummaryRS>`

The mock accepts `search`, `offset` and `limit`, sorts by its seeded order and returns a page wrapper.

```ts
interface IterationSummaryRS {
  id: number;
  pipelineId: number;
  number: number;
  status: IterationStatus;
  requirement?: { specId: string; title: string; jiraKey?: string };
  testCases?: { id: number; displayId: string }[];
  trigger: string;
  startedBy: string;
  model: string;
  environment: string;
  startedAt: number;
  durationMs?: number;
  testCasesCount: number;
  suiteScore?: number;
  costTotal: number;
  readyCount?: number;
  fixRoundsCount?: number;
  launch?: { id: number; name: string; number: number };
  mergeRequest?: { id: string; url: string };
  ciPipeline: { id: string; url: string };
  attributes: { key: string; value: string }[];
  stages: StageSummaryRS[];
}
interface StageSummaryRS { key: StageKey; status: StageStatus; metric?: string; cost: number }
```

### Legacy P3 `GET tms/pipeline/{pipelineId}/iteration/{iterationId}` → mock `IterationRS`

```ts
interface IterationRS extends IterationSummaryRS {
  libraryFolder?: { id: number; path: string };
  autoReadyPromotedCount?: number;
  previousIterationId?: number;
  stages: StageRS[];
}
interface StageRS extends StageSummaryRS {
  startedAt?: number; durationMs?: number;
  ciJob?: { id: string; url: string };
  tokens: TokenUsageRS[];
  create?: { cases: { name: string; priority: string; testCaseId?: number; displayId?: string }[] };
  grade?: GradeDocumentRS;
  upload?: { results: { name: string; testCaseId?: number; displayId?: string;
                        result: 'CREATED_DRAFT' | 'CREATED_READY_AUTO' | 'FAILED'; reason?: string; score?: number }[];
             threshold: number };
  review?: { cases: { testCaseId: number; displayId: string; name: string; lifecycle: Lifecycle;
                      madeReadyBy?: string; madeReadyAt?: number; unsentComments: number;
                      currentScore?: number; evaluationState?: EvaluationState; fixRunning: boolean }[];
             fixRounds: FixRoundRS[] };
  perCase?: { testCaseId: number; displayId: string; name: string; status: StageStatus; result: string }[];
  failureReason?: string;
}
interface TokenUsageRS { model: string; input: number; cacheRead: number; cacheWrite: number; output: number; cost: number }
interface GradeDocumentRS {
  suiteScore: number; warnings: string[]; error?: string;
  cases: { name: string; testCaseId?: number; displayId?: string; totalScore: number;
           criteria: { key: CriterionKey; score: number; maxScore: number; failureReasons: string[] }[] }[];
}
```

### LP5 mock adapter and legacy P4 settings endpoint

T3.4 uses the live LP5 path and body in both modes. The mock maps
`{ autoReadyEnabled, autoReadyThreshold }` to the stable PoC settings view model, validates an integer threshold in
`0..100`, persists it and returns a live-shaped Pipeline response. The audited live OpenAPI does not publish
equivalent min/max constraints, so production semantics are still tracked as BE-016. Legacy P4 `GET | PUT
tms/pipeline/{pipelineId}/settings` remains available only for older mock consumers and is not used by T3.4.

## 3. Provisional Test Case extensions (US-007, 008, 009, 010)

### C1 — fields added to the existing TestCase DTO (list `tms/test-case`, details `tms/test-case/{id}`, plan test cases)

```ts
interface TestCaseAiExtension {
  lifecycle: Lifecycle;                                  // always present when the feature is on
  ai?: {                                                 // null/absent for manual cases
    generatedByIteration: { pipelineId: number; iterationId: number; number: number };
    modifiedByAgent: boolean;
    factoryKey: string;                                  // e.g. "spec_id::name"
  };
  evaluationSummary?: { totalScore: number; state: EvaluationState };
  costSummary?: { approxTotal: number };
  review?: { unsentCommentsCount: number; fixRound?: { number: number; status: 'RUNNING' } };
  automation?: { status: AutomationStatus };
  blockedPlans?: { id: number; name: string }[];         // plans this Draft case blocks (banner)
}
```

### C2 `GET tms/test-case/{id}/ai` → `TestCaseAiRS` (details page + side panel)

```ts
interface TestCaseAiRS {
  evaluation?: {
    totalScore: number; state: EvaluationState;
    source: { iterationId: number; iterationNumber: number; fixRound?: number };
    evaluatedAt: number;
    criteria: { key: CriterionKey; score: number; maxScore: number; failureReasons: string[] }[];
  };
  cost?: {
    approxTotal: number;
    iterationShare: { iterationNumber: number; amount: number; iterationBaseCost: number; casesCount: number };
    fixRounds: { round: number; amount: number }[];
    tokens: { input: number; cacheRead: number; cacheWrite: number; output: number };
    model: string;
  };
  pipelineLinks: { pipelineId: number; iterationId: number; iterationNumber: number; stage: StageKey; fixRound?: number }[];
  lastAgentChange?: {                                    // "What the agent changed", until the next round
    round: number; scoreBefore: number; scoreAfter?: number;
    before: ScenarioSnapshot; after: ScenarioSnapshot;
  };
  automation?: {
    status: AutomationStatus;
    iteration?: { pipelineId: number; iterationId: number; number: number };
    launch?: { id: number; name: string; number: number };
    lastResult?: { status: 'PASSED' | 'FAILED'; defectType?: string };
    scenarioChangedAfterAutomation: boolean;
  };
  lifecycleHistory: { from?: Lifecycle; to: Lifecycle; reason: LifecycleReason; details?: string;   // "93 ≥ 90", "Iteration #2", "Fix round 1"
                      actor: { type: 'USER' | 'AUTO_READY' | 'PIPELINE' | 'SYSTEM'; name: string }; at: number }[];
}
type ScenarioSnapshot = { precondition?: string; steps?: { position: number; instructions: string; expectedResult: string }[];
                          instructions?: string; expectedResult?: string };
```

### C3 — Library list filters

The existing `GET tms/test-case` / folder listing gets these parameters: `filter.eq.lifecycle=DRAFT|READY`,
`filter.eq.ai=true|false`, `filter.eq.iterationId=<id>` (AND with the existing priority/tags filters).
The review-queue counter comes from `GET tms/test-case/count?filter.eq.lifecycle=DRAFT&filter.eq.ai=true` or from the
list's `totalElements`. ❓ The parameter naming must follow the existing TMS filter convention (`filterSidePanel/utils.ts`).

## 4. Provisional Lifecycle contract (US-007, 013)

### L1 `POST tms/test-case/{id}/lifecycle`

Body `{ action: 'APPROVE' | 'MARK_AS_READY', confirmObsolete?: boolean }` → TestCase (with C1).
- `409 { reason: 'UNSENT_COMMENTS' | 'FIX_RUNNING' | 'NOT_DRAFT' }`
- `409 { reason: 'EVALUATION_OBSOLETE_CONFIRM_REQUIRED' }` → the FE shows "The evaluation is obsolete. Approve anyway?" and retries with `confirmObsolete: true`.

### L2 `POST tms/test-case/lifecycle/batch`

Body `{ testCaseIds: number[] }` → `{ updated: { id: number; reason: 'APPROVED' | 'MARKED_AS_READY' }[]; skipped: { id: number; displayId: string; reason: SkipReason }[] }`.
Obsolete evaluations in bulk are approved without confirmation. ❓ Q-BA-06

### L3 — scenario edit (existing `PUT tms/test-case/{id}` / scenario update)

- The BE detects changes to precondition, steps, instructions or expected results. It then sets `lifecycle = DRAFT` (when READY), sets
  `evaluation.state = OBSOLETE`, sets `automation.scenarioChangedAfterAutomation = true` and adds a history entry `SCENARIO_CHANGED`.
- The optional body flag `promoteToReady: true` ("Approve / Mark as ready along with these changes") saves the change and
  sets READY in one transaction, with the same blocks as L1. The response includes `lifecycleChanged: 'TO_DRAFT' | 'TO_READY' | null`
  so the FE can show the right toast.

## 5. Provisional Review comments contract (US-011)

### R1 `GET | POST tms/test-case/{id}/review-comment`

```ts
interface ReviewCommentRS {
  id: number;
  target: { type: CommentTargetType; stepId?: number };  // stepId for STEP
  text: string;
  author: { id: number; name: string };
  createdAt: number;
  state: CommentState;
  fixRound?: number;                                      // when SENT/ADDRESSED/NOT_ADDRESSED
  reason?: string;                                        // agent explanation when NOT_ADDRESSED
  canDelete: boolean;                                     // own + PENDING
}
```
`POST` body `{ target, text }` → `ReviewCommentRS`. Comments are allowed on AI cases only (manual → 400) and not while a fix is running (409 `FIX_RUNNING`).

### R2 `DELETE …/review-comment/{commentId}`: own PENDING only (403 otherwise).

### R3 `DELETE …/review-comment?state=PENDING`: Discard comments. Deletes all unsent comments of the case.

## 6. Provisional Fix rounds / Push to agent contract (US-012)

### F1 `POST tms/test-case/{id}/fix-round` → `202 FixRoundRS` (status RUNNING)

- `409 { reason: 'NO_UNSENT_COMMENTS' | 'FIX_RUNNING' }`
- `502 { reason: 'JOB_START_FAILED', message }`: no round is recorded and the comments stay PENDING.

### F2 `GET tms/test-case/{id}/fix-round` → `FixRoundRS[]` (the FE polls while one is RUNNING)

```ts
interface FixRoundRS {
  round: number;                        // per case, starts at 1
  testCaseId: number; displayId: string;
  status: FixRoundStatus;
  pushedBy: string; pushedAt: number; finishedAt?: number;
  commentsCount: number;
  scoreBefore?: number; scoreAfter?: number;
  cost?: number; tokens?: TokenUsageRS[];
  failureReason?: string;               // "job timeout"
  autoReadyPromoted?: boolean;
}
```
Outcomes the FE must render: PASSED (case updated, Draft, new evaluation, Auto-Ready maybe), GRADE_FAILED
("Fixed · Grade failed", previous evaluation Obsolete) and FAILED (case unchanged, comments back to PENDING).

## 7. Provisional Ready-only gate contract (US-014)

- G1: the existing add-to-test-plan and add-to-launch endpoints (single + batch) reject Draft cases:
  single → `409 { reason: 'NOT_READY' }`; batch → `{ added: [...], skipped: [{ id, reason: 'NOT_READY' }] }`.
  ❓ The current batch responses need a `skipped` part. The FE also pre-filters, so this rule is defence in depth.
- G2: the test plan DTO adds `draftTestCasesCount: number`, `draftTestCases: { id: number; displayId: string }[]`
  and `launchBlocked: boolean`. The compact Draft references are required because the banner links every blocked
  case while the regular plan-case collection is paginated. Plan test-case rows carry `lifecycle` (C1). Launching
  a plan with Draft cases → `409 { reason: 'PLAN_HAS_DRAFT_CASES', testCaseIds }`.

T4.1 now implements the feature-flagged FE guard: single Draft actions are disabled, mixed bulk requests are
pre-filtered to Ready IDs with named skip feedback, and C1 `blockedPlans` renders the case-level blocked banner.
This is UX enforcement only; live G1 rejection and a backend-returned batch `skipped` result remain required.

T4.2 consumes G2 on the Test Plan page: it renders the blocked banner and links, disables whole-plan Launch,
and reuses C1 for Draft row badges. The mock overlay supplies G2 and enriches Test Plan case-list rows. Until
the live G2 contract lands, loaded C1 rows are a safe fallback but cannot prove that an off-page Draft does not
exist; the fallback is UX-only and the backend 409 remains mandatory authorization and integrity enforcement.

## 8. Provisional Automation contract (US-015, 016, 017)

**Frontend standing (2026-10-04):** T5.1 consumes A1/A2 through strict response normalizers and the AI Factory
mock overlay. The feature-gated details, section and bulk entry points make no A1/A2 request when the flag is
off. This is not live integration: A1/A2 are absent from the audited published OpenAPI and remain provisional
until backend paths, schemas, authorization and error semantics are published and verified.

- A1 `GET tms/automation/environment` → `{ environments: string[]; default: string }` (default `beta5`).
- A2 `POST tms/automation` body `{ testCaseIds: number[]; environment: string; confirmReautomate: boolean }` →
  `202 { iteration: { pipelineId, iterationId, number }; accepted: number[]; skipped: { id, displayId, reason: SkipReason }[] }`;
  `409 { reason: 'ALREADY_AUTOMATED_CONFIRM_REQUIRED', testCaseIds }` when `confirmReautomate` is false;
  `502 { reason: 'JOB_START_FAILED' }`.
  The FE computes the skip lists for the dialog from C1 fields. The BE re-validates.
- A3: the test item DTO (Launch pages) adds `tmsTestCase?: { id: number; displayId: string }` when the reported
  `testCaseId` matches a Library case. It powers the "Library Test Case ↗" link.
- The Launch carries the attribute `pipeline:<iteration>`, so the FE can render a link to the automation iteration.

## 9. Not consumed by the FE (reference only)

- X1 CI → RP iteration/stage creation now has a verified entry point in LP6, but the richer proposed reporting
  of a grade document (validated against `grade.schema.json`),
  token usage; idempotency key = CI pipeline id + pipeline name (US-001). Also the upload of cases with
  lifecycle, AI marker, evaluation, cost and factory key, and an update mode keyed by the factory key (US-006, F8)
  are not explicit fields in the verified schema and remain provisional.
- X2 RP → GitLab trigger for the fix job and the automation job (F12).

## Changelog

| Date | Change | Agreed with |
|------|--------|-------------|
| 2026-10-02 | v0.2 audited published Pipeline and Quality Standard OpenAPI; separated verified raw DTOs from legacy/mock and provisional contracts; no endpoint calls executed | Published OpenAPI `feature-pipelines-2767` (documentation evidence only) |
| 2026-09-25 | v0.1 initial FE proposal | — |
