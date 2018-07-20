import {
  createSelectedItemsSelector,
  createValidationErrorsSelector,
  createLastOperationSelector,
} from 'controllers/groupOperations';

const domainSelector = (state) => state.step;

const groupOperationsSelector = (state) => domainSelector(state).groupOperations;

export const selectedStepsSelector = createSelectedItemsSelector(groupOperationsSelector);
export const validationErrorsSelector = createValidationErrorsSelector(groupOperationsSelector);
export const lastOperationSelector = createLastOperationSelector(groupOperationsSelector);

export const stepsSelector = (state) => domainSelector(state).steps;
