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
import { RemoteExtensionLoader } from './remoteExtensionLoader';
import { ExtensionError } from '../extensionError';

jest.mock('@reportportal/ui-kit', () => ({ BubblesLoader: () => null }));
jest.mock('../extensionError', () => ({
  ExtensionError: () => <div className="extension-error" />,
}));

const extension = (url, moduleUrl) => ({
  name: 'remote',
  pluginName: 'remote-plugin',
  extensionPoint: 'projectSettings',
  url,
  payload: {
    slug: 'remote',
    name: 'Remote',
    icon: { type: 'url', content: 'https://plugins.example.com/icon.png' },
    url: moduleUrl,
  },
});

describe('RemoteExtensionLoader', () => {
  test('renders the error state and no iframe for an invalid extension URL', () => {
    const wrapper = mount(
      <RemoteExtensionLoader
        extension={extension('https://plugins.example.com/', 'javascript:void(0)')}
      />,
    );

    expect(wrapper.find('iframe')).toHaveLength(0);
    expect(wrapper.find(ExtensionError)).toHaveLength(1);
  });

  test('frames a cross-origin plugin with the sandbox flags', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mount(
      <RemoteExtensionLoader extension={extension('https://plugins.example.com/', 'index.html')} />,
    );
    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).toBe('https://plugins.example.com/index.html');
    expect(iframe.prop('sandbox')).toBe('allow-same-origin allow-scripts allow-popups');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('warns when a remote plugin is served from the application origin', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mount(
      <RemoteExtensionLoader extension={extension(window.location.origin, '/plugin/index.html')} />,
    );

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
