import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import { showNotification } from 'controllers/notification';
import { NOTIFICATION_TYPES } from 'controllers/notification/constants';
import { activeProjectSelector, fetchUserAction } from 'controllers/user';
import { fetchProjectAction } from 'controllers/project';
import { authSuccessAction } from 'controllers/auth/actionCreators';
import { DEFAULT_TOKEN, LOGIN, LOGOUT, TOKEN_KEY, GRANT_TYPES } from './constants';

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
    result = yield call(fetch, URLS.login(GRANT_TYPES.PASSWORD, payload.login, payload.password), {
      method: 'POST',
    });
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

  localStorage.setItem(TOKEN_KEY, `${result.token_type} ${result.access_token}`);
  // TODO: Change those calls after project & users actions will be refactored with sagas
  yield put(fetchUserAction());
  const projectId = yield select(activeProjectSelector);
  yield put(fetchProjectAction(projectId));
  yield put(authSuccessAction());
}

function* watchLogin() {
  yield takeEvery(LOGIN, handleLogin);
}

export function* authSagas() {
  yield all([watchLogin(), watchLogout()]);
}
