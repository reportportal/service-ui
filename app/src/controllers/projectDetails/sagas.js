import { fetchDataAction } from 'controllers/fetch';
import { put, select, all, takeEvery } from 'redux-saga/effects';
import { projectIdSelector } from 'controllers/pages';
import { URLS } from 'common/urls';
import { FETCH_PROJECT_INFO, PROJECT_INFO_NAMESPACE } from './constants';

function* fetchProjectInfo() {
  const projectId = yield select(projectIdSelector);
  yield put(fetchDataAction(PROJECT_INFO_NAMESPACE)(URLS.project(projectId)));
}

function* watchFetchProjectInfo() {
  yield takeEvery(FETCH_PROJECT_INFO, fetchProjectInfo);
}

export function* projectDetailsSaga() {
  yield all([watchFetchProjectInfo()]);
}
