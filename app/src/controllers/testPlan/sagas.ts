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
import { BaseAppState } from 'types/store';
import { showErrorNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import { PROJECT_TEST_PLANS_PAGE } from 'controllers/pages';

import {
  GET_TEST_PLANS,
  GET_TEST_PLAN,
  TEST_PLANS_NAMESPACE,
  TestPlanDto,
  defaultQueryParams,
  ACTIVE_TEST_PLAN_NAMESPACE,
} from './constants';
import { GetTestPlansParams, GetTestPlanParams } from './actionCreators';

interface GetTestPlansAction extends Action<typeof GET_TEST_PLANS> {
  payload?: GetTestPlansParams;
}

interface GetTestPlanAction extends Action<typeof GET_TEST_PLAN> {
  payload: GetTestPlanParams;
}

function* getTestPlans(action: GetTestPlansAction): Generator {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;

    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: TEST_PLANS_NAMESPACE },
    });

    const params = action.payload ?? defaultQueryParams;
    const data = (yield call(fetch, URLS.testPlan(projectKey, params))) as {
      content: TestPlanDto[];
    };

    yield put(
      fetchSuccessAction(TEST_PLANS_NAMESPACE, {
        content: data.content,
      }),
    );
  } catch (error) {
    yield put(fetchErrorAction(TEST_PLANS_NAMESPACE, error));
    yield put(
      showErrorNotification({
        messageId: 'testPlanLoadingFailed',
      }),
    );
  }
}

function* getTestPlan(action: GetTestPlanAction): Generator {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const { testPlanId } = action.payload;

    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: ACTIVE_TEST_PLAN_NAMESPACE },
    });

    const data = (yield call(fetch, URLS.testPlanById(projectKey, testPlanId))) as TestPlanDto;

    yield put(fetchSuccessAction(ACTIVE_TEST_PLAN_NAMESPACE, data));
  } catch (error) {
    const locationPayload = (yield select(
      (state: BaseAppState) => state.location?.payload,
    )) as BaseAppState['location']['payload'];

    yield put(fetchErrorAction(ACTIVE_TEST_PLAN_NAMESPACE, error));
    yield put({
      type: PROJECT_TEST_PLANS_PAGE,
      payload: locationPayload,
    });
  }
}

function* watchGetTestPlans() {
  yield takeLatest(GET_TEST_PLANS, getTestPlans);
}

function* watchGetTestPlan() {
  yield takeLatest(GET_TEST_PLAN, getTestPlan);
}

export function* testPlanSagas() {
  yield all([watchGetTestPlans(), watchGetTestPlan()]);
}
