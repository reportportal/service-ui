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

import {
  GET_MANUAL_LAUNCHES,
  MANUAL_LAUNCHES_NAMESPACE,
  defaultManualLaunchesQueryParams,
} from './constants';
import { Launch } from 'pages/inside/manualLaunchesPage/types';
import { GetManualLaunchesParams } from './actionCreators';
import { Page } from '../../types/common';
import { UrlsHelper } from 'pages/inside/manualLaunchesPage/types';

interface GetManualLaunchesAction extends Action<typeof GET_MANUAL_LAUNCHES> {
  payload?: GetManualLaunchesParams;
}

function* getManuallaunches(action: GetManualLaunchesAction): Generator {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;

    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: MANUAL_LAUNCHES_NAMESPACE },
    });

    const typedURLS = URLS as UrlsHelper;

    const params = action.payload
      ? {
          limit: action.payload.limit,
          offset: action.payload.offset,
        }
      : defaultManualLaunchesQueryParams;
    const data = (yield call(
      fetch,
      typedURLS.manualLaunchesListPagination(projectKey, params),
    )) as {
      content: Launch[];
      page: Page;
    };

    yield put(
      fetchSuccessAction(MANUAL_LAUNCHES_NAMESPACE, {
        data,
      }),
    );
  } catch (error) {
    yield put(fetchErrorAction(MANUAL_LAUNCHES_NAMESPACE, error));
    yield put(
      showErrorNotification({
        messageId: 'manualLaunchesLoadingFailed',
      }),
    );
  }
}

function* watchGetManualLaunches() {
  yield takeLatest(GET_MANUAL_LAUNCHES, getManuallaunches);
}

export function* manualLaunchesSagas() {
  yield all([watchGetManualLaunches()]);
}
