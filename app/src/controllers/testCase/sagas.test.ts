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
import { RENAME_FOLDER, DELETE_FOLDER, CREATE_FOLDER } from './constants';

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: jest.fn(),
}));

const fetchMock = fetch as unknown as jest.Mock;

interface AnyAction {
  type: string;
  payload?: { type?: string; message?: string; messageId?: string } & Record<string, unknown>;
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
});
