import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { formatSortingString, SORTING_ASC } from 'controllers/sorting';
import { USER } from 'common/constants/userObjectTypes';

export const FETCH_MEMBERS = 'fetchMembers';
export const NAMESPACE = 'members';
export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_PAGINATION = {
  [PAGE_KEY]: 1,
  [SIZE_KEY]: DEFAULT_PAGE_SIZE,
};
export const DEFAULT_SORTING = formatSortingString([USER], SORTING_ASC);
