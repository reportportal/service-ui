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
import { put, select, all, takeEvery, take, call, takeLatest } from 'redux-saga/effects';
import {
  fetchDataAction,
  fetchSuccessAction,
  bulkFetchDataAction,
  createFetchPredicate,
} from 'controllers/fetch';
import { showFilterOnLaunchesAction, projectKeySelector } from 'controllers/project';
import { activeFilterSelector } from 'controllers/filter';
import { activeProjectSelector } from 'controllers/user';
import {
  urlOrganizationAndProjectSelector,
  testItemIdsArraySelector,
  launchIdSelector,
  pagePropertiesSelector,
  payloadSelector,
  TEST_ITEM_PAGE,
  pathnameChangedSelector,
  PROJECT_LOG_PAGE,
  filterIdSelector,
  pageSelector,
  testItemIdsSelector,
  LAUNCHES_PAGE,
} from 'controllers/pages';
import { PAGE_KEY } from 'controllers/pagination';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { createNamespacedQuery } from 'common/utils/routingUtils';
import { LEVEL_NOT_FOUND } from 'common/constants/launchLevels';
import { FILTER_TITLES } from 'common/constants/reservedFilterTitles';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';
import { ALL } from 'common/constants/reservedFilterIds';
import { FILTER_ENTITY_ID_TO_TYPE_MAP } from 'components/main/analytics/events/common/testItemPages/constants';
import { ENTITY_START_TIME } from 'components/filterEntities/constants';
import { formatSortingString, SORTING_DESC, SORTING_KEY } from 'controllers/sorting';
import { createFilterQuery } from 'components/filterEntities/containers/utils';
import {
  setLevelAction,
  setPageLoadingAction,
  setDefaultItemStatisticsAction,
  fetchParentLaunchSuccessAction,
  searchItemWidgetDetailsAction,
  testItemsSearchAction,
} from './actionCreators';
import {
  FETCH_TEST_ITEMS,
  NAMESPACE,
  PARENT_ITEMS_NAMESPACE,
  FILTERED_ITEM_STATISTICS_NAMESPACE,
  RESTORE_PATH,
  FETCH_TEST_ITEMS_LOG_PAGE,
  DELETE_TEST_ITEMS,
  CURRENT_ITEM_LEVEL,
  PROVIDER_TYPE_LAUNCH,
  PROVIDER_TYPE_FILTER,
  PROVIDER_TYPE_MODIFIERS_ID_MAP,
  SEARCH_TEST_ITEMS,
  REFRESH_SEARCHED_ITEMS,
  LOAD_MORE_SEARCHED_ITEMS,
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
  launchSelector,
  searchedTestItemsSelector,
} from './selectors';
import { calculateLevel } from './utils';

function* fetchFilteredItemStatistics(projectKey, params) {
  yield put(
    fetchDataAction(FILTERED_ITEM_STATISTICS_NAMESPACE)(URLS.testItemStatistics(projectKey), {
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
  const projectKey = yield select(projectKeySelector);
  const urls = itemIds.map((id, i) =>
    i === 0 ? URLS.launch(projectKey, id) : URLS.testItem(projectKey, id),
  );
  yield put(bulkFetchDataAction(PARENT_ITEMS_NAMESPACE, true)(urls));
  yield take(createFetchPredicate(PARENT_ITEMS_NAMESPACE));
}

export function* fetchParentLaunch({ payload = {} } = {}) {
  const {
    projectKey = yield select(projectKeySelector),
    launchId = yield select(launchIdSelector),
  } = payload;

  const launch = yield call(fetch, URLS.launch(projectKey, launchId));

  yield put(fetchParentLaunchSuccessAction(launch));
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
  let launchId = yield select(launchIdSelector);
  if (isNaN(Number(launchId))) {
    const launch = yield select(launchSelector);
    launchId = launch?.id;
    itemIdsArray[0] = launch?.id;
  }
  const itemIds = offset ? itemIdsArray.slice(0, itemIdsArray.length - offset) : itemIdsArray;
  const isLostLaunch = yield select(isLostLaunchSelector);
  let parentId;
  if (isLostLaunch) {
    let parentItem;
    try {
      parentItem = yield select(createParentItemsSelector(offset));
    } catch {} // eslint-disable-line no-empty
    launchId = parentItem ? parentItem.launchId : launchId;
  }

  if (!isTestItemsList && !launchId) {
    return;
  }

  if (itemIds.length > 1) {
    parentId = itemIds[itemIds.length - 1];
  }
  const projectKey = yield select(projectKeySelector);
  const namespace = yield select(namespaceSelector, offset);
  const query = yield select(queryParametersSelector, namespace);
  const pageQuery = yield select(pagePropertiesSelector);
  const activeFilter = yield select(activeFilterSelector);
  const uniqueIdFilterKey = 'filter.eq.uniqueId';
  const noChildFilter = 'filter.eq.hasChildren' in query;
  const underPathItemsIds = itemIds.filter((item) => item !== launchId);
  const params = isTestItemsList
    ? {
        ...{ ...query, ...payloadParams },
      }
    : {
        'filter.eq.parentId': !noChildFilter ? parentId : undefined,
        'filter.level.path': !parentId && !noChildFilter ? 1 : undefined,
        'filter.under.path':
          noChildFilter && underPathItemsIds.length > 0 ? underPathItemsIds.join('.') : undefined,
        [uniqueIdFilterKey]: pageQuery[uniqueIdFilterKey],
        ...{ ...query, ...payloadParams },
      };

  if (!query.providerType) {
    const [providerType, id] = isTestItemsList
      ? [PROVIDER_TYPE_FILTER, filterId]
      : [PROVIDER_TYPE_LAUNCH, launchId];
    const providerTypeModifierId = PROVIDER_TYPE_MODIFIERS_ID_MAP[providerType];

    params.providerType = providerType;
    params[providerTypeModifierId] = id;
  }

  const isFilterNotReserved = !FILTER_TITLES[filterId];
  if ((isTestItemsList || isFilterNotReserved) && !activeFilter) {
    try {
      const filter = yield call(fetch, URLS.filter(projectKey, filterId));
      if (filter) {
        yield put(showFilterOnLaunchesAction(filter));
      }
    } catch {
      const testItemIds = yield select(testItemIdsSelector);
      const currentPage = yield select(pageSelector);
      const { organizationSlug, projectSlug } = yield select(urlOrganizationAndProjectSelector);
      const link = {
        type: isTestItemsList ? LAUNCHES_PAGE : currentPage,
        payload: {
          projectSlug,
          filterId: ALL,
          testItemIds: isTestItemsList ? '' : testItemIds,
          organizationSlug,
        },
        meta: {
          query: pageQuery,
        },
      };
      yield put(redirect(link));
    }
  }
  yield put(
    fetchDataAction(NAMESPACE)(URLS.testItemsWithProviderType(projectKey), {
      params,
    }),
  );
  const dataPayload = yield take(createFetchPredicate(NAMESPACE));
  let level;
  if (dataPayload.error) {
    level = LEVEL_NOT_FOUND;
  } else {
    const previousLevel = yield select(levelSelector);
    const currentItemLevel = getStorageItem(CURRENT_ITEM_LEVEL);
    level = calculateLevel(
      previousLevel,
      currentItemLevel,
      isTestItemsList,
      dataPayload.payload.content,
    );
  }

  if (LEVELS[level]) {
    yield put(fetchSuccessAction(LEVELS[level].namespace, dataPayload.payload));
  }
  yield put(setLevelAction(level));
  yield call(setStorageItem, CURRENT_ITEM_LEVEL, level);

  const isFilterParamsExists = yield select(isFilterParamsExistsSelector);
  if (!isTestItemsList && isFilterParamsExists) {
    yield call(fetchFilteredItemStatistics, projectKey, params);
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
  const { organizationSlug, projectSlug } = yield select(urlOrganizationAndProjectSelector);
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
      organizationSlug,
      projectSlug,
      filterId,
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
  const projectKey = yield select(projectKeySelector);
  yield put(showScreenLockAction());
  try {
    yield call(fetch, URLS.testItems(projectKey, ids), {
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

function* fetchSearchedItems(searchCriteria, sortingDirection = SORTING_DESC, pageNumber = 1) {
  const activeProject = yield select(activeProjectSelector);
  const query = createFilterQuery(searchCriteria);
  const sorting = formatSortingString(
    [FILTER_ENTITY_ID_TO_TYPE_MAP[ENTITY_START_TIME]],
    sortingDirection,
  );
  return yield call(
    fetch,
    URLS.testItemSearch(activeProject, {
      ...query,
      [SORTING_KEY]: sorting,
      [PAGE_KEY]: pageNumber,
    }),
  );
}
const updateSearchedItemsState = (widgetId) => (state) =>
  put(searchItemWidgetDetailsAction({ [widgetId]: state }));

function* searchTestItemsFromWidget({
  payload: { widgetId, searchParams, trackPerformance = () => {} },
}) {
  const startTime = performance.now();
  const { searchCriteria, sortingDirection = SORTING_DESC } = searchParams;
  yield updateSearchedItemsState(widgetId)({ loading: true });
  try {
    const result = yield call(fetchSearchedItems, searchCriteria, sortingDirection);
    yield updateSearchedItemsState(widgetId)({
      searchCriteria,
      sortingDirection,
      loading: false,
      ...result,
    });
  } catch (error) {
    yield updateSearchedItemsState(widgetId)({ loading: false, error });
  }
  const endTime = performance.now();
  trackPerformance(endTime - startTime);
}

function* refreshSearchedItemsFromWidget({ payload: widgetId }) {
  const searchDetails = yield select(searchedTestItemsSelector);
  const targetWidgetSearch = searchDetails[widgetId] || {};
  const { searchCriteria } = targetWidgetSearch;
  yield put(testItemsSearchAction({ widgetId, searchParams: { searchCriteria } }));
}

function* loadMoreSearchedItemsFromWidget({
  payload: { widgetId, trackPerformance = () => {}, isDisplayedLaunches = false },
}) {
  const startTime = performance.now();
  const searchDetails = yield select(searchedTestItemsSelector);
  const targetWidgetSearch = searchDetails[widgetId] || {};
  const { searchCriteria, sortingDirection, page, content = [] } = targetWidgetSearch;
  const currentPageNumber = page?.number;
  yield updateSearchedItemsState(widgetId)({ ...targetWidgetSearch, loadingMore: true });
  const result = yield call(
    fetchSearchedItems,
    searchCriteria,
    sortingDirection,
    currentPageNumber + 1,
  );
  yield updateSearchedItemsState(widgetId)({
    searchCriteria,
    sortingDirection,
    content: [...content, ...result.content],
    page: result.page,
    loadingMore: false,
  });
  if (isDisplayedLaunches) {
    yield put(
      showNotification({
        messageId: 'loadedItemsWithDisplayedLaunches',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  }
  const endTime = performance.now();
  trackPerformance(endTime - startTime);
}

function* watchTestItemsFromWidget() {
  yield takeLatest(SEARCH_TEST_ITEMS, searchTestItemsFromWidget);
}
function* watchRefreshSearchedItems() {
  yield takeEvery(REFRESH_SEARCHED_ITEMS, refreshSearchedItemsFromWidget);
}
function* watchLoadMoreSearchedItems() {
  yield takeEvery(LOAD_MORE_SEARCHED_ITEMS, loadMoreSearchedItemsFromWidget);
}

export function* testItemsSagas() {
  yield all([
    watchFetchTestItems(),
    watchRestorePath(),
    watchTestItemsFromLogPage(),
    watchDeleteTestItems(),
    watchTestItemsFromWidget(),
    watchRefreshSearchedItems(),
    watchLoadMoreSearchedItems(),
  ]);
}
