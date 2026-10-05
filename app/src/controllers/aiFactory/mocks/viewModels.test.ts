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

import {
  AutomationStatus,
  IterationStatus,
  Lifecycle,
  MergeRequestState,
  StageKey,
} from 'types/aiFactory';
import { findCase, findIteration, findPipeline, resetMockDb } from './db';
import {
  toIterationRS,
  toIterationSummaryRS,
  toPipelineCompareRS,
  toPipelineRS,
  toTestCaseAiExtension,
  toTestCaseAiRS,
} from './viewModels';

beforeEach(() => resetMockDb());

describe('toPipelineRS', () => {
  test('generation pipeline carries its settings', () => {
    const rs = toPipelineRS(findPipeline(1), 3);
    expect(rs).toMatchObject({
      id: 1,
      name: 'Test case generation',
      iterationsCount: 3,
      settings: { autoReady: true, threshold: 90 },
    });
  });

  test('automation pipeline has no settings', () => {
    const rs = toPipelineRS(findPipeline(2), 1);
    expect(rs.settings).toBeUndefined();
  });
});

describe('toIterationSummaryRS', () => {
  test('gen-1 status is IN_REVIEW and carries suite score / cost / attributes', () => {
    const rs = toIterationSummaryRS(findPipeline(1), findIteration(101));
    expect(rs.status).toBe(IterationStatus.IN_REVIEW);
    expect(rs.suiteScore).toBe(79);
    // costTotal includes fix rounds (contract: "incl. fix rounds") — 1.27 base + TC103's $0.22 round
    expect(rs.costTotal).toBeCloseTo(1.49, 2);
    expect(rs.attributes.map((a) => a.key)).toEqual(
      expect.arrayContaining(['env', 'spec', 'jira', 'ci']),
    );
  });

  test('auto-1 lists its test cases by displayId', () => {
    const rs = toIterationSummaryRS(findPipeline(2), findIteration(201));
    expect(rs.testCases).toEqual([
      { id: 1001, displayId: 'TC101' },
      { id: 1002, displayId: 'TC102' },
    ]);
  });
});

describe('toIterationRS', () => {
  test('gen-1 Grade stage lists every case with its criteria', () => {
    const rs = toIterationRS(findPipeline(1), findIteration(101));
    const grade = rs.stages.find((s) => s.key === StageKey.GRADE);
    expect(grade?.grade?.cases).toHaveLength(4);
    expect(grade?.grade?.cases.find((c) => c.displayId === 'TC101')?.totalScore).toBe(94);
  });

  test('gen-1 Review stage lists TC103’s completed fix round', () => {
    const rs = toIterationRS(findPipeline(1), findIteration(101));
    const review = rs.stages.find((s) => s.key === StageKey.REVIEW);
    expect(review?.review?.fixRounds).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ testCaseId: 1003, round: 1, scoreBefore: 72, scoreAfter: 88 }),
      ]),
    );
  });

  test('auto-1 stage rows use the Test Case Library display IDs', () => {
    const rs = toIterationRS(findPipeline(2), findIteration(201));
    const prepare = rs.stages.find((stage) => stage.key === StageKey.PREPARE);

    expect(prepare?.perCase).toEqual([
      expect.objectContaining({ testCaseId: 1001, displayId: 'TC101', name: 'TC101' }),
      expect.objectContaining({ testCaseId: 1002, displayId: 'TC102', name: 'TC102' }),
    ]);
  });
});

describe('toPipelineCompareRS', () => {
  test('keeps candidate and baseline identity and emits stage deltas keyed by stage', () => {
    const pipeline = findPipeline(1);
    const result = toPipelineCompareRS(pipeline, findIteration(103), findIteration(102));

    expect(result.mock).toEqual({
      kind: 'REPORTPORTAL_AI_FACTORY_COMPARE_DEMO',
      version: 1,
    });
    expect(result.current).toMatchObject({ id: 103, pipelineId: 1, iterationNumber: 3 });
    expect(result.previous).toMatchObject({ id: 102, pipelineId: 1, iterationNumber: 2 });
    expect(result.current?.mockMetrics).toEqual(
      expect.objectContaining({
        autoReadyPromotedCount: expect.any(Number),
      }),
    );
    expect(result.previous?.mockMetrics?.criterionAverages).toEqual(
      expect.objectContaining({ atomicity: expect.any(Number) }),
    );
    expect(result.stageDeltas?.map(({ stageKey }) => stageKey)).toEqual([
      StageKey.CREATE,
      StageKey.GRADE,
      StageKey.UPLOAD,
      StageKey.REVIEW,
    ]);
    expect(
      result.stageDeltas?.find(({ stageKey }) => stageKey === String(StageKey.GRADE)),
    ).toMatchObject({
      current: {
        mockMetrics: { metric: result.current?.mockMetrics?.suiteScore },
      },
      previous: {
        mockMetrics: { metric: result.previous?.mockMetrics?.suiteScore },
      },
    });
  });
});

describe('toTestCaseAiExtension', () => {
  test('TC106 shows both design-fixture comments and no fix running', () => {
    const c = findCase('TC106');
    const ext = toTestCaseAiExtension(c, findPipeline(1), findIteration(102));
    expect(ext.lifecycle).toBe(Lifecycle.DRAFT);
    expect(ext.review?.unsentCommentsCount).toBe(2);
    expect(ext.review?.fixRound).toBeUndefined();
  });

  test('a manual case (no ai) has no ai/evaluation/cost fields', () => {
    const c = findCase('TC106');
    const ext = toTestCaseAiExtension({ ...c, ai: undefined, evaluation: undefined });
    expect(ext.ai).toBeUndefined();
    expect(ext.evaluationSummary).toBeUndefined();
    expect(ext.costSummary).toBeUndefined();
  });
});

describe('toTestCaseAiRS', () => {
  test('TC101 evaluation and pipeline links point at Iteration #1', () => {
    const c = findCase('TC101');
    const rs = toTestCaseAiRS(c, findPipeline(1), findIteration(101));
    expect(rs.evaluation?.totalScore).toBe(94);
    expect(rs.pipelineLinks[0]).toEqual({
      pipelineId: 1,
      pipelineName: 'Test case generation',
      iterationId: 101,
      iterationNumber: 1,
      requirementId: 'US-TMS-MIG-001',
      stage: StageKey.GRADE,
    });
  });

  test('TC103 has a Review-stage link for its fix round', () => {
    const c = findCase('TC103');
    const rs = toTestCaseAiRS(c, findPipeline(1), findIteration(101));
    expect(rs.pipelineLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ stage: StageKey.REVIEW, fixRound: 1 })]),
    );
    expect(rs.cost?.fixRounds).toEqual([{ round: 1, amount: 0.22 }]);
  });

  test('TC101 terminal automation result and merge request are projected from its iteration', () => {
    const c = findCase('TC101');
    const rs = toTestCaseAiRS(c, findPipeline(1), findIteration(101));

    expect(rs.automation).toMatchObject({
      status: AutomationStatus.AUTOMATED,
      iteration: {
        pipelineId: 2,
        iterationId: 201,
        number: 1,
      },
      launch: { id: 9001, name: 'RP UI Test @implement_test', number: 12 },
      mergeRequest: { id: '!212', state: MergeRequestState.OPEN },
      lastResult: { status: 'PASSED' },
    });
  });

  test('TC102 exposes the optional defect type from its failed last result', () => {
    const rs = toTestCaseAiRS(findCase('TC102'), findPipeline(1), findIteration(101));

    expect(rs.automation?.lastResult).toEqual({
      status: 'FAILED',
      defectType: 'Product bug',
    });
  });

  test('falls back to a closed merge request for failed legacy automation data', () => {
    const c = findCase('TC101');
    const iteration = findIteration(201);
    if (!c.automation || !iteration.mergeRequest) {
      throw new Error('Expected seeded automation and merge request');
    }
    c.automation.status = AutomationStatus.FAILED;
    iteration.mergeRequest.state = undefined;

    const rs = toTestCaseAiRS(c, findPipeline(1), findIteration(101));

    expect(rs.automation?.mergeRequest).toEqual({
      id: '!212',
      state: MergeRequestState.CLOSED,
    });
  });
});
