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
  testItemIdsArraySelector,
  createQueryParametersSelector,
  pagePropertiesSelector,
  TEST_ITEM_PAGE,
  PROJECT_LAUNCHES_PAGE,
  PROJECT_USERDEBUG_TEST_ITEM_PAGE,
  PROJECT_USERDEBUG_PAGE,
  PROJECT_USERDEBUG_LOG_PAGE,
  PROJECT_LOG_PAGE,
  payloadSelector,
  testItemIdsSelector,
  searchStringSelector,
  querySelector,
  filterIdSelector,
  HISTORY_PAGE,
  UNIQUE_ERRORS_PAGE,
  pageSelector,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { activeFilterSelector } from 'controllers/filter';
import { NAMESPACE as LAUNCH_NAMESPACE, debugModeSelector } from 'controllers/launch';
import {
  copyQuery,
  createNamespacedQuery,
  extractNamespacedQuery,
} from 'common/utils/routingUtils';
import { LEVEL_SUITE, LEVEL_TEST, LEVEL_STEP } from 'common/constants/launchLevels';
import { ALL } from 'common/constants/reservedFilterIds';
import { FILTER_TITLES } from 'common/constants/reservedFilterTitles';
import { suitesSelector, suitePaginationSelector } from 'controllers/suite';
import { testsSelector, testPaginationSelector } from 'controllers/test';
import { stepsSelector, stepPaginationSelector } from 'controllers/step';
import { defectTypesSelector } from 'controllers/project';
import { isEmptyObject, omit } from 'common/utils';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { SORTING_KEY } from 'controllers/sorting';
import { clusterItemsSelector } from 'controllers/uniqueErrors/clusterItems/selectors';
import {
  DEFAULT_SORTING,
  TEST_ITEMS_TYPE_LIST,
  COMPOSITE_ATTRIBUTES_FILTER,
  LEVEL_ATTRIBUTES_FILTER,
  PROVIDER_TYPE_MODIFIERS_ID_MAP,
} from './constants';
import {
  createLink,
  getQueryNamespace,
  getDefectsString,
  normalizeTestItem,
  getNextPage,
  isListView,
  cleanUpTestItemQuery,
} from './utils';

const domainSelector = (state) => state.testItem || {};

export const levelSelector = (state) => domainSelector(state).level;
export const loadingSelector = (state) => domainSelector(state).loading;
export const pageLoadingSelector = (state) => domainSelector(state).pageLoading;
export const filteredItemStatisticsSelector = (state) =>
  domainSelector(state).filteredItemStatistics;

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

export const isTestItemsListSelector = createSelector(
  testItemIdsSelector,
  (testItemIds) => testItemIds === TEST_ITEMS_TYPE_LIST,
);

export const searchedTestItemsSelector = (state) => domainSelector(state).searchedItems;

export const isSearchWidgetItemsExistSelector = (state) =>
  !isEmptyObject(searchedTestItemsSelector(state));

export const isFilterParamsExistsSelector = (state) => {
  const namespace = namespaceSelector(state);
  const query = queryParametersSelector(state, namespace);

  return !!Object.keys(omit(query, [PAGE_KEY, SIZE_KEY, SORTING_KEY])).length;
};

export const isStepLevelSelector = (state) => levelSelector(state) === LEVEL_STEP;

export const itemsSelector = (state) => {
  const query = querySelector(state);
  if (query.clusterId) {
    return clusterItemsSelector(state, query.clusterId).content;
  }

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

export const compositeAttributesSelector = (state) => {
  const queryParameters = queryParametersSelector(state, namespaceSelector(state));
  return queryParameters[LEVEL_ATTRIBUTES_FILTER] || queryParameters[COMPOSITE_ATTRIBUTES_FILTER];
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
  activeFilterSelector,
  parentItemsSelector,
  testItemIdsArraySelector,
  pagePropertiesSelector,
  debugModeSelector,
  filterIdSelector,
  isTestItemsListSelector,
  urlOrganizationAndProjectSelector,
  (
    filter,
    parentItems,
    testItemIdsArray,
    query,
    debugMode,
    filterCategory,
    isTestItemsListView,
    slugs,
  ) => {
    const { organizationSlug, projectSlug } = slugs;
    const queryNamespacesToCopy = [LAUNCH_NAMESPACE];
    let isListViewExist = false;
    const filterId = filter?.id || filterCategory;
    const filterName = filter?.name || FILTER_TITLES[filterCategory];
    const descriptors = [
      {
        id: filterId,
        title: filterName,
        link: {
          type: debugMode ? PROJECT_USERDEBUG_PAGE : PROJECT_LAUNCHES_PAGE,
          payload: {
            projectSlug,
            filterId,
            organizationSlug,
          },
          meta: {
            query: copyQuery(query, queryNamespacesToCopy),
          },
        },
        active: !testItemIdsArray || testItemIdsArray.length === 0,
      },
    ];
    if (!testItemIdsArray || testItemIdsArray.length === 0) {
      return descriptors;
    }

    if (isTestItemsListView) {
      return [
        ...descriptors,
        {
          id: `listView${filterId}`,
          title: filterName,
          link: {
            type: debugMode ? PROJECT_USERDEBUG_TEST_ITEM_PAGE : TEST_ITEM_PAGE,
            payload: {
              projectSlug,
              filterId,
              testItemIds: TEST_ITEMS_TYPE_LIST,
              organizationSlug,
            },
            meta: {
              query: copyQuery(query, queryNamespacesToCopy),
            },
          },
          active: true,
          listView: true,
        },
      ];
    }
    return [
      ...descriptors,
      ...parentItems.map((item, i) => {
        if (!item) {
          return {
            id: testItemIdsArray[i] || i,
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
              projectSlug,
              filterId,
              testItemIds: testItemIdsArray?.slice(0, i + 1).join('/'),
              organizationSlug,
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
  const { ownLinkParams, itemId, uniqueId } = ownProps;
  const payload = ownLinkParams?.payload || payloadSelector(state);
  if (payload.dashboardId && !payload.filterId) {
    payload.filterId = ALL;
  }
  let testItemIds = ownLinkParams?.testItemIds || testItemIdsSelector(state);
  const isDebugMode = debugModeSelector(state);
  let query = pagePropertiesSelector(state);
  const testItem = ownLinkParams?.testItem || testItemSelector(state, itemId);
  const hasChildren = testItem?.hasChildren;
  const page = ownLinkParams?.page || getNextPage(isDebugMode, hasChildren);
  if (testItem) {
    const testItemPath = testItem.path.split('.').slice(0, -1);
    testItemIds = [testItem.launchId, ...testItemPath].join('/');
  }

  if (uniqueId) {
    query = {
      ...query,
      'filter.eq.uniqueId': uniqueId,
    };
  }

  if (ownLinkParams?.testItem?.clusterId) {
    query = {
      ...query,
      clusterId: ownLinkParams.testItem.clusterId,
    };
  }
  return createLink(testItemIds, itemId, payload, query, page);
};

export const statisticsLinkSelector = createSelector(
  querySelector,
  payloadSelector,
  testItemIdsSelector,
  debugModeSelector,
  testItemIdsArraySelector,
  (query, payload, testItemIds, isDebugMode, testItemIdsArray) => (ownProps) => {
    const {
      launchesLimit,
      providerType,
      isLatest,
      ownLinkParams,
      itemId,
      keepFilterParams,
      attributeKey,
      attributeValue,
      compositeAttribute,
      levelAttribute,
      baselineLaunchId,
      launchId,
      statuses,
      startTime,
      types,
    } = ownProps;
    const linkPayload = ownLinkParams?.payload || payload;
    const providerTypeModifierId = PROVIDER_TYPE_MODIFIERS_ID_MAP[providerType];
    const page = ownLinkParams?.page || getNextPage(isDebugMode, true);
    let levelIndex = 0;
    if (testItemIdsArray.length > 0) {
      levelIndex = !itemId ? testItemIdsArray.length - 1 : testItemIdsArray.length;
    }
    const queryNamespace = getQueryNamespace(levelIndex);
    const params = {
      ...(keepFilterParams ? extractNamespacedQuery(query, queryNamespace) : {}),
      'filter.eq.hasStats': true,
      'filter.eq.hasChildren': false,
      'filter.in.type': LEVEL_STEP,
      'filter.has.attributeKey': attributeKey,
      'filter.has.attributeValue': attributeValue,
      'filter.has.compositeAttribute': compositeAttribute,
      'filter.has.levelAttribute': levelAttribute,
      providerType,
      [providerTypeModifierId]: ownProps[providerTypeModifierId],
      launchesLimit,
      isLatest,
      ...(baselineLaunchId && { baselineLaunchId }),
      ...(launchId && { launchId }),
    };
    if (statuses) {
      params['filter.in.status'] = statuses.join(',');
    }
    if (startTime) {
      params['filter.btw.startTime'] = startTime.join(',');
    }
    if (types === null) {
      delete params['filter.in.type'];
    }

    return createLink(
      testItemIds,
      itemId,
      linkPayload,
      {
        ...query,
        ...createNamespacedQuery(params, queryNamespace),
      },
      page,
    );
  },
);

export const defectLinkSelector = createSelector(
  pagePropertiesSelector,
  payloadSelector,
  testItemIdsSelector,
  debugModeSelector,
  testItemIdsArraySelector,
  (query, payload, testItemIds, isDebugMode, testItemIdsArray) => (ownProps) => {
    const {
      ownLinkParams,
      launchesLimit,
      providerType,
      isLatest,
      itemId,
      keepFilterParams,
      defects,
      attributeKey,
      attributeValue,
      levelAttribute,
      compositeAttribute,
      filterType,
      filterTypes,
      startTime,
    } = ownProps;
    const linkPayload = ownLinkParams?.payload || payload;
    const providerTypeModifierId = PROVIDER_TYPE_MODIFIERS_ID_MAP[providerType];
    let levelIndex = 0;
    if (testItemIdsArray.length > 0) {
      levelIndex = !itemId ? testItemIdsArray.length - 1 : testItemIdsArray.length;
    }
    let nextPage;
    if (itemId) {
      nextPage = getNextPage(isDebugMode, true);
    } else {
      nextPage = isDebugMode ? PROJECT_USERDEBUG_TEST_ITEM_PAGE : TEST_ITEM_PAGE;
    }
    const page = ownLinkParams?.page || nextPage;
    const queryNamespace = getQueryNamespace(levelIndex);
    const params = {
      ...(keepFilterParams ? extractNamespacedQuery(query, queryNamespace) : {}),
      'filter.eq.hasStats': true,
      'filter.eq.hasChildren': false,
      'filter.in.issueType': getDefectsString(defects),
      'filter.has.attributeKey': attributeKey,
      'filter.has.attributeValue': attributeValue,
      'filter.has.levelAttribute': levelAttribute,
      providerType,
      [providerTypeModifierId]: ownProps[providerTypeModifierId],
      launchesLimit,
      isLatest,
    };

    if (compositeAttribute) {
      params['filter.has.compositeAttribute'] = compositeAttribute;
    }

    if (filterType) {
      params['filter.in.type'] = filterTypes ? [...filterTypes, LEVEL_STEP].join(',') : LEVEL_STEP;
    }

    if (startTime) {
      params['filter.btw.startTime'] = startTime.join(',');
    }

    return createLink(
      testItemIds,
      itemId,
      linkPayload,
      {
        ...query,
        ...createNamespacedQuery(params, queryNamespace),
      },
      page,
    );
  },
);

export const testCaseNameLinkSelector = (state) => (ownProps) => {
  const { organizationSlug, projectSlug } = urlOrganizationAndProjectSelector(state);
  const payload = {
    projectSlug,
    filterId: ALL,
    organizationSlug,
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
  const { organizationSlug, projectSlug, filterId } = payload;

  return `${origin}${pathPrefix}#organizations/${organizationSlug}/projects/${projectSlug}/launches/${filterId}`;
});

export const btsIntegrationBackLinkSelector = (state, { path = '', launchId } = {}) => {
  const isLogPage = pageSelector(state) === PROJECT_LOG_PAGE;

  if (isLogPage) {
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
      offset = [...testItems].reverse().indexOf(String(id));
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
      query: cleanUpTestItemQuery(query),
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
        query: cleanUpTestItemQuery(query),
      },
    };
  },
);

export const historyViewLinkSelector = createSelector(
  payloadSelector,
  querySelector,
  (payload, query) => ({
    type: HISTORY_PAGE,
    payload,
    meta: {
      query: cleanUpTestItemQuery(query),
    },
  }),
);

export const uniqueErrorsLinkSelector = createSelector(
  payloadSelector,
  querySelector,
  (payload, query) => ({
    type: UNIQUE_ERRORS_PAGE,
    payload,
    meta: {
      query,
    },
  }),
);

export const getLogItemLinkSelector = createSelector(
  urlOrganizationAndProjectSelector,
  ({ organizationSlug, projectSlug }) => (testItem) => {
    const payload = {
      projectSlug,
      filterId: ALL,
      organizationSlug,
    };

    const testItemPath = testItem.path.split('.').slice(0, -1);
    const testItemIds = [testItem.launchId, ...testItemPath].join('/');
    const itemId = testItem.id || testItem.itemId;

    return createLink(testItemIds, itemId, payload, {}, PROJECT_LOG_PAGE);
  },
);
