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
import { URLS } from 'common/urls';
import { showDefaultErrorNotification } from 'controllers/notification';
import { createFetchPredicate, fetchDataAction } from 'controllers/fetch';
import { organizationsListSelector } from 'controllers/organizations/selectors';
import { fetchOrganizationsAction } from 'controllers/organizations/actionCreators';
import { redirect } from 'redux-first-router';
import { PROJECTS_PAGE } from 'controllers/pages';
import {
  FETCH_ORGANIZATIONS,
  FETCH_ORGANIZATION_PROJECTS,
  NAMESPACE,
  ACTIVE_ORGANIZATION_NAMESPACE,
} from './constants';

function* fetchOrganizations() {
  try {
    yield put(fetchDataAction(NAMESPACE)(URLS.organizationList()));
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* fetchOrganizationProjects({ payload: { organizationSlug } }) {
  yield put(fetchOrganizationsAction());
  yield take(createFetchPredicate(NAMESPACE));
  const organizations = yield select(organizationsListSelector);
  try {
    const orgsId = organizations.find((org) => org.slug === organizationSlug)?.id;
    // TODO: Uncomment this line after implementation of the organizationProjects in backend
    // yield put(fetchDataAction(PROJECTS_NAMESPACE)(URLS.organizationProjects(orgsId)));

    yield put(fetchDataAction(ACTIVE_ORGANIZATION_NAMESPACE)(URLS.organizationById(orgsId)));
    yield take(createFetchPredicate(ACTIVE_ORGANIZATION_NAMESPACE));

    if (!orgsId) {
      throw new Error('Organization not found');
    }
  } catch (error) {
    yield put(
      redirect({
        type: PROJECTS_PAGE,
      }),
    );
  }
}

function* watchFetchOrganizations() {
  yield takeEvery(FETCH_ORGANIZATIONS, fetchOrganizations);
}

function* watchFetchOrganizationProjects() {
  yield takeEvery(FETCH_ORGANIZATION_PROJECTS, fetchOrganizationProjects);
}

export function* organizationsSagas() {
  yield all([watchFetchOrganizations(), watchFetchOrganizationProjects()]);
}
