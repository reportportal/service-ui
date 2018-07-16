import { FETCH_TEST_ITEMS, SET_LEVEL, RESTORE_PATH, SET_PAGE_LOADING } from './constants';

export const setLevelAction = (level) => ({
  type: SET_LEVEL,
  payload: level,
});

export const fetchTestItemsAction = () => ({
  type: FETCH_TEST_ITEMS,
});

export const restorePathAction = () => ({
  type: RESTORE_PATH,
});

export const setPageLoadingAction = (isLoading) => ({
  type: SET_PAGE_LOADING,
  payload: isLoading,
});
