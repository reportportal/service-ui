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

import { all, call, put, select, takeEvery, cancelled } from 'redux-saga/effects';
import { handleError } from 'controllers/fetch';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { URLS } from 'common/urls';
import { omit, fetch, isEmptyObject } from 'common/utils';
import {
  REQUEST_NESTED_STEP,
  FETCH_NESTED_STEP_ERROR,
  PAGINATION_OFFSET,
  LOAD_MORE_NESTED_STEP,
} from './constants';
import {
  fetchNestedStepStartAction,
  fetchNestedStepSuccessAction,
  fetchNestedStepErrorAction,
  toggleNestedStepAction,
} from './actionCreators';
import { collectLogPayload } from '../sagaUtils';
import { nestedStepSelector } from './selectors';

function* fetchNestedStep({ payload = {} }) {
  const { id } = payload;
  const { activeProject, query, filterLevel } = yield call(collectLogPayload);
  const logLevel = filterLevel;
  const paramsExcludingPagination = omit(query, [PAGE_KEY, SIZE_KEY]);
  const { page } = yield select(nestedStepSelector, id);
  let pageSize = PAGINATION_OFFSET;
  if (!isEmptyObject(page)) {
    const { totalElements, size } = page;
    pageSize = size >= totalElements ? totalElements : size + PAGINATION_OFFSET;
  }
  const fetchParams = {
    ...paramsExcludingPagination,
    [PAGE_KEY]: 1,
    [SIZE_KEY]: pageSize,
  };

  let cancelRequest = () => {};
  try {
    yield put(fetchNestedStepStartAction(payload));
    const response = yield call(fetch, URLS.logItems(activeProject, id, logLevel), {
      params: fetchParams,
      abort: (cancelFunc) => {
        cancelRequest = cancelFunc;
      },
    });
    yield put(fetchNestedStepSuccessAction({ id, ...response }));
  } catch (err) {
    yield put(fetchNestedStepErrorAction(err));
  } finally {
    if (yield cancelled()) {
      cancelRequest();
    }
  }
}

function* requestNestedStep({ payload = {} }) {
  const { id } = payload;
  const nestedStep = yield select(nestedStepSelector, id);
  if (nestedStep.initial) {
    yield call(fetchNestedStep, { payload });
  }
  yield put(toggleNestedStepAction(payload));
}

function* watchRequestNestedStep() {
  yield takeEvery(REQUEST_NESTED_STEP, requestNestedStep);
}

function* watchLoadMoreNestedStep() {
  yield takeEvery(LOAD_MORE_NESTED_STEP, fetchNestedStep);
}

function* watchFetchError() {
  yield takeEvery(FETCH_NESTED_STEP_ERROR, handleError);
}

export function* nestedStepSagas() {
  yield all([watchRequestNestedStep(), watchLoadMoreNestedStep(), watchFetchError()]);
}
