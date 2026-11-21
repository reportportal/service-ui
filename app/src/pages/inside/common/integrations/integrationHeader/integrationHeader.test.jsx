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
import { IntegrationHeader } from './integrationHeader';

jest.mock('react-tracking', () => ({
  useTracking: () => ({ trackEvent: () => {} }),
}));
jest.mock('@reportportal/ui-kit', () => ({ Breadcrumbs: () => null }));
jest.mock('components/integrations/elements/pluginIcon', () => ({ PluginIcon: () => null }));
jest.mock('components/main/navLink', () => () => null);

const render = (details) =>
  mount(
    <IntlProvider locale="en" onError={() => {}}>
      <IntegrationHeader data={{ name: 'custom-plugin', details }} documentationLinkEvent={null} />
    </IntlProvider>,
  );

describe('IntegrationHeader for a plugin without a bundled description', () => {
  test('renders the plugin description through the plugin sanitiser', () => {
    const wrapper = render({
      description:
        '<b>Sync</b><img src="https://example.com/p.png"><a href="javascript:void(0)">x</a>',
    });

    expect(wrapper.find('b').text()).toBe('Sync');
    expect(wrapper.find('img')).toHaveLength(0);
    expect(wrapper.find('a').filterWhere((link) => !!link.prop('href'))).toHaveLength(0);
  });

  test('links to http(s) documentation', () => {
    const wrapper = render({ documentation: 'https://example.com/docs' });

    expect(wrapper.find('a[data-automation-id="documentationLink"]').prop('href')).toBe(
      'https://example.com/docs',
    );
  });

  test.each(['javascript:void(0)', 'data:text/html,x', ''])(
    'renders no documentation link for %p',
    (documentation) => {
      const wrapper = render({ documentation });

      expect(wrapper.find('a[data-automation-id="documentationLink"]')).toHaveLength(0);
    },
  );
});
