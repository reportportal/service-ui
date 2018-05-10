export const createSelectedItemsSelector = (groupOperationSelector) => (state) =>
  groupOperationSelector(state).selectedItems;
export const createValidationErrorsSelector = (groupOperationSelector) => (state) =>
  groupOperationSelector(state).errors;
export const createLastOperationSelector = (groupOperationSelector) => (state) =>
  groupOperationSelector(state).lastOperation;
