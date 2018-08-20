import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { activeItemIdSelector } from './selectors';
import { FETCH_LOG_ENTRIES, DEFAULT_HISTORY_DEPTH, NAMESPACE } from './constants';

function* getLogEntries() {
  const activeProject = yield select(activeProjectSelector);
  const activeItemId = yield select(activeItemIdSelector);
  yield put(
    fetchDataAction(NAMESPACE)(
      URLS.testItemsHistory(activeProject, activeItemId, DEFAULT_HISTORY_DEPTH),
    ),
  );
}

function* watchFetchLogEntries() {
  yield takeEvery(FETCH_LOG_ENTRIES, getLogEntries);
}

export function* logEntriesSagas() {
  yield all([watchFetchLogEntries()]);
}
