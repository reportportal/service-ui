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

import { takeEvery, all, put, select, take } from 'redux-saga/effects';
import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import { getStorageItem } from 'common/utils';
import { activeProjectSelector } from 'controllers/user';
import { fetchTestItemsAction, SET_PAGE_LOADING } from 'controllers/testItem';
import {
  fetchItemsHistoryAction,
  setItemsHistory,
  setVisibleItemsCount,
  resetHistory,
} from './actionCreators';
import { itemsHistorySelector, visibleItemsCountSelector, historyItemsSelector } from './selectors';
import {
  FETCH_ITEMS_HISTORY,
  HISTORY_ITEMS_TO_LOAD,
  HISTORY_DEPTH_CONFIG,
  NAMESPACE,
  FETCH_HISTORY_PAGE_INFO,
  RESET_FETCH_HISTORY,
} from './constants';

function* getHistory({ payload }) {
  const testItems = yield select(itemsHistorySelector);
  const visibleItemsCount = yield select(visibleItemsCountSelector);
  let startSliceIndex;
  let endSliceIndex;
  if (payload && payload.loadMore) {
    startSliceIndex = visibleItemsCount;
    endSliceIndex = visibleItemsCount + HISTORY_ITEMS_TO_LOAD;
  } else {
    const defaultVisibleItems =
      (testItems.length <= HISTORY_ITEMS_TO_LOAD && testItems.length) || HISTORY_ITEMS_TO_LOAD;
    startSliceIndex = 0;
    endSliceIndex = defaultVisibleItems;
  }
  const activeProject = yield select(activeProjectSelector);
  const itemsIds = testItems
    .slice(startSliceIndex, endSliceIndex)
    .map((item) => item && item.id)
    .join(',');
  yield put(
    fetchDataAction(NAMESPACE)(
      URLS.testItemsHistory(
        activeProject,
        itemsIds,
        (payload && payload.historyDepth) ||
          getStorageItem(HISTORY_DEPTH_CONFIG.name) ||
          HISTORY_DEPTH_CONFIG.defaultValue,
      ),
    ),
  );
  yield put(
    setVisibleItemsCount(
      testItems.slice(startSliceIndex, endSliceIndex).length + visibleItemsCount,
    ),
  );
}

function* getHistoryPageInfo() {
  yield put(resetHistory());
  yield put(fetchTestItemsAction());
  yield take((action) => action.type === SET_PAGE_LOADING && action.payload === false);
  const historyItems = yield select(historyItemsSelector);
  yield put(setItemsHistory(historyItems));
  yield put(fetchItemsHistoryAction());
}

function* getNewHistory() {
  yield put(resetHistory());
  yield put(fetchItemsHistoryAction());
}

function* watchFetchHistory() {
  yield takeEvery(FETCH_ITEMS_HISTORY, getHistory);
}

function* watchFetchHistoryPageInfo() {
  yield takeEvery(FETCH_HISTORY_PAGE_INFO, getHistoryPageInfo);
}

function* watchResetFetchHstory() {
  yield takeEvery(RESET_FETCH_HISTORY, getNewHistory);
}
export function* historySagas() {
  yield all([watchFetchHistory(), watchFetchHistoryPageInfo(), watchResetFetchHstory()]);
}
