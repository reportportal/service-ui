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
import { PLUGIN_TIERS } from 'common/constants/pluginTiers';
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

const render = (props = {}) =>
  mount(
    <Provider store={createStore(() => ({}))}>
      <IntlProvider locale="en" onError={() => {}}>
        <AvailablePluginDetail plugin={slack} detail={emptyDetail} {...props} />
      </IntlProvider>
    </Provider>,
  );

const find = (wrapper, id) => wrapper.find(`[data-automation-id="${id}"]`);

describe('AvailablePluginDetail', () => {
  test('the header carries the version the registry publishes', () => {
    expect(find(render(), 'pluginDetailVersion').first().text()).toBe('version 2.0.0');
  });

  test('installing asks for the plugin the page is showing', () => {
    const onInstall = jest.fn();
    const wrapper = render({ onInstall });

    find(wrapper, 'installAction').first().prop('onClick')();

    expect(onInstall).toHaveBeenCalledWith(slack);
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

  test('the registry blocks are part of the page', () => {
    expect(find(render({ detail: pluginDetail }), 'pluginVersions')).not.toHaveLength(0);
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
