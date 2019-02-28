import { getStorageItem, updateStorageItem } from 'common/utils';
import * as logLevels from 'common/constants/logLevels';
import { DEFAULT_LOG_LEVEL, LOG_LEVEL_STORAGE_KEY } from 'controllers/log/constants';

export const LOG_LEVELS = [
  {
    id: logLevels.FATAL,
    label: 'Fatal',
  },
  {
    id: logLevels.ERROR,
    label: 'Error',
  },
  {
    id: logLevels.WARN,
    label: 'Warn',
  },
  {
    id: logLevels.INFO,
    label: 'Info',
  },
  {
    id: logLevels.DEBUG,
    label: 'Debug',
  },
  {
    id: logLevels.TRACE,
    label: 'Trace',
  },
];

export const getLogLevelById = (logLevelId) =>
  LOG_LEVELS.find((logLevel) => logLevel.id === logLevelId);

const getLogLevelFromStorage = (userId) =>
  getLogLevelById((getStorageItem(`${userId}_settings`) || {})[LOG_LEVEL_STORAGE_KEY]);

const getDefaultLogLevel = () => getLogLevelById(DEFAULT_LOG_LEVEL);

export const getLogLevel = (logLevelId, userId) =>
  getLogLevelById(logLevelId) ||
  getLogLevelFromStorage(userId) ||
  getDefaultLogLevel() ||
  LOG_LEVELS[LOG_LEVELS.length - 1];

export const setLogLevel = (logLevel, userId) =>
  updateStorageItem(`${userId}_settings`, { [LOG_LEVEL_STORAGE_KEY]: logLevel.id });
