import {
  createValidationErrorsSelector,
  createSelectedItemsSelector,
  createLastOperationSelector,
} from 'controllers/groupOperations';

const domainSelector = (state) => state.launches || {};
const groupOperationsSelector = (state) => domainSelector(state).groupOperations;

export const selectedLaunchesSelector = createSelectedItemsSelector(groupOperationsSelector);
export const validationErrorsSelector = createValidationErrorsSelector(groupOperationsSelector);
export const lastOperationSelector = createLastOperationSelector(groupOperationsSelector);

export const launchesSelector = (state) => domainSelector(state).launches;
export const launchPaginationSelector = (state) => domainSelector(state).pagination;
