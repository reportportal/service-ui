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
  removeSessionItem,
  removeStorageItem,
  setStorageItem,
  updateStorageItem,
} from 'common/utils/storageUtils';
import { URLS } from 'common/urls';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { fetchAppInfoAction } from 'controllers/appInfo';
import {
  OAUTH_SUCCESS,
  pagePropertiesSelector,
  LOGIN_PAGE,
  ACCOUNT_REMOVED_PAGE,
} from 'controllers/pages';
import {
  FETCH_USER_ERROR,
  FETCH_USER_SUCCESS,
  fetchUserAction,
  getUserSettingsFromStorage,
  userIdSelector,
  userInfoSelector,
} from 'controllers/user';
import {
  fetchPluginsAction,
  fetchGlobalIntegrationsAction,
  fetchPublicPluginsAction,
} from 'controllers/plugins';
import { redirect, pathToAction } from 'redux-first-router';
import qs, { stringify } from 'qs';
import routesMap, { getRedirectRoute } from 'routes/routesMap';
import { ACTIVITY_TIMESTAMP } from 'controllers/user/constants';
import {
  authSuccessAction,
  resetTokenAction,
  setTokenAction,
  setLastFailedLoginTimeAction,
  setFailedLoginAttemptsAction,
  clearLoginLockoutAction,
  loginSuccessAction,
  setBadCredentialsAction,
  setLoginLoadingAction,
} from './actionCreators';
import { isLoginCredentialFailure, isLoginLockoutActive, isServerLoginLockFailure, LOGIN_ADDRESS_LOCKED_MESSAGE, shouldStartLoginLockout } from './loginLockout';
import {
  LOGIN,
  LOGOUT,
  TOKEN_KEY,
  GRANT_TYPES,
  SET_TOKEN,
  LOGIN_SUCCESS,
  ANONYMOUS_REDIRECT_PATH_STORAGE_KEY,
} from './constants';
import { tokenSelector, lastFailedLoginTimeSelector, failedLoginAttemptsSelector } from './selectors';

function* logoutOnServer(redirectedPage) {
  if (redirectedPage === ACCOUNT_REMOVED_PAGE) {
    return;
  }

  try {
    yield call(fetch, URLS.logout(), { method: 'POST' });
  } catch {
    // proceed with local logout regardless of API errors
  }
}

// TODO: clear cookie on logout
function* handleLogout({ payload }) {
  yield call(logoutOnServer, payload);
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
  setStorageItem(ACTIVITY_TIMESTAMP, Date.now());
  yield put(clearLoginLockoutAction());

  yield put(
    setTokenAction({
      type: payload.type,
      value: payload.value,
    }),
  );
  yield put(fetchUserAction());
  const userResult = yield take([FETCH_USER_SUCCESS, FETCH_USER_ERROR]);
  if (userResult.error) {
    yield put(setLoginLoadingAction(false));
    return;
  }

  yield put(fetchPluginsAction());
  yield put(fetchGlobalIntegrationsAction());
  yield put(authSuccessAction());

  const userId = yield select(userIdSelector);
  const user = yield select(userInfoSelector);
  const anonymousRedirectPath = getSessionItem(ANONYMOUS_REDIRECT_PATH_STORAGE_KEY);
  const userSettings = getUserSettingsFromStorage(userId);
  const redirectPath = anonymousRedirectPath || userSettings.lastPath;

  if (redirectPath) {
    yield put(redirect(pathToAction(redirectPath, routesMap, qs)));
    if (anonymousRedirectPath) {
      removeSessionItem(ANONYMOUS_REDIRECT_PATH_STORAGE_KEY);
    }
  } else {
    // Demo instance specific redirect to be implemented
    const page = getRedirectRoute(user);
    yield put(redirect(page));
  }

  yield put(
    showNotification({
      messageId: 'successLogin',
      type: NOTIFICATION_TYPES.SUCCESS,
    }),
  );
}

function* watchLoginSuccess() {
  yield takeEvery(LOGIN_SUCCESS, loginSuccessHandler);
}

function* startServerLoginLockout() {
  const lastFailedLoginTime = Date.now();
  updateStorageItem(APPLICATION_SETTINGS, { lastFailedLoginTime });
  yield put(setLastFailedLoginTimeAction(lastFailedLoginTime));
}

function* registerFailedLoginAttempt() {
  const failedAttempts = (yield select(failedLoginAttemptsSelector)) + 1;
  yield put(setFailedLoginAttemptsAction(failedAttempts));

  if (shouldStartLoginLockout(failedAttempts)) {
    const lastFailedLoginTime = Date.now();
    updateStorageItem(APPLICATION_SETTINGS, { lastFailedLoginTime });
    yield put(setLastFailedLoginTimeAction(lastFailedLoginTime));
    return true;
  }

  yield put(setBadCredentialsAction());
  return false;
}

function getLoginErrorMessage(rawError) {
  return String(
    rawError?.message || rawError?.error_description || rawError?.error || 'Unknown error',
  );
}

function* showLoginFailureNotification(errorMessage) {
  yield put(
    showNotification({
      messageId: 'failureDefault',
      type: NOTIFICATION_TYPES.ERROR,
      values: { error: errorMessage },
    }),
  );
}

function* handleLogin({ payload }) {
  const lastFailedLoginTime = yield select(lastFailedLoginTimeSelector);
  if (isLoginLockoutActive(lastFailedLoginTime)) {
    yield put(setLoginLoadingAction(false));
    return;
  }

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
  } catch (rawError) {
    yield put(setLoginLoadingAction(false));

    if (isServerLoginLockFailure(rawError)) {
      yield call(startServerLoginLockout);
      const errorMessage = getLoginErrorMessage(rawError);
           yield call(
               showLoginFailureNotification,
               errorMessage === 'Unknown error'
                ? LOGIN_ADDRESS_LOCKED_MESSAGE
                   : errorMessage,
             );
      return;
    }

    if (isLoginCredentialFailure(rawError)) {
      const isLockedOut = yield call(registerFailedLoginAttempt);

      yield call(
        showLoginFailureNotification,
        isLockedOut ? LOGIN_ADDRESS_LOCKED_MESSAGE : getLoginErrorMessage(rawError),
      );
      return;
    }

    yield call(showLoginFailureNotification, getLoginErrorMessage(rawError));
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
