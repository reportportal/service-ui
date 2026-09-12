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
import { toAvailableRow, toInstalledRow } from '../../pluginsCatalog/utils';
import { PluginsItem } from './pluginsItem';

const availableEntry = (id) => catalogue.available.find((entry) => entry.id === id);
const slack = availableEntry('plugin-notify-slack');
const azure = availableEntry('plugin-bts-azure');
const jira = catalogue.installed.find((row) => row.name === 'jira');
// GET /plugin's half of the same plugin: the local record the merged entry is joined onto
const localJira = {
  name: jira.name,
  enabled: jira.enabled,
  groupType: jira.groupType,
  details: { name: 'Jira', version: jira.version },
};

const render = (data) =>
  mount(
    <IntlProvider locale="en" onError={() => {}}>
      <PluginsItem data={data} />
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

  // the two axes are drawn as two things, so neither count may be read off the other
  test('the trust mark is not one of the badges beside it', () => {
    const wrapper = render(toAvailableRow(slack));

    expect(wrapper.find('span[data-automation-id="pluginBadge"]')).toHaveLength(1);
    expect(find(wrapper, 'pluginTrustMark')).not.toHaveLength(0);
  });
});
