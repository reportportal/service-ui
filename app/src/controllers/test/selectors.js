import {
  createValidationErrorsSelector,
  createSelectedItemsSelector,
  createLastOperationSelector,
} from 'controllers/groupOperations';

const domainSelector = (state) => state.tests || {};
const groupOperationsSelector = (state) => domainSelector(state).groupOperations;

export const selectedTestsSelector = createSelectedItemsSelector(groupOperationsSelector);
export const validationErrorsSelector = createValidationErrorsSelector(groupOperationsSelector);
export const lastOperationSelector = createLastOperationSelector(groupOperationsSelector);

export const testsSelector = (state) => domainSelector(state).tests;
export const testPaginationSelector = (state) => domainSelector(state).pagination;
