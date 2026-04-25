/*
 * Copyright 2026 EPAM Systems
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

import { takeLatest, call, select, all, put } from 'redux-saga/effects';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { fetchSuccessAction, fetchErrorAction } from 'controllers/fetch';
import { FETCH_START } from 'controllers/fetch/constants';
import { showErrorNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';

import {
  GET_MILESTONES,
  MILESTONES_NAMESPACE,
  TmsMilestonePageRS,
  defaultMilestoneQueryParams,
} from './constants';
import type { GetMilestonesAction } from './types';

function* getMilestones(action: GetMilestonesAction): Generator {
  try {
    const projectKey = (yield select(projectKeySelector)) as string;

    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: MILESTONES_NAMESPACE },
    });

    const params = action.payload
      ? {
          limit: action.payload.limit,
          offset: action.payload.offset,
          sort: defaultMilestoneQueryParams.sort,
        }
      : defaultMilestoneQueryParams;

    const data = (yield call(fetch, URLS.tmsMilestone(projectKey, params))) as TmsMilestonePageRS;

    yield put(
      fetchSuccessAction(MILESTONES_NAMESPACE, {
        data,
      }),
    );
  } catch (error) {
    yield put(fetchErrorAction(MILESTONES_NAMESPACE, error));
    yield put(
      showErrorNotification({
        messageId: 'milestoneLoadingFailed',
      }),
    );
  }
}

function* watchGetMilestones() {
  yield takeLatest(GET_MILESTONES, getMilestones);
}

export function* milestoneSagas() {
  yield all([watchGetMilestones()]);
}
