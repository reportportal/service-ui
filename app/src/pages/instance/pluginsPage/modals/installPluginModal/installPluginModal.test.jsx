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

const render = ({ versions = VERSIONS, defaultVersion = null, onInstall = () => {} } = {}) => {
  const store = createStore((state = { location: { payload: {} } }) => state);
  const wrapper = mount(
    <Provider store={store}>
      <IntlProvider locale="en" onError={() => {}}>
        <InstallPluginModal
          data={{ pluginName: 'Slack', versions, defaultVersion, onInstall }}
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
  // the layout owns the buttons; the modal's own claim is what it hands them
  const confirm = () => {
    const { onClick } = wrapper.find('ModalLayout').first().prop('okButton');
    act(() => {
      onClick(() => {});
    });
  };

  return { wrapper, dropdown, choose, confirm };
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

    expect(dropdown().prop('options').map(({ value }) => value)).toEqual([
      '5.7.0',
      '5.6.1',
      '5.5.0',
    ]);
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
});
