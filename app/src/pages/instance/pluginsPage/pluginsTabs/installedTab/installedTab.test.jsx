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
import { SHOW_MODAL } from 'controllers/modal/constants';
import { PremiumPromoModal } from 'components/premiumPromoModal';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import catalogue from 'controllers/plugins/__fixtures__/catalogue.json';
import catalogueOffline from 'controllers/plugins/__fixtures__/catalogue-offline.json';
import { PluginsCatalog, ROW_ACTIONS } from '../../pluginsCatalog';
import { mergeInstalledRows, toAvailableRow } from '../../pluginsCatalog/utils';
import { PluginsFilter } from '../../pluginsFilter';
import { InstalledTab } from './installedTab';

const marketplaceState = (overrides = {}) => ({
  catalogueState: MARKETPLACE_CATALOGUE_STATE.LOADED_ONLINE,
  registry: catalogue.registry,
  instance: catalogue.instance,
  installed: [],
  available: [],
  error: null,
  installing: [],
  query: { q: null, category: null },
  ...overrides,
});

// GET /plugin — the locally installed integration type, the half no catalogue fixture covers
const localJira = {
  name: 'jira',
  enabled: true,
  groupType: BTS_GROUP_TYPE,
  pluginType: BTS_GROUP_TYPE,
  details: { name: 'Jira' },
};
// the rows the catalogue itself builds, from the responses service-api really sends
const installedRowFrom = (response) => mergeInstalledRows([localJira], response.installed)[0];
const availableRowFrom = (id) =>
  toAvailableRow(catalogue.available.find((entry) => entry.id === id));

// showModalAction carries the modal as a React element on the action, so the assertions read
// its type and props rather than a component name.
const shownModal = (of) => of(SHOW_MODAL).pop().payload.activeModal.component;

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

  // Catalog.List.Upload Disabled — "identical to Default except the Upload Plugin control is
  // absent from the header. Do not replace the control with a disabled state; it is not a
  // permission error, the capability is simply off."
  describe('Catalog.List.Upload Disabled', () => {
    const uploadControl = (wrapper) => wrapper.find('ActionPanel');

    test('the control is there when the instance allows a hand-uploaded jar', () => {
      expect(uploadControl(render().wrapper).length).toBeGreaterThan(0);
    });

    test('the control is absent — not disabled — when the instance does not', () => {
      const { wrapper } = render(
        marketplaceState({ instance: { uploadAllowed: false } }),
      );

      expect(uploadControl(wrapper)).toHaveLength(0);
    });

    test('an older service-api that sends no instance block keeps the control', () => {
      // A missing key must not read as "forbidden": losing the escape valve to a field that was
      // never sent is worse than showing a control the instance would refuse.
      const { wrapper } = render(marketplaceState({ instance: undefined }));

      expect(uploadControl(wrapper).length).toBeGreaterThan(0);
    });
  });

  describe('the plugin page', () => {
    const slackRow = availableRowFrom('plugin-notify-slack');

    test('opening a plugin asks the registry about that plugin', () => {
      const { call, of } = render();

      call(PluginsCatalog, 'onAvailableItemClick', slackRow);

      expect(of(FETCH_MARKETPLACE_PLUGIN_DETAIL).pop().payload).toBe('plugin-notify-slack');
    });

    // the registry id of an installed plugin is carried inside its marketplace block; read from
    // anywhere else every installed plugin looks like one the registry has never heard of
    test('opening a matched installed plugin asks the registry about it', () => {
      const { wrapper, call, of } = render();

      call(PluginsCatalog, 'onInstalledItemClick', installedRowFrom(catalogue));

      expect(of(FETCH_MARKETPLACE_PLUGIN_DETAIL).pop().payload).toBe('plugin-bts-jira');
      expect(wrapper.find('[data-automation-id="pluginUnmatchedAlert"]')).toHaveLength(0);
    });

    // One button, one behaviour. The row used to jump straight to the contact link while the
    // plugin page opened the promo modal, so a user who met both had no way to tell which they
    // would get. Kills reinstating window.open on the row.
    test('Discover Premium opens the same promo modal the plugin page opens', () => {
      const open = jest.spyOn(window, 'open').mockImplementation(() => {});
      const { call, of } = render();

      call(
        PluginsCatalog,
        'onRowAction',
        ROW_ACTIONS.DISCOVER_PREMIUM,
        availableRowFrom('plugin-bts-azure'),
      );

      expect(of(SHOW_MODAL)).toHaveLength(1);
      expect(shownModal(of).type).toBe(PremiumPromoModal);
      expect(open).not.toHaveBeenCalled();
      open.mockRestore();
    });

    // contactUrl is the plugin's own purchase CTA, which for a third-party plugin is its
    // vendor's page — an enquiry sent to ReportPortal's sales instead reaches the wrong
    // company. Kills dropping contactUrl in favour of the instance-wide link.
    test("the modal's Contact us goes to the plugin's own contact link", () => {
      const open = jest.spyOn(window, 'open').mockImplementation(() => {});
      const { call, of } = render();
      const row = availableRowFrom('plugin-bts-azure');

      call(PluginsCatalog, 'onRowAction', ROW_ACTIONS.DISCOVER_PREMIUM, row);
      shownModal(of).props.onContactUs();

      expect(row.contactUrl).toBe('https://reportportal.io/contact');
      expect(open).toHaveBeenCalledWith(row.contactUrl, '_blank', 'noopener,noreferrer');
      open.mockRestore();
    });

    // and a plugin that published none still has somewhere to go
    test('without a published contact link the modal falls back to the instance-wide one', () => {
      const open = jest.spyOn(window, 'open').mockImplementation(() => {});
      const { call, of } = render();

      call(PluginsCatalog, 'onRowAction', ROW_ACTIONS.DISCOVER_PREMIUM, {
        ...availableRowFrom('plugin-bts-azure'),
        contactUrl: null,
      });
      shownModal(of).props.onContactUs();

      expect(open).toHaveBeenCalledWith(
        referenceDictionary.rpContactUsPlugins,
        '_blank',
        'noopener,noreferrer',
      );
      open.mockRestore();
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
      // the offline response is the one that carries no marketplace block, so the row it merges
      // into has no registry id: the registry knows nothing of this plugin, or was never asked
      const jiraRow = installedRowFrom(catalogueOffline);
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
          catalogue.registry.host,
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
        registryId: 'plugin-notify-slack',
        version: '2.0.0',
      });
    });
  });
});
