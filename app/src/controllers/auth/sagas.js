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

import { all, call, put, select, takeEvery, take } from 'redux-saga/effects';
import { fetch, updateToken } from 'common/utils/fetch';
import {
  getSessionItem,
  getStorageItem,
  removeSessionItem,
  removeStorageItem,
  setStorageItem,
  updateStorageItem,
} from 'common/utils/storageUtils';
import { URLS } from 'common/urls';
import {
  ERROR_CODE_LOGIN_BAD_CREDENTIALS,
  ERROR_CODE_LOGIN_MAX_LIMIT,
} from 'common/constants/apiErrorCodes';
import { ALL } from 'common/constants/reservedFilterIds';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { fetchAppInfoAction, isDemoInstanceSelector } from 'controllers/appInfo';
import {
  OAUTH_SUCCESS,
  pagePropertiesSelector,
  PROJECT_DASHBOARD_PAGE,
  LOGIN_PAGE,
  PROJECT_LAUNCHES_PAGE,
} from 'controllers/pages';
import {
  FETCH_USER_ERROR,
  FETCH_USER_SUCCESS,
  fetchUserAction,
  userIdSelector,
  activeProjectSelector,
  activeProjectKeySelector,
} from 'controllers/user';
import { FETCH_PROJECT_SUCCESS, fetchProjectAction } from 'controllers/project';
import {
  fetchPluginsAction,
  fetchGlobalIntegrationsAction,
  fetchPublicPluginsAction,
} from 'controllers/plugins';
import { redirect, pathToAction } from 'redux-first-router';
import qs, { stringify } from 'qs';
import routesMap from 'routes/routesMap';
import { SET_ACTIVE_PROJECT_KEY, ACTIVITY_TIMESTAMP } from 'controllers/user/constants';
import {
  authSuccessAction,
  resetTokenAction,
  setTokenAction,
  setLastFailedLoginTimeAction,
  loginSuccessAction,
  setBadCredentialsAction,
} from './actionCreators';
import {
  LOGIN,
  LOGOUT,
  TOKEN_KEY,
  GRANT_TYPES,
  SET_TOKEN,
  LOGIN_SUCCESS,
  ANONYMOUS_REDIRECT_PATH_STORAGE_KEY,
} from './constants';
import { tokenSelector } from './selectors';

// TODO: clear cookie on logout
function* handleLogout({ payload }) {
  yield put(resetTokenAction());
  yield put(fetchPublicPluginsAction());
  yield put(fetchAppInfoAction());
  yield put(
    redirect({
      type: payload || LOGIN_PAGE,
    }),
  );
  yield put(
    showNotification({
      messageId: 'infoLogout',
      type: NOTIFICATION_TYPES.INFO,
    }),
  );
  removeStorageItem(ACTIVITY_TIMESTAMP);
}

function* watchLogout() {
  yield takeEvery(LOGOUT, handleLogout);
}

function* loginSuccessHandler({ payload }) {
  yield put(
    showNotification({
      messageId: 'successLogin',
      type: NOTIFICATION_TYPES.SUCCESS,
    }),
  );
  setStorageItem(ACTIVITY_TIMESTAMP, Date.now());

  yield put(
    setTokenAction({
      type: payload.type,
      value: payload.value,
    }),
  );
  yield put(fetchUserAction());
  yield all([take([FETCH_USER_SUCCESS, FETCH_USER_ERROR]), take(SET_ACTIVE_PROJECT_KEY)]);
  const projectKey = yield select(activeProjectKeySelector);
  yield put(fetchProjectAction(projectKey));
  yield take(FETCH_PROJECT_SUCCESS);
  yield put(fetchPluginsAction());
  yield put(fetchGlobalIntegrationsAction());
  yield put(authSuccessAction());
  const userId = yield select(userIdSelector);
  const anonymousRedirectPath = getSessionItem(ANONYMOUS_REDIRECT_PATH_STORAGE_KEY);
  const userSettings = getStorageItem(`${userId}_settings`) || {};
  const redirectPath = anonymousRedirectPath || userSettings.lastPath;
  if (redirectPath) {
    yield put(redirect(pathToAction(redirectPath, routesMap, qs)));
    if (anonymousRedirectPath) {
      removeSessionItem('anonymousRedirectPath');
    }
  } else {
    const isDemoInstance = yield select(isDemoInstanceSelector);
    const { organizationSlug, projectSlug } = yield select(activeProjectSelector);
    const page = isDemoInstance
      ? {
          type: PROJECT_LAUNCHES_PAGE,
          payload: { organizationSlug, projectSlug, filterId: ALL },
        }
      : {
          type: PROJECT_DASHBOARD_PAGE,
          payload: { organizationSlug, projectSlug },
        };
    yield put(redirect(page));
  }
}

function* watchLoginSuccess() {
  yield takeEvery(LOGIN_SUCCESS, loginSuccessHandler);
}

function* handleLogin({ payload }) {
  try {
    const result = yield call(fetch, URLS.login(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: stringify({
        grant_type: GRANT_TYPES.PASSWORD,
        username: payload.login,
        password: payload.password,
      }),
    });
    const token = {
      type: result.token_type,
      value: result.access_token,
    };

    yield put(loginSuccessAction(token));
  } catch ({ message: error, errorCode }) {
    yield put(
      showNotification({
        messageId: 'failureDefault',
        type: NOTIFICATION_TYPES.ERROR,
        values: { error },
      }),
    );
    if (errorCode === ERROR_CODE_LOGIN_BAD_CREDENTIALS) {
      yield put(setBadCredentialsAction());
    }
    if (errorCode === ERROR_CODE_LOGIN_MAX_LIMIT) {
      const lastFailedLoginTime = Date.now();
      updateStorageItem(APPLICATION_SETTINGS, { lastFailedLoginTime });
      yield put(setLastFailedLoginTimeAction(lastFailedLoginTime));
    }
  }
}

function* handleOauthSuccess() {
  const { token: value, token_type: type } = yield select(pagePropertiesSelector);
  yield put(loginSuccessAction({ value, type }));
}

function* watchOauthSuccess() {
  yield takeEvery(OAUTH_SUCCESS, handleOauthSuccess);
}

function* watchLogin() {
  yield takeEvery(LOGIN, handleLogin);
}

function* handleSetToken({ payload }) {
  const tokenString = yield select(tokenSelector);
  yield call(updateToken, tokenString);
  yield call(setStorageItem, TOKEN_KEY, payload);
}

function* watchSetToken() {
  yield takeEvery(SET_TOKEN, handleSetToken);
}

export function* authSagas() {
  yield all([
    watchLogin(),
    watchLogout(),
    watchSetToken(),
    watchOauthSuccess(),
    watchLoginSuccess(),
  ]);
}
