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
import { InputDropdown } from 'components/inputs/inputDropdown';
import { InstallPluginModal, installPluginModal } from './installPluginModal';

const VERSIONS = [
  { version: '5.7.0' },
  { version: '5.6.1' },
  { version: '5.6.0', blocked: true },
  { version: '5.5.0' },
];

const marketplace = ({ installing = [], installError = null } = {}) => ({
  location: { payload: {} },
  plugins: { marketplace: { installing, installError } },
});

const render = ({
  versions = VERSIONS,
  defaultVersion = null,
  productVersion = null,
  registryId = null,
  onInstall = () => {},
  state = marketplace(),
} = {}) => {
  let current = state;
  const store = createStore(() => current);
  const wrapper = mount(
    <Provider store={store}>
      <IntlProvider locale="en" onError={() => {}}>
        <InstallPluginModal
          data={{
            pluginName: 'Slack',
            registryId,
            versions,
            defaultVersion,
            productVersion,
            onInstall,
          }}
        />
      </IntlProvider>
    </Provider>,
  );

  const dropdown = () => wrapper.find(InputDropdown).first();
  const choose = (version) => {
    act(() => {
      dropdown().prop('onChange')(version);
    });
    wrapper.update();
  };
  const okButton = () => wrapper.find('ModalLayout').first().prop('okButton');
  // the layout owns the buttons; the modal's own claim is what it hands them
  const closed = jest.fn();
  const confirm = () => {
    const { onClick } = okButton();
    act(() => {
      onClick(closed);
    });
    wrapper.update();
  };
  // what the saga does, one step at a time, so the dialog is watched through the window that
  // actually caught it out: dispatch, then the in-flight set, then the answer
  const setState = (next) => {
    current = next;
    act(() => {
      store.dispatch({ type: 'test/state' });
    });
    wrapper.update();
  };

  return { wrapper, dropdown, choose, confirm, okButton, closed, setState };
};

describe('InstallPluginModal', () => {
  // the same notice installedTab.test.jsx silences: react-popper inside the dropdown settles
  // after the assertion has run, and jestsetup turns any console.error into a thrown failure
  const consoleError = console.error;
  const knownNoise = (message, rest) =>
    message.includes('was not wrapped in act') && rest.some((arg) => /Popper/.test(String(arg)));

  beforeAll(() => {
    console.error = (message, ...rest) => {
      if (typeof message === 'string' && knownNoise(message, rest)) {
        return;
      }
      consoleError(message, ...rest);
    };
  });

  afterAll(() => {
    console.error = consoleError;
  });

  test('the newest installable version is what it offers to install', () => {
    const onInstall = jest.fn();
    const { confirm } = render({ onInstall });

    confirm();

    expect(onInstall).toHaveBeenCalledWith('5.7.0');
  });

  test('the version whose row opened it wins over the newest', () => {
    const onInstall = jest.fn();
    const { confirm } = render({ defaultVersion: '5.6.1', onInstall });

    confirm();

    expect(onInstall).toHaveBeenCalledWith('5.6.1');
  });

  test('a blocked version is not offered', () => {
    const { dropdown } = render();

    expect(
      dropdown()
        .prop('options')
        .map(({ value }) => value),
    ).toEqual(['5.7.0', '5.6.1', '5.5.0']);
  });

  // it would post a version the registry refuses, and the refusal would read as a server error
  test('a blocked version asked for by a row is not preselected', () => {
    const onInstall = jest.fn();
    const { confirm } = render({ defaultVersion: '5.6.0', onInstall });

    confirm();

    expect(onInstall).toHaveBeenCalledWith('5.7.0');
  });

  test('what it installs is what was picked, not what it opened with', () => {
    const onInstall = jest.fn();
    const { choose, confirm } = render({ onInstall });

    choose('5.5.0');
    confirm();

    expect(onInstall).toHaveBeenCalledWith('5.5.0');
  });

  test('nothing to install when every version is blocked, and it says so by refusing', () => {
    const onInstall = jest.fn();
    const { wrapper, confirm } = render({
      versions: [{ version: '5.7.0', blocked: true }],
      onInstall,
    });

    expect(wrapper.find('ModalLayout').first().prop('okButton').disabled).toBe(true);

    confirm();

    expect(onInstall).toHaveBeenCalledWith(undefined);
  });

  test('the factory hands the dialog through as an element on the action', () => {
    const modal = installPluginModal({
      pluginName: 'Slack',
      versions: VERSIONS,
      onInstall: () => {},
    });

    expect(modal.component.type).toBe(InstallPluginModal);
    expect(modal.component.props.data.pluginName).toBe('Slack');
  });

  // The caller passes the running release and the frame needs it named: without it the reason on a
  // disabled version falls back to the vague form, which states the refusal but not the bound the
  // admin would have to move. Every other test here renders the component directly, so the factory
  // was the one place that could drop a field and be believed.
  test('the factory carries every field the dialog is given', () => {
    const modal = installPluginModal({
      pluginName: 'Slack',
      versions: VERSIONS,
      defaultVersion: '5.6.1',
      productVersion: '26.1',
      onInstall: () => {},
    });

    expect(modal.component.props.data.defaultVersion).toBe('5.6.1');
    expect(modal.component.props.data.productVersion).toBe('26.1');
  });

  // Install. Select Version. Latest not compatible (27390:15156) — the newest build stays in the
  // list, visibly present and visibly unavailable, and the selection falls to the newest that runs
  describe('a version that does not run here', () => {
    const MIXED = [
      { version: '5.8.0', compatible: false, requires: '>=26.2' },
      { version: '5.7.0', compatible: true, requires: '>=25.1' },
      { version: '5.6.1', compatible: true, requires: '>=25.1' },
    ];

    test('the newest is offered but cannot be chosen', () => {
      const { dropdown } = render({ versions: MIXED, productVersion: '26.1' });
      const newest = dropdown()
        .prop('options')
        .find(({ value }) => value === '5.8.0');

      expect(newest).toBeDefined();
      expect(newest.disabled).toBe(true);
    });

    test('it says what it wants and what this instance is', () => {
      const { dropdown } = render({ versions: MIXED, productVersion: '26.1' });
      const newest = dropdown()
        .prop('options')
        .find(({ value }) => value === '5.8.0');

      expect(newest.title).toContain('>=26.2');
      expect(newest.title).toContain('26.1');
    });

    test('the selection falls to the newest version that does run', () => {
      const onInstall = jest.fn();
      const { confirm } = render({ versions: MIXED, productVersion: '26.1', onInstall });

      confirm();

      expect(onInstall).toHaveBeenCalledWith('5.7.0');
    });

    test('a row asking for the incompatible one does not get it', () => {
      const onInstall = jest.fn();
      const { confirm } = render({
        versions: MIXED,
        defaultVersion: '5.8.0',
        productVersion: '26.1',
        onInstall,
      });

      confirm();

      expect(onInstall).toHaveBeenCalledWith('5.7.0');
    });

    test('an instance that cannot name its release still states the refusal', () => {
      const { dropdown } = render({ versions: MIXED, productVersion: null });
      const newest = dropdown()
        .prop('options')
        .find(({ value }) => value === '5.8.0');

      expect(newest.disabled).toBe(true);
      expect(newest.title).toBeTruthy();
    });

    // service-api serialises with NON_NULL, so "undecided" and "an older service-api" arrive the
    // same way — as nothing. Closing a row on that would leave such an instance unable to install
    // anything at all, and the server still refuses on install if it must.
    test('a verdict that never arrived is not read as a refusal', () => {
      const onInstall = jest.fn();
      const { dropdown, confirm } = render({
        versions: [{ version: '5.8.0' }, { version: '5.7.0' }],
        productVersion: '26.1',
        onInstall,
      });

      expect(
        dropdown()
          .prop('options')
          .every(({ disabled }) => !disabled),
      ).toBe(true);

      confirm();

      expect(onInstall).toHaveBeenCalledWith('5.8.0');
    });
  });

  // All four Install. Failed. frames (27635:17931, :18104, :18224, :18464) are drawn with this
  // dialog still open behind the page alert. It used to close on confirm, which made every one of
  // them undrawable — the admin was returned to an unchanged page and told in a toast.
  describe('a dialog that outlives its own answer', () => {
    const SLACK = 'slack';
    const installingSlack = marketplace({ installing: [SLACK] });
    const slackFailed = marketplace({ installError: { registryId: SLACK, errorCode: 40048 } });

    test('confirming does not close it', () => {
      const { confirm, closed } = render({ registryId: SLACK });

      confirm();

      expect(closed).not.toHaveBeenCalled();
    });

    test('it says the install is running and refuses a second press', () => {
      const { confirm, setState, okButton } = render({ registryId: SLACK });

      confirm();
      setState(installingSlack);

      expect(okButton().text).toBe('Installing…');
      expect(okButton().disabled).toBe(true);
    });

    test('it closes once the install has run and nothing failed', () => {
      const { confirm, setState, closed } = render({ registryId: SLACK });

      confirm();
      setState(installingSlack);
      setState(marketplace());

      expect(closed).toHaveBeenCalled();
    });

    // the window that caught this out before: the saga adds the plugin to the in-flight set a tick
    // after the action is dispatched, so for one render "not installing" means "not started yet"
    // and an effect keyed on it alone closes the dialog on the spot
    test('it does not mistake the tick before the saga runs for a finished install', () => {
      const { confirm, setState, closed } = render({ registryId: SLACK });

      confirm();
      setState(marketplace());

      expect(closed).not.toHaveBeenCalled();
    });

    test('a failure keeps it open, because the page is where the failure is told', () => {
      const { confirm, setState, closed } = render({ registryId: SLACK });

      confirm();
      setState(installingSlack);
      setState(slackFailed);

      expect(closed).not.toHaveBeenCalled();
    });

    // another plugin's failure is not this dialog's business, and reading it as one would leave
    // this install's own dialog hanging open forever
    test('someone else’s failure does not hold it open', () => {
      const { confirm, setState, closed } = render({ registryId: SLACK });

      confirm();
      setState(installingSlack);
      setState(marketplace({ installError: { registryId: 'jira', errorCode: 40048 } }));

      expect(closed).toHaveBeenCalled();
    });

    // the catalogue raises this dialog without a registryId when the registry gave it no version
    // list. That path has no failure frame, so it keeps the old behaviour rather than waiting on
    // an install it cannot recognise — and waiting would leave it open for good.
    test('without a plugin to watch it closes on confirm, as it always did', () => {
      const onInstall = jest.fn();
      const { confirm, closed } = render({ onInstall });

      confirm();

      expect(closed).toHaveBeenCalled();
      expect(onInstall).toHaveBeenCalledWith('5.7.0');
    });
  });
});
