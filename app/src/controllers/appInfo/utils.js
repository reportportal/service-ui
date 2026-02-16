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

import { tmsEnabledSelector } from './selectors';
import { getStorageItem } from 'common/utils/storageUtils';

const TMS_OVERRIDE_STORAGE_KEY = 'tms_override';
const TMS_MILESTONES_STORAGE_KEY = 'tms_milestones';

export const getTmsOverride = () => {
  try {
    const override = getStorageItem(TMS_OVERRIDE_STORAGE_KEY);
    if (override === true || override === false) {
      return Boolean(override);
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const getTmsMilestonesOverride = () => {
  try {
    return getStorageItem(TMS_MILESTONES_STORAGE_KEY) === true;
  } catch {
    return null;
  }
};

export const isTmsEnabled = (state) => {
  const override = getTmsOverride();
  if (override !== null) {
    return override;
  }
  return tmsEnabledSelector(state);
};
