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
import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';
import { userIdSelector, userInfoSelector } from './selectors';
import {
  ASSIGN_TO_RROJECT,
  UNASSIGN_FROM_PROJECT,
  SET_ACTIVE_PROJECT,
  ADD_API_KEY,
  FETCH_API_KEYS,
  DELETE_API_KEYS,
  FETCH_USER,
} from './constants';
import {
  assignToProjectSuccessAction,
  assignToProjectErrorAction,
  unassignFromProjectSuccessAction,
  setActiveProjectAction,
  fetchUserSuccessAction,
  fetchUserErrorAction,
  setApiKeysAction,
  fetchApiKeysAction,
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
  yield put(fetchApiKeysAction());
  yield put(setActiveProjectAction(activeProject));
}

function* saveActiveProject({ payload: project }) {
  const user = yield select(userInfoSelector);
  const currentUserSettings = getStorageItem(`${user.userId}_settings`) || {};
  setStorageItem(`${user.userId}_settings`, { ...currentUserSettings, activeProject: project });
}

function* addApiKey({ payload = {} }) {
  const { name, successMessage, errorMessage, onSuccess } = payload;
  const user = yield select(userInfoSelector);
  try {
    const response = yield call(fetch, URLS.apiKeys(user.userId), {
      method: 'post',
      data: {
        name,
      },
    });
    // todo check token
    onSuccess(response.token);
    if (successMessage) {
      yield put(
        showNotification({
          message: successMessage,
          type: NOTIFICATION_TYPES.SUCCESS,
        }),
      );
    }
    // todo check update state
    yield put(fetchApiKeysAction());
  } catch ({ message }) {
    const showingMessage = errorMessage || message;
    if (errorMessage) {
      yield put(
        showNotification({
          message: showingMessage,
          type: NOTIFICATION_TYPES.ERROR,
        }),
      );
    }
  }
}

function* fetchApiKeys() {
  const user = yield select(userInfoSelector);
  try {
    const response = yield call(fetch, URLS.apiKeys(user.userId));
    yield put(setApiKeysAction(response));
  } catch ({ message }) {
    yield put(
      showNotification({
        messageId: 'fetchApiKeysError',
        type: NOTIFICATION_TYPES.ERROR,
        values: { message },
      }),
    );
  }
}

function* deleteApiKeys({ payload = {} }) {
  const { apiKeyId, successMessage, errorMessage, onSuccess } = payload;
  const user = yield select(userInfoSelector);

  try {
    yield call(fetch, URLS.deleteApiKeys(user.userId, apiKeyId), {
      method: 'delete',
    });
    onSuccess();
    if (successMessage) {
      yield put(
        showNotification({
          message: successMessage,
          type: NOTIFICATION_TYPES.SUCCESS,
        }),
      );
    }
    // todo check update state
    yield put(fetchApiKeysAction());
  } catch ({ message }) {
    const showingMessage = errorMessage || message;
    if (errorMessage) {
      yield put(
        showNotification({
          message: showingMessage,
          type: NOTIFICATION_TYPES.ERROR,
        }),
      );
    }
  }
}

function* watchAddApiKey() {
  yield takeEvery(ADD_API_KEY, addApiKey);
}

function* watchFetchApiKeys() {
  yield takeEvery(FETCH_API_KEYS, fetchApiKeys);
}

function* watchDeleteApiKeys() {
  yield takeEvery(DELETE_API_KEYS, deleteApiKeys);
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
    watchAddApiKey(),
    watchFetchApiKeys(),
    watchDeleteApiKeys(),
  ]);
}
