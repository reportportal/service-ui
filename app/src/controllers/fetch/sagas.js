import { takeEvery, call, all, put } from 'redux-saga/effects';
import { fetch } from 'common/utils';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { FETCH_DATA, FETCH_ERROR } from './constants';
import { fetchSuccessAction, fetchStartAction, fetchErrorAction } from './actionCreators';

function* fetchData({ payload, meta }) {
  const namespace = meta.namespace;
  try {
    yield put(fetchStartAction(namespace, payload));
    const response = yield call(fetch, payload.url, payload.options);
    yield put(fetchSuccessAction(namespace, response));
  } catch (err) {
    yield put(fetchErrorAction(namespace, err));
  }
}

function* watchFetchData() {
  yield takeEvery(FETCH_DATA, fetchData);
}

function* handleError({ payload }) {
  yield put(showNotification(payload.message, NOTIFICATION_TYPES.ERROR));
}

function* watchFetchError() {
  yield takeEvery(FETCH_ERROR, handleError);
}

export function* fetchSagas() {
  yield all([watchFetchData(), watchFetchError()]);
}
