/*
 * Copyright 2019 EPAM Systems
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

import { takeEvery, takeLatest, race, take, all, put, select, call } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import {
  assignedProjectsSelector,
  ASSIGN_TO_RROJECT,
  ASSIGN_TO_RROJECT_SUCCESS,
  ASSIGN_TO_RROJECT_ERROR,
  assignToProjectSuccessAction,
} from 'controllers/user';
import { PROJECT_TYPE_INTERNAL } from 'common/constants/projectsObjectTypes';
import { SETTINGS } from 'common/constants/projectSections';
import { fetch, getStorageItem, setStorageItem } from 'common/utils';
import { PROJECT_PAGE } from 'controllers/pages';
import { confirmSaga, hideModalAction } from 'controllers/modal';
import { PROJECT_MANAGER } from 'common/constants/projectRoles';
import {
  NAMESPACE,
  FETCH_PROJECTS,
  START_SET_VIEW_MODE,
  USER_VIEW,
  GRID_VIEW,
  SET_PROJECTS_VIEW_MODE,
  ADD_PROJECT,
  DELETE_PROJECT,
  NAVIGATE_TO_PROJECT,
  ERROR_CODES,
} from './constants';
import { navigateToProjectSectionAction } from './actionCreators';
import { querySelector } from './selectors';

function* fetchProjects() {
  const query = yield select(querySelector);
  yield put(
    fetchDataAction(NAMESPACE)(URLS.projects(), {
      params: { ...query },
    }),
  );
}

function* watchFetchProjects() {
  yield takeEvery(FETCH_PROJECTS, fetchProjects);
}

function* setViewMode(action) {
  const userView = getStorageItem(USER_VIEW) || GRID_VIEW;
  const viewMode = action.payload.viewMode || userView;

  setStorageItem(USER_VIEW, viewMode);

  yield put({ type: SET_PROJECTS_VIEW_MODE, payload: viewMode });
}
function* watchSetViewMode() {
  yield takeEvery(START_SET_VIEW_MODE, setViewMode);
}

function* addProject({ payload: projectName }) {
  try {
    yield call(fetch, URLS.addProject(), {
      method: 'post',
      data: {
        entryType: PROJECT_TYPE_INTERNAL,
        projectName,
      },
    });
    const projectInfo = {
      projectName,
      projectRole: PROJECT_MANAGER,
      entryType: PROJECT_TYPE_INTERNAL,
    };
    yield put(assignToProjectSuccessAction(projectInfo));
    yield put(hideModalAction());
    yield put(
      showNotification({
        messageId: 'addProjectSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
        values: { name: projectName },
      }),
    );
    yield put(navigateToProjectSectionAction(projectName, SETTINGS));
  } catch (err) {
    if (err.errorCode === ERROR_CODES.PROJECT_EXISTS) {
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

function* watchAddProject() {
  yield takeEvery(ADD_PROJECT, addProject);
}

function* deleteProject({ payload: project }) {
  try {
    yield call(fetch, URLS.project(project.id), {
      method: 'delete',
    });
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
  yield put({ type: FETCH_PROJECTS });
}

function* watchDeleteProject() {
  yield takeLatest(DELETE_PROJECT, deleteProject);
}

function* navigateToProject({ payload }) {
  const { project, confirmModalOptions } = payload;
  const assignedProjects = yield select(assignedProjectsSelector);
  let isAssigned = !!assignedProjects[project.projectName];
  if (!isAssigned) {
    const isConfirmed = yield call(confirmSaga, confirmModalOptions);
    if (isConfirmed) {
      yield put({ type: ASSIGN_TO_RROJECT, payload: project });
      const assignResult = yield race({
        isAssigned: take(ASSIGN_TO_RROJECT_SUCCESS),
        noAssigned: take(ASSIGN_TO_RROJECT_ERROR),
      });
      isAssigned = !!assignResult.isAssigned;
    }
  }
  if (isAssigned) {
    yield put({
      type: PROJECT_PAGE,
      payload: { projectId: project.projectName },
    });
  }
}

function* watchNavigateToProject() {
  yield takeEvery(NAVIGATE_TO_PROJECT, navigateToProject);
}

export function* projectsSagas() {
  yield all([
    watchFetchProjects(),
    watchSetViewMode(),
    watchAddProject(),
    watchDeleteProject(),
    watchNavigateToProject(),
  ]);
}
