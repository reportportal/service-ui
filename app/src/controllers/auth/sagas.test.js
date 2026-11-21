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

import { put, select } from 'redux-saga/effects';

jest.mock('common/utils/fetch', () => ({
  fetch: jest.fn(() => Promise.resolve()),
  updateToken: jest.fn(),
}));
jest.mock('routes/routesMap', () => ({
  __esModule: true,
  default: {},
  getRedirectRoute: jest.fn(),
}));

import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';
import { ACTIVITY_TIMESTAMP } from 'controllers/user/constants';
import { resetTokenAction } from './actionCreators';
import { DEFAULT_TOKEN, TOKEN_KEY } from './constants';
import { tokenSelector } from './selectors';
import { handleLogout, handleSetToken } from './sagas';

const OLD_TOKEN = { type: 'Bearer', value: 'old' };
const NEW_TOKEN = { type: 'Bearer', value: 'new' };
const OLD_TOKEN_STRING = 'Bearer old';

const runLogoutUntilReset = () => {
  const gen = handleLogout({ payload: undefined });
  expect(gen.next().value).toEqual(select(tokenSelector));
  gen.next(OLD_TOKEN_STRING); // grafana revoke + call(logoutOnServer)
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

    it('keeps the activity timestamp of a newer session stored by another tab', () => {
      setStorageItem(TOKEN_KEY, NEW_TOKEN);
      setStorageItem(ACTIVITY_TIMESTAMP, 123);
      const gen = runLogoutUntilReset();

      expect(gen.next().value).toEqual(put(resetTokenAction(OLD_TOKEN_STRING)));
      expect(getStorageItem(ACTIVITY_TIMESTAMP)).toBe(123);
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
