import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { debugModeSelector } from 'controllers/launch';
import { FETCH_LAUNCHES, NAMESPACE } from './constants';
import { queryParametersSelector } from './selectors';

function* getLaunches() {
  const activeProject = yield select(activeProjectSelector);
  const params = yield select(queryParametersSelector, NAMESPACE);
  const isDebugMode = yield select(debugModeSelector);
  yield put(
    fetchDataAction(NAMESPACE)(
      !isDebugMode ? URLS.launches(activeProject) : URLS.debug(activeProject),
      { params },
    ),
  );
}

function* watchFetchLaunches() {
  yield takeEvery(FETCH_LAUNCHES, getLaunches);
}

export function* launchSagas() {
  yield all([watchFetchLaunches()]);
}
