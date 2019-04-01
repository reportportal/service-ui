import { formatSortingString, SORTING_ASC } from 'controllers/sorting';

export const FETCH_ALL_USERS = 'fetchAllUsers';
export const NAMESPACE = 'allUsers';
export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_SORT_COLUMN = 'fullName';
export const DEFAULT_SORTING = formatSortingString([DEFAULT_SORT_COLUMN], SORTING_ASC);
