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

import { createExtensionOverrider, createExtensionAppender } from './overrideExtension';

jest.mock('controllers/plugins', () => ({
  pluginByNameSelector: () => ({ details: { binaryData: { metadata: 'plugin-metadata.json' } } }),
}));

const createStore = () => ({ getState: () => ({}), dispatch: jest.fn() });

describe('window.RP extension overrides', () => {
  let warn;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ name: 'manifest' }) }),
    );
  });

  afterEach(() => {
    warn.mockRestore();
    delete global.fetch;
  });

  test.each([
    'ftp://example.com/plugin',
    'javascript:void(0)',
    'data:text/javascript,x',
    'plugin/',
  ])('rejects a non-http(s) URL %p before fetching', async (url) => {
    const store = createStore();

    await expect(createExtensionOverrider(store)('plugin', url)).rejects.toThrow('http(s)');
    await expect(createExtensionAppender(store)(url)).rejects.toThrow('http(s)');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test('fetches the plugin metadata file as JSON, warns and dispatches the manifest', async () => {
    const store = createStore();

    await createExtensionOverrider(store)('plugin', 'http://localhost:9000');

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:9000/plugin-metadata.json', {
      headers: { Accept: 'application/json' },
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledTimes(1);
  });

  test('rejects when the manifest request fails', async () => {
    const store = createStore();
    global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 404 }));

    await expect(createExtensionAppender(store)('https://plugins.example.com')).rejects.toThrow(
      '404',
    );
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
