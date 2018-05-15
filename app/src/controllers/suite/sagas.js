import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { FETCH_SUITES, NAMESPACE } from './constants';

function* getSuites({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const url = `/api/v1/${activeProject}/item?filter.eq.launch=5af4598e20b5430001bee8a1`;
  yield put(fetchDataAction(NAMESPACE)(url, payload));
}

function* watchFetchSuites() {
  yield takeEvery(FETCH_SUITES, getSuites);
}

export function* suiteSagas() {
  yield all([watchFetchSuites()]);
}
