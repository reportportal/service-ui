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

import { MARKDOWN } from 'common/constants/logViewModes';
import { LOG_TIME_FORMAT_ABSOLUTE } from 'controllers/user/constants';
import { getUserSettingsFromStorage, updateUserSettingsInStorage } from 'controllers/user';
import {
  LOG_LEVEL_STORAGE_KEY,
  LOG_VIEW_MODE_STORAGE_KEY,
  LOG_TIME_FORMAT_STORAGE_KEY,
} from './constants';
import { isLogLevelsEqual, isDefaultLogLevel } from './utils';

const getLogLevelFromStorage = (userId) =>
  getUserSettingsFromStorage(userId)[LOG_LEVEL_STORAGE_KEY];

export const getLogTimeFormatFromStorage = (userId) =>
  getUserSettingsFromStorage(userId)[LOG_TIME_FORMAT_STORAGE_KEY] || LOG_TIME_FORMAT_ABSOLUTE;

export const setLogTimeFormatInStorage = (userId, format) =>
  updateUserSettingsInStorage(userId, { [LOG_TIME_FORMAT_STORAGE_KEY]: format });

const getLogViewModeFromStorage = (userId) =>
  getUserSettingsFromStorage(userId)[LOG_VIEW_MODE_STORAGE_KEY];

export const getLogLevelByName = (logLevelName, filterableLogLevels = []) => {
  if (!logLevelName || filterableLogLevels.length === 0) {
    return undefined;
  }

  return filterableLogLevels.find((logLevel) => isLogLevelsEqual(logLevel, { name: logLevelName }));
};

const getDefaultLogLevel = (filterableLogLevels = []) => {
  return filterableLogLevels.find((logLevel) => isDefaultLogLevel(logLevel));
};

export const getLogLevel = (userId, filterableLogLevels, logLevelName) =>
  getLogLevelByName(logLevelName, filterableLogLevels) ||
  getLogLevelByName(getLogLevelFromStorage(userId), filterableLogLevels) ||
  getDefaultLogLevel(filterableLogLevels);

export const setLogLevel = (userId, logLevel) =>
  updateUserSettingsInStorage(userId, { [LOG_LEVEL_STORAGE_KEY]: logLevel.name });

export const getLogViewMode = (userId) => getLogViewModeFromStorage(userId) || MARKDOWN;

export const setLogViewMode = (userId, viewMode) =>
  updateUserSettingsInStorage(userId, { [LOG_VIEW_MODE_STORAGE_KEY]: viewMode });
