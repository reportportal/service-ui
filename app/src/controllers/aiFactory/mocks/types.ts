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
 * Internal shapes of the AI Factory mock backend: what `seedData.ts` provides and `db.ts` holds
 * in memory. These are **not** part of the public contract (`types/aiFactory.ts`) — the view
 * layer (`viewModels.ts`) projects them into the real `*RS` DTOs.
 */

import {
  AiStageStatus,
  AutomationStatus,
  MergeRequestState,
  EvaluationState,
  FixRoundRS,
  GradeCriterionRS,
  Lifecycle,
  LifecycleActorType,
  LifecycleHistoryEntryRS,
  LifecycleReason,
  PipelineType,
  ReviewCommentRS,
  ReviewCommentTarget,
  ScenarioSnapshot,
  TokenUsageRS,
} from 'types/aiFactory';
import { TestCasePriority } from 'types/testCase';

export interface MockPipelineSeed {
  id: number;
  type: PipelineType;
  name: string;
  repository: string;
  settings?: { autoReady: boolean; threshold: number; editable: boolean };
}

export interface MockStageSeed {
  status: AiStageStatus;
  durationMs: number;
  cost: number;
  tokens: TokenUsageRS[];
  suiteScore?: number; // grade
  threshold?: number; // upload
  perCase?: Record<number, string>; // automation stages
}

export interface MockIterationSeed {
  id: number;
  pipelineId: number;
  number: number;
  requirement?: { specId: string; title: string; jiraKey?: string };
  testCaseIds?: number[]; // automation
  requestedTestCaseIds?: number[]; // automation public identities, aligned with testCaseIds
  trigger: string;
  startedBy: string;
  model: string;
  environment: string;
  startedAt: number;
  durationMs?: number;
  ciPipeline: { id: string; url: string };
  folderPath?: string; // generation
  mergeRequest?: { id: string; url: string; state?: MergeRequestState }; // automation
  launch?: { id: number; name: string; number: number }; // automation
  stages: {
    create?: MockStageSeed;
    grade?: MockStageSeed;
    upload?: MockStageSeed;
    prepare?: MockStageSeed;
    develop?: MockStageSeed;
    automationReview?: MockStageSeed;
    fix?: MockStageSeed;
  };
}

export interface MockLifecycleHistorySeed {
  to: Lifecycle;
  reason: LifecycleReason;
  details?: string;
  actor: { type: LifecycleActorType; name: string };
}

export interface MockFixRoundCommentSeed {
  target: ReviewCommentTarget;
  text: string;
}

export interface MockCompletedFixRoundSeed {
  round: number;
  scoreBefore: number;
  scoreAfter?: number;
  cost?: number;
  tokens?: TokenUsageRS;
  comments: MockFixRoundCommentSeed[];
}

export interface MockPendingCommentSeed {
  target: ReviewCommentTarget;
  text: string;
  author: string;
}

export interface MockCaseSeed {
  id: number;
  displayId: string;
  priority: TestCasePriority;
  template: 'TEXT' | 'STEPS';
  stepsCount: number;
  lifecycle: Lifecycle;
  ai?: { iterationId: number; modifiedByAgent: boolean; factoryKey: string };
  evaluation?: { criteria: GradeCriterionRS[]; evaluatedAt: number; state: EvaluationState; sourceFixRound?: number };
  lifecycleHistory: MockLifecycleHistorySeed[];
  automation?: {
    status: AutomationStatus;
    iterationId?: number;
    launch?: { id: number; name: string; number: number };
    lastResult?: { status: 'PASSED' | 'FAILED'; defectType?: string };
  };
  completedFixRounds?: MockCompletedFixRoundSeed[];
  pendingComments?: MockPendingCommentSeed[];
  blockedPlanIds?: number[];
}

/**
 * The runtime shape held in `db.ts` state, produced from a `MockCaseSeed` by `db.hydrateCase`.
 * Sub-resources reuse the public contract types directly (`ReviewCommentRS`, `FixRoundRS`,
 * `LifecycleHistoryEntryRS`) since they need no extra internal-only fields.
 */
export interface MockCaseRecord {
  id: number;
  displayId: string;
  priority: TestCasePriority;
  template: 'TEXT' | 'STEPS';
  stepsCount: number;
  lifecycle: Lifecycle;
  ai?: { iterationId: number; modifiedByAgent: boolean; factoryKey: string };
  evaluation?: { criteria: GradeCriterionRS[]; evaluatedAt: number; state: EvaluationState; sourceFixRound?: number };
  lifecycleHistory: LifecycleHistoryEntryRS[];
  automation?: {
    status: AutomationStatus;
    iterationId?: number;
    launch?: { id: number; name: string; number: number };
    lastResult?: { status: 'PASSED' | 'FAILED'; defectType?: string };
    scenarioChangedAfterAutomation: boolean;
  };
  comments: ReviewCommentRS[];
  fixRounds: FixRoundRS[];
  fixRoundRunning?: { round: number; startedAt: number };
  lastAgentChange?: {
    round: number;
    scoreBefore: number;
    scoreAfter?: number;
    before: ScenarioSnapshot;
    after: ScenarioSnapshot;
  };
  blockedPlanIds: number[];
  /** Set after the one scripted failure of `SCRIPTED_FIX_FAILURE` has happened, so it fails once, not every time. */
  failedOnce?: boolean;
}

export interface MockPlanSeed {
  id: number;
  name: string;
  testCaseIds: number[];
}

export interface MockLaunchSeed {
  id: number;
  name: string;
  number: number;
  iterationId: number;
  items: { testCaseId: number; status: 'PASSED' | 'FAILED' }[];
}
