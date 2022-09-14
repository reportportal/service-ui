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
import { fetch, isEmptyObject } from 'common/utils';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { URLS } from 'common/urls';
import {
  namespaceSelector,
  PROVIDER_TYPE_CLUSTER,
  queryParametersSelector,
} from 'controllers/testItem';
import { showDefaultErrorNotification } from 'controllers/notification';
import { SORTING_KEY } from 'controllers/sorting';
import { launchIdSelector } from 'controllers/pages';
import { projectKeySelector } from 'controllers/project/selectors';
import {
  fetchClusterItemsStartAction,
  fetchClusterItemsSuccessAction,
  toggleClusterItemsAction,
} from './actionCreators';
import { clusterItemsSelector } from './selectors';
import { LOAD_MORE_CLUSTER_ITEMS, PAGE_SIZE, REQUEST_CLUSTER_ITEMS } from './constants';

function* fetchClusterItems({ payload = {} }) {
  const { id } = payload;
  const { page } = yield select(clusterItemsSelector, id);
  const projectKey = yield select(projectKeySelector);
  const launchId = yield select(launchIdSelector);
  let pageNumber = 1;
  if (!isEmptyObject(page)) {
    const { totalPages, number } = page;
    pageNumber = number >= totalPages ? totalPages : number + 1;
  }
  const namespace = yield select(namespaceSelector);
  const query = yield select(queryParametersSelector, namespace);
  const fetchParams = {
    [PAGE_KEY]: pageNumber,
    [SIZE_KEY]: PAGE_SIZE,
    [SORTING_KEY]: query[SORTING_KEY],
    providerType: PROVIDER_TYPE_CLUSTER,
    launchId,
    'filter.any.clusterId': id,
  };
  try {
    yield put(fetchClusterItemsStartAction(payload));
    const response = yield call(fetch, URLS.testItemsWithProviderType(projectKey), {
      params: fetchParams,
    });
    const responseWithClusterId = {
      ...response,
      content: response.content.map((item) => ({ clusterId: id, ...item })),
    };
    yield put(fetchClusterItemsSuccessAction({ id, ...responseWithClusterId }));
  } catch (err) {
    yield put(showDefaultErrorNotification(err));
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

export function* clusterItemsSagas() {
  yield all([watchRequestClusterItems(), watchLoadMoreClusterItems()]);
}
