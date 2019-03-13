import { DEFAULT_PAGINATION } from 'controllers/pagination';
import { createQueryParametersSelector } from 'controllers/pages';
import { DEFAULT_SORTING } from './constants';
import { administrateDomainSelector } from '../selectors';

const domainSelector = (state) => administrateDomainSelector(state).events || {};

export const eventsPaginationSelector = (state) => domainSelector(state).pagination;
export const eventsSelector = (state) => domainSelector(state).events;
export const loadingSelector = (state) => domainSelector(state).loading || false;

export const querySelector = createQueryParametersSelector({
  defaultPagination: DEFAULT_PAGINATION,
  defaultSorting: DEFAULT_SORTING,
});
