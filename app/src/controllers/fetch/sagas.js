import { takeEvery, call, all, put, select } from 'redux-saga/effects';
import { fetchAPI } from 'common/utils';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { tokenSelector } from 'controllers/auth';
import { FETCH_DATA, FETCH_ERROR, BULK_FETCH_DATA, CONCAT_FETCH_DATA } from './constants';
import {
  fetchSuccessAction,
  fetchStartAction,
  fetchErrorAction,
  concatFetchSuccessAction,
} from './actionCreators';

const silentFetch = (...args) => fetch(...args).catch(() => null);

function* bulkFetchData({ payload, meta }) {
  const namespace = meta.namespace;
  const urls = payload.urls;
  const fetchFunc = meta.silent ? silentFetch : fetchAPI;
  try {
    const token = yield select(tokenSelector);
    yield put(fetchStartAction(namespace, payload));
    const responses = yield all(urls.map((url) => call(fetchFunc, url, token, payload.options)));
    yield put(fetchSuccessAction(namespace, responses));
  } catch (err) {
    yield put(fetchErrorAction(namespace, err));
  }
}

function* concatFetchData({ payload, meta }) {
  const { namespace } = meta;
  const { url, options, concat } = payload;

  try {
    const token = yield select(tokenSelector);
    yield put(fetchStartAction(namespace, payload));
    const response = yield call(fetchAPI, url, token, options);
    yield put(concatFetchSuccessAction(namespace, response, concat));
  } catch (err) {
    yield put(fetchErrorAction(namespace, err));
  }
}

function* fetchData({ payload, meta }) {
  const namespace = meta.namespace;
  try {
    const token = yield select(tokenSelector);
    yield put(fetchStartAction(namespace, payload));
    const response = yield call(fetchAPI, payload.url, token, payload.options);
    yield put(fetchSuccessAction(namespace, response));
  } catch (err) {
    yield put(fetchErrorAction(namespace, err));
  }
}

function* watchBulkFetchData() {
  yield takeEvery(BULK_FETCH_DATA, bulkFetchData);
}

function* watchConcatFetchData() {
  yield takeEvery(CONCAT_FETCH_DATA, concatFetchData);
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
  yield all([watchFetchData(), watchFetchError(), watchBulkFetchData(), watchConcatFetchData()]);
}
