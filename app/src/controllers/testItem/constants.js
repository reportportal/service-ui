import { createSortingString, SORTING_ASC } from 'controllers/sorting';

export const SET_LEVEL = 'setLevel';
export const FETCH_TEST_ITEMS = 'fetchTestItems';
export const RESTORE_PATH = 'restorePath';
export const NAMESPACE = 'testItem';
export const PARENT_ITEMS_NAMESPACE = `${NAMESPACE}/parentItems`;
export const SET_PAGE_LOADING = `${NAMESPACE}/setPageLoading`;
export const DEFAULT_SORTING = createSortingString(['start_time'], SORTING_ASC);
