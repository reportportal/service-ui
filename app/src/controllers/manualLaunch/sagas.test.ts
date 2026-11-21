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

import { applyMiddleware, createStore, AnyAction } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { FETCH_ERROR, FETCH_SUCCESS } from 'controllers/fetch/constants';
import { MANUAL_LAUNCHES_PAGE } from 'controllers/pages';
import { manualLaunchesSagas } from './sagas';
import {
  getManualLaunchAction,
  getManualLaunchFoldersAction,
  updateManualLaunchExecutionStatusAction,
} from './actionCreators';
import {
  MANUAL_LAUNCH_FOLDERS_NAMESPACE,
  MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE,
} from './constants';
import { buildGetManualLaunchFoldersParams } from './manualLaunchDetailsFetchParams';
import { ExecutionStatus } from 'types/testCase';

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: jest.fn(),
}));

const mockedFetch = fetch as unknown as jest.Mock;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const setupStore = (state: Record<string, unknown>) => {
  const dispatched: AnyAction[] = [];
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore((s = state, action: AnyAction) => {
    dispatched.push(action);
    return s;
  }, applyMiddleware(sagaMiddleware));
  sagaMiddleware.run(manualLaunchesSagas);
  return { store, dispatched };
};

describe('controllers/manualLaunch/sagas', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  test('two status changes in a row both finish and sync the list', async () => {
    const resolvers: Array<(value: unknown) => void> = [];
    mockedFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvers.push(resolve);
        }),
    );
    const { store, dispatched } = setupStore({
      project: { info: { projectKey: 'demo' } },
      location: { type: 'MANUAL_LAUNCH_EXECUTION_PAGE', payload: { launchId: 10 } },
      manualLaunchTestCaseExecutions: {
        data: { content: [{ id: 1 }, { id: 2 }], page: { totalElements: 2 } },
      },
    });
    const onSuccess = jest.fn();

    store.dispatch(
      updateManualLaunchExecutionStatusAction({
        projectKey: 'demo',
        launchId: 10,
        executionId: 1,
        status: 'TO_RUN',
        onSuccess,
      }),
    );
    store.dispatch(
      updateManualLaunchExecutionStatusAction({
        projectKey: 'demo',
        launchId: 10,
        executionId: 2,
        status: 'TO_RUN',
        onSuccess,
      }),
    );
    await flush();

    expect(resolvers).toHaveLength(2);
    resolvers[0]({ id: 1, status: 'TO_RUN' });
    resolvers[1]({ id: 2, status: 'TO_RUN' });
    await flush();

    const listSyncs = dispatched.filter(
      (action) =>
        action.type === FETCH_SUCCESS &&
        (action.meta as { namespace?: string } | undefined)?.namespace ===
          MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE,
    );
    expect(listSyncs).toHaveLength(2);
    expect(onSuccess).toHaveBeenCalledTimes(2);
  });

  test('loads every folder of the launch page by page, keeping the status filter', async () => {
    const folders = Array.from({ length: 130 }, (_, index) => ({ id: index + 1 }));
    mockedFetch.mockImplementation((url: string) => {
      const offset = Number(/offset=(\d+)/.exec(url)?.[1] ?? 0);

      return Promise.resolve({
        content: folders.slice(offset, offset + 100),
        page: { totalElements: folders.length },
      });
    });
    const { store, dispatched } = setupStore({ project: { info: { projectKey: 'demo' } } });

    store.dispatch(
      getManualLaunchFoldersAction(
        buildGetManualLaunchFoldersParams(
          { statusFilter: ExecutionStatus.TO_RUN } as Parameters<
            typeof buildGetManualLaunchFoldersParams
          >[0],
          10,
        ),
      ),
    );
    await flush();

    expect(mockedFetch).toHaveBeenCalledTimes(2);
    mockedFetch.mock.calls.forEach(([url]: [string]) => {
      expect(url).toContain('testCaseExecutionStatus=TO_RUN');
    });
    const success = dispatched.find(
      (action) =>
        action.type === FETCH_SUCCESS &&
        (action.meta as { namespace?: string } | undefined)?.namespace ===
          MANUAL_LAUNCH_FOLDERS_NAMESPACE,
    );
    expect((success?.payload as { data: { content: unknown[] } }).data.content).toHaveLength(130);
  });

  test('a status change on the launch page reloads the launch statistics and folder counters', async () => {
    mockedFetch.mockImplementation((url: string) =>
      Promise.resolve(url.includes('folder') ? { content: [], page: { totalElements: 0 } } : {}),
    );
    const { store, dispatched } = setupStore({
      project: { info: { projectKey: 'demo' } },
      location: {
        type: 'MANUAL_LAUNCH_DETAILS_PAGE',
        payload: { launchId: '10' },
        prev: { payload: { launchId: '10' } },
        query: { statusFilter: 'TO_RUN' },
      },
      manualLaunch: { activeManualLaunch: { id: 10 } },
    });

    store.dispatch(
      updateManualLaunchExecutionStatusAction({
        projectKey: 'demo',
        launchId: 10,
        executionId: 1,
        status: 'PASSED',
      }),
    );
    await flush();

    expect(dispatched).toContainEqual(getManualLaunchAction({ launchId: 10, force: true }));
    expect(dispatched).toContainEqual(
      getManualLaunchFoldersAction({
        launchId: 10,
        statusFilter: ExecutionStatus.TO_RUN,
        silent: true,
      }),
    );
    // The launch is already in the store for the same route, yet "force" fetches it again.
    expect(mockedFetch).toHaveBeenCalledWith(URLS.manualLaunchById('demo', 10));
  });

  describe('launch load errors', () => {
    const launchPageState = {
      project: { info: { projectKey: 'demo' } },
      location: {
        type: 'MANUAL_LAUNCH_DETAILS_PAGE',
        payload: { launchId: '10', organizationSlug: 'org', projectSlug: 'prj' },
      },
    };

    test('a missing launch redirects to the launch list', async () => {
      mockedFetch.mockRejectedValue({ errorCode: 40430, message: 'not found' });
      const { store, dispatched } = setupStore(launchPageState);

      store.dispatch(getManualLaunchAction({ launchId: '10' }));
      await flush();

      expect(dispatched.map((action) => action.type as string)).toContain(MANUAL_LAUNCHES_PAGE);
    });

    test('any other error stays on the page', async () => {
      mockedFetch.mockRejectedValue({ errorCode: 5000, message: 'statistics failed' });
      const { store, dispatched } = setupStore(launchPageState);

      store.dispatch(getManualLaunchAction({ launchId: '10' }));
      await flush();

      expect(dispatched.map((action) => action.type as string)).not.toContain(MANUAL_LAUNCHES_PAGE);
      expect(dispatched.map((action) => action.type as string)).toContain(FETCH_ERROR);
    });
  });
});
