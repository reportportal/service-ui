import { takeEvery, all, put, select } from 'redux-saga/effects';
import {
  removeValidationErrorAction,
  resetValidationErrorsAction,
  setValidationErrorsAction,
  setLastOperationNameAction,
  selectItemsAction,
  removeValidationErrorsAction,
  unselectItemsAction,
} from './actionCreators';
import {
  TOGGLE_ITEM_SELECTION,
  UNSELECT_ALL_ITEMS,
  EXECUTE_GROUP_OPERATION,
  PROCEED_WITH_VALID_ITEMS,
  TOGGLE_ALL_ITEMS,
} from './constants';
import { validateItems, getGroupOperationDescriptor } from './utils';

function* removeValidationErrors({ payload, meta: { namespace } }) {
  yield put(removeValidationErrorsAction(namespace)(payload.map((item) => item.id)));
}

function* watchToggleAllItems() {
  yield takeEvery(TOGGLE_ALL_ITEMS, removeValidationErrors);
}

function* removeValidationError({ payload, meta: { namespace } }) {
  yield put(removeValidationErrorAction(namespace)(payload.id));
}

function* watchToggleItemSelection() {
  yield takeEvery(TOGGLE_ITEM_SELECTION, removeValidationError);
}

function* resetValidationErrors({ meta: { namespace } }) {
  yield put(resetValidationErrorsAction(namespace)());
}

function* watchUnselectAllItems() {
  yield takeEvery(UNSELECT_ALL_ITEMS, resetValidationErrors);
}

const getState = (state) => state;

function* executeGroupOperation({ payload, meta }) {
  const { name, selectedItems, additionalArgs } = payload;
  const { namespace } = meta;
  const descriptor = getGroupOperationDescriptor(name);
  if (!descriptor || !selectedItems || selectedItems.length === 0) {
    return;
  }
  const state = yield select(getState);
  yield put(setLastOperationNameAction(namespace)(name));
  yield put(resetValidationErrorsAction(namespace)());
  const errors = validateItems(selectedItems, descriptor.validator, state);
  if (Object.keys(errors).length > 0) {
    yield put(setValidationErrorsAction(namespace)(errors));
    return;
  }
  yield put(setLastOperationNameAction(namespace)(''));
  yield put(descriptor.action(selectedItems, additionalArgs));
}

function* watchExecuteGroupOperation() {
  yield takeEvery(EXECUTE_GROUP_OPERATION, executeGroupOperation);
}

function* proceedWithValidItems({ payload, meta }) {
  const { name, selectedItems, additionalArgs } = payload;
  const descriptor = getGroupOperationDescriptor(name);
  if (!descriptor || !selectedItems || selectedItems.length === 0) {
    return;
  }
  const { action, validator } = descriptor;
  const { namespace } = meta;
  const state = yield select(getState);
  const validItems = selectedItems.filter((item) => !validator(item, selectedItems, state));
  const invalidItems = selectedItems.filter((item) => validator(item, selectedItems, state));

  if (invalidItems.length > 0) {
    yield put(unselectItemsAction(namespace)(invalidItems));
  }
  const launchesToValidate = validItems.length > 0 ? validItems : selectedItems;
  const errors = validateItems(launchesToValidate, validator, state);
  if (Object.keys(errors).length > 0) {
    yield put(setValidationErrorsAction(namespace)(errors));
    return;
  }
  yield put(selectItemsAction(namespace)(validItems));
  yield put(action(validItems, additionalArgs));
  yield put(setLastOperationNameAction(namespace)(''));
  yield put(resetValidationErrorsAction(namespace)());
}

function* watchProceedWithValidItems() {
  yield takeEvery(PROCEED_WITH_VALID_ITEMS, proceedWithValidItems);
}

export function* groupOperationsSagas() {
  yield all([
    watchToggleItemSelection(),
    watchUnselectAllItems(),
    watchToggleAllItems(),
    watchExecuteGroupOperation(),
    watchProceedWithValidItems(),
  ]);
}
