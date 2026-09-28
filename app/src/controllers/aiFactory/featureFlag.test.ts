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

import { AI_FACTORY_POC_STORAGE_KEY, isAiFactoryEnabled, useAiFactoryEnabled } from './featureFlag';

describe('isAiFactoryEnabled', () => {
  afterEach(() => {
    localStorage.removeItem(AI_FACTORY_POC_STORAGE_KEY);
  });

  test('is OFF by default (nothing in storage)', () => {
    expect(isAiFactoryEnabled()).toBe(false);
  });

  test('is ON when the storage key is the JSON boolean true', () => {
    localStorage.setItem(AI_FACTORY_POC_STORAGE_KEY, 'true');

    expect(isAiFactoryEnabled()).toBe(true);
  });

  test('is OFF when the storage key is the JSON boolean false', () => {
    localStorage.setItem(AI_FACTORY_POC_STORAGE_KEY, 'false');

    expect(isAiFactoryEnabled()).toBe(false);
  });

  test('is OFF for any non-boolean value (typo-safe)', () => {
    localStorage.setItem(AI_FACTORY_POC_STORAGE_KEY, '"true"');

    expect(isAiFactoryEnabled()).toBe(false);
  });

  test('is OFF when reading storage throws', () => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error('storage unavailable');
    };

    expect(isAiFactoryEnabled()).toBe(false);

    Storage.prototype.getItem = originalGetItem;
  });
});

describe('useAiFactoryEnabled', () => {
  afterEach(() => {
    localStorage.removeItem(AI_FACTORY_POC_STORAGE_KEY);
  });

  test('mirrors isAiFactoryEnabled', () => {
    expect(useAiFactoryEnabled()).toBe(false);

    localStorage.setItem(AI_FACTORY_POC_STORAGE_KEY, 'true');

    expect(useAiFactoryEnabled()).toBe(true);
  });
});
