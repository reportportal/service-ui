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

import { put, take } from 'redux-saga/effects';
import { FETCH_USER_ERROR, FETCH_USER_SUCCESS } from 'controllers/user';
import { fetchUserErrorAction } from 'controllers/user/actionCreators';
import { resetTokenAction } from 'controllers/auth';
import { ERROR_UNAUTHORIZED } from 'common/utils/fetch';
import { setInitialDataReadyAction, setServiceAvailabilityAction } from './actionCreators';
import { fetchInitialData } from './sagas';

const advanceToUserResult = () => {
  const gen = fetchInitialData();
  // setToken, availability, fetchAppInfo, take(appInfo)
  gen.next();
  gen.next();
  gen.next();
  gen.next();
  // appInfo success -> fetchUserAction
  gen.next({});
  // -> take user result
  expect(gen.next().value).toEqual(take([FETCH_USER_SUCCESS, FETCH_USER_ERROR]));
  return gen;
};

describe('fetchInitialData', () => {
  it('resets the token when the user request is unauthorized', () => {
    const gen = advanceToUserResult();

    expect(gen.next({ error: true, payload: ERROR_UNAUTHORIZED }).value).toEqual(
      put(resetTokenAction()),
    );
  });

  it.each([
    ['access is denied', { status: 403 }],
    ['access is denied by ErrorRS', { errorCode: 4003 }],
    ['the user no longer exists', { errorCode: 4046 }],
  ])('resets the token when %s', (_, error) => {
    const gen = advanceToUserResult();

    expect(gen.next(fetchUserErrorAction({ message: 'x', ...error })).value).toEqual(
      put(resetTokenAction()),
    );
  });

  it('keeps the token on a not found answer that is not about the user', () => {
    const gen = advanceToUserResult();

    expect(gen.next(fetchUserErrorAction({ message: 'x', status: 404 })).value).toEqual(
      put(setServiceAvailabilityAction({ checked: true, apiUnavailable: true })),
    );
  });

  it('keeps the token and reports the service unavailable on other errors', () => {
    const gen = advanceToUserResult();
    const effects = [];
    let step = gen.next({ error: true, payload: 'Bad gateway' });
    while (!step.done) {
      effects.push(step.value);
      step = gen.next();
    }

    expect(effects).toContainEqual(
      put(setServiceAvailabilityAction({ checked: true, apiUnavailable: true })),
    );
    expect(effects).not.toContainEqual(put(resetTokenAction()));
    expect(effects).toContainEqual(put(setInitialDataReadyAction()));
  });
});
