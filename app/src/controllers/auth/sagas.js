import { fetchAPI } from 'common/utils';
import { URLS } from 'common/urls';
import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import { showNotification } from 'controllers/notification';
import { NOTIFICATION_TYPES } from 'controllers/notification/constants';
import { activeProjectSelector, fetchUserAction } from 'controllers/user';
import { tokenSelector, setTokenAction } from 'controllers/auth';
import { fetchProjectAction } from 'controllers/project';
import { authSuccessAction } from 'controllers/auth/actionCreators';
import { LOGIN, LOGOUT, GRANT_TYPES, TOKEN_KEY, SET_TOKEN } from './constants';

function* handleLogout() {
  yield put(setTokenAction());
}

function* watchLogout() {
  yield takeEvery(LOGOUT, handleLogout);
}

function* handleLogin({ payload }) {
  let result;
  try {
    const token = yield select(tokenSelector);
    result = yield call(
      fetchAPI,
      URLS.login(GRANT_TYPES.PASSWORD, payload.login, payload.password),
      token,
      {
        method: 'POST',
      },
    );
  } catch (e) {
    const error = (e.response && e.response.data && e.response.data.message) || e.message;
    yield put(
      showNotification({
        messageId: 'failureDefault',
        type: NOTIFICATION_TYPES.ERROR,
        values: { error },
      }),
    );
    return;
  }

  yield put(setTokenAction(`${result.token_type} ${result.access_token}`));

  // TODO: Change those calls after project & users actions will be refactored with sagas
  yield put.resolve(fetchUserAction());
  const projectId = yield select(activeProjectSelector);
  yield put(fetchProjectAction(projectId));
  yield put(authSuccessAction());
}

function* watchLogin() {
  yield takeEvery(LOGIN, handleLogin);
}

function* handleSetToken({ payload }) {
  yield call([localStorage, 'setItem'], TOKEN_KEY, payload);
}

function* watchSetToken() {
  yield takeEvery(SET_TOKEN, handleSetToken);
}

export function* authSagas() {
  yield all([watchLogin(), watchLogout(), watchSetToken()]);
}
