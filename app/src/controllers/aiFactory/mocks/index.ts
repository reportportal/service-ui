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

/**
 * Entry point of the AI Factory mock backend. See `README.md` in this folder for the full
 * picture and docs/ai-factory-poc/03-frontend-architecture.md §4 for the design.
 *
 * `installAiFactoryMocks()` is only ever called through a dynamic `import()` guarded by
 * {@link isAiFactoryMocksEnabled}, so this module (and `axios-mock-adapter`) is never bundled
 * into a production build and never installed with the feature toggle off.
 */

import { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getStorageItem } from 'common/utils/storageUtils';
import { installAiFactoryHandlers } from './handlers';
import { installOverlayInterceptor } from './overlay';

const MOCKS_STORAGE_KEY = 'ai_factory_mocks';

/** Mocks are on by default whenever the feature toggle is on; `'false'` opts back out per group is a later refinement. */
export const isAiFactoryMocksEnabled = (): boolean => {
  try {
    return getStorageItem(MOCKS_STORAGE_KEY) !== false;
  } catch {
    return true;
  }
};

let installed = false;

/**
 * Installs the mock adapter (routes every AI Factory endpoint, `onNoMatch: 'passthrough'` for
 * everything else) and the overlay interceptor (enriches real `tms/test-case` responses) on the
 * given axios instance — the app's global one by default. Idempotent: calling it twice is a
 * no-op. See `resetMockDb()` in `./db` for "Reset demo".
 */
export const installAiFactoryMocks = (http: AxiosInstance): MockAdapter | undefined => {
  if (installed) {
    return undefined;
  }
  installed = true;
  const mock = new MockAdapter(http, { onNoMatch: 'passthrough' });
  installAiFactoryHandlers(mock);
  installOverlayInterceptor(http);
  return mock;
};

export { resetMockDb } from './db';
export { mergeAiFields } from './overlay';
