import { createSelector } from 'reselect';
import {
  testItemIdsArraySelector,
  createQueryParametersSelector,
  pagePropertiesSelector,
  filterIdSelector,
  TEST_ITEM_PAGE,
  PROJECT_LAUNCHES_PAGE,
  PROJECT_USERDEBUG_TEST_ITEM_PAGE,
  PROJECT_USERDEBUG_PAGE,
  PROJECT_USERDEBUG_LOG_PAGE,
  PROJECT_LOG_PAGE,
  payloadSelector,
  testItemIdsSelector,
  searchStringSelector,
} from 'controllers/pages';
import { activeProjectSelector } from 'controllers/user';
import { NAMESPACE as LAUNCH_NAMESPACE, debugModeSelector } from 'controllers/launch';
import {
  copyQuery,
  extractNamespacedQuery,
  createNamespacedQuery,
} from 'common/utils/routingUtils';
import { LEVEL_SUITE, LEVEL_TEST, LEVEL_STEP } from 'common/constants/launchLevels';
import { ALL } from 'common/constants/reservedFilterIds';
import { suitesSelector, suitePaginationSelector } from 'controllers/suite';
import { testsSelector, testPaginationSelector } from 'controllers/test';
import { stepsSelector, stepPaginationSelector } from 'controllers/step';
import { defectTypesSelector } from 'controllers/project';
import { DEFAULT_SORTING } from './constants';
import {
  createLink,
  getQueryNamespace,
  getDefectsString,
  normalizeTestItem,
  getNextPage,
} from './utils';

const domainSelector = (state) => state.testItem || {};

export const levelSelector = (state) => domainSelector(state).level;
export const loadingSelector = (state) => domainSelector(state).loading;
export const pageLoadingSelector = (state) => domainSelector(state).pageLoading;
export const namespaceSelector = (state, offset = 0) =>
  getQueryNamespace(testItemIdsArraySelector(state).length - 1 - offset);
export const queryParametersSelector = createQueryParametersSelector({
  defaultSorting: DEFAULT_SORTING,
});
export const parentItemsSelector = (state) => domainSelector(state).parentItems || [];
export const createParentItemsSelector = (offset = 0) =>
  createSelector(parentItemsSelector, defectTypesSelector, (parentItems, defectTypes) =>
    normalizeTestItem(parentItems[parentItems.length - 1 - offset], defectTypes),
  );
export const parentItemSelector = createParentItemsSelector();
export const launchSelector = (state) => parentItemsSelector(state)[0];
export const isLostLaunchSelector = (state) =>
  parentItemsSelector(state).length > 1 && !launchSelector(state);

const isListView = (query, namespace) => {
  const namespacedQuery = extractNamespacedQuery(query, namespace);
  return namespacedQuery && 'filter.eq.hasChildren' in namespacedQuery;
};

export const itemsSelector = (state) => {
  switch (levelSelector(state)) {
    case LEVEL_SUITE:
      return suitesSelector(state);
    case LEVEL_TEST:
      return testsSelector(state);
    case LEVEL_STEP:
      return stepsSelector(state);
    default:
      return [];
  }
};
const testItemSelector = (state, id) => {
  const items = itemsSelector(state);
  return items.find((item) => item.id === id);
};

export const paginationSelector = (state) => {
  switch (levelSelector(state)) {
    case LEVEL_SUITE:
      return suitePaginationSelector(state);
    case LEVEL_TEST:
      return testPaginationSelector(state);
    case LEVEL_STEP:
      return stepPaginationSelector(state);
    default:
      return {};
  }
};

export const isListViewSelector = (state, namespace) =>
  isListView(pagePropertiesSelector(state), namespace);

const itemTitleFormatter = (item) => {
  if (item.number || item.number === 0) {
    return `${item.name} #${item.number}`;
  }
  return item.name;
};

export const breadcrumbsSelector = createSelector(
  activeProjectSelector,
  filterIdSelector,
  parentItemsSelector,
  testItemIdsArraySelector,
  pagePropertiesSelector,
  debugModeSelector,
  (projectId, filterId, parentItems, testItemIds, query, debugMode) => {
    const queryNamespacesToCopy = [LAUNCH_NAMESPACE];
    let isListViewExist = false;
    const descriptors = [
      {
        id: filterId,
        title: String(filterId),
        link: {
          type: debugMode ? PROJECT_USERDEBUG_PAGE : PROJECT_LAUNCHES_PAGE,
          payload: {
            projectId,
            filterId,
          },
          meta: {
            query: copyQuery(query, queryNamespacesToCopy),
          },
        },
        active: !testItemIds || testItemIds.length === 0,
      },
    ];
    if (!testItemIds || testItemIds.length === 0) {
      return descriptors;
    }
    return [
      ...descriptors,
      ...parentItems.map((item, i) => {
        if (!item) {
          return {
            id: testItemIds[i] || i,
            error: true,
            lost: i === 0 && parentItems.length > 1,
          };
        }
        queryNamespacesToCopy.push(getQueryNamespace(i));
        const listView = isListView(query, getQueryNamespace(i));
        const itemQuery = isListViewExist ? {} : copyQuery(query, queryNamespacesToCopy);
        if (listView) {
          isListViewExist = true;
        }
        return {
          id: item.id,
          title: itemTitleFormatter(item),
          link: {
            type: debugMode ? PROJECT_USERDEBUG_TEST_ITEM_PAGE : TEST_ITEM_PAGE,
            payload: {
              projectId,
              filterId,
              testItemIds: testItemIds && testItemIds.slice(0, i + 1).join('/'),
            },
            meta: {
              query: itemQuery,
            },
          },
          active: i === parentItems.length - 1,
          listView,
        };
      }),
    ];
  },
);

export const nameLinkSelector = (state, ownProps) => {
  const payload =
    (ownProps.ownLinkParams && ownProps.ownLinkParams.payload) || payloadSelector(state);
  let testItemIds = ownProps.testItemIds || testItemIdsSelector(state);
  const isDebugMode = debugModeSelector(state);
  let query = pagePropertiesSelector(state);
  const testItem = testItemSelector(state, ownProps.itemId);
  const hasChildren = testItem && testItem.hasChildren;
  const page =
    (ownProps.ownLinkParams && ownProps.ownLinkParams.page) ||
    getNextPage(isDebugMode, hasChildren);
  if (testItem) {
    const testItemPath = testItem.path.split('.').slice(0, -1);
    testItemIds = [testItem.launchId, ...testItemPath].join('/');
  }
  if (ownProps.uniqueId) {
    query = {
      ...query,
      'filter.eq.uniqueId': ownProps.uniqueId,
    };
  }

  return createLink(testItemIds, ownProps.itemId, payload, query, page);
};

export const statisticsLinkSelector = (state, ownProps) => {
  const query = pagePropertiesSelector(state);
  const payload =
    (ownProps.ownLinkParams && ownProps.ownLinkParams.payload) || payloadSelector(state);
  const testItemIds = testItemIdsSelector(state);
  const isDebugMode = debugModeSelector(state);
  const page =
    (ownProps.ownLinkParams && ownProps.ownLinkParams.page) || getNextPage(isDebugMode, true);
  return createLink(
    testItemIds,
    ownProps.itemId,
    payload,
    {
      ...query,
      ...createNamespacedQuery(
        {
          'filter.eq.hasStats': true,
          'filter.eq.hasChildren': false,
          'filter.in.type': LEVEL_STEP,
          'filter.in.status': ownProps.statuses && ownProps.statuses.join(','),
        },
        getQueryNamespace(
          testItemIdsArraySelector(state) ? testItemIdsArraySelector(state).length : 0,
        ),
      ),
    },
    page,
  );
};

export const defectLinkSelector = (state, ownProps) => {
  const query = pagePropertiesSelector(state);
  const payload =
    (ownProps.ownLinkParams && ownProps.ownLinkParams.payload) || payloadSelector(state);
  const testItemIds = testItemIdsSelector(state);
  const isDebugMode = debugModeSelector(state);
  let levelIndex = 0;
  if (testItemIdsArraySelector(state).length >= 0) {
    levelIndex = !ownProps.itemId
      ? testItemIdsArraySelector(state).length - 1
      : testItemIdsArraySelector(state).length;
  }
  let nextPage;
  if (ownProps.itemId) {
    nextPage = getNextPage(isDebugMode, true);
  } else {
    nextPage = isDebugMode ? PROJECT_USERDEBUG_TEST_ITEM_PAGE : TEST_ITEM_PAGE;
  }
  const page = (ownProps.ownLinkParams && ownProps.ownLinkParams.page) || nextPage;

  return createLink(
    testItemIds,
    ownProps.itemId,
    payload,
    {
      ...query,
      ...createNamespacedQuery(
        {
          'filter.eq.hasStats': true,
          'filter.eq.hasChildren': false,
          'filter.in.issueType': getDefectsString(ownProps.defects),
        },
        getQueryNamespace(levelIndex),
      ),
    },
    page,
  );
};

export const testCaseNameLinkSelector = (state, ownProps) => {
  const activeProject = activeProjectSelector(state);
  const payload = {
    projectId: activeProject,
    filterId: ALL,
  };

  return createLink(
    ownProps.testItemIds,
    ownProps.itemId,
    payload,
    {
      ...createNamespacedQuery(
        {
          'filter.eq.hasStats': true,
          'filter.eq.uniqueId': ownProps.uniqueId,
          'filter.eq.hasChildren': false,
        },
        getQueryNamespace(0),
      ),
    },
    TEST_ITEM_PAGE,
  );
};

const btsBackLinkBaseSelector = createSelector(payloadSelector, (payload) => {
  const { origin, pathname: pathPrefix } = window.location;
  const { projectId, filterId } = payload;

  return `${origin}${pathPrefix}#${projectId}/launches/${filterId}`;
});

export const btsIntegrationBackLinkSelector = (state, { path = '', launchId } = {}) => {
  const testLevel = levelSelector(state);

  if (testLevel !== LEVEL_STEP) {
    return window.location.toString();
  }

  const btsLinkBase = btsBackLinkBaseSelector(state);
  const searchString = searchStringSelector(state);

  return `${btsLinkBase}/${launchId}/${path.split('.').join('/')}/log?${searchString}`;
};

export const logPageOffsetSelector = createSelector(
  breadcrumbsSelector,
  testItemIdsArraySelector,
  (breadcrumbs, testItems) => {
    let offset = 1;
    const parentFromBreadcrumbs = breadcrumbs.find((item) => item.listView);
    if (parentFromBreadcrumbs) {
      const { id } = parentFromBreadcrumbs;
      offset = [...testItems].reverse().indexOf(id);
    }
    return offset;
  },
);

export const listViewLinkSelector = createSelector(
  pagePropertiesSelector,
  debugModeSelector,
  payloadSelector,
  (query, isDebugMode, payload) => ({
    type: isDebugMode ? PROJECT_USERDEBUG_TEST_ITEM_PAGE : TEST_ITEM_PAGE,
    payload,
    meta: {
      query,
    },
  }),
);

export const logViewLinkSelector = createSelector(
  pagePropertiesSelector,
  debugModeSelector,
  payloadSelector,
  (query, isDebugMode, payload) => {
    const page = isDebugMode ? PROJECT_USERDEBUG_LOG_PAGE : PROJECT_LOG_PAGE;
    return {
      type: page,
      payload,
      meta: {
        query,
      },
    };
  },
);
