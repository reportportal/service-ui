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
import { fetch } from 'common/utils';
import { NOTIFICATION_TYPES } from 'controllers/notification';
import { testCaseSagas } from './sagas';
import {
  RENAME_FOLDER,
  DELETE_FOLDER,
  CREATE_FOLDER,
  GET_TEST_CASES_BY_FOLDER_ID,
  GET_ALL_TEST_CASES,
  SET_TEST_CASES,
  STOP_LOADING_TEST_CASES,
  GET_FOLDERS,
  NAMESPACE,
  GET_TEST_CASE_DETAILS,
} from './constants';
import { TEST_CASE_DETAILS_PAGE, TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';
import { FETCH_PROJECT_SUCCESS } from 'controllers/project';
import { FETCH_SUCCESS } from 'controllers/fetch/constants';

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: jest.fn(),
}));

const fetchMock = fetch as unknown as jest.Mock;

interface AnyAction {
  type: string;
  payload?: { type?: string; message?: string; messageId?: string } & Record<string, unknown>;
  meta?: { namespace?: string };
}

const createState = (overrides: Record<string, unknown> = {}) => ({
  project: { info: { projectKey: 'demo' } },
  location: { payload: { organizationSlug: 'org', projectSlug: 'prj' }, query: {} },
  testCase: { folders: { data: [{ id: 1, name: 'A', parentFolderId: null }] }, details: {} },
  ...overrides,
});

type Listener = (action: AnyAction) => void;

const startSagas = (getState: () => Record<string, unknown> = () => createState()) => {
  const dispatched: AnyAction[] = [];
  let listeners: Listener[] = [];
  const io = {
    dispatch: (action: AnyAction) => {
      dispatched.push(action);
      listeners.forEach((listener) => listener(action));
    },
    getState,
    subscribe: (listener: Listener) => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter((item) => item !== listener);
      };
    },
  };
  const task = runSaga(io, testCaseSagas);

  return { dispatched, dispatch: io.dispatch, task };
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const errorNotifications = (dispatched: AnyAction[]) =>
  dispatched.filter(
    (action) =>
      action.type === 'showNotification' && action.payload?.type === NOTIFICATION_TYPES.ERROR,
  );

describe('controllers/testCase/sagas', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  describe('folder mutations', () => {
    test.each([
      [RENAME_FOLDER, { folderId: 1, folderName: 'B' }],
      [DELETE_FOLDER, { folder: { id: 1 }, activeFolderId: 2, setAllTestCases: jest.fn() }],
      [CREATE_FOLDER, { folderName: 'B' }],
    ])('%s shows the backend error message', async (type, payload) => {
      fetchMock.mockRejectedValue({ errorCode: 4091, message: 'Folder already exists' });
      const { dispatched, dispatch, task } = startSagas();

      dispatch({ type, payload });
      await flush();
      task.cancel();

      const [notification] = errorNotifications(dispatched);
      expect(notification.payload.message).toBe('Folder already exists');
      expect(notification.payload.messageId).toBe('');
    });

    test('falls back to a generic message when the backend sends none', async () => {
      fetchMock.mockRejectedValue({});
      const { dispatched, dispatch, task } = startSagas();

      dispatch({ type: RENAME_FOLDER, payload: { folderId: 1, folderName: 'B' } });
      await flush();
      task.cancel();

      expect(errorNotifications(dispatched)[0].payload.messageId).toBe('errorOccurredTryAgain');
    });
  });

  describe('test case lists', () => {
    test('a late folder response does not overwrite the "All test cases" list', async () => {
      let resolveFolder: (value: unknown) => void = () => {};
      const folderPage = { content: [{ id: 1 }], page: { totalElements: 1 } };
      const allPage = { content: [{ id: 2 }, { id: 3 }], page: { totalElements: 2 } };
      fetchMock
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveFolder = resolve;
            }),
        )
        .mockResolvedValueOnce(allPage);
      const { dispatched, dispatch, task } = startSagas();

      dispatch({
        type: GET_TEST_CASES_BY_FOLDER_ID,
        payload: { folderId: 5, offset: 0, limit: 50 },
      });
      dispatch({ type: GET_ALL_TEST_CASES, payload: { offset: 0, limit: 50 } });
      await flush();
      resolveFolder(folderPage);
      await flush();
      task.cancel();

      const lists = dispatched.filter(({ type }) => type === SET_TEST_CASES);
      expect(lists).toEqual([{ type: SET_TEST_CASES, payload: allPage }]);
      expect(dispatched.filter(({ type }) => type === STOP_LOADING_TEST_CASES)).toHaveLength(1);
      const [, folderParams] = fetchMock.mock.calls[0] as [string, { signal: AbortSignal }];
      expect(folderParams.signal.aborted).toBe(true);
    });
  });

  describe('folders', () => {
    test('a folder fetch of the previous project is dropped after a project switch', async () => {
      let resolveFolders: (value: unknown) => void = () => {};
      fetchMock.mockImplementationOnce(
        (_url: string, params: { signal: AbortSignal }) =>
          new Promise((resolve) => {
            resolveFolders = resolve;
            expect(params.signal).toBeDefined();
          }),
      );
      const { dispatched, dispatch, task } = startSagas();

      dispatch({ type: GET_FOLDERS });
      await flush();
      dispatch({ type: FETCH_PROJECT_SUCCESS, payload: {} });
      resolveFolders({ content: [{ id: 9 }], page: { totalPages: 1 } });
      await flush();
      task.cancel();

      const [, params] = fetchMock.mock.calls[0] as [string, { signal: AbortSignal }];
      expect(params.signal.aborted).toBe(true);
      expect(
        dispatched.filter(
          ({ type, meta }) => type === FETCH_SUCCESS && meta?.namespace === NAMESPACE,
        ),
      ).toHaveLength(0);
    });
    test('a folder fetch survives a refresh of the same project', async () => {
      let resolveFolders: (value: unknown) => void = () => {};
      fetchMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFolders = resolve;
          }),
      );
      const { dispatched, dispatch, task } = startSagas();

      dispatch({ type: GET_FOLDERS });
      await flush();
      dispatch({ type: FETCH_PROJECT_SUCCESS, payload: { projectKey: 'demo' } });
      resolveFolders({ content: [{ id: 9 }], page: { totalPages: 1 } });
      await flush();
      task.cancel();

      const [, params] = fetchMock.mock.calls[0] as [string, { signal: AbortSignal }];
      expect(params.signal.aborted).toBe(false);
      expect(
        dispatched.filter(
          ({ type, meta }) => type === FETCH_SUCCESS && meta?.namespace === NAMESPACE,
        ),
      ).toHaveLength(1);
    });
  });

  describe('test case details', () => {
    const run = async (
      error: unknown,
      details?: { id: number },
      pageType: string = TEST_CASE_DETAILS_PAGE,
    ) => {
      fetchMock.mockRejectedValue(error);
      const state = createState({
        location: { type: pageType, payload: { organizationSlug: 'org', projectSlug: 'prj' } },
        testCase: { folders: { data: [] }, details: { data: details } },
      });
      const { dispatched, dispatch, task } = startSagas(() => state);

      dispatch({ type: GET_TEST_CASE_DETAILS, payload: { testCaseId: '7' } });
      await flush();
      task.cancel();

      return {
        redirected: dispatched.some(({ type }) => type === TEST_CASE_LIBRARY_PAGE),
        notifications: dispatched.filter(({ type }) => type === 'showNotification'),
      };
    };

    test('redirects to the library when the test case is not found', async () => {
      const { redirected, notifications } = await run({ errorCode: 40430, message: 'not found' });

      expect(redirected).toBe(true);
      expect(notifications[0].payload.messageId).toBe('redirectWarningMessage');
    });

    test('stays on the page on a transient error while the test case is displayed', async () => {
      const { redirected, notifications } = await run(
        { errorCode: 5000, message: 'boom' },
        { id: 7 },
      );

      expect(redirected).toBe(false);
      expect(notifications[0].payload.message).toBe('boom');
    });

    test('only shows the notification when the details are reloaded from the library list', async () => {
      const { redirected, notifications } = await run(
        { errorCode: 5000, message: 'boom' },
        { id: 99 },
        TEST_CASE_LIBRARY_PAGE,
      );

      expect(redirected).toBe(false);
      expect(notifications[0].payload.message).toBe('boom');
    });

    test('does nothing visible when the request was cancelled', async () => {
      const { redirected, notifications } = await run(new Error('REQUEST_CANCELED'), { id: 7 });

      expect(redirected).toBe(false);
      expect(notifications).toHaveLength(0);
    });
  });
});
