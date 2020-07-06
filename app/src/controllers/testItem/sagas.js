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

import { redirect } from 'redux-first-router';
import {
  fetchDataAction,
  fetchSuccessAction,
  bulkFetchDataAction,
  createFetchPredicate,
} from 'controllers/fetch';
import { showFilterOnLaunchesAction } from 'controllers/project';
import { activeFilterSelector } from 'controllers/filter';
import { activeProjectSelector } from 'controllers/user';
import { put, select, all, takeEvery, take, call } from 'redux-saga/effects';
import {
  testItemIdsArraySelector,
  launchIdSelector,
  pagePropertiesSelector,
  payloadSelector,
  TEST_ITEM_PAGE,
  pathnameChangedSelector,
  PROJECT_LOG_PAGE,
  filterIdSelector,
  pageSelector,
} from 'controllers/pages';
import { PAGE_KEY } from 'controllers/pagination';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { createNamespacedQuery } from 'common/utils/routingUtils';
import { LEVEL_NOT_FOUND } from 'common/constants/launchLevels';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import {
  setLevelAction,
  setPageLoadingAction,
  setDefaultItemStatisticsAction,
} from './actionCreators';
import {
  FETCH_TEST_ITEMS,
  NAMESPACE,
  PARENT_ITEMS_NAMESPACE,
  FILTERED_ITEM_STATISTICS_NAMESPACE,
  RESTORE_PATH,
  FETCH_TEST_ITEMS_LOG_PAGE,
  DELETE_TEST_ITEMS,
} from './constants';
import { LEVELS } from './levels';
import {
  namespaceSelector,
  parentItemSelector,
  queryParametersSelector,
  isLostLaunchSelector,
  createParentItemsSelector,
  itemsSelector,
  logPageOffsetSelector,
  levelSelector,
  isTestItemsListSelector,
  isFilterParamsExistsSelector,
} from './selectors';
import { calculateLevel } from './utils';

function* fetchFilteredItemStatistics(project, params) {
  yield put(
    fetchDataAction(FILTERED_ITEM_STATISTICS_NAMESPACE)(URLS.testItemStatistics(project), {
      params,
    }),
  );
  yield take(createFetchPredicate(FILTERED_ITEM_STATISTICS_NAMESPACE));
}

function* updateLaunchId(launchId) {
  const page = yield select(pageSelector);
  const payload = yield select(payloadSelector);
  const query = yield select(pagePropertiesSelector);
  const testItemIdsArray = yield select(testItemIdsArraySelector);
  yield put({
    type: page || TEST_ITEM_PAGE,
    payload: {
      ...payload,
      testItemIds: [launchId, ...testItemIdsArray.slice(1)].join('/'),
    },
    meta: { query },
  });
}

function* restorePath() {
  const parentItem = yield select(parentItemSelector);
  if (!parentItem) {
    return;
  }
  yield call(updateLaunchId, parentItem.launchId);
}

export function* fetchParentItems() {
  const itemIds = yield select(testItemIdsArraySelector);
  const project = yield select(activeProjectSelector);
  const urls = itemIds.map((id, i) =>
    i === 0 ? URLS.launch(project, id) : URLS.testItem(project, id),
  );
  yield put(bulkFetchDataAction(PARENT_ITEMS_NAMESPACE, true)(urls));
  yield take(createFetchPredicate(PARENT_ITEMS_NAMESPACE));
}

function* fetchTestItems({ payload = {} }) {
  const { offset = 0, params: payloadParams = {} } = payload;
  const filterId = yield select(filterIdSelector);
  const isPathNameChanged = yield select(pathnameChangedSelector);
  const isTestItemsList = yield select(isTestItemsListSelector);
  if (isPathNameChanged && !offset) {
    yield put(setPageLoadingAction(true));
    yield put(setDefaultItemStatisticsAction());

    if (!isTestItemsList) {
      yield call(fetchParentItems);
    }
  }
  const itemIdsArray = yield select(testItemIdsArraySelector);
  const itemIds = offset ? itemIdsArray.slice(0, itemIdsArray.length - offset) : itemIdsArray;
  let launchId = yield select(launchIdSelector);
  const isLostLaunch = yield select(isLostLaunchSelector);
  let parentId;
  if (isLostLaunch) {
    let parentItem;
    try {
      parentItem = yield select(createParentItemsSelector(offset));
    } catch (e) {} // eslint-disable-line no-empty
    launchId = parentItem ? parentItem.launchId : launchId;
  }

  if (!isTestItemsList && !launchId) {
    return;
  }

  if (itemIds.length > 1) {
    parentId = itemIds[itemIds.length - 1];
  }
  const project = yield select(activeProjectSelector);
  const namespace = yield select(namespaceSelector, offset);
  const query = yield select(queryParametersSelector, namespace);
  const pageQuery = yield select(pagePropertiesSelector);
  const activeFilter = yield select(activeFilterSelector);
  const uniqueIdFilterKey = 'filter.eq.uniqueId';
  const noChildFilter = 'filter.eq.hasChildren' in query;
  const underPathItemsIds = itemIds.filter((item) => item !== launchId);
  const params = isTestItemsList
    ? {
        filterId,
        ...{ ...query, ...payloadParams },
      }
    : {
        'filter.eq.launchId': launchId,
        'filter.eq.parentId': !noChildFilter ? parentId : undefined,
        'filter.level.path': !parentId && !noChildFilter ? 1 : undefined,
        'filter.under.path':
          noChildFilter && underPathItemsIds.length > 0 ? underPathItemsIds.join('.') : undefined,
        [uniqueIdFilterKey]: pageQuery[uniqueIdFilterKey],
        ...{ ...query, ...payloadParams },
      };

  if (isTestItemsList && !activeFilter) {
    const filter = yield call(fetch, URLS.filter(project, filterId));

    if (filter) {
      yield put(showFilterOnLaunchesAction(filter));
    }
  }
  yield put(
    fetchDataAction(NAMESPACE)(URLS.testItems(project), {
      params,
    }),
  );
  const dataPayload = yield take(createFetchPredicate(NAMESPACE));
  let level;
  if (dataPayload.error) {
    level = LEVEL_NOT_FOUND;
  } else {
    const previousLevel = yield select(levelSelector);
    level = calculateLevel(dataPayload.payload.content, previousLevel, isTestItemsList);
  }

  if (LEVELS[level]) {
    yield put(fetchSuccessAction(LEVELS[level].namespace, dataPayload.payload));
  }
  yield put(setLevelAction(level));

  const isFilterParamsExists = yield select(isFilterParamsExistsSelector);
  if (!isTestItemsList && isFilterParamsExists) {
    yield call(fetchFilteredItemStatistics, project, params);
  }
  yield put(setPageLoadingAction(false));
}

function* watchRestorePath() {
  yield takeEvery(RESTORE_PATH, restorePath);
}

function* watchFetchTestItems() {
  yield takeEvery(FETCH_TEST_ITEMS, fetchTestItems);
}

function* calculateStepPagination({ next = false, offset = 1 }) {
  const namespace = yield select(namespaceSelector, offset);
  const namespaceQuery = yield select(queryParametersSelector, namespace);
  let page = parseInt(namespaceQuery[PAGE_KEY], 10) - 1;
  if (next) {
    page = parseInt(namespaceQuery[PAGE_KEY], 10) + 1;
  }
  return {
    [PAGE_KEY]: page,
  };
}

export function* fetchTestItemsFromLogPage({ payload = {} }) {
  const { next = false } = payload;
  const offset = yield select(logPageOffsetSelector);
  const stepParams = yield call(calculateStepPagination, { next, offset });
  yield call(fetchTestItems, { payload: { offset, params: stepParams } });
  const testItems = yield select(itemsSelector);
  const projectId = yield select(activeProjectSelector);
  const testItem = next ? testItems[0] : testItems[testItems.length - 1];
  const { launchId, path } = testItem;
  const testItemIds = [launchId, ...path.split('.')].join('/');
  const filterId = yield select(filterIdSelector);
  const namespace = yield select(namespaceSelector, offset);
  const namespaceQuery = yield select(queryParametersSelector, namespace);
  const params = {
    ...namespaceQuery,
    ...stepParams,
  };
  const query = createNamespacedQuery(params, namespace);
  const link = {
    type: PROJECT_LOG_PAGE,
    payload: {
      filterId,
      projectId,
      testItemIds,
    },
    query,
  };
  yield put(redirect(link));
}

function* watchTestItemsFromLogPage() {
  yield takeEvery(FETCH_TEST_ITEMS_LOG_PAGE, fetchTestItemsFromLogPage);
}

function* deleteTestItems({ payload: { items, callback } }) {
  const ids = items.map((item) => item.id).join(',');
  const projectId = yield select(activeProjectSelector);
  yield put(showScreenLockAction());
  try {
    yield call(fetch, URLS.testItems(projectId, ids), {
      method: 'delete',
    });
    yield put(hideScreenLockAction());
    yield call(callback);
    yield put(
      showNotification({
        messageId: items.length === 1 ? 'deleteTestItemSuccess' : 'deleteTestItemMultipleSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (error) {
    yield put(hideScreenLockAction());
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchDeleteTestItems() {
  yield takeEvery(DELETE_TEST_ITEMS, deleteTestItems);
}

export function* testItemsSagas() {
  yield all([
    watchFetchTestItems(),
    watchRestorePath(),
    watchTestItemsFromLogPage(),
    watchDeleteTestItems(),
  ]);
}
