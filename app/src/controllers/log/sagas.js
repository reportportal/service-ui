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
  itemsSelector,
  fetchTestItemsAction,
  logPageOffsetSelector,
} from 'controllers/testItem';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { logItemIdSelector, pathnameChangedSelector } from 'controllers/pages';
import { debugModeSelector } from 'controllers/launch';
import { createFetchPredicate, fetchDataAction } from 'controllers/fetch';
import { fetch, isEmptyObject } from 'common/utils';
import { collectLogPayload } from './sagaUtils';
import {
  ACTIVITY_NAMESPACE,
  DEFAULT_HISTORY_DEPTH,
  FETCH_LOG_PAGE_DATA,
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
import {
  clearLogPageStackTrace,
  setPageLoadingAction,
  fetchHistoryItemsSuccessAction,
} from './actionCreators';

function* fetchActivity() {
  const activeProject = yield select(activeProjectSelector);
  const activeLogItemId = yield select(activeLogIdSelector);
  yield put(
    fetchDataAction(ACTIVITY_NAMESPACE)(URLS.logItemActivity(activeProject, activeLogItemId)),
  );
  yield take(createFetchPredicate(ACTIVITY_NAMESPACE));
}

function* fetchLogItems(payload = {}) {
  const { activeProject, filterLevel, activeLogItemId, query } = yield call(collectLogPayload);
  const namespace = payload.namespace || LOG_ITEMS_NAMESPACE;
  const logLevel = payload.level || filterLevel;
  const fetchParams = {
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
  const activeProject = yield select(activeProjectSelector);
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

function* fetchHistoryItems() {
  const activeProject = yield select(activeProjectSelector);
  const logItemId = yield select(logItemIdSelector);

  const response = yield call(
    fetch,
    URLS.testItemsHistory(activeProject, DEFAULT_HISTORY_DEPTH, 'line', logItemId),
  );

  yield put(fetchHistoryItemsSuccessAction(response.content));
}

function* fetchDetailsLog() {
  const fetchLogEffects = [
    put(clearAttachmentsAction()),
    call(fetchLogItems),
    put(clearLogPageStackTrace()),
  ];

  const isDebugMode = yield select(debugModeSelector);
  if (!isDebugMode) {
    fetchLogEffects.push(call(fetchHistoryItems), call(fetchActivity));
  }
  yield all(fetchLogEffects);
}

function* fetchLaunchLog() {
  yield all([call(fetchLogItems), put(fetchFirstAttachmentsAction())]);
}

function* fetchLogs() {
  const logViewMode = yield select(logViewModeSelector);
  if (logViewMode === DETAILED_LOG_VIEW) {
    yield call(fetchDetailsLog);
  } else {
    yield call(fetchLaunchLog);
  }
}

function* fetchWholePage() {
  yield put(setPageLoadingAction(true));
  yield call(fetchParentItems);
  const testItems = yield select(itemsSelector);
  if (!testItems.length) {
    const offset = yield select(logPageOffsetSelector);

    yield put(fetchTestItemsAction({ offset }));
  }
  yield call(fetchLogs);
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
    yield all([put(fetchTestItemsAction({ offset })), call(fetchLogs)]);
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

function* watchFetchLogPageStackTrace() {
  yield takeEvery(FETCH_LOG_PAGE_STACK_TRACE, fetchStackTrace);
}

export function* logSagas() {
  yield all([
    watchFetchLogPageData(),
    watchFetchLogPageStackTrace(),
    attachmentSagas(),
    sauceLabsSagas(),
    nestedStepSagas(),
  ]);
}
