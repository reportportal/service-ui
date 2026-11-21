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

import { call, put, select } from 'redux-saga/effects';
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { addApiKey } from './sagas';
import { userInfoSelector } from './selectors';

// Notification uids are unique per call, so compare the effect without them.
const withoutUid = (effect) => {
  const { uid, ...payload } = effect.PUT.action.payload;
  return { ...effect.PUT.action, payload };
};

describe('user sagas: addApiKey', () => {
  const user = { id: 7 };
  const payload = { name: 'key', errorMessage: 'generate failed', onSuccess: jest.fn() };

  it('calls onError and shows the backend message when the request fails', () => {
    const onError = jest.fn();
    const gen = addApiKey({ payload: { ...payload, onError } });

    expect(gen.next().value).toEqual(select(userInfoSelector));
    expect(gen.next(user).value).toEqual(
      call(fetch, URLS.apiKeys(7), { method: 'post', data: { name: 'key' } }),
    );
    expect(withoutUid(gen.throw({ errorCode: 4001, message: 'Limit reached' }).value)).toEqual(
      withoutUid(
        put(showNotification({ message: 'Limit reached', type: NOTIFICATION_TYPES.ERROR })),
      ),
    );
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('falls back to the local error message', () => {
    const gen = addApiKey({ payload: { ...payload, onError: jest.fn() } });
    gen.next();
    gen.next(user);

    expect(withoutUid(gen.throw(new Error('')).value)).toEqual(
      withoutUid(
        put(showNotification({ message: 'generate failed', type: NOTIFICATION_TYPES.ERROR })),
      ),
    );
  });
});
