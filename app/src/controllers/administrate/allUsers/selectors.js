import { DEFAULT_PAGINATION } from 'controllers/pagination';
import { createQueryParametersSelector } from 'controllers/pages';
import { administrateDomainSelector } from '../selectors';

const domainSelector = (state) => administrateDomainSelector(state).allUsers || {};

export const allUsersPaginationSelector = (state) => domainSelector(state).pagination;
export const allUsersSelector = (state) => domainSelector(state).allUsers;
export const loadingSelector = (state) => domainSelector(state).loading || false;

export const querySelector = createQueryParametersSelector({
  defaultPagination: DEFAULT_PAGINATION,
});
