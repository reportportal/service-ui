import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { launchIdSelector, suiteIdSelector } from 'controllers/pages';
import { URLS } from 'common/urls';
import { FETCH_TESTS, NAMESPACE } from './constants';

function* getTests({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const launchId = yield select(launchIdSelector);
  const suiteId = yield select(suiteIdSelector);
  yield put(fetchDataAction(NAMESPACE)(URLS.testItems(activeProject, launchId, suiteId), payload));
}

function* watchFetchTests() {
  yield takeEvery(FETCH_TESTS, getTests);
}

export function* testSagas() {
  yield all([watchFetchTests()]);
}
