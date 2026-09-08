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
import { MARKETPLACE_CATALOGUE_STATE } from 'controllers/plugins';
import { FETCH_MARKETPLACE_CATALOGUE } from 'controllers/plugins/constants';
import catalogue from 'controllers/plugins/__fixtures__/catalogue.json';
import { InstalledTab } from './pluginsTabs/installedTab';
import { LegacyInstalledTab } from './legacy';
import { PluginsPage } from './pluginsPage';

const initialState = {
  location: { payload: {} },
  user: { info: { userRole: 'ADMINISTRATOR', assignedOrganizations: {}, assignedProjects: {} } },
  plugins: {
    plugins: [],
    marketplace: {
      catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADED_ONLINE,
      registry: catalogue.registry,
      instance: catalogue.instance,
      installed: [],
      available: [],
      error: null,
      installing: [],
      query: { q: null, category: null },
    },
    marketplacePluginDetail: {},
    integrations: { globalIntegrations: [], projectIntegrations: [] },
  },
};

const render = () => {
  const dispatched = [];
  const store = createStore((state = initialState, action) => {
    dispatched.push(action);
    return state;
  });
  const wrapper = mount(
    <Provider store={store}>
      <IntlProvider locale="en" onError={() => {}}>
        <PluginsPage />
      </IntlProvider>
    </Provider>,
  );
  const catalogueRequests = () =>
    dispatched.filter(({ type }) => type === FETCH_MARKETPLACE_CATALOGUE).length;

  return { wrapper, catalogueRequests };
};

describe('PluginsPage marketplace flag', () => {
  // the same noise installedTab.test.jsx silences: react-popper updates after the test ends,
  // and InstancesSection requires a prop nobody passes it
  const consoleError = console.error;
  const knownNoise = (message, rest) =>
    (message.includes('was not wrapped in act') &&
      rest.some((arg) => /Popper/.test(String(arg)))) ||
    rest.some((arg) => /`userRole` is marked as required/.test(String(arg)));

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

  afterEach(() => {
    localStorage.clear();
  });

  test('without the flag it renders the legacy page and never calls the registry', () => {
    const { wrapper, catalogueRequests } = render();

    expect(wrapper.find(LegacyInstalledTab).exists()).toBe(true);
    expect(wrapper.find(InstalledTab).exists()).toBe(false);
    expect(catalogueRequests()).toBe(0);
  });

  test('with the flag set it renders the marketplace catalogue', () => {
    localStorage.setItem('marketplace', 'true');
    const { wrapper } = render();

    expect(wrapper.find(InstalledTab).exists()).toBe(true);
    expect(wrapper.find(LegacyInstalledTab).exists()).toBe(false);
  });
});
