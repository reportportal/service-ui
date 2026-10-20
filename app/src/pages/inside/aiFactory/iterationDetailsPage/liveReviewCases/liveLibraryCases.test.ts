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

import { fetch } from 'common/utils';

import { adaptLiveLibraryCase, getLiveLibraryCases } from './liveLibraryCases';

jest.mock('common/utils', () => ({ fetch: jest.fn() }));

describe('adaptLiveLibraryCase', () => {
  test('accepts one exact display ID with a numeric route ID', () => {
    expect(
      adaptLiveLibraryCase(
        {
          content: [
            {
              id: 9101,
              displayId: 'TC101',
              name: 'Generated case',
              status: 'READY',
              metrics: { overallScore: 94 },
            },
          ],
          page: { totalElements: 1 },
        },
        'TC101',
      ),
    ).toEqual({
      id: 9101,
      displayId: 'TC101',
      name: 'Generated case',
      status: 'READY',
      overallScore: 94,
    });
  });

  test.each([
    [{ content: [], page: { totalElements: 0 } }, 'TC101'],
    [{ content: [{ id: 9101, displayId: 'TC102', name: 'Wrong' }] }, 'TC101'],
    [
      { content: [{ id: 9101, displayId: 'TC101', name: 'One' }], page: { totalElements: 2 } },
      'TC101',
    ],
  ])('rejects absent, mismatched, or ambiguous results', (response, displayId) => {
    expect(adaptLiveLibraryCase(response, displayId)).toBeNull();
  });

  test('queries the exact display ID and keeps an unresolved case unavailable', async () => {
    const fetchMock = fetch as jest.MockedFunction<
      (url: string, params?: Record<string, unknown>) => Promise<unknown>
    >;
    fetchMock.mockResolvedValue({ content: [], page: { totalElements: 0 } });
    const cases = await getLiveLibraryCases('project', ['TC101'], new AbortController().signal);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('filter.eq.displayId=TC101'), {
      signal: expect.any(AbortSignal),
    });
    expect(cases).toEqual([{ displayId: 'TC101', testCase: null }]);
  });
});
