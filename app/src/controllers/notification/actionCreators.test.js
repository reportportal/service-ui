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

import { hideNotification, showErrorNotification, showSuccessNotification } from './actionCreators';
import { notificationReducer } from './reducer';

describe('controllers/notification/actionCreators', () => {
  test('gives notifications created in the same millisecond distinct uids', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000_000_000);
    const first = showSuccessNotification({ messageId: 'saved' });
    const second = showErrorNotification({ messageId: 'failed' });
    Date.now.mockRestore();

    expect(first.payload.uid).not.toBe(second.payload.uid);
  });

  test('hiding one of two simultaneous notifications keeps the other', () => {
    jest.spyOn(Date, 'now').mockReturnValue(2_000_000_000_000);
    const info = showSuccessNotification({ messageId: 'saved' });
    const error = showErrorNotification({ messageId: 'failed' });
    Date.now.mockRestore();

    const state = [info, error].reduce(notificationReducer, []);
    expect(notificationReducer(state, hideNotification(info.payload.uid))).toEqual([error.payload]);
  });
});
