import { takeEvery, call, all, put } from 'redux-saga/effects';
import { fetch } from 'common/utils';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { FETCH_DATA, FETCH_ERROR, BULK_FETCH_DATA } from './constants';
import { fetchSuccessAction, fetchStartAction, fetchErrorAction } from './actionCreators';

function* bulkFetchData({ payload, meta }) {
  const namespace = meta.namespace;
  const urls = payload.urls;
  try {
    yield put(fetchStartAction(namespace, payload));
    const responses = yield all(urls.map((url) => call(fetch, url, payload.options)));
    yield put(fetchSuccessAction(namespace, responses));
  } catch (err) {
    yield put(fetchErrorAction(namespace, err));
  }
}

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

function* watchBulkFetchData() {
  yield takeEvery(BULK_FETCH_DATA, bulkFetchData);
}

function* watchFetchData() {
  yield takeEvery(FETCH_DATA, fetchData);
}

function* handleError({ payload }) {
  yield put(showNotification({ message: payload.message, type: NOTIFICATION_TYPES.ERROR }));
}

function* watchFetchError() {
  yield takeEvery(FETCH_ERROR, handleError);
}

export function* fetchSagas() {
  yield all([watchFetchData(), watchFetchError(), watchBulkFetchData()]);
}
