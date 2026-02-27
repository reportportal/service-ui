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
import {
  NOTIFICATION_TYPES,
  showDefaultErrorNotification,
  showErrorNotification,
  showNotification,
  showSuccessNotification,
} from 'controllers/notification';
import { prepareQueryFilters } from 'components/filterEntities/utils';
import {
  CREATE_PROJECT,
  FETCH_ORGANIZATION_PROJECTS,
  ERROR_CODES,
  NAMESPACE,
  DELETE_PROJECT,
  FETCH_FILTERED_PROJECTS,
  RENAME_PROJECT,
  UNASSIGN_FROM_PROJECT,
} from './constants';
import { fetchOrganizationBySlugAction } from '..';
import { querySelector } from './selectors';
import { activeOrganizationIdSelector, activeOrganizationSelector } from '../selectors';
import { fetchOrganizationProjectsAction } from './actionCreators';

function* fetchFilteredProjects() {
  const activeOrganizationId = yield select(activeOrganizationIdSelector);
  const filtersParams = yield select(querySelector);
  const data = prepareQueryFilters(filtersParams);

  yield put(
    fetchDataAction(NAMESPACE)(URLS.organizationProjectsSearches(activeOrganizationId), {
      method: 'post',
      data,
    }),
  );
}

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
    if (ERROR_CODES.PROJECT_EXISTS.includes(err.errorCode)) {
      yield put(
        showNotification({
          messageId: 'projectExists',
          type: NOTIFICATION_TYPES.ERROR,
          values: { name: projectName },
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
    yield call(fetch, URLS.organizationProjectById({ organizationId, projectId }), {
      method: 'delete',
    });

    yield put(fetchOrganizationBySlugAction(organizationSlug));
    yield fetchFilteredProjects();
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

function* renameProject({ payload: { projectId, newProjectName } }) {
  const { id: organizationId } = yield select(activeOrganizationSelector);

  const renameOperation = {
    op: 'replace',
    path: '/name',
    value: newProjectName,
  };

  try {
    yield call(fetch, URLS.organizationProjectById({ organizationId, projectId }), {
      method: 'patch',
      data: [renameOperation],
    });

    yield fetchFilteredProjects();
    yield put(hideModalAction());
    yield put(showSuccessNotification({ messageId: 'updateProjectSuccess' }));
  } catch ({ errorCode, message }) {
    if (ERROR_CODES.PROJECT_EXISTS.includes(errorCode)) {
      yield put(
        showErrorNotification({
          messageId: 'projectExists',
          values: { name: newProjectName },
        }),
      );
    } else {
      yield put(showDefaultErrorNotification({ message }));
    }
  }
}

function* unassignFromProject({ payload = {} }) {
  const { user, project, onSuccess } = payload;
  const { projectId } = project;
  const { id: organizationId } = yield select(activeOrganizationSelector);

  const removeOperation = {
    op: 'remove',
    path: '/users',
    value: [{ id: user.id }],
  };

  try {
    yield call(fetch, URLS.organizationProjectById({ organizationId, projectId }), {
      method: 'patch',
      data: [removeOperation],
    });

    yield put(
      showSuccessNotification({
        messageId: 'unassignSuccess',
        values: { name: user.fullName },
      }),
    );

    onSuccess?.();
  } catch (_err) {
    yield put(showErrorNotification({ messageId: 'unassignProjectError' }));
  }
}

function* watchDeleteProject() {
  yield takeEvery(DELETE_PROJECT, deleteProject);
}

function* watchFetchFilteredProjects() {
  yield takeEvery(FETCH_FILTERED_PROJECTS, fetchFilteredProjects);
}

function* watchRenameProject() {
  yield takeEvery(RENAME_PROJECT, renameProject);
}

function* watchUnassignFromProject() {
  yield takeEvery(UNASSIGN_FROM_PROJECT, unassignFromProject);
}

export function* projectsSagas() {
  yield all([
    watchFetchProjects(),
    watchCreateProject(),
    watchDeleteProject(),
    watchFetchFilteredProjects(),
    watchRenameProject(),
    watchUnassignFromProject(),
  ]);
}
