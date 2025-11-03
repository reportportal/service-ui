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
import { redirect } from 'redux-first-router';
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import {
  showNotification,
  NOTIFICATION_TYPES,
  showErrorNotification,
} from 'controllers/notification';
import { PROJECT_MANAGER } from 'common/constants/projectRoles';
import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';
import {
  userAssignedSelector,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages/selectors';
import { ORGANIZATIONS_PAGE } from 'controllers/pages/constants';
import { getLogTimeFormatFromStorage } from 'controllers/log/storageUtils';
import { setActiveOrganizationAction } from 'controllers/organization/actionCreators';
import { findAssignedProjectByOrganization } from 'common/utils/findAssignedProjectByOrganization';
import {
  assignToProjectSuccessAction,
  assignToProjectErrorAction,
  setActiveProjectAction,
  fetchUserSuccessAction,
  fetchUserErrorAction,
  setApiKeysAction,
  addApiKeySuccessAction,
  deleteApiKeySuccessAction,
  setActiveProjectKeyAction,
  setLogTimeFormatAction,
} from './actionCreators';
import {
  ASSIGN_TO_PROJECT,
  SET_ACTIVE_PROJECT,
  ADD_API_KEY,
  FETCH_API_KEYS,
  DELETE_API_KEY,
  FETCH_USER,
  FETCH_USER_INFO,
  DELETE_USER_ACCOUNT,
  UPDATE_USER_INFO,
} from './constants';
import { userIdSelector, userInfoSelector } from './selectors';

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

  const urlOrganizationAndProject = yield select(urlOrganizationAndProjectSelector);
  const { userId, assignedOrganizations, assignedProjects } = user;

  const format = getLogTimeFormatFromStorage(userId);
  yield put(setLogTimeFormatAction(format));

  if (
    Object.keys(assignedOrganizations).length === 0 ||
    Object.keys(assignedProjects).length === 0
  ) {
    yield put(setActiveProjectKeyAction(null));
    yield put(
      redirect({
        type: ORGANIZATIONS_PAGE,
      }),
    );
  } else {
    const userSettings = getStorageItem(`${userId}_settings`) || {};
    const targetActiveProject = urlOrganizationAndProject || userSettings?.activeProject;
    const { organizationSlug: targetOrganizationSlug, projectSlug: targetProjectSlug } =
      targetActiveProject || {};

    const { assignmentNotRequired, isAssignedToTargetProject } = yield select(
      userAssignedSelector(targetProjectSlug, targetOrganizationSlug),
    );

    const defaultProject = Object.keys(assignedProjects)[0];
    const {
      projectSlug: defaultProjectSlug,
      projectKey: defaultProjectKey,
      organizationId,
    } = assignedProjects[defaultProject];
    const defaultOrganization = Object.keys(assignedOrganizations).find(
      (key) => assignedOrganizations[key].organizationId === organizationId,
    );
    const { organizationSlug: defaultOrganizationSlug } = defaultOrganization
      ? assignedOrganizations[defaultOrganization]
      : Object.keys(assignedOrganizations)[0];

    let projectKey;
    let activeOrganization;

    try {
      const activeOrganizationResponse = yield call(
        fetch,
        URLS.organizationList({ slug: targetOrganizationSlug }),
      );

      activeOrganization = activeOrganizationResponse?.items?.[0];
    } catch {} // eslint-disable-line no-empty

    if (!isAssignedToTargetProject && assignmentNotRequired) {
      try {
        const currentProject = yield call(
          fetch,
          URLS.organizationProjects(activeOrganization?.id, { slug: targetProjectSlug }),
        );
        projectKey = currentProject?.items?.[0]?.key;
      } catch {} // eslint-disable-line no-empty
    }

    const activeProject =
      targetActiveProject && (isAssignedToTargetProject || projectKey)
        ? targetActiveProject
        : { organizationSlug: defaultOrganizationSlug, projectSlug: defaultProjectSlug };

    if (!projectKey) {
      const assignedProject = findAssignedProjectByOrganization(
        assignedProjects,
        assignedOrganizations[targetOrganizationSlug]?.organizationId,
        targetProjectSlug,
      );

      projectKey = isAssignedToTargetProject ? assignedProject.projectKey : defaultProjectKey;
    }

    yield put(setActiveProjectAction(activeProject));
    yield put(setActiveProjectKeyAction(projectKey));
    yield put(setActiveOrganizationAction(activeOrganization));
  }
}

function* saveActiveProjectWorker({ payload: activeProject }) {
  const user = yield select(userInfoSelector);
  const currentUserSettings = getStorageItem(`${user.userId}_settings`) || {};
  setStorageItem(`${user.userId}_settings`, {
    ...currentUserSettings,
    activeProject,
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

function* watchSaveActiveProject() {
  yield takeEvery(SET_ACTIVE_PROJECT, saveActiveProjectWorker);
}

function* watchFetchUserInfo() {
  yield takeEvery(FETCH_USER_INFO, fetchUserInfo);
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
    watchSaveActiveProject(),
    watchAddApiKey(),
    watchFetchApiKeys(),
    watchDeleteApiKey(),
    watchDeleteUserAccount(),
    watchUpdateUserInfo(),
  ]);
}
