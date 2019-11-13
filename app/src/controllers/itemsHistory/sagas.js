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

import { takeEvery, all, put, select } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { getStorageItem } from 'common/utils';
import { concatFetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { fetchParentItems } from 'controllers/testItem';
import { testItemIdsArraySelector } from 'controllers/pages';
import { fetchItemsHistoryAction, resetHistoryAction } from './actionCreators';
import { historyPaginationSelector } from './selectors';
import {
  FETCH_ITEMS_HISTORY,
  HISTORY_DEPTH_CONFIG,
  NAMESPACE,
  FETCH_HISTORY_PAGE_INFO,
  REFRESH_HISTORY,
} from './constants';

function* fetchItemsHistory({ payload = {} }) {
  const pagination = yield select(historyPaginationSelector);
  const activeProject = yield select(activeProjectSelector);
  const itemIdsArray = yield select(testItemIdsArraySelector);
  let parentItemId;
  if (itemIdsArray.length > 1) {
    parentItemId = itemIdsArray[itemIdsArray.length - 1];
  }
  let pageNumber = pagination.number;
  if (payload.loadMore) {
    pageNumber += 1;
  }
  const params = {
    'filter.eq.parentId': parentItemId,
    'page.page': pageNumber,
    'page.size': pagination.size,
  };
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
}

function* fetchHistoryPageInfo() {
  yield put(resetHistoryAction());
  yield put(fetchParentItems());
  yield put(fetchItemsHistoryAction());
}

function* refreshHistory() {
  yield put(resetHistoryAction());
  yield put(fetchItemsHistoryAction());
}

function* watchFetchHistory() {
  yield takeEvery(FETCH_ITEMS_HISTORY, fetchItemsHistory);
}

function* watchFetchHistoryPageInfo() {
  yield takeEvery(FETCH_HISTORY_PAGE_INFO, fetchHistoryPageInfo);
}

function* watchResetFetchHstory() {
  yield takeEvery(REFRESH_HISTORY, refreshHistory);
}
export function* historySagas() {
  yield all([watchFetchHistory(), watchFetchHistoryPageInfo(), watchResetFetchHstory()]);
}
