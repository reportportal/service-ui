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

import { takeEvery, all, put, call, select, take } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { getStorageItem } from 'common/utils';
import { concatFetchDataAction, createFetchPredicate } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { LEVEL_SUITE } from 'common/constants/launchLevels';
import {
  isTestItemsListSelector,
  levelSelector,
  namespaceSelector,
  fetchTestItemsAction,
  SET_PAGE_LOADING,
  DEFAULT_LAUNCHES_LIMIT,
} from 'controllers/testItem';
import {
  testItemIdsArraySelector,
  filterIdSelector,
  launchIdSelector,
  pagePropertiesSelector,
} from 'controllers/pages';
import { isOldHistorySelector } from 'controllers/appInfo';
import {
  fetchItemsHistoryAction,
  resetHistoryAction,
  setHistoryPageLoadingAction,
  fetchFilterHistoryAction,
} from './actionCreators';
import { historyPaginationSelector, filterForCompareSelector, historySelector } from './selectors';
import {
  HISTORY_ITEMS_TO_LOAD,
  FETCH_ITEMS_HISTORY,
  HISTORY_DEPTH_CONFIG,
  HISTORY_BASE_DEFAULT_VALUE,
  NAMESPACE,
  FILTER_HISTORY_NAMESPACE,
  FETCH_HISTORY_PAGE_INFO,
  REFRESH_HISTORY,
  SET_FILTER_FOR_COMPARE,
  FETCH_FILTER_HISTORY,
  UNIQUE_ID_GROUPING_FIELD,
  TEST_CASE_HASH_GROUPING_FIELD,
} from './constants';

function* getHistoryParams({ loadMore } = {}) {
  const pagination = yield select(historyPaginationSelector);
  const itemIdsArray = yield select(testItemIdsArraySelector);
  const launchId = yield select(launchIdSelector);
  const namespace = yield select(namespaceSelector);
  const query = yield select(pagePropertiesSelector, namespace);
  const isTestItemsList = yield select(isTestItemsListSelector);
  const level = yield select(levelSelector);

  const pageNumber = loadMore ? pagination.number + 1 : pagination.number;
  const parentItemId = itemIdsArray.length > 1 ? itemIdsArray[itemIdsArray.length - 1] : undefined;
  const params = {
    ...query,
    'page.page': pageNumber,
    'page.size': pagination.size,
  };
  if (parentItemId) {
    params['filter.eq.parentId'] = parentItemId;
  } else if (launchId) {
    params['filter.eq.launchId'] = launchId;

    if (level === LEVEL_SUITE) {
      params['filter.!ex.parentId'] = true;
    }
  } else if (isTestItemsList) {
    params.filterId = yield select(filterIdSelector);
  }

  return params;
}

function* fetchItemsHistory({ payload = {} }) {
  if (payload.loadMore) {
    yield put(setHistoryPageLoadingAction(true));
  }
  const activeProject = yield select(activeProjectSelector);
  const params = yield call(getHistoryParams, payload);

  const historyDepth =
    payload.historyDepth ||
    getStorageItem(HISTORY_DEPTH_CONFIG.name) ||
    HISTORY_DEPTH_CONFIG.defaultValue;
  const historyBase = payload.historyBase || HISTORY_BASE_DEFAULT_VALUE;

  yield put(
    concatFetchDataAction(NAMESPACE, payload.loadMore)(
      URLS.testItemsHistory(activeProject, historyDepth, historyBase),
      { params },
    ),
  );

  if (payload.loadMore) {
    yield take(createFetchPredicate(NAMESPACE));
    const filterForCompare = yield select(filterForCompareSelector);
    if (filterForCompare) {
      yield put(fetchFilterHistoryAction({ filter: filterForCompare, loadMore: payload.loadMore }));
      yield take(createFetchPredicate(FILTER_HISTORY_NAMESPACE));
    }
    yield put(setHistoryPageLoadingAction(false));
  }
}

function* fetchHistoryPageInfo() {
  yield put(setHistoryPageLoadingAction(true));

  yield put(resetHistoryAction());
  yield put(fetchTestItemsAction());
  yield take((action) => action.type === SET_PAGE_LOADING && action.payload === false);
  yield put(fetchItemsHistoryAction());

  yield take(createFetchPredicate(NAMESPACE));
  yield put(setHistoryPageLoadingAction(false));
}

function* refreshHistory({ payload }) {
  yield put(setHistoryPageLoadingAction(true));
  yield put(resetHistoryAction());
  yield put(fetchItemsHistoryAction(payload || undefined));
  yield take(createFetchPredicate(NAMESPACE));

  const filterForCompare = yield select(filterForCompareSelector);
  if (filterForCompare) {
    yield put(fetchFilterHistoryAction({ filter: filterForCompare }));
    yield take(createFetchPredicate(FILTER_HISTORY_NAMESPACE));
  }
  yield put(setHistoryPageLoadingAction(false));
}

function* fetchFilterHistory({ payload: { filter, loadMore } }) {
  const activeProject = yield select(activeProjectSelector);
  const itemsHistory = yield select(historySelector);
  const isOldHistory = yield select(isOldHistorySelector);
  const historyGroupingFieldKey = isOldHistory
    ? UNIQUE_ID_GROUPING_FIELD
    : TEST_CASE_HASH_GROUPING_FIELD;

  if (!itemsHistory.length) {
    return;
  }

  const historyDepth = 1;
  const params = {
    filterId: filter.id,
    launchesLimit: DEFAULT_LAUNCHES_LIMIT,
    isLatest: true,
  };
  let items = itemsHistory;

  if (loadMore) {
    items = itemsHistory.slice(-HISTORY_ITEMS_TO_LOAD);
  }
  params[`filter.in.${historyGroupingFieldKey}`] = items
    .map((item) => item.groupingField)
    .join(',');

  yield put(
    concatFetchDataAction(FILTER_HISTORY_NAMESPACE, loadMore)(
      URLS.testItemsHistory(activeProject, historyDepth, 'comparing'),
      {
        params,
      },
    ),
  );
}

function* watchFetchHistory() {
  yield takeEvery(FETCH_ITEMS_HISTORY, fetchItemsHistory);
}

function* watchFetchHistoryPageInfo() {
  yield takeEvery(FETCH_HISTORY_PAGE_INFO, fetchHistoryPageInfo);
}

function* watchRefreshHistory() {
  yield takeEvery([REFRESH_HISTORY, SET_FILTER_FOR_COMPARE], refreshHistory);
}

function* watchFetchFilterHistory() {
  yield takeEvery(FETCH_FILTER_HISTORY, fetchFilterHistory);
}

export function* historySagas() {
  yield all([
    watchFetchHistory(),
    watchFetchHistoryPageInfo(),
    watchRefreshHistory(),
    watchFetchFilterHistory(),
  ]);
}
