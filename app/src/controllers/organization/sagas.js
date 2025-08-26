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

import { takeEvery, all, put, select, take, call } from 'redux-saga/effects';
import { createFetchPredicate, fetchDataAction } from 'controllers/fetch';
import { redirect } from 'redux-first-router';
import { ORGANIZATIONS_PAGE } from 'controllers/pages';
import { URLS } from 'common/urls';
import {
  NOTIFICATION_TYPES,
  showDefaultErrorNotification,
  showNotification,
  showSuccessNotification,
} from 'controllers/notification';
import { fetchFilteredProjectAction, projectsSagas } from './projects';
import {
  CREATE_ORGANIZATION,
  ERROR_CODES,
  FETCH_ORGANIZATION_BY_SLUG,
  FETCH_ORGANIZATION_SETTINGS,
  PREPARE_ACTIVE_ORGANIZATION_PROJECTS,
  PREPARE_ACTIVE_ORGANIZATION_SETTINGS,
  UPDATE_ORGANIZATION_SETTINGS,
} from './constants';
import { activeOrganizationSelector } from './selectors';
import { usersSagas } from './users';
import { fetch } from 'common/utils';
import { updateOrganizationSettingsSuccessAction } from './actionCreators';
import { hideModalAction } from 'controllers/modal';
import { fetchFilteredOrganizationsAction } from 'controllers/instance/organizations';

function* fetchOrganizationBySlug({ payload: slug }) {
  try {
    yield put(fetchDataAction(FETCH_ORGANIZATION_BY_SLUG)(URLS.organizationList({ slug })));
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

export function* withActiveOrganization(organizationSlug, onActiveOrgReady) {
  let activeOrganization = yield select(activeOrganizationSelector);
  try {
    if (!activeOrganization || organizationSlug !== activeOrganization?.slug) {
      yield take(createFetchPredicate(FETCH_ORGANIZATION_BY_SLUG));
      activeOrganization = yield select(activeOrganizationSelector);
    }
    yield* onActiveOrgReady(activeOrganization.id);
  } catch {
    yield put(
      redirect({
        type: ORGANIZATIONS_PAGE,
      }),
    );
  }
}

function* prepareActiveOrganizationProjects({ payload: { organizationSlug } }) {
  yield* withActiveOrganization(organizationSlug, function* onActiveOrgReady(organizationId) {
    yield put(fetchFilteredProjectAction(organizationId));
  });
}

function* watchFetchOrganizationProjects() {
  yield takeEvery(PREPARE_ACTIVE_ORGANIZATION_PROJECTS, prepareActiveOrganizationProjects);
}

function* watchFetchOrganizationBySlug() {
  yield takeEvery(FETCH_ORGANIZATION_BY_SLUG, fetchOrganizationBySlug);
}

function* fetchOrganizationSettings({ payload: organizationId }) {
  yield put(
    fetchDataAction(FETCH_ORGANIZATION_SETTINGS)(URLS.organizationSettings(organizationId)),
  );
}

function* watchFetchOrganizationSettings() {
  yield takeEvery(FETCH_ORGANIZATION_SETTINGS, fetchOrganizationSettings);
}

function* prepareActiveOrganizationSettings({ payload: { organizationSlug } }) {
  yield* withActiveOrganization(organizationSlug, function* onActiveOrgReady(organizationId) {
    yield call(fetchOrganizationSettings, { payload: organizationId });
  });
}

function* updateOrganizationSettings({ payload: { organizationId, retentionPolicy } }) {
  try {
    yield call(fetch, URLS.organizationSettings(organizationId), {
      method: 'put',
      data: {
        retention_policy: retentionPolicy,
      },
    });
    yield put(updateOrganizationSettingsSuccessAction(retentionPolicy));
    yield put(showSuccessNotification({ messageId: 'updateOrganizationSettingsSuccess' }));
  } catch ({ message }) {
    yield put(showDefaultErrorNotification({ message }));
  }
}

function* watchPrepareActiveOrganizationSettings() {
  yield takeEvery(PREPARE_ACTIVE_ORGANIZATION_SETTINGS, prepareActiveOrganizationSettings);
}

function* watchUpdateOrganizationSettings() {
  yield takeEvery(UPDATE_ORGANIZATION_SETTINGS, updateOrganizationSettings);
}

function* createOrganization({ payload: { name, type } }) {
  try {
    yield call(fetch, URLS.organizationList(), {
      method: 'post',
      data: {
        name,
        type,
      },
    });
    yield put(hideModalAction());
    yield put(
      showNotification({
        messageId: 'createOrganizationSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
    yield put(fetchFilteredOrganizationsAction());
  } catch (err) {
    if (ERROR_CODES.ORGANIZATION_EXISTS.includes(err.errorCode)) {
      yield put(
        showNotification({
          messageId: 'organizationExists',
          type: NOTIFICATION_TYPES.ERROR,
          values: { name },
        }),
      );
    } else {
      yield put(
        showNotification({
          messageId: 'failureDefault',
          type: NOTIFICATION_TYPES.ERROR,
          values: { error: err.message },
        }),
      );
    }
  }
}

function* watchCreateOrganization() {
  yield takeEvery(CREATE_ORGANIZATION, createOrganization);
}

export function* organizationSagas() {
  yield all([
    watchFetchOrganizationProjects(),
    watchFetchOrganizationBySlug(),
    watchFetchOrganizationSettings(),
    watchPrepareActiveOrganizationSettings(),
    watchUpdateOrganizationSettings(),
    watchCreateOrganization(),
    projectsSagas(),
    usersSagas(),
  ]);
}
