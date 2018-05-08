import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchData } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { FETCH_LAUNCHES, NAMESPACE } from './constants';

function* getLaunches({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const url = `/api/v1/${activeProject}/launch`;
  yield put(fetchData(NAMESPACE)(url, payload));
}

function* watchFetchLaunches() {
  yield takeEvery(FETCH_LAUNCHES, getLaunches);
}

export function* launchSagas() {
  yield all([watchFetchLaunches()]);
}
