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
import {
  showNotification,
  NOTIFICATION_TYPES,
  showErrorNotification,
} from 'controllers/notification';
import { PROJECT_MANAGER } from 'common/constants/projectRoles';
import { getLogTimeFormatFromStorage } from 'controllers/log/storageUtils';
import {
  getUserProjectSettingsFromStorage,
  setNoLogsCollapsingInStorage,
  setLogsPaginationEnabledInStorage,
  setLogsSizeInStorage,
  setLogsFullWidthModeInStorage,
  setLogsColorizedBackgroundInStorage,
} from './storageUtils';
import {
  assignToProjectSuccessAction,
  assignToProjectErrorAction,
  fetchUserSuccessAction,
  fetchUserErrorAction,
  setApiKeysAction,
  addApiKeySuccessAction,
  deleteApiKeySuccessAction,
  setLogTimeFormatAction,
  setActiveProjectSettingsAction,
  updateActiveProjectSettingsAction,
} from './actionCreators';
import {
  ASSIGN_TO_PROJECT,
  SET_ACTIVE_PROJECT_KEY,
  ADD_API_KEY,
  FETCH_API_KEYS,
  DELETE_API_KEY,
  FETCH_USER,
  FETCH_USER_INFO,
  DELETE_USER_ACCOUNT,
  UPDATE_USER_INFO,
  SET_NO_LOGS_COLLAPSING,
  SET_LOGS_PAGINATION_ENABLED,
  SET_LOGS_SIZE,
  SET_LOGS_FULL_WIDTH_MODE,
  SET_LOGS_COLORIZED_BACKGROUND,
  LOGS_SIZE_KEY,
  NO_LOGS_COLLAPSING_KEY,
  LOGS_PAGINATION_ENABLED_KEY,
  LOGS_FULL_WIDTH_MODE_KEY,
  LOGS_COLORIZED_BACKGROUND_KEY,
} from './constants';
import { activeProjectKeySelector, userIdSelector, userInfoSelector } from './selectors';

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

function* fetchUserInfo() {
  try {
    const user = yield call(fetch, URLS.users());
    yield put(fetchUserSuccessAction(user));
    return user;
  } catch (err) {
    yield put(fetchUserErrorAction());
  }
}

function* fetchUserWorker() {
  const user = yield call(fetchUserInfo);
  if (!user) return;

  const { userId } = user;
  const format = getLogTimeFormatFromStorage(userId);
  yield put(setLogTimeFormatAction(format));
}

function* loadProjectSettingsWorker({ payload: projectKey }) {
  const user = yield select(userInfoSelector);
  const projectSettings = getUserProjectSettingsFromStorage(user.userId, projectKey);
  yield put(setActiveProjectSettingsAction(projectSettings));
}

function* updateLogsSetting({ payload, setInStorage, settingKey }) {
  const { value } = payload;
  const userId = yield select(userIdSelector);
  const projectKey = yield select(activeProjectKeySelector);

  yield call(setInStorage, userId, projectKey, value);
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

function* setLogsColorizedBackground({ payload }) {
  yield call(updateLogsSetting, {
    payload,
    setInStorage: setLogsColorizedBackgroundInStorage,
    settingKey: LOGS_COLORIZED_BACKGROUND_KEY,
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
  const { onSuccess, userId } = payload;

  try {
    yield call(fetch, URLS.userInfo(userId), {
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

function* updateUserInfo({ payload = {} }) {
  const { email, data, onSuccess } = payload;

  try {
    yield call(fetch, URLS.userInfo(email), {
      method: 'put',
      data,
    });
    onSuccess?.();
  } catch ({ message }) {
    yield put(showErrorNotification({ message }));
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

function* watchFetchUserInfo() {
  yield takeEvery(FETCH_USER_INFO, fetchUserInfo);
}

function* watchLoadProjectSettings() {
  yield takeEvery(SET_ACTIVE_PROJECT_KEY, loadProjectSettingsWorker);
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

function* watchSetLogsColorizedBackground() {
  yield takeEvery(SET_LOGS_COLORIZED_BACKGROUND, setLogsColorizedBackground);
}

function* watchFetchUser() {
  yield takeEvery(FETCH_USER, fetchUserWorker);
}

function* watchAssignToProject() {
  yield takeLatest(ASSIGN_TO_PROJECT, assignToProject);
}

function* watchUpdateUserInfo() {
  yield takeEvery(UPDATE_USER_INFO, updateUserInfo);
}

export function* userSagas() {
  yield all([
    watchAssignToProject(),
    watchFetchUser(),
    watchFetchUserInfo(),
    watchLoadProjectSettings(),
    watchSetNoLogsCollapsing(),
    watchSetLogsPagination(),
    watchSetLogsSize(),
    watchSetLogsFullWidthMode(),
    watchSetLogsColorizedBackground(),
    watchAddApiKey(),
    watchFetchApiKeys(),
    watchDeleteApiKey(),
    watchDeleteUserAccount(),
    watchUpdateUserInfo(),
  ]);
}
