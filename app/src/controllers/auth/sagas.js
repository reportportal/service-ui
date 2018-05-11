import { fetch } from 'common/utils';
import { all, takeEvery, call, put, select } from 'redux-saga/effects';
import { showNotification } from 'controllers/notification';
import { activeProjectSelector, fetchUserAction } from 'controllers/user';
import { fetchProjectAction } from 'controllers/project';
import { authSuccessAction } from 'controllers/auth/actionCreators';
import { LOGIN, LOGOUT, TOKEN_KEY, DEFAULT_TOKEN } from './constants';

function setDefaultToken() {
  localStorage.setItem(TOKEN_KEY, DEFAULT_TOKEN);
}

function* handleLogout() {
  yield call(setDefaultToken);
}

function* watchLogout() {
  yield takeEvery(LOGOUT, handleLogout);
}

function* handleLogin({ payload }) {
  let result;
  try {
    result = yield call(fetch, '/uat/sso/oauth/token', {
      params: {
        grant_type: 'password',
        username: payload.login,
        password: payload.password,
      },
      method: 'POST',
    });
  } catch (e) {
    yield put(showNotification({ messageId: 'failureLogin', type: 'error' }));
    return;
  }

  localStorage.setItem(TOKEN_KEY, `${result.token_type} ${result.access_token}`);
  // TODO: Change those calls after project & users actions will be refactored with sagas
  yield put(fetchUserAction());
  const state = yield select();
  yield put(fetchProjectAction(activeProjectSelector(state)));
  yield put(authSuccessAction());
}

function* watchLogin() {
  yield takeEvery(LOGIN, handleLogin);
}

export function* authSagas() {
  yield all([watchLogin(), watchLogout()]);
}
