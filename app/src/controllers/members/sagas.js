import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { NAMESPACE, FETCH_MEMBERS } from './constants';

function* fetchMembers({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  yield put(fetchDataAction(NAMESPACE)(URLS.projectUsers(activeProject), payload));
}

function* watchFetchMembers() {
  yield takeEvery(FETCH_MEMBERS, fetchMembers);
}

export function* membersSagas() {
  yield all([watchFetchMembers()]);
}
