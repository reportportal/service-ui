import { all, call, put, select, take, takeEvery } from 'redux-saga/effects';
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
import { createFetchPredicate, fetchDataAction } from 'controllers/fetch';
import { isEmptyObject } from 'common/utils';
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
  HIDE_PASSED_LOGS,
  HIDE_EMPTY_STEPS,
  FETCH_LOG_PAGE_STACK_TRACE,
  STACK_TRACE_NAMESPACE,
  STACK_TRACE_PAGINATION_OFFSET,
  DETAILED_LOG_VIEW,
} from './constants';

import {
  activeLogIdSelector,
  prevActiveLogIdSelector,
  querySelector,
  activeRetryIdSelector,
  prevActiveRetryIdSelector,
  logStackTracePaginationSelector,
  logViewModeSelector,
  isLaunchLogSelector,
  activeLogSelector,
} from './selectors';
import {
  attachmentSagas,
  clearAttachmentsAction,
  fetchFirstAttachmentsAction,
} from './attachments';
import { sauceLabsSagas } from './sauceLabs';
import { nestedStepSagas, CLEAR_NESTED_STEPS } from './nestedSteps';
import {
  getWithAttachments,
  getLogLevel,
  getHidePassedLogs,
  getHideEmptySteps,
} from './storageUtils';
import { clearLogPageStackTrace, setPageLoadingAction } from './actionCreators';

function* fetchActivity() {
  const activeProject = yield select(activeProjectSelector);
  const activeLogItemId = yield select(activeLogIdSelector);
  yield put(
    fetchDataAction(ACTIVITY_NAMESPACE)(URLS.logItemActivity(activeProject, activeLogItemId)),
  );
  yield take(createFetchPredicate(ACTIVITY_NAMESPACE));
}
export function* collectLogPayload() {
  const activeProject = yield select(activeProjectSelector);
  const userId = yield select(userIdSelector);
  const query = yield select(querySelector, NAMESPACE);
  const filterLevel = query[LOG_LEVEL_FILTER_KEY] || getLogLevel(userId).id;
  const withAttachments = getWithAttachments(userId) || undefined;
  const hidePassedLogs = getHidePassedLogs(userId) || undefined;
  const hideEmptySteps = getHideEmptySteps(userId) || undefined;
  const activeLogItemId = yield select(activeRetryIdSelector);
  const fullParams = yield select(pagePropertiesSelector, NAMESPACE);
  // prevent duplication of level params in query
  let params = Object.keys(fullParams).reduce((acc, key) => {
    if (key === LOG_LEVEL_FILTER_KEY) {
      return acc;
    }
    return { ...acc, [key]: fullParams[key] };
  }, {});
  params = {
    ...params,
    [WITH_ATTACHMENTS_FILTER_KEY]: withAttachments,
    [HIDE_PASSED_LOGS]: hidePassedLogs,
    [HIDE_EMPTY_STEPS]: hideEmptySteps,
  };
  return {
    activeProject,
    userId,
    params,
    filterLevel,
    withAttachments,
    activeLogItemId,
    query,
    hidePassedLogs,
    hideEmptySteps,
  };
}

function* fetchLogItems(payload = {}) {
  const { activeProject, params, filterLevel, activeLogItemId } = yield call(collectLogPayload);
  const namespace = payload.namespace || LOG_ITEMS_NAMESPACE;
  const logLevel = payload.level || filterLevel;
  const fetchParams = {
    ...params,
    ...payload.params,
  };
  const isLaunchLog = yield select(isLaunchLogSelector);
  const url = isLaunchLog
    ? URLS.launchLogs(activeProject, activeLogItemId, logLevel)
    : URLS.logItems(activeProject, activeLogItemId, logLevel);
  yield put(
    fetchDataAction(namespace)(url, {
      params: fetchParams,
    }),
  );
  yield take(createFetchPredicate(namespace));
}

function* fetchStackTrace() {
  const { activeProject } = yield call(collectLogPayload);
  const page = yield select(logStackTracePaginationSelector);
  const item = yield select(activeLogSelector);
  const { path } = item;
  let pageSize = STACK_TRACE_PAGINATION_OFFSET;
  if (!isEmptyObject(page) && page.totalElements > 0) {
    const { totalElements, size } = page;
    pageSize = size >= totalElements ? totalElements : size + STACK_TRACE_PAGINATION_OFFSET;
  }
  yield put(
    fetchDataAction(STACK_TRACE_NAMESPACE)(URLS.logItemStackTrace(activeProject, path, pageSize)),
  );
  yield take(createFetchPredicate(STACK_TRACE_NAMESPACE));
}

function* fetchHistoryEntries() {
  const activeProject = yield select(activeProjectSelector);
  const logItemId = yield select(logItemIdSelector);
  yield put(
    fetchDataAction(HISTORY_NAMESPACE)(
      URLS.testItemsHistory(activeProject, logItemId, DEFAULT_HISTORY_DEPTH),
    ),
  );
  yield take(createFetchPredicate(HISTORY_NAMESPACE));
}

function* fetchDetailsLog(offset = 0) {
  yield all([
    put(clearAttachmentsAction()),
    put(fetchTestItemsAction({ offset })),
    call(fetchHistoryEntries),
    call(fetchLogItems),
    call(fetchActivity),
    put(clearLogPageStackTrace()),
  ]);
}

function* fetchLaunchLog(offset = 0) {
  yield all([
    put(fetchTestItemsAction({ offset })),
    call(fetchLogItems),
    put(fetchFirstAttachmentsAction()),
  ]);
}

function* fetchLogs(offset = 0) {
  const logViewMode = yield select(logViewModeSelector);
  if (logViewMode === DETAILED_LOG_VIEW) {
    yield call(fetchDetailsLog, offset);
  } else {
    yield call(fetchLaunchLog, offset);
  }
}

function* fetchWholePage() {
  yield put(setPageLoadingAction(true));
  const offset = yield select(logPageOffsetSelector);
  yield call(fetchParentItems);
  yield call(fetchLogs, offset);
  yield put(setPageLoadingAction(false));
}

function* fetchHistoryItemData() {
  const activeLogId = yield select(activeLogIdSelector);
  const prevActiveLogId = yield select(prevActiveLogIdSelector);
  const activeRetryId = yield select(activeRetryIdSelector);
  const prevActiveRetryId = yield select(prevActiveRetryIdSelector);
  if (activeLogId !== prevActiveLogId || activeRetryId !== prevActiveRetryId) {
    yield all([
      call(fetchLogItems),
      call(fetchActivity),
      put(clearAttachmentsAction()),
      put(clearLogPageStackTrace()),
    ]);
  } else {
    yield call(fetchLogItems);
  }
}

function* fetchLogPageData({ meta = {} }) {
  const isPathNameChanged = yield select(pathnameChangedSelector);
  yield put({ type: CLEAR_NESTED_STEPS });
  if (meta.refresh) {
    yield call(fetchLogs);
    return;
  }
  if (isPathNameChanged) {
    yield call(fetchWholePage);
  } else {
    const logViewMode = yield select(logViewModeSelector);
    if (logViewMode === DETAILED_LOG_VIEW) {
      yield call(fetchHistoryItemData);
    } else {
      yield call(fetchLogItems);
    }
  }
}

function* watchFetchLogPageData() {
  yield takeEvery(FETCH_LOG_PAGE_DATA, fetchLogPageData);
}

function* watchFetchHistoryEntries() {
  yield takeEvery(FETCH_HISTORY_ENTRIES, fetchHistoryEntries);
}

function* watchFetchLogPageStackTrace() {
  yield takeEvery(FETCH_LOG_PAGE_STACK_TRACE, fetchStackTrace);
}

export function* logSagas() {
  yield all([
    watchFetchLogPageData(),
    watchFetchHistoryEntries(),
    watchFetchLogPageStackTrace(),
    attachmentSagas(),
    sauceLabsSagas(),
    nestedStepSagas(),
  ]);
}
