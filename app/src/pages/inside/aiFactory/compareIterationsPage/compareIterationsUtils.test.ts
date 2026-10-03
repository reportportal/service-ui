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

import { IntlShape } from 'react-intl';

import {
  CriterionKey,
  IterationStatus,
  type ComparisonIteration,
  type IterationSummaryRS,
} from 'types/aiFactory';

import { buildComparisonMetrics, getLatestPair, parseQueryId } from './compareIterationsUtils';

const intl = {
  formatMessage: (message: { defaultMessage?: string; id: string }) =>
    message.defaultMessage ?? message.id,
} as IntlShape;

const iteration = (id: number, number: number): IterationSummaryRS => ({
  id,
  pipelineId: 1,
  number,
  status: IterationStatus.COMPLETED,
  trigger: 'CI',
  startedBy: 'user',
  model: 'model',
  environment: 'demo',
  startedAt: 1,
  testCasesCount: 1,
  costTotal: 0,
  ciPipeline: { id: String(id), url: 'https://ci.example' },
  attributes: [],
  stages: [],
});

describe('compareIterationsUtils', () => {
  test.each([
    ['1', 1],
    ['9007199254740991', Number.MAX_SAFE_INTEGER],
    [1, null],
    ['', null],
    ['0', null],
    ['-1', null],
    ['1.5', null],
    ['not-a-number', null],
    ['9007199254740992', null],
    [undefined, null],
  ])('parses canonical positive integer query id %p as %p', (value, expected) => {
    expect(parseQueryId(value)).toBe(expected);
  });

  test('selects the latest two iterations by iteration number without mutating input', () => {
    const iterations = [iteration(102, 2), iteration(101, 1), iteration(104, 4)];

    expect(getLatestPair(iterations)).toEqual({ baselineId: 102, candidateId: 104 });
    expect(iterations.map(({ id }) => id)).toEqual([102, 101, 104]);
  });

  test('does not form a pair when fewer than two iterations exist', () => {
    expect(getLatestPair([])).toBeNull();
    expect(getLatestPair([iteration(101, 1)])).toBeNull();
  });

  test('builds only metrics present on both sides with their comparison direction', () => {
    const baseline: ComparisonIteration = {
      id: 101,
      number: 1,
      status: IterationStatus.COMPLETED,
      testCasesCount: 4,
      suiteScore: 80,
      readyCount: 2,
      fixRoundsCount: 1,
      autoReadyPromotedCount: 1,
      criterionAverages: {
        [CriterionKey.ATOMICITY]: 10,
        [CriterionKey.CLEAR_STEPS]: 15,
        [CriterionKey.EXPECTED_RESULTS]: 16,
        [CriterionKey.NO_INVENTED_LOGIC]: 17,
        [CriterionKey.NO_INVENTED_UI]: 12,
        [CriterionKey.COHERENCE]: 8,
      },
      costTotal: 1.25,
      durationMs: 1000,
    };
    const candidate: ComparisonIteration = {
      id: 102,
      number: 2,
      status: IterationStatus.COMPLETED,
      testCasesCount: 5,
      suiteScore: 90,
      readyCount: 4,
      fixRoundsCount: 0,
      autoReadyPromotedCount: 2,
      criterionAverages: {
        [CriterionKey.ATOMICITY]: 11,
        [CriterionKey.CLEAR_STEPS]: 16,
        [CriterionKey.EXPECTED_RESULTS]: 17,
        [CriterionKey.NO_INVENTED_LOGIC]: 18,
        [CriterionKey.NO_INVENTED_UI]: 13,
        [CriterionKey.COHERENCE]: 9,
      },
      costTotal: 1,
      durationMs: 900,
    };

    const metrics = buildComparisonMetrics(baseline, candidate, intl);

    expect(metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'testCases',
          baseline: 4,
          candidate: 5,
          direction: 'neutral',
        }),
        expect.objectContaining({ key: 'score', baseline: 80, candidate: 90, direction: 'higher' }),
        expect.objectContaining({ key: 'ready', baseline: 2, candidate: 4, direction: 'neutral' }),
        expect.objectContaining({
          key: 'fixRounds',
          baseline: 1,
          candidate: 0,
          direction: 'neutral',
        }),
        expect.objectContaining({
          key: 'autoReadyPromoted',
          baseline: 1,
          candidate: 2,
          direction: 'neutral',
        }),
        expect.objectContaining({ key: 'cost', baseline: 1.25, candidate: 1, direction: 'lower' }),
        expect.objectContaining({
          key: 'duration',
          baseline: 1000,
          candidate: 900,
          direction: 'lower',
        }),
      ]),
    );
    Object.values(CriterionKey).forEach((key) => {
      expect(metrics).toContainEqual(expect.objectContaining({ key, direction: 'higher' }));
    });
  });

  test('omits metrics missing from either iteration while preserving numeric zero', () => {
    const metrics = buildComparisonMetrics(
      {
        id: 101,
        number: 1,
        status: IterationStatus.COMPLETED,
        testCasesCount: 0,
        suiteScore: 80,
      },
      { id: 102, number: 2, status: IterationStatus.COMPLETED, testCasesCount: 0 },
      intl,
    );

    expect(metrics).toEqual([
      expect.objectContaining({ key: 'testCases', baseline: 0, candidate: 0 }),
    ]);
  });
});
