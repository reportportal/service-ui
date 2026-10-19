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
import {
  PLUGIN_DEFAULT_IMAGE,
  PLUGIN_ICON_TYPES,
  PLUGIN_IMAGES_MAP,
} from 'components/integrations/constants';
import { ICON_FILE_KEY, PLUGIN_TYPE_REMOTE } from 'controllers/plugins/uiExtensions/constants';
import { Image } from 'components/main/image';
import { RemotePluginIcon } from './remotePluginIcon';
import { PluginIcon } from './pluginIcon';

const image = (pluginData) => shallow(<PluginIcon pluginData={pluginData} />).find(Image);
// a plugin the bundled map has an icon for, taken from the map itself rather than named here
const [bundledName] = Object.keys(PLUGIN_IMAGES_MAP);

describe('PluginIcon', () => {
  test('a plugin the app ships an icon for uses it', () => {
    expect(image({ name: bundledName }).prop('src')).toBe(PLUGIN_IMAGES_MAP[bundledName]);
  });

  /**
   * The case the marketplace made reachable. Before it, every installable plugin was one of the
   * handful the app bundles an icon for; now an instance can install anything the registry
   * publishes, and the map has never heard of it. Falling back is the whole reason this component
   * computes a URL rather than reading one.
   */
  test('a plugin nobody bundled an icon for falls back to the default', () => {
    expect(image({ name: 'plugin-from-the-marketplace' }).prop('src')).toBe(PLUGIN_DEFAULT_IMAGE);
  });

  test('a plugin with no name at all still renders something', () => {
    expect(image({}).prop('src')).toBe(PLUGIN_DEFAULT_IMAGE);
  });

  /**
   * The second fallback, and a different failure: the src was resolved but fetching it did not
   * work — a plugin that serves its own icon and then stops. It is always the default, whichever
   * of the two produced the src.
   */
  test('an icon that cannot be fetched falls back to the same default', () => {
    expect(image({ name: bundledName }).prop('fallback')).toBe(PLUGIN_DEFAULT_IMAGE);
    expect(image({ name: 'plugin-from-the-marketplace' }).prop('fallback')).toBe(
      PLUGIN_DEFAULT_IMAGE,
    );
  });

  describe('a plugin that serves its own icon', () => {
    const withBinary = {
      name: 'plugin-from-the-marketplace',
      details: { binaryData: { [ICON_FILE_KEY]: 'icon.png' } },
    };

    test('is asked for it rather than given the default', () => {
      const src = image(withBinary).prop('src');

      expect(src).toContain('plugin-from-the-marketplace');
      expect(src).not.toBe(PLUGIN_DEFAULT_IMAGE);
    });

    // a bundled asset is already in the page; one the server holds has to be fetched, and only
    // the second needs the preloader and the request that goes with it
    test('is not treated as a static asset', () => {
      expect(image(withBinary).prop('isStatic')).toBe(false);
      expect(image({ name: bundledName }).prop('isStatic')).toBe(true);
    });
  });

  test('a remote plugin draws its own icon instead', () => {
    const wrapper = shallow(
      <PluginIcon
        pluginData={{
          name: 'remote',
          pluginType: PLUGIN_TYPE_REMOTE,
          details: { icon: { type: PLUGIN_ICON_TYPES.URL, content: 'https://cdn/icon.png' } },
        }}
      />,
    );

    expect(wrapper.find(RemotePluginIcon)).toHaveLength(1);
    expect(wrapper.find(Image)).toHaveLength(0);
  });
});
