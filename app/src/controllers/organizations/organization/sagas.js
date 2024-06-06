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
import { createFetchPredicate } from 'controllers/fetch';
import { redirect } from 'redux-first-router';
import { PROJECTS_PAGE } from 'controllers/pages';
import { setActiveOrganizationAction } from 'controllers/organizations/organization/actionCreators';
import { organizationsListSelector } from '../selectors';
import { fetchOrganizationsAction } from '../actionCreators';
import { FETCH_ORGANIZATION_PROJECTS } from './constants';
import { activeOrganizationSelector } from './selectors';
import { NAMESPACE } from '../constants';

function* fetchOrganizationProjects({ payload: { organizationSlug } }) {
  yield put(fetchOrganizationsAction());
  yield take(createFetchPredicate(NAMESPACE));
  const organizations = yield select(organizationsListSelector);
  const activeOrganization = yield select(activeOrganizationSelector);
  try {
    if (!activeOrganization) {
      const organization = organizations.find((org) => org.slug === organizationSlug);
      if (!organization) {
        throw new Error('Organization not found');
      }
      yield put(setActiveOrganizationAction(organization));
    }

    // TODO: Uncomment this line after implementation of the organizationProjects in backend
    // yield put(fetchDataAction(PROJECTS_NAMESPACE)(URLS.organizationProjects(orgsSlug)));
  } catch (error) {
    yield put(
      redirect({
        type: PROJECTS_PAGE,
      }),
    );
  }
}

function* watchFetchOrganizationProjects() {
  yield takeEvery(FETCH_ORGANIZATION_PROJECTS, fetchOrganizationProjects);
}

export function* organizationSagas() {
  yield all([watchFetchOrganizationProjects()]);
}
