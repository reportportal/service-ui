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

import type { LocationQuery } from 'types/store';

import { getTestCaseAiFilterParams, getTestCaseAiQueryParams } from './actionCreators';

describe('test case AI filter query normalization', () => {
  test.each([
    [{ lifecycle: 'DRAFT' }, { lifecycle: 'DRAFT' }, { lifecycle: 'DRAFT' }],
    [{ lifecycle: 'READY' }, { lifecycle: 'READY' }, { lifecycle: 'READY' }],
    [{ ai: 'AI' }, { ai: 'AI' }, { hasAi: true }],
    [{ ai: 'NO_AI' }, { ai: 'NO_AI' }, { hasAi: false }],
    [{ iteration: '103' }, { iteration: '103' }, { iterationId: 103 }],
  ])('normalizes supported query %p', (query, expectedQuery, expectedTransport) => {
    expect(getTestCaseAiQueryParams(query as LocationQuery)).toEqual(expectedQuery);
    expect(getTestCaseAiFilterParams(query as LocationQuery)).toEqual(expectedTransport);
  });

  test('keeps all valid AI filters and ignores unrelated query values', () => {
    const query = {
      lifecycle: 'DRAFT',
      ai: 'NO_AI',
      iteration: '101',
      offset: '50',
      filterTags: 'smoke',
    } as LocationQuery;

    expect(getTestCaseAiQueryParams(query)).toEqual({
      lifecycle: 'DRAFT',
      ai: 'NO_AI',
      iteration: '101',
    });
    expect(getTestCaseAiFilterParams(query)).toEqual({
      lifecycle: 'DRAFT',
      hasAi: false,
      iterationId: 101,
    });
  });

  test.each([
    undefined,
    {},
    { lifecycle: 'draft' },
    { lifecycle: 'APPROVED' },
    { ai: 'yes' },
    { ai: 'false' },
    { iteration: '' },
    { iteration: '0' },
    { iteration: '-1' },
    { iteration: '1.5' },
    { iteration: '1e2' },
    { iteration: '9007199254740992' },
  ])('drops malformed AI query values from %p', (query) => {
    expect(getTestCaseAiQueryParams(query as LocationQuery | undefined)).toEqual({});
    expect(getTestCaseAiFilterParams(query as LocationQuery | undefined)).toEqual({});
  });
});
