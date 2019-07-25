import { createSelector } from 'reselect';
import {
  logItemIdSelector,
  pagePropertiesSelector,
  createQueryParametersSelector,
  PROJECT_LOG_PAGE,
  PROJECT_USERDEBUG_LOG_PAGE,
  payloadSelector,
  prevPagePropertiesSelector,
} from 'controllers/pages';
import { DEFAULT_PAGINATION, PAGE_KEY } from 'controllers/pagination';
import {
  itemsSelector,
  paginationSelector,
  parentItemSelector,
  parentItemsSelector,
} from 'controllers/testItem';
import { debugModeSelector } from 'controllers/launch';
import { extractNamespacedQuery, createNamespacedQuery } from 'common/utils/routingUtils';
import {
  calculateGrowthDuration,
  normalizeHistoryItem,
  getPreviousItem,
  getNextItem,
  getUpdatedLogQuery,
} from './utils';
import {
  NAMESPACE,
  DEFAULT_SORTING,
  RETRY_ID,
  ACTIVE_LOG_ITEM_QUERY_KEY,
  DETAILED_LOG_VIEW,
  LAUNCH_LOG_VIEW,
} from './constants';

const logSelector = (state) => state.log || {};

export const logActivitySelector = (state) => logSelector(state).activity || [];

export const lastLogActivitySelector = createSelector(
  logActivitySelector,
  (activity) => (activity.length ? activity[0] : null),
);

const historyEntriesSelector = (state) => logSelector(state).historyEntries || [];
export const logItemsSelector = (state) => logSelector(state).logItems || [];
export const logErrorItemsSelector = (state) => logSelector(state).errorLogItems || [];
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
  defaultPagination: DEFAULT_PAGINATION,
  defaultSorting: DEFAULT_SORTING,
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
  (historyItems, logItemId) => historyItems.find((historyItem) => historyItem.id === logItemId),
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

export const previousLogLinkSelector = createSelector(
  payloadSelector,
  pagePropertiesSelector,
  logItemIdSelector,
  debugModeSelector,
  itemsSelector,
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
  itemsSelector,
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
  itemsSelector,
  logItemIdSelector,
  (testItems, logId) => getPreviousItem(testItems, logId),
);

export const nextItemSelector = createSelector(
  itemsSelector,
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
      testItemIds: [...(payload.testItemIds || '').split('/'), testItemId].join('/'),
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
  itemsSelector,
  ({ number }, id, items) => {
    const isNoPreviousItem = getPreviousItem(items, id) === null;
    const isFirstPage = number === 1;
    return isNoPreviousItem && isFirstPage;
  },
);

export const disableNextItemLinkSelector = createSelector(
  paginationSelector,
  logItemIdSelector,
  itemsSelector,
  ({ number, totalPages }, id, items) => {
    const isNoNextItem = getNextItem(items, id) === null;
    const isLastPage = number === totalPages;
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

export const isLogPageWithOutNestedSteps = createSelector(logItemsSelector, (items) => {
  const filteredItems = items.filter((item) => 'hasContent' in item);
  return filteredItems.length === 0;
});
export const isLogPageWithNestedSteps = createSelector(
  isLogPageWithOutNestedSteps,
  (value) => !value,
);
