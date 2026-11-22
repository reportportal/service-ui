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

import { shallow } from 'enzyme';
import { PLUGIN_ICON_TYPES } from 'components/integrations/constants';
import { Image } from 'components/main/image';
import { RemotePluginIcon } from './remotePluginIcon';

describe('RemotePluginIcon', () => {
  test('renders SVG content as an image instead of inline markup', () => {
    const content =
      '<svg viewBox="0 0 1 1"><foreignObject><a href="https://example.com">x</a></foreignObject><style>body{}</style></svg>';
    const wrapper = shallow(
      <RemotePluginIcon icon={{ type: PLUGIN_ICON_TYPES.SVG, content }} className="icon" />,
    );
    const image = wrapper.find(Image);

    expect(wrapper.find('svg')).toHaveLength(0);
    expect(image).toHaveLength(1);
    expect(image.prop('isStatic')).toBe(true);
    expect(image.prop('src')).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
    expect(decodeURIComponent(image.prop('src'))).toContain(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1">',
    );
  });

  test('keeps an existing xmlns', () => {
    const content = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    const wrapper = shallow(<RemotePluginIcon icon={{ type: PLUGIN_ICON_TYPES.SVG, content }} />);

    expect(decodeURIComponent(wrapper.find(Image).prop('src'))).toContain(content);
  });

  test('renders URL icons from their address', () => {
    const wrapper = shallow(
      <RemotePluginIcon icon={{ type: PLUGIN_ICON_TYPES.URL, content: 'https://cdn/icon.png' }} />,
    );

    expect(wrapper.find(Image).prop('src')).toBe('https://cdn/icon.png');
    expect(wrapper.find(Image).prop('isStatic')).toBe(false);
  });
});
