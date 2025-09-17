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

import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';
import { STORAGE_KEY } from './constants';

const getStorageKey = (userId, projectId) => `${userId}_${projectId}_${STORAGE_KEY}`;

export const getStoredFilters = (userId, projectId) => {
  return getStorageItem(getStorageKey(userId, projectId)) || {};
};

export const setStoredFilter = (userId, projectId, filterKey, value) => {
  const filters = getStoredFilters(userId, projectId);
  const updatedFilters = {
    ...filters,
    [filterKey]: value,
  };
  setStorageItem(getStorageKey(userId, projectId), updatedFilters);
};

export const getStoredFilter = (userId, projectId, filterKey) => {
  const filters = getStoredFilters(userId, projectId);
  return filters?.[filterKey];
};
