import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { launchIdSelector } from 'controllers/pages';
import { URLS } from 'common/urls';
import { FETCH_SUITES, NAMESPACE } from './constants';

function* getSuites({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const launchId = yield select(launchIdSelector);
  yield put(fetchDataAction(NAMESPACE)(URLS.testItems(activeProject, launchId), payload));
}

function* watchFetchSuites() {
  yield takeEvery(FETCH_SUITES, getSuites);
}

export function* suiteSagas() {
  yield all([watchFetchSuites()]);
}
