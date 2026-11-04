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
import { InfoSection } from './infoSection';

// the logo fetches its image; what is under test here is the heading beside it
jest.mock('components/integrations/elements/pluginIcon', () => ({
  PluginIcon: () => null,
}));

const render = (props = {}) =>
  mount(
    <IntlProvider locale="en" onError={() => {}}>
      <InfoSection title="JUnit" data={{ name: 'junit', enabled: true }} {...props} />
    </IntlProvider>,
  );

describe('InfoSection', () => {
  test('a mark beside the name sits next to the heading, not inside it', () => {
    const wrapper = render({
      afterTitle: <span data-automation-id="uploadedManuallyBadge">Uploaded Manually</span>,
    });
    const row = wrapper.find('[data-automation-id="infoSectionTitleRow"]').hostNodes();
    const heading = wrapper.find('h2');

    expect(row).toHaveLength(1);
    expect(row.hasClass('title-row')).toBe(true);
    // the heading is the plugin's name alone, for the outline and for a screen reader
    expect(heading.text()).toBe('JUnit');
    expect(heading.find('[data-automation-id="uploadedManuallyBadge"]')).toHaveLength(0);
    expect(row.childAt(0).is('h2')).toBe(true);
    expect(row.childAt(1).prop('data-automation-id')).toBe('uploadedManuallyBadge');
  });

  test('without a mark the heading renders as it always has, with no row around it', () => {
    const wrapper = render();
    const heading = wrapper.find('h2');

    expect(wrapper.find('[data-automation-id="infoSectionTitleRow"]')).toHaveLength(0);
    expect(heading).toHaveLength(1);
    expect(heading.hasClass('title')).toBe(true);
    expect(heading.text()).toBe('JUnit');
    expect(heading.parent().hasClass('description-block')).toBe(true);
  });
});
