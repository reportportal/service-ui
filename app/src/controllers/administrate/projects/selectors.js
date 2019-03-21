import { createQueryParametersSelector } from 'controllers/pages';
import { createSelectedItemsSelector } from 'controllers/groupOperations';
import { DEFAULT_PAGINATION } from './constants';
import { administrateDomainSelector } from '../selectors';

const domainSelector = (state) => administrateDomainSelector(state).projects || {};

export const projectsPaginationSelector = (state) => domainSelector(state).pagination;
export const projectsSelector = (state) => domainSelector(state).projects;
export const loadingSelector = (state) => domainSelector(state).loading || false;
export const viewModeSelector = (state) => domainSelector(state).viewMode;

const groupOperationsSelector = (state) => domainSelector(state).groupOperations;
export const selectedProjectsSelector = createSelectedItemsSelector(groupOperationsSelector);

export const querySelector = createQueryParametersSelector({
  defaultPagination: DEFAULT_PAGINATION,
});
