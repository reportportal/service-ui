import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { FETCH_LAUNCHES, NAMESPACE, FETCH_LAUNCH, CURRENT_LAUNCH_NAMESPACE } from './constants';

function* getLaunches({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  yield put(fetchDataAction(NAMESPACE)(URLS.launches(activeProject), payload));
}

function* watchFetchLaunches() {
  yield takeEvery(FETCH_LAUNCHES, getLaunches);
}

function* getLaunch({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  yield put(fetchDataAction(CURRENT_LAUNCH_NAMESPACE)(URLS.launch(activeProject, payload)));
}

function* watchFetchLaunch() {
  yield takeEvery(FETCH_LAUNCH, getLaunch);
}

export function* launchSagas() {
  yield all([watchFetchLaunches(), watchFetchLaunch()]);
}
