import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import { NAMESPACE, FETCH_PROJECTS } from './constants';
import { querySelector } from './selectors';

function* fetchProjects() {
  const query = yield select(querySelector);
  yield put(
    fetchDataAction(NAMESPACE)(URLS.projects(), {
      params: { ...query },
    }),
  );
}

function* watchFetchProjects() {
  yield takeEvery(FETCH_PROJECTS, fetchProjects);
}

export function* projectsSagas() {
  yield all([watchFetchProjects()]);
}
