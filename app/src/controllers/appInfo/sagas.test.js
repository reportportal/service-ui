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
import { URLS } from 'common/urls';
import { FETCH_SUCCESS, FETCH_ERROR, fetchSuccessAction } from 'controllers/fetch';
import { fetchAppInfo, fetchAppInfoAndWait } from './sagas';
import { APP_INFO_NAMESPACE, FETCH_APP_INFO } from './constants';

jest.mock('common/utils', () => ({
  ...jest.requireActual('common/utils'),
  fetch: jest.fn(),
}));

const ANONYMOUS_INFO = { build: { name: 'API Service', version: '26.1.0' } };
const UI_INFO = { build: { name: 'UI Service', version: '26.1.0' } };

const runFetchAppInfo = async (authorized) => {
  const dispatched = [];
  await runSaga(
    {
      dispatch: (action) => dispatched.push(action),
      getState: () => ({ auth: { authorized } }),
    },
    fetchAppInfo,
  ).done;
  return dispatched;
};

describe('appInfo/sagas', () => {
  beforeEach(() => {
    fetch.mockReset();
    fetch.mockImplementation((url) =>
      Promise.resolve(url === URLS.appInfoApi() ? ANONYMOUS_INFO : UI_INFO),
    );
  });

  describe('fetchAppInfo', () => {
    test('requests API info without the token while the session is not authorized', async () => {
      const dispatched = await runFetchAppInfo(false);

      expect(fetch).toHaveBeenCalledWith(URLS.appInfoApi(), {
        headers: { Authorization: undefined },
      });
      expect(dispatched[dispatched.length - 1]).toEqual(
        fetchSuccessAction(APP_INFO_NAMESPACE, { api: ANONYMOUS_INFO, ui: UI_INFO, jobs: {} }),
      );
    });

    test('requests API info with the session token once authorized', async () => {
      await runFetchAppInfo(true);

      const [, apiOptions] = fetch.mock.calls.find(([url]) => url === URLS.appInfoApi());
      expect(apiOptions).toEqual({});
    });

    test('never sends the token to the UI service', async () => {
      await runFetchAppInfo(true);

      expect(fetch).toHaveBeenCalledWith(URLS.appInfoUi(), {
        headers: { Authorization: undefined },
      });
    });

    test('reports an error when the API info request fails', async () => {
      fetch.mockImplementation((url) =>
        url === URLS.appInfoApi() ? Promise.reject(new Error('down')) : Promise.resolve(UI_INFO),
      );

      const dispatched = await runFetchAppInfo(true);

      expect(dispatched[dispatched.length - 1]).toMatchObject({
        type: FETCH_ERROR,
        meta: { namespace: APP_INFO_NAMESPACE },
      });
    });
  });

  describe('fetchAppInfoAndWait', () => {
    test('requests info and resolves with the fetch result', async () => {
      const dispatched = [];
      const listeners = [];
      const result = await runSaga(
        {
          subscribe: (listener) => {
            listeners.push(listener);
            return () => {};
          },
          dispatch: (action) => {
            dispatched.push(action);
            if (action.type === FETCH_APP_INFO) {
              Promise.resolve().then(() =>
                listeners.forEach((listener) =>
                  listener(fetchSuccessAction(APP_INFO_NAMESPACE, { api: ANONYMOUS_INFO })),
                ),
              );
            }
          },
          getState: () => ({}),
        },
        fetchAppInfoAndWait,
      ).done;

      expect(dispatched).toEqual([{ type: FETCH_APP_INFO }]);
      expect(result.type).toBe(FETCH_SUCCESS);
    });
  });
});
