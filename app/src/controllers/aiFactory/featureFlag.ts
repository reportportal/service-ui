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

/**
 * AI Factory · DF Bootcamp 2026 PoC feature toggle (Jira epic EPMRPP-118192).
 *
 * There is no server flag yet (open ask F11) — the toggle is a local override, read the same
 * way `getTmsOverride` reads `show_in_progress_tms_features`
 * (see `controllers/appInfo/utils.ts`).
 *
 * The toggle is OFF by default, and OFF must leave the product byte-for-byte unchanged: no new
 * UI, no new network requests, no changed rules on existing buttons, no mocks installed.
 * See `docs/ai-factory-poc/03-frontend-architecture.md` §3 for the full checklist.
 *
 * Enable from the browser console:
 *   localStorage.setItem('show_ai_factory_poc', 'true'); location.reload();
 * Disable:
 *   localStorage.removeItem('show_ai_factory_poc'); location.reload();
 */
export const AI_FACTORY_POC_STORAGE_KEY = 'show_ai_factory_poc';

export const isAiFactoryEnabled = (): boolean => {
  try {
    return getStorageItem(AI_FACTORY_POC_STORAGE_KEY) === true;
  } catch {
    return false;
  }
};

/**
 * Hook wrapper around {@link isAiFactoryEnabled}. It has no dependency on Redux today, but
 * every AI Factory component should call the hook (not the plain function) so that a future
 * server-side flag (F11) can be added here without touching call sites.
 */
export const useAiFactoryEnabled = (): boolean => isAiFactoryEnabled();
