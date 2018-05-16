import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { FETCH_TESTS, NAMESPACE } from './constants';

function* getTests({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  // TODO remove hardcoded values after proper routing implementation (redux-first-router + breadcrumbs)
  yield put(
    fetchDataAction(NAMESPACE)(
      URLS.tests(activeProject, '5a65e6a997a1c00001aaee95', '5a65e6a997a1c00001aaee96'),
      payload,
    ),
  );
}

function* watchFetchTests() {
  yield takeEvery(FETCH_TESTS, getTests);
}

export function* testSagas() {
  yield all([watchFetchTests()]);
}
