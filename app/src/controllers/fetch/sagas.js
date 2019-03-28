import { takeEvery, takeLatest, call, all, put, select, cancelled } from 'redux-saga/effects';
import { fetch, updateToken } from 'common/utils/fetch';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { SET_TOKEN, tokenSelector } from 'controllers/auth';
import { SET_API_TOKEN } from 'controllers/user';
import { CHANGE_FULL_SCREEN_MODE, TOGGLE_FULL_SCREEN_MODE } from 'controllers/dashboard';
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
  const fetchFunc = meta.silent ? silentFetch : fetch;
  try {
    yield put(fetchStartAction(namespace, payload));
    const responses = yield all(urls.map((url) => call(fetchFunc, url, payload.options)));
    yield put(fetchSuccessAction(namespace, responses));
  } catch (err) {
    yield put(fetchErrorAction(namespace, err));
  }
}

function* concatFetchData({ payload, meta }) {
  const { namespace } = meta;
  const { url, options, concat } = payload;

  try {
    yield put(fetchStartAction(namespace, payload));
    const response = yield call(fetch, url, options);
    yield put(concatFetchSuccessAction(namespace, response, concat));
  } catch (err) {
    yield put(fetchErrorAction(namespace, err));
  }
}

function* fetchData({ payload, meta }) {
  const namespace = meta.namespace;
  let cancelRequest = () => {};
  try {
    yield put(fetchStartAction(namespace, payload));
    const response = yield call(fetch, payload.url, {
      ...payload.options,
      abort: (cancelFunc) => {
        cancelRequest = cancelFunc;
      },
    });
    yield put(fetchSuccessAction(namespace, response));
  } catch (err) {
    yield put(fetchErrorAction(namespace, err, meta.silent));
  } finally {
    if (yield cancelled()) {
      cancelRequest();
    }
  }
}

function* updateTokenWorker() {
  const token = yield select(tokenSelector);
  yield call(updateToken, token);
}

function* watchUpdateToken() {
  yield takeEvery(
    [SET_TOKEN, SET_API_TOKEN, CHANGE_FULL_SCREEN_MODE, TOGGLE_FULL_SCREEN_MODE],
    updateTokenWorker,
  );
}

function* watchBulkFetchData() {
  yield takeEvery(BULK_FETCH_DATA, bulkFetchData);
}

function* watchConcatFetchData() {
  yield takeEvery(CONCAT_FETCH_DATA, concatFetchData);
}

function* watchFetchData() {
  yield takeLatest(FETCH_DATA, fetchData);
}

function* handleError({ payload, meta: { silent } = {} }) {
  if (silent) {
    return;
  }
  yield put(showNotification({ message: payload.message, type: NOTIFICATION_TYPES.ERROR }));
}

function* watchFetchError() {
  yield takeEvery(FETCH_ERROR, handleError);
}

export function* fetchSagas() {
  yield all([
    watchFetchData(),
    watchFetchError(),
    watchBulkFetchData(),
    watchConcatFetchData(),
    watchUpdateToken(),
  ]);
}
