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

import { all, call, cancelled, put, select, take, takeEvery } from 'redux-saga/effects';
import {
  fetchParentItems,
  itemsSelector,
  fetchTestItemsAction,
  logPageOffsetSelector,
} from 'controllers/testItem';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import {
  logItemIdSelector,
  pathnameChangedSelector,
  updatePagePropertiesAction,
} from 'controllers/pages';
import { debugModeSelector } from 'controllers/launch';
import { createFetchPredicate, fetchDataAction, handleError } from 'controllers/fetch';
import { fetch, isEmptyObject } from 'common/utils';
import {
  HISTORY_LINE_DEFAULT_VALUE,
  FETCH_HISTORY_ITEMS_WITH_LOADING,
  fetchErrorLogs,
  logItemsSelector,
} from 'controllers/log';
import {
  FETCH_NESTED_STEP_ERROR,
  FETCH_NESTED_STEP_SUCCESS,
} from 'controllers/log/nestedSteps/constants';
import { PAGE_KEY } from 'controllers/pagination';
import {
  loadMoreNestedStepAction,
  toggleNestedStepAction,
} from 'controllers/log/nestedSteps/actionCreators';
import { createNamespacedQuery } from 'common/utils/routingUtils';
import { FAILED } from 'common/constants/testStatuses';
import { delay } from 'redux-saga';
import { collectLogPayload } from './sagaUtils';
import {
  NAMESPACE,
  ACTIVITY_NAMESPACE,
  DEFAULT_HISTORY_DEPTH,
  FETCH_LOG_PAGE_DATA,
  LOG_ITEMS_NAMESPACE,
  FETCH_LOG_PAGE_STACK_TRACE,
  STACK_TRACE_NAMESPACE,
  STACK_TRACE_PAGINATION_OFFSET,
  DETAILED_LOG_VIEW,
  HISTORY_LINE_TABLE_MODE,
  SET_INCLUDE_ALL_LAUNCHES,
  FETCH_HISTORY_LINE_ITEMS,
  NUMBER_OF_ITEMS_TO_LOAD,
  FETCH_ERROR_LOGS,
  ERROR_LOGS_NAMESPACE,
  FETCH_ERROR_LOG,
} from './constants';
import {
  activeLogIdSelector,
  prevActiveLogIdSelector,
  activeRetryIdSelector,
  prevActiveRetryIdSelector,
  logStackTracePaginationSelector,
  logViewModeSelector,
  isLaunchLogSelector,
  includeAllLaunchesSelector,
  historyItemsSelector,
  activeLogSelector,
} from './selectors';
import {
  attachmentSagas,
  clearAttachmentsAction,
  fetchFirstAttachmentsAction,
} from './attachments';
import { sauceLabsSagas } from './sauceLabs';
import {
  nestedStepSagas,
  CLEAR_NESTED_STEPS,
  nestedStepSelector,
  nestedStepsSelector,
} from './nestedSteps';

import {
  clearLogPageStackTrace,
  setPageLoadingAction,
  fetchHistoryItemsSuccessAction,
  setShouldShowLoadMoreAction,
  fetchLogPageStackTrace,
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

function* fetchAllErrorLogs({ payload: logItem }) {
  const { id } = logItem;
  const { activeProject, query, filterLevel } = yield call(collectLogPayload);
  const retryId = yield select(activeRetryIdSelector);
  let cancelRequest = () => {};
  try {
    yield put(
      fetchDataAction(ERROR_LOGS_NAMESPACE)(
        URLS.errorLogs(activeProject, retryId || id, filterLevel),
        {
          params: { ...query, excludeLogContent: true },
          abort: (cancelFunc) => {
            cancelRequest = cancelFunc;
          },
        },
      ),
    );
    yield take(createFetchPredicate(ERROR_LOGS_NAMESPACE));
  } catch (err) {
    yield handleError(err);
  } finally {
    if (yield cancelled()) {
      cancelRequest();
    }
  }
}

function* waitLoadAllNestedSteps() {
  const nestedSteps = yield select(nestedStepsSelector);
  const allNestedSteps = Object.values(nestedSteps);
  if (allNestedSteps.length > 0) {
    let filteredNestedSteps = [];
    allNestedSteps.forEach((item) => {
      const filteredContent = item.content.filter(
        (step) => step.hasContent && step.status === FAILED,
      );
      filteredNestedSteps = filteredNestedSteps.concat(filteredContent);
    });

    for (let i = 0; i < filteredNestedSteps.length; i += 1) {
      const { initial } = yield select(nestedStepSelector, filteredNestedSteps[i].id);
      if (initial) {
        yield put(loadMoreNestedStepAction({ id: filteredNestedSteps[i].id }));
        yield take([FETCH_NESTED_STEP_SUCCESS, FETCH_NESTED_STEP_ERROR]);

        let loadingRunning = true;
        while (loadingRunning) {
          yield delay(100);
          const { loading: loadingState } = yield select(
            nestedStepSelector,
            filteredNestedSteps[i].id,
          );
          if (!loadingState) {
            loadingRunning = loadingState;
          }
        }

        yield call(waitLoadAllNestedSteps);
      }
    }
  }
}

function* fetchErrorLog({ payload: { errorLogInfo, callback } }) {
  const { id: errorLogId, pagesLocation, parentsIds = [] } = errorLogInfo;
  const { query } = yield call(collectLogPayload);
  const parentId = parentsIds[parentsIds.length - 1];

  if (pagesLocation.length === 1) {
    const [errorLogData] = pagesLocation;
    const [errorLogPage] = Object.values(errorLogData);

    if (!parentId) {
      if (+query[PAGE_KEY] !== +errorLogPage) {
        yield put(
          updatePagePropertiesAction(
            createNamespacedQuery({ ...query, [PAGE_KEY]: errorLogPage }, NAMESPACE),
          ),
        );
        yield take(createFetchPredicate(LOG_ITEMS_NAMESPACE));
      }
    } else if (parentId) {
      const { content } = yield select(nestedStepSelector, parentId);
      if (!content.length) {
        if (errorLogPage !== 1) {
          yield take([FETCH_NESTED_STEP_SUCCESS, FETCH_NESTED_STEP_ERROR]);
        }
        yield put(loadMoreNestedStepAction({ id: parentId, errorLogPage }));
        yield take([FETCH_NESTED_STEP_SUCCESS, FETCH_NESTED_STEP_ERROR]);

        const logItemData = yield select(logItemsSelector);
        const logItem = logItemData.find((item) => +item.id === +parentId);
        if (logItem && logItem.status !== FAILED) {
          yield put(toggleNestedStepAction({ id: parentId }));
        }
      } else {
        const { content: nestedStepContent } = yield select(nestedStepSelector, parentId);
        if (!nestedStepContent.find((item) => +item.id === +errorLogId)) {
          yield put(loadMoreNestedStepAction({ id: parentId, errorLogPage }));
          yield take([FETCH_NESTED_STEP_SUCCESS, FETCH_NESTED_STEP_ERROR]);
        }

        if (parentsIds.length) {
          for (let i = 0; i < parentsIds.length; i += 1) {
            const { collapsed } = yield select(nestedStepSelector, parentsIds[i]);
            if (collapsed) {
              yield put(toggleNestedStepAction({ id: parentsIds[i] }));
            }
          }
        }
      }
    }

    yield call(waitLoadAllNestedSteps);

    callback && callback();
  } else {
    const [processLogData] = pagesLocation;
    const [processLogPage] = Object.values(processLogData);
    const nextPagesLocation = pagesLocation.slice(1);

    if (!parentId && +query[PAGE_KEY] !== +processLogPage) {
      yield put(
        updatePagePropertiesAction(
          createNamespacedQuery({ ...query, [PAGE_KEY]: processLogPage }, NAMESPACE),
        ),
      );
      yield take(createFetchPredicate(LOG_ITEMS_NAMESPACE));
    }

    let collectedParentsIds;
    if (!parentId) {
      collectedParentsIds = pagesLocation.slice(0, -1).map((item) => Object.keys(item)[0]);
    }

    yield call(fetchErrorLog, {
      payload: {
        errorLogInfo: {
          id: errorLogId,
          pagesLocation: nextPagesLocation,
          parentsIds: parentId ? parentsIds : collectedParentsIds,
        },
        callback,
      },
    });
  }
}

function* fetchHistoryItems({ payload } = { payload: {} }) {
  const { loadMore, callback } = payload;
  const activeProject = yield select(activeProjectSelector);
  const logItemId = yield select(logItemIdSelector);
  const historyItems = yield select(historyItemsSelector);
  const isAllLaunches = yield select(includeAllLaunchesSelector);
  const historyLineMode = isAllLaunches ? HISTORY_LINE_TABLE_MODE : HISTORY_LINE_DEFAULT_VALUE;
  const historyDepth = loadMore
    ? historyItems.length + NUMBER_OF_ITEMS_TO_LOAD
    : DEFAULT_HISTORY_DEPTH;
  const response = yield call(
    fetch,
    URLS.testItemsHistory(activeProject, historyDepth, historyLineMode, logItemId),
  );

  yield put(fetchHistoryItemsSuccessAction(response.content));
  if (!loadMore) {
    const currentItems = yield select(historyItemsSelector);
    const loadedItems = currentItems.length - DEFAULT_HISTORY_DEPTH;
    yield put(setShouldShowLoadMoreAction(loadedItems >= 0));
  }
  callback && callback();
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
  let logItem = yield select(activeLogSelector);
  yield put({ type: CLEAR_NESTED_STEPS });
  if (meta.refresh) {
    const offset = yield select(logPageOffsetSelector);
    yield all([
      put(fetchTestItemsAction({ offset })),
      put(fetchLogPageStackTrace(logItem)),
      put(fetchFirstAttachmentsAction()),
      put(fetchErrorLogs(logItem)),
      call(fetchLogs),
    ]);
    return;
  }
  if (isPathNameChanged) {
    yield call(fetchWholePage);
    logItem = yield select(activeLogSelector);
    yield put(fetchErrorLogs(logItem));
  } else {
    const logViewMode = yield select(logViewModeSelector);
    if (logViewMode === DETAILED_LOG_VIEW) {
      yield call(fetchHistoryItemData);
      yield put(fetchErrorLogs(logItem));
    } else {
      yield call(fetchLogItems);
    }
  }
}

function* fetchHistoryItemsWithLoading() {
  yield put(setPageLoadingAction(true));
  yield call(fetchHistoryItems);
  yield put(setPageLoadingAction(false));
}

function* watchFetchLogPageData() {
  yield takeEvery(FETCH_LOG_PAGE_DATA, fetchLogPageData);
}

function* watchFetchLogPageStackTrace() {
  yield takeEvery(FETCH_LOG_PAGE_STACK_TRACE, fetchStackTrace);
}

function* watchFetchErrorLogs() {
  yield takeEvery(FETCH_ERROR_LOGS, fetchAllErrorLogs);
}

function* watchFetchErrorLog() {
  yield takeEvery(FETCH_ERROR_LOG, fetchErrorLog);
}

function* watchFetchLineHistory() {
  yield takeEvery([SET_INCLUDE_ALL_LAUNCHES, FETCH_HISTORY_LINE_ITEMS], fetchHistoryItems);
}

function* watchUpdateItemStatus() {
  yield takeEvery(FETCH_HISTORY_ITEMS_WITH_LOADING, fetchHistoryItemsWithLoading);
}

export function* logSagas() {
  yield all([
    watchFetchLogPageData(),
    watchFetchLogPageStackTrace(),
    watchFetchErrorLogs(),
    watchFetchErrorLog(),
    watchFetchLineHistory(),
    attachmentSagas(),
    sauceLabsSagas(),
    nestedStepSagas(),
    watchUpdateItemStatus(),
  ]);
}
