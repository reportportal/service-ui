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

import { createSelector } from 'reselect';
import {
  logItemIdSelector,
  searchStringSelector,
  pagePropertiesSelector,
  createQueryParametersSelector,
  PROJECT_LOG_PAGE,
  PROJECT_USERDEBUG_LOG_PAGE,
  payloadSelector,
  prevPagePropertiesSelector,
} from 'controllers/pages';
import { PAGE_KEY } from 'controllers/pagination';
import {
  itemsSelector,
  paginationSelector,
  parentItemSelector,
  parentItemsSelector,
  groupItemsByParent,
} from 'controllers/testItem';
import { debugModeSelector } from 'controllers/launch';
import { extractNamespacedQuery, createNamespacedQuery } from 'common/utils/routingUtils';
import { getPreviousItem, getNextItem, getUpdatedLogQuery } from './utils';
import {
  NAMESPACE,
  DEFAULT_SORTING,
  RETRY_ID,
  ACTIVE_LOG_ITEM_QUERY_KEY,
  DETAILED_LOG_VIEW,
  LAUNCH_LOG_VIEW,
  LOG_STATUS_FILTER_KEY,
} from './constants';

const logSelector = (state) => state.log || {};

export const logActivitySelector = (state) => logSelector(state).activity || [];

export const lastLogActivitySelector = createSelector(logActivitySelector, (activity) =>
  activity.length ? activity[0] : null,
);

export const logItemsSelector = (state) => logSelector(state).logItems || [];
export const logPaginationSelector = (state) => logSelector(state).pagination;
export const loadingSelector = (state) => logSelector(state).loading || false;
export const attachmentsSelector = (state) => logSelector(state).attachments || {};
export const sauceLabsSelector = (state) => logSelector(state).sauceLabs || {};

export const logStackTraceSelector = (state) => logSelector(state).stackTrace || {};
export const logStackTraceItemsSelector = (state) => logStackTraceSelector(state).content;
export const logStackTracePaginationSelector = (state) => logStackTraceSelector(state).pagination;
export const logStackTraceLoadingSelector = (state) => logStackTraceSelector(state).loading;
export const pageLoadingSelector = (state) => logSelector(state).pageLoading;

export const querySelector = createQueryParametersSelector({
  defaultSorting: DEFAULT_SORTING,
});

export const historyItemsSelector = (state) => logSelector(state).historyItems || [];

const createActiveLogItemIdSelector = (
  pageQuerySelector,
  itemIdSelector = logItemIdSelector,
  itemQueryKey = ACTIVE_LOG_ITEM_QUERY_KEY,
) =>
  createSelector(itemIdSelector, pageQuerySelector, (logItemId, query) => {
    const namespacedQuery = extractNamespacedQuery(query, NAMESPACE);
    return parseInt(namespacedQuery[itemQueryKey], 10) || logItemId;
  });

export const activeLogIdSelector = createActiveLogItemIdSelector(pagePropertiesSelector);
export const prevActiveLogIdSelector = createActiveLogItemIdSelector(prevPagePropertiesSelector);

export const activeLogSelector = createSelector(
  historyItemsSelector,
  activeLogIdSelector,
  debugModeSelector,
  parentItemSelector,
  (historyItems, logItemId, debugMode, parentItem) =>
    debugMode ? parentItem : historyItems.find((historyItem) => historyItem.id === logItemId),
);

export const retriesSelector = createSelector(activeLogSelector, (logItem = {}) => {
  const { retries = [] } = logItem;
  return [...retries, logItem];
});

export const activeRetryIdSelector = createActiveLogItemIdSelector(
  pagePropertiesSelector,
  activeLogIdSelector,
  RETRY_ID,
);
export const prevActiveRetryIdSelector = createActiveLogItemIdSelector(
  prevPagePropertiesSelector,
  activeLogIdSelector,
  RETRY_ID,
);

export const activeRetrySelector = createSelector(
  retriesSelector,
  activeRetryIdSelector,
  (retries, retryId) => retries.filter((retry) => retry.id === retryId)[0],
);

const groupedTestItemsSelector = createSelector(
  itemsSelector,
  searchStringSelector,
  (testItems, searchQuery) => {
    const isListView = searchQuery.indexOf('filter.eq.hasChildren');

    if (isListView) {
      const groupedItems = groupItemsByParent(testItems);

      return Object.keys(groupedItems).reduce(
        (acc, groupKey) => acc.concat(groupedItems[groupKey]),
        [],
      );
    }

    return testItems;
  },
);

export const previousLogLinkSelector = createSelector(
  payloadSelector,
  pagePropertiesSelector,
  logItemIdSelector,
  debugModeSelector,
  groupedTestItemsSelector,
  (payload, query, logId, debugMode, testItems) => {
    const previousItem = getPreviousItem(testItems, logId);
    if (!previousItem) {
      return null;
    }
    const updatedLogQuery = getUpdatedLogQuery(query, previousItem.id, {
      [PAGE_KEY]: 1,
    });
    const { launchId, path } = previousItem;
    const testItemIds = [launchId, ...path.split('.')].join('/');
    return {
      type: debugMode ? PROJECT_USERDEBUG_LOG_PAGE : PROJECT_LOG_PAGE,
      payload: {
        ...payload,
        testItemIds,
      },
      meta: { query: { ...query, ...updatedLogQuery } },
    };
  },
);

export const nextLogLinkSelector = createSelector(
  payloadSelector,
  pagePropertiesSelector,
  logItemIdSelector,
  debugModeSelector,
  groupedTestItemsSelector,
  (payload, query, logId, debugMode, testItems) => {
    const nextItem = getNextItem(testItems, logId);
    if (!nextItem) {
      return null;
    }
    const updatedLogQuery = getUpdatedLogQuery(query, nextItem.id, {
      [PAGE_KEY]: 1,
    });
    const { launchId, path } = nextItem;
    const testItemIds = [launchId, ...path.split('.')].join('/');
    return {
      type: debugMode ? PROJECT_USERDEBUG_LOG_PAGE : PROJECT_LOG_PAGE,
      payload: {
        ...payload,
        testItemIds,
      },
      meta: { query: { ...query, ...updatedLogQuery } },
    };
  },
);

export const previousItemSelector = createSelector(
  groupedTestItemsSelector,
  logItemIdSelector,
  (testItems, logId) => getPreviousItem(testItems, logId),
);

export const nextItemSelector = createSelector(
  groupedTestItemsSelector,
  logItemIdSelector,
  (testItems, logId) => getNextItem(testItems, logId),
);

export const retryLinkSelector = createSelector(
  payloadSelector,
  pagePropertiesSelector,
  debugModeSelector,
  (state, props) => props,
  (payload, query, debugMode, { testItemId, retryId }) => ({
    type: debugMode ? PROJECT_USERDEBUG_LOG_PAGE : PROJECT_LOG_PAGE,
    payload: {
      ...payload,
      testItemIds: [...`${payload.testItemIds || ''}`.split('/'), testItemId].join('/'),
    },
    meta: {
      query: {
        ...query,
        ...createNamespacedQuery({ retryId }, NAMESPACE),
      },
    },
  }),
);

export const disablePrevItemLinkSelector = createSelector(
  paginationSelector,
  logItemIdSelector,
  groupedTestItemsSelector,
  ({ number }, id, items) => {
    const isNoPreviousItem = getPreviousItem(items, id) === null;
    const isFirstPage = number === 1;
    return isNoPreviousItem && isFirstPage;
  },
);

export const disableNextItemLinkSelector = createSelector(
  paginationSelector,
  logItemIdSelector,
  groupedTestItemsSelector,
  ({ number, totalPages }, id, items) => {
    const isNoNextItem = getNextItem(items, id) === null;
    const isLastPage = totalPages ? number === totalPages : true;
    return isNoNextItem && isLastPage;
  },
);

export const isLoadMoreStackTraceVisible = createSelector(
  logStackTracePaginationSelector,
  ({ size, totalElements }) => size < totalElements,
);
export const isLaunchLogSelector = (state) => parentItemsSelector(state).length === 1;

export const logViewModeSelector = (state) => {
  const parentTestItem = parentItemSelector(state);
  const hasChildren = parentTestItem && parentTestItem.hasChildren;
  const isLaunchLog = isLaunchLogSelector(state);
  return hasChildren || isLaunchLog ? LAUNCH_LOG_VIEW : DETAILED_LOG_VIEW;
};

export const isLogPageWithOutNestedSteps = createSelector(
  logItemsSelector,
  pagePropertiesSelector,
  (items, pageQuery) => {
    const query = extractNamespacedQuery(pageQuery, NAMESPACE);
    const logStatus = query[LOG_STATUS_FILTER_KEY];
    const hasNestedSteps = items.some((item) => 'hasContent' in item);
    return !hasNestedSteps && !logStatus;
  },
);
export const isLogPageWithNestedSteps = createSelector(
  isLogPageWithOutNestedSteps,
  (value) => !value,
);
