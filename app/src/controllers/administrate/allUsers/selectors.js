import { DEFAULT_PAGINATION } from 'controllers/pagination';
import { createQueryParametersSelector } from 'controllers/pages';
import { createSelectedItemsSelector } from 'controllers/groupOperations';
import { DEFAULT_SORTING } from './constants';
import { administrateDomainSelector } from '../selectors';

const domainSelector = (state) => administrateDomainSelector(state).allUsers || {};

export const allUsersPaginationSelector = (state) => domainSelector(state).pagination;
export const allUsersSelector = (state) => domainSelector(state).allUsers;
export const loadingSelector = (state) => domainSelector(state).loading || false;

const groupOperationsSelector = (state) => domainSelector(state).groupOperations;
export const selectedUsersSelector = createSelectedItemsSelector(groupOperationsSelector);

export const querySelector = createQueryParametersSelector({
  defaultPagination: DEFAULT_PAGINATION,
  defaultSorting: DEFAULT_SORTING,
});
