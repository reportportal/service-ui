import {
  FETCH_LOG_PAGE_DATA,
  FETCH_HISTORY_ENTRIES,
  FETCH_LOG_PAGE_STACK_TRACE,
  CLEAR_LOG_PAGE_STACK_TRACE,
} from './constants';

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

export const fetchLogPageStackTrace = () => ({
  type: FETCH_LOG_PAGE_STACK_TRACE,
});

export const clearLogPageStackTrace = () => ({
  type: CLEAR_LOG_PAGE_STACK_TRACE,
});
