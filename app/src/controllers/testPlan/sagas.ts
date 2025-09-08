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
import { takeLatest, call, select, all, put } from 'redux-saga/effects';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { fetchSuccessAction, fetchErrorAction } from 'controllers/fetch';
import { FETCH_START } from 'controllers/fetch/constants';
import { showErrorNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';

import { defaultSortParam, GET_TEST_PLANS, NAMESPACE, TestPlanDto } from './constants';
import { GetTestPlansParams } from './actionCreators';

interface GetTestPlansAction extends Action<typeof GET_TEST_PLANS> {
  payload?: GetTestPlansParams;
}

function* getTestPlans(action: GetTestPlansAction): Generator {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;

    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: NAMESPACE },
    });

    const params = action.payload ?? { sort: defaultSortParam };
    const data = (yield call(fetch, URLS.testPlan(projectKey, params))) as {
      content: TestPlanDto[];
    };

    yield put(
      fetchSuccessAction(NAMESPACE, {
        content: data.content,
      }),
    );
  } catch (error) {
    yield put(fetchErrorAction(NAMESPACE, error));
    yield put(
      showErrorNotification({
        messageId: 'testPlanLoadingFailed',
      }),
    );
  }
}

function* watchGetTestPlans() {
  yield takeLatest(GET_TEST_PLANS, getTestPlans);
}

export function* testPlanSagas() {
  yield all([watchGetTestPlans()]);
}
