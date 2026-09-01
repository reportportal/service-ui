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
} from 'common/constants/pluginsGroupTypes';
import { INSTALLED_GROUP_TYPE } from 'common/constants/pluginsFilter';
import catalogue from 'controllers/plugins/__fixtures__/catalogue.json';
import catalogueOffline from 'controllers/plugins/__fixtures__/catalogue-offline.json';
import { PLUGIN_TIERS } from 'common/constants/pluginTiers';
import { PluginsCatalog } from './pluginsCatalog';
import { ROW_ACTIONS } from './utils';

// GET /plugin — the locally installed integration types. It is a different endpoint from the
// catalogue and has no wire fixture, so only the display name is invented here; everything the
// two responses have to agree on is taken from the catalogue row itself.
const DISPLAY_NAMES = {
  jira: 'Jira',
  rally: 'Rally',
  gitlab: 'GitLab',
  'custom-scanner': 'Custom Scanner',
};
const localPlugin = (row) => ({
  name: row.name,
  type: row.name.toUpperCase(),
  enabled: row.enabled,
  groupType: row.groupType,
  details: { name: DISPLAY_NAMES[row.name], version: row.version },
});

const installedRow = (name) => catalogue.installed.find((row) => row.name === name);
const availableEntry = (id) => catalogue.available.find((entry) => entry.id === id);
const slack = availableEntry('plugin-notify-slack');
const azure = availableEntry('plugin-bts-azure');

const defaultProps = {
  installedPlugins: catalogue.installed.map(localPlugin),
  marketplaceInstalled: catalogue.installed,
  availablePlugins: catalogue.available,
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
  describe('Catalog.List.Default', () => {
    test('renders the Installed group before Available, each with its count', () => {
      const wrapper = render();

      expect(groupNames(wrapper)).toEqual([ALL_GROUP_TYPE, AVAILABLE_PLUGINS_TYPE]);
      expect(
        group(wrapper, ALL_GROUP_TYPE).find('[data-automation-id="pluginsGroupCount"]').text(),
      ).toBe('(4)');
      expect(
        group(wrapper, AVAILABLE_PLUGINS_TYPE)
          .find('[data-automation-id="pluginsGroupCount"]')
          .text(),
      ).toBe('(2)');
    });

    test('the Available group is the registry catalogue and nothing else', () => {
      const wrapper = render();

      expect(rowNames(group(wrapper, AVAILABLE_PLUGINS_TYPE))).toEqual(['Azure DevOps', 'Slack']);
      // a plugin the registry did not offer appears on the page under no heading
      expect(rowNames(wrapper)).not.toContain('Jira Cloud');
    });

    test('the row a plugin just landed in is marked, and only that one', () => {
      // The install moves the row from Available to Installed and the list reshuffles under the
      // user. The mark is the answer to "where did it go"; the toast says whether it worked.
      const row = installedRow('jira');
      const other = installedRow('rally');
      const wrapper = render({
        installedPlugins: [row, other].map(localPlugin),
        marketplaceInstalled: [row, other],
        availablePlugins: [],
        justInstalledId: row.marketplace.pluginId,
      });
      const marked = wrapper
        .find('[data-automation-id="pluginRow"]')
        .filterWhere((node) => node.prop('data-highlighted'));

      expect(marked).toHaveLength(1);
      expect(marked.find('.plugins-name').text()).toBe(DISPLAY_NAMES.jira);
    });

    test('nothing is marked when nothing was just installed', () => {
      const wrapper = render();

      expect(
        wrapper
          .find('[data-automation-id="pluginRow"]')
          .filterWhere((node) => node.prop('data-highlighted')),
      ).toHaveLength(0);
    });

    test('offers no sorting control', () => {
      expect(render().find('[data-automation-id="pluginsSorting"]')).toHaveLength(0);
    });

    test('no row carries a toggle: enable/disable lives on the plugin page', () => {
      // "ROWS: no toggle in the list" — the switcher is local state, and the catalogue is about
      // what the marketplace offers. Kills re-adding InputSwitcher to a row.
      const wrapper = render();

      expect(wrapper.find('InputSwitcher')).toHaveLength(0);
    });

    test('an installed plugin with no local display name is named by the registry', () => {
      // A PF4J plugin is identified by an id like "jira"; without the registry's name that id is
      // what the row prints, beside an available row reading "Azure DevOps". Kills dropping the
      // `marketplace?.name` step from getDisplayName.
      const row = installedRow('jira');
      const wrapper = render({
        installedPlugins: [{ ...localPlugin(row), details: { version: row.version } }],
        marketplaceInstalled: [row],
        availablePlugins: [],
      });

      expect(rowNames(group(wrapper, ALL_GROUP_TYPE))).toEqual([row.marketplace.name]);
    });

    test("ReportPortal's own name wins over the registry's", () => {
      // The rest of the product calls this plugin by its local name, and the catalogue must not
      // be the one screen that calls it something else. Kills swapping the fallback order.
      const row = installedRow('jira');
      const wrapper = render({
        installedPlugins: [localPlugin(row)],
        marketplaceInstalled: [row],
        availablePlugins: [],
      });

      expect(rowNames(group(wrapper, ALL_GROUP_TYPE))).toEqual([DISPLAY_NAMES.jira]);
    });

    test('a row shows the description, and shows none when there is none to show', () => {
      // Kills dropping the description element, and kills rendering an empty one for a plugin
      // the registry never described.
      const described = installedRow('jira');
      const bare = installedRow('gitlab');
      const wrapper = render({
        installedPlugins: [described, bare].map(localPlugin),
        marketplaceInstalled: [described, bare],
        availablePlugins: [],
      });
      const rows = group(wrapper, ALL_GROUP_TYPE).find('[data-automation-id="pluginRow"]');
      const rowNamed = (name) =>
        rows.filterWhere((node) => node.find('.plugins-name').text() === name);
      const descriptionOf = (row) => row.find('[data-automation-id="pluginDescription"]');

      expect(descriptionOf(rowNamed(DISPLAY_NAMES.jira)).text()).toBe(
        described.marketplace.description,
      );
      // gitlab is known only by its tombstone: a removed plugin has no catalogue entry left to
      // read a description from, so the row shows none rather than an empty line.
      expect(bare.marketplace.description).toBeUndefined();
      expect(descriptionOf(rowNamed(DISPLAY_NAMES.gitlab))).toHaveLength(0);
    });

    test('a row is signed with the author the registry named, not a guess', () => {
      // The row used to end in `|| 'ReportPortal'`, which signed every third-party plugin in the
      // catalogue with the wrong name. Kills reinstating any such fallback.
      const wrapper = render({ installedPlugins: [], marketplaceInstalled: [] });
      const rows = group(wrapper, AVAILABLE_PLUGINS_TYPE).find('[data-automation-id="pluginRow"]');
      const authorOf = (row) => row.find('.plugins-author');

      expect(azure.author).toBeTruthy();
      expect(azure.author).not.toBe('ReportPortal');
      expect(rows.filterWhere((r) => r.text().includes(azure.name)).find('.plugins-author').text())
        .toBe(`by ${azure.author}`);
      expect(authorOf(rows.at(0)).length).toBeGreaterThan(0);
    });

    test('a plugin nobody is named for shows no author line at all', () => {
      const wrapper = render({
        installedPlugins: [],
        marketplaceInstalled: [],
        availablePlugins: [{ ...azure, author: undefined }],
      });

      expect(group(wrapper, AVAILABLE_PLUGINS_TYPE).find('.plugins-author')).toHaveLength(0);
    });

    test('an available row shows the description the catalogue sent', () => {
      const wrapper = render({ installedPlugins: [], marketplaceInstalled: [] });
      const rows = group(wrapper, AVAILABLE_PLUGINS_TYPE).find('[data-automation-id="pluginRow"]');

      expect(rows.at(0).find('[data-automation-id="pluginDescription"]').text()).toBe(
        azure.description,
      );
    });
  });

  // Catalog.Row.All States — the "Installed · disabled" row.
  describe('Catalog.Row.disabled', () => {
    const disabledRow = (row) => ({ ...localPlugin(row), enabled: false });

    test('a switched-off plugin says so, where its action would have been', () => {
      // The toggle used to carry this and was removed from the row; without a state in its place
      // a disabled plugin is indistinguishable from a working one. Kills dropping getRowState.
      const row = installedRow('jira');
      const wrapper = render({
        installedPlugins: [disabledRow(row)],
        marketplaceInstalled: [row],
        availablePlugins: [],
      });
      const marker = wrapper.find('[data-automation-id="pluginRowState"]').first();

      expect(marker.prop('data-state')).toBe('DISABLED');
      expect(wrapper.find('[data-automation-id="pluginRowAction"]')).toHaveLength(0);
    });

    test('an enabled plugin keeps its action', () => {
      const row = installedRow('jira');
      const wrapper = render({
        installedPlugins: [localPlugin(row)],
        marketplaceInstalled: [row],
        availablePlugins: [],
      });

      expect(wrapper.find('[data-automation-id="pluginRowState"]')).toHaveLength(0);
      expect(actions(group(wrapper, ALL_GROUP_TYPE))).toEqual([ROW_ACTIONS.UPDATE]);
    });

    test('it survives an unreachable registry, unlike the marketplace badges', () => {
      // Local state, always knowable. The offline rule drops signals the registry vouches for;
      // whether an admin switched this plugin off is not one of them.
      const row = installedRow('jira');
      const wrapper = render({
        offline: true,
        registryHost: catalogueOffline.registry.host,
        installedPlugins: [disabledRow(row)],
        marketplaceInstalled: [row],
        availablePlugins: [],
      });

      expect(
        wrapper.find('[data-automation-id="pluginRowState"]').first().prop('data-state'),
      ).toBe('DISABLED');
      expect(wrapper.find('[data-automation-id="pluginBadge"]')).toHaveLength(0);
    });

    test('an available row never carries the state, whatever fields it happens to have', () => {
      const wrapper = render({
        installedPlugins: [],
        marketplaceInstalled: [],
        availablePlugins: [{ ...azure, enabled: false }],
      });

      expect(wrapper.find('[data-automation-id="pluginRowState"]')).toHaveLength(0);
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
      const wrapper = render({ query: 'la', availablePlugins: [azure] });

      expect(rowNames(group(wrapper, ALL_GROUP_TYPE))).toEqual(['GitLab']);
      expect(rowNames(group(wrapper, AVAILABLE_PLUGINS_TYPE))).toEqual(['Azure DevOps']);
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

      expect(rowNames(group(wrapper, ALL_GROUP_TYPE))).toEqual(['GitLab', 'Jira', 'Rally']);
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
      const wrapper = render({ availablePlugins: [azure] });

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
        expect.objectContaining({ registryId: 'plugin-notify-slack', latestVersion: '2.0.0' }),
      );
    });

    // the registry id of an installed plugin is a marketplace-sourced fact and is carried
    // nowhere but inside the marketplace block; read from the row itself it is always absent,
    // and Update would then be raised for no plugin at all
    test('Update carries the registry id the marketplace block states', () => {
      const onRowAction = jest.fn();
      const wrapper = render({ availablePlugins: [], onRowAction });

      click(wrapper.find('[data-automation-id="pluginRowAction"]').last().find('button'));

      expect(onRowAction).toHaveBeenCalledWith(
        ROW_ACTIONS.UPDATE,
        expect.objectContaining({ registryId: 'plugin-bts-jira', updateAvailable: '1.6.0' }),
      );
    });
  });

  describe('Catalog.List.Registry Offline', () => {
    // the registry block is absent for every installed plugin while offline
    const offlineProps = {
      offline: true,
      registryHost: catalogueOffline.registry.host,
      installedPlugins: catalogueOffline.installed.map(localPlugin),
      marketplaceInstalled: catalogueOffline.installed,
      availablePlugins: catalogueOffline.available,
    };

    test('names the exact host that could not be reached', () => {
      const alert = render(offlineProps).find('[data-automation-id="registryOfflineAlert"]');

      expect(alert).toHaveLength(1);
      expect(alert.text()).toContain('marketplace.reportportal.io');
    });

    test('the host is in the body, where nothing re-cases it', () => {
      // SystemMessage title-cases its header, which rendered "marketplace" as "Marketplace" — a
      // different hostname, and naming the host is only useful if it is the one to go and check.
      // .text() reads the DOM, which text-transform never touches, so this cannot be asserted by
      // reading the string: it has to be asserted by where the string is. Kills moving the host
      // back into the header.
      const alert = render(offlineProps).find('[data-automation-id="registryOfflineAlert"]');
      const header = alert.find('[data-automation-id="registryOfflineHost"]');

      expect(header.text()).toContain('marketplace.reportportal.io');
    });

    test('says that the absence of warnings is not an all-clear', () => {
      const alert = render(offlineProps).find('[data-automation-id="registryOfflineAlert"]');

      expect(alert.text()).toMatch(/not an all-clear/i);
    });

    test('does not render the Available group even with a stale catalogue in the store', () => {
      const wrapper = render({ ...offlineProps, availablePlugins: catalogue.available });

      expect(group(wrapper, AVAILABLE_PLUGINS_TYPE)).toHaveLength(0);
      expect(groupNames(wrapper)).toEqual([ALL_GROUP_TYPE]);
    });

    test('installed rows keep their names but lose every badge and action', () => {
      // the same plugins carry badges and an action while the registry answers
      const online = group(render({ availablePlugins: [] }), ALL_GROUP_TYPE);
      expect(online.find('span[data-automation-id="pluginBadge"]').length).toBeGreaterThan(0);
      expect(actions(online)).toEqual([ROW_ACTIONS.UPDATE]);

      const installed = group(render(offlineProps), ALL_GROUP_TYPE);

      expect(rowNames(installed)).toEqual(['Jira', 'Custom Scanner']);
      expect(actions(installed)).toEqual([]);
      expect(installed.find('span[data-automation-id="pluginBadge"]')).toHaveLength(0);
    });

    test('strips marketplace signals itself when the payload still carries them', () => {
      // service-api is expected to null the block, but the UI may not depend on it: nothing
      // marketplace-sourced is verifiable while offline, whatever the payload says
      const installed = group(
        render({
          offline: true,
          registryHost: catalogueOffline.registry.host,
          availablePlugins: [],
          marketplaceInstalled: catalogue.installed,
        }),
        ALL_GROUP_TYPE,
      );

      expect(actions(installed)).toEqual([]);
      expect(installed.find('span[data-automation-id="pluginBadge"]')).toHaveLength(0);
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
        registryHost: catalogueOffline.registry.host,
        marketplaceInstalled: catalogueOffline.installed,
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
        marketplaceInstalled: catalogue.installed,
        availablePlugins: catalogue.available,
      });

      expect(groupNames(wrapper)).toEqual([ALL_GROUP_TYPE]);
      expect(actions(group(wrapper, ALL_GROUP_TYPE))).toEqual([]);
      expect(
        group(wrapper, ALL_GROUP_TYPE).find('span[data-automation-id="pluginBadge"]'),
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
    test('is degraded the same way as offline while the registry is online', () => {
      const wrapper = render({
        availablePlugins: [],
        // gitlab is missing from the merged response altogether; custom-scanner is in it but
        // matched no registry entry, so it carries no marketplace block
        marketplaceInstalled: catalogue.installed.filter((row) => row.name !== 'gitlab'),
      });
      const rows = group(wrapper, ALL_GROUP_TYPE).find('[data-automation-id="pluginRow"]');
      const [absent, matched, , unmatched] = [rows.at(0), rows.at(1), rows.at(2), rows.at(3)];

      expect(rowNames(group(wrapper, ALL_GROUP_TYPE))).toEqual([
        'GitLab',
        'Jira',
        'Rally',
        'Custom Scanner',
      ]);
      expect(matched.find('span[data-automation-id="pluginBadge"]').length).toBeGreaterThan(0);
      expect(matched.find('[data-automation-id="pluginRowAction"]')).toHaveLength(1);
      // neither row may borrow another plugin's signals
      expect(unmatched.find('span[data-automation-id="pluginBadge"]')).toHaveLength(0);
      expect(unmatched.find('[data-automation-id="pluginRowAction"]')).toHaveLength(0);
      expect(absent.find('span[data-automation-id="pluginBadge"]')).toHaveLength(0);
      expect(absent.find('[data-automation-id="pluginRowAction"]')).toHaveLength(0);
    });

    test('an installed plugin that carries a tier field is still an installed row', () => {
      // rows are classified by an explicit kind, not by a field the local plugin may grow
      const wrapper = render({
        installedPlugins: [{ ...localPlugin(installedRow('jira')), tier: PLUGIN_TIERS.PREMIUM }],
        marketplaceInstalled: [installedRow('jira')],
        availablePlugins: [],
      });
      const row = group(wrapper, ALL_GROUP_TYPE).find('[data-automation-id="pluginRow"]').at(0);

      expect(row.find('span[data-badge="ADVISORY"]')).toHaveLength(1);
      expect(row.find(`span[data-badge="${PLUGIN_TIERS.PREMIUM}"]`)).toHaveLength(0);
      expect(actions(group(wrapper, ALL_GROUP_TYPE))).toEqual([ROW_ACTIONS.UPDATE]);
    });
  });
});
