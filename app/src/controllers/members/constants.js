import { formatSortingString, SORTING_ASC } from 'controllers/sorting';
import { USER } from 'common/constants/userObjectTypes';

export const FETCH_MEMBERS = 'fetchMembers';
export const NAMESPACE = 'members';
export const DEFAULT_SORTING = formatSortingString([USER], SORTING_ASC);
