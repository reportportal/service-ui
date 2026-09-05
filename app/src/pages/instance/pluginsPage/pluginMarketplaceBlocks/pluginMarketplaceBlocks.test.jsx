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
import detail from 'controllers/plugins/__fixtures__/plugin-detail.json';
import removedDetail from 'controllers/plugins/__fixtures__/plugin-detail-removed.json';
import offlineDetail from 'controllers/plugins/__fixtures__/plugin-detail-offline.json';
import { PluginMarketplaceBlocks } from './pluginMarketplaceBlocks';

// the same answer with one part of it taken out, rather than a shape of this test's own making
const without = (...keys) =>
  Object.fromEntries(Object.entries(detail).filter(([key]) => !keys.includes(key)));

const render = (props = {}) =>
  mount(
    <IntlProvider locale="en">
      <PluginMarketplaceBlocks detail={detail} {...props} />
    </IntlProvider>,
  );

const find = (wrapper, id) => wrapper.find(`[data-automation-id="${id}"]`);

describe('PluginMarketplaceBlocks', () => {
  describe('versions', () => {
    test('lists every published version, newest first', () => {
      const text = find(render(), 'pluginVersions').text();

      expect(find(render(), 'pluginVersionRow')).toHaveLength(2);
      expect(text.indexOf('v.1.6.0')).toBeLessThan(text.indexOf('v.1.5.2'));
    });

    // the registry states a date, so it is shown as that date rather than shifted into the
    // reader's timezone
    test('a version row carries the publish date the registry stated', () => {
      expect(find(render(), 'pluginVersions').text()).toContain('Mar 12, 2026');
    });

    test('the versions block is absent when the registry named no versions', () => {
      const wrapper = render({ detail: { ...detail, versions: offlineDetail.versions } });

      expect(find(wrapper, 'pluginVersions')).toHaveLength(0);
    });
  });

  // FR-A-03. The endpoint has always taken an arbitrary version and the saga has always posted
  // whatever it was given; the list is where an admin reaches a version that is neither the
  // latest nor the one running.
  describe('rolling back to another version', () => {
    const installed = { installedVersion: '1.6.0', onUseVersion: () => {} };
    const rowFor = (wrapper, version) =>
      find(wrapper, 'pluginVersionRow').filterWhere((node) => node.prop('data-version') === version);

    test('posts the version whose row was clicked', () => {
      // 1.5.2 is blocked in the fixture, so an unblocked older version is added to roll back to
      const versions = [...detail.versions, { version: '1.4.0', publishedAt: '2025-11-01T00:00:00Z', blocked: false }];
      const posted = [];
      const wrapper = render({
        detail: { ...detail, versions },
        ...installed,
        onUseVersion: (version) => posted.push(version),
      });

      rowFor(wrapper, '1.4.0').find('[data-automation-id="useVersionAction"]').first().prop('onClick')();

      expect(posted).toEqual(['1.4.0']);
    });

    test('the running version is labelled, not offered', () => {
      const wrapper = render(installed);
      const row = rowFor(wrapper, '1.6.0');

      expect(find(row, 'installedVersionMarker')).toHaveLength(1);
      expect(find(row, 'useVersionAction')).toHaveLength(0);
    });

    test('a blocked version is labelled, not offered', () => {
      // FR-OP-03 keeps it in the history and refuses the download; a control here earns a 403
      const wrapper = render(installed);
      const row = rowFor(wrapper, '1.5.2');

      expect(detail.versions.find((v) => v.version === '1.5.2').blocked).toBe(true);
      expect(find(row, 'blockedVersionMarker')).toHaveLength(1);
      expect(find(row, 'useVersionAction')).toHaveLength(0);
    });

    test('a removed plugin offers no version at all', () => {
      // the registry answers 410 for every version, so none of them is reachable
      const wrapper = render({
        detail: { ...detail, removed: removedDetail.removed },
        ...installed,
      });

      expect(find(wrapper, 'useVersionAction')).toHaveLength(0);
    });

    test('a page with nothing installed shows no version actions', () => {
      // the available-plugin page renders this same component: there is nothing to change from
      const wrapper = render();

      expect(find(wrapper, 'useVersionAction')).toHaveLength(0);
      expect(find(wrapper, 'installedVersionMarker')).toHaveLength(0);
    });
  });

  describe('changelog', () => {
    test('the heading carries the version it describes', () => {
      expect(find(render(), 'pluginChangelog').text()).toContain("What's new in 1.6.0");
    });

    test('every changelog line is rendered', () => {
      expect(find(render(), 'pluginChangelogLine')).toHaveLength(2);
    });

    test('the changelog block is absent when there is none', () => {
      const wrapper = render({ detail: without('changelog') });

      expect(find(wrapper, 'pluginChangelog')).toHaveLength(0);
    });
  });

  describe('screenshots', () => {
    test('renders one tile per screenshot', () => {
      expect(find(render(), 'pluginScreenshot')).toHaveLength(2);
    });

    // an empty group is absence of data, so it is hidden rather than explained
    test('the whole block is absent when there are none, not an empty strip', () => {
      const wrapper = render({ detail: { ...detail, screenshots: offlineDetail.screenshots } });

      expect(find(wrapper, 'pluginScreenshots')).toHaveLength(0);
    });
  });

  describe('marketplace alerts', () => {
    test('the advisory names what happened, its severity and when it was reported', () => {
      const text = find(render(), 'pluginAdvisoryAlert').text();

      expect(text).toContain('high');
      expect(text).toContain('Leaks the API key into the log');
      expect(text).toContain('Mar 12, 2026');
    });

    test('the advisory says the plugin keeps running', () => {
      expect(find(render(), 'pluginAdvisoryAlert').text()).toContain('keeps running');
    });

    test('a blocked version says it keeps running but cannot be rolled back to', () => {
      const text = find(render(), 'pluginBlockedAlert').text();

      expect(text).toContain('Signed with a revoked key');
      expect(text).toContain('keeps running');
      expect(text).toContain('cannot be reinstalled or rolled back to');
      expect(text).toContain('Archive the current .jar');
    });

    test('a removed plugin keeps running and leaves manual upload as the only path', () => {
      const text = find(render({ detail: removedDetail }), 'pluginRemovedAlert').text();

      expect(text).toContain('Vendor withdrew it');
      expect(text).toContain('Jan 5, 2026');
      expect(text).toContain('keeps running');
      expect(text).toContain('no version can be installed, updated or rolled back to');
      expect(text).toContain('Manual .jar upload is the only remaining path');
    });

    test('no alert is rendered when the registry reports nothing against the plugin', () => {
      const wrapper = render({ detail: without('advisory', 'blocked') });

      expect(find(wrapper, 'pluginAdvisoryAlert')).toHaveLength(0);
      expect(find(wrapper, 'pluginBlockedAlert')).toHaveLength(0);
      expect(find(wrapper, 'pluginRemovedAlert')).toHaveLength(0);
    });

    // a field this service never sends can only ever render a blank clause, so it is not read
    // at all: reading it would put a sentence on screen that nothing can fill
    test('no alert reads a field the registry does not publish', () => {
      const wrapper = render({
        detail: {
          ...detail,
          advisory: { ...detail.advisory, fixedIn: '9.9.9' },
          blocked: { blockedAt: detail.blocked.blockedAt, blockReason: 'never sent' },
          removed: { removedAt: '2026-01-05T12:00:00Z', removalReason: 'Vendor withdrew it' },
        },
      });

      expect(find(wrapper, 'pluginAdvisoryAlert').text()).not.toContain('9.9.9');
      expect(find(wrapper, 'pluginBlockedAlert').text()).not.toContain('never sent');
      expect(find(wrapper, 'pluginRemovedAlert').text()).not.toContain('Jan 5, 2026');
    });
  });

  describe('degradation', () => {
    const loud = { ...detail, removed: removedDetail.removed };

    const assertNothingClaimed = (wrapper) => {
      expect(find(wrapper, 'pluginVersions')).toHaveLength(0);
      expect(find(wrapper, 'pluginChangelog')).toHaveLength(0);
      expect(find(wrapper, 'pluginScreenshots')).toHaveLength(0);
      expect(find(wrapper, 'pluginAdvisoryAlert')).toHaveLength(0);
      expect(find(wrapper, 'pluginBlockedAlert')).toHaveLength(0);
      expect(find(wrapper, 'pluginRemovedAlert')).toHaveLength(0);
    };

    test('offline shows nothing registry-derived, whatever the payload carried', () => {
      const wrapper = render({ detail: loud, offline: true, registryHost: 'registry.rp.io' });

      assertNothingClaimed(wrapper);
    });

    test('offline names the host that could not be reached', () => {
      const wrapper = render({
        detail: loud,
        offline: true,
        registryHost: offlineDetail.registry.host,
      });

      expect(find(wrapper, 'registryOfflineAlert').text()).toContain('marketplace.reportportal.io');
    });

    // the same rule as the catalogue: a failure is not a quieter kind of offline
    test('a failed request shows nothing registry-derived either', () => {
      const wrapper = render({ detail: loud, failed: true });

      assertNothingClaimed(wrapper);
    });

    test('a failed request says so rather than looking like a plugin with nothing to report', () => {
      const wrapper = render({ detail: loud, failed: true });

      expect(find(wrapper, 'catalogueUnavailableAlert')).toHaveLength(1);
    });

    // an unmatched plugin was never asked about, so whatever the store still holds is some
    // other plugin's answer
    test('an unmatched plugin claims nothing and says why', () => {
      const wrapper = render({ detail: loud, unmatched: true });

      assertNothingClaimed(wrapper);
      expect(find(wrapper, 'pluginUnmatchedAlert').text()).toMatch(/no entry/i);
    });

    test('an unmatched plugin whose registry is down is explained as offline, once', () => {
      const wrapper = render({ detail: loud, unmatched: true, offline: true });

      expect(find(wrapper, 'registryOfflineAlert')).toHaveLength(1);
      expect(find(wrapper, 'pluginUnmatchedAlert')).toHaveLength(0);
    });

    test('nothing is claimed while the request is still in flight', () => {
      const wrapper = render({ detail: loud, loading: true });

      assertNothingClaimed(wrapper);
      expect(find(wrapper, 'pluginDetailLoader')).toHaveLength(1);
    });
  });
});
