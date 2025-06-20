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

import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import { all, put, select, takeEvery } from 'redux-saga/effects';
import { querySelector } from './selectors';
import { fetchOrganizationUsersAction } from './actionCreators';
import { withActiveOrganization } from '../sagas';
import {
  FETCH_ORGANIZATION_USERS,
  NAMESPACE,
  PREPARE_ACTIVE_ORGANIZATION_USERS,
} from './constants';

function* fetchOrganizationUsers({ payload: organizationId }) {
  const query = yield select(querySelector);

  yield put(fetchDataAction(NAMESPACE)(URLS.organizationUsers(organizationId, { ...query })));
}

function* watchFetchUsers() {
  yield takeEvery(FETCH_ORGANIZATION_USERS, fetchOrganizationUsers);
}

function* prepareActiveOrganizationUsers({ payload: { organizationSlug } }) {
  yield* withActiveOrganization(organizationSlug, function* onActiveOrgReady(organizationId) {
    yield put(fetchOrganizationUsersAction(organizationId));
  });
}

function* watchFetchOrganizationUsers() {
  yield takeEvery(PREPARE_ACTIVE_ORGANIZATION_USERS, prepareActiveOrganizationUsers);
}

export function* usersSagas() {
  yield all([watchFetchUsers(), watchFetchOrganizationUsers()]);
}
