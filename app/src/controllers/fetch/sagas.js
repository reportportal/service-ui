/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { takeEvery, call, all, put, cancelled } from 'redux-saga/effects';
import { fetch, ERROR_CANCELED, ERROR_UNAUTHORIZED } from 'common/utils/fetch';
import { showDefaultErrorNotification } from 'controllers/notification';
import { LAUNCHES_FILTERS_UPDATE_NAMESPACE } from 'controllers/filter/constants';
import {
  FETCH_DATA,
  FETCH_ERROR,
  BULK_FETCH_DATA,
  CONCAT_FETCH_DATA,
  PREPEND_FETCH_DATA,
} from './constants';
import {
  fetchSuccessAction,
  fetchStartAction,
  fetchErrorAction,
  concatFetchSuccessAction,
  prependFetchSuccessAction,
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

function* commonFetchData({ payload, meta }, successCallback) {
  const { namespace } = meta;
  const { url, options } = payload;

  try {
    yield put(fetchStartAction(namespace, payload));
    const response = yield call(fetch, url, options);
    yield put(successCallback(namespace, response));
  } catch (err) {
    yield put(fetchErrorAction(namespace, err));
  }
}

function* concatFetchData({ payload, meta }) {
  const successCallback = (namespace, response) =>
    concatFetchSuccessAction(namespace, response, payload.concat);
  yield* commonFetchData({ payload, meta }, successCallback);
}

function* prependFetchData({ payload, meta }) {
  yield* commonFetchData({ payload, meta }, prependFetchSuccessAction);
}

// Namespaces whose FETCH_DATA requests are writes that must all complete (no latest-wins).
const PARALLEL_FETCH_NAMESPACES = new Set([LAUNCHES_FILTERS_UPDATE_NAMESPACE]);
const PARALLEL_FETCH_METHODS = ['put', 'patch', 'delete'];

const latestFetchRequests = new Map();

const isLatestWinsRequest = (namespace, options = {}) =>
  !PARALLEL_FETCH_NAMESPACES.has(namespace) &&
  !PARALLEL_FETCH_METHODS.includes(String(options.method || 'get').toLowerCase());

export function* fetchData({ payload, meta }) {
  const namespace = meta.namespace;
  const options = payload.options || {};
  const latestWins = isLatestWinsRequest(namespace, options);
  const request = { cancel: () => {} };
  if (latestWins) {
    // A newer request for the same namespace supersedes the previous one: abort it and drop its result.
    latestFetchRequests.get(namespace)?.cancel();
    latestFetchRequests.set(namespace, request);
  }
  const isCurrent = () => !latestWins || latestFetchRequests.get(namespace) === request;
  try {
    yield put(fetchStartAction(namespace, payload));
    const response = yield call(fetch, payload.url, {
      ...options,
      abort: (cancelFunc) => {
        request.cancel = cancelFunc;
        options.abort?.(cancelFunc);
      },
    });
    if (isCurrent()) {
      yield put(fetchSuccessAction(namespace, response));
    }
  } catch (err) {
    if (isCurrent()) {
      yield put(fetchErrorAction(namespace, err, meta.silent));
    }
  } finally {
    if (latestWins && isCurrent()) {
      latestFetchRequests.delete(namespace);
    }
    if (yield cancelled()) {
      request.cancel();
    }
  }
}

function* watchBulkFetchData() {
  yield takeEvery(BULK_FETCH_DATA, bulkFetchData);
}

function* watchConcatFetchData() {
  yield takeEvery(CONCAT_FETCH_DATA, concatFetchData);
}

function* watchPrependFetchData() {
  yield takeEvery(PREPEND_FETCH_DATA, prependFetchData);
}

function* watchFetchData() {
  yield takeEvery(FETCH_DATA, fetchData);
}

const SILENT_ERROR_MESSAGES = [ERROR_UNAUTHORIZED, ERROR_CANCELED];

export function* handleError({ payload, meta: { silent } = {} }) {
  // Session expiry is reported by the logout flow; cancelled requests are intentional.
  if (silent || SILENT_ERROR_MESSAGES.includes(payload?.message)) {
    return;
  }
  yield put(showDefaultErrorNotification(payload));
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
    watchPrependFetchData(),
  ]);
}
