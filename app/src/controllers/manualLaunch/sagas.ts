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
import { locationSelector, MANUAL_LAUNCHES_PAGE } from 'controllers/pages';
import { LocationInfo } from 'controllers/pages/typed-selectors';
import { Launch } from 'pages/inside/manualLaunchesPage/types';
import { UrlsHelper } from 'pages/inside/manualLaunchesPage/types';

import {
  GET_MANUAL_LAUNCHES,
  GET_MANUAL_LAUNCH,
  MANUAL_LAUNCHES_NAMESPACE,
  ACTIVE_MANUAL_LAUNCH_NAMESPACE,
  defaultManualLaunchesQueryParams,
} from './constants';
import { GetManualLaunchesParams, GetManualLaunchParams } from './actionCreators';
import { Page } from '../../types/common';
import { manualLaunchContentSelector } from './selectors';

interface GetManualLaunchesAction extends Action<typeof GET_MANUAL_LAUNCHES> {
  payload?: GetManualLaunchesParams;
}

function* getManualLaunches(action: GetManualLaunchesAction): Generator {
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

interface GetManualLaunchAction extends Action<typeof GET_MANUAL_LAUNCH> {
  payload: GetManualLaunchParams;
}

function* getManualLaunch(action: GetManualLaunchAction): Generator {
  const projectKey = (yield select(projectKeySelector)) as string;
  const location = (yield select(locationSelector)) as LocationInfo;

  const { launchId } = action.payload;

  try {
    const prevLaunchId = location?.prev?.payload?.launchId;
    const currentLaunchId = location?.payload?.launchId;

    if (!prevLaunchId || String(prevLaunchId) !== String(currentLaunchId)) {
      const fetchedLaunches = (yield select(manualLaunchContentSelector)) as Launch[] | null;
      const launchFromList = fetchedLaunches?.find((launch) => launch.id === Number(launchId));

      if (launchFromList) {
        yield put(fetchSuccessAction(ACTIVE_MANUAL_LAUNCH_NAMESPACE, launchFromList));
      } else {
        yield put({
          type: FETCH_START,
          payload: { projectKey },
          meta: { namespace: ACTIVE_MANUAL_LAUNCH_NAMESPACE },
        });

        const data = (yield call(fetch, URLS.manualLaunchById(projectKey, launchId))) as Launch;

        yield put(fetchSuccessAction(ACTIVE_MANUAL_LAUNCH_NAMESPACE, data));
      }
    }
  } catch (error) {
    yield put(fetchErrorAction(ACTIVE_MANUAL_LAUNCH_NAMESPACE, error, true));
    yield put(
      showNotification({
        messageId: 'manualLaunchRedirectWarningMessage',
        type: NOTIFICATION_TYPES.WARNING,
        typographyColor: NOTIFICATION_TYPOGRAPHY_COLOR_TYPES.BLACK,
        duration: WARNING_NOTIFICATION_DURATION,
      }),
    );

    yield put({
      type: MANUAL_LAUNCHES_PAGE,
      payload: {
        organizationSlug: location.payload.organizationSlug,
        projectSlug: location.payload.projectSlug,
      },
    });
  }
}

function* watchGetManualLaunches() {
  yield takeLatest(GET_MANUAL_LAUNCHES, getManualLaunches);
}

function* watchGetManualLaunch() {
  yield takeLatest(GET_MANUAL_LAUNCH, getManualLaunch);
}

export function* manualLaunchesSagas() {
  yield all([watchGetManualLaunches(), watchGetManualLaunch()]);
}
