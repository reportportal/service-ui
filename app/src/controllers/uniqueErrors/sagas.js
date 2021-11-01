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

import { all, call, put, select, take, takeEvery } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import {
  fetchParentItems,
  launchSelector,
  namespaceSelector,
  queryParametersSelector,
} from 'controllers/testItem';
import { createFetchPredicate, fetchDataAction } from 'controllers/fetch';
import { pathnameChangedSelector } from 'controllers/pages';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { SORTING_KEY } from 'controllers/sorting';
import { FETCH_CLUSTERS, NAMESPACE } from './constants';
import { setPageLoadingAction } from './actionCreators';

function* fetchClusters({ payload = {} }) {
  const { refresh = false } = payload;
  let parentLaunch = yield select(launchSelector);
  const project = yield select(activeProjectSelector);
  const isPathNameChanged = yield select(pathnameChangedSelector);
  if (isPathNameChanged && !refresh) {
    yield put(setPageLoadingAction(true));
  }
  if (!parentLaunch) {
    yield call(fetchParentItems);
  }
  parentLaunch = yield select(launchSelector);
  const namespace = yield select(namespaceSelector);
  const query = yield select(queryParametersSelector, namespace);
  yield put(
    fetchDataAction(NAMESPACE)(
      URLS.clusterByLaunchId(project, parentLaunch.id, {
        [PAGE_KEY]: query[PAGE_KEY],
        [SIZE_KEY]: query[SIZE_KEY],
        [SORTING_KEY]: query[SORTING_KEY],
      }),
    ),
  );
  if (isPathNameChanged && !refresh) {
    const waitEffects = [take(createFetchPredicate(NAMESPACE))];
    yield all(waitEffects);
    yield put(setPageLoadingAction(false));
  }
}

function* watchFetchClusters() {
  yield takeEvery(FETCH_CLUSTERS, fetchClusters);
}

export function* uniqueErrorsSagas() {
  yield all([watchFetchClusters()]);
}
