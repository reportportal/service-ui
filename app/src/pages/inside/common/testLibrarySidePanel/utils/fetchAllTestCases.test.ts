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

import { fetchAllTestCasesByFolderIds, TEST_CASES_FETCH_PAGE_SIZE } from './fetchAllTestCases';

jest.mock('common/utils', () => ({
  fetch: jest.fn(),
}));

const fetchMock = fetch as unknown as jest.Mock;

describe('fetchAllTestCasesByFolderIds', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  test('downloads folders with large pages and passes the abort signal to every request', async () => {
    const controller = new AbortController();
    fetchMock
      .mockResolvedValueOnce({
        content: [{ id: 1 }],
        page: { number: 1, size: TEST_CASES_FETCH_PAGE_SIZE, totalPages: 2 },
      })
      .mockResolvedValueOnce({
        content: [{ id: 2 }],
        page: { number: 2, size: TEST_CASES_FETCH_PAGE_SIZE, totalPages: 2 },
      });

    const testCases = await fetchAllTestCasesByFolderIds('demo', [5], {}, controller.signal);

    expect(testCases.map(({ id }) => id)).toEqual([1, 2]);
    const calls = fetchMock.mock.calls as [string, { signal?: AbortSignal }][];
    expect(calls).toHaveLength(2);
    expect(calls[0][0]).toContain(`limit=${TEST_CASES_FETCH_PAGE_SIZE}`);
    expect(calls[1][0]).toContain(`offset=${TEST_CASES_FETCH_PAGE_SIZE}`);
    calls.forEach(([, params]) => expect(params.signal).toBe(controller.signal));
  });
});
