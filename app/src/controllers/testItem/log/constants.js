import * as logLevels from 'common/constants/logLevels';
import { formatSortingString, SORTING_ASC } from 'controllers/sorting';

export const TEST_ITEM_LOG_NAMESPACE = 'testItem/log';
export const TEST_ITEM_LOG_ITEMS_NAMESPACE = `${TEST_ITEM_LOG_NAMESPACE}/logItems`;
export const FETCH_TEST_ITEM_LOG_DATA = 'fetchTestItemLogData';
export const DEFAULT_LOG_LEVEL = logLevels.TRACE;
export const LOG_LEVEL_FILTER_KEY = 'filter.gte.level';
export const DEFAULT_SORTING = formatSortingString(['logTime'], SORTING_ASC);
export const LAUNCH_LOG = 'launch';
export const TEST_ITEM_LOG = 'item';
export const TEST_ITEM_ATTACHMENTS_NAMESPACE = `${TEST_ITEM_LOG_NAMESPACE}/attachments`;
export const NAMESPACE = 'itemLog';
export const FETCH_TEST_ITEM_ATTACHMENTS = 'fetchTestItemAttachments';
