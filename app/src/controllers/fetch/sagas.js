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

import { all, call, cancel, cancelled, fork, put, take, takeEvery } from 'redux-saga/effects';
import { fetch } from 'common/utils/fetch';
import { showDefaultErrorNotification } from 'controllers/notification';
import { BULK_FETCH_DATA, CONCAT_FETCH_DATA, FETCH_DATA, FETCH_ERROR } from './constants';
import {
  concatFetchSuccessAction,
  fetchErrorAction,
  fetchStartAction,
  fetchSuccessAction,
} from './actionCreators';

const silentFetch = (...args) => fetch(...args).catch(() => null);

function* bulkFetchData({ payload, meta }) {
  const namespace = meta.namespace;
  const urls = payload.urls;
  const fetchFunc = meta.silent ? silentFetch : fetch;
  const cancelRequestArr = [];
  try {
    yield put(fetchStartAction(namespace, payload));
    const responses = yield all(
      urls.map((url) =>
        call(fetchFunc, url, {
          ...payload.options,
          abort: (cancelFunc) => {
            cancelRequestArr.push(cancelFunc);
          },
        }),
      ),
    );
    yield put(fetchSuccessAction(namespace, responses));
  } catch (err) {
    yield put(fetchErrorAction(namespace, err));
  } finally {
    if (yield cancelled()) {
      cancelRequestArr.forEach((req) => req());
    }
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

function* fetchDataWithCancel({ payload, meta }) {
  const task = yield fork(fetchData, { payload, meta });
  yield take('CANCEL_FETCH_DATA');
  yield cancel(task);
}

function* bulkFetchDataWithCancel({ payload, meta }) {
  const task = yield fork(bulkFetchData, { payload, meta });
  yield take('CANCEL_FETCH_DATA');
  yield cancel(task);
}

function* watchBulkFetchData() {
  yield takeEvery(BULK_FETCH_DATA, bulkFetchDataWithCancel);
}

function* watchConcatFetchData() {
  yield takeEvery(CONCAT_FETCH_DATA, concatFetchData);
}

function* watchFetchData() {
  yield takeEvery(FETCH_DATA, fetchDataWithCancel);
}

export function* handleError({ payload, meta: { silent } = {} }) {
  if (silent) {
    return;
  }
  yield put(showDefaultErrorNotification(payload));
}

function* watchFetchError() {
  yield takeEvery(FETCH_ERROR, handleError);
}

export function* fetchSagas() {
  yield all([watchFetchData(), watchFetchError(), watchBulkFetchData(), watchConcatFetchData()]);
}
