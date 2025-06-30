/*
 * Copyright 2025 EPAM Systems
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

import { Action } from 'redux';
import { takeEvery, call, select, all } from 'redux-saga/effects';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { projectKeySelector } from 'controllers/project';

import { GET_TEST_CASES } from './constants';
import { GetTestCasesParams } from './actionCreators';

interface GetTestCasesAction extends Action<typeof GET_TEST_CASES> {
  payload?: GetTestCasesParams;
}

function* getTestCases(action: GetTestCasesAction) {
  try {
    const projectKey = yield select(projectKeySelector);

    yield call(fetch, URLS.testCase(projectKey, action.payload));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

function* watchGetTestCases() {
  yield takeEvery(GET_TEST_CASES, getTestCases);
}

export function* testCaseSagas() {
  yield all([watchGetTestCases()]);
}
