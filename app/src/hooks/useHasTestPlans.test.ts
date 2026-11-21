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

import { hasMilestoneTestPlans } from 'pages/inside/testCaseLibraryPage/addTestCasesToTestPlanModal/fetchMilestoneTestPlans';
import {
  getHasTestPlansPromise,
  resetHasTestPlansCache,
  HAS_TEST_PLANS_CACHE_TTL,
} from './useHasTestPlans';

jest.mock(
  'pages/inside/testCaseLibraryPage/addTestCasesToTestPlanModal/fetchMilestoneTestPlans',
  () => ({ hasMilestoneTestPlans: jest.fn() }),
);

const fetchPlansMock = hasMilestoneTestPlans as unknown as jest.Mock;

describe('getHasTestPlansPromise', () => {
  beforeEach(() => {
    resetHasTestPlansCache();
    fetchPlansMock.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('reuses the answer within the cache lifetime', async () => {
    fetchPlansMock.mockResolvedValue(false);

    await getHasTestPlansPromise('demo');
    await getHasTestPlansPromise('demo');

    expect(fetchPlansMock).toHaveBeenCalledTimes(1);
  });

  test('re-checks after the cache expires, e.g. once a plan was linked to a milestone', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1000);
    fetchPlansMock.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    await expect(getHasTestPlansPromise('demo')).resolves.toBe(false);
    now.mockReturnValue(1000 + HAS_TEST_PLANS_CACHE_TTL);

    await expect(getHasTestPlansPromise('demo')).resolves.toBe(true);
    expect(fetchPlansMock).toHaveBeenCalledTimes(2);
  });
});
