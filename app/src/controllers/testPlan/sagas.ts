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
import {
  showNotification,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPOGRAPHY_COLOR_TYPES,
  WARNING_NOTIFICATION_DURATION,
  showErrorNotification,
} from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import { locationSelector, PROJECT_TEST_PLANS_PAGE } from 'controllers/pages';
import { LocationInfo } from 'controllers/pages/typed-selectors';

import {
  GET_TEST_PLANS,
  GET_TEST_PLAN,
  TEST_PLANS_NAMESPACE,
  TestPlanDto,
  TestPlanFoldersDto,
  TestPlanTestCaseDto,
  defaultQueryParams,
  ACTIVE_TEST_PLAN_NAMESPACE,
  TEST_PLAN_FOLDERS_NAMESPACE,
  TEST_PLAN_TEST_CASES_NAMESPACE,
  defaultTestPlanTestCasesQueryParams,
} from './constants';
import { GetTestPlansParams, GetTestPlanParams } from './actionCreators';
import { Page } from '../../types/common';

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

    const params = action.payload
      ? {
        limit: action.payload.limit,
        offset: action.payload.offset,
        sortBy: defaultQueryParams.sortBy,
      }
      : defaultQueryParams;
    const data = (yield call(fetch, URLS.testPlan(projectKey, params))) as {
      content: TestPlanDto[];
      page: Page;
    };

    yield put(
      fetchSuccessAction(TEST_PLANS_NAMESPACE, {
        data,
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
  const projectKey = (yield select(projectKeySelector)) as string;
  const location = (yield select(locationSelector)) as LocationInfo;
  const { testPlanId, offset, limit } = action.payload;
  const params = {
    limit: limit || defaultTestPlanTestCasesQueryParams.limit,
    offset: offset || defaultTestPlanTestCasesQueryParams.offset,
  };

  try {
    if (
      String(location?.prev?.payload?.testPlanId) !== String(location?.payload?.testPlanId)
    ) {
      yield put({
        type: FETCH_START,
        payload: { projectKey },
        meta: { namespace: ACTIVE_TEST_PLAN_NAMESPACE },
      });

      const data = (yield call(fetch, URLS.testPlanById(projectKey, testPlanId))) as TestPlanDto;
      const planFolders = (yield call(
        fetch,
        URLS.testFolders(projectKey, { 'filter.eq.testPlanId': testPlanId }),
      )) as TestPlanFoldersDto;

      yield put(fetchSuccessAction(ACTIVE_TEST_PLAN_NAMESPACE, data));
      yield put(fetchSuccessAction(TEST_PLAN_FOLDERS_NAMESPACE, planFolders));
    }
  } catch (error) {
    yield put(fetchErrorAction(ACTIVE_TEST_PLAN_NAMESPACE, error, true));
    yield put(
      showNotification({
        messageId: 'testPlanRedirectWarningMessage',
        type: NOTIFICATION_TYPES.WARNING,
        typographyColor: NOTIFICATION_TYPOGRAPHY_COLOR_TYPES.BLACK,
        duration: WARNING_NOTIFICATION_DURATION,
      }),
    );
    yield put({
      type: PROJECT_TEST_PLANS_PAGE,
      payload: location.payload,
    });

    return;
  }

  try {
    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: TEST_PLAN_TEST_CASES_NAMESPACE },
    });

    let planTestCases: TestPlanTestCaseDto;

    if (!action.payload.folderId) {
      planTestCases = (yield call(
        fetch,
        URLS.testPlanTestCases(projectKey, testPlanId, params),
      )) as TestPlanTestCaseDto;
    } else {
      planTestCases = (yield call(
        fetch,
        URLS.testPlanTestCases(projectKey, testPlanId, { 'testFolderId': action.payload.folderId, ...params })
      )) as TestPlanTestCaseDto;
    }

    yield put(fetchSuccessAction(TEST_PLAN_TEST_CASES_NAMESPACE, planTestCases));
  } catch (error) {
    yield put(fetchErrorAction(TEST_PLAN_TEST_CASES_NAMESPACE, error));
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
