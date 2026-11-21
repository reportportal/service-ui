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
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import { NOTIFICATION_TYPES } from 'controllers/notification';
import { updatePagePropertiesAction } from 'controllers/pages';
import { handleConfirmEmail } from './sagas';
import { logoutAction, confirmEmailAction } from './actionCreators';
import { LOGOUT, LOGOUT_COMPLETE } from './constants';

jest.mock('routes/routesMap', () => ({
  __esModule: true,
  default: {},
  getRedirectRoute: jest.fn(),
}));

jest.mock('common/utils/fetch', () => ({
  fetch: jest.fn(),
  updateToken: jest.fn(),
}));

const run = async (authorized, uuid = 'uuid-1') => {
  const dispatched = [];
  const listeners = [];
  const io = {
    subscribe: (listener) => {
      listeners.push(listener);
      return () => {};
    },
    dispatch: (action) => {
      dispatched.push(action);
      if (action.type === LOGOUT) {
        // the logout saga is not running here; emulate its completion
        listeners.forEach((listener) => listener({ type: LOGOUT_COMPLETE }));
      }
    },
    getState: () => ({ auth: { authorized } }),
  };

  await runSaga(io, handleConfirmEmail, confirmEmailAction(uuid)).done;

  return dispatched;
};

describe('handleConfirmEmail', () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  test('confirms once, clears the URL parameter and notifies on success', async () => {
    fetch.mockResolvedValue({});

    const dispatched = await run(false);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(URLS.userEmailConfirm(), {
      method: 'POST',
      data: { uuid: 'uuid-1' },
    });
    expect(dispatched).toHaveLength(2);
    expect(dispatched[0]).toEqual(updatePagePropertiesAction({ confirmEmail: undefined }));
    expect(dispatched[1].payload).toMatchObject({
      messageId: 'emailConfirmed',
      type: NOTIFICATION_TYPES.SUCCESS,
    });
  });

  test('shows the server message on error', async () => {
    fetch.mockRejectedValue({ errorCode: 4001, message: 'Link is expired' });

    const dispatched = await run(false);

    expect(dispatched[dispatched.length - 1].payload).toMatchObject({
      message: 'Link is expired',
      type: NOTIFICATION_TYPES.ERROR,
    });
  });

  test('signs an existing session out before confirming', async () => {
    fetch.mockResolvedValue({});

    const dispatched = await run(true);

    expect(dispatched[0]).toEqual(logoutAction());
    expect(dispatched[1]).toEqual(updatePagePropertiesAction({ confirmEmail: undefined }));
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('does nothing without a uuid', async () => {
    const dispatched = await run(false, '');

    expect(dispatched).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});
