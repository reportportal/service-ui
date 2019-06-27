import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import {
  fetchParentItems,
  fetchTestItemsAction,
  logPageOffsetSelector,
} from 'controllers/testItem';
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

import {
  activeLogIdSelector,
  prevActiveLogIdSelector,
  querySelector,
  activeRetryIdSelector,
  prevActiveRetryIdSelector,
  nextErrorLogItemIdSelector,
} from './selectors';
import { attachmentSagas, clearAttachmentsAction } from './attachments';
import { sauceLabsSagas } from './sauceLabs';
import { nestedStepSagas, CLEAR_NESTED_STEPS } from './nestedSteps';
import { getWithAttachments, getLogLevel } from './storageUtils';

function* fetchActivity() {
  const activeProject = yield select(activeProjectSelector);
  const activeLogItemId = yield select(activeLogIdSelector);
  yield put(
    fetchDataAction(ACTIVITY_NAMESPACE)(URLS.logItemActivity(activeProject, activeLogItemId)),
  );
}
export function* collectLogPayload() {
  const activeProject = yield select(activeProjectSelector);
  const userId = yield select(userIdSelector);
  const query = yield select(querySelector, NAMESPACE);
  const filterLevel = query[LOG_LEVEL_FILTER_KEY] || getLogLevel(userId).id;
  const withAttachments = getWithAttachments(userId) || undefined;
  const activeLogItemId = yield select(activeRetryIdSelector);
  const errorId = yield select(nextErrorLogItemIdSelector);
  const fullParams = yield select(pagePropertiesSelector, NAMESPACE);
  // prevent duplication of level params in query
  const params = Object.keys(fullParams).reduce((acc, key) => {
    if (key === LOG_LEVEL_FILTER_KEY) {
      return acc;
    }
    return { ...acc, [key]: fullParams[key] };
  }, {});
  return {
    activeProject,
    userId,
    params,
    filterLevel,
    withAttachments,
    activeLogItemId,
    errorId,
    query,
  };
}

function* fetchLogItems(payload = {}) {
  const { activeProject, params, filterLevel, withAttachments, activeLogItemId } = yield call(
    collectLogPayload,
  );
  const namespace = payload.namespace || LOG_ITEMS_NAMESPACE;
  const logLevel = payload.level || filterLevel;
  const fetchParams = {
    ...params,
    ...payload.params,
    [WITH_ATTACHMENTS_FILTER_KEY]: withAttachments,
  };
  yield put(
    fetchDataAction(namespace)(URLS.logItems(activeProject, activeLogItemId, logLevel), {
      params: fetchParams,
    }),
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
  yield call(fetchParentItems);
  const offset = yield select(logPageOffsetSelector);
  yield all([
    put(fetchTestItemsAction({ offset })),
    call(fetchHistoryEntries),
    call(fetchLogItems),
    call(fetchActivity),
    put(clearAttachmentsAction()),
  ]);
}

function* fetchHistoryItemData() {
  const activeLogId = yield select(activeLogIdSelector);
  const prevActiveLogId = yield select(prevActiveLogIdSelector);
  const activeRetryId = yield select(activeRetryIdSelector);
  const prevActiveRetryId = yield select(prevActiveRetryIdSelector);
  if (activeLogId !== prevActiveLogId || activeRetryId !== prevActiveRetryId) {
    yield all([call(fetchLogItems), call(fetchActivity), put(clearAttachmentsAction())]);
  } else {
    yield call(fetchLogItems);
  }
}

function* fetchLogPageData({ meta = {} }) {
  const isPathNameChanged = yield select(pathnameChangedSelector);
  yield put({ type: CLEAR_NESTED_STEPS });
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
  yield all([
    watchFetchLogPageData(),
    watchFetchHistoryEntries(),
    attachmentSagas(),
    sauceLabsSagas(),
    nestedStepSagas(),
  ]);
}
