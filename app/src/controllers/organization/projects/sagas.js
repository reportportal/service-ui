/*
 * Copyright 2026 EPAM Systems
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
import { EDITOR, MEMBER } from 'common/constants/projectRoles';
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
  SELF_ASSIGN_TO_PROJECT,
  CHANGE_PROJECT_ROLE,
} from './constants';
import { fetchOrganizationBySlugAction } from '..';
import { querySelector } from './selectors';
import { activeOrganizationIdSelector, activeOrganizationSelector } from '../selectors';
import { fetchOrganizationProjectsAction } from './actionCreators';
import { fetchUserInfoAction, idSelector, assignedOrganizationsSelector } from 'controllers/user';

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

function* selfAssignToProject({ payload = {} }) {
  const { projectId, onSuccess } = payload;
  const activeOrganizationId = yield select(activeOrganizationIdSelector);
  const currentUserId = yield select(idSelector);
  const assignedOrganizations = yield select(assignedOrganizationsSelector);

  const matchedOrg = Object.values(assignedOrganizations).find(
    (org) => org.organizationId === activeOrganizationId,
  );
  const isAlreadyInOrg = !!matchedOrg;

  const projectAssignment = { id: projectId, project_role: EDITOR };

  try {
    if (isAlreadyInOrg) {
      const userAssignments = yield call(
        fetch,
        URLS.organizationUserProjects(activeOrganizationId, currentUserId),
      );

      const existingProjects = (userAssignments?.items || []).map((p) => ({
        id: p.id,
        project_role: p.project_role,
      }));

      const finalProjects = [
        ...existingProjects.filter((p) => p.id !== projectId),
        projectAssignment,
      ];

      yield call(
        fetch,
        URLS.organizationUserById({ organizationId: activeOrganizationId, userId: currentUserId }),
        {
          method: 'put',
          data: { org_role: matchedOrg.organizationRole, projects: finalProjects },
        },
      );
    } else {
      yield call(fetch, URLS.organizationUsers(activeOrganizationId), {
        method: 'post',
        data: { id: currentUserId, org_role: MEMBER, projects: [projectAssignment] },
      });
    }

    yield put(fetchUserInfoAction());
    yield put(hideModalAction());
    yield put(showSuccessNotification({ messageId: 'assignToProjectSuccess' }));
    onSuccess?.();
  } catch {
    yield put(showErrorNotification({ messageId: 'assignToProjectError' }));
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

function* changeProjectRole({ payload = {} }) {
  const { user, projectKey, newProjectRole, onSuccess } = payload;
  const login = user?.userId;

  if (!login || !projectKey || !newProjectRole) {
    yield put(showErrorNotification({ messageId: 'changeProjectRoleError' }));
    return;
  }

  try {
    yield call(fetch, URLS.projectByName(projectKey), {
      method: 'put',
      data: { users: { [login]: newProjectRole } },
    });

    yield put(
      showSuccessNotification({
        messageId: 'changeProjectRoleSuccess',
        values: { name: user.fullName },
      }),
    );

    onSuccess?.();
  } catch {
    yield put(showErrorNotification({ messageId: 'changeProjectRoleError' }));
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

function* watchSelfAssignToProject() {
  yield takeEvery(SELF_ASSIGN_TO_PROJECT, selfAssignToProject);
}

function* watchChangeProjectRole() {
  yield takeEvery(CHANGE_PROJECT_ROLE, changeProjectRole);
}

export function* projectsSagas() {
  yield all([
    watchFetchProjects(),
    watchCreateProject(),
    watchDeleteProject(),
    watchFetchFilteredProjects(),
    watchRenameProject(),
    watchUnassignFromProject(),
    watchSelfAssignToProject(),
    watchChangeProjectRole(),
  ]);
}
