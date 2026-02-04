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

import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetch, updateStorageItem, waitForSelector } from 'common/utils';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import { fetchDataAction } from 'controllers/fetch';
import { activeProjectSelector } from 'controllers/user';
import { ALL, LATEST } from 'common/constants/reservedFilterIds';
import {
  activeFilterSelector,
  changeActiveFilterAction,
  launchFiltersReadySelector,
} from 'controllers/filter';
import { showFilterOnLaunchesAction } from 'controllers/project';
import { filterIdSelector } from 'controllers/pages';
import { isEmptyValue } from 'common/utils/isEmptyValue';
import { createFilterQuery } from 'components/filterEntities/containers/utils';
import { formatSortingString, SORTING_ASC, SORTING_DESC, SORTING_KEY } from 'controllers/sorting';
import { ENTITY_NUMBER } from 'components/filterEntities/constants';
import {
  FETCH_LAUNCHES,
  NAMESPACE,
  FETCH_LAUNCHES_WITH_PARAMS,
  CHANGE_LAUNCH_DISTINCT,
} from './constants';
import {
  queryParametersSelector,
  launchDistinctSelector,
  launchesDistinctLinksSelectorsMap,
  debugLocalFilterSelector,
  debugLocalSortingSelector,
  debugModeSelector,
  localSortingSelector,
} from './selectors';

function* fetchLaunchesWithParams({ payload }) {
  const activeProject = yield select(activeProjectSelector);
  const params = yield select(queryParametersSelector);
  const isDebugMode = yield select(debugModeSelector);
  const queryParams = { ...params, ...payload };
  const launchDistinct = yield select(launchDistinctSelector);
  const urlCreator = launchDistinct === LATEST ? URLS.launchesLatest : URLS.launches;
  yield put(
    fetchDataAction(NAMESPACE)(
      !isDebugMode ? urlCreator(activeProject) : URLS.debug(activeProject),
      { params: queryParams },
    ),
  );
}

const notEmptyConditionsPredicate = ({ value }) => !isEmptyValue(value);

function* fetchLaunches() {
  const filterId = yield select(filterIdSelector);
  let activeFilter = yield select(activeFilterSelector);
  if (Number.isInteger(filterId)) {
    if (!activeFilter && filterId < 0) {
      yield put(changeActiveFilterAction(ALL));
      return;
    }
    if (!activeFilter) {
      const launchFiltersReady = yield select(launchFiltersReadySelector);
      if (!launchFiltersReady) {
        yield call(waitForSelector, launchFiltersReadySelector);
      }
      activeFilter = yield select(activeFilterSelector);
    }
    if (!activeFilter) {
      const activeProject = yield select(activeProjectSelector);
      let filter = null;
      try {
        filter = yield call(fetch, URLS.filter(activeProject, filterId), { method: 'get' });
      } catch (e) {
        yield put(changeActiveFilterAction(ALL));
        return;
      }
      if (filter) {
        yield put(showFilterOnLaunchesAction(filter));
      }
    }
    yield call(waitForSelector, activeFilterSelector);
    activeFilter = yield select(activeFilterSelector);
  }
  let filtersQuery = {};
  if (activeFilter) {
    filtersQuery = createFilterQuery(
      activeFilter.conditions
        .filter(notEmptyConditionsPredicate)
        .reduce((res, condition) => ({ ...res, [condition.filteringField]: condition }), {}),
    );
    if (activeFilter.orders && activeFilter.orders.length > 0) {
      const order =
        activeFilter.orders.find((o) => o.sortingColumn !== ENTITY_NUMBER) ||
        activeFilter.orders[0];
      filtersQuery = {
        ...filtersQuery,
        [SORTING_KEY]: formatSortingString(
          [order.sortingColumn, ENTITY_NUMBER],
          order.isAsc ? SORTING_ASC : SORTING_DESC,
        ),
      };
    }
  } else {
    const debugMode = yield select(debugModeSelector);
    if (debugMode) {
      const debugLocalFilter = yield select(debugLocalFilterSelector);
      filtersQuery = createFilterQuery(debugLocalFilter);
    }
    const sortingSelector = debugMode ? debugLocalSortingSelector : localSortingSelector;
    const { sortingColumn, sortingDirection } = yield select(sortingSelector);
    filtersQuery = {
      ...filtersQuery,
      [SORTING_KEY]: formatSortingString([sortingColumn, ENTITY_NUMBER], sortingDirection),
    };
  }
  yield call(fetchLaunchesWithParams, { payload: filtersQuery });
}

function* changeLaunchDistinct({ payload }) {
  updateStorageItem(APPLICATION_SETTINGS, { launchDistinct: payload });
  const filterId = yield select(filterIdSelector);
  if (launchesDistinctLinksSelectorsMap[filterId]) {
    const launchesLink = yield select(launchesDistinctLinksSelectorsMap[payload]);
    yield put(launchesLink);
  } else {
    yield call(fetchLaunches);
  }
}

function* watchChangeLaunchDistinct() {
  yield takeEvery(CHANGE_LAUNCH_DISTINCT, changeLaunchDistinct);
}

function* watchFetchLaunches() {
  yield takeEvery(FETCH_LAUNCHES, fetchLaunches);
}

function* watchFetchLaunchesWithParams() {
  yield takeEvery(FETCH_LAUNCHES_WITH_PARAMS, fetchLaunchesWithParams);
}

export function* launchSagas() {
  yield all([watchFetchLaunches(), watchFetchLaunchesWithParams(), watchChangeLaunchDistinct()]);
}
