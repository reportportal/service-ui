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
import { extractNamespacedQuery } from 'common/utils/routingUtils';
import { DEFAULT_PAGINATION, DEFAULT_PAGE_SIZE, SIZE_KEY } from 'controllers/pagination';
import { SORTING_KEY } from 'controllers/sorting';
import { getStorageItem } from 'common/utils';
import { userIdSelector } from 'controllers/user';
import { ALL } from 'common/constants/reservedFilterIds';
import { pageNames, NO_PAGE } from './constants';
import { stringToArray } from './utils';

export const locationSelector = (state) => state.location || {};
export const payloadSelector = (state) => locationSelector(state).payload || {};
export const searchStringSelector = (state) => locationSelector(state).search || '';
export const isInitialDispatchDoneSelector = (state) => !!locationSelector(state).kind;
export const currentPathSelector = (state) => {
  const { pathname, search } = locationSelector(state);
  return `${pathname}${search || ''}`;
};

export const activeDashboardIdSelector = (state) => payloadSelector(state).dashboardId;
export const projectIdSelector = (state) => payloadSelector(state).projectId;
export const suiteIdSelector = (state) => payloadSelector(state).suiteId;
export const filterIdSelector = (state) => payloadSelector(state).filterId || ALL;
export const testItemIdsSelector = (state) =>
  payloadSelector(state).testItemIds && String(payloadSelector(state).testItemIds);
export const testItemIdsArraySelector = createSelector(
  testItemIdsSelector,
  (itemIdsString) => (itemIdsString && itemIdsString.split('/').map((item) => Number(item))) || [],
);
export const logItemIdSelector = createSelector(
  testItemIdsArraySelector,
  (itemIdsArray) => Number(itemIdsArray.length && itemIdsArray[itemIdsArray.length - 1]) || 0,
);

export const settingsTabSelector = (state) => payloadSelector(state).settingsTab;
export const pluginsTabSelector = (state) => payloadSelector(state).pluginsTab;

export const pageSelector = (state) => pageNames[state.location.type] || NO_PAGE;
export const projectSectionSelector = (state) => payloadSelector(state).projectSection || '';
export const querySelector = createSelector(locationSelector, (location) => location.query || {});

const commonPagePropertiesSelector = (query, namespace, mapping = undefined) => {
  if (!query) {
    return {};
  }

  const extractedQuery = namespace ? extractNamespacedQuery(query, namespace) : query;

  if (!mapping) {
    return extractedQuery;
  }

  const result = {};
  Object.keys(mapping).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(extractedQuery, key)) {
      const propertyName = mapping[key];
      result[propertyName] = extractedQuery[key];
    }
  });
  return result;
};

export const pagePropertiesSelector = (state, namespace, mapping) => {
  const query = querySelector(state);
  return commonPagePropertiesSelector(query, namespace, mapping);
};

export const prevPagePropertiesSelector = (
  {
    location: {
      prev: { query },
    },
  },
  namespace,
  mapping,
) => commonPagePropertiesSelector(query, namespace, mapping);

export const createQueryParametersSelector = ({
  namespace: staticNamespace,
  defaultPagination,
  defaultSorting,
} = {}) => (state, namespace) => {
  const calculatedNamespace = staticNamespace || namespace;
  const query = pagePropertiesSelector(state, calculatedNamespace);
  const queryParameters = {
    ...(defaultPagination || DEFAULT_PAGINATION),
    [SORTING_KEY]: defaultSorting || '',
    ...query,
  };
  if ((!defaultPagination || !defaultPagination[SIZE_KEY]) && calculatedNamespace) {
    const userId = userIdSelector(state);
    const userSettings = getStorageItem(`${userId}_settings`) || {};
    queryParameters[SIZE_KEY] = userSettings[`${calculatedNamespace}PageSize`] || DEFAULT_PAGE_SIZE;
  }
  return queryParameters;
};

export const launchIdSelector = (state) => {
  const testItemIds = testItemIdsArraySelector(state);
  return testItemIds && testItemIds[0];
};

export const pathnameChangedSelector = (state) => {
  const pathName = state.location.pathname;
  const prevPathName = state.location.prev.pathname;
  return pathName !== prevPathName;
};

export const prevTestItemSelector = ({ location }) => {
  const currentPath = stringToArray(location.payload.testItemIds, '/');
  const prevPath = stringToArray(location.prev.payload.testItemIds, '/');
  if (currentPath.length >= prevPath.length) return null;
  return parseInt(prevPath[currentPath.length], 10);
};
