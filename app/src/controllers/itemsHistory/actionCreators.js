import {
  FETCH_ITEMS_HISTORY,
  SET_ITEMS_HISTORY,
  FETCH_HISTORY_PAGE_INFO,
  SET_VISIBLE_ITEMS_COUNT,
  RESET_HISTORY,
  RESET_FETCH_HISTORY,
} from './constants';

export const fetchItemsHistoryAction = (payload) => ({
  type: FETCH_ITEMS_HISTORY,
  payload,
});

export const setItemsHistory = (items) => ({
  type: SET_ITEMS_HISTORY,
  payload: items,
});

export const fetchHistoryPageInfo = () => ({
  type: FETCH_HISTORY_PAGE_INFO,
});

export const setVisibleItemsCount = (visibleItemsCount) => ({
  type: SET_VISIBLE_ITEMS_COUNT,
  payload: visibleItemsCount,
});

export const resetHistory = () => ({
  type: RESET_HISTORY,
});

export const resetFetchHistory = () => ({
  type: RESET_FETCH_HISTORY,
});
