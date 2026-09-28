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

import { IterationStatus, Lifecycle, StageKey } from 'types/aiFactory';
import { findCase, findIteration, findPipeline, resetMockDb } from './db';
import { toIterationRS, toIterationSummaryRS, toPipelineRS, toTestCaseAiExtension, toTestCaseAiRS } from './viewModels';

beforeEach(() => resetMockDb());

describe('toPipelineRS', () => {
  test('generation pipeline carries its settings', () => {
    const rs = toPipelineRS(findPipeline(1), 3);
    expect(rs).toMatchObject({ id: 1, name: 'Test case generation', iterationsCount: 3, settings: { autoReady: true, threshold: 90 } });
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
    expect(rs.attributes.map((a) => a.key)).toEqual(expect.arrayContaining(['env', 'spec', 'jira', 'ci']));
  });

  test('auto-1 lists its test cases by displayId', () => {
    const rs = toIterationSummaryRS(findPipeline(2), findIteration(201));
    expect(rs.testCases).toEqual([{ id: 1001, displayId: 'TC101' }, { id: 1002, displayId: 'TC102' }]);
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
      expect.arrayContaining([expect.objectContaining({ testCaseId: 1003, round: 1, scoreBefore: 72, scoreAfter: 88 })]),
    );
  });
});

describe('toTestCaseAiExtension', () => {
  test('TC106 shows one unsent comment and no fix running', () => {
    const c = findCase('TC106');
    const ext = toTestCaseAiExtension(c, findPipeline(1), findIteration(102));
    expect(ext.lifecycle).toBe(Lifecycle.DRAFT);
    expect(ext.review?.unsentCommentsCount).toBe(1);
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
    expect(rs.pipelineLinks[0]).toEqual({ pipelineId: 1, iterationId: 101, iterationNumber: 1, stage: StageKey.GRADE });
  });

  test('TC103 has a Review-stage link for its fix round', () => {
    const c = findCase('TC103');
    const rs = toTestCaseAiRS(c, findPipeline(1), findIteration(101));
    expect(rs.pipelineLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ stage: StageKey.REVIEW, fixRound: 1 })]),
    );
    expect(rs.cost?.fixRounds).toEqual([{ round: 1, amount: 0.22 }]);
  });
});
