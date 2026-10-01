/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * AI Factory · DF Bootcamp 2026 PoC — domain and DTO types (Jira epic EPMRPP-118192).
 *
 * These types mirror `docs/ai-factory-poc/05-backend-contract.md` 1:1, section by section.
 * The contract is a DRAFT proposed by the frontend, not agreed with backend yet (open ask F8).
 * When it changes: update the doc first, then this file, then the mock handlers
 * (`controllers/aiFactory/mocks`, added in T0.5).
 *
 * Naming, following `controllers/milestone/constants.ts` (`MilestoneStatus` / `TmsMilestoneStatus`):
 * - a short `enum` for referencing named values in code (`Lifecycle.DRAFT`);
 * - an `Ai`-prefixed `${Enum}` string-literal alias for typing DTO fields, so a value parsed
 *   straight from JSON satisfies the type without a cast;
 * - `*RS` for a server response shape, `*Payload` for a request body.
 *
 * Money is `number` (USD, estimated by the pipeline — RP never recalculates it in the PoC).
 * Timestamps are epoch ms, like the existing TMS DTOs.
 */

import { EntityWithDisplayId, Page } from 'types/common';

/* ------------------------------------------------------------------------------------------ *
 * 1 · Enums (05 §1)
 * ------------------------------------------------------------------------------------------ */

export enum Lifecycle {
  DRAFT = 'DRAFT',
  READY = 'READY',
}
export type AiLifecycle = `${Lifecycle}`;

export enum PipelineType {
  GENERATION = 'GENERATION',
  AUTOMATION = 'AUTOMATION',
}
export type AiPipelineType = `${PipelineType}`;

export enum IterationStatus {
  RUNNING = 'RUNNING',
  IN_REVIEW = 'IN_REVIEW', // generation only
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
export type AiIterationStatus = `${IterationStatus}`;

export enum StageKey {
  // generation
  CREATE = 'CREATE',
  GRADE = 'GRADE',
  UPLOAD = 'UPLOAD',
  REVIEW = 'REVIEW',
  // automation
  PREPARE = 'PREPARE',
  DEVELOP = 'DEVELOP',
  AUTOMATION_REVIEW = 'AUTOMATION_REVIEW',
  FIX = 'FIX',
}
export type AiStageKey = `${StageKey}`;

export enum StageStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  // Review stage only, shown as "In progress" / "Done" (never Passed/Failed)
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
export type AiStageStatus = `${StageStatus}`;

export enum EvaluationState {
  EVALUATED = 'EVALUATED',
  OBSOLETE = 'OBSOLETE',
}
export type AiEvaluationState = `${EvaluationState}`;

/** Fixed order, max score 15/20/20/20/15/10 — see docs/ai-factory-poc/01-knowledge-base.md §4.5. */
export enum CriterionKey {
  ATOMICITY = 'atomicity',
  CLEAR_STEPS = 'clear_steps',
  EXPECTED_RESULTS = 'expected_results',
  NO_INVENTED_LOGIC = 'no_invented_logic',
  NO_INVENTED_UI = 'no_invented_ui',
  COHERENCE = 'coherence',
}
export type AiCriterionKey = `${CriterionKey}`;

export enum CommentTargetType {
  PRECONDITION = 'PRECONDITION',
  STEP = 'STEP',
  TEXT_SCENARIO = 'TEXT_SCENARIO',
}
export type AiCommentTargetType = `${CommentTargetType}`;

export enum CommentState {
  PENDING = 'PENDING',
  SENT = 'SENT',
  ADDRESSED = 'ADDRESSED',
}
export type AiCommentState = `${CommentState}`;

export enum FixRoundStatus {
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  GRADE_FAILED = 'GRADE_FAILED',
  FAILED = 'FAILED',
}
export type AiFixRoundStatus = `${FixRoundStatus}`;

export enum AutomationStatus {
  NOT_AUTOMATED = 'NOT_AUTOMATED',
  IN_PROGRESS = 'IN_PROGRESS',
  AUTOMATED = 'AUTOMATED',
  FAILED = 'FAILED',
}
export type AiAutomationStatus = `${AutomationStatus}`;

export enum LifecycleReason {
  CREATED = 'CREATED',
  UPLOADED = 'UPLOADED',
  MIGRATED = 'MIGRATED',
  APPROVED = 'APPROVED',
  MARKED_AS_READY = 'MARKED_AS_READY',
  APPROVED_WITH_CHANGES = 'APPROVED_WITH_CHANGES',
  MARKED_AS_READY_WITH_CHANGES = 'MARKED_AS_READY_WITH_CHANGES',
  AUTO_READY = 'AUTO_READY',
  SCENARIO_CHANGED = 'SCENARIO_CHANGED',
  AGENT_FIX = 'AGENT_FIX',
}
export type AiLifecycleReason = `${LifecycleReason}`;

export enum LifecycleActorType {
  USER = 'USER',
  AUTO_READY = 'AUTO_READY',
  PIPELINE = 'PIPELINE',
  SYSTEM = 'SYSTEM',
}
export type AiLifecycleActorType = `${LifecycleActorType}`;

export enum LifecycleRejectReason {
  NOT_DRAFT = 'NOT_DRAFT',
  UNSENT_COMMENTS = 'UNSENT_COMMENTS',
  FIX_RUNNING = 'FIX_RUNNING',
  EVALUATION_OBSOLETE_CONFIRM_REQUIRED = 'EVALUATION_OBSOLETE_CONFIRM_REQUIRED',
  NO_PERMISSION = 'NO_PERMISSION',
}
export type AiLifecycleRejectReason = `${LifecycleRejectReason}`;

export enum SkipReason {
  NOT_READY = 'NOT_READY',
  AUTOMATION_IN_PROGRESS = 'AUTOMATION_IN_PROGRESS',
  FIX_RUNNING = 'FIX_RUNNING',
  UNSENT_COMMENTS = 'UNSENT_COMMENTS',
  ALREADY_READY = 'ALREADY_READY',
}
export type AiSkipReason = `${SkipReason}`;

/* ------------------------------------------------------------------------------------------ *
 * 2 · Pipelines — US-002, 003, 004, 005, 016 (05 §2)
 * ------------------------------------------------------------------------------------------ */

export interface PipelineSettingsRS {
  autoReady: boolean;
  threshold: number; // whole number 0..100, default 90
  editable: boolean;
}

export interface PipelineRS {
  id: number;
  type: AiPipelineType;
  name: string; // "Test case generation" | "Test automation"
  repository: string; // "EPM-RPP/rp-tests"
  iterationsCount: number;
  settings?: PipelineSettingsRS; // GENERATION only
}

export interface AttributeRS {
  key: string;
  value: string;
}

export interface CiLinkRS {
  id: string;
  url: string;
}

export interface TokenUsageRS {
  model: string;
  input: number;
  cacheRead: number;
  cacheWrite: number;
  output: number;
  cost: number;
}

export interface StageSummaryRS {
  key: AiStageKey;
  status: AiStageStatus;
  /** Numbers, not pre-formatted strings — the FE builds "4 cases", "2/4 Ready", etc. */
  metric?: number;
  cost: number;
}

export interface IterationRequirementRS {
  specId: string;
  title: string;
  jiraKey?: string;
}

export interface IterationSummaryRS {
  id: number;
  pipelineId: number;
  number: number; // "Iteration #N"
  status: AiIterationStatus;
  requirement?: IterationRequirementRS; // GENERATION
  testCases?: EntityWithDisplayId[]; // AUTOMATION
  trigger: string; // "Web form · REQUIREMENT", "Automate · Test Case Library"
  startedBy: string;
  model: string;
  environment: string;
  startedAt: number;
  durationMs?: number; // absent while running
  testCasesCount: number;
  suiteScore?: number; // GENERATION, when Grade PASSED
  costTotal: number; // incl. fix rounds
  readyCount?: number; // GENERATION
  fixRoundsCount?: number; // GENERATION
  launch?: { id: number; name: string; number: number }; // AUTOMATION
  mergeRequest?: { id: string; url: string }; // AUTOMATION
  ciPipeline: CiLinkRS;
  attributes: AttributeRS[]; // env, spec, jira, ci, mr, folder
  stages: StageSummaryRS[]; // ordered
}

export interface GradeCriterionRS {
  key: AiCriterionKey;
  score: number;
  maxScore: number;
  failureReasons: string[];
}

export interface GradeCaseRS {
  name: string;
  testCaseId?: number;
  displayId?: string;
  totalScore: number;
  criteria: GradeCriterionRS[];
}

export interface GradeDocumentRS {
  suiteScore: number;
  warnings: string[];
  error?: string;
  cases: GradeCaseRS[];
}

export enum UploadResult {
  CREATED_DRAFT = 'CREATED_DRAFT',
  CREATED_READY_AUTO = 'CREATED_READY_AUTO',
  FAILED = 'FAILED',
}
export type AiUploadResult = `${UploadResult}`;

export interface UploadCaseResultRS {
  name: string;
  testCaseId?: number;
  displayId?: string;
  result: AiUploadResult;
  reason?: string;
  score?: number;
}

export interface ReviewCaseSummaryRS {
  testCaseId: number;
  displayId: string;
  name: string;
  lifecycle: AiLifecycle;
  madeReadyBy?: string;
  madeReadyAt?: number;
  unsentComments: number;
  currentScore?: number;
  evaluationState?: AiEvaluationState;
  fixRunning: boolean;
}

export interface StageCasePerCaseRS {
  testCaseId: number;
  displayId: string;
  name: string;
  status: AiStageStatus;
  result: string;
}

export interface StageRS extends StageSummaryRS {
  startedAt?: number;
  durationMs?: number;
  ciJob?: CiLinkRS;
  tokens: TokenUsageRS[]; // per model
  create?: {
    cases: {
      name: string;
      priority: string;
      testCaseId?: number;
      displayId?: string;
      status?: AiStageStatus;
      durationMs?: number;
    }[];
  };
  grade?: GradeDocumentRS;
  upload?: { results: UploadCaseResultRS[]; threshold: number };
  review?: { cases: ReviewCaseSummaryRS[]; fixRounds: FixRoundRS[] };
  perCase?: StageCasePerCaseRS[]; // AUTOMATION stages
  failureReason?: string;
}

export interface IterationRS extends IterationSummaryRS {
  libraryFolder?: { id: number; path: string }; // GENERATION
  autoReadyPromotedCount?: number;
  previousIterationId?: number; // for "Compare with previous"
  stages: StageRS[];
}

export type IterationPageRS = {
  content: IterationSummaryRS[];
  page: Page;
};

export interface PipelineSettingsPayload {
  autoReady: boolean;
  threshold: number;
}

/* ------------------------------------------------------------------------------------------ *
 * 3 · Test Case extensions — US-007, 008, 009, 010 (05 §3)
 * ------------------------------------------------------------------------------------------ */

/** C1 — fields added to the existing TestCase DTO (list, details, plan test cases). */
export interface TestCaseAiExtension {
  lifecycle: AiLifecycle; // always present when the feature is on
  ai?: {
    // absent for manual cases
    generatedByIteration: { pipelineId: number; iterationId: number; number: number };
    modifiedByAgent: boolean;
    factoryKey: string; // e.g. "spec_id::name"
  };
  evaluationSummary?: { totalScore: number; state: AiEvaluationState };
  costSummary?: { approxTotal: number };
  review?: { unsentCommentsCount: number; fixRound?: { number: number; status: 'RUNNING' } };
  automation?: { status: AiAutomationStatus };
  blockedPlans?: { id: number; name: string }[]; // plans this Draft case blocks (banner)
}

export interface ScenarioSnapshot {
  precondition?: string;
  steps?: { position: number; instructions: string; expectedResult: string }[];
  instructions?: string;
  expectedResult?: string;
}

/** C2 — `GET tms/test-case/{id}/ai` (details page + side panel). */
export interface TestCaseAiRS {
  evaluation?: {
    totalScore: number;
    state: AiEvaluationState;
    source: { iterationId: number; iterationNumber: number; fixRound?: number };
    evaluatedAt: number;
    criteria: GradeCriterionRS[];
  };
  cost?: {
    approxTotal: number;
    iterationShare: { iterationNumber: number; amount: number; iterationBaseCost: number; casesCount: number };
    fixRounds: { round: number; amount: number }[];
    tokens: { input: number; cacheRead: number; cacheWrite: number; output: number };
    model: string;
  };
  pipelineLinks: {
    pipelineId: number;
    iterationId: number;
    iterationNumber: number;
    stage: AiStageKey;
    fixRound?: number;
  }[];
  /** "What the agent changed" — available until the next fix round. */
  lastAgentChange?: {
    round: number;
    scoreBefore: number;
    scoreAfter?: number;
    before: ScenarioSnapshot;
    after: ScenarioSnapshot;
  };
  automation?: {
    status: AiAutomationStatus;
    iteration?: { pipelineId: number; iterationId: number; number: number };
    launch?: { id: number; name: string; number: number };
    lastResult?: { status: 'PASSED' | 'FAILED'; defectType?: string };
    scenarioChangedAfterAutomation: boolean;
  };
  lifecycleHistory: LifecycleHistoryEntryRS[];
}

export interface LifecycleHistoryEntryRS {
  from?: AiLifecycle;
  to: AiLifecycle;
  reason: AiLifecycleReason;
  details?: string; // "93 ≥ 90", "Iteration #2", "Fix round 1"
  actor: { type: AiLifecycleActorType; name: string };
  at: number;
}

/**
 * C3 — Library list filter params, added to the existing `GET tms/test-case` query
 * (AND with the existing priority/tags filters). ❓ exact param naming — Q-BE-03.
 */
export interface TestCaseAiFilterParams {
  'filter.eq.lifecycle'?: AiLifecycle;
  'filter.eq.ai'?: boolean;
  'filter.eq.iterationId'?: number;
}

/* ------------------------------------------------------------------------------------------ *
 * 4 · Lifecycle — US-007, 013 (05 §4)
 * ------------------------------------------------------------------------------------------ */

export enum LifecycleAction {
  APPROVE = 'APPROVE',
  MARK_AS_READY = 'MARK_AS_READY',
}
export type AiLifecycleAction = `${LifecycleAction}`;

/** L1 `POST tms/test-case/{id}/lifecycle`. */
export interface LifecyclePayload {
  action: AiLifecycleAction;
  confirmObsolete?: boolean;
}

export enum LifecycleUpdateReason {
  APPROVED = 'APPROVED',
  MARKED_AS_READY = 'MARKED_AS_READY',
}
export type AiLifecycleUpdateReason = `${LifecycleUpdateReason}`;

/** L2 `POST tms/test-case/lifecycle/batch`. */
export interface LifecycleBatchPayload {
  testCaseIds: number[];
}
export interface LifecycleBatchRS {
  updated: { id: number; reason: AiLifecycleUpdateReason }[];
  skipped: { id: number; displayId: string; reason: AiSkipReason }[];
}

/** L3 — "Approve / Mark as ready along with these changes" on the existing scenario-update endpoint. */
export interface ScenarioUpdatePromotePayload {
  promoteToReady?: boolean;
}
export type AiLifecycleChanged = 'TO_DRAFT' | 'TO_READY' | null;
export interface ScenarioUpdateRS {
  lifecycleChanged: AiLifecycleChanged;
}

/* ------------------------------------------------------------------------------------------ *
 * 5 · Review comments — US-011 (05 §5)
 * ------------------------------------------------------------------------------------------ */

export interface ReviewCommentTarget {
  type: AiCommentTargetType;
  stepId?: number; // for STEP
}

export interface ReviewCommentRS {
  id: number;
  target: ReviewCommentTarget;
  text: string;
  author: { id: number; name: string };
  createdAt: number;
  state: AiCommentState;
  fixRound?: number; // when SENT/ADDRESSED
  canDelete: boolean; // own + PENDING
}

/** R1 `POST tms/test-case/{id}/review-comment`. */
export interface ReviewCommentPayload {
  target: ReviewCommentTarget;
  text: string;
}

/* ------------------------------------------------------------------------------------------ *
 * 6 · Fix rounds / Push to agent — US-012 (05 §6)
 * ------------------------------------------------------------------------------------------ */

/** F2 `GET tms/test-case/{id}/fix-round` (F1 `POST` returns the same shape, status RUNNING). */
export interface FixRoundRS {
  round: number; // per case, starts at 1
  testCaseId: number;
  displayId: string;
  status: AiFixRoundStatus;
  pushedBy: string;
  pushedAt: number;
  finishedAt?: number;
  commentsCount: number;
  scoreBefore?: number;
  scoreAfter?: number;
  cost?: number;
  tokens?: TokenUsageRS[];
  failureReason?: string; // "job timeout"
  autoReadyPromoted?: boolean;
}

/* ------------------------------------------------------------------------------------------ *
 * 7 · Ready-only gate — US-014 (05 §7)
 * ------------------------------------------------------------------------------------------ */

/** G1 — batch add-to-plan / add-to-launch response shape. */
export interface AddToBatchResultRS<T = number> {
  added: T[];
  skipped: { id: T; reason: AiSkipReason }[];
}

/** G2 — fields added to the Test Plan DTO. */
export interface TestPlanReadyGateExtension {
  draftTestCasesCount: number;
  launchBlocked: boolean;
}

/* ------------------------------------------------------------------------------------------ *
 * 8 · Automation — US-015, 016, 017 (05 §8)
 * ------------------------------------------------------------------------------------------ */

/** A1 `GET tms/automation/environment`. */
export interface AutomationEnvironmentsRS {
  environments: string[];
  default: string;
}

/** A2 `POST tms/automation`. */
export interface AutomatePayload {
  testCaseIds: number[];
  environment: string;
  confirmReautomate: boolean;
}
export interface AutomateAcceptedRS {
  iteration: { pipelineId: number; iterationId: number; number: number };
  accepted: number[];
  skipped: { id: number; displayId: string; reason: AiSkipReason }[];
}

/** A3 — field added to the test item DTO on Launch pages. */
export interface TestItemAiExtension {
  tmsTestCase?: EntityWithDisplayId;
}
