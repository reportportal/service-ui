import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { NAMESPACE, FETCH_MEMBERS } from './constants';
import { querySelector } from './selectors';

function* fetchMembers() {
  const activeProject = yield select(activeProjectSelector);
  const query = yield select(querySelector);
  yield put(
    fetchDataAction(NAMESPACE)(URLS.projectUsers(activeProject), {
      params: { ...query },
    }),
  );
}

function* watchFetchMembers() {
  yield takeEvery(FETCH_MEMBERS, fetchMembers);
}

export function* membersSagas() {
  yield all([watchFetchMembers()]);
}
