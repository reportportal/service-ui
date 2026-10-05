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

import { IterationRS, IterationStatus, Lifecycle, PipelineType, StageKey, StageStatus } from 'types/aiFactory';
import { buildKpis, defaultStageKey, draftCasesCount, failedStage, runningStage } from './iterationDetailsUtils';

const baseIteration: IterationRS = {
  id: 101,
  pipelineId: 1,
  number: 1,
  status: IterationStatus.COMPLETED,
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
  autoReadyPromotedCount: 1,
  ciPipeline: { id: '#1284551', url: '#' },
  attributes: [],
  stages: [
    { key: StageKey.CREATE, status: StageStatus.PASSED, cost: 0, tokens: [] },
    { key: StageKey.GRADE, status: StageStatus.PASSED, cost: 0, tokens: [] },
    { key: StageKey.UPLOAD, status: StageStatus.PASSED, cost: 0, tokens: [] },
    {
      key: StageKey.REVIEW,
      status: StageStatus.DONE,
      cost: 0,
      tokens: [],
      review: {
        cases: [
          { testCaseId: 1, displayId: 'TC1', name: 'TC1', lifecycle: Lifecycle.DRAFT, unsentComments: 0, fixRunning: false },
          { testCaseId: 2, displayId: 'TC2', name: 'TC2', lifecycle: Lifecycle.READY, unsentComments: 0, fixRunning: false },
        ],
        fixRounds: [],
      },
    },
  ],
};

describe('defaultStageKey', () => {
  test('is Grade for generation', () => {
    expect(defaultStageKey(PipelineType.GENERATION)).toBe(StageKey.GRADE);
  });

  test('is Develop for automation', () => {
    expect(defaultStageKey(PipelineType.AUTOMATION)).toBe(StageKey.DEVELOP);
  });
});

describe('buildKpis', () => {
  test('includes all generation KPIs when present', () => {
    expect(buildKpis(PipelineType.GENERATION, baseIteration)).toEqual([
      { key: 'kpiTestCases', value: 4 },
      { key: 'kpiSuiteScore', value: '79 / 100' },
      { key: 'kpiAutoReadyPromoted', value: '1 of 4' },
      { key: 'kpiReadyNow', value: '2 / 4' },
      { key: 'kpiFixRounds', value: 1 },
      { key: 'kpiCost', value: 1.27 },
    ]);
  });

  test('automation only reports Test Cases and Cost', () => {
    expect(buildKpis(PipelineType.AUTOMATION, baseIteration)).toEqual([
      { key: 'kpiTestCases', value: 4 },
      { key: 'kpiCost', value: 1.27 },
    ]);
  });
});

describe('draftCasesCount', () => {
  test('counts Draft cases in the Review stage', () => {
    expect(draftCasesCount(baseIteration)).toBe(1);
  });

  test('is zero when there is no Review stage data', () => {
    expect(draftCasesCount({ ...baseIteration, stages: [] })).toBe(0);
  });
});

describe('failedStage', () => {
  test('finds a failed Create or Upload stage', () => {
    const failing = {
      ...baseIteration,
      stages: baseIteration.stages.map((s) =>
        s.key === StageKey.UPLOAD ? { ...s, status: StageStatus.FAILED, failureReason: 'job timeout' } : s,
      ),
    };
    expect(failedStage(failing)?.key).toBe(StageKey.UPLOAD);
  });

  test('a failed Grade does not fail the iteration', () => {
    const gradeFailed = {
      ...baseIteration,
      stages: baseIteration.stages.map((s) =>
        s.key === StageKey.GRADE ? { ...s, status: StageStatus.FAILED } : s,
      ),
    };
    expect(failedStage(gradeFailed)).toBeUndefined();
  });
});

describe('runningStage', () => {
  test('finds the stage currently Running or In progress — names it in the Running banner (01 §3a G2)', () => {
    const running = {
      ...baseIteration,
      stages: baseIteration.stages.map((s) =>
        s.key === StageKey.GRADE ? { ...s, status: StageStatus.RUNNING } : s,
      ),
    };
    expect(runningStage(running)?.key).toBe(StageKey.GRADE);
  });

  test('is undefined when no stage is running', () => {
    expect(runningStage(baseIteration)).toBeUndefined();
  });
});
