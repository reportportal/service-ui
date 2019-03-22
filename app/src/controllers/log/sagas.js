import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import { fetchParentItems, fetchTestItemsAction } from 'controllers/testItem';
import { URLS } from 'common/urls';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import {
  logItemIdSelector,
  pagePropertiesSelector,
  pathnameChangedSelector,
} from 'controllers/pages';
import { fetchDataAction } from 'controllers/fetch';
import {
  ACTIVITY_NAMESPACE,
  DEFAULT_HISTORY_DEPTH,
  FETCH_HISTORY_ENTRIES,
  FETCH_LOG_PAGE_DATA,
  HISTORY_NAMESPACE,
  LOG_ITEMS_NAMESPACE,
  LOG_LEVEL_FILTER_KEY,
  WITH_ATTACHMENTS_FILTER_KEY,
  NAMESPACE,
} from './constants';
import { activeLogIdSelector, prevActiveLogIdSelector, querySelector } from './selectors';
import { attachmentSagas, clearAttachmentsAction } from './attachments';
import { getWithAttachments, getLogLevel } from './storageUtils';

function* fetchActivity() {
  const activeProject = yield select(activeProjectSelector);
  const activeLogItemId = yield select(activeLogIdSelector);
  yield put(
    fetchDataAction(ACTIVITY_NAMESPACE)(URLS.logItemActivity(activeProject, activeLogItemId)),
  );
}

function* fetchLogItems() {
  const activeProject = yield select(activeProjectSelector);
  const userId = yield select(userIdSelector);
  const query = yield select(pagePropertiesSelector, NAMESPACE);
  const filterLevel = query[LOG_LEVEL_FILTER_KEY] || getLogLevel(userId).id;
  const withAttachments = getWithAttachments(userId) || undefined;
  const params = yield select(querySelector, NAMESPACE);
  const activeLogItemId = yield select(activeLogIdSelector);
  yield put(
    fetchDataAction(LOG_ITEMS_NAMESPACE)(
      URLS.logItems(activeProject, activeLogItemId, filterLevel),
      {
        params: { ...params, [WITH_ATTACHMENTS_FILTER_KEY]: withAttachments },
      },
    ),
  );
}

function* fetchHistoryEntries() {
  const activeProject = yield select(activeProjectSelector);
  const logItemId = yield select(logItemIdSelector);

  yield put(
    fetchDataAction(HISTORY_NAMESPACE)(
      URLS.testItemsHistory(activeProject, logItemId, DEFAULT_HISTORY_DEPTH),
    ),
  );
}

function* fetchWholePage() {
  yield put(fetchTestItemsAction({ offset: 1 }));
  yield all([
    call(fetchParentItems),
    call(fetchHistoryEntries),
    call(fetchLogItems),
    call(fetchActivity),
    put(clearAttachmentsAction()),
  ]);
}

function* fetchHistoryItemData() {
  const activeLogId = yield select(activeLogIdSelector);
  const prevActiveLogId = yield select(prevActiveLogIdSelector);
  if (activeLogId !== prevActiveLogId) {
    yield all([call(fetchLogItems), call(fetchActivity), put(clearAttachmentsAction())]);
  } else {
    yield call(fetchLogItems);
  }
}

function* fetchLogPageData({ meta = {} }) {
  const isPathNameChanged = yield select(pathnameChangedSelector);
  if (meta.refresh) {
    yield all([
      call(fetchHistoryEntries),
      call(fetchLogItems),
      call(fetchActivity),
      put(clearAttachmentsAction()),
    ]);
    return;
  }
  if (isPathNameChanged) {
    yield call(fetchWholePage);
  } else {
    yield call(fetchHistoryItemData);
  }
}

function* watchFetchLogPageData() {
  yield takeEvery(FETCH_LOG_PAGE_DATA, fetchLogPageData);
}

function* watchFetchHistoryEntries() {
  yield takeEvery(FETCH_HISTORY_ENTRIES, fetchHistoryEntries);
}

export function* logSagas() {
  yield all([watchFetchLogPageData(), watchFetchHistoryEntries(), attachmentSagas()]);
}
