import { takeEvery, all, put, select } from 'redux-saga/effects';
import {
  removeValidationErrorAction,
  resetValidationErrorsAction,
  setValidationErrorsAction,
  setLastOperationAction,
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
  yield put(setLastOperationAction(namespace)(name, additionalArgs));
  yield put(resetValidationErrorsAction(namespace)());
  const errors = validateItems(selectedItems, descriptor.validator, state);
  if (Object.keys(errors).length > 0) {
    yield put(setValidationErrorsAction(namespace)(errors));
    return;
  }
  yield put(setLastOperationAction(namespace)(''));
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
  const errors = validateItems(selectedItems, validator, state);
  const validItems = selectedItems.filter((item) => !errors[item.id]);
  const invalidItems = selectedItems.filter((item) => errors[item.id]);

  if (invalidItems.length > 0) {
    yield put(unselectItemsAction(namespace)(invalidItems));
  }

  yield put(action(validItems, additionalArgs));
  yield put(setLastOperationAction(namespace)(''));
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
