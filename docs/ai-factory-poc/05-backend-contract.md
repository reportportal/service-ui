# 05 · Backend integration contract (FE proposal)

> **Status: DRAFT proposal from the frontend.** It is not agreed with BE yet (open ask **F8**, owners
> Hleb / Vadim). The UI mocks implement exactly this contract, so every change agreed with BE
> must be applied **here first**, then to `types/aiFactory.ts` and the mock handlers.
> Record each change in the changelog at the bottom.

- Base: `/api/v1/project/{projectKey}` (the same as the existing TMS endpoints in `common/urls.js`).
- Proposed namespace for new resources: `tms/pipeline…`, `tms/test-case/{id}/…`, `tms/automation…`.
- Errors use the existing RP format `{ errorCode: number, message: string }`. Business rejections use
  **409** with a machine `reason` field (see the enums).
- Timestamps are epoch ms (like existing TMS DTOs). Money is `number` in USD with 2+ decimals, **estimated by the pipeline**.
  RP never recalculates it.

## 0. Integration status board

Update this table when an endpoint moves. Legend: 🟡 mocked · 🔵 BE in progress · 🟢 integrated · ⚪ not needed by FE

| # | Endpoint | Story | Mock | BE | FE integrated |
|---|----------|-------|------|----|---------------|
| P1 | `GET tms/pipeline` | 002 | 🟡 | ☐ | ☐ |
| P2 | `GET tms/pipeline/{pipelineId}/iteration` | 002 | 🟡 | ☐ | ☐ |
| P3 | `GET tms/pipeline/{pipelineId}/iteration/{iterationId}` | 003, 016 | 🟡 | ☐ | ☐ |
| P4 | `GET/PUT tms/pipeline/{pipelineId}/settings` | 005 | 🟡 | ☐ | ☐ |
| C1 | TestCase DTO extensions (list + details) | 007, 008 | 🟡\* | ☐ | ☐ |
| C2 | `GET tms/test-case/{id}/ai` | 009, 010, 012, 017 | 🟡 | ☐ | ☐ |
| C3 | List filters `lifecycle`, `ai`, `iterationId` + review-queue count | 008 | ☐ | ☐ | ☐ |
| L1 | `POST tms/test-case/{id}/lifecycle` | 013 | 🟡 | ☐ | ☐ |
| L2 | `POST tms/test-case/lifecycle/batch` | 008, 013 | 🟡 | ☐ | ☐ |
| L3 | Scenario edit → Draft / Obsolete (existing `PUT tms/test-case/{id}`) + `promoteToReady` | 007, 013 | 🟡\* | ☐ | ☐ |
| R1 | `GET/POST tms/test-case/{id}/review-comment` | 011 | 🟡 | ☐ | ☐ |
| R2 | `DELETE tms/test-case/{id}/review-comment/{commentId}` | 011 | 🟡 | ☐ | ☐ |
| R3 | `DELETE tms/test-case/{id}/review-comment?state=PENDING` (discard) | 011 | 🟡 | ☐ | ☐ |
| F1 | `POST tms/test-case/{id}/fix-round` (Push to agent) | 012 | 🟡 | ☐ | ☐ |
| F2 | `GET tms/test-case/{id}/fix-round` | 012 | 🟡 | ☐ | ☐ |
| G1 | Ready-only gate on add-to-plan / add-to-launch (single + batch) | 014 | ☐ | ☐ | ☐ |
| G2 | Test plan DTO: `draftTestCasesCount`, `launchBlocked` | 014 | ☐ | ☐ | ☐ |
| A1 | `GET tms/automation/environment` | 015 | 🟡 | ☐ | ☐ |
| A2 | `POST tms/automation` | 015 | 🟡 | ☐ | ☐ |
| A3 | Test item DTO: `tmsTestCase { id, displayId }` | 017 | ☐ | ☐ | ☐ |
| X1 | CI → RP reporting (iteration, stages, grade doc, tokens) | 001, 006, 016 | ⚪ | ☐ | ⚪ |
| X2 | RP → GitLab trigger (fix job, automation job) | 012, 015 | ⚪ | ☐ | ⚪ |

\* Types exist and the DTO fields/merge logic are implemented (`overlay.ts`), but exercising them
end-to-end needs real AI-marked cases in a project, which needs Q-ORG-07 answered first (mock
seeding writes to a shared dev backend). C3, G1, G2 and A3 are the same story: the shape is typed
but nothing yet calls it, since they extend endpoints the mock doesn't own (Library filters, plan
gate, launch test items).

---

## 1. Enums

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
type CommentState = 'PENDING' | 'SENT' | 'ADDRESSED';
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

## 2. Pipelines (US-002, 003, 004, 005, 016)

### P1 `GET tms/pipeline` → `PipelineRS[]`
```ts
interface PipelineRS {
  id: number;
  type: PipelineType;
  name: string;                    // "Test case generation" | "Test automation"
  repository: string;              // "EPM-RPP/rp-tests"
  iterationsCount: number;
  settings?: PipelineSettingsRS;   // GENERATION only
}
interface PipelineSettingsRS { autoReady: boolean; threshold: number; /* 0..100, default 90 */ editable: boolean; }
```

### P2 `GET tms/pipeline/{pipelineId}/iteration?search=&offset=&limit=` → `Page<IterationSummaryRS>`
Sorted by `number` desc. `search` matches requirement spec id and title, `#N`, and the pipeline name.
```ts
interface IterationSummaryRS {
  id: number;
  pipelineId: number;
  number: number;                               // "Iteration #N"
  status: IterationStatus;
  requirement?: { specId: string; title: string; jiraKey?: string };   // GENERATION
  testCases?: { id: number; displayId: string }[];                      // AUTOMATION
  trigger: string;                              // "Web form · REQUIREMENT", "Automate · Test Case Library"
  startedBy: string;
  model: string;
  environment: string;
  startedAt: number;
  durationMs?: number;                          // absent while running
  testCasesCount: number;
  suiteScore?: number;                          // GENERATION, when Grade PASSED
  costTotal: number;                            // incl. fix rounds
  readyCount?: number;                          // GENERATION
  fixRoundsCount?: number;                      // GENERATION
  launch?: { id: number; name: string; number: number };  // AUTOMATION
  mergeRequest?: { id: string; url: string };             // AUTOMATION
  ciPipeline: { id: string; url: string };
  attributes: { key: string; value: string }[];           // env, spec, jira, ci, mr, folder
  stages: StageSummaryRS[];                               // ordered
}
interface StageSummaryRS { key: StageKey; status: StageStatus; metric?: string; /* "4 cases", "83", "4 ↑", "2/4 Ready" */ cost: number; }
```
❓ The `metric` string is pre-formatted by the BE or built by the FE from numbers. **FE preference: numbers**
(`casesCreated`, `suiteScore`, `casesUploaded`, `readyCount/total`) so the FE can localise them.

### P3 `GET tms/pipeline/{pipelineId}/iteration/{iterationId}` → `IterationRS`
```ts
interface IterationRS extends IterationSummaryRS {
  libraryFolder?: { id: number; path: string };          // GENERATION
  autoReadyPromotedCount?: number;
  previousIterationId?: number;                          // for "Compare with previous"
  stages: StageRS[];
}
interface StageRS extends StageSummaryRS {
  startedAt?: number; durationMs?: number;
  ciJob?: { id: string; url: string };
  tokens: TokenUsageRS[];                                // per model
  create?: { cases: { name: string; priority: string; testCaseId?: number; displayId?: string }[] };
  grade?: GradeDocumentRS;                               // as produced by the grader (grade.schema.json)
  upload?: { results: { name: string; testCaseId?: number; displayId?: string;
                        result: 'CREATED_DRAFT' | 'CREATED_READY_AUTO' | 'FAILED'; reason?: string; score?: number }[];
             threshold: number };
  review?: { cases: { testCaseId: number; displayId: string; name: string; lifecycle: Lifecycle;
                      madeReadyBy?: string; madeReadyAt?: number; unsentComments: number;
                      currentScore?: number; evaluationState?: EvaluationState; fixRunning: boolean }[];
             fixRounds: FixRoundRS[] };
  perCase?: { testCaseId: number; displayId: string; name: string; status: StageStatus; result: string }[];  // AUTOMATION stages
  failureReason?: string;
}
interface TokenUsageRS { model: string; input: number; cacheRead: number; cacheWrite: number; output: number; cost: number; }
interface GradeDocumentRS {
  suiteScore: number; warnings: string[]; error?: string;
  cases: { name: string; testCaseId?: number; displayId?: string; totalScore: number;
           criteria: { key: CriterionKey; score: number; maxScore: number; failureReasons: string[] }[] }[];
}
```
**Compare (US-004)** is computed on the FE from two `IterationRS` of the same pipeline, so no endpoint is needed.
Criteria averages come from `grade.cases[].criteria`. If the BE prefers a server-side compare, use
`GET …/iteration/compare?baseline=&candidate=`.

### P4 `GET | PUT tms/pipeline/{pipelineId}/settings`
`PUT` body `{ autoReady: boolean, threshold: number }` → `PipelineSettingsRS`.
It returns 400 when the threshold is not an integer in 0..100 (FE message: "Threshold must be a whole number from 0 to 100")
and 403 without permission. The change is written to project activity.

## 3. Test Case extensions (US-007, 008, 009, 010)

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

## 4. Lifecycle (US-007, 013)

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

## 5. Review comments (US-011)

### R1 `GET | POST tms/test-case/{id}/review-comment`
```ts
interface ReviewCommentRS {
  id: number;
  target: { type: CommentTargetType; stepId?: number };  // stepId for STEP
  text: string;
  author: { id: number; name: string };
  createdAt: number;
  state: CommentState;
  fixRound?: number;                                      // when SENT/ADDRESSED
  canDelete: boolean;                                     // own + PENDING
}
```
`POST` body `{ target, text }` → `ReviewCommentRS`. Comments are allowed on AI cases only (manual → 400) and not while a fix is running (409 `FIX_RUNNING`).

### R2 `DELETE …/review-comment/{commentId}`: own PENDING only (403 otherwise).
### R3 `DELETE …/review-comment?state=PENDING`: Discard comments. Deletes all unsent comments of the case.

## 6. Fix rounds / Push to agent (US-012)

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

## 7. Ready-only gate (US-014)

- G1: the existing add-to-test-plan and add-to-launch endpoints (single + batch) reject Draft cases:
  single → `409 { reason: 'NOT_READY' }`; batch → `{ added: [...], skipped: [{ id, reason: 'NOT_READY' }] }`.
  ❓ The current batch responses need a `skipped` part. The FE also pre-filters, so this rule is defence in depth.
- G2: the test plan DTO adds `draftTestCasesCount: number` and `launchBlocked: boolean`. Plan test-case rows carry
  `lifecycle` (C1). Launching a plan with Draft cases → `409 { reason: 'PLAN_HAS_DRAFT_CASES', testCaseIds }`.

## 8. Automation (US-015, 016, 017)

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
- X1 CI → RP reporting of iterations, stages, grade document (validated against `grade.schema.json`),
  token usage; idempotency key = CI pipeline id + pipeline name (US-001). Also the upload of cases with
  lifecycle, AI marker, evaluation, cost and factory key, and an update mode keyed by the factory key (US-006, F8).
- X2 RP → GitLab trigger for the fix job and the automation job (F12).

## Changelog
| Date | Change | Agreed with |
|------|--------|-------------|
| 2026-09-25 | v0.1 initial FE proposal | — |
