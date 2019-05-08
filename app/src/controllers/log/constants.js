import * as logLevels from 'common/constants/logLevels';
import { formatSortingString, SORTING_ASC } from 'controllers/sorting';

export const NAMESPACE = 'log';
export const LOG_ITEMS_NAMESPACE = `${NAMESPACE}/logItems`;
export const ACTIVITY_NAMESPACE = `${NAMESPACE}/activity`;
export const HISTORY_NAMESPACE = `${NAMESPACE}/history`;
export const FETCH_LOG_PAGE_DATA = 'fetchLogPageData';
export const FETCH_HISTORY_ENTRIES = 'fetchHistoryEntries';
export const DEFAULT_HISTORY_DEPTH = 10;
export const DEFAULT_LOG_LEVEL = logLevels.TRACE;
export const LOG_LEVEL_STORAGE_KEY = 'logFilteringLevel';
export const LOG_LEVEL_FILTER_KEY = 'filter.gte.level';
export const DEFAULT_WITH_ATTACHMENTS = false;
export const WITH_ATTACHMENTS_STORAGE_KEY = 'logFilteringLevelWithAttachments';
export const WITH_ATTACHMENTS_FILTER_KEY = 'filter.ex.binaryContent';
export const LOG_VIEW_MODE_STORAGE_KEY = 'logViewMode';
export const DEFAULT_SORTING = formatSortingString(['logTime'], SORTING_ASC);
export const RETRY_ID = 'retryId';
export const ACTIVE_LOG_ITEM_QUERY_KEY = 'history';
export const LAUNCH_PAGE_SIZE_STORAGE_KEY = 'launchLandingPageCount';
export const TEST_PAGE_SIZE_STORAGE_KEY = 'launchTestPageCount';
export const LOG_PAGE_SIZE_STORAGE_KEY = 'launchLogPageCount';
export const DEFAULT_PAGE_SIZE = 250;
export const MIN_PAGE_SIZE = 1;
export const MAX_PAGE_SIZE = 300;

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
