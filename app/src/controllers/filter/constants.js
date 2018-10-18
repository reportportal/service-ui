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
export const CHANGE_ACTIVE_FILTER = 'changeActiveFilter';
export const UPDATE_FILTER_ENTITIES = 'updateFilterEntities';
