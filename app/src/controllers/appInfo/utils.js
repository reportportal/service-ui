/*
 * Copyright 2025 EPAM Systems
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

const SHOW_IN_PROGRESS_TMS_FEATURES_STORAGE_KEY = 'show_in_progress_tms_features';
const OVERRIDE_ENABLED = true;
const OVERRIDE_DISABLED = false;

export const getTmsOverride = () => {
  try {
    const override = getStorageItem(SHOW_IN_PROGRESS_TMS_FEATURES_STORAGE_KEY);
    const isValidOverride = override === OVERRIDE_ENABLED || override === OVERRIDE_DISABLED;

    return isValidOverride ? override : null;
  } catch (e) {
    return null;
  }
};
