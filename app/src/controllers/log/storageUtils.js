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
  DEFAULT_WITH_ATTACHMENTS,
  WITH_ATTACHMENTS_STORAGE_KEY,
  LOG_LEVEL_STORAGE_KEY,
  LOG_LEVELS,
  DEFAULT_LOG_LEVEL,
  LOG_VIEW_MODE_STORAGE_KEY,
  HIDE_PASSED_LOGS,
  HIDE_EMPTY_STEPS,
} from './constants';

const getLogPageUserSettingsFromStorage = (userId) => getStorageItem(`${userId}_settings`) || {};

const updateLogPageUserSettingsInStorage = (userId, data) =>
  updateStorageItem(`${userId}_settings`, data);

const getWithAttachmentsFromStorage = (userId) =>
  getLogPageUserSettingsFromStorage(userId)[WITH_ATTACHMENTS_STORAGE_KEY];

const getLogLevelFromStorage = (userId) =>
  getLogPageUserSettingsFromStorage(userId)[LOG_LEVEL_STORAGE_KEY];

const getLogViewModeFromStorage = (userId) =>
  getLogPageUserSettingsFromStorage(userId)[LOG_VIEW_MODE_STORAGE_KEY];

export const getWithAttachments = (userId) =>
  getWithAttachmentsFromStorage(userId) || DEFAULT_WITH_ATTACHMENTS;

export const setWithAttachments = (userId, withAttachments) =>
  updateLogPageUserSettingsInStorage(userId, { [WITH_ATTACHMENTS_STORAGE_KEY]: withAttachments });

export const getLogLevelById = (logLevelId) =>
  LOG_LEVELS.find((logLevel) => logLevel.id === logLevelId);

const getDefaultLogLevel = () => getLogLevelById(DEFAULT_LOG_LEVEL);

export const getLogLevel = (userId, logLevelId) =>
  getLogLevelById(logLevelId) ||
  getLogLevelById(getLogLevelFromStorage(userId)) ||
  getDefaultLogLevel() ||
  LOG_LEVELS[LOG_LEVELS.length - 1];

export const setLogLevel = (userId, logLevel) =>
  updateLogPageUserSettingsInStorage(userId, { [LOG_LEVEL_STORAGE_KEY]: logLevel.id });

export const getLogViewMode = (userId) => getLogViewModeFromStorage(userId) || MARKDOWN;

export const setLogViewMode = (userId, viewMode) =>
  updateLogPageUserSettingsInStorage(userId, { [LOG_VIEW_MODE_STORAGE_KEY]: viewMode });

export const setHidePassedLogs = (userId, hidePassedLogs) => {
  updateLogPageUserSettingsInStorage(userId, { [HIDE_PASSED_LOGS]: hidePassedLogs });
};

export const getHidePassedLogs = (userId) =>
  getLogPageUserSettingsFromStorage(userId)[HIDE_PASSED_LOGS];

export const setHideEmptySteps = (userId, hideEmptySteps) => {
  updateLogPageUserSettingsInStorage(userId, { [HIDE_EMPTY_STEPS]: hideEmptySteps });
};

export const getHideEmptySteps = (userId) =>
  getLogPageUserSettingsFromStorage(userId)[HIDE_EMPTY_STEPS];
