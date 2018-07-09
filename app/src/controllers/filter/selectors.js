import { createQueryParametersSelector } from 'controllers/pages';
import { DEFAULT_PAGINATION } from './constants';

const domainSelector = (state) => state.filters || {};

export const filtersPaginationSelector = (state) => domainSelector(state).pagination;
export const filtersSelector = (state) => domainSelector(state).filters;
export const loadingSelector = (state) => domainSelector(state).loading || false;
export const querySelector = createQueryParametersSelector({
  defaultPagination: DEFAULT_PAGINATION,
});
