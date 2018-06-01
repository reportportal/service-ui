export const FETCH_ITEMS_HISTORY = 'fetchItemsHistory';
export const HISTORY_ITEMS_TO_LOAD = 30;
export const STILL_MIN_HISTORY_ITEMS = 5;
export const NAMESPACE = 'history';
export const FETCH_HISTORY_PAGE_INFO = 'fetchHistoryPageInfo';
export const SET_ITEMS_HISTORY = 'setItemsForHistory';
export const SET_VISIBLE_ITEMS_COUNT = 'setVisibleItemsCount';
export const RESET_HISTORY = 'resetHistory';
export const RESET_FETCH_HISTORY = 'resetFetchHistory';
export const HISTORY_DEPTH_CONFIG = {
  name: 'historyDepth',
  defaultValue: '10',
  options: [
    { value: '3', label: '3' },
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '15', label: '15' },
    { value: '20', label: '20' },
    { value: '25', label: '25' },
    { value: '30', label: '30' },
  ],
};
