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

import { applyMiddleware, combineReducers, createStore, AnyAction } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { FETCH_ERROR, FETCH_START, FETCH_SUCCESS } from 'controllers/fetch/constants';
import { fetchSuccessAction } from 'controllers/fetch';
import { SHOW_NOTIFICATION } from 'controllers/notification/constants';
import { MANUAL_LAUNCHES_PAGE } from 'controllers/pages';
import { fetchSagas } from 'controllers/fetch/sagas';
import { notificationSagas } from 'controllers/notification/sagas';
import { manualLaunchesSagas } from './sagas';
import {
  getManualLaunchAction,
  getManualLaunchesAction,
  getManualLaunchExecutionAction,
  getManualLaunchFoldersAction,
  getManualLaunchTestCaseExecutionsAction,
  updateManualLaunchExecutionStatusAction,
} from './actionCreators';
import { manualLaunchesReducer } from './reducer';
import {
  ACTIVE_MANUAL_LAUNCH_EXECUTION_NAMESPACE,
  MANUAL_LAUNCHES_NAMESPACE,
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

// Also runs the app-wide FETCH_ERROR and notification sagas, so every toast the user sees is counted.
const setupStoreWithNotifications = (state: Record<string, unknown>) => {
  const dispatched: AnyAction[] = [];
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore((s = state, action: AnyAction) => {
    dispatched.push(action);
    return s;
  }, applyMiddleware(sagaMiddleware));
  sagaMiddleware.run(function* rootSaga() {
    yield all([manualLaunchesSagas(), fetchSagas(), notificationSagas()]);
  });
  const toasts = () => dispatched.filter((action) => action.type === SHOW_NOTIFICATION);
  return { store, dispatched, toasts };
};

// Keeps every fetch pending and returns its resolvers, so a test decides when each request finishes.
const deferFetchResponses = () => {
  const resolvers: Array<(value: unknown) => void> = [];
  mockedFetch.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolvers.push(resolve);
      }),
  );
  return resolvers;
};

const dispatchToRunStatusChanges = (
  store: ReturnType<typeof setupStore>['store'],
  executionIds: number[],
  onSuccess: () => void,
) => {
  executionIds.forEach((executionId) => {
    store.dispatch(
      updateManualLaunchExecutionStatusAction({
        projectKey: 'demo',
        launchId: 10,
        executionId,
        status: 'TO_RUN',
        onSuccess,
      }),
    );
  });
};

const twoExecutionsListState = {
  data: { content: [{ id: 1 }, { id: 2 }], page: { totalElements: 2 } },
};

describe('controllers/manualLaunch/sagas', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  test('two status changes in a row both finish and sync the list', async () => {
    const resolvers = deferFetchResponses();
    const { store, dispatched } = setupStore({
      project: { info: { projectKey: 'demo' } },
      location: { type: 'MANUAL_LAUNCH_EXECUTION_PAGE', payload: { launchId: 10 } },
      manualLaunchTestCaseExecutions: twoExecutionsListState,
    });
    const onSuccess = jest.fn();

    dispatchToRunStatusChanges(store, [1, 2], onSuccess);
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

  test('a mutation finished after opening another execution syncs the list but keeps that execution shown', async () => {
    const resolvers = deferFetchResponses();
    const { store, dispatched } = setupStore({
      project: { info: { projectKey: 'demo' } },
      location: {
        type: 'MANUAL_LAUNCH_EXECUTION_PAGE',
        payload: { launchId: '10', executionId: '2' },
      },
      manualLaunchTestCaseExecutions: twoExecutionsListState,
    });
    const onSuccess = jest.fn();

    dispatchToRunStatusChanges(store, [1, 2], onSuccess);
    await flush();

    resolvers[1]({ id: 2, status: 'TO_RUN' });
    await flush();
    resolvers[0]({ id: 1, status: 'TO_RUN' });
    await flush();

    const successesOf = (namespace: string) =>
      dispatched.filter(
        (action) =>
          action.type === FETCH_SUCCESS &&
          (action.meta as { namespace?: string } | undefined)?.namespace === namespace,
      );
    expect(
      successesOf(ACTIVE_MANUAL_LAUNCH_EXECUTION_NAMESPACE).map(
        (action) => (action.payload as { id: number }).id,
      ),
    ).toEqual([2]);
    expect(successesOf(MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE)).toHaveLength(2);
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

  test('a status change finished after moving to another launch does not reload that page', async () => {
    mockedFetch.mockImplementation(() => Promise.resolve({ id: 1, status: 'PASSED' }));
    const { store, dispatched } = setupStore({
      project: { info: { projectKey: 'demo' } },
      location: {
        type: 'MANUAL_LAUNCH_DETAILS_PAGE',
        payload: { launchId: '20' },
        prev: { payload: { launchId: '10' } },
      },
      manualLaunch: { activeManualLaunch: { id: 20 } },
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

    expect(dispatched).not.toContainEqual(getManualLaunchAction({ launchId: 10, force: true }));
    expect(dispatched.map((action) => action.type as string)).not.toContain(
      getManualLaunchFoldersAction({ launchId: 10 }).type,
    );
  });

  test('a silent execution reload keeps the page shown instead of starting a load', async () => {
    mockedFetch.mockResolvedValue({ id: 2 });
    const { store, dispatched } = setupStore({ project: { info: { projectKey: 'demo' } } });

    store.dispatch(getManualLaunchExecutionAction({ launchId: 10, executionId: 2, silent: true }));
    await flush();

    const isExecutionAction = (action: AnyAction) =>
      (action.meta as { namespace?: string } | undefined)?.namespace ===
      ACTIVE_MANUAL_LAUNCH_EXECUTION_NAMESPACE;
    const types = dispatched.filter(isExecutionAction).map((action) => action.type as string);
    expect(types).not.toContain(FETCH_START);
    expect(types).toContain(FETCH_SUCCESS);
  });

  test('a regular execution load starts a load', async () => {
    mockedFetch.mockResolvedValue({ id: 2 });
    const { store, dispatched } = setupStore({ project: { info: { projectKey: 'demo' } } });

    store.dispatch(getManualLaunchExecutionAction({ launchId: 10, executionId: 2 }));
    await flush();

    expect(
      dispatched.some(
        (action) =>
          action.type === FETCH_START &&
          (action.meta as { namespace?: string } | undefined)?.namespace ===
            ACTIVE_MANUAL_LAUNCH_EXECUTION_NAMESPACE,
      ),
    ).toBe(true);
  });

  test('a failed silent folder reload keeps the tree and shows no error', async () => {
    mockedFetch.mockRejectedValue({ errorCode: 5000, message: 'bad gateway' });
    const { store, dispatched } = setupStore({ project: { info: { projectKey: 'demo' } } });

    store.dispatch(getManualLaunchFoldersAction({ launchId: 10, silent: true }));
    await flush();

    expect(dispatched.map((action) => action.type as string)).not.toContain(FETCH_ERROR);
    expect(dispatched.map((action) => action.type as string)).not.toContain(SHOW_NOTIFICATION);
  });

  test('a failed regular folder load still shows the error', async () => {
    mockedFetch.mockRejectedValue({ errorCode: 5000, message: 'bad gateway' });
    const { store, dispatched } = setupStore({ project: { info: { projectKey: 'demo' } } });

    store.dispatch(getManualLaunchFoldersAction({ launchId: 10 }));
    await flush();

    expect(dispatched.map((action) => action.type as string)).toContain(FETCH_ERROR);
  });

  test('a status change uses the comment and BTS tickets of the target execution, not the active one', async () => {
    mockedFetch.mockImplementation(() => Promise.resolve({ id: 2, status: 'PASSED' }));
    const { store } = setupStore({
      project: { info: { projectKey: 'demo' } },
      location: { type: 'MANUAL_LAUNCH_EXECUTION_PAGE', payload: { launchId: 10 } },
      activeManualLaunchExecution: {
        data: {
          id: 1,
          executionComment: { comment: 'comment of A' },
          btsTickets: [{ ticketId: 'A-1' }],
        },
      },
      manualLaunchTestCaseExecutions: {
        data: {
          content: [
            {
              id: 1,
              executionComment: { comment: 'comment of A' },
              btsTickets: [{ ticketId: 'A-1' }],
            },
            {
              id: 2,
              executionComment: { comment: 'comment of B' },
              btsTickets: [{ ticketId: 'B-1' }],
            },
          ],
          page: { totalElements: 2 },
        },
      },
    });

    store.dispatch(
      updateManualLaunchExecutionStatusAction({
        projectKey: 'demo',
        launchId: 10,
        executionId: 2,
        status: 'PASSED',
        preserveExistingCommentIfFormSkipped: true,
      }),
    );
    await flush();

    const patch = (
      mockedFetch.mock.calls as Array<[string, { method?: string; data?: unknown }?]>
    ).find(([, options]) => options?.method === 'PATCH');
    const body = patch?.[1]?.data as { executionComment: { comment: string } };
    expect(body.executionComment.comment).toBe('comment of B');
    expect(JSON.stringify(body)).toContain('B-1');
    expect(JSON.stringify(body)).not.toContain('A-1');
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

    test('a missing launch shows a single redirect toast', async () => {
      mockedFetch.mockRejectedValue({ errorCode: 40430, message: 'not found' });
      const { store, dispatched } = setupStore(launchPageState);

      store.dispatch(getManualLaunchAction({ launchId: '10' }));
      await flush();

      expect(dispatched.filter((action) => action.type === SHOW_NOTIFICATION)).toHaveLength(1);
    });

    test('a 404x code that is not a not-found error stays on the page', async () => {
      mockedFetch.mockRejectedValue({ errorCode: 40412, message: 'unable to create widget' });
      const { store, dispatched } = setupStore(launchPageState);

      store.dispatch(getManualLaunchAction({ launchId: '10' }));
      await flush();

      expect(dispatched.map((action) => action.type as string)).not.toContain(MANUAL_LAUNCHES_PAGE);
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
  describe('toasts of the launch page loads', () => {
    const launchNotFound = { errorCode: 4041, message: "Launch '10' not found." };
    const serverError = { errorCode: 5000, message: 'bad gateway' };
    const launchPageState = {
      project: { info: { projectKey: 'demo' } },
      location: {
        type: 'MANUAL_LAUNCH_DETAILS_PAGE',
        payload: { launchId: '10', organizationSlug: 'org', projectSlug: 'prj' },
      },
    };

    test.each([
      ['folders', () => getManualLaunchFoldersAction({ launchId: 10 })],
      [
        'executions',
        () => getManualLaunchTestCaseExecutionsAction({ launchId: 10, offset: 0, limit: 20 }),
      ],
    ])('a missing launch on the %s load shows no toast', async (_, createAction) => {
      mockedFetch.mockRejectedValue(launchNotFound);
      const { store, toasts } = setupStoreWithNotifications(launchPageState);

      store.dispatch(createAction());
      await flush();

      expect(toasts()).toHaveLength(0);
    });

    test.each([
      ['folders', () => getManualLaunchFoldersAction({ launchId: 10 })],
      [
        'executions',
        () => getManualLaunchTestCaseExecutionsAction({ launchId: 10, offset: 0, limit: 20 }),
      ],
    ])('a server error on the %s load shows exactly one toast', async (_, createAction) => {
      mockedFetch.mockRejectedValue(serverError);
      const { store, toasts } = setupStoreWithNotifications(launchPageState);

      store.dispatch(createAction());
      await flush();

      expect(toasts()).toHaveLength(1);
      expect(toasts()[0].payload).toMatchObject({ messageId: 'errorOccurredTryAgain' });
    });

    test.each([
      ['launch list', () => getManualLaunchesAction()],
      ['execution', () => getManualLaunchExecutionAction({ launchId: 10, executionId: 2 })],
    ])('a server error on the %s load shows exactly one toast', async (_, createAction) => {
      mockedFetch.mockRejectedValue(serverError);
      const { store, toasts } = setupStoreWithNotifications(launchPageState);

      store.dispatch(createAction());
      await flush();

      expect(toasts()).toHaveLength(1);
    });

    test.each([
      [
        'a missing launch',
        () => getManualLaunchTestCaseExecutionsAction({ launchId: '10', offset: 0, limit: 20 }),
      ],
      [
        'an execution of a missing launch',
        () => getManualLaunchExecutionAction({ launchId: '10', executionId: 2 }),
      ],
    ])('opening %s shows only the redirect toast', async (_, createPageLoadAction) => {
      mockedFetch.mockImplementation((url: string) =>
        Promise.reject(
          Object.assign(
            new Error('not found'),
            url === URLS.manualLaunchById('demo', '10') ? { errorCode: 40430 } : launchNotFound,
          ),
        ),
      );
      const { store, toasts } = setupStoreWithNotifications(launchPageState);

      store.dispatch(getManualLaunchAction({ launchId: '10' }));
      store.dispatch(getManualLaunchFoldersAction({ launchId: '10' }));
      store.dispatch(createPageLoadAction());
      await flush();

      expect(toasts()).toHaveLength(1);
      expect(toasts()[0].payload).toMatchObject({
        messageId: 'manualLaunchRedirectWarningMessage',
      });
    });

    test('a launch shown from the store that was deleted meanwhile redirects with one toast', async () => {
      mockedFetch.mockRejectedValue(launchNotFound);
      const { store, dispatched, toasts } = setupStoreWithNotifications({
        project: { info: { projectKey: 'demo' } },
        location: {
          type: 'MANUAL_LAUNCH_EXECUTION_PAGE',
          payload: {
            launchId: '10',
            executionId: '2',
            organizationSlug: 'org',
            projectSlug: 'prj',
          },
          prev: { payload: { launchId: '10' } },
        },
        manualLaunch: { activeManualLaunch: { id: 10 } },
      });

      store.dispatch(getManualLaunchAction({ launchId: '10' }));
      store.dispatch(getManualLaunchExecutionAction({ launchId: '10', executionId: 2 }));
      await flush();

      expect(mockedFetch).toHaveBeenCalledWith(URLS.manualLaunchById('demo', '10'));
      expect(toasts()).toHaveLength(1);
      expect(toasts()[0].payload).toMatchObject({
        messageId: 'manualLaunchRedirectWarningMessage',
      });
      expect(dispatched.map((action) => action.type as string)).toContain(MANUAL_LAUNCHES_PAGE);
    });

    test('a launch taken from the list that was deleted meanwhile redirects with one toast', async () => {
      mockedFetch.mockRejectedValue(launchNotFound);
      const dispatched: AnyAction[] = [];
      const sagaMiddleware = createSagaMiddleware();
      const store = createStore(
        combineReducers({
          project: (state: unknown = { info: { projectKey: 'demo' } }) => state,
          location: (
            state: unknown = {
              type: 'MANUAL_LAUNCH_EXECUTION_PAGE',
              payload: {
                launchId: '10',
                executionId: '2',
                organizationSlug: 'org',
                projectSlug: 'prj',
              },
            },
          ) => state,
          manualLaunch: manualLaunchesReducer,
          notifications: (state: unknown = [], action: AnyAction) => {
            dispatched.push(action);
            return state;
          },
        }),
        applyMiddleware(sagaMiddleware),
      );
      sagaMiddleware.run(function* rootSaga() {
        yield all([manualLaunchesSagas(), fetchSagas(), notificationSagas()]);
      });
      store.dispatch(
        fetchSuccessAction(MANUAL_LAUNCHES_NAMESPACE, {
          data: { content: [{ id: 10 }], page: {} },
        }),
      );

      store.dispatch(getManualLaunchAction({ launchId: '10' }));
      store.dispatch(getManualLaunchExecutionAction({ launchId: '10', executionId: 2 }));
      await flush();

      const toasts = dispatched.filter((action) => action.type === SHOW_NOTIFICATION);
      expect(toasts).toHaveLength(1);
      expect(toasts[0].payload).toMatchObject({
        messageId: 'manualLaunchRedirectWarningMessage',
      });
      expect(dispatched.map((action) => action.type as string)).toContain(MANUAL_LAUNCHES_PAGE);
    });

    test('a missing execution of an existing launch shows one error toast', async () => {
      mockedFetch.mockRejectedValue({ errorCode: 40430, message: "'2' not found." });
      const { store, toasts } = setupStoreWithNotifications(launchPageState);

      store.dispatch(getManualLaunchExecutionAction({ launchId: '10', executionId: 2 }));
      await flush();

      expect(toasts()).toHaveLength(1);
      expect(toasts()[0].payload).toMatchObject({ messageId: 'errorOccurredTryAgain' });
    });
  });
});
