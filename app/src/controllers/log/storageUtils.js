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
