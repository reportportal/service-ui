import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { launchIdSelector } from 'controllers/pages';
import { URLS } from 'common/urls';
import { FETCH_SUITES, NAMESPACE, FETCH_SUITE, CURRENT_SUITE_NAMESPACE } from './constants';

function* getSuites({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const launchId = yield select(launchIdSelector);
  yield put(fetchDataAction(NAMESPACE)(URLS.testItem(activeProject, launchId), payload));
}

function* watchFetchSuites() {
  yield takeEvery(FETCH_SUITES, getSuites);
}

function* getSuite({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  yield put(fetchDataAction(CURRENT_SUITE_NAMESPACE)(URLS.suite(activeProject, payload)));
}

function* watchFetchSuite() {
  yield takeEvery(FETCH_SUITE, getSuite);
}

export function* suiteSagas() {
  yield all([watchFetchSuites(), watchFetchSuite()]);
}
