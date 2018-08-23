import { takeEvery, all, put, select } from 'redux-saga/effects';
import { change, getFormValues } from 'redux-form';
import { ENTITIES_FORM_NAME, TOGGLE_FILTER } from './constants';

function* toggleFilter({ payload }) {
  const entities = yield select(getFormValues(ENTITIES_FORM_NAME));
  if (entities[payload]) {
    return;
  }
  yield put(change(ENTITIES_FORM_NAME, payload, null));
}

function* watchToggleFilter() {
  yield takeEvery(TOGGLE_FILTER, toggleFilter);
}

export function* filterEntitiesSagas() {
  yield all([watchToggleFilter()]);
}
