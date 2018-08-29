import { FETCH_HISTORY_ENTRIES, SET_ACTIVE_HISTORY_ITEM_ID } from './constants';

export const fetchHistoryEntriesAction = () => ({
  type: FETCH_HISTORY_ENTRIES,
});

export const setActiveHistoryItemAction = (logItemId) => ({
  type: SET_ACTIVE_HISTORY_ITEM_ID,
  payload: logItemId,
});
