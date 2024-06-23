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

import { all, select, put, takeEvery, take } from 'redux-saga/effects';
import { MONITORING, MEMBERS } from 'common/constants/projectSections';
import { PROJECTS_PAGE, projectSectionSelector } from 'controllers/pages';
import { projectKeySelector, fetchProjectAction } from 'controllers/project';
import { fetchMembersAction } from 'controllers/members';
import { setActiveProjectKeyAction } from 'controllers/user';
import {
  fetchOrganizationBySlugAction,
  fetchOrganizationProjectsAction,
  organizationProjectsSelector,
} from 'controllers/organizations/organization';
import { createFetchPredicate } from 'controllers/fetch';
import { redirect } from 'redux-first-router';
import {
  FETCH_ORGANIZATION_BY_SLUG,
  FETCH_ORGANIZATION_PROJECTS,
} from 'controllers/organizations/organization/constants';
import { SIZE_KEY } from 'controllers/pagination';
import { fetchDashboardsAction } from 'controllers/dashboard';
import { FETCH_PROJECT_DATA, FETCH_ACTIVE_PROJECT_DATA } from './constants';
import { projectsSagas } from './projects';
import { allUsersSagas } from './allUsers';
import { eventsSagas, fetchEventsAction } from './events';

const pageDataActions = {
  [MONITORING]: fetchEventsAction,
  [MEMBERS]: fetchMembersAction,
};
function* fetchProjectData() {
  const section = yield select(projectSectionSelector);
  const sectionDataAction = pageDataActions[section] || fetchProjectAction;
  const projectKey = yield select(projectKeySelector);
  const isAdminAccess = true;

  yield put(sectionDataAction(projectKey, isAdminAccess));
}

function* fetchActiveProjectData({ payload: { organizationSlug, projectSlug, projectKey } }) {
  try {
    yield put(fetchOrganizationBySlugAction(organizationSlug));

    if (projectKey) {
      yield put(setActiveProjectKeyAction(projectKey));
      yield put(fetchProjectAction(projectKey));
    } else {
      yield take(createFetchPredicate(FETCH_ORGANIZATION_BY_SLUG));
      yield put(fetchOrganizationProjectsAction(organizationSlug));
      yield take(createFetchPredicate(FETCH_ORGANIZATION_PROJECTS));

      const organizationProjects = yield select(organizationProjectsSelector);
      const key = organizationProjects?.items?.find(({ slug }) => slug === projectSlug)?.key;

      yield put(setActiveProjectKeyAction(key));
      yield put(fetchProjectAction(key));
      yield put(
        fetchDashboardsAction({
          [SIZE_KEY]: 300,
        }),
      );
    }
  } catch (error) {
    yield put(
      redirect({
        type: PROJECTS_PAGE,
      }),
    );
  }
}

function* watchFetchProjectData() {
  yield takeEvery(FETCH_PROJECT_DATA, fetchProjectData);
}

function* watchFetchActiveProjectData() {
  yield takeEvery(FETCH_ACTIVE_PROJECT_DATA, fetchActiveProjectData);
}

export function* administrateSagas() {
  yield all([
    eventsSagas(),
    watchFetchProjectData(),
    watchFetchActiveProjectData(),
    allUsersSagas(),
    projectsSagas(),
  ]);
}
