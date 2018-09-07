import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';

export const FETCH_FILTERS = 'fetchFilters';
export const NAMESPACE = 'filters';
export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_PAGINATION = {
  [PAGE_KEY]: 1,
  [SIZE_KEY]: DEFAULT_PAGE_SIZE,
};
