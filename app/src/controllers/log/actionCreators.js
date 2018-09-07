import { FETCH_LOG_PAGE_DATA, FETCH_HISTORY_ENTRIES } from './constants';

export const fetchLogPageData = () => ({
  type: FETCH_LOG_PAGE_DATA,
});

export const refreshLogPageData = () => ({
  type: FETCH_LOG_PAGE_DATA,
  meta: {
    refresh: true,
  },
});

export const fetchHistoryEntriesAction = () => ({
  type: FETCH_HISTORY_ENTRIES,
});
