import {
  createValidationErrorsSelector,
  createSelectedItemsSelector,
  createLastOperationSelector,
} from 'controllers/groupOperations';
import { createQueryParametersSelector } from 'controllers/pages';
import { DEFAULT_SORTING, NAMESPACE } from './constants';

const domainSelector = (state) => state.launches || {};
const groupOperationsSelector = (state) => domainSelector(state).groupOperations;

export const selectedLaunchesSelector = createSelectedItemsSelector(groupOperationsSelector);
export const validationErrorsSelector = createValidationErrorsSelector(groupOperationsSelector);
export const lastOperationSelector = createLastOperationSelector(groupOperationsSelector);

export const launchesSelector = (state) => domainSelector(state).launches;
export const launchPaginationSelector = (state) => domainSelector(state).pagination;

export const loadingSelector = (state) => domainSelector(state).loading || false;

export const queryParametersSelector = createQueryParametersSelector({
  namespace: NAMESPACE,
  defaultSorting: DEFAULT_SORTING,
});
