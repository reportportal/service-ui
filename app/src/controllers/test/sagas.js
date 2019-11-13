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

import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { launchIdSelector, suiteIdSelector } from 'controllers/pages';
import { URLS } from 'common/urls';
import { FETCH_TESTS, NAMESPACE } from './constants';

function* getTests({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const launchId = yield select(launchIdSelector);
  const suiteId = yield select(suiteIdSelector);
  yield put(fetchDataAction(NAMESPACE)(URLS.testItems(activeProject, launchId, suiteId), payload));
}

function* watchFetchTests() {
  yield takeEvery(FETCH_TESTS, getTests);
}

export function* testSagas() {
  yield all([watchFetchTests()]);
}
