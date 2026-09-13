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

import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { IntlProvider } from 'react-intl';
import {
  MARKETPLACE_INSTALL_ERROR,
  MARKETPLACE_INSTALL_ERROR_MESSAGES,
} from 'controllers/plugins/constants';
import { NotificationList, notificationMessages } from './notificationList';

// the list reads the notifications out of the store, so one is put there rather than passed in
const render = (messageId) => {
  const notifications = [{ uid: 1, type: 'error', messageId, values: {} }];
  const store = createStore(() => ({ notifications }));

  return mount(
    <Provider store={store}>
      <IntlProvider locale="en" onError={() => {}}>
        <NotificationList />
      </IntlProvider>
    </Provider>,
  );
};

const toastFor = (errorCode) => render(MARKETPLACE_INSTALL_ERROR_MESSAGES[errorCode]).text();

describe('the marketplace install failures', () => {
  // The list falls back to `message` when it holds no descriptor for the id, and a notification
  // dispatched by the saga carries no message — so a missing descriptor is a blank red toast,
  // which is worse than the generic one it replaced.
  test.each(Object.entries(MARKETPLACE_INSTALL_ERROR_MESSAGES))(
    'the message %s is dispatched with is defined here',
    (errorCode, messageId) => {
      expect(notificationMessages[messageId]).toBeDefined();
      expect(toastFor(errorCode)).not.toBe('');
    },
  );

  // Each of these names what happened and what the operator can do about it next, because the
  // next move is different in every case: renew the licence, pick another version, upload a jar,
  // or simply wait. That is the reason for reading the error code at all.
  test.each([
    [MARKETPLACE_INSTALL_ERROR.LICENCE_REJECTED, ['rejected the license', 'instance Settings']],
    [MARKETPLACE_INSTALL_ERROR.VERSION_BLOCKED, ['blocked', 'Choose another version']],
    [MARKETPLACE_INSTALL_ERROR.PLUGIN_REMOVED, ['removed from the marketplace', '.jar']],
    [
      MARKETPLACE_INSTALL_ERROR.REGISTRY_UNREACHABLE,
      ["Can't connect to the plugin marketplace", 'Installed plugins keep running'],
    ],
    [MARKETPLACE_INSTALL_ERROR.DOWNLOAD_FAILED, ['download did not complete', 'Try again']],
  ])('%i says what happened and what to do about it', (errorCode, phrases) => {
    const toast = toastFor(errorCode);

    phrases.forEach((phrase) => expect(toast).toContain(phrase));
  });

  test('no two of them read alike', () => {
    const codes = Object.keys(MARKETPLACE_INSTALL_ERROR_MESSAGES);
    const toasts = codes.map(toastFor);

    expect(new Set(toasts).size).toBe(codes.length);
  });
});
