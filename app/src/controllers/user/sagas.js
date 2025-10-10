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
import { getLogTimeFormatFromStorage } from 'controllers/log/storageUtils';
import { userIdSelector, userInfoSelector, activeProjectSelector } from './selectors';
import {
  getUserProjectSettingsFromStorage,
  setNoLogsCollapsingInStorage,
  setLogsPaginationEnabledInStorage,
  setLogsSizeInStorage,
  setLogsFullWidthModeInStorage,
} from './storageUtils';
import {
  ASSIGN_TO_PROJECT,
  UNASSIGN_FROM_PROJECT,
  SET_ACTIVE_PROJECT,
  ADD_API_KEY,
  FETCH_API_KEYS,
  DELETE_API_KEY,
  FETCH_USER,
  DELETE_USER_ACCOUNT,
  SET_NO_LOGS_COLLAPSING,
  SET_LOGS_PAGINATION_ENABLED,
  SET_LOGS_SIZE,
  SET_LOGS_FULL_WIDTH_MODE,
  LOGS_SIZE_KEY,
  NO_LOGS_COLLAPSING_KEY,
  LOGS_PAGINATION_ENABLED_KEY,
  LOGS_FULL_WIDTH_MODE_KEY,
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
  setLogTimeFormatAction,
  setActiveProjectSettingsAction,
  updateActiveProjectSettingsAction,
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
    user = yield call(fetch, URLS.users());
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
  yield put(setActiveProjectAction(activeProject));
  const format = getLogTimeFormatFromStorage(user.userId);
  yield put(setLogTimeFormatAction(format));
}

function* saveActiveProject({ payload: project }) {
  const user = yield select(userInfoSelector);
  const currentUserSettings = getStorageItem(`${user.userId}_settings`) || {};
  setStorageItem(`${user.userId}_settings`, { ...currentUserSettings, activeProject: project });

  const projectSettings = getUserProjectSettingsFromStorage(user.userId, project);
  yield put(setActiveProjectSettingsAction(projectSettings));
}

function* updateLogsSetting({ payload, setInStorage, settingKey }) {
  const { value } = payload;
  const userId = yield select(userIdSelector);
  const projectId = yield select(activeProjectSelector);

  yield call(setInStorage, userId, projectId, value);
  yield put(updateActiveProjectSettingsAction({ [settingKey]: value }));
}

function* setNoLogsCollapsing({ payload }) {
  yield call(updateLogsSetting, {
    payload,
    setInStorage: setNoLogsCollapsingInStorage,
    settingKey: NO_LOGS_COLLAPSING_KEY,
  });
}

function* setLogsPaginationEnabled({ payload }) {
  yield call(updateLogsSetting, {
    payload,
    setInStorage: setLogsPaginationEnabledInStorage,
    settingKey: LOGS_PAGINATION_ENABLED_KEY,
  });
}

function* setLogsSize({ payload }) {
  yield call(updateLogsSetting, {
    payload,
    setInStorage: setLogsSizeInStorage,
    settingKey: LOGS_SIZE_KEY,
  });
}

function* setLogsFullWidthMode({ payload }) {
  yield call(updateLogsSetting, {
    payload,
    setInStorage: setLogsFullWidthModeInStorage,
    settingKey: LOGS_FULL_WIDTH_MODE_KEY,
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

function* watchSetActiveProject() {
  yield takeEvery(SET_ACTIVE_PROJECT, saveActiveProject);
}

function* watchSetNoLogsCollapsing() {
  yield takeEvery(SET_NO_LOGS_COLLAPSING, setNoLogsCollapsing);
}

function* watchSetLogsPagination() {
  yield takeEvery(SET_LOGS_PAGINATION_ENABLED, setLogsPaginationEnabled);
}

function* watchSetLogsSize() {
  yield takeEvery(SET_LOGS_SIZE, setLogsSize);
}

function* watchSetLogsFullWidthMode() {
  yield takeEvery(SET_LOGS_FULL_WIDTH_MODE, setLogsFullWidthMode);
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

export function* userSagas() {
  yield all([
    watchAssignToProject(),
    watchUnassignFromProject(),
    watchFetchUser(),
    watchSetActiveProject(),
    watchSetNoLogsCollapsing(),
    watchSetLogsPagination(),
    watchSetLogsSize(),
    watchSetLogsFullWidthMode(),
    watchAddApiKey(),
    watchFetchApiKeys(),
    watchDeleteApiKey(),
    watchDeleteUserAccount(),
  ]);
}
