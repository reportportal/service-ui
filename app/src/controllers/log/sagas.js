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
import { delay } from 'redux-saga';
import {
  fetchParentItems,
  itemsSelector,
  fetchTestItemsAction,
  logPageOffsetSelector,
} from 'controllers/testItem';
import { URLS } from 'common/urls';
import { activeProjectKeySelector } from 'controllers/user';
import {
  logItemIdSelector,
  pathnameChangedSelector,
  updatePagePropertiesAction,
} from 'controllers/pages';
import { debugModeSelector } from 'controllers/launch';
import { createFetchPredicate, fetchDataAction, handleError } from 'controllers/fetch';
import { fetch } from 'common/utils';
import {
  FETCH_NESTED_STEP_ERROR,
  FETCH_NESTED_STEP_SUCCESS,
  CLEAR_NESTED_STEPS,
} from 'controllers/log/nestedSteps/constants';
import { PAGE_KEY } from 'controllers/pagination';
import {
  loadMoreNestedStepAction,
  toggleNestedStepAction,
} from 'controllers/log/nestedSteps/actionCreators';
import { createNamespacedQuery } from 'common/utils/routingUtils';
import { FAILED } from 'common/constants/testStatuses';
import { ERROR } from 'common/constants/logLevels';
import {
  fetchErrorLogs,
  clearLogPageStackTrace,
  setPageLoadingAction,
  fetchHistoryItemsSuccessAction,
  setShouldShowLoadMoreAction,
  fetchLogPageStackTrace,
} from './actionCreators';
import {
  logItemsSelector,
  activeLogIdSelector,
  prevActiveLogIdSelector,
  activeRetryIdSelector,
  prevActiveRetryIdSelector,
  logViewModeSelector,
  isLaunchLogSelector,
  includeAllLaunchesSelector,
  historyItemsSelector,
  activeLogSelector,
} from './selectors';
import {
  HISTORY_LINE_DEFAULT_VALUE,
  FETCH_HISTORY_ITEMS_WITH_LOADING,
  NAMESPACE,
  ACTIVITY_NAMESPACE,
  DEFAULT_HISTORY_DEPTH,
  FETCH_LOG_PAGE_DATA,
  LOG_ITEMS_NAMESPACE,
  FETCH_LOG_PAGE_STACK_TRACE,
  STACK_TRACE_NAMESPACE,
  DETAILED_LOG_VIEW,
  HISTORY_LINE_TABLE_MODE,
  SET_INCLUDE_ALL_LAUNCHES,
  FETCH_HISTORY_LINE_ITEMS,
  NUMBER_OF_ITEMS_TO_LOAD,
  FETCH_ERROR_LOGS,
  ERROR_LOGS_NAMESPACE,
  FETCH_ERROR_LOG,
} from './constants';
import { collectLogPayload } from './sagaUtils';
import {
  attachmentSagas,
  clearAttachmentsAction,
  fetchFirstAttachmentsAction,
} from './attachments';
import { sauceLabsSagas } from './sauceLabs';
import { domainSelector as nestedStepsSelector, nestedStepSelector } from './nestedSteps/selectors';
import { nestedStepSagas } from './nestedSteps/sagas';
import { getFormattedPageLocation } from './utils';

function* fetchActivity() {
  const projectKey = yield select(activeProjectKeySelector);
  const activeLogItemId = yield select(activeLogIdSelector);
  yield put(fetchDataAction(ACTIVITY_NAMESPACE)(URLS.logItemActivity(projectKey, activeLogItemId)));
  yield take(createFetchPredicate(ACTIVITY_NAMESPACE));
}

function* fetchLogItems(payload = {}) {
  const { projectKey, filterLevel, activeLogItemId, query } = yield call(collectLogPayload);
  const namespace = payload.namespace || LOG_ITEMS_NAMESPACE;
  const logLevel = payload.level || filterLevel;
  const fetchParams = {
    ...payload.params,
    ...query,
  };
  const isLaunchLog = yield select(isLaunchLogSelector);
  const url = isLaunchLog
    ? URLS.launchLogs(projectKey, activeLogItemId, logLevel)
    : URLS.logItems(projectKey, activeLogItemId, logLevel);
  yield put(
    fetchDataAction(namespace)(url, {
      params: fetchParams,
    }),
  );
  yield take(createFetchPredicate(namespace));
}

function* fetchAllErrorLogs({
  payload: logItem,
  namespace = ERROR_LOGS_NAMESPACE,
  excludeLogContent = true,
  level,
}) {
  const { id } = logItem;
  const { projectKey, query, filterLevel } = yield call(collectLogPayload);
  let retryId = null;
  const logViewMode = yield select(logViewModeSelector);
  if (logViewMode === DETAILED_LOG_VIEW) {
    retryId = yield select(activeRetryIdSelector);
  }
  let cancelRequest = () => {};
  try {
    yield put(
      fetchDataAction(namespace)(URLS.errorLogs(projectKey, retryId || id, level || filterLevel), {
        params: { ...query, excludeLogContent },
        abort: (cancelFunc) => {
          cancelRequest = cancelFunc;
        },
      }),
    );
    yield take(createFetchPredicate(namespace));
  } catch (err) {
    yield handleError(err);
  } finally {
    if (yield cancelled()) {
      cancelRequest();
    }
  }
}

function* fetchStackTrace({ payload: logItem }) {
  yield call(fetchAllErrorLogs, {
    payload: logItem,
    namespace: STACK_TRACE_NAMESPACE,
    excludeLogContent: false,
    level: ERROR,
  });
}

function* loadStep({ id, errorLogPage }) {
  yield put(loadMoreNestedStepAction({ id, errorLogPage }));
  yield take([FETCH_NESTED_STEP_SUCCESS, FETCH_NESTED_STEP_ERROR]);

  let loadingRunning = true;
  while (loadingRunning) {
    const { loading } = yield select(nestedStepSelector, id);
    if (!loading) {
      loadingRunning = loading;
    }
    yield delay(10);
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
      const id = filteredNestedSteps[i].id;
      const { initial } = yield select(nestedStepSelector, id);
      if (initial) {
        yield loadStep({ id });
        yield call(waitLoadAllNestedSteps);
      }
    }
  }
}

function* navigateToErrorLogPage(query, initialPage) {
  yield put(
    updatePagePropertiesAction(
      createNamespacedQuery({ ...query, [PAGE_KEY]: initialPage }, NAMESPACE),
    ),
  );
  yield take(createFetchPredicate(LOG_ITEMS_NAMESPACE));
}

function* fetchErrorLog({ payload: { errorLogInfo, callback } }) {
  const { id: errorLogId, pagesLocation } = errorLogInfo;
  const { query } = yield call(collectLogPayload);
  const [initialPage] = Object.values(pagesLocation[0]);
  // format location as first item props reference to main page
  const formattedPageLocation = getFormattedPageLocation(pagesLocation);
  const skipIds = [];

  // single log. highlight or move to another page
  if (pagesLocation.length === 1) {
    if (+query[PAGE_KEY] !== +initialPage) {
      yield navigateToErrorLogPage(query, initialPage);
    }
  } else {
    // change page if initial page is not the same
    if (+query[PAGE_KEY] !== +initialPage) {
      yield navigateToErrorLogPage(query, initialPage);
      // check is first nested step is FAILED
      const logItems = yield select(logItemsSelector);
      const [parentId] = formattedPageLocation[0];
      const isWantedStepFailed = logItems.find(
        (log) => +log.id === +parentId && log.status === FAILED,
      );
      // wait until wanted step is load
      if (isWantedStepFailed) {
        let isWrongId = true;
        while (isWrongId) {
          const {
            payload: { id: takenId },
          } = yield take([FETCH_NESTED_STEP_SUCCESS, FETCH_NESTED_STEP_ERROR]);
          if (+takenId === +parentId) {
            isWrongId = false;
            // prevent collapse failed step as they unfold by default
            skipIds.push(+parentId);
          }
        }
      }
    }

    for (let i = 0; i < formattedPageLocation.length; i += 1) {
      const [id, page] = formattedPageLocation[i];
      const { initial, content } = yield select(nestedStepSelector, id);
      const nextLocation = formattedPageLocation[i + 1];
      const wantedId = nextLocation ? nextLocation[0] : errorLogId;
      const isLogLoaded = content.find((log) => +log.id === +wantedId);

      if (initial || !isLogLoaded) {
        yield loadStep({ id, errorLogPage: page });
      }
      // add next id to skipIds arr if next step has failed status
      const { collapsed, content: stepContent } = yield select(nestedStepSelector, id);
      const step = stepContent.find((log) => +log.id === +wantedId && log.status === FAILED);
      if (step && collapsed) {
        skipIds.push(+wantedId);
      }
    }
  }

  yield call(waitLoadAllNestedSteps);

  const idsToCheckIsCollapsed = formattedPageLocation
    .map(([id]) => +id)
    .filter((id) => !skipIds.includes(id));
  for (let i = 0; i < idsToCheckIsCollapsed.length; i += 1) {
    const id = idsToCheckIsCollapsed[i];
    const { collapsed } = yield select(nestedStepSelector, id);
    if (collapsed) {
      yield put(toggleNestedStepAction({ id }));
    }
  }

  yield callback && callback();
}

function* fetchHistoryItems({ payload } = { payload: {} }) {
  const { loadMore, callback } = payload;
  const projectKey = yield select(activeProjectKeySelector);
  const logItemId = yield select(logItemIdSelector);
  const historyItems = yield select(historyItemsSelector);
  const isAllLaunches = yield select(includeAllLaunchesSelector);
  const historyLineMode = isAllLaunches ? HISTORY_LINE_TABLE_MODE : HISTORY_LINE_DEFAULT_VALUE;
  const historyDepth = loadMore
    ? historyItems.length + NUMBER_OF_ITEMS_TO_LOAD
    : DEFAULT_HISTORY_DEPTH;
  const response = yield call(
    fetch,
    URLS.testItemsHistory(projectKey, historyDepth, historyLineMode, logItemId),
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
