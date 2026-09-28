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

import { IterationStatus, IterationSummaryRS, PipelineType, StageKey, StageStatus } from 'types/aiFactory';
import { matchesSearch, outcome, requirementOrTestCasesLabel, stageMetric } from './pipelinesListUtils';

const baseIteration: IterationSummaryRS = {
  id: 101,
  pipelineId: 1,
  number: 1,
  status: IterationStatus.COMPLETED,
  requirement: { specId: 'US-TMS-MIG-001', title: 'Library empty state', jiraKey: 'EPMRPP-104212' },
  trigger: 'Web form · REQUIREMENT',
  startedBy: 'Anatolii Fedosik',
  model: 'auto (default)',
  environment: 'beta5',
  startedAt: Date.parse('2026-09-19T10:13:00Z'),
  durationMs: 580_000,
  testCasesCount: 4,
  suiteScore: 79,
  costTotal: 1.27,
  readyCount: 2,
  fixRoundsCount: 1,
  ciPipeline: { id: '#1284551', url: '#' },
  attributes: [{ key: 'env', value: 'beta5' }],
  stages: [],
};

describe('matchesSearch', () => {
  test('matches everything for an empty search', () => {
    expect(matchesSearch(baseIteration, 'Test case generation', '')).toBe(true);
  });

  test('matches the pipeline name', () => {
    expect(matchesSearch(baseIteration, 'Test case generation', 'generation')).toBe(true);
  });

  test('matches the iteration number with a "#" prefix', () => {
    expect(matchesSearch(baseIteration, 'Test case generation', '#1')).toBe(true);
  });

  test('matches the requirement spec id and title', () => {
    expect(matchesSearch(baseIteration, 'Test case generation', 'empty state')).toBe(true);
  });

  test('does not match unrelated text', () => {
    expect(matchesSearch(baseIteration, 'Test case generation', 'nothing here')).toBe(false);
  });
});

describe('stageMetric', () => {
  test('CREATE/UPLOAD produce a "cases" metric', () => {
    expect(stageMetric({ key: StageKey.CREATE, status: StageStatus.PASSED, metric: 4, cost: 1 }, 4)).toEqual({
      kind: 'cases',
      count: 4,
    });
  });

  test('GRADE produces a "score" metric', () => {
    expect(stageMetric({ key: StageKey.GRADE, status: StageStatus.PASSED, metric: 79, cost: 1 }, 4)).toEqual({
      kind: 'score',
      score: 79,
    });
  });

  test('REVIEW produces a "ready" metric out of the iteration total', () => {
    expect(stageMetric({ key: StageKey.REVIEW, status: StageStatus.PASSED, metric: 2, cost: 1 }, 4)).toEqual({
      kind: 'ready',
      ready: 2,
      total: 4,
    });
  });

  test('returns null when the stage has no metric', () => {
    expect(stageMetric({ key: StageKey.CREATE, status: StageStatus.PENDING, cost: 0 }, 4)).toBeNull();
  });

  test('returns null for a stage with no defined metric mapping (e.g. Prepare)', () => {
    expect(stageMetric({ key: StageKey.PREPARE, status: StageStatus.DONE, metric: 4, cost: 0 }, 4)).toBeNull();
  });
});

describe('outcome', () => {
  test('generation: ready count, total and fix rounds', () => {
    expect(outcome(PipelineType.GENERATION, baseIteration)).toEqual({
      kind: 'generationReady',
      ready: 2,
      total: 4,
      fixRounds: 1,
    });
  });

  test('generation: zero fix rounds when none ran', () => {
    expect(outcome(PipelineType.GENERATION, { ...baseIteration, fixRoundsCount: 0 })).toEqual({
      kind: 'generationReady',
      ready: 2,
      total: 4,
      fixRounds: 0,
    });
  });

  test('automation: running reports only the total', () => {
    expect(
      outcome(PipelineType.AUTOMATION, { ...baseIteration, status: IterationStatus.RUNNING }),
    ).toEqual({ kind: 'automationRunning', total: 4 });
  });

  test('automation: completed reports everything implemented plus the launch number', () => {
    expect(
      outcome(PipelineType.AUTOMATION, {
        ...baseIteration,
        status: IterationStatus.COMPLETED,
        launch: { id: 12, name: 'Launch #12', number: 12 },
      }),
    ).toEqual({ kind: 'automationDone', implemented: 4, total: 4, launchNumber: 12 });
  });

  test('automation: failed reports zero implemented', () => {
    expect(
      outcome(PipelineType.AUTOMATION, { ...baseIteration, status: IterationStatus.FAILED }),
    ).toEqual({ kind: 'automationDone', implemented: 0, total: 4, launchNumber: undefined });
  });
});

describe('requirementOrTestCasesLabel', () => {
  test('uses the requirement spec id and title when present (generation)', () => {
    expect(requirementOrTestCasesLabel(baseIteration)).toBe('US-TMS-MIG-001 · Library empty state');
  });

  test('lists test case display ids when there is no requirement (automation)', () => {
    const automationIteration: IterationSummaryRS = {
      ...baseIteration,
      requirement: undefined,
      testCases: [
        { id: 1, displayId: 'TC101' },
        { id: 2, displayId: 'TC102' },
      ],
    };
    expect(requirementOrTestCasesLabel(automationIteration)).toBe('TC101, TC102');
  });

  test('returns undefined when neither is present', () => {
    expect(requirementOrTestCasesLabel({ ...baseIteration, requirement: undefined })).toBeUndefined();
  });
});
