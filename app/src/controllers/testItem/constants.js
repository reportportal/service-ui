import { formatSortingString, SORTING_ASC } from 'controllers/sorting';

export const SET_LEVEL = 'setLevel';
export const FETCH_TEST_ITEMS = 'fetchTestItems';
export const FETCH_TEST_ITEMS_LOG_PAGE = 'fetchTestItemsFromLogPage';
export const FETCH_TEST_ITEMS_SUCCESS = 'fetchTestItemsSuccess';
export const RESTORE_PATH = 'restorePath';
export const NAMESPACE = 'testItem';
export const PARENT_ITEMS_NAMESPACE = `${NAMESPACE}/parentItems`;
export const SET_PAGE_LOADING = `${NAMESPACE}/setPageLoading`;
export const SET_VIEW_MODE = 'setViewMode';
export const DEFAULT_SORTING = formatSortingString(['startTime'], SORTING_ASC);
export const LIST_VIEW = 'listView';
export const LOG_VIEW = 'logView';
