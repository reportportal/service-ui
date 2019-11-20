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
import {
  namespaceSelector,
  levelSelector,
  fetchTestItemsAction,
  SET_PAGE_LOADING,
} from 'controllers/testItem';
import {
  testItemIdsArraySelector,
  launchIdSelector,
  pagePropertiesSelector,
} from 'controllers/pages';
import {
  fetchItemsHistoryAction,
  resetHistoryAction,
  setHistoryPageLoadingAction,
} from './actionCreators';
import { historyPaginationSelector } from './selectors';
import {
  FETCH_ITEMS_HISTORY,
  HISTORY_DEPTH_CONFIG,
  NAMESPACE,
  FETCH_HISTORY_PAGE_INFO,
  REFRESH_HISTORY,
} from './constants';

function* getHistoryParams({ loadMore } = {}) {
  const pagination = yield select(historyPaginationSelector);
  const itemIdsArray = yield select(testItemIdsArraySelector);
  const launchId = yield select(launchIdSelector);
  const namespace = yield select(namespaceSelector);
  const query = yield select(pagePropertiesSelector, namespace);

  const pageNumber = loadMore ? pagination.number + 1 : pagination.number;
  const parentItemId = itemIdsArray.length > 1 ? itemIdsArray[itemIdsArray.length - 1] : undefined;
  const params = {
    ...query,
    'page.page': pageNumber,
    'page.size': pagination.size,
  };
  if (parentItemId) {
    params['filter.eq.parentId'] = parentItemId;
  } else {
    params['filter.eq.launchId'] = launchId;
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

  yield put(
    concatFetchDataAction(NAMESPACE, payload.loadMore)(
      URLS.testItemsHistory(activeProject, historyDepth),
      { params },
    ),
  );
  if (payload.loadMore) {
    yield take(createFetchPredicate(NAMESPACE));
    yield put(setHistoryPageLoadingAction(false));
  }
}

function* fetchHistoryPageInfo() {
  yield put(setHistoryPageLoadingAction(true));

  const level = yield select(levelSelector);
  yield put(resetHistoryAction());

  // We must fetch test items to calculate their corresponding item level.
  if (!level) {
    yield put(fetchTestItemsAction());
    yield take((action) => action.type === SET_PAGE_LOADING && action.payload === false);
  }

  yield put(fetchItemsHistoryAction());
  yield take(createFetchPredicate(NAMESPACE));
  yield put(setHistoryPageLoadingAction(false));
}

function* refreshHistory() {
  yield put(setHistoryPageLoadingAction(true));
  yield put(resetHistoryAction());
  yield put(fetchItemsHistoryAction());
  yield take(createFetchPredicate(NAMESPACE));
  yield put(setHistoryPageLoadingAction(false));
}

function* watchFetchHistory() {
  yield takeEvery(FETCH_ITEMS_HISTORY, fetchItemsHistory);
}

function* watchFetchHistoryPageInfo() {
  yield takeEvery(FETCH_HISTORY_PAGE_INFO, fetchHistoryPageInfo);
}

function* watchRefreshHistory() {
  yield takeEvery(REFRESH_HISTORY, refreshHistory);
}
export function* historySagas() {
  yield all([watchFetchHistory(), watchFetchHistoryPageInfo(), watchRefreshHistory()]);
}
