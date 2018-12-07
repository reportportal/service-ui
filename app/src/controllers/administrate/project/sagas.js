import { fetchDataAction } from 'controllers/fetch';
import { put, select, all, takeEvery } from 'redux-saga/effects';
import { projectIdSelector } from 'controllers/pages';
import { URLS } from 'common/urls';
import { FETCH_PROJECT, NAMESPACE } from './constants';

function* fetchProject() {
  const projectId = yield select(projectIdSelector);
  yield put(fetchDataAction(NAMESPACE)(URLS.project(projectId)));
}

function* watchFetchProject() {
  yield takeEvery(FETCH_PROJECT, fetchProject);
}

export function* projectSaga() {
  yield all([watchFetchProject()]);
}
