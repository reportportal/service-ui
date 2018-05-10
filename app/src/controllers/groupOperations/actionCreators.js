import {
  SELECT_ITEMS,
  TOGGLE_ITEM_SELECTION,
  UNSELECT_ALL_ITEMS,
  REMOVE_VALIDATION_ERROR,
  SET_LAST_OPERATION_NAME,
  SET_VALIDATION_ERRORS,
  PROCEED_WITH_VALID_ITEMS,
} from './constants';

export const setValidationErrorsAction = (namespace) => (errors) => ({
  type: SET_VALIDATION_ERRORS,
  payload: errors,
  meta: {
    namespace,
  },
});
export const resetValidationErrorsAction = (namespace) => () => ({
  type: SET_VALIDATION_ERRORS,
  payload: {},
  meta: {
    namespace,
  },
});
export const removeValidationErrorAction = (namespace) => (id) => ({
  type: REMOVE_VALIDATION_ERROR,
  payload: id,
  meta: {
    namespace,
  },
});

export const toggleItemSelectionAction = (namespace) => (item) => ({
  type: TOGGLE_ITEM_SELECTION,
  payload: item,
  meta: {
    namespace,
  },
});

export const selectItemsAction = (namespace) => (launches) => ({
  type: SELECT_ITEMS,
  payload: launches,
  meta: {
    namespace,
  },
});
export const unselectAllItemsAction = (namespace) => () => ({
  type: UNSELECT_ALL_ITEMS,
  meta: {
    namespace,
  },
});

export const setLastOperationNameAction = (namespace) => (operationName) => ({
  type: SET_LAST_OPERATION_NAME,
  payload: operationName,
  meta: {
    namespace,
  },
});

export const createProceedWithValidItemsAction = (namespace) => (
  operationName,
  selectedItems,
  additionalArgs,
) => ({
  type: PROCEED_WITH_VALID_ITEMS,
  payload: {
    name: operationName,
    selectedItems,
    additionalArgs,
  },
  meta: {
    namespace,
  },
});
