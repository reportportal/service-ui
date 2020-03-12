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

import { takeLatest, takeEvery, call, all, put, select } from 'redux-saga/effects';
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { PROJECT_MANAGER } from 'common/constants/projectRoles';
import { ERROR_CODE_NOT_FOUND } from 'common/constants/apiErrorCodes';
import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';
import { userIdSelector, userInfoSelector } from './selectors';
import {
  ASSIGN_TO_RROJECT,
  UNASSIGN_FROM_PROJECT,
  SET_ACTIVE_PROJECT,
  GENERATE_API_TOKEN,
  FETCH_API_TOKEN,
  FETCH_USER,
} from './constants';
import {
  assignToProjectSuccessAction,
  assignToProjectErrorAction,
  unassignFromProjectSuccessAction,
  fetchApiTokenAction,
  setActiveProjectAction,
  generateApiTokenAction,
  setApiTokenAction,
  fetchUserSuccessAction,
  fetchUserErrorAction,
} from './actionCreators';

function* assignToProject({ payload: project }) {
  const userId = yield select(userIdSelector);
  const userRole = PROJECT_MANAGER;
  const data = {
    userNames: {
      [userId]: userRole,
    },
  };
  try {
    yield call(fetch, URLS.userInviteInternal(project.projectName), {
      method: 'put',
      data,
    });
    yield put(
      assignToProjectSuccessAction({
        projectName: project.projectName,
        projectRole: userRole,
        entryType: project.entryType,
      }),
    );
    yield put(
      showNotification({
        messageId: 'assignSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (err) {
    const error = err.message;
    yield put(
      assignToProjectErrorAction({
        projectName: project.projectName,
        projectRole: userRole,
        entryType: project.entryType,
      }),
    );
    yield put(
      showNotification({
        messageId: 'assignError',
        type: NOTIFICATION_TYPES.ERROR,
        values: { error },
      }),
    );
  }
}

function* unassignFromProject({ payload: project }) {
  const userId = yield select(userIdSelector);
  const data = {
    userNames: [userId],
  };
  try {
    yield call(fetch, URLS.userUnasign(project.projectName), {
      method: 'put',
      data,
    });
    yield put(unassignFromProjectSuccessAction(project));
    yield put(
      showNotification({
        messageId: 'unassignSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (err) {
    const error = err.message;
    yield put(
      showNotification({
        messageId: 'unassignError',
        type: NOTIFICATION_TYPES.ERROR,
        values: { error },
      }),
    );
  }
}

function* fetchUserWorker() {
  let user;
  try {
    user = yield call(fetch, URLS.user());
    yield put(fetchUserSuccessAction(user));
  } catch (err) {
    yield put(fetchUserErrorAction());
    return;
  }
  const userSettings = getStorageItem(`${user.userId}_settings`) || {};
  const savedActiveProject = userSettings.activeProject;
  const activeProject =
    savedActiveProject && savedActiveProject in user.assignedProjects
      ? savedActiveProject
      : Object.keys(user.assignedProjects)[0];
  yield put(fetchApiTokenAction());
  yield put(setActiveProjectAction(activeProject));
}

function* saveActiveProject({ payload: project }) {
  const user = yield select(userInfoSelector);
  const currentUserSettings = getStorageItem(`${user.userId}_settings`) || {};
  setStorageItem(`${user.userId}_settings`, { ...currentUserSettings, activeProject: project });
}

function* generateApiToken({ payload = {} }) {
  const { successMessage, errorMessage } = payload;
  try {
    const response = yield call(fetch, URLS.apiToken(), { method: 'post' });
    yield put(setApiTokenAction(response));
    if (successMessage) {
      yield put(
        showNotification({
          message: successMessage,
          type: NOTIFICATION_TYPES.SUCCESS,
        }),
      );
    }
  } catch (err) {
    if (errorMessage) {
      yield put(
        showNotification({
          message: errorMessage,
          type: NOTIFICATION_TYPES.ERROR,
        }),
      );
    }
  }
}

function* fetchApiToken() {
  try {
    const response = yield call(fetch, URLS.apiToken());
    yield put(setApiTokenAction(response));
  } catch ({ errorCode }) {
    if (errorCode === ERROR_CODE_NOT_FOUND) {
      yield put(generateApiTokenAction());
    }
  }
}

function* watchGenerateApiToken() {
  yield takeEvery(GENERATE_API_TOKEN, generateApiToken);
}

function* watchFetchApiToken() {
  yield takeEvery(FETCH_API_TOKEN, fetchApiToken);
}

function* watchSetActiveProject() {
  yield takeEvery(SET_ACTIVE_PROJECT, saveActiveProject);
}

function* watchFetchUser() {
  yield takeEvery(FETCH_USER, fetchUserWorker);
}

function* watchAssignToProject() {
  yield takeLatest(ASSIGN_TO_RROJECT, assignToProject);
}

function* watchUnassignFromProject() {
  yield takeLatest(UNASSIGN_FROM_PROJECT, unassignFromProject);
}

export function* userSagas() {
  yield all([
    watchAssignToProject(),
    watchUnassignFromProject(),
    watchFetchUser(),
    watchSetActiveProject(),
    watchGenerateApiToken(),
    watchFetchApiToken(),
  ]);
}
