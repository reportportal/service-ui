import * as logLevels from 'common/constants/logLevels';
import { formatSortingString, SORTING_ASC } from 'controllers/sorting';

export const NAMESPACE = 'log';
export const LOG_ITEMS_NAMESPACE = `${NAMESPACE}/logItems`;
export const ACTIVITY_NAMESPACE = `${NAMESPACE}/activity`;
export const HISTORY_NAMESPACE = `${NAMESPACE}/history`;
export const STACK_TRACE_NAMESPACE = `${NAMESPACE}/stackTrace`;
export const FETCH_LOG_PAGE_DATA = 'fetchLogPageData';
export const FETCH_HISTORY_ENTRIES = 'fetchHistoryEntries';
export const FETCH_LOG_PAGE_STACK_TRACE = 'fetchLogPageStackTrace';
export const DEFAULT_HISTORY_DEPTH = 10;
export const DEFAULT_LOG_LEVEL = logLevels.TRACE;
export const LOG_LEVEL_STORAGE_KEY = 'logFilteringLevel';
export const LOG_LEVEL_FILTER_KEY = 'filter.gte.level';
export const LOG_STATUS_FILTER_KEY = 'filter.in.status';
export const DEFAULT_WITH_ATTACHMENTS = false;
export const WITH_ATTACHMENTS_STORAGE_KEY = 'logFilteringLevelWithAttachments';
export const WITH_ATTACHMENTS_FILTER_KEY = 'filter.ex.binaryContent';
export const LOG_VIEW_MODE_STORAGE_KEY = 'logViewMode';
export const HIDE_PASSED_LOGS = 'excludePassedLogs';
export const HIDE_EMPTY_STEPS = 'excludeEmptySteps';
export const DEFAULT_SORTING = formatSortingString(['logTime'], SORTING_ASC);
export const RETRY_ID = 'retryId';
export const ACTIVE_LOG_ITEM_QUERY_KEY = 'history';
export const CLEAR_LOG_PAGE_STACK_TRACE = 'clearStackTrace';
export const STACK_TRACE_PAGINATION_OFFSET = 5;
export const DETAILED_LOG_VIEW = 'DETAILED_LOG_VIEW';
export const LAUNCH_LOG_VIEW = 'LAUNCH_LOG_VIEW';
export const FETCH_TEST_ITEMS_SUCCES = 'FETCH_TEST_ITEMS_SUCCESS';
export const SET_LOG_PAGE_LOADING = 'SET_LOG_PAGE_LOADING';

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
