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
import { userRolesSelector } from 'controllers/pages';
import { FETCH_DATA } from 'controllers/fetch/constants';
import { fetchErrorAction, fetchSuccessAction } from 'controllers/fetch';
import { SHOW_DEFAULT_ERROR_NOTIFICATION } from 'controllers/notification/constants';
import { updateLoadingAction } from './actionCreators';
import { SAUCE_LABS_JOB_INFO_COMMAND, SAUCE_LABS_LOGS_COMMAND } from './constants';
import { bulkExecuteSauceLabsCommands } from './sagas';

jest.mock('controllers/pages', () => ({
  ...jest.requireActual('controllers/pages'),
  userRolesSelector: jest.fn(),
}));

jest.mock('controllers/plugins', () => ({
  ...jest.requireActual('controllers/plugins'),
  availableIntegrationsByPluginNameSelector: () => [{ id: 7 }],
}));

const VIEWER = { userRole: 'USER', organizationRole: 'MEMBER', projectRole: 'VIEWER' };
const EDITOR = { userRole: 'USER', organizationRole: 'MEMBER', projectRole: 'EDITOR' };

// Answers every plugin command request with the result built by respond(namespace).
const runBulk = (respond) => {
  const listeners = [];
  const dispatched = [];
  const store = {
    getState: () => ({}),
    subscribe: (listener) => {
      listeners.push(listener);
      return () => listeners.splice(listeners.indexOf(listener), 1);
    },
    dispatch: (action) => {
      dispatched.push(action);
      listeners.slice().forEach((listener) => listener(action));
      if (action.type === FETCH_DATA) {
        Promise.resolve().then(() => store.dispatch(respond(action.meta.namespace)));
      }
      return action;
    },
  };
  const action = {
    payload: { commands: [SAUCE_LABS_JOB_INFO_COMMAND, SAUCE_LABS_LOGS_COMMAND], data: {} },
  };
  return runSaga(store, bulkExecuteSauceLabsCommands, action).done.then(() => dispatched);
};

describe('controllers/log/sauceLabs/sagas', () => {
  test('a project viewer issues no plugin commands', async () => {
    userRolesSelector.mockReturnValue(VIEWER);
    const dispatched = await runBulk((namespace) => fetchSuccessAction(namespace, {}));

    expect(dispatched).toEqual([updateLoadingAction(false)]);
  });

  test('a forbidden command shows no error notification', async () => {
    userRolesSelector.mockReturnValue(EDITOR);
    const dispatched = await runBulk((namespace) =>
      fetchErrorAction(namespace, { errorCode: 4003, message: 'Forbidden' }, true),
    );

    expect(dispatched.filter(({ type }) => type === FETCH_DATA)).toHaveLength(2);
    expect(dispatched.some(({ type }) => type === SHOW_DEFAULT_ERROR_NOTIFICATION)).toBe(false);
    expect(dispatched[dispatched.length - 1]).toEqual(updateLoadingAction(false));
  });

  test('other command errors are still reported', async () => {
    userRolesSelector.mockReturnValue(EDITOR);
    const dispatched = await runBulk((namespace) =>
      fetchErrorAction(namespace, { errorCode: 5000, message: 'Sauce Labs is down' }, true),
    );

    expect(dispatched.filter(({ type }) => type === SHOW_DEFAULT_ERROR_NOTIFICATION)).toHaveLength(
      2,
    );
  });
});
