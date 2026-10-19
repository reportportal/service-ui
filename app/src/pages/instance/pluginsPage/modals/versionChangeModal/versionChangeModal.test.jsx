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

import { act } from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { IntlProvider } from 'react-intl';
import { MARKETPLACE_CATALOGUE_STATE } from 'controllers/plugins';
import { MARKETPLACE_INSTALL_ERROR } from 'controllers/plugins/constants';
import { ModalLayout } from 'components/main/modal';
import { VersionChangeModal } from './versionChangeModal';

const marketplace = ({ installing = [], installError = null } = {}) => ({
  catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADED_ONLINE,
  registry: {},
  instance: {},
  installed: [],
  available: [],
  error: null,
  installing,
  installError,
  query: { q: null, category: null },
});

const render = (state = marketplace(), onConfirm = () => {}) => {
  const store = createStore((s = { plugins: { marketplace: state } }) => s);
  const wrapper = mount(
    <Provider store={store}>
      <IntlProvider locale="en" onError={() => {}}>
        <VersionChangeModal
          data={{
            registryId: 'plugin-bts-jira',
            title: 'Downgrade Version',
            message: 'Jira Cloud will be downgraded to 5.6.1.',
            confirmText: 'Downgrade',
            cancelText: 'Cancel',
            onConfirm,
          }}
        />
      </IntlProvider>
    </Provider>,
  );

  return wrapper;
};

const okButton = (wrapper) => wrapper.find(ModalLayout).first().prop('okButton');
// what ModalLayout hands the ok button: calling it is how the dialog closes
const confirmWith = (wrapper, closeModal) => {
  act(() => {
    okButton(wrapper).onClick(closeModal);
  });
  wrapper.update();
};

describe('VersionChangeModal', () => {
  test('asks before it does anything', () => {
    const wrapper = render();

    expect(wrapper.find(ModalLayout).first().prop('title')).toBe('Downgrade Version');
    expect(okButton(wrapper).text).toBe('Downgrade');
  });

  test('confirming runs the change', () => {
    const posted = [];
    const wrapper = render(marketplace(), () => posted.push('confirmed'));

    confirmWith(wrapper, () => {});

    expect(posted).toEqual(['confirmed']);
  });

  /**
   * The shared confirmation dialog closes the instant it is confirmed, before the request it
   * started has said anything. That leaves the admin on a page that has not changed, with nothing
   * saying whether it is about to.
   */
  test('does not close the moment it is confirmed', () => {
    const wrapper = render();
    let closed = false;

    confirmWith(wrapper, () => {
      closed = true;
    });

    expect(closed).toBe(false);
  });

  test('says it is working while the change runs', () => {
    const wrapper = render(marketplace({ installing: ['plugin-bts-jira'] }));

    expect(okButton(wrapper).text).toBe('Changing…');
    expect(okButton(wrapper).disabled).toBe(true);
  });

  test('closes once the change has gone through', () => {
    const wrapper = render(marketplace({ installing: ['plugin-bts-jira'] }));
    let closed = false;

    confirmWith(wrapper, () => {
      closed = true;
    });
    expect(closed).toBe(false);

    // the install left the in-flight set and nothing failed: it worked
    wrapper.setProps({
      store: createStore((s = { plugins: { marketplace: marketplace() } }) => s),
    });
    act(() => {
      wrapper.update();
    });

    expect(closed).toBe(true);
  });

  /**
   * The failure belongs to the page, not to this dialog, and leaving the dialog up is what keeps
   * the admin where they were rather than dropping them somewhere and explaining afterwards.
   */
  test('stays open when the change failed', () => {
    const failed = marketplace({
      installError: {
        registryId: 'plugin-bts-jira',
        error: 'blocked',
        errorCode: MARKETPLACE_INSTALL_ERROR.VERSION_BLOCKED,
      },
    });
    const wrapper = render(failed);
    let closed = false;

    confirmWith(wrapper, () => {
      closed = true;
    });

    expect(closed).toBe(false);
  });

  // a failure recorded against another plugin says nothing about this one, so a change that ran
  // and finished here still closes
  test('another plugin having failed does not hold this dialog open', () => {
    const otherFailed = { registryId: 'plugin-notify-slack', error: 'nope' };
    const wrapper = render(
      marketplace({ installing: ['plugin-bts-jira'], installError: otherFailed }),
    );
    let closed = false;

    confirmWith(wrapper, () => {
      closed = true;
    });
    expect(closed).toBe(false);

    wrapper.setProps({
      store: createStore(
        (s = { plugins: { marketplace: marketplace({ installError: otherFailed }) } }) => s,
      ),
    });
    act(() => {
      wrapper.update();
    });

    expect(closed).toBe(true);
  });
});
