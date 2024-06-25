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
import { convertQueryForRequest } from './util';
import { NAMESPACE, FETCH_PROJECTS_BY_ID } from './constants';
import { querySelector } from './selectors';

function* fetchProjectsById({ payload: organizationId }) {
  const query = yield select(querySelector);
  const queryParams = convertQueryForRequest(query);
  yield put(
    fetchDataAction(NAMESPACE)(URLS.organizationProjects(organizationId, { ...queryParams })),
  );
}

function* watchFetchProjects() {
  yield takeEvery(FETCH_PROJECTS_BY_ID, fetchProjectsById);
}

export function* projectsSagas() {
  yield all([watchFetchProjects()]);
}
