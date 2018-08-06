import { createSortingString, SORTING_ASC } from 'controllers/sorting';

export const FETCH_FILTERS = 'fetchFilters';
export const NAMESPACE = 'filters';
export const DEFAULT_SORTING = createSortingString(['name'], SORTING_ASC);
