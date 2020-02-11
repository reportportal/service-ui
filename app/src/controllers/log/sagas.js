/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { all, call, put, select, take, takeEvery } from 'redux-saga/effects';
import {
  fetchParentItems,
  fetchTestItemsAction,
  logPageOffsetSelector,
} from 'controllers/testItem';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { logItemIdSelector, pathnameChangedSelector } from 'controllers/pages';
import { debugModeSelector } from 'controllers/launch';
import { createFetchPredicate, fetchDataAction } from 'controllers/fetch';
import { isEmptyObject } from 'common/utils';
import { collectLogPayload } from './sagaUtils';
import {
  ACTIVITY_NAMESPACE,
  DEFAULT_HISTORY_DEPTH,
  FETCH_HISTORY_ENTRIES,
  FETCH_LOG_PAGE_DATA,
  HISTORY_NAMESPACE,
  LOG_ITEMS_NAMESPACE,
  FETCH_LOG_PAGE_STACK_TRACE,
  STACK_TRACE_NAMESPACE,
  STACK_TRACE_PAGINATION_OFFSET,
  DETAILED_LOG_VIEW,
} from './constants';
import {
  activeLogIdSelector,
  prevActiveLogIdSelector,
  activeRetryIdSelector,
  prevActiveRetryIdSelector,
  logStackTracePaginationSelector,
  logViewModeSelector,
  isLaunchLogSelector,
} from './selectors';
import {
  attachmentSagas,
  clearAttachmentsAction,
  fetchFirstAttachmentsAction,
} from './attachments';
import { sauceLabsSagas } from './sauceLabs';
import { nestedStepSagas, CLEAR_NESTED_STEPS } from './nestedSteps';
import { clearLogPageStackTrace, setPageLoadingAction } from './actionCreators';

function* fetchActivity() {
  const activeProject = yield select(activeProjectSelector);
  const activeLogItemId = yield select(activeLogIdSelector);
  yield put(
    fetchDataAction(ACTIVITY_NAMESPACE)(URLS.logItemActivity(activeProject, activeLogItemId)),
  );
  yield take(createFetchPredicate(ACTIVITY_NAMESPACE));
}

function* fetchLogItems(payload = {}) {
  const { activeProject, params, filterLevel, activeLogItemId, query } = yield call(
    collectLogPayload,
  );
  const namespace = payload.namespace || LOG_ITEMS_NAMESPACE;
  const logLevel = payload.level || filterLevel;
  const fetchParams = {
    ...params,
    ...payload.params,
    ...query,
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

function* fetchStackTrace({ payload: logItem }) {
  const { activeProject } = yield call(collectLogPayload);
  const page = yield select(logStackTracePaginationSelector);
  const { path } = logItem;
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
      URLS.testItemsHistory(activeProject, DEFAULT_HISTORY_DEPTH, 'line', logItemId),
    ),
  );
  yield take(createFetchPredicate(HISTORY_NAMESPACE));
}

function* fetchDetailsLog(offset = 0) {
  const fetchLogEffects = [
    put(clearAttachmentsAction()),
    put(fetchTestItemsAction({ offset })),
    call(fetchLogItems),
    put(clearLogPageStackTrace()),
  ];

  const isDebugMode = yield select(debugModeSelector);
  if (!isDebugMode) {
    fetchLogEffects.push(call(fetchHistoryEntries), call(fetchActivity));
  }
  yield all(fetchLogEffects);
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
  yield call(fetchParentItems);
  const offset = yield select(logPageOffsetSelector);
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
    const offset = yield select(logPageOffsetSelector);
    yield call(fetchLogs, offset);
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
