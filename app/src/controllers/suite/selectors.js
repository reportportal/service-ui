import {
  createValidationErrorsSelector,
  createSelectedItemsSelector,
  createLastOperationSelector,
} from 'controllers/groupOperations';

const domainSelector = (state) => state.suites || {};
const groupOperationsSelector = (state) => domainSelector(state).groupOperations;

export const selectedSuitesSelector = createSelectedItemsSelector(groupOperationsSelector);
export const validationErrorsSelector = createValidationErrorsSelector(groupOperationsSelector);
export const lastOperationSelector = createLastOperationSelector(groupOperationsSelector);

export const suitesSelector = (state) => domainSelector(state).suites;
export const suitePaginationSelector = (state) => domainSelector(state).pagination;
