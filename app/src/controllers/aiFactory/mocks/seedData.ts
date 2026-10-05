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
 * Fixture data for the AI Factory mock backend, ported from the UX prototype's `makeData()`
 * (reportportal-requirements/domains/projects/df_bootcamp_2026/html_prototype) with real TMS
 * priority values instead of the prototype's illustrative Critical/Major/Medium/Minor.
 *
 * Kept in sync with docs/ai-factory-poc/01-knowledge-base.md §7 (demo data worth keeping).
 */

import { TestCasePriority } from 'types/testCase';
import {
  AutomationStatus,
  MergeRequestState,
  CommentTargetType,
  CriterionKey,
  EvaluationState,
  Lifecycle,
  LifecycleActorType,
  LifecycleReason,
  PipelineType,
} from 'types/aiFactory';
import type {
  MockCaseSeed,
  MockIterationSeed,
  MockLaunchSeed,
  MockPipelineSeed,
  MockPlanSeed,
} from './types';

export const PIPELINES: MockPipelineSeed[] = [
  {
    id: 1,
    type: PipelineType.GENERATION,
    name: 'Test case generation',
    repository: 'EPM-RPP/rp-tests',
    settings: { autoReady: true, threshold: 90, editable: true },
    rerunOptions: {
      models: ['auto (default)', 'model-A', 'model-B'],
      environments: ['beta5', 'qa', 'dev5'],
    },
  },
  {
    id: 2,
    type: PipelineType.AUTOMATION,
    name: 'Test automation',
    repository: 'EPM-RPP/rp-ui-autotests',
  },
];

const CRITERIA_MAX: Record<CriterionKey, number> = {
  [CriterionKey.ATOMICITY]: 15,
  [CriterionKey.CLEAR_STEPS]: 20,
  [CriterionKey.EXPECTED_RESULTS]: 20,
  [CriterionKey.NO_INVENTED_LOGIC]: 20,
  [CriterionKey.NO_INVENTED_UI]: 15,
  [CriterionKey.COHERENCE]: 10,
};
const CRITERIA_ORDER = Object.keys(CRITERIA_MAX) as CriterionKey[];

const buildFailureReasons = (
  score: number,
  maxScore: number,
  reason?: string | string[] | null,
): string[] => {
  if (score >= maxScore) return [];
  if (Array.isArray(reason)) return reason;
  return [reason || 'Not observable from the requirement.'];
};

/** Mirrors the prototype's `mkEval`: below max ⇒ needs a reason, at max ⇒ none. */
export const buildCriteria = (scores: number[], reasons: (string | string[] | null)[] = []) =>
  CRITERIA_ORDER.map((key, i) => {
    const score = scores[i];
    const maxScore = CRITERIA_MAX[key];
    const reason = reasons[i];
    return {
      key,
      score,
      maxScore,
      failureReasons: buildFailureReasons(score, maxScore, reason),
    };
  });

const GEN1_ID = 101;
const GEN2_ID = 102;
const GEN3_ID = 103;
const GEN4_ID = 104;
const AUTO1_ID = 201;

export const ITERATIONS: MockIterationSeed[] = [
  {
    id: GEN1_ID,
    pipelineId: 1,
    number: 1,
    requirement: { specId: 'US-TMS-MIG-001', title: 'Library empty state and navigation panel', jiraKey: 'EPMRPP-104212' },
    trigger: 'Web form · REQUIREMENT',
    startedBy: 'Anatolii Fedosik',
    model: 'auto (default)',
    environment: 'beta5',
    startedAt: Date.parse('2026-09-19T10:13:00Z'),
    durationMs: 580_000,
    ciPipeline: { id: '#1284551', url: '#' },
    folderPath: 'tms/library/emptystate',
    stages: {
      create: { status: 'PASSED', durationMs: 362_000, cost: 0.94, tokens: [{ model: 'default', input: 318400, cacheRead: 2104000, cacheWrite: 88200, output: 41200, cost: 0.94 }] },
      grade: { status: 'PASSED', durationMs: 151_000, cost: 0.31, tokens: [{ model: 'default', input: 96200, cacheRead: 612000, cacheWrite: 21400, output: 12800, cost: 0.31 }], suiteScore: 79 },
      upload: { status: 'PASSED', durationMs: 14_000, cost: 0.02, tokens: [{ model: 'default', input: 8200, cacheRead: 31000, cacheWrite: 0, output: 900, cost: 0.02 }], threshold: 90 },
    },
  },
  {
    id: GEN2_ID,
    pipelineId: 1,
    number: 2,
    requirement: { specId: 'US-TMS-BLK-001', title: 'Bulk-select and add Test Cases to a Test Plan', jiraKey: 'EPMRPP-105160' },
    trigger: 'Web form · REQUIREMENT',
    startedBy: 'Vadzim Hushchanskou',
    model: 'auto (default)',
    environment: 'beta5',
    startedAt: Date.parse('2026-09-21T13:58:00Z'),
    durationMs: 672_000,
    ciPipeline: { id: '#1291207', url: '#' },
    folderPath: 'tms/bulk/testcase',
    stages: {
      create: { status: 'PASSED', durationMs: 431_000, cost: 1.12, tokens: [{ model: 'default', input: 372900, cacheRead: 2511000, cacheWrite: 97400, output: 48800, cost: 1.12 }] },
      grade: { status: 'PASSED', durationMs: 200_000, cost: 0.46, tokens: [{ model: 'default', input: 121300, cacheRead: 804000, cacheWrite: 26800, output: 16100, cost: 0.46 }], suiteScore: 83 },
      upload: { status: 'PASSED', durationMs: 18_000, cost: 0.04, tokens: [{ model: 'default', input: 10100, cacheRead: 42000, cacheWrite: 0, output: 1200, cost: 0.04 }], threshold: 90 },
    },
  },
  {
    id: GEN3_ID,
    pipelineId: 1,
    number: 3,
    requirement: { specId: 'US-TMS-FLT-003', title: 'Filter Test Cases by priority', jiraKey: 'EPMRPP-106034' },
    trigger: 'Web form · REQUIREMENT',
    startedBy: 'Anatolii Fedosik',
    model: 'auto (default)',
    environment: 'beta5',
    startedAt: Date.now() - 60_000,
    ciPipeline: { id: '#1299412', url: '#' },
    folderPath: 'tms/filter/testcase',
    stages: {
      create: { status: 'PASSED', durationMs: 408_000, cost: 0.88, tokens: [{ model: 'default', input: 301000, cacheRead: 1987000, cacheWrite: 81000, output: 39000, cost: 0.88 }] },
      grade: { status: 'RUNNING', durationMs: 0, cost: 0, tokens: [] },
      upload: { status: 'PENDING', durationMs: 0, cost: 0, tokens: [] },
    },
  },
  {
    id: GEN4_ID,
    pipelineId: 1,
    number: 4,
    requirement: {
      specId: 'US-TMS-EXP-002',
      title: 'Editor can export Test Cases to CSV',
      jiraKey: 'EPMRPP-107118',
    },
    trigger: 'Web form · REQUIREMENT',
    startedBy: 'Vadzim Hushchanskou',
    model: 'auto (default)',
    environment: 'beta5',
    startedAt: Date.parse('2026-10-04T14:20:00Z'),
    durationMs: 485_000,
    ciPipeline: { id: '#1301188', url: '#' },
    folderPath: 'tms/export/testcase/iteration-4',
    stages: {
      create: {
        status: 'PASSED',
        durationMs: 312_000,
        cost: 0.71,
        tokens: [
          {
            model: 'default',
            input: 246000,
            cacheRead: 1730000,
            cacheWrite: 68200,
            output: 33400,
            cost: 0.71,
          },
        ],
      },
      grade: {
        status: 'PASSED',
        durationMs: 111_000,
        cost: 0.24,
        tokens: [
          {
            model: 'default',
            input: 80100,
            cacheRead: 505000,
            cacheWrite: 17600,
            output: 10200,
            cost: 0.24,
          },
        ],
        suiteScore: 90,
      },
      upload: {
        status: 'FAILED',
        durationMs: 62_000,
        cost: 0.01,
        tokens: [
          {
            model: 'auto (default)',
            input: 4100,
            cacheRead: 15000,
            cacheWrite: 0,
            output: 0,
            cost: 0.01,
          },
        ],
        ciJob: { id: '#8930412', url: '#' },
        threshold: 90,
        failureReason: 'Library unreachable (HTTP 503) — nothing written, rolled back',
      },
    },
  },
  {
    id: AUTO1_ID,
    pipelineId: 2,
    number: 1,
    testCaseIds: [1001, 1002],
    trigger: 'Automate · Test Case Library',
    startedBy: 'Anatolii Fedosik',
    model: 'auto (default)',
    environment: 'beta5',
    startedAt: Date.parse('2026-09-21T16:02:00Z'),
    durationMs: 2_180_000,
    ciPipeline: { id: '#1291650', url: '#' },
    mergeRequest: { id: '!212', url: '#', state: MergeRequestState.OPEN },
    launch: { id: 9001, name: 'RP UI Test @implement_test', number: 12 },
    stages: {
      prepare: { status: 'PASSED', durationMs: 190_000, cost: 0.31, tokens: [{ model: 'default', input: 88000, cacheRead: 510000, cacheWrite: 22000, output: 9400, cost: 0.31 }], perCase: { 1001: 'Enriched · 3 steps, post conditions added', 1002: 'Enriched · 3 steps, post conditions added' } },
      develop: { status: 'PASSED', durationMs: 1_300_000, cost: 1.74, tokens: [{ model: 'default', input: 512000, cacheRead: 4100000, cacheWrite: 131000, output: 61000, cost: 1.74 }], perCase: { 1001: 'emptyState.spec.ts · green twice', 1002: 'createTestCaseModal.spec.ts · green twice' } },
      automationReview: { status: 'PASSED', durationMs: 330_000, cost: 0.46, tokens: [{ model: 'default', input: 140000, cacheRead: 902000, cacheWrite: 30100, output: 14800, cost: 0.46 }], perCase: { 1001: '2 findings (Minor)', 1002: '1 finding (Major)' } },
      fix: { status: 'PASSED', durationMs: 360_000, cost: 0.33, tokens: [{ model: 'default', input: 97000, cacheRead: 640000, cacheWrite: 20400, output: 10100, cost: 0.33 }], perCase: { 1001: 'Fixed · 1 round', 1002: 'Fixed · 1 round' } },
    },
  },
];

const readyHistory = (score: number, threshold = 90) => [
  { to: Lifecycle.DRAFT, reason: LifecycleReason.UPLOADED, actor: { type: LifecycleActorType.PIPELINE, name: 'Test case generation' } },
  { to: Lifecycle.READY, reason: LifecycleReason.AUTO_READY, details: `${score} ≥ ${threshold}`, actor: { type: LifecycleActorType.AUTO_READY, name: 'Auto-Ready' } },
];

/** Simulates one scripted failure, like the prototype's `FAIL_ONCE` — used by the engine (T3.3). */
export const SCRIPTED_FIX_FAILURE: Record<string, string> = {
  TC107: 'job timeout',
};

/** Exact scores required by the approved demo script after a successful fix round. */
export const SCRIPTED_FIX_SCORE: Record<string, number> = {
  TC106: 92,
};

/** Keeps the updated scenario but makes its re-grade fail, covering the F2 GRADE_FAILED outcome. */
export const SCRIPTED_GRADE_FAILURE = new Set(['TC105']);

export const CASES: MockCaseSeed[] = [
  {
    id: 1001,
    displayId: 'TC101',
    priority: 'critical' as TestCasePriority,
    template: 'STEPS',
    stepsCount: 3,
    lifecycle: Lifecycle.READY,
    ai: { iterationId: GEN1_ID, modifiedByAgent: false, factoryKey: 'US-TMS-MIG-001::empty-state-display' },
    evaluation: { criteria: buildCriteria([15, 20, 18, 18, 15, 8]), evaluatedAt: Date.parse('2026-09-19T10:22:00Z'), state: EvaluationState.EVALUATED, sourceFixRound: undefined },
    lifecycleHistory: readyHistory(94),
    automation: { status: AutomationStatus.AUTOMATED, iterationId: AUTO1_ID, launch: { id: 9001, name: 'RP UI Test @implement_test', number: 12 }, lastResult: { status: 'PASSED' } },
  },
  {
    id: 1002,
    displayId: 'TC102',
    priority: 'high' as TestCasePriority,
    template: 'STEPS',
    stepsCount: 3,
    lifecycle: Lifecycle.READY,
    ai: { iterationId: GEN1_ID, modifiedByAgent: false, factoryKey: 'US-TMS-MIG-001::create-modal-opens' },
    evaluation: { criteria: buildCriteria([15, 20, 17, 20, 11, 8]), evaluatedAt: Date.parse('2026-09-19T10:22:00Z'), state: EvaluationState.EVALUATED, sourceFixRound: undefined },
    lifecycleHistory: readyHistory(91),
    automation: { status: AutomationStatus.AUTOMATED, iterationId: AUTO1_ID, launch: { id: 9001, name: 'RP UI Test @implement_test', number: 12 }, lastResult: { status: 'FAILED', defectType: 'Product bug' } },
  },
  {
    id: 1003,
    displayId: 'TC103',
    priority: 'medium' as TestCasePriority,
    template: 'STEPS',
    stepsCount: 3,
    lifecycle: Lifecycle.DRAFT,
    ai: { iterationId: GEN1_ID, modifiedByAgent: true, factoryKey: 'US-TMS-MIG-001::navigation-panel-hidden' },
    evaluation: { criteria: buildCriteria([15, 18, 18, 17, 12, 8]), evaluatedAt: Date.parse('2026-09-20T11:05:00Z'), state: EvaluationState.EVALUATED, sourceFixRound: 1 },
    lifecycleHistory: [
      { to: Lifecycle.DRAFT, reason: LifecycleReason.UPLOADED, details: '72 < 90', actor: { type: LifecycleActorType.PIPELINE, name: 'Test case generation' } },
      { to: Lifecycle.DRAFT, reason: LifecycleReason.AGENT_FIX, details: 'Fix round 1 (72 → 88)', actor: { type: LifecycleActorType.PIPELINE, name: 'Test case generation' } },
    ],
    completedFixRounds: [{ round: 1, scoreBefore: 72, scoreAfter: 88, cost: 0.22, tokens: { model: 'default', input: 41200, cacheRead: 288000, cacheWrite: 9100, output: 6100, cost: 0.22 }, comments: [{ target: { type: CommentTargetType.STEP, stepId: 2 }, text: "Name the page as in the sidebar: 'Test Case Library'." }] }],
  },
  {
    id: 1004,
    displayId: 'TC104',
    priority: 'low' as TestCasePriority,
    template: 'TEXT',
    stepsCount: 1,
    lifecycle: Lifecycle.DRAFT,
    ai: { iterationId: GEN1_ID, modifiedByAgent: false, factoryKey: 'US-TMS-MIG-001::import-modal-opens' },
    evaluation: { criteria: buildCriteria([8, 12, 10, 10, 10, 8]), evaluatedAt: Date.parse('2026-09-19T10:22:00Z'), state: EvaluationState.EVALUATED, sourceFixRound: undefined },
    lifecycleHistory: [{ to: Lifecycle.DRAFT, reason: LifecycleReason.UPLOADED, details: '58 < 90', actor: { type: LifecycleActorType.PIPELINE, name: 'Test case generation' } }],
  },
  {
    id: 1005,
    displayId: 'TC105',
    priority: 'critical' as TestCasePriority,
    template: 'STEPS',
    stepsCount: 5,
    lifecycle: Lifecycle.READY,
    ai: { iterationId: GEN2_ID, modifiedByAgent: false, factoryKey: 'US-TMS-BLK-001::add-to-test-plan' },
    evaluation: { criteria: buildCriteria([15, 20, 18, 20, 12, 8]), evaluatedAt: Date.parse('2026-09-21T14:09:00Z'), state: EvaluationState.EVALUATED, sourceFixRound: undefined },
    lifecycleHistory: readyHistory(93),
    blockedPlanIds: [],
  },
  {
    id: 1006,
    displayId: 'TC106',
    priority: 'high' as TestCasePriority,
    template: 'STEPS',
    stepsCount: 3,
    lifecycle: Lifecycle.DRAFT,
    ai: { iterationId: GEN2_ID, modifiedByAgent: false, factoryKey: 'US-TMS-BLK-001::bulk-action-disabled' },
    evaluation: {
      criteria: buildCriteria(
        [15, 16, 14, 16, 12, 8],
        [
          null,
          [
            'The bulk-action step does not say which Test Case is selected.',
            'The transition after clearing the selection is not described.',
          ],
          'The expected result does not confirm that bulk actions disappear after clearing the selection.',
          'The scenario assumes a previously selected row without establishing it.',
          'The bulk action label and its disabled state are not named.',
          'Selection and cleanup are not linked into one continuous flow.',
        ],
      ),
      evaluatedAt: Date.parse('2026-09-21T14:09:00Z'),
      state: EvaluationState.EVALUATED,
      sourceFixRound: undefined,
    },
    lifecycleHistory: [{ to: Lifecycle.DRAFT, reason: LifecycleReason.UPLOADED, details: '81 < 90', actor: { type: LifecycleActorType.PIPELINE, name: 'Test case generation' } }],
    pendingComments: [
      {
        target: { type: CommentTargetType.PRECONDITION },
        text: 'Split this case: one for the disabled action and one for the hidden panel.',
        author: 'Helen Bobrova',
      },
      {
        target: { type: CommentTargetType.STEP, stepId: 2 },
        text: 'The bulk panel appears only after a selection. Select and clear a case, then check the action.',
        author: 'Helen Bobrova',
      },
    ],
  },
  {
    id: 1007,
    displayId: 'TC107',
    priority: 'medium' as TestCasePriority,
    template: 'STEPS',
    stepsCount: 2,
    lifecycle: Lifecycle.DRAFT,
    ai: { iterationId: GEN2_ID, modifiedByAgent: false, factoryKey: 'US-TMS-BLK-001::search-filters-test-plans' },
    evaluation: { criteria: buildCriteria([8, 14, 12, 12, 12, 8]), evaluatedAt: Date.parse('2026-09-21T14:09:00Z'), state: EvaluationState.EVALUATED, sourceFixRound: undefined },
    lifecycleHistory: [{ to: Lifecycle.DRAFT, reason: LifecycleReason.UPLOADED, details: '66 < 90', actor: { type: LifecycleActorType.PIPELINE, name: 'Test case generation' } }],
    pendingComments: [{ target: { type: CommentTargetType.STEP, stepId: 0 }, text: 'Clarify which Test Plan fields the search must match before re-running the scenario.', author: 'Helen Bobrova' }],
  },
  {
    id: 1008,
    displayId: 'TC108',
    priority: 'low' as TestCasePriority,
    template: 'STEPS',
    stepsCount: 3,
    lifecycle: Lifecycle.DRAFT,
    ai: { iterationId: GEN2_ID, modifiedByAgent: false, factoryKey: 'US-TMS-BLK-001::bulk-selection-counter' },
    evaluation: { criteria: buildCriteria([15, 18, 18, 18, 12, 9]), evaluatedAt: Date.parse('2026-09-21T14:09:00Z'), state: EvaluationState.OBSOLETE, sourceFixRound: undefined },
    lifecycleHistory: [
      { to: Lifecycle.DRAFT, reason: LifecycleReason.UPLOADED, actor: { type: LifecycleActorType.PIPELINE, name: 'Test case generation' } },
      { to: Lifecycle.READY, reason: LifecycleReason.AUTO_READY, details: '90 ≥ 90', actor: { type: LifecycleActorType.AUTO_READY, name: 'Auto-Ready' } },
      { to: Lifecycle.DRAFT, reason: LifecycleReason.SCENARIO_CHANGED, actor: { type: LifecycleActorType.USER, name: 'Helen Bobrova' } },
    ],
    blockedPlanIds: [1],
  },
  {
    id: 1009,
    displayId: 'TC109',
    name: "Test Case Library. Export. 'Export' downloads the selected Test Cases as a CSV file",
    availableInLibrary: false,
    priority: 'critical' as TestCasePriority,
    template: 'STEPS',
    stepsCount: 4,
    lifecycle: Lifecycle.DRAFT,
    ai: {
      iterationId: GEN4_ID,
      modifiedByAgent: false,
      factoryKey: 'US-TMS-EXP-002::export-selected-cases',
    },
    evaluation: {
      criteria: buildCriteria([15, 20, 18, 20, 14, 9]),
      evaluatedAt: Date.parse('2026-10-04T14:26:00Z'),
      state: EvaluationState.EVALUATED,
    },
    lifecycleHistory: [],
  },
  {
    id: 1010,
    displayId: 'TC110',
    name: 'Test Case Library. Export. The CSV contains the name, priority, steps and expected results columns',
    availableInLibrary: false,
    priority: 'high' as TestCasePriority,
    template: 'STEPS',
    stepsCount: 3,
    lifecycle: Lifecycle.DRAFT,
    ai: {
      iterationId: GEN4_ID,
      modifiedByAgent: false,
      factoryKey: 'US-TMS-EXP-002::csv-columns',
    },
    evaluation: {
      criteria: buildCriteria([13, 18, 16, 18, 12, 8]),
      evaluatedAt: Date.parse('2026-10-04T14:26:00Z'),
      state: EvaluationState.EVALUATED,
    },
    lifecycleHistory: [],
  },
  {
    id: 1011,
    displayId: 'TC111',
    name: "Test Case Library. Export. 'Export' is disabled when no Test Case is selected",
    availableInLibrary: false,
    priority: 'medium' as TestCasePriority,
    template: 'STEPS',
    stepsCount: 3,
    lifecycle: Lifecycle.DRAFT,
    ai: {
      iterationId: GEN4_ID,
      modifiedByAgent: false,
      factoryKey: 'US-TMS-EXP-002::export-disabled',
    },
    evaluation: {
      criteria: buildCriteria([15, 17, 17, 17, 13, 9]),
      evaluatedAt: Date.parse('2026-10-04T14:26:00Z'),
      state: EvaluationState.EVALUATED,
    },
    lifecycleHistory: [],
  },
];

export const PLANS: MockPlanSeed[] = [{ id: 1, name: 'TMS regression · Sprint 42', testCaseIds: [1005, 1008] }];

export const LAUNCHES: MockLaunchSeed[] = [
  { id: 9001, name: 'RP UI Test @implement_test', number: 12, iterationId: AUTO1_ID, items: [{ testCaseId: 1001, status: 'PASSED' }, { testCaseId: 1002, status: 'PASSED' }] },
];
