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
import { all, put, select, takeEvery, call } from 'redux-saga/effects';
import { querySelector } from './selectors';
import { fetchOrganizationUsersAction } from './actionCreators';
import { withActiveOrganization } from '../sagas';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import { fetch } from 'common/utils';
import {
  FETCH_ORGANIZATION_USERS,
  NAMESPACE,
  PREPARE_ACTIVE_ORGANIZATION_USERS,
  UNASSIGN_FROM_ORGANIZATION,
} from './constants';

function* fetchOrganizationUsers({ payload: organizationId }) {
  const query = yield select(querySelector);

  yield put(fetchDataAction(NAMESPACE)(URLS.organizationUsers(organizationId, { ...query })));
}

function* unassignFromOrganization({ payload = {} }) {
  const { user, organization, onSuccess } = payload;
  const { id: userId, fullName } = user;
  const { id: organizationId } = organization;

  try {
    yield call(fetch, URLS.organizationUserById({ organizationId, userId }), {
      method: 'delete',
    });

    yield put(
      showSuccessNotification({
        messageId: 'unassignSuccess',
        values: { name: fullName },
      }),
    );

    onSuccess?.();
  } catch (_err) {
    yield put(showErrorNotification({ messageId: 'unassignOrganizationError' }));
  }
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

function* watchUnassignFromOrganization() {
  yield takeEvery(UNASSIGN_FROM_ORGANIZATION, unassignFromOrganization);
}

export function* usersSagas() {
  yield all([watchFetchUsers(), watchFetchOrganizationUsers(), watchUnassignFromOrganization()]);
}
