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
import { PLUGIN_TIERS } from '../availablePluginsCatalog';
import { AvailablePluginDetail } from './availablePluginDetail';

jest.mock('react-tracking', () => ({
  useTracking: () => ({ trackEvent: () => {} }),
}));

const emptyDetail = {
  versions: [],
  changelog: null,
  screenshots: [],
  advisory: null,
  blocked: null,
  removed: null,
};

const slack = {
  kind: 'AVAILABLE',
  registryId: 'plugin-notification-slack',
  name: 'Slack',
  description: 'Slack notifications',
  latestVersion: '1.5.2',
  tier: PLUGIN_TIERS.FREE,
  locked: false,
  details: { name: 'Slack', version: '1.5.2' },
};

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

  test('the header carries the version the registry publishes', () => {
    expect(find(render(), 'pluginDetailVersion').first().text()).toBe('version 1.5.2');
  });

  test('installing asks for the plugin the page is showing', () => {
    const onInstall = jest.fn();
    const wrapper = render({ onInstall });

    find(wrapper, 'installAction').first().prop('onClick')();

    expect(onInstall).toHaveBeenCalledWith(slack);
  });

  // premium with a licence configured installs like any other plugin
  test('a premium plugin whose licence is configured offers Install', () => {
    const wrapper = render({ plugin: { ...slack, tier: PLUGIN_TIERS.PREMIUM, locked: false } });

    expect(find(wrapper, 'installAction')).not.toHaveLength(0);
    expect(find(wrapper, 'discoverPremiumAction')).toHaveLength(0);
  });

  test('a premium plugin with no licence can only be enquired about', () => {
    const wrapper = render({ plugin: { ...slack, tier: PLUGIN_TIERS.PREMIUM, locked: true } });

    expect(find(wrapper, 'discoverPremiumAction')).not.toHaveLength(0);
    expect(find(wrapper, 'installAction')).toHaveLength(0);
  });

  test('the registry blocks are part of the page', () => {
    const detail = {
      ...emptyDetail,
      versions: [{ version: '1.5.2', publishedAt: '2026-03-12T00:00:00Z' }],
    };

    expect(find(render({ detail }), 'pluginVersions')).not.toHaveLength(0);
  });

  // the page must not become a place where an unverifiable claim can still be read
  test('nothing registry-derived survives an offline registry', () => {
    const detail = {
      ...emptyDetail,
      versions: [{ version: '1.5.2', publishedAt: '2026-03-12T00:00:00Z' }],
      advisory: { severity: 'high', text: 'CVE-2026-1234', attachedAt: '2026-02-15T00:00:00Z' },
    };
    const wrapper = render({ detail, offline: true, registryHost: 'registry.rp.io' });

    expect(find(wrapper, 'pluginVersions')).toHaveLength(0);
    expect(find(wrapper, 'pluginAdvisoryAlert')).toHaveLength(0);
    expect(find(wrapper, 'registryOfflineAlert')).not.toHaveLength(0);
  });
});
