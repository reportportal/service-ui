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

import { takeEvery, all, put, select, take } from 'redux-saga/effects';
import { createFetchPredicate, fetchDataAction } from 'controllers/fetch';
import { redirect } from 'redux-first-router';
import { PROJECTS_PAGE } from 'controllers/pages';
import { fetchOrganizationBySlugAction } from 'controllers/organizations/organization/actionCreators';
import { URLS } from 'common/urls';
import { showDefaultErrorNotification } from 'controllers/notification';
import { fetchOrganizationProjectsAction } from 'controllers/organizations/projects';
import { FETCH_ORGANIZATION_BY_SLUG, PREPARE_ACTIVE_ORGANIZATION_PROJECTS } from './constants';
import { activeOrganizationSelector } from './selectors';

function* fetchOrganizationBySlug({ payload: slug }) {
  try {
    yield put(fetchDataAction(FETCH_ORGANIZATION_BY_SLUG)(URLS.organizationList({ slug })));
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}
function* prepareActiveOrganizationProjects({ payload: { organizationSlug } }) {
  let activeOrganization = yield select(activeOrganizationSelector);
  try {
    if (!activeOrganization) {
      yield put(fetchOrganizationBySlugAction(organizationSlug));
      yield take(createFetchPredicate(FETCH_ORGANIZATION_BY_SLUG));
    }
    activeOrganization = yield select(activeOrganizationSelector);
    yield put(fetchOrganizationProjectsAction(activeOrganization.id));
  } catch (error) {
    yield put(
      redirect({
        type: PROJECTS_PAGE,
      }),
    );
  }
}

function* watchFetchOrganizationProjects() {
  yield takeEvery(PREPARE_ACTIVE_ORGANIZATION_PROJECTS, prepareActiveOrganizationProjects);
}
function* watchFetchOrganizationBySlug() {
  yield takeEvery(FETCH_ORGANIZATION_BY_SLUG, fetchOrganizationBySlug);
}

export function* organizationSagas() {
  yield all([watchFetchOrganizationProjects(), watchFetchOrganizationBySlug()]);
}
