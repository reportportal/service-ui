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
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import catalogue from 'controllers/plugins/__fixtures__/catalogue.json';
import pluginDetail from 'controllers/plugins/__fixtures__/plugin-detail.json';
import offlineDetail from 'controllers/plugins/__fixtures__/plugin-detail-offline.json';
import { PLUGIN_TIERS, PLUGIN_TRUST_TIERS } from 'common/constants/pluginTiers';
import { SHOW_MODAL } from 'controllers/modal/constants';
import { toAvailableRow } from '../pluginsCatalog/utils';
import { AvailablePluginDetail } from './availablePluginDetail';

jest.mock('react-tracking', () => ({
  useTracking: () => ({ trackEvent: () => {} }),
}));

// the registry half of an unreachable registry's answer: the envelope and nothing under it
const emptyDetail = offlineDetail;

const availableRow = (id) => toAvailableRow(catalogue.available.find((entry) => entry.id === id));
const slack = availableRow('plugin-notify-slack');
const azure = availableRow('plugin-bts-azure');
// no fixture entry is a partner's, so the axis the catalogue does carry is turned to the value
// the frame shows rather than a row of this test's own making
const partner = { ...slack, trust: PLUGIN_TRUST_TIERS.PARTNER };

// what the page itself put on the store, as opposed to what it handed to its parent
const dispatched = [];
const store = createStore((state = {}, action) => {
  dispatched.push(action);
  return state;
});

const render = (props = {}) =>
  mount(
    <Provider store={store}>
      <IntlProvider locale="en" onError={() => {}}>
        <AvailablePluginDetail plugin={slack} detail={emptyDetail} {...props} />
      </IntlProvider>
    </Provider>,
  );

const find = (wrapper, id) => wrapper.find(`[data-automation-id="${id}"]`);
const modals = () => dispatched.filter(({ type }) => type === SHOW_MODAL);

describe('AvailablePluginDetail', () => {
  beforeEach(() => {
    dispatched.length = 0;
  });

  test('the header carries the version the registry publishes', () => {
    expect(find(render(), 'pluginDetailVersion').first().text()).toBe('version 2.0.0');
  });

  test('installing asks for the plugin the page is showing', () => {
    const onInstall = jest.fn();
    const wrapper = render({ onInstall });

    find(wrapper, 'installAction').first().prop('onClick')();

    expect(onInstall).toHaveBeenCalledWith(slack);
  });

  // An install is confirmed before it runs, and the page that owns the request is the page that
  // asks. Opening a dialog here as well would put two of them on screen for one click.
  test('the install is handed up, not decided here', () => {
    const wrapper = render({ onInstall: () => {} });

    find(wrapper, 'installAction').first().prop('onClick')();

    expect(modals()).toHaveLength(0);
  });

  // the premium enquiry is the page's own, which is what makes the absence above a decision
  test('the premium enquiry is the page’s own dialog', () => {
    const wrapper = render({ plugin: azure });

    find(wrapper, 'discoverPremiumAction').first().prop('onClick')();

    expect(modals()).toHaveLength(1);
  });

  // premium with a licence configured installs like any other plugin
  test('a premium plugin whose licence is configured offers Install', () => {
    const wrapper = render({ plugin: { ...azure, locked: false } });

    expect(azure.tier).toBe(PLUGIN_TIERS.PREMIUM);
    expect(find(wrapper, 'installAction')).not.toHaveLength(0);
    expect(find(wrapper, 'discoverPremiumAction')).toHaveLength(0);
  });

  test('a premium plugin with no licence can only be enquired about', () => {
    const wrapper = render({ plugin: azure });

    expect(find(wrapper, 'discoverPremiumAction')).not.toHaveLength(0);
    expect(find(wrapper, 'installAction')).toHaveLength(0);
  });

  // Plugin Detail. Available. Partner
  describe('the trust axis', () => {
    test('the header marks a partner plugin as one, and says what that means', () => {
      const mark = find(render({ plugin: partner }), 'pluginTrustMark').first();

      expect(mark.prop('data-trust')).toBe(PLUGIN_TRUST_TIERS.PARTNER);
      expect(mark.prop('title')).toMatch(/third-party vendor/i);
    });

    // the axes are independent, so the pricier one must not be able to answer for the other
    test('a partner plugin that is also premium states both', () => {
      const wrapper = render({ plugin: { ...azure, trust: PLUGIN_TRUST_TIERS.PARTNER } });

      expect(find(wrapper, 'pluginTrustMark').first().prop('data-trust')).toBe(
        PLUGIN_TRUST_TIERS.PARTNER,
      );
      expect(wrapper.find('span.premium')).not.toHaveLength(0);
    });

    test('a plugin the registry vouches for in no way this build knows carries no mark', () => {
      const wrapper = render({ plugin: { ...slack, trust: null } });

      expect(find(wrapper, 'pluginTrustMark')).toHaveLength(0);
    });

    // the header already states both axes; the blocks under it would only say it twice
    test('the blocks below do not repeat the tier the header carries', () => {
      const wrapper = render({ plugin: azure, detail: pluginDetail });

      expect(find(wrapper, 'pluginDetailTierRow')).toHaveLength(0);
    });
  });

  test('the registry blocks are part of the page', () => {
    expect(find(render({ detail: pluginDetail }), 'pluginVersions')).not.toHaveLength(0);
  });

  // The rows below disable a version that does not run here; the header's Install opens a
  // dialog over the same list, so with nothing in it that fits, the header is dead as well.
  describe('Install when no listed version fits', () => {
    // Jira Cloud as reported: built for 25.x, on an instance running 26.0
    const outgrown = {
      ...pluginDetail,
      versions: [
        { version: '5.13.1', compatible: false, requires: '>=25.0, <26.0', blocked: false },
        { version: '5.12.0', compatible: false, requires: '>=25.0, <26.0', blocked: false },
      ],
    };
    const installAction = (wrapper) => find(wrapper, 'installAction').first();
    const reason = (wrapper) => find(wrapper, 'installUnavailableReason').hostNodes();

    test('is disabled, and says why under the button', () => {
      const wrapper = render({ detail: outgrown, productVersion: '26.0' });

      expect(installAction(wrapper).prop('disabled')).toBe(true);
      expect(reason(wrapper).text()).toBe('No published version runs on ReportPortal 26.0.');
    });

    test('without a release to name, it still says nothing can be installed', () => {
      const wrapper = render({ detail: outgrown });

      expect(installAction(wrapper).prop('disabled')).toBe(true);
      expect(reason(wrapper).text()).toBe(
        'No published version can be installed on this instance.',
      );
    });

    test('every version blocked is the same dead end, not a compatibility one', () => {
      const wrapper = render({
        detail: {
          ...pluginDetail,
          versions: [{ version: '1.6.0', compatible: true, blocked: true }],
        },
        productVersion: '26.0',
      });

      expect(installAction(wrapper).prop('disabled')).toBe(true);
      expect(reason(wrapper).text()).toBe(
        'No published version can be installed on this instance.',
      );
    });

    test('one version that runs is enough to keep it live', () => {
      const wrapper = render({
        detail: {
          ...outgrown,
          versions: [...outgrown.versions, { version: '5.11.0', compatible: true }],
        },
        productVersion: '26.0',
      });

      expect(installAction(wrapper).prop('disabled')).toBe(false);
      expect(reason(wrapper)).toHaveLength(0);
    });

    // service-api serialises with NON_NULL: an undecided verdict arrives as nothing, and is not
    // a refusal anywhere else on the page
    test('a verdict that never arrived does not disable it', () => {
      const wrapper = render({
        detail: { ...pluginDetail, versions: [{ version: '5.13.1' }] },
        productVersion: '26.0',
      });

      expect(installAction(wrapper).prop('disabled')).toBe(false);
    });

    test('an answer that has not landed, or cannot be believed, decides nothing', () => {
      [{ loading: true }, { offline: true }, { failed: true }].forEach((state) => {
        const wrapper = render({ detail: outgrown, productVersion: '26.0', ...state });

        expect(installAction(wrapper).prop('disabled')).toBe(false);
        expect(reason(wrapper)).toHaveLength(0);
      });
    });

    test('the version rows agree with it', () => {
      const wrapper = render({ detail: outgrown, productVersion: '26.0' });

      const rows = find(wrapper, 'useVersionAction').hostNodes();

      expect(rows).toHaveLength(2);
      rows.forEach((row) => expect(row.prop('disabled')).toBe(true));
    });
  });

  // the page must not become a place where an unverifiable claim can still be read
  test('nothing registry-derived survives an offline registry', () => {
    const wrapper = render({
      detail: pluginDetail,
      offline: true,
      registryHost: offlineDetail.registry.host,
    });

    expect(find(wrapper, 'pluginVersions')).toHaveLength(0);
    expect(find(wrapper, 'pluginAdvisoryAlert')).toHaveLength(0);
    expect(find(wrapper, 'registryOfflineAlert')).not.toHaveLength(0);
  });
});
