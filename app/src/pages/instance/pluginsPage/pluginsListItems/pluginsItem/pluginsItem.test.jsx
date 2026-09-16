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
import catalogue from 'controllers/plugins/__fixtures__/catalogue.json';
import { PLUGIN_TIERS, PLUGIN_TRUST_TIERS } from 'common/constants/pluginTiers';
import { PluginBadge } from '../../pluginBadge';
import { VersionMark } from '../../versionMark';
import { toAvailableRow, toInstalledRow } from '../../pluginsCatalog/utils';
import { PluginsItem } from './pluginsItem';

const availableEntry = (id) => catalogue.available.find((entry) => entry.id === id);
const slack = availableEntry('plugin-notify-slack');
const azure = availableEntry('plugin-bts-azure');
const jira = catalogue.installed.find((row) => row.name === 'jira');
// the installed plugin whose update is being withheld: 5.0.0 is published and needs 26.2
const sauce = catalogue.installed.find((row) => row.name === 'sauce-labs');
// the available plugin whose latest build does not run on this release
const incompatibleAvailable = availableEntry('plugin-other-sauce-labs');
// GET /plugin's half of the same plugin: the local record the merged entry is joined onto
const localJira = {
  name: jira.name,
  enabled: jira.enabled,
  groupType: jira.groupType,
  details: { name: 'Jira', version: jira.version },
};

const localSauce = {
  name: sauce.name,
  enabled: sauce.enabled,
  groupType: sauce.groupType,
  details: { name: 'Sauce Labs', version: sauce.version },
};

const render = (data, props = {}) =>
  mount(
    <IntlProvider locale="en" onError={() => {}}>
      <PluginsItem data={data} productVersion={catalogue.instance.productVersion} {...props} />
    </IntlProvider>,
  );

const find = (wrapper, id) => wrapper.find(`[data-automation-id="${id}"]`);
const trustOf = (wrapper) => find(wrapper, 'pluginTrustMark').first().prop('data-trust');

describe('PluginsItem', () => {
  describe('the trust axis', () => {
    test('a partner plugin says so beside its name', () => {
      const row = toAvailableRow({ ...slack, tier: PLUGIN_TRUST_TIERS.PARTNER });

      expect(trustOf(render(row))).toBe(PLUGIN_TRUST_TIERS.PARTNER);
    });

    // the bug this fixes: the row read one field for both axes, so the pricier of the two won
    test('a premium partner plugin carries both marks, not one of them', () => {
      const wrapper = render(toAvailableRow({ ...azure, tier: PLUGIN_TRUST_TIERS.PARTNER }));

      expect(trustOf(wrapper)).toBe(PLUGIN_TRUST_TIERS.PARTNER);
      expect(wrapper.find(`span[data-badge="${PLUGIN_TIERS.PREMIUM}"]`)).toHaveLength(1);
    });

    test('an installed plugin is no longer left with no tier at all', () => {
      expect(trustOf(render(toInstalledRow(localJira, jira)))).toBe(
        PLUGIN_TRUST_TIERS.OFFICIAL,
      );
    });

    // the same rule as every other marketplace signal: unverifiable is unsaid
    test('a row whose registry block cannot be believed vouches for nobody', () => {
      const wrapper = render(toInstalledRow(localJira, jira, false));

      expect(find(wrapper, 'pluginTrustMark')).toHaveLength(0);
    });
  });

  describe('a build that does not run on this release', () => {
    // the explanation is the tooltip's content now, not the browser's `title`
    const markOf = (wrapper) =>
      find(wrapper, 'pluginIncompatibleMark').first().parents(VersionMark).first();
    const reasonOf = (wrapper) => markOf(wrapper).prop('tooltipContent');
    const actionButton = (wrapper) => find(wrapper, 'pluginRowAction').find('button').first();

    test('an available row is marked and its Install is dead', () => {
      const wrapper = render(toAvailableRow(incompatibleAvailable));

      expect(find(wrapper, 'pluginIncompatibleMark')).not.toHaveLength(0);
      expect(actionButton(wrapper).prop('disabled')).toBe(true);
    });

    test('the mark names the requirement and the release this instance runs', () => {
      const reason = reasonOf(render(toAvailableRow(incompatibleAvailable)));

      expect(reason).toContain('>=26.2');
      expect(reason).toContain('26.1');
    });

    test('a row whose latest build does run is neither marked nor disabled', () => {
      const wrapper = render(toAvailableRow(slack));

      expect(find(wrapper, 'pluginIncompatibleMark')).toHaveLength(0);
      expect(actionButton(wrapper).prop('disabled')).toBe(false);
    });

    // NON_NULL means service-api sends nothing when it could not decide, and reading that as a
    // refusal would ground every plugin on an instance that never set rp.product.version
    test('a verdict that never arrived is not a refusal', () => {
      const wrapper = render(toAvailableRow({ ...slack, compatible: undefined, requires: undefined }));

      expect(find(wrapper, 'pluginIncompatibleMark')).toHaveLength(0);
      expect(actionButton(wrapper).prop('disabled')).toBe(false);
    });

    // the state that was invisible: updateAvailable is absent whether the instance is current or
    // the newer build cannot be taken, so without the mark the second one read as the first
    test('an installed row says an update is being withheld rather than nothing', () => {
      const wrapper = render(toInstalledRow(localSauce, sauce));
      const reason = reasonOf(wrapper);

      expect(reason).toContain('5.0.0');
      expect(reason).toContain('>=26.2');
      expect(reason).toContain('26.1');
      expect(find(wrapper, 'pluginRowAction')).toHaveLength(0);
    });

    test('an installed row that is genuinely current is not marked', () => {
      const rally = catalogue.installed.find((row) => row.name === 'rally');
      const wrapper = render(
        toInstalledRow(
          { name: rally.name, enabled: rally.enabled, groupType: rally.groupType,
            details: { name: 'Rally', version: rally.version } },
          rally,
        ),
      );

      expect(find(wrapper, 'pluginIncompatibleMark')).toHaveLength(0);
    });

    // the same rule as every other marketplace signal: unverifiable is unsaid
    test('a row whose registry block cannot be believed claims no incompatibility', () => {
      const wrapper = render(toInstalledRow(localSauce, sauce, false));

      expect(find(wrapper, 'pluginIncompatibleMark')).toHaveLength(0);
    });
  });

  describe('the one badge a row shows', () => {
    const badges = (wrapper) =>
      wrapper.find('span[data-automation-id="pluginBadge"]').map((b) => b.prop('data-badge'));
    // tone is a PluginBadge prop, so read it off the component rather than the span it renders
    const advisoryBadge = (wrapper) =>
      wrapper.find(PluginBadge).filterWhere((b) => b.prop('data-badge') === 'ADVISORY').first();
    // the same local half, with whatever registry block a case needs
    const installed = (marketplace) =>
      toInstalledRow(localJira, { ...jira, marketplace: { ...jira.marketplace, ...marketplace } });

    // the checked-in fixture has a row that is both, and it used to print a pill for each: three
    // pills on one row make the reader rank them, and the ranking is not theirs to do
    test('a row that is several bad things at once shows only the worst', () => {
      const wrapper = render(installed({}));

      expect(badges(wrapper)).toEqual(['BLOCKED']);
    });

    test('removal outranks a block', () => {
      const wrapper = render(
        installed({ removed: { removed: '2026-03-01T00:00:00Z', removalReason: 'withdrawn' } }),
      );

      expect(badges(wrapper)).toEqual(['REMOVED']);
    });

    test('a block outranks an advisory', () => {
      expect(badges(render(installed({ blocked: null })))).toEqual(['ADVISORY']);
    });

    test('a row with nothing wrong shows no badge at all', () => {
      expect(badges(render(installed({ advisory: null, blocked: null })))).toEqual([]);
    });

    // a list is where an admin decides which plugin to open first, so this is exactly where
    // reading the advisory as a boolean cost something
    test('a severe advisory is not the same pill as a mild one', () => {
      const mild = render(installed({ blocked: null, advisory: { severity: 'low', text: 'x' } }));
      const severe = render(
        installed({ blocked: null, advisory: { severity: 'critical', text: 'x' } }),
      );

      expect(advisoryBadge(mild).prop('tone')).toBe('warning');
      expect(advisoryBadge(severe).prop('tone')).toBe('danger');
    });

    test('the badge names the severity the registry published', () => {
      const wrapper = render(
        installed({ blocked: null, advisory: { severity: 'high', text: 'x' } }),
      );

      expect(advisoryBadge(wrapper).text()).toBe('Advisory — high');
      expect(advisoryBadge(wrapper).prop('data-severity')).toBe('high');
    });

    test('an advisory with no severity is still a badge, just an unqualified one', () => {
      const wrapper = render(installed({ blocked: null, advisory: { text: 'x' } }));

      expect(advisoryBadge(wrapper).text()).toBe('Advisory');
      expect(advisoryBadge(wrapper).prop('tone')).toBe('warning');
    });
  });

  // the two axes are drawn as two things, so neither count may be read off the other
  test('the trust mark is not one of the badges beside it', () => {
    const wrapper = render(toAvailableRow(slack));

    expect(wrapper.find('span[data-automation-id="pluginBadge"]')).toHaveLength(1);
    expect(find(wrapper, 'pluginTrustMark')).not.toHaveLength(0);
  });
});
