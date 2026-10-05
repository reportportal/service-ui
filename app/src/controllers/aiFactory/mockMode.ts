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
import type { PipelineCatalogTransport } from './pipelines/transport';

export const AI_FACTORY_MOCKS_STORAGE_KEY = 'ai_factory_mocks';

const readAiFactoryMocksEnabled = (fallback: boolean): boolean => {
  try {
    return getStorageItem(AI_FACTORY_MOCKS_STORAGE_KEY) !== false;
  } catch {
    return fallback;
  }
};

export const isAiFactoryMocksEnabled = (): boolean => readAiFactoryMocksEnabled(true);

export const isAiFactoryDemoResetAvailable = (
  catalogTransport?: PipelineCatalogTransport | null,
): boolean =>
  process.env.NODE_ENV === 'development' &&
  isAiFactoryEnabled() &&
  readAiFactoryMocksEnabled(false) &&
  catalogTransport === 'mock';
