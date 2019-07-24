import { combineReducers } from 'redux';
import {
  SELECT_ITEMS,
  TOGGLE_ITEM_SELECTION,
  UNSELECT_ALL_ITEMS,
  REMOVE_VALIDATION_ERRORS,
  SET_LAST_OPERATION_NAME,
  SET_VALIDATION_ERRORS,
  RESET_VALIDATION_ERRORS,
  SELECTED_ITEMS_INITIAL_STATE,
  VALIDATION_ERRORS_INITIAL_STATE,
  LAST_OPERATION_INITIAL_STATE,
  UNSELECT_ITEMS,
  TOGGLE_ALL_ITEMS,
} from './constants';

const createIdComparator = (id) => (item) => item.id === id;

const toggleItem = (items, item) =>
  items.find(createIdComparator(item.id))
    ? items.filter((v) => v.id !== item.id)
    : [...items, item];

const selectItems = (state, items) => [
  ...state,
  ...items.filter((item) => !state.find(createIdComparator(item.id))),
];

const unselectItems = (state, items) =>
  state.filter((selectedItem) => !items.find(createIdComparator(selectedItem.id)));

const selectAll = (state, items) => {
  if (state.length > 0 && items.every((item) => !!state.find(createIdComparator(item.id)))) {
    return unselectItems(state, items);
  }
  return selectItems(state, items);
};

export const selectedItemsReducer = (namespace) => (
  state = SELECTED_ITEMS_INITIAL_STATE,
  { type, payload, meta },
) => {
  if (meta && meta.namespace && meta.namespace !== namespace) {
    return state;
  }
  switch (type) {
    case TOGGLE_ITEM_SELECTION:
      return toggleItem(state, payload);
    case SELECT_ITEMS:
      return selectItems(state, payload);
    case UNSELECT_ITEMS:
      return unselectItems(state, payload);
    case TOGGLE_ALL_ITEMS:
      return selectAll(state, payload);
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
    case REMOVE_VALIDATION_ERRORS: {
      const errorIds = Object.keys(state);
      const payloadIds = payload.map(String);
      return errorIds
        .filter((id) => payloadIds.indexOf(id) === -1)
        .reduce(
          (result, key) => ({ ...result, [key]: state[key] }),
          VALIDATION_ERRORS_INITIAL_STATE,
        );
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
