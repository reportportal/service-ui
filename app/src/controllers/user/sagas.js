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
  ASSIGN_TO_PROJECT,
  UNASSIGN_FROM_PROJECT,
  ADD_API_KEY,
  FETCH_API_KEYS,
  DELETE_API_KEY,
  FETCH_USER,
  DELETE_USER_ACCOUNT,
  SET_ACTIVE_PROJECT_KEY,
} from './constants';
import {
  assignToProjectSuccessAction,
  assignToProjectErrorAction,
  unassignFromProjectSuccessAction,
  setActiveProjectAction,
  fetchUserSuccessAction,
  fetchUserErrorAction,
  setApiKeysAction,
  addApiKeySuccessAction,
  deleteApiKeySuccessAction,
  setActiveProjectKeyAction,
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
    yield call(fetch, URLS.userInviteInternal(project.projectKey), {
      method: 'put',
      data,
    });
    yield put(
      assignToProjectSuccessAction({
        projectKey: project.projectKey,
        projectRole: userRole,
        entryType: project.entryType,
        organizationSlug: project.organizationSlug,
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
        projectKey: project.projectKey,
        projectRole: userRole,
        entryType: project.entryType,
        organizationSlug: project.organizationSlug,
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
    yield call(fetch, URLS.userUnasign(project), {
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
    user = yield call(fetch, URLS.users());
    yield put(fetchUserSuccessAction(user));
  } catch (err) {
    yield put(fetchUserErrorAction());
    return;
  }
  const userSettings = getStorageItem(`${user.userId}_settings`) || {};
  const { activeProjectKey: savedActiveProjectKey } = userSettings ?? {};
  const defaultProjectKey = Object.keys(user.assignedProjects)[0];
  const defaultProjectName = user.assignedProjects[defaultProjectKey].projectName;

  const activeProjectKey =
    savedActiveProjectKey && savedActiveProjectKey in user.assignedProjects
      ? savedActiveProjectKey
      : defaultProjectKey;

  const activeProjectName =
    user.assignedProjects[savedActiveProjectKey]?.projectName ?? defaultProjectName;

  yield put(setActiveProjectAction(activeProjectName));
  yield put(setActiveProjectKeyAction(activeProjectKey));
}

function* saveActiveProjectKeyWorker({ payload: activeProjectKey }) {
  const user = yield select(userInfoSelector);
  const currentUserSettings = getStorageItem(`${user.userId}_settings`) || {};
  setStorageItem(`${user.userId}_settings`, {
    ...currentUserSettings,
    activeProjectKey,
  });
}

function* addApiKey({ payload = {} }) {
  const { name, successMessage, errorMessage, onSuccess } = payload;
  const user = yield select(userInfoSelector);
  try {
    const response = yield call(fetch, URLS.apiKeys(user.id), {
      method: 'post',
      data: {
        name,
      },
    });

    // eslint-disable-next-line camelcase
    const { id, created_at, api_key } = response;
    onSuccess(api_key);
    if (successMessage) {
      yield put(
        showNotification({
          message: successMessage,
          type: NOTIFICATION_TYPES.SUCCESS,
        }),
      );
    }
    yield put(addApiKeySuccessAction({ id, name, created_at }));
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
    const response = yield call(fetch, URLS.apiKeys(user.id));
    yield put(setApiKeysAction(response.items));
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

function* deleteApiKey({ payload = {} }) {
  const { apiKeyId, successMessage, errorMessage, onSuccess } = payload;
  const user = yield select(userInfoSelector);

  try {
    yield call(fetch, URLS.apiKeyById(user.id, apiKeyId), {
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
    yield put(deleteApiKeySuccessAction(apiKeyId));
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

function* deleteUserAccount({ payload = {} }) {
  const { onSuccess } = payload;
  const user = yield select(userInfoSelector);

  try {
    yield call(fetch, URLS.userInfo(user.id), {
      method: 'delete',
    });
    onSuccess();
  } catch ({ message }) {
    yield put(
      showNotification({
        message,
        type: NOTIFICATION_TYPES.ERROR,
      }),
    );
  }
}

function* watchAddApiKey() {
  yield takeEvery(ADD_API_KEY, addApiKey);
}

function* watchFetchApiKeys() {
  yield takeEvery(FETCH_API_KEYS, fetchApiKeys);
}

function* watchDeleteApiKey() {
  yield takeEvery(DELETE_API_KEY, deleteApiKey);
}

function* watchDeleteUserAccount() {
  yield takeEvery(DELETE_USER_ACCOUNT, deleteUserAccount);
}

function* watchFetchUser() {
  yield takeEvery(FETCH_USER, fetchUserWorker);
}

function* watchAssignToProject() {
  yield takeLatest(ASSIGN_TO_PROJECT, assignToProject);
}

function* watchUnassignFromProject() {
  yield takeLatest(UNASSIGN_FROM_PROJECT, unassignFromProject);
}

function* watchSaveActiveProjectKey() {
  yield takeEvery(SET_ACTIVE_PROJECT_KEY, saveActiveProjectKeyWorker);
}

export function* userSagas() {
  yield all([
    watchAssignToProject(),
    watchUnassignFromProject(),
    watchFetchUser(),
    watchAddApiKey(),
    watchFetchApiKeys(),
    watchDeleteApiKey(),
    watchDeleteUserAccount(),
    watchSaveActiveProjectKey(),
  ]);
}
