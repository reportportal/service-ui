export const FETCH_FILTERS = 'fetchFilters';
export const FETCH_FILTERS_CONCAT = 'fetchFiltersConcat';
export const NAMESPACE = 'filters';
export const LAUNCHES_FILTERS_NAMESPACE = `${NAMESPACE}/launchesFilters`;
export const LAUNCHES_FILTERS_UPDATE_NAMESPACE = `${NAMESPACE}/launchesFiltersUpdate`;
export const CHANGE_ACTIVE_FILTER = 'changeActiveFilter';
export const UPDATE_FILTER_CONDITIONS = 'updateFilterConditions';
export const UPDATE_FILTER_ORDERS = 'updateFilterOrders';
export const UPDATE_FILTER = 'updateFilter';
export const RESET_FILTER = 'resetFilter';
export const CREATE_FILTER = 'createFilter';
export const ADD_FILTER = 'addFilter';
export const SAVE_NEW_FILTER = 'saveNewFilter';
export const REMOVE_FILTER = 'removeFilter';
export const REMOVE_LAUNCHES_FILTER = 'removeLaunchesFilter';

export const UPDATE_FILTER_SUCCESS = 'updateFilterSuccess';
export const FETCH_USER_FILTERS_SUCCESS = 'fetchUserFiltersSuccess';

export const DEFAULT_FILTER = {
  conditions: [],
  type: 'launch',
  orders: [{ isAsc: false, sortingColumn: 'startTime' }, { isAsc: false, sortingColumn: 'number' }],
};
