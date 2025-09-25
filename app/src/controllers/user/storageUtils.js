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
import { NO_LOGS_COLLAPSING_KEY, LOGS_PAGINATION_KEY } from './constants';

export const getUserSettingsFromStorage = (userId) => getStorageItem(`${userId}_settings`) || {};

export const updateUserSettingsInStorage = (userId, data) =>
  updateStorageItem(`${userId}_settings`, data);

export const getUserProjectSettingsFromStorage = (userId, projectId) => {
  const userSettings = getUserSettingsFromStorage(userId);
  return userSettings[`pr_${projectId}`] || {};
};

export const updateUserProjectSettingsInStorage = (userId, projectId, data) => {
  const projectKey = `pr_${projectId}`;
  const existingProjectSettings = getUserProjectSettingsFromStorage(userId, projectId);
  updateUserSettingsInStorage(userId, {
    [projectKey]: {
      ...existingProjectSettings,
      ...data,
    },
  });
};

export const setNoLogsCollapsingInStorage = (userId, projectId, value) =>
  updateUserProjectSettingsInStorage(userId, projectId, {
    [NO_LOGS_COLLAPSING_KEY]: value,
  });

export const setLogsPaginationInStorage = (userId, projectId, value) =>
  updateUserProjectSettingsInStorage(userId, projectId, {
    [LOGS_PAGINATION_KEY]: value,
  });
