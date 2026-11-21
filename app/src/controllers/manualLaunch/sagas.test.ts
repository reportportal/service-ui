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
import { FETCH_SUCCESS } from 'controllers/fetch/constants';
import { manualLaunchesSagas } from './sagas';
import { updateManualLaunchExecutionStatusAction } from './actionCreators';
import { MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE } from './constants';

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
});
