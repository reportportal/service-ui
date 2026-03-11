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

import { getStorageItem, updateStorageItem } from 'common/utils/storageUtils';
import {
  LOGS_SIZE_KEY,
  NO_LOGS_COLLAPSING_KEY,
  LOGS_PAGINATION_ENABLED_KEY,
  LOGS_FULL_WIDTH_MODE_KEY,
  LOGS_COLORIZED_BACKGROUND_KEY,
} from './constants';

export const getUserSettingsFromStorage = (userId) => getStorageItem(`${userId}_settings`) || {};

export const updateUserSettingsInStorage = (userId, data) =>
  updateStorageItem(`${userId}_settings`, data);

export const getUserProjectSettingsFromStorage = (userId, projectKey) => {
  const userSettings = getUserSettingsFromStorage(userId);
  return userSettings[`pr_${projectKey}`] || {};
};

export const updateUserProjectSettingsInStorage = (userId, projectKey, data) => {
  const storageKey = `pr_${projectKey}`;
  const existingProjectSettings = getUserProjectSettingsFromStorage(userId, projectKey);
  updateUserSettingsInStorage(userId, {
    [storageKey]: {
      ...existingProjectSettings,
      ...data,
    },
  });
};

export const setNoLogsCollapsingInStorage = (userId, projectKey, value) =>
  updateUserProjectSettingsInStorage(userId, projectKey, {
    [NO_LOGS_COLLAPSING_KEY]: value,
  });

export const setLogsPaginationEnabledInStorage = (userId, projectKey, value) =>
  updateUserProjectSettingsInStorage(userId, projectKey, {
    [LOGS_PAGINATION_ENABLED_KEY]: value,
  });

export const setLogsSizeInStorage = (userId, projectKey, value) =>
  updateUserProjectSettingsInStorage(userId, projectKey, {
    [LOGS_SIZE_KEY]: value,
  });

export const setLogsFullWidthModeInStorage = (userId, projectKey, value) =>
  updateUserProjectSettingsInStorage(userId, projectKey, {
    [LOGS_FULL_WIDTH_MODE_KEY]: value,
  });

export const setLogsColorizedBackgroundInStorage = (userId, projectKey, value) =>
  updateUserProjectSettingsInStorage(userId, projectKey, {
    [LOGS_COLORIZED_BACKGROUND_KEY]: value,
  });
