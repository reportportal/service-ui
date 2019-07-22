import { put, takeEvery, take, all } from 'redux-saga/effects';
import { fetchCompositeInfoAction, fetchApiInfoAction } from 'controllers/appInfo';
import {
  FETCH_USER_ERROR,
  FETCH_USER_SUCCESS,
  fetchUserAction,
  SET_ACTIVE_PROJECT,
} from 'controllers/user';
import {
  DEFAULT_TOKEN,
  resetTokenAction,
  TOKEN_KEY,
  setTokenAction,
  authSuccessAction,
} from 'controllers/auth';
import { FETCH_PROJECT_SUCCESS, fetchProjectAction } from 'controllers/project';
import { fetchGlobalIntegrationsAction, fetchPluginsAction } from 'controllers/plugins';
import { getStorageItem } from 'common/utils';
import { setInitialDataReadyAction } from './actionCreators';
import { FETCH_INITIAL_DATA } from './constants';

function* fetchInitialData() {
  yield put(setTokenAction(getStorageItem(TOKEN_KEY) || DEFAULT_TOKEN));
  yield put(fetchCompositeInfoAction());
  yield put(fetchUserAction());
  const userResult = yield take([FETCH_USER_SUCCESS, FETCH_USER_ERROR]);
  if (!userResult.error) {
    const { payload: activeProject } = yield take(SET_ACTIVE_PROJECT);
    yield put(fetchProjectAction(activeProject));
    yield take(FETCH_PROJECT_SUCCESS);
    yield put(fetchApiInfoAction());
    yield put(fetchPluginsAction());
    yield put(fetchGlobalIntegrationsAction());
    yield put(authSuccessAction());
  } else {
    yield put(resetTokenAction());
  }
  yield put(setInitialDataReadyAction());
}

function* watchFetchInitialData() {
  yield takeEvery(FETCH_INITIAL_DATA, fetchInitialData);
}

export function* initialDataSagas() {
  yield all([watchFetchInitialData()]);
}
