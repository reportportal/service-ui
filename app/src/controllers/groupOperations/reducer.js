import { combineReducers } from 'redux';
import {
  SELECT_ITEMS,
  TOGGLE_ITEM_SELECTION,
  UNSELECT_ALL_ITEMS,
  REMOVE_VALIDATION_ERROR,
  SET_LAST_OPERATION_NAME,
  SET_VALIDATION_ERRORS,
  RESET_VALIDATION_ERRORS,
  SELECTED_ITEMS_INITIAL_STATE,
  VALIDATION_ERRORS_INITIAL_STATE,
  LAST_OPERATION_INITIAL_STATE,
} from './constants';

export const selectedItemsReducer = (namespace) => (
  state = SELECTED_ITEMS_INITIAL_STATE,
  { type, payload, meta },
) => {
  if (meta && meta.namespace && meta.namespace !== namespace) {
    return state;
  }
  switch (type) {
    case TOGGLE_ITEM_SELECTION:
      return state.find((item) => item.id === payload.id)
        ? state.filter((item) => item.id !== payload.id)
        : [...state, payload];
    case SELECT_ITEMS:
      return [...payload];
    case UNSELECT_ALL_ITEMS:
      return [];
    default:
      return state;
  }
};

export const validationErrorsReducer = (namespace) => (
  state = VALIDATION_ERRORS_INITIAL_STATE,
  { type, payload, meta },
) => {
  if (meta && meta.namespace && meta.namespace !== namespace) {
    return state;
  }
  switch (type) {
    case SET_VALIDATION_ERRORS:
      return { ...payload };
    case REMOVE_VALIDATION_ERROR: {
      const newState = { ...state };
      delete newState[payload];
      return newState;
    }
    case RESET_VALIDATION_ERRORS:
      return VALIDATION_ERRORS_INITIAL_STATE;
    default:
      return state;
  }
};

export const lastOperationReducer = (namespace) => (
  state = LAST_OPERATION_INITIAL_STATE,
  { type, payload, meta },
) => {
  if (meta && meta.namespace && meta.namespace !== namespace) {
    return state;
  }
  switch (type) {
    case SET_LAST_OPERATION_NAME:
      return payload;
    default:
      return state;
  }
};

export const groupOperationsReducer = (namespace) =>
  combineReducers({
    selectedItems: selectedItemsReducer(namespace),
    errors: validationErrorsReducer(namespace),
    lastOperation: lastOperationReducer(namespace),
  });
