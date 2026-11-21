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

import { runSaga } from 'redux-saga';

import { PROJECT_MILESTONES_PAGE } from 'controllers/pages';

import { getTestPlanAction, type GetTestPlanParams } from './actionCreators';
import { getTestPlan } from './sagas';

const mockFetch = jest.fn();

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: (...args: unknown[]) => mockFetch(...args) as unknown,
}));

const locationPayload = { organizationSlug: 'org', projectSlug: 'proj', testPlanId: '5' };

let prevPayload: Record<string, string> = {};

const runGetTestPlan = async (params: Partial<GetTestPlanParams> = {}) => {
  const dispatched: Array<{ type: string; payload?: Record<string, unknown> }> = [];

  await runSaga(
    {
      dispatch: (action: { type: string }) => dispatched.push(action),
      getState: () => ({
        project: { info: { projectKey: 'proj' } },
        location: { payload: locationPayload, prev: { payload: prevPayload } },
      }),
    },
    getTestPlan,
    getTestPlanAction({ testPlanId: 5, ...params }),
  ).done;

  return dispatched;
};

describe('getTestPlan saga', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    prevPayload = {};
  });

  test('redirects to milestones when the plan is not found', async () => {
    mockFetch.mockRejectedValueOnce({ errorCode: 40430, message: 'Test plan not found' });

    const dispatched = await runGetTestPlan();

    expect(dispatched.map(({ type }) => type)).toContain(PROJECT_MILESTONES_PAGE);
  });

  test('shows the error and stays on the page when loading fails for another reason', async () => {
    mockFetch.mockRejectedValueOnce({ errorCode: 5000, message: 'Statistics failed' });

    const dispatched = await runGetTestPlan();

    expect(dispatched.map(({ type }) => type)).not.toContain(PROJECT_MILESTONES_PAGE);
    expect(dispatched).toContainEqual(
      expect.objectContaining({
        payload: expect.objectContaining({
          type: 'error',
          message: 'Statistics failed',
        }) as unknown,
      }),
    );
  });

  test('reloads the plan header and folders in place when forced on the same plan', async () => {
    prevPayload = locationPayload;
    mockFetch.mockResolvedValue({ id: 5, content: [] });

    await runGetTestPlan({ folderId: '12', offset: 100, limit: 50, forceReloadPlan: true });

    const urls = mockFetch.mock.calls.map(([url]) => String(url));
    expect(urls).toHaveLength(3);
    expect(urls[0]).toContain('/tms/test-plan/5');
    expect(urls[2]).toContain('filter.eq.testFolderId=12');
    expect(urls[2]).toContain('offset=100');
  });

  test('does not refetch the plan on the same plan without the flag', async () => {
    prevPayload = locationPayload;
    mockFetch.mockResolvedValue({ content: [] });

    await runGetTestPlan();

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
