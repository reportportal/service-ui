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

import { fetchAllMilestoneTestPlans, hasMilestoneTestPlans } from './fetchMilestoneTestPlans';

const mockFetch = jest.fn<Promise<unknown>, [string, ...unknown[]]>();

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: (url: string, ...rest: unknown[]) => mockFetch(url, ...rest),
}));

const milestonePage = (number: number, totalPages: number, planIds: number[]) => ({
  content: [
    {
      id: number,
      testPlans: planIds.map((id) => ({ id, name: `Plan ${id}`, executionStatistic: {} })),
    },
  ],
  page: { number, totalPages },
});

describe('fetchMilestoneTestPlans', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  test('loads every milestone page and collects their test plans', async () => {
    mockFetch
      .mockResolvedValueOnce(milestonePage(1, 3, [1]))
      .mockResolvedValueOnce(milestonePage(2, 3, [2]))
      .mockResolvedValueOnce(milestonePage(3, 3, [3]));

    const plans = await fetchAllMilestoneTestPlans('proj');

    expect(plans.map(({ id }) => id)).toEqual([1, 2, 3]);
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch.mock.calls[2][0]).toContain('offset=200');
  });

  test('stops at the first page that has a linked test plan', async () => {
    mockFetch.mockResolvedValueOnce(milestonePage(1, 50, [1]));

    await expect(hasMilestoneTestPlans('proj')).resolves.toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('reports no test plans when no milestone has one', async () => {
    mockFetch
      .mockResolvedValueOnce(milestonePage(1, 2, []))
      .mockResolvedValueOnce(milestonePage(2, 2, []));

    await expect(hasMilestoneTestPlans('proj')).resolves.toBe(false);
  });
});
