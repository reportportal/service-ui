import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';

export const FETCH_FILTERS = 'fetchFilters';
export const FETCH_FILTERS_CONCAT = 'fetchFiltersConcat';
export const FETCH_LAUNCHES_FILTERS = 'fetchLaunchesFilters';
export const NAMESPACE = 'filters';
export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_PAGINATION = {
  [PAGE_KEY]: 1,
  [SIZE_KEY]: DEFAULT_PAGE_SIZE,
};
export const LAUNCHES_FILTERS_NAMESPACE = `${NAMESPACE}/launchesFilters`;
export const LAUNCHES_FILTERS_UPDATE_NAMESPACE = `${NAMESPACE}/launchesFiltersUpdate`;
export const CHANGE_ACTIVE_FILTER = 'changeActiveFilter';
export const UPDATE_FILTER_CONDITIONS = 'updateFilterConditions';
export const UPDATE_FILTER = 'updateFilter';
export const RESET_FILTER = 'resetFilter';
export const CREATE_FILTER = 'createFilter';
export const ADD_FILTER = 'addFilter';
export const SAVE_NEW_FILTER = 'saveNewFilter';
export const REMOVE_FILTER = 'removeFilter';

export const UPDATE_FILTER_SUCCESS = 'updateFilterSuccess';

export const DEFAULT_FILTER = {
  conditions: [],
  type: 'launch',
  orders: [
    { isAsc: false, sortingColumn: 'start_time' },
    { isAsc: false, sortingColumn: 'number' },
  ],
};
