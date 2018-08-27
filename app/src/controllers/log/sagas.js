import { takeEvery, all, put, select } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { logItemIdSelector } from './selectors';
import { setActiveHistoryItemAction } from './actionCreators';
import {
  FETCH_HISTORY_ENTRIES,
  CHANGE_ACTIVE_HISTORY_ITEM,
  DEFAULT_HISTORY_DEPTH,
  NAMESPACE,
} from './constants';

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

function* changeActiveHistoryItem({ payload }) {
  yield put(setActiveHistoryItemAction(payload));
}

function* watchFetchHistoryEntries() {
  yield takeEvery(FETCH_HISTORY_ENTRIES, getHistoryEntries);
}

function* watchChangeActiveHistoryItem() {
  yield takeEvery(CHANGE_ACTIVE_HISTORY_ITEM, changeActiveHistoryItem);
}

export function* logSagas() {
  yield all([watchFetchHistoryEntries(), watchChangeActiveHistoryItem()]);
}
