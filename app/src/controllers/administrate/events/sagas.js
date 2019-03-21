import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { projectIdSelector } from 'controllers/pages';
import { URLS } from 'common/urls';
import { NAMESPACE, FETCH_EVENTS } from './constants';
import { querySelector } from './selectors';

function* fetchEvents() {
  const projectId = yield select(projectIdSelector);
  const query = yield select(querySelector);
  yield put(
    fetchDataAction(NAMESPACE)(URLS.events(projectId), {
      params: { ...query },
    }),
  );
}

function* watchFetchEvents() {
  yield takeEvery(FETCH_EVENTS, fetchEvents);
}

export function* eventsSagas() {
  yield all([watchFetchEvents()]);
}
