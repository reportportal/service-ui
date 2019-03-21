import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { projectIdSelector } from 'controllers/pages';
import { URLS } from 'common/urls';
import { NAMESPACE, FETCH_MEMBERS } from './constants';
import { querySelector } from './selectors';

function* fetchMembers() {
  const projectId = yield select(projectIdSelector);
  const query = yield select(querySelector);
  if (projectId) {
    yield put(
      fetchDataAction(NAMESPACE)(URLS.projectUsers(projectId), {
        params: { ...query },
      }),
    );
  }
}

function* watchFetchMembers() {
  yield takeEvery(FETCH_MEMBERS, fetchMembers);
}

export function* membersSagas() {
  yield all([watchFetchMembers()]);
}
