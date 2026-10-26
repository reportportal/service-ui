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

import { IterationStatus, type IterationSummaryRS } from 'types/aiFactory';

import { getLatestPair, parseQueryId } from './compareIterationsUtils';

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
});
