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
import { PLUGIN_TRUST_TIERS } from 'common/constants/pluginTiers';
import { PluginTrustMark } from './pluginTrustMark';

const render = (props = {}) =>
  mount(
    <IntlProvider locale="en" onError={() => {}}>
      <PluginTrustMark {...props} />
    </IntlProvider>,
  );

const mark = (wrapper) => wrapper.find('[data-automation-id="pluginTrustMark"]');

describe('PluginTrustMark', () => {
  test('a partner plugin is marked as one, and says what that means', () => {
    const wrapper = render({ trust: PLUGIN_TRUST_TIERS.PARTNER });

    expect(mark(wrapper).first().prop('data-trust')).toBe(PLUGIN_TRUST_TIERS.PARTNER);
    expect(mark(wrapper).first().prop('title')).toMatch(/third-party vendor/i);
  });

  test('an official plugin carries the other mark, not the same one', () => {
    const wrapper = render({ trust: PLUGIN_TRUST_TIERS.OFFICIAL });

    expect(mark(wrapper).first().prop('data-trust')).toBe(PLUGIN_TRUST_TIERS.OFFICIAL);
    expect(mark(wrapper).first().prop('title')).toMatch(/built and maintained/i);
  });

  // the registry publishes no such tier, and inventing a mark for one would say something
  // about the plugin that nobody has claimed
  test('a tier this UI has no mark for is drawn as nothing at all', () => {
    expect(mark(render({ trust: 'community' }))).toHaveLength(0);
    expect(mark(render())).toHaveLength(0);
  });
});
