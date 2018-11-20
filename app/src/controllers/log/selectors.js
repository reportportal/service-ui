import { createSelector } from 'reselect';
import {
  logItemIdSelector,
  pagePropertiesSelector,
  createQueryParametersSelector,
  PROJECT_LOG_PAGE,
  PROJECT_USERDEBUG_LOG_PAGE,
  testItemIdsArraySelector,
  payloadSelector,
} from 'controllers/pages';
import { DEFAULT_PAGINATION } from 'controllers/pagination';
import { itemsSelector } from 'controllers/testItem';
import { debugModeSelector } from 'controllers/launch';
import { extractNamespacedQuery } from 'common/utils/routingUtils';
import { calculateGrowthDuration, normalizeHistoryItem } from './utils';
import { NAMESPACE } from './constants';

const logSelector = (state) => state.log || {};

export const logActivitySelector = (state) => logSelector(state).activity || [];

export const lastLogActivitySelector = createSelector(
  logActivitySelector,
  (activity) => (activity.length ? activity[0] : null),
);

const historyEntriesSelector = (state) => logSelector(state).historyEntries || [];
export const logItemsSelector = (state) => logSelector(state).logItems || [];
export const logPaginationSelector = (state) => logSelector(state).pagination;
export const loadingSelector = (state) => logSelector(state).loading || false;
export const querySelector = createQueryParametersSelector({
  defaultPagination: DEFAULT_PAGINATION,
  defaultSorting: 'logTime,ASC',
});

export const historyItemsSelector = createSelector(
  historyEntriesSelector,
  logItemIdSelector,
  (entriesFromState, logItemId) => {
    if (!entriesFromState.length) return [];
    const entries = [...entriesFromState].reverse();

    const currentLaunch = entries.pop();
    if (!currentLaunch) {
      return [];
    }
    const currentLaunchItem = currentLaunch.resources.find((item) => item.id === logItemId);
    if (!currentLaunchItem) {
      return [];
    }
    const historyItems = entries.map((historyItem) => {
      const filteredSameHistoryItems = historyItem.resources.filter(
        (item) => item.uniqueId === currentLaunchItem.uniqueId,
      );

      return {
        ...normalizeHistoryItem(historyItem, filteredSameHistoryItems),
      };
    });

    currentLaunchItem.launchNumber = currentLaunch.launchNumber;
    historyItems.push(currentLaunchItem);

    return calculateGrowthDuration(historyItems);
  },
);

export const activeLogIdSelector = createSelector(
  logItemIdSelector,
  pagePropertiesSelector,
  (logItemId, query) => {
    const namespacedQuery = extractNamespacedQuery(query, NAMESPACE);
    return Number(namespacedQuery.history) || logItemId;
  },
);

export const activeLogSelector = createSelector(
  historyItemsSelector,
  activeLogIdSelector,
  (historyItems, logItemId) => historyItems.find((historyItem) => historyItem.id === logItemId),
);

const getPreviousItemId = (testItems = [], currentId) => {
  if (testItems.length < 2) {
    return null;
  }
  const itemIndex = testItems.findIndex((item) => item.id === currentId);
  const nextItem = testItems[itemIndex - 1];
  return nextItem ? nextItem.id : null;
};

const getNextItemId = (testItems = [], currentId) => {
  if (testItems.length < 2) {
    return null;
  }
  const itemIndex = testItems.findIndex((item) => item.id === currentId);
  const nextItem = testItems[itemIndex + 1];
  return nextItem ? nextItem.id : null;
};

export const canGoBackSelector = createSelector(
  itemsSelector,
  logItemIdSelector,
  (testItems, logId) => getPreviousItemId(testItems, logId) !== null,
);
export const canGoForwardSelector = createSelector(
  itemsSelector,
  logItemIdSelector,
  (testItems, logId) => getNextItemId(testItems, logId) !== null,
);

export const previousLogLinkSelector = createSelector(
  payloadSelector,
  pagePropertiesSelector,
  testItemIdsArraySelector,
  logItemIdSelector,
  debugModeSelector,
  itemsSelector,
  (payload, query, testItemIds, logId, debugMode, testItems) => {
    const nextItemId = getPreviousItemId(testItems, logId);
    if (!nextItemId) {
      return null;
    }
    return {
      type: debugMode ? PROJECT_USERDEBUG_LOG_PAGE : PROJECT_LOG_PAGE,
      payload: {
        ...payload,
        testItemIds: [...testItemIds.slice(0, testItemIds.length - 1), nextItemId].join('/'),
      },
      meta: query,
    };
  },
);

export const nextLogLinkSelector = createSelector(
  payloadSelector,
  pagePropertiesSelector,
  testItemIdsArraySelector,
  logItemIdSelector,
  debugModeSelector,
  itemsSelector,
  (payload, query, testItemIds, logId, debugMode, testItems) => {
    const nextItemId = getNextItemId(testItems, logId);
    if (!nextItemId) {
      return null;
    }
    return {
      type: debugMode ? PROJECT_USERDEBUG_LOG_PAGE : PROJECT_LOG_PAGE,
      payload: {
        ...payload,
        testItemIds: [...testItemIds.slice(0, testItemIds.length - 1), nextItemId].join('/'),
      },
      meta: query,
    };
  },
);
