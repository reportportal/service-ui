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

import { put, select, take } from 'redux-saga/effects';
import { LOGIN_PAGE, pagePropertiesSelector } from 'controllers/pages';
import { SHOW_NOTIFICATION } from 'controllers/notification/constants';

jest.mock('common/utils/fetch', () => ({
  fetch: jest.fn(() => Promise.resolve()),
  abortPendingRequests: jest.fn(),
  updateToken: jest.fn(),
}));
jest.mock('routes/routesMap', () => ({
  __esModule: true,
  default: {},
  getRedirectRoute: jest.fn(),
}));

import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';
import { ACTIVITY_TIMESTAMP } from 'controllers/user/constants';
import {
  logoutAction,
  logoutCompleteAction,
  loginSuccessAction,
  resetTokenAction,
} from './actionCreators';
import { DEFAULT_TOKEN, LOGOUT_COMPLETE, TOKEN_KEY } from './constants';
import { isAuthorizedSelector, tokenSelector } from './selectors';
import { handleLogout, handleOauthSuccess, handleSetToken } from './sagas';

const OLD_TOKEN = { type: 'Bearer', value: 'old' };
const NEW_TOKEN = { type: 'Bearer', value: 'new' };
const OLD_TOKEN_STRING = 'Bearer old';

const runLogoutUntilReset = () => {
  const gen = handleLogout({ payload: undefined });
  expect(gen.next().value).toEqual(select(tokenSelector));
  gen.next(OLD_TOKEN_STRING); // grafana revoke + call(logoutOnServer)
  gen.next(); // call(abortPendingRequests)
  return gen;
};

describe('auth sagas: multi-tab token handling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('handleLogout', () => {
    it('removes the activity timestamp when the stored token is the revoked one', () => {
      setStorageItem(TOKEN_KEY, OLD_TOKEN);
      setStorageItem(ACTIVITY_TIMESTAMP, 123);
      const gen = runLogoutUntilReset();

      expect(gen.next().value).toEqual(put(resetTokenAction(OLD_TOKEN_STRING)));
      expect(getStorageItem(ACTIVITY_TIMESTAMP)).toBeNull();
    });

    it('clears the cached BTS tickets', () => {
      setStorageItem(TOKEN_KEY, OLD_TOKEN);
      setStorageItem('5_proj_tickets', { a: {} });
      const gen = runLogoutUntilReset();
      gen.next();

      expect(getStorageItem('5_proj_tickets')).toBeNull();
    });

    it('keeps the activity timestamp of a newer session stored by another tab', () => {
      setStorageItem(TOKEN_KEY, NEW_TOKEN);
      setStorageItem(ACTIVITY_TIMESTAMP, 123);
      const gen = runLogoutUntilReset();

      expect(gen.next().value).toEqual(put(resetTokenAction(OLD_TOKEN_STRING)));
      expect(getStorageItem(ACTIVITY_TIMESTAMP)).toBe(123);
    });
  });

  describe('silent logout', () => {
    const runToEnd = (action) => {
      setStorageItem(TOKEN_KEY, OLD_TOKEN);
      const gen = handleLogout(action);
      const effects = [];
      let step = gen.next();
      step = gen.next(OLD_TOKEN_STRING);
      while (!step.done) {
        effects.push(step.value);
        step = gen.next();
      }
      return effects;
    };
    const puts = (effects) => effects.filter(({ PUT }) => PUT).map(({ PUT }) => PUT.action);

    it('only resets the token and clears the store when the session is replaced', () => {
      expect(puts(runToEnd(logoutAction(undefined, { silent: true })))).toEqual([
        resetTokenAction(OLD_TOKEN_STRING),
        logoutCompleteAction(),
      ]);
    });

    it('redirects to the login page and tells the user on a normal logout', () => {
      const types = puts(runToEnd(logoutAction())).map(({ type }) => type);

      expect(types).toEqual(
        expect.arrayContaining([LOGIN_PAGE, logoutCompleteAction().type, SHOW_NOTIFICATION]),
      );
    });
  });

  describe('handleSetToken', () => {
    const run = (action) => {
      const gen = handleSetToken(action);
      gen.next(); // select
      gen.next('Basic x'); // call(updateToken)
      return gen.next(); // call(setStorageItem) or done
    };

    it('resets the stored token when it is the one being revoked', () => {
      setStorageItem(TOKEN_KEY, OLD_TOKEN);

      expect(run(resetTokenAction(OLD_TOKEN_STRING)).done).toBe(false);
    });

    it('does not overwrite a newer token stored by another tab', () => {
      setStorageItem(TOKEN_KEY, NEW_TOKEN);

      expect(run(resetTokenAction(OLD_TOKEN_STRING)).done).toBe(true);
      expect(getStorageItem(TOKEN_KEY)).toEqual(NEW_TOKEN);
    });

    it('always writes tokens that are not a revocation', () => {
      setStorageItem(TOKEN_KEY, NEW_TOKEN);
      const step = run({ type: 'setToken', payload: DEFAULT_TOKEN });

      expect(step.done).toBe(false);
    });
  });
});

describe('auth sagas: OAuth success', () => {
  const query = { token: 'abc', token_type: 'Bearer' };
  const loginSuccess = loginSuccessAction({ value: 'abc', type: 'Bearer' });

  it('replaces the session of an already authorized user', () => {
    const gen = handleOauthSuccess();

    expect(gen.next().value).toEqual(select(pagePropertiesSelector));
    expect(gen.next(query).value).toEqual(select(isAuthorizedSelector));
    expect(gen.next(true).value).toEqual(put(logoutAction(undefined, { silent: true })));
    expect(gen.next().value).toEqual(take(LOGOUT_COMPLETE));
    expect(gen.next().value).toEqual(put(loginSuccess));
  });

  it('logs in directly when nobody is authorized', () => {
    const gen = handleOauthSuccess();
    gen.next();
    gen.next(query);

    expect(gen.next(false).value).toEqual(put(loginSuccess));
  });
});
