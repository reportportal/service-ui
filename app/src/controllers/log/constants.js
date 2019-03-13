import { TRACE } from 'common/constants/logLevels';
import { formatSortingString, SORTING_ASC } from 'controllers/sorting';

export const NAMESPACE = 'log';
export const LOG_ITEMS_NAMESPACE = `${NAMESPACE}/logItems`;
export const ACTIVITY_NAMESPACE = `${NAMESPACE}/activity`;
export const HISTORY_NAMESPACE = `${NAMESPACE}/history`;
export const FETCH_LOG_PAGE_DATA = 'fetchLogPageData';
export const FETCH_HISTORY_ENTRIES = 'fetchHistoryEntries';
export const DEFAULT_HISTORY_DEPTH = 10;
export const DEFAULT_LOG_LEVEL = TRACE;
export const LOG_LEVEL_STORAGE_KEY = 'logFilteringLevel';
export const DEFAULT_WITH_ATTACHMENTS = false;
export const WITH_ATTACHMENTS_STORAGE_KEY = 'logFilteringLevelWithAttachments';
export const DEFAULT_SORTING = formatSortingString(['logTime'], SORTING_ASC);
