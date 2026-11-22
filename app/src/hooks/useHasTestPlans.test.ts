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
import {
  getHasTestPlansPromise,
  hasMilestoneTestPlans,
  resetHasTestPlansCache,
  HAS_TEST_PLANS_CACHE_TTL,
} from './useHasTestPlans';

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: jest.fn(),
}));

const fetchMock = fetch as unknown as jest.Mock;

const pageWithTotal = (totalElements: number) => ({
  content: [],
  page: { number: 0, size: 1, totalElements, totalPages: totalElements },
});

describe('hasMilestoneTestPlans', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  test('asks the server for one milestone-linked test plan only', async () => {
    fetchMock.mockResolvedValue(pageWithTotal(3));

    await expect(hasMilestoneTestPlans('demo')).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestedUrl] = fetchMock.mock.calls[0] as [string];
    const url = new URL(requestedUrl, 'http://localhost');
    expect(url.pathname).toMatch(/project\/demo\/tms\/test-plan$/);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      'filter.ex.milestoneId': 'true',
      limit: '1',
      offset: '0',
    });
  });

  test('is false when no test plan is linked to a milestone', async () => {
    fetchMock.mockResolvedValue(pageWithTotal(0));

    await expect(hasMilestoneTestPlans('demo')).resolves.toBe(false);
  });
});

describe('getHasTestPlansPromise', () => {
  beforeEach(() => {
    resetHasTestPlansCache();
    fetchMock.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('reuses the answer within the cache lifetime', async () => {
    fetchMock.mockResolvedValue(pageWithTotal(0));

    await getHasTestPlansPromise('demo');
    await getHasTestPlansPromise('demo');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('re-checks after the cache expires, e.g. once a plan was linked to a milestone', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1000);
    fetchMock.mockResolvedValueOnce(pageWithTotal(0)).mockResolvedValueOnce(pageWithTotal(1));

    await expect(getHasTestPlansPromise('demo')).resolves.toBe(false);
    now.mockReturnValue(1000 + HAS_TEST_PLANS_CACHE_TTL);

    await expect(getHasTestPlansPromise('demo')).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
