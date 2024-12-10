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

import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { hideModalAction } from 'controllers/modal';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { updateFormatDate } from 'components/filterEntities/utils';
import {
  CREATE_PROJECT,
  FETCH_ORGANIZATION_PROJECTS,
  ERROR_CODES,
  NAMESPACE,
  DELETE_PROJECT,
  FETCH_FILTERED_PROJECTS,
} from './constants';
import { fetchOrganizationBySlugAction } from '..';
import { filterQuerySelector, querySelector } from './selectors';
import { activeOrganizationIdSelector, activeOrganizationSelector } from '../selectors';
import { fetchOrganizationProjectsAction } from './actionCreators';

function* fetchOrganizationProjects({ payload: organizationId }) {
  const query = yield select(querySelector);

  yield put(fetchDataAction(NAMESPACE)(URLS.organizationProjects(organizationId, { ...query })));
}

function* watchFetchProjects() {
  yield takeEvery(FETCH_ORGANIZATION_PROJECTS, fetchOrganizationProjects);
}

function* createProject({ payload: { newProjectName: projectName } }) {
  const { id: organizationId, slug: organizationSlug } = yield select(activeOrganizationSelector);
  try {
    yield call(fetch, URLS.organizationProjects(organizationId), {
      method: 'post',
      data: {
        name: projectName,
      },
    });
    yield put(fetchOrganizationBySlugAction(organizationSlug));
    yield put(fetchOrganizationProjectsAction(organizationId));
    yield put(hideModalAction());
    yield put(
      showNotification({
        messageId: 'addProjectSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
        values: { name: projectName },
      }),
    );
  } catch (err) {
    if (err.errorCode === ERROR_CODES.PROJECT_EXISTS) {
      yield put(
        showNotification({
          messageId: 'projectExists',
          type: NOTIFICATION_TYPES.ERROR,
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

function* watchCreateProject() {
  yield takeEvery(CREATE_PROJECT, createProject);
}

function* deleteProject({ payload: { projectId, projectName } }) {
  const { id: organizationId, slug: organizationSlug } = yield select(activeOrganizationSelector);
  try {
    yield call(fetch, URLS.projectDelete({ organizationId, projectId }), {
      method: 'delete',
    });
    yield put(fetchOrganizationBySlugAction(organizationSlug));
    yield put(fetchOrganizationProjectsAction(organizationId));
    yield put(hideModalAction());
    yield put(
      showNotification({
        messageId: 'deleteProjectSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
        values: { name: projectName },
      }),
    );
  } catch (err) {
    const error = err.message;
    yield put(
      showNotification({
        messageId: 'deleteError',
        type: NOTIFICATION_TYPES.ERROR,
        values: { error },
      }),
    );
  }
}

function* watchDeleteProject() {
  yield takeEvery(DELETE_PROJECT, deleteProject);
}

function* fetchFilteredProjects() {
  const activeOrganizationId = yield select(activeOrganizationIdSelector);
  const filtersParams = yield select(filterQuerySelector);
  updateFormatDate(filtersParams);

  yield put(
    fetchDataAction(NAMESPACE)(URLS.organizationProjectsSearches(activeOrganizationId), {
      method: 'post',
      data: filtersParams,
    }),
  );
}

function* watchFetchFilteredProjects() {
  yield takeEvery(FETCH_FILTERED_PROJECTS, fetchFilteredProjects);
}

export function* projectsSagas() {
  yield all([
    watchFetchProjects(),
    watchCreateProject(),
    watchDeleteProject(),
    watchFetchFilteredProjects(),
  ]);
}
