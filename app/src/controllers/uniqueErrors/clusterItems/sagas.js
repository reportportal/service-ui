/*
 * Copyright 2021 EPAM Systems
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

import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import { handleError } from 'controllers/fetch';

import { fetch, isEmptyObject } from 'common/utils';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { parentItemsSelector } from 'controllers/testItem';
import {
  fetchClusterItemsErrorAction,
  fetchClusterItemsStartAction,
  fetchClusterItemsSuccessAction,
  toggleClusterItemsAction,
} from './actionCreators';
import { clusterItemsSelector } from './selectors';
import {
  FETCH_CLUSTER_ITEMS_ERROR,
  LOAD_MORE_CLUSTER_ITEMS,
  PAGINATION_OFFSET,
  REQUEST_CLUSTER_ITEMS,
} from './constants';

function* fetchClusterItems({ payload = {} }) {
  const { id } = payload;
  const { page } = yield select(clusterItemsSelector, id);
  const project = yield select(activeProjectSelector);
  const parentItems = yield select(parentItemsSelector);
  let pageSize = PAGINATION_OFFSET;
  if (!isEmptyObject(page)) {
    const { totalElements, size } = page;
    pageSize = size >= totalElements ? totalElements : size + PAGINATION_OFFSET;
  }
  /*
    [PAGE_KEY]: 1,
    [SIZE_KEY]: pageSize,
    'filter.any.clusterId': payload,
    'page.sort': 'startTime,ASC',
    providerType: 'cluster',
    launchId: parentItems[0].id,
  */
  const fetchParams = {
    [PAGE_KEY]: 1,
    [SIZE_KEY]: pageSize,
    'filter.eq.parentId': 366783,
    'page.sort': 'startTime,ASC',
    providerType: 'launch',
    launchId: parentItems[0].id,
  };
  try {
    yield put(fetchClusterItemsStartAction(payload));
    const response = yield call(fetch, URLS.testItemsWithProviderType(project), {
      params: fetchParams,
    });
    yield put(fetchClusterItemsSuccessAction({ id, ...response }));
  } catch (err) {
    yield put(fetchClusterItemsErrorAction(err));
  }
}

function* requestClusterItems({ payload = {} }) {
  const { id } = payload;
  const clusterItems = yield select(clusterItemsSelector, id);
  if (clusterItems.initial) {
    yield call(fetchClusterItems, { payload });
  }
  yield put(toggleClusterItemsAction(payload));
}

function* watchRequestClusterItems() {
  yield takeEvery(REQUEST_CLUSTER_ITEMS, requestClusterItems);
}

function* watchLoadMoreClusterItems() {
  yield takeEvery(LOAD_MORE_CLUSTER_ITEMS, fetchClusterItems);
}

function* watchFetchError() {
  yield takeEvery(FETCH_CLUSTER_ITEMS_ERROR, handleError);
}

export function* clusterItemsSagas() {
  yield all([watchRequestClusterItems(), watchLoadMoreClusterItems(), watchFetchError()]);
}
