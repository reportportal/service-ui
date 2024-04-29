/*
 * Copyright 2024 EPAM Systems
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

import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { NAMESPACE, FETCH_MONITORING } from './constants';
import { querySelector } from './selectors';

function* fetchMonitoring() {
  const { appliedFilters, alternativePaginationAndSortParams } = yield select(querySelector);
  const projectKey = yield select(projectKeySelector);

  yield put(
    fetchDataAction(NAMESPACE)(URLS.eventsController(projectKey), {
      method: 'POST',
      params: alternativePaginationAndSortParams,
      data: appliedFilters,
    }),
  );
}

function* watchFetchMonitoring() {
  yield takeEvery(FETCH_MONITORING, fetchMonitoring);
}

export function* monitoringSagas() {
  yield all([watchFetchMonitoring()]);
}
