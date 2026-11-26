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
import { fetchSuccessAction, fetchErrorAction } from 'controllers/fetch';
import { APP_INFO_NAMESPACE, FETCH_APP_INFO } from 'controllers/appInfo/constants';
import { FETCH_USER, FETCH_USER_SUCCESS, FETCH_USER_ERROR } from 'controllers/user/constants';
import { AUTH_SUCCESS } from 'controllers/auth/constants';
import { fetchInitialData } from './sagas';
import { SET_INITIAL_DATA_READY } from './constants';

jest.mock('routes/routesMap', () => ({
  __esModule: true,
  default: {},
  getRedirectRoute: jest.fn(),
}));

jest.mock('common/utils', () => ({
  ...jest.requireActual('common/utils'),
  getStorageItem: jest.fn(() => null),
}));

// Emulates the sagas and the server the initial data flow talks to: the fetch sagas are not running here.
const run = async ({ userFetchFails = false, appInfoFails = false } = {}) => {
  const dispatched = [];
  const listeners = [];
  const emit = (action) =>
    Promise.resolve().then(() => listeners.forEach((listener) => listener(action)));

  await runSaga(
    {
      subscribe: (listener) => {
        listeners.push(listener);
        return () => {};
      },
      dispatch: (action) => {
        dispatched.push(action);
        if (action.type === FETCH_APP_INFO) {
          emit(
            appInfoFails
              ? fetchErrorAction(APP_INFO_NAMESPACE, new Error('down'), true)
              : fetchSuccessAction(APP_INFO_NAMESPACE, {}),
          );
        }
        if (action.type === FETCH_USER) {
          emit(
            userFetchFails
              ? { type: FETCH_USER_ERROR, error: true }
              : { type: FETCH_USER_SUCCESS, payload: {} },
          );
        }
      },
      getState: () => ({}),
    },
    fetchInitialData,
  ).done;

  return dispatched.map(({ type }) => type);
};

describe('initialData/sagas fetchInitialData', () => {
  test('loads info again once a restored session is authorized, before the data is ready', async () => {
    const types = await run();

    const infoFetches = types.reduce(
      (indexes, type, index) => (type === FETCH_APP_INFO ? [...indexes, index] : indexes),
      [],
    );
    expect(infoFetches).toHaveLength(2);
    expect(infoFetches[1]).toBeGreaterThan(types.indexOf(AUTH_SUCCESS));
    expect(types.indexOf(SET_INITIAL_DATA_READY)).toBeGreaterThan(infoFetches[1]);
  });

  test('loads info once when there is no valid session', async () => {
    const types = await run({ userFetchFails: true });

    expect(types.filter((type) => type === FETCH_APP_INFO)).toHaveLength(1);
    expect(types).not.toContain(AUTH_SUCCESS);
    expect(types[types.length - 1]).toBe(SET_INITIAL_DATA_READY);
  });

  test('stops after the first info request when the API is not available', async () => {
    const types = await run({ appInfoFails: true });

    expect(types.filter((type) => type === FETCH_APP_INFO)).toHaveLength(1);
    expect(types).not.toContain(FETCH_USER);
    expect(types[types.length - 1]).toBe(SET_INITIAL_DATA_READY);
  });
});
