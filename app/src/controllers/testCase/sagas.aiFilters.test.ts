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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';

import { getAllTestCasesAction, getTestCaseByFolderIdAction } from './actionCreators';
import { CLEAR_TEST_CASES, STOP_LOADING_TEST_CASES } from './constants';
import { testCaseSagas } from './sagas';

jest.mock('common/utils', () => {
  const actual = jest.requireActual<typeof import('common/utils')>('common/utils');

  return {
    ...actual,
    delayedPut: jest.fn(),
    fetch: jest.fn(),
  };
});

const runRequest = async (
  action:
    | ReturnType<typeof getAllTestCasesAction>
    | ReturnType<typeof getTestCaseByFolderIdAction>,
  result: 'success' | 'failure' = 'success',
) => {
  const fetchMock = fetch as unknown as jest.Mock;
  const subscribers: ((action: unknown) => void)[] = [];
  const dispatched: unknown[] = [];
  let notifyFetch: () => void = () => undefined;
  const fetchStarted = new Promise<void>((resolve) => {
    notifyFetch = resolve;
  });
  let notifyComplete: () => void = () => undefined;
  const requestComplete = new Promise<void>((resolve) => {
    notifyComplete = resolve;
  });

  fetchMock.mockImplementationOnce(() => {
    notifyFetch();
    return result === 'success'
      ? Promise.resolve({
          content: [],
          page: { number: 1, size: 50, totalElements: 0, totalPages: 0 },
        })
      : Promise.reject(new Error('request failed'));
  });

  const task = runSaga(
    {
      subscribe: (subscriber: (action: unknown) => void) => {
        subscribers.push(subscriber);
        return () => {
          const index = subscribers.indexOf(subscriber);
          if (index >= 0) subscribers.splice(index, 1);
        };
      },
      dispatch: (dispatchedAction) => {
        dispatched.push(dispatchedAction);
        if ((dispatchedAction as { type?: string }).type === STOP_LOADING_TEST_CASES) {
          notifyComplete();
        }
      },
      getState: () => ({ project: { info: { projectKey: 'demo' } } }),
    },
    testCaseSagas,
  );

  await Promise.resolve();
  subscribers.slice().forEach((subscriber) => subscriber(action));
  await fetchStarted;
  await requestComplete;
  task.cancel();
  await task.done;

  return dispatched;
};

describe('test case AI filter transport mapping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('maps normalized AI filters to C3 query params for the all-cases request', async () => {
    await runRequest(
      getAllTestCasesAction({
        offset: 50,
        limit: 25,
        testCasesSearchParams: 'login',
        lifecycle: 'DRAFT',
        hasAi: false,
        iterationId: 103,
      }),
    );

    expect(fetch).toHaveBeenCalledWith(
      URLS.testCases('demo', {
        offset: 50,
        limit: 25,
        'filter.cnt.name': 'login',
        'filter.eq.lifecycle': 'DRAFT',
        'filter.eq.ai': false,
        'filter.eq.iterationId': 103,
      }),
    );
  });

  test('maps normalized AI filters to C3 query params for a folder request', async () => {
    await runRequest(
      getTestCaseByFolderIdAction({
        folderId: 7,
        offset: 0,
        limit: 50,
        filterPriorities: 'HIGH',
        filterTags: 'smoke',
        lifecycle: 'READY',
        hasAi: true,
        iterationId: 101,
      }),
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    const requestUrl = jest.mocked(fetch).mock.calls[0][0];
    const query = new URL(requestUrl, 'http://localhost').searchParams;

    expect(query.get('filter.eq.testFolderId')).toBe('7');
    expect(query.get('filter.eq.lifecycle')).toBe('READY');
    expect(query.get('filter.eq.ai')).toBe('true');
    expect(query.get('filter.eq.iterationId')).toBe('101');
    expect(query.get('offset')).toBe('0');
    expect(query.get('limit')).toBe('50');
  });

  test.each([
    [
      'all-cases',
      getAllTestCasesAction({
        offset: 0,
        limit: 50,
        lifecycle: 'DRAFT',
      }),
    ],
    [
      'folder',
      getTestCaseByFolderIdAction({
        folderId: 7,
        offset: 0,
        limit: 50,
        hasAi: true,
      }),
    ],
  ])('clears stale test cases when an AI-filtered %s request fails', async (_name, action) => {
    const dispatched = await runRequest(action, 'failure');

    expect(dispatched).toContainEqual({ type: CLEAR_TEST_CASES });
  });

  test.each([
    [
      'all-cases',
      getAllTestCasesAction({
        offset: 0,
        limit: 50,
        testCasesSearchParams: 'login',
      }),
    ],
    [
      'folder',
      getTestCaseByFolderIdAction({
        folderId: 7,
        offset: 0,
        limit: 50,
        filterPriorities: 'HIGH',
      }),
    ],
  ])('preserves stale test cases when a legacy %s request fails', async (_name, action) => {
    const dispatched = await runRequest(action, 'failure');

    expect(dispatched).not.toContainEqual({ type: CLEAR_TEST_CASES });
  });
});
