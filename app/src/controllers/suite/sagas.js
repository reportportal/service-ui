import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { FETCH_SUITES, NAMESPACE, FETCH_SUITE, CURRENT_SUITE_NAMESPACE } from './constants';

function* getSuites({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  // TODO remove hardcoded launch id after proper routing implementation (redux-first-router + breadcrumbs)
  yield put(
    fetchDataAction(NAMESPACE)(URLS.suites(activeProject, '5a65e6a997a1c00001aaee95'), payload),
  );
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
