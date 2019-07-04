import { LOG_LEVELS } from 'controllers/log/constants';
import { DEFAULT_LOG_LEVEL } from './constants';

const getLogLevelById = (logLevelId) => LOG_LEVELS.find((logLevel) => logLevel.id === logLevelId);

const getDefaultLogLevel = () => getLogLevelById(DEFAULT_LOG_LEVEL);

export const getLogLevel = (logLevelId) =>
  getLogLevelById(logLevelId) || getDefaultLogLevel() || LOG_LEVELS[LOG_LEVELS.length - 1];
