/*
 * Copyright 2019 EPAM Systems
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

import { getStorageItem, updateStorageItem } from 'common/utils';
import { MARKDOWN } from 'common/constants/logViewModes';
import {
  LOG_LEVEL_STORAGE_KEY,
  LOG_LEVELS,
  DEFAULT_LOG_LEVEL,
  LOG_VIEW_MODE_STORAGE_KEY,
} from './constants';

const getUserSettingsFromStorage = (userId) => getStorageItem(`${userId}_settings`) || {};

const updateUserSettingsInStorage = (userId, data) => updateStorageItem(`${userId}_settings`, data);

const getLogLevelFromStorage = (userId) =>
  getUserSettingsFromStorage(userId)[LOG_LEVEL_STORAGE_KEY];

const getLogViewModeFromStorage = (userId) =>
  getUserSettingsFromStorage(userId)[LOG_VIEW_MODE_STORAGE_KEY];

export const getLogLevelById = (logLevelId) =>
  LOG_LEVELS.find((logLevel) => logLevel.id === logLevelId);

const getDefaultLogLevel = () => getLogLevelById(DEFAULT_LOG_LEVEL);

export const getLogLevel = (userId, logLevelId) =>
  getLogLevelById(logLevelId) ||
  getLogLevelById(getLogLevelFromStorage(userId)) ||
  getDefaultLogLevel() ||
  LOG_LEVELS[LOG_LEVELS.length - 1];

export const setLogLevel = (userId, logLevel) =>
  updateUserSettingsInStorage(userId, { [LOG_LEVEL_STORAGE_KEY]: logLevel.id });

export const getLogViewMode = (userId) => getLogViewModeFromStorage(userId) || MARKDOWN;

export const setLogViewMode = (userId, viewMode) =>
  updateUserSettingsInStorage(userId, { [LOG_VIEW_MODE_STORAGE_KEY]: viewMode });
