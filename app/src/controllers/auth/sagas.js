import { all, call, put, select, takeEvery, take } from 'redux-saga/effects';
import { fetch, setStorageItem, updateStorageItem } from 'common/utils';
import { URLS } from 'common/urls';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import { showNotification } from 'controllers/notification';
import {
  OAUTH_SUCCESS,
  pagePropertiesSelector,
  PROJECT_DASHBOARD_PAGE,
  LOGIN_PAGE,
} from 'controllers/pages';
import { NOTIFICATION_TYPES } from 'controllers/notification/constants';
import {
  activeProjectSelector,
  FETCH_USER_ERROR,
  FETCH_USER_SUCCESS,
  fetchUserAction,
  SET_ACTIVE_PROJECT,
} from 'controllers/user';
import { fetchProjectAction } from 'controllers/project';
import { fetchPluginsAction, fetchGlobalIntegrationsAction } from 'controllers/plugins';
import { redirect } from 'redux-first-router';
import { stringify } from 'qs';
import { fetchApiInfoAction, fetchCompositeInfoAction } from 'controllers/appInfo';
import {
  authSuccessAction,
  resetTokenAction,
  setTokenAction,
  setLastFailedLoginTimeAction,
  loginSuccessAction,
} from './actionCreators';
import {
  LOGIN,
  LOGOUT,
  TOKEN_KEY,
  GRANT_TYPES,
  SET_TOKEN,
  LOGIN_SUCCESS,
  ERROR_CODE_LOGIN_MAX_LIMIT,
} from './constants';

function* handleLogout() {
  yield put(resetTokenAction());
  yield put(
    redirect({
      type: LOGIN_PAGE,
    }),
  );
  yield put(
    showNotification({
      messageId: 'infoLogout',
      type: NOTIFICATION_TYPES.INFO,
    }),
  );
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

  yield put(
    setTokenAction({
      type: payload.type,
      value: payload.value,
    }),
  );
  yield put(fetchCompositeInfoAction());
  yield put(fetchUserAction());
  yield take([FETCH_USER_SUCCESS, FETCH_USER_ERROR]);
  yield take(SET_ACTIVE_PROJECT);
  const projectId = yield select(activeProjectSelector);
  yield put(fetchProjectAction(projectId));
  yield put(fetchApiInfoAction());
  yield put(fetchPluginsAction());
  yield put(fetchGlobalIntegrationsAction());
  yield put(authSuccessAction());
  yield put(
    redirect({
      type: PROJECT_DASHBOARD_PAGE,
      payload: { projectId },
    }),
  );
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
