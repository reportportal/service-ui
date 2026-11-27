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

import { URLS } from 'common/urls';
import { getExtensionUrl, isSameOriginUrl } from './utils';

const extension = (url, moduleUrl) => ({
  pluginName: 'plugin',
  url,
  payload: moduleUrl === undefined ? {} : { url: moduleUrl },
});

describe('getExtensionUrl', () => {
  test('falls back to the plugin public file without a base URL', () => {
    expect(getExtensionUrl(extension(undefined))).toBe(
      URLS.pluginPublicFile('plugin', 'remoteEntity.js'),
    );
  });

  test('resolves the default entry file against an https base URL', () => {
    expect(getExtensionUrl(extension('https://plugins.example.com/app/'))).toBe(
      'https://plugins.example.com/remoteEntity.js',
    );
  });

  test('resolves a relative module URL against the base URL', () => {
    expect(getExtensionUrl(extension('https://plugins.example.com/app/', 'entry/index.html'))).toBe(
      'https://plugins.example.com/app/entry/index.html',
    );
  });

  test('works without a payload', () => {
    expect(getExtensionUrl({ pluginName: 'plugin', url: 'https://plugins.example.com/' })).toBe(
      'https://plugins.example.com/remoteEntity.js',
    );
  });

  test.each([
    ['a javascript: module URL', 'https://plugins.example.com/', 'javascript:void(0)'],
    ['a data: module URL', 'https://plugins.example.com/', 'data:text/html,x'],
    ['a javascript: base URL', 'javascript:void(0)', undefined],
    ['an unparsable base URL', 'http://[', undefined],
  ])('returns null for %s', (_name, baseUrl, moduleUrl) => {
    expect(getExtensionUrl(extension(baseUrl, moduleUrl))).toBeNull();
  });
});

describe('isSameOriginUrl', () => {
  test('detects application-origin and foreign URLs', () => {
    expect(isSameOriginUrl(`${window.location.origin}/plugin/index.html`)).toBe(true);
    expect(isSameOriginUrl('https://plugins.example.com/index.html')).toBe(false);
  });
});
