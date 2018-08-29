import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { logItemIdSelector } from 'controllers/pages';
import { setActiveHistoryItemAction } from './actionCreators';
import { FETCH_HISTORY_ENTRIES, DEFAULT_HISTORY_DEPTH, NAMESPACE } from './constants';

function* getHistoryEntries() {
  const activeProject = yield select(activeProjectSelector);
  const logItemId = yield select(logItemIdSelector);

  yield put(
    fetchDataAction(NAMESPACE)(
      URLS.testItemsHistory(activeProject, logItemId, DEFAULT_HISTORY_DEPTH),
    ),
  );
  yield put(setActiveHistoryItemAction(logItemId));
}

function* watchFetchHistoryEntries() {
  yield takeEvery(FETCH_HISTORY_ENTRIES, getHistoryEntries);
}

export function* logSagas() {
  yield all([watchFetchHistoryEntries()]);
}
