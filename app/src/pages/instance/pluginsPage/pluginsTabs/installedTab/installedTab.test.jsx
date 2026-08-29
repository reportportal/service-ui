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
import { BTS_GROUP_TYPE, ALL_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import { INSTALLED_GROUP_TYPE } from 'common/constants/pluginsFilter';
import { MARKETPLACE_CATALOGUE_STATE } from 'controllers/plugins';
import {
  FETCH_MARKETPLACE_CATALOGUE,
  FETCH_MARKETPLACE_PLUGIN_DETAIL,
  INSTALL_MARKETPLACE_PLUGIN,
} from 'controllers/plugins/constants';
import { PluginsCatalog } from '../../pluginsCatalog';
import { PluginsFilter } from '../../pluginsFilter';
import { InstalledTab } from './installedTab';

const marketplaceState = (overrides = {}) => ({
  catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADED_ONLINE,
  registry: { status: 'ONLINE', host: 'registry.reportportal.io' },
  installed: [],
  available: [],
  error: null,
  installing: [],
  query: { q: null, category: null },
  ...overrides,
});

// the installed plugin subpage also renders the integration sections, which read these slices
const restOfState = {
  location: { payload: {} },
  user: { info: { userRole: 'ADMINISTRATOR', assignedOrganizations: {}, assignedProjects: {} } },
};

const render = (marketplace = marketplaceState(), marketplacePluginDetail = {}) => {
  const dispatched = [];
  const initial = {
    ...restOfState,
    plugins: {
      marketplace,
      marketplacePluginDetail,
      integrations: { globalIntegrations: [], projectIntegrations: [] },
    },
  };
  const store = createStore((state = initial, action) => {
    dispatched.push(action);
    return state;
  });
  const wrapper = mount(
    <Provider store={store}>
      <IntlProvider locale="en" onError={() => {}}>
        <InstalledTab filterItems={[BTS_GROUP_TYPE]} plugins={[]} />
      </IntlProvider>
    </Provider>,
  );

  const call = (component, prop, ...args) => {
    act(() => {
      wrapper.find(component).first().prop(prop)(...args);
    });
    wrapper.update();
  };
  const lastRequest = () =>
    dispatched.filter(({ type }) => type === FETCH_MARKETPLACE_CATALOGUE).pop()?.payload;
  const requestCount = () =>
    dispatched.filter(({ type }) => type === FETCH_MARKETPLACE_CATALOGUE).length;
  const of = (type) => dispatched.filter((action) => action.type === type);

  return { wrapper, call, lastRequest, requestCount, of };
};

describe('InstalledTab', () => {
  // on top of the notices jestsetup already drops: react-popper updates after the test ends, and
  // InstancesSection — a component this page only mounts — requires a prop nobody passes it
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

  test('asks the server for the catalogue on mount', () => {
    const { requestCount } = render();

    expect(requestCount()).toBe(1);
  });

  test('sends the query to the server, debounced, instead of filtering one fetch locally', () => {
    const { call, lastRequest } = render();

    call(PluginsCatalog, 'onQueryChange', 'jir');

    expect(lastRequest()).toEqual({ q: 'jir', category: null, debounced: true });
  });

  test('a blank query asks for the whole catalogue again', () => {
    const { call, lastRequest } = render();

    call(PluginsCatalog, 'onQueryChange', '   ');

    expect(lastRequest()).toEqual({ q: null, category: null, debounced: true });
  });

  test('sends the category chip to the server without waiting, keeping the query on screen', () => {
    const { call, lastRequest } = render();

    call(PluginsCatalog, 'onQueryChange', 'jir');
    call(PluginsFilter, 'onFilterChange', BTS_GROUP_TYPE);

    expect(lastRequest()).toEqual({ q: 'jir', category: BTS_GROUP_TYPE, debounced: undefined });
  });

  test('the synthetic All and Installed chips are not sent as categories', () => {
    const { call, lastRequest } = render();

    call(PluginsFilter, 'onFilterChange', INSTALLED_GROUP_TYPE);
    expect(lastRequest()).toEqual({ q: null, category: null, debounced: undefined });

    call(PluginsFilter, 'onFilterChange', ALL_GROUP_TYPE);
    expect(lastRequest()).toEqual({ q: null, category: null, debounced: undefined });
  });

  test('a failed catalogue reaches the screen, and its retry asks again', () => {
    const { wrapper, call, lastRequest } = render(
      marketplaceState({
        catalogueState: MARKETPLACE_CATALOGUE_STATE.FAILED,
        error: 'Network Error',
      }),
    );
    const catalogue = wrapper.find(PluginsCatalog).first();

    expect(catalogue.prop('failed')).toBe(true);
    expect(catalogue.prop('offline')).toBe(false);

    call(PluginsCatalog, 'onRetry');

    expect(lastRequest()).toEqual({ q: null, category: null, debounced: undefined });
  });

  describe('the plugin page', () => {
    const slackRow = {
      kind: 'AVAILABLE',
      registryId: 'plugin-notification-slack',
      name: 'Slack',
      latestVersion: '1.5.2',
      tier: 'free',
      locked: false,
      details: { name: 'Slack', version: '1.5.2' },
    };

    test('opening a plugin asks the registry about that plugin', () => {
      const { call, of } = render();

      call(PluginsCatalog, 'onAvailableItemClick', slackRow);

      expect(of(FETCH_MARKETPLACE_PLUGIN_DETAIL).pop().payload).toBe('plugin-notification-slack');
    });

    // an unmatched plugin has no registry id, so there is nothing to ask about and nothing to show
    test('a plugin the registry could not be matched to is not asked about', () => {
      const { call, of } = render();

      call(PluginsCatalog, 'onAvailableItemClick', { ...slackRow, registryId: null });

      expect(of(FETCH_MARKETPLACE_PLUGIN_DETAIL)).toHaveLength(0);
    });

    // three different situations that all leave an installed plugin with no registry id, and an
    // operator can act on each of them differently
    describe('an installed plugin with nothing to show', () => {
      const jiraRow = {
        kind: 'INSTALLED',
        name: 'jira',
        enabled: true,
        groupType: BTS_GROUP_TYPE,
        pluginType: BTS_GROUP_TYPE,
        // the registry knows nothing about this plugin, or could not be asked
        registryId: null,
        marketplace: null,
        details: { name: 'Jira' },
      };
      const openJira = (marketplace, detail) => {
        const { wrapper, call } = render(marketplace, detail);

        call(PluginsCatalog, 'onInstalledItemClick', jiraRow);

        return wrapper;
      };
      const alert = (wrapper, id) => wrapper.find(`[data-automation-id="${id}"]`);

      test('an unmatched plugin says the registry has no entry for it', () => {
        const wrapper = openJira();

        expect(alert(wrapper, 'pluginUnmatchedAlert').first().text()).toMatch(/no entry/i);
      });

      test('an offline registry is named as the reason, with the host', () => {
        const wrapper = openJira(
          marketplaceState({ catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADED_OFFLINE }),
        );

        expect(alert(wrapper, 'registryOfflineAlert').first().text()).toContain(
          'registry.reportportal.io',
        );
        expect(alert(wrapper, 'pluginUnmatchedAlert')).toHaveLength(0);
      });

      // the request in flight is some other plugin's: this one was never asked about
      test('an unmatched plugin does not borrow another request’s spinner', () => {
        const wrapper = openJira(marketplaceState(), {
          detailState: MARKETPLACE_CATALOGUE_STATE.LOADING,
        });

        expect(alert(wrapper, 'pluginDetailLoader')).toHaveLength(0);
        expect(alert(wrapper, 'pluginUnmatchedAlert')).not.toHaveLength(0);
      });

      test('a failed catalogue is named as the reason instead', () => {
        const wrapper = openJira(
          marketplaceState({
            catalogueState: MARKETPLACE_CATALOGUE_STATE.FAILED,
            error: 'Network Error',
          }),
        );

        expect(alert(wrapper, 'catalogueUnavailableAlert')).not.toHaveLength(0);
        expect(alert(wrapper, 'pluginUnmatchedAlert')).toHaveLength(0);
      });
    });

    test('installing from the plugin page asks for the version the registry published', () => {
      const { wrapper, call, of } = render();

      call(PluginsCatalog, 'onAvailableItemClick', slackRow);
      wrapper.update();
      wrapper.find('[data-automation-id="installAction"]').first().prop('onClick')();

      expect(of(INSTALL_MARKETPLACE_PLUGIN).pop().payload).toEqual({
        registryId: 'plugin-notification-slack',
        version: '1.5.2',
      });
    });
  });
});
