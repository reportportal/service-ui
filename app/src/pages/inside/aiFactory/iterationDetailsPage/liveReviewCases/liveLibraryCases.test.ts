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

import { adaptLiveLibraryCases, getLiveLibraryCases } from './liveLibraryCases';

jest.mock('common/utils', () => ({ fetch: jest.fn() }));

describe('adaptLiveLibraryCases', () => {
  test('preserves the server total and numeric route IDs', () => {
    expect(
      adaptLiveLibraryCases({
        content: [
          {
            id: 9101,
            displayId: 'TC101',
            name: 'Generated case',
            status: 'READY',
            metrics: { overallScore: 0 },
          },
        ],
        page: { totalElements: 51 },
      }),
    ).toEqual({
      cases: [
        {
          id: 9101,
          displayId: 'TC101',
          name: 'Generated case',
          status: 'READY',
          overallScore: 0,
        },
      ],
      totalElements: 51,
    });
  });

  test.each([
    { content: [] },
    { content: [], page: { totalElements: -1 } },
    { content: [{ id: '9101', displayId: 'TC101', name: 'Wrong' }], page: { totalElements: 1 } },
  ])('rejects a malformed page %#', (response) => {
    expect(adaptLiveLibraryCases(response)).toBeNull();
  });

  test('requests one paginated list by numeric iteration ID', async () => {
    const fetchMock = fetch as jest.MockedFunction<
      (url: string, params?: Record<string, unknown>) => Promise<unknown>
    >;
    fetchMock.mockResolvedValue({ content: [], page: { totalElements: 0 } });
    const signal = new AbortController().signal;
    const cases = await getLiveLibraryCases('project', 31, 50, 25, signal);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [[url, options]] = fetchMock.mock.calls;
    const params = new URL(url, 'https://example.test').searchParams;
    expect(params.get('filter.eq.iterationId')).toBe('31');
    expect(params.get('filter.eq.displayId')).toBeNull();
    expect(params.get('offset')).toBe('50');
    expect(params.get('limit')).toBe('25');
    expect(options).toEqual({ signal });
    expect(cases).toEqual({ cases: [], totalElements: 0 });
  });
});
