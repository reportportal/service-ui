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
import { NOTIFICATION_TYPES, SHOW_NOTIFICATION } from 'controllers/notification/constants';
import { usersSagas } from './sagas';
import { UPDATE_USER_ASSIGNMENTS, UPDATE_USER_ASSIGNMENTS_FAILURE } from './constants';

jest.mock('common/utils', () => ({
  ...jest.requireActual('common/utils'),
  fetch: jest.fn(),
}));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const runUpdateUserAssignments = async () => {
  const dispatched = [];
  let emit = () => {};
  const task = runSaga(
    {
      subscribe: (callback) => {
        emit = callback;
        return () => {};
      },
      dispatch: (action) => dispatched.push(action),
      getState: () => ({}),
    },
    usersSagas,
  );
  emit({
    type: UPDATE_USER_ASSIGNMENTS,
    payload: { organizationId: 1, userId: 2, payload: {}, user: { fullName: 'John' } },
  });
  await flush();
  task.cancel();
  return dispatched;
};

describe('organization/users/sagas', () => {
  describe('updateUserAssignments failure', () => {
    beforeEach(() => fetch.mockReset());

    test('shows the server message on its own as an error notification', async () => {
      fetch.mockRejectedValue(new Error('Cannot change your own role'));

      const dispatched = await runUpdateUserAssignments();

      expect(dispatched[0]).toEqual({ type: UPDATE_USER_ASSIGNMENTS_FAILURE });
      expect(dispatched[1]).toMatchObject({
        type: SHOW_NOTIFICATION,
        payload: {
          type: NOTIFICATION_TYPES.ERROR,
          message: 'Cannot change your own role',
          messageId: '',
        },
      });
    });

    test('falls back to the default message id when the server sent no message', async () => {
      fetch.mockRejectedValue({});

      const dispatched = await runUpdateUserAssignments();

      expect(dispatched[1]).toMatchObject({
        type: SHOW_NOTIFICATION,
        payload: { type: NOTIFICATION_TYPES.ERROR, messageId: 'updateAssignmentsError' },
      });
    });
  });
});
