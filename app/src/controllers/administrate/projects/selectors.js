import { createQueryParametersSelector } from './../../pages';
import { DEFAULT_PAGINATION } from './constants';
import { administrateDomainSelector } from '../selectors';

const domainSelector = (state) => administrateDomainSelector(state).projects || {};

export const projectsPaginationSelector = (state) => domainSelector(state).pagination;
export const projectsSelector = (state) => domainSelector(state).projects;
export const loadingSelector = (state) => domainSelector(state).loading || false;
export const viewTypeSelector = (state) => domainSelector(state).viewType;

export const querySelector = createQueryParametersSelector({
  defaultPagination: DEFAULT_PAGINATION,
});
