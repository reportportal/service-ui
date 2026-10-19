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
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { IntlProvider } from 'react-intl';
import { SystemMessage } from '@reportportal/ui-kit';
import { INTEGRATIONS_SETTINGS_COMPONENTS_MAP } from 'components/integrations/settingsComponentsMap';
import { IntegrationSettingsContainer } from './integrationSettingsContainer';

const STUB_PLUGIN = 'stubPlugin';
const StubSettings = () => <div className="stub-settings" />;

const integration = (pluginName) => ({
  id: 1,
  name: 'instance',
  integrationType: { name: pluginName },
  integrationParameters: {},
});

const render = (pluginName) => {
  const store = createStore((state) => state, {
    plugins: { plugins: [], uiExtensions: { extensionManifests: [] } },
  });

  return mount(
    <Provider store={store}>
      <IntlProvider locale="en" onError={() => {}}>
        <IntegrationSettingsContainer data={integration(pluginName)} goToPreviousPage={() => {}} />
      </IntlProvider>
    </Provider>,
  );
};

describe('IntegrationSettingsContainer', () => {
  // the plugin is added to the real map rather than a mocked one, so the test still fails if the
  // container stops reading that map
  beforeAll(() => {
    INTEGRATIONS_SETTINGS_COMPONENTS_MAP[STUB_PLUGIN] = StubSettings;
  });
  afterAll(() => {
    delete INTEGRATIONS_SETTINGS_COMPONENTS_MAP[STUB_PLUGIN];
  });

  it('renders the settings component of a plugin the map knows', () => {
    const wrapper = render(STUB_PLUGIN);

    expect(wrapper.find(StubSettings).exists()).toBe(true);
    expect(wrapper.find(SystemMessage).exists()).toBe(false);
  });

  it('explains itself instead of crashing on a plugin in neither the map nor the extensions', () => {
    const wrapper = render('marketplace-installed-plugin');

    expect(wrapper.find(StubSettings).exists()).toBe(false);
    expect(wrapper.find(SystemMessage).text()).toContain(
      'Configuration form is not available for this plugin',
    );
  });
});
