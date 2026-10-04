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

import { getStorageItem } from 'common/utils/storageUtils';

import { isAiFactoryEnabled } from './featureFlag';
import {
  AI_FACTORY_MOCKS_STORAGE_KEY,
  isAiFactoryDemoResetAvailable,
  isAiFactoryMocksEnabled,
} from './mockMode';
import type { PipelineCatalogTransport } from './pipelines/transport';

jest.mock('common/utils/storageUtils', () => ({ getStorageItem: jest.fn() }));
jest.mock('./featureFlag', () => ({ isAiFactoryEnabled: jest.fn() }));

const originalNodeEnv = process.env.NODE_ENV;
const unavailableResetCases: ReadonlyArray<{
  label: string;
  nodeEnv: string;
  featureEnabled: boolean;
  mocks: boolean | null;
  transport: PipelineCatalogTransport | null;
}> = [
  {
    label: 'production runtime',
    nodeEnv: 'production',
    featureEnabled: true,
    mocks: null,
    transport: 'mock',
  },
  {
    label: 'disabled feature',
    nodeEnv: 'development',
    featureEnabled: false,
    mocks: null,
    transport: 'mock',
  },
  {
    label: 'disabled mocks',
    nodeEnv: 'development',
    featureEnabled: true,
    mocks: false,
    transport: 'mock',
  },
  {
    label: 'live catalog',
    nodeEnv: 'development',
    featureEnabled: true,
    mocks: null,
    transport: 'live',
  },
  {
    label: 'unknown catalog',
    nodeEnv: 'development',
    featureEnabled: true,
    mocks: null,
    transport: null,
  },
];

describe('AI Factory mock mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
    jest.mocked(isAiFactoryEnabled).mockReturnValue(true);
    jest
      .mocked(getStorageItem)
      .mockImplementation((key: string) => (key === AI_FACTORY_MOCKS_STORAGE_KEY ? null : null));
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('allows reset only for the enabled development mock catalog', () => {
    expect(isAiFactoryDemoResetAvailable('mock')).toBe(true);
  });

  test.each(unavailableResetCases)(
    'does not allow reset for $label',
    ({ nodeEnv, featureEnabled, mocks, transport }) => {
      process.env.NODE_ENV = nodeEnv;
      jest.mocked(isAiFactoryEnabled).mockReturnValue(featureEnabled);
      jest.mocked(getStorageItem).mockReturnValue(mocks);

      expect(isAiFactoryDemoResetAvailable(transport)).toBe(false);
    },
  );

  test('fails closed for reset when mock preference cannot be read', () => {
    jest.mocked(getStorageItem).mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(isAiFactoryDemoResetAvailable('mock')).toBe(false);
    expect(isAiFactoryMocksEnabled()).toBe(true);
  });
});
