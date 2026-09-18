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

import { composeAppInfo, getMarketplaceOverride } from './utils';

describe('getMarketplaceOverride', () => {
  afterEach(() => {
    localStorage.clear();
  });

  test('is off when the key is absent', () => {
    expect(getMarketplaceOverride()).toBe(false);
  });

  test('is on only for the stored value true', () => {
    localStorage.setItem('marketplace', 'true');
    expect(getMarketplaceOverride()).toBe(true);
  });

  test('any other stored value stays off', () => {
    localStorage.setItem('marketplace', 'false');
    expect(getMarketplaceOverride()).toBe(false);
    localStorage.setItem('marketplace', '"yes"');
    expect(getMarketplaceOverride()).toBe(false);
    localStorage.setItem('marketplace', 'not-json');
    expect(getMarketplaceOverride()).toBe(false);
  });
});

describe('composeAppInfo', () => {
  test('composes api, ui and jobs from jobsInfo', () => {
    const apiInfo = {
      build: { name: 'API Service' },
      jobsInfo: { build: { name: 'Jobs Service', version: '1.0' } },
    };
    const uiInfo = { build: { name: 'Service UI', version: '2.0' } };

    expect(composeAppInfo(apiInfo, uiInfo)).toEqual({
      api: apiInfo,
      ui: uiInfo,
      jobs: { build: { name: 'Jobs Service', version: '1.0' } },
    });
  });

  test('falls back to empty jobs and ui when missing', () => {
    const apiInfo = { build: { name: 'API Service' } };

    expect(composeAppInfo(apiInfo)).toEqual({
      api: apiInfo,
      ui: {},
      jobs: {},
    });
  });
});
