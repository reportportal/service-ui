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
import { fetch, ERROR_CANCELED, ERROR_UNAUTHORIZED } from 'common/utils/fetch';
import { showDefaultErrorNotification } from 'controllers/notification';
import { LAUNCHES_FILTERS_UPDATE_NAMESPACE } from 'controllers/filter/constants';
import { fetchData, handleError } from './sagas';
import {
  fetchDataAction,
  fetchErrorAction,
  fetchStartAction,
  fetchSuccessAction,
} from './actionCreators';
import { FETCH_ERROR, FETCH_SUCCESS } from './constants';

jest.mock('common/utils/fetch', () => ({
  ...jest.requireActual('common/utils/fetch'),
  fetch: jest.fn(),
}));

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const mockControlledFetch = () => {
  const requests = [];
  fetch.mockImplementation((url, options) => {
    const request = { url, options, cancel: jest.fn(), ...deferred() };
    options.abort(request.cancel);
    requests.push(request);
    return request.promise;
  });
  return requests;
};

const run = (saga, action, dispatched) =>
  runSaga({ dispatch: (a) => dispatched.push(a), getState: () => ({}) }, saga, action).done;

const resultsOf = (dispatched) =>
  dispatched.filter(({ type }) => type === FETCH_SUCCESS || type === FETCH_ERROR);

describe('controllers/fetch/sagas', () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  describe('fetchData', () => {
    test('aborts a superseded request of the same namespace and never dispatches its result', async () => {
      const requests = mockControlledFetch();
      const dispatched = [];
      const first = run(fetchData, fetchDataAction('users')('/users?filter=a'), dispatched);
      const second = run(fetchData, fetchDataAction('users')('/users?filter=ab'), dispatched);

      expect(requests[0].cancel).toHaveBeenCalledTimes(1);
      requests[1].resolve({ content: ['ab'] });
      requests[0].resolve({ content: ['a'] });
      await Promise.all([first, second]);

      expect(resultsOf(dispatched)).toEqual([fetchSuccessAction('users', { content: ['ab'] })]);
    });

    test('drops the error of a superseded request', async () => {
      const requests = mockControlledFetch();
      const dispatched = [];
      const first = run(fetchData, fetchDataAction('users')('/users?page=1'), dispatched);
      const second = run(fetchData, fetchDataAction('users')('/users?page=2'), dispatched);

      requests[0].reject(new Error(ERROR_CANCELED));
      requests[1].resolve({ content: [2] });
      await Promise.all([first, second]);

      expect(resultsOf(dispatched)).toEqual([fetchSuccessAction('users', { content: [2] })]);
    });

    test('keeps requests of different namespaces independent', async () => {
      const requests = mockControlledFetch();
      const dispatched = [];
      const first = run(fetchData, fetchDataAction('users')('/users'), dispatched);
      const second = run(fetchData, fetchDataAction('projects')('/projects'), dispatched);

      requests[1].resolve('projects');
      requests[0].resolve('users');
      await Promise.all([first, second]);

      expect(requests[0].cancel).not.toHaveBeenCalled();
      expect(resultsOf(dispatched)).toEqual([
        fetchSuccessAction('projects', 'projects'),
        fetchSuccessAction('users', 'users'),
      ]);
    });

    test('runs write requests of the filters update namespace in parallel', async () => {
      const requests = mockControlledFetch();
      const dispatched = [];
      const action = fetchDataAction(LAUNCHES_FILTERS_UPDATE_NAMESPACE);
      const first = run(fetchData, action('/filter', { method: 'post', data: 1 }), dispatched);
      const second = run(fetchData, action('/filter', { method: 'post', data: 2 }), dispatched);

      requests[1].resolve({ id: 2 });
      requests[0].resolve({ id: 1 });
      await Promise.all([first, second]);

      expect(requests[0].cancel).not.toHaveBeenCalled();
      expect(resultsOf(dispatched)).toEqual([
        fetchSuccessAction(LAUNCHES_FILTERS_UPDATE_NAMESPACE, { id: 2 }),
        fetchSuccessAction(LAUNCHES_FILTERS_UPDATE_NAMESPACE, { id: 1 }),
      ]);
    });

    test('dispatches start and error for a single failing request', async () => {
      const error = { message: 'boom' };
      fetch.mockRejectedValue(error);
      const dispatched = [];
      const action = fetchDataAction('users', true)('/users');
      await run(fetchData, action, dispatched);

      expect(dispatched).toEqual([
        fetchStartAction('users', action.payload),
        fetchErrorAction('users', error, true),
      ]);
    });
  });

  describe('handleError', () => {
    test('shows the default error notification', async () => {
      const dispatched = [];
      await run(handleError, fetchErrorAction('users', { message: 'boom' }), dispatched);
      expect(dispatched).toEqual([showDefaultErrorNotification({ message: 'boom' })]);
    });

    test.each([ERROR_UNAUTHORIZED, ERROR_CANCELED])(
      'does not show a notification for the %s sentinel',
      async (message) => {
        const dispatched = [];
        await run(handleError, fetchErrorAction('users', new Error(message)), dispatched);
        expect(dispatched).toEqual([]);
      },
    );
  });
});
