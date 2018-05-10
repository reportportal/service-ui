import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { FETCH_LAUNCHES, NAMESPACE } from './constants';

function* getLaunches({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const url = `/api/v1/${activeProject}/launch`;
  yield put(fetchDataAction(NAMESPACE)(url, payload));
}

function* watchFetchLaunches() {
  yield takeEvery(FETCH_LAUNCHES, getLaunches);
}

export function* launchSagas() {
  yield all([watchFetchLaunches()]);
}
