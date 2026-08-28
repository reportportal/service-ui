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
import { IntlProvider } from 'react-intl';
import { BubblesLoader } from '@reportportal/ui-kit';
import {
  ALL_GROUP_TYPE,
  AVAILABLE_PLUGINS_TYPE,
  BTS_GROUP_TYPE,
  NOTIFICATION_GROUP_TYPE,
  OTHER_GROUP_TYPE,
} from 'common/constants/pluginsGroupTypes';
import { INSTALLED_GROUP_TYPE } from 'common/constants/pluginsFilter';
import { PLUGIN_TIERS } from '../availablePluginsCatalog';
import { PluginsCatalog } from './pluginsCatalog';
import { ROW_ACTIONS } from './utils';

const jira = {
  name: 'JIRA',
  type: 'JIRA',
  enabled: true,
  groupType: BTS_GROUP_TYPE,
  details: { name: 'Jira Server', version: '5.0.0' },
};
const rally = {
  name: 'RALLY',
  type: 'RALLY',
  enabled: true,
  groupType: BTS_GROUP_TYPE,
  details: { name: 'Rally', version: '5.0.0' },
};

const marketplaceBlock = (overrides = {}) => ({
  access: 'public',
  tier: 'official',
  updateAvailable: null,
  advisory: null,
  blocked: null,
  removed: null,
  ...overrides,
});

const jiraMerged = {
  name: 'JIRA',
  pluginId: 'plugin-bts-jira',
  marketplace: marketplaceBlock({
    updateAvailable: { version: '5.1.0' },
    advisory: { severity: 'high', text: 'Known issue', attachedAt: '2026-08-01' },
  }),
};
const rallyMerged = {
  name: 'RALLY',
  pluginId: 'plugin-bts-rally',
  marketplace: marketplaceBlock(),
};

const slack = {
  id: 'plugin-slack',
  name: 'Slack',
  latestVersion: '1.2.0',
  description: 'Slack notifications',
  groupType: NOTIFICATION_GROUP_TYPE,
  access: 'public',
  tier: 'official',
  locked: false,
  contactUrl: null,
};
const qualityGate = {
  id: 'plugin-quality-gate',
  name: 'Quality Gate',
  latestVersion: '2.0.0',
  description: 'Quality gates',
  groupType: OTHER_GROUP_TYPE,
  access: 'premium',
  tier: 'official',
  locked: true,
  contactUrl: 'https://reportportal.io/contact',
};

const defaultProps = {
  installedPlugins: [jira, rally],
  marketplaceInstalled: [jiraMerged, rallyMerged],
  availablePlugins: [slack, qualityGate],
  loading: false,
  offline: false,
  registryHost: null,
  activeCategory: ALL_GROUP_TYPE,
  query: '',
  onQueryChange: () => {},
  onRowAction: () => {},
};

const render = (props = {}) =>
  mount(
    <IntlProvider locale="en" onError={() => {}}>
      <PluginsCatalog {...defaultProps} {...props} />
    </IntlProvider>,
  );

const group = (wrapper, name) =>
  wrapper.find(`[data-automation-id="pluginsGroup"][data-group="${name}"]`);
const groupNames = (wrapper) =>
  wrapper.find('[data-automation-id="pluginsGroup"]').map((node) => node.prop('data-group'));
const rowNames = (scope) =>
  scope.find('[data-automation-id="pluginRow"]').map((node) => node.find('.plugins-name').text());
const actions = (scope) =>
  scope.find('[data-automation-id="pluginRowAction"]').map((node) => node.prop('data-action'));
// enzyme's simulate() goes through findDOMNode, whose React 18 warning jestsetup turns into
// a throw, so handlers are invoked through the prop they are wired to instead
const click = (node) => node.prop('onClick')({ stopPropagation: () => {} });

describe('PluginsCatalog', () => {
  // the enzyme react-18 adapter reads rendered text through findDOMNode; jestsetup turns every
  // console.error into a throw, so React's one-time deprecation notice is filtered out here
  const consoleError = console.error;

  beforeAll(() => {
    console.error = (message, ...rest) => {
      if (typeof message === 'string' && message.includes('findDOMNode is deprecated')) {
        return;
      }
      consoleError(message, ...rest);
    };
  });

  afterAll(() => {
    console.error = consoleError;
  });

  describe('Catalog.List.Default', () => {
    test('renders the Installed group before Available, each with its count', () => {
      const wrapper = render();

      expect(groupNames(wrapper)).toEqual([ALL_GROUP_TYPE, AVAILABLE_PLUGINS_TYPE]);
      expect(
        group(wrapper, ALL_GROUP_TYPE).find('[data-automation-id="pluginsGroupCount"]').text(),
      ).toBe('(2)');
      expect(
        group(wrapper, AVAILABLE_PLUGINS_TYPE)
          .find('[data-automation-id="pluginsGroupCount"]')
          .text(),
      ).toBe('(2)');
    });

    test('the Available group is the registry catalogue, not the hardcoded one', () => {
      const wrapper = render();

      expect(rowNames(group(wrapper, AVAILABLE_PLUGINS_TYPE))).toEqual(['Quality Gate', 'Slack']);
      // Jira Cloud is in AVAILABLE_PLUGINS_CATALOG but not in the registry response
      expect(rowNames(wrapper)).not.toContain('Jira Cloud');
    });

    test('offers no sorting control', () => {
      expect(render().find('[data-automation-id="pluginsSorting"]')).toHaveLength(0);
    });
  });

  describe('Catalog.List.Loading', () => {
    test('the list area waits while the search header still renders', () => {
      const wrapper = render({ loading: true });

      expect(wrapper.find('[data-automation-id="catalogLoader"]')).toHaveLength(1);
      expect(wrapper.find('[data-automation-id="pluginsSearch"]').exists()).toBe(true);
      expect(groupNames(wrapper)).toEqual([]);
    });

    test('uses the ui-kit loader instead of a skeleton', () => {
      const wrapper = render({ loading: true });

      expect(wrapper.find(BubblesLoader)).toHaveLength(1);
      expect(wrapper.find('[data-automation-id="catalogSkeleton"]')).toHaveLength(0);
    });
  });

  describe('Catalog.List.Search Results', () => {
    test('the query narrows the locally held Installed group and the count follows', () => {
      // the Available group arrives already narrowed by GET /api/v1/plugins?q=
      const wrapper = render({ query: 'e', availablePlugins: [qualityGate] });

      expect(rowNames(group(wrapper, ALL_GROUP_TYPE))).toEqual(['Jira Server']);
      expect(rowNames(group(wrapper, AVAILABLE_PLUGINS_TYPE))).toEqual(['Quality Gate']);
      expect(
        group(wrapper, ALL_GROUP_TYPE).find('[data-automation-id="pluginsGroupCount"]').text(),
      ).toBe('(1)');
    });

    test('the Available group is shown as the server returned it, not filtered again here', () => {
      // filtering it locally would hide rows the server matched on something other than the name
      const wrapper = render({ query: 'nothing matches this', availablePlugins: [slack] });

      expect(rowNames(group(wrapper, AVAILABLE_PLUGINS_TYPE))).toEqual(['Slack']);
    });

    test('a category chip narrows the locally held Installed group on top of the query', () => {
      const wrapper = render({ query: 'a', activeCategory: BTS_GROUP_TYPE, availablePlugins: [] });

      expect(rowNames(group(wrapper, ALL_GROUP_TYPE))).toEqual(['Jira Server', 'Rally']);
      expect(group(wrapper, AVAILABLE_PLUGINS_TYPE)).toHaveLength(0);
    });

    test('the Installed chip hides the Available group', () => {
      const wrapper = render({ activeCategory: INSTALLED_GROUP_TYPE });

      expect(group(wrapper, ALL_GROUP_TYPE).exists()).toBe(true);
      expect(group(wrapper, AVAILABLE_PLUGINS_TYPE)).toHaveLength(0);
    });
  });

  describe('Catalog.List.No Search Results', () => {
    test('hides both groups and offers to clear the search', () => {
      const onQueryChange = jest.fn();
      // an empty result set from GET /api/v1/plugins?q=, and nothing installed matches either
      const wrapper = render({
        query: 'nothing matches this',
        availablePlugins: [],
        onQueryChange,
      });

      expect(groupNames(wrapper)).toEqual([]);
      expect(wrapper.find('[data-automation-id="noSearchResults"]')).toHaveLength(1);

      click(wrapper.find('[data-automation-id="clearSearch"]').last());
      expect(onQueryChange).toHaveBeenCalledWith('');
    });

    test('an empty catalogue with no query is not a no-results state', () => {
      const wrapper = render({ installedPlugins: [], availablePlugins: [], query: '' });

      expect(wrapper.find('[data-automation-id="noSearchResults"]')).toHaveLength(0);
    });
  });

  describe('Catalog.List.Nothing Installed', () => {
    test('renders no Installed heading and no placeholder for it', () => {
      const wrapper = render({ installedPlugins: [], marketplaceInstalled: [] });

      expect(groupNames(wrapper)).toEqual([AVAILABLE_PLUGINS_TYPE]);
      expect(group(wrapper, ALL_GROUP_TYPE)).toHaveLength(0);
    });
  });

  describe('Catalog.List.All Installed', () => {
    test('renders no Available heading when the registry offers nothing new', () => {
      const wrapper = render({ availablePlugins: [] });

      expect(groupNames(wrapper)).toEqual([ALL_GROUP_TYPE]);
      expect(group(wrapper, AVAILABLE_PLUGINS_TYPE)).toHaveLength(0);
    });
  });

  describe('row actions', () => {
    test('an available plugin offers Install', () => {
      const wrapper = render({ availablePlugins: [slack] });

      expect(actions(group(wrapper, AVAILABLE_PLUGINS_TYPE))).toEqual([ROW_ACTIONS.INSTALL]);
    });

    test('a locked premium plugin offers Discover Premium instead of Install', () => {
      const wrapper = render({ availablePlugins: [qualityGate] });

      expect(actions(group(wrapper, AVAILABLE_PLUGINS_TYPE))).toEqual([
        ROW_ACTIONS.DISCOVER_PREMIUM,
      ]);
    });

    test('an installed plugin offers Update only when the registry announced one', () => {
      const wrapper = render({ availablePlugins: [] });

      expect(actions(group(wrapper, ALL_GROUP_TYPE))).toEqual([ROW_ACTIONS.UPDATE]);
    });

    test('Uninstall never appears in the list', () => {
      const wrapper = render();

      expect(actions(wrapper)).not.toContain('UNINSTALL');
      expect(wrapper.text()).not.toMatch(/uninstall/i);
    });

    test('the action reports which plugin it was raised for', () => {
      const onRowAction = jest.fn();
      const wrapper = render({ availablePlugins: [slack], onRowAction });

      click(wrapper.find('[data-automation-id="pluginRowAction"]').last().find('button'));

      expect(onRowAction).toHaveBeenCalledWith(
        ROW_ACTIONS.INSTALL,
        expect.objectContaining({ registryId: 'plugin-slack', latestVersion: '1.2.0' }),
      );
    });
  });

  describe('Catalog.List.Registry Offline', () => {
    const offlineProps = {
      offline: true,
      registryHost: 'marketplace.reportportal.io',
      // the registry block is absent for every installed plugin while offline
      marketplaceInstalled: [
        { name: 'JIRA', pluginId: null, marketplace: null },
        { name: 'RALLY', pluginId: null, marketplace: null },
      ],
    };

    test('names the exact host that could not be reached', () => {
      const alert = render(offlineProps).find('[data-automation-id="registryOfflineAlert"]');

      expect(alert).toHaveLength(1);
      expect(alert.text()).toContain('marketplace.reportportal.io');
    });

    test('says that the absence of warnings is not an all-clear', () => {
      const alert = render(offlineProps).find('[data-automation-id="registryOfflineAlert"]');

      expect(alert.text()).toMatch(/not an all-clear/i);
    });

    test('does not render the Available group even with a stale catalogue in the store', () => {
      const wrapper = render(offlineProps);

      expect(group(wrapper, AVAILABLE_PLUGINS_TYPE)).toHaveLength(0);
      expect(groupNames(wrapper)).toEqual([ALL_GROUP_TYPE]);
    });

    test('installed rows keep their names but lose every badge and action', () => {
      // the same two plugins carry a badge and an action while the registry answers
      const online = group(render({ availablePlugins: [] }), ALL_GROUP_TYPE);
      expect(online.find('[data-automation-id="pluginBadge"]').length).toBeGreaterThan(0);
      expect(actions(online)).toEqual([ROW_ACTIONS.UPDATE]);

      const installed = group(render(offlineProps), ALL_GROUP_TYPE);

      expect(rowNames(installed)).toEqual(['Jira Server', 'Rally']);
      expect(actions(installed)).toEqual([]);
      expect(installed.find('[data-automation-id="pluginBadge"]')).toHaveLength(0);
    });

    test('strips marketplace signals itself when the payload still carries them', () => {
      // service-api is expected to null the block, but the UI may not depend on it: nothing
      // marketplace-sourced is verifiable while offline, whatever the payload says
      const installed = group(
        render({
          offline: true,
          registryHost: 'marketplace.reportportal.io',
          availablePlugins: [],
          marketplaceInstalled: [jiraMerged, rallyMerged],
        }),
        ALL_GROUP_TYPE,
      );

      expect(rowNames(installed)).toEqual(['Jira Server', 'Rally']);
      expect(actions(installed)).toEqual([]);
      expect(installed.find('[data-automation-id="pluginBadge"]')).toHaveLength(0);
    });
  });

  describe('a catalogue request that failed outright', () => {
    // the fetch never produced a payload, so the store holds no registry data at all
    const failedProps = { failed: true, marketplaceInstalled: [], availablePlugins: [] };

    test('says the catalogue could not be loaded instead of showing a working page', () => {
      const alert = render(failedProps).find('[data-automation-id="catalogueUnavailableAlert"]');

      expect(alert).toHaveLength(1);
      expect(alert.text()).toMatch(/could not be loaded/i);
    });

    test('is not passed off as an offline registry', () => {
      const failed = render(failedProps);
      const offline = render({
        offline: true,
        registryHost: 'marketplace.reportportal.io',
        marketplaceInstalled: [],
      });

      expect(failed.find('[data-automation-id="registryOfflineAlert"]')).toHaveLength(0);
      expect(offline.find('[data-automation-id="catalogueUnavailableAlert"]')).toHaveLength(0);
      // offline the installed list is still authoritative; after a failure nothing is known
      expect(failed.find('[data-automation-id="catalogueUnavailableAlert"]').text()).toMatch(
        /out of date/i,
      );
      expect(offline.find('[data-automation-id="registryOfflineAlert"]').text()).not.toMatch(
        /out of date/i,
      );
    });

    test('renders no Available group and no marketplace signals on installed rows', () => {
      const wrapper = render({
        ...failedProps,
        // a payload left over from an earlier load must not be believed after a failure
        marketplaceInstalled: [jiraMerged, rallyMerged],
        availablePlugins: [slack],
      });

      expect(groupNames(wrapper)).toEqual([ALL_GROUP_TYPE]);
      expect(actions(group(wrapper, ALL_GROUP_TYPE))).toEqual([]);
      expect(
        group(wrapper, ALL_GROUP_TYPE).find('[data-automation-id="pluginBadge"]'),
      ).toHaveLength(0);
    });

    test('offers a retry rather than leaving the page as the only account of itself', () => {
      const onRetry = jest.fn();
      const wrapper = render({ ...failedProps, onRetry });

      click(wrapper.find('[data-automation-id="retryCatalogue"]').last().find('button'));

      expect(onRetry).toHaveBeenCalled();
    });

    test('a failure is not a no-results state, even with a query on screen', () => {
      const wrapper = render({ ...failedProps, installedPlugins: [], query: 'jira' });

      expect(wrapper.find('[data-automation-id="noSearchResults"]')).toHaveLength(0);
    });
  });

  describe('an installed plugin the registry could not match', () => {
    const zephyr = {
      name: 'ZEPHYR',
      type: 'ZEPHYR',
      enabled: true,
      groupType: BTS_GROUP_TYPE,
      details: { name: 'Zephyr', version: '1.0.0' },
    };

    test('is degraded the same way as offline while the registry is online', () => {
      const wrapper = render({
        installedPlugins: [jira, rally, zephyr],
        availablePlugins: [],
        // RALLY came back unmatched, ZEPHYR is missing from the merged response altogether
        marketplaceInstalled: [jiraMerged, { name: 'RALLY', pluginId: null, marketplace: null }],
      });
      const rows = group(wrapper, ALL_GROUP_TYPE).find('[data-automation-id="pluginRow"]');
      const [matched, unmatched, absent] = [rows.at(0), rows.at(1), rows.at(2)];

      expect(rowNames(group(wrapper, ALL_GROUP_TYPE))).toEqual(['Jira Server', 'Rally', 'Zephyr']);
      expect(matched.find('[data-automation-id="pluginBadge"]').length).toBeGreaterThan(0);
      expect(matched.find('[data-automation-id="pluginRowAction"]')).toHaveLength(1);
      // neither row may borrow another plugin's signals
      expect(unmatched.find('[data-automation-id="pluginBadge"]')).toHaveLength(0);
      expect(unmatched.find('[data-automation-id="pluginRowAction"]')).toHaveLength(0);
      expect(absent.find('[data-automation-id="pluginBadge"]')).toHaveLength(0);
      expect(absent.find('[data-automation-id="pluginRowAction"]')).toHaveLength(0);
    });

    test('an installed plugin that carries a tier field is still an installed row', () => {
      // rows are classified by an explicit kind, not by a field the local plugin may grow
      const wrapper = render({
        installedPlugins: [{ ...jira, tier: PLUGIN_TIERS.PREMIUM }],
        marketplaceInstalled: [jiraMerged],
        availablePlugins: [],
      });
      const row = group(wrapper, ALL_GROUP_TYPE).find('[data-automation-id="pluginRow"]').at(0);

      expect(row.find('[data-badge="ADVISORY"]')).toHaveLength(1);
      expect(row.find(`[data-badge="${PLUGIN_TIERS.PREMIUM}"]`)).toHaveLength(0);
      expect(actions(group(wrapper, ALL_GROUP_TYPE))).toEqual([ROW_ACTIONS.UPDATE]);
    });
  });
});
