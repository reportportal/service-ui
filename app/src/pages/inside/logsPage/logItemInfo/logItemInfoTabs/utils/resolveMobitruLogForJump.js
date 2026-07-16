/*
 * Copyright 2026 EPAM Systems
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

import { URLS } from 'common/urls';
import { omit } from 'common/utils/omit';
import { LOG_LEVEL_FILTER_KEY, LOG_MESSAGE_FILTER_KEY } from 'controllers/log/constants';
import { PAGE_KEY } from 'controllers/pagination';

const LOCATIONS_PAGE_SIZE = 300;
const LEVEL_FILTER_KEYS = [LOG_LEVEL_FILTER_KEY, 'filter.eq.level'];

const LOCATION_QUERY_VARIANTS = [
  { 'filter.eq.level': 'mobitru' },
  { 'filter.gte.level': 'mobitru' },
];

const findLogInLocationsPage = (content, logId) =>
  content?.find((log) => +log.id === +logId && log.pagesLocation?.length);

const buildLocationQueryParams = (logQuery = {}) =>
  omit(logQuery, [LOG_MESSAGE_FILTER_KEY, PAGE_KEY]);

const buildNestedGridQueryParams = (logQueryParams = {}) =>
  omit(logQueryParams, LEVEL_FILTER_KEYS);

const normalizePageResponse = (response) => {
  if (Array.isArray(response)) {
    return { content: response, page: { totalPages: 1 } };
  }

  return {
    content: response?.content ?? [],
    page: response?.page ?? { totalPages: 1 },
  };
};

const fetchLocationsPage = ({ fetchFn, url, page, logQueryParams, extraParams }) =>
  fetchFn(url, {
    params: {
      excludeLogContent: true,
      'page.size': logQueryParams['page.size'] || LOCATIONS_PAGE_SIZE,
      'page.page': page,
      ...logQueryParams,
      ...extraParams,
    },
  });

const searchLocationsPage = async ({
  fetchFn,
  url,
  logId,
  logQueryParams,
  extraParams,
  page = 1,
  totalPages = 1,
}) => {
  if (page > totalPages) {
    return null;
  }

  const response = await fetchLocationsPage({ fetchFn, url, page, logQueryParams, extraParams });
  const { content, page: pageInfo } = normalizePageResponse(response);
  const logInfo = findLogInLocationsPage(content, logId);

  if (logInfo) {
    return logInfo;
  }

  return searchLocationsPage({
    fetchFn,
    url,
    logId,
    logQueryParams,
    extraParams,
    page: page + 1,
    totalPages: pageInfo?.totalPages || 1,
  });
};

const searchWithQueryVariants = async ({
  fetchFn,
  url,
  logId,
  logQueryParams,
  variantIndex = 0,
}) => {
  if (variantIndex >= LOCATION_QUERY_VARIANTS.length) {
    return null;
  }

  const logInfo = await searchLocationsPage({
    fetchFn,
    url,
    logId,
    logQueryParams,
    extraParams: LOCATION_QUERY_VARIANTS[variantIndex],
  });

  if (logInfo) {
    return logInfo;
  }

  return searchWithQueryVariants({
    fetchFn,
    url,
    logId,
    logQueryParams,
    variantIndex: variantIndex + 1,
  });
};

const fetchNestedLogsPage = async ({ fetchFn, projectKey, parentItemId, logQueryParams, page }) => {
  const nestedQueryParams = buildNestedGridQueryParams(logQueryParams);
  const pageSize = nestedQueryParams['page.size'] || LOCATIONS_PAGE_SIZE;
  const response = await fetchFn(URLS.logItems(projectKey, parentItemId), {
    params: {
      ...nestedQueryParams,
      'page.size': pageSize,
      'page.page': page,
    },
  });

  return normalizePageResponse(response);
};

const findItemPageInNestedLogs = async ({
  fetchFn,
  projectKey,
  parentItemId,
  targetId,
  logQueryParams,
  page = 1,
  totalPages = 1,
}) => {
  if (page > totalPages) {
    return null;
  }

  const { content, page: pageInfo } = await fetchNestedLogsPage({
    fetchFn,
    projectKey,
    parentItemId,
    logQueryParams,
    page,
  });
  const isFound = content.some((item) => +item.id === +targetId);

  if (isFound) {
    return page;
  }

  return findItemPageInNestedLogs({
    fetchFn,
    projectKey,
    parentItemId,
    targetId,
    logQueryParams,
    page: page + 1,
    totalPages: pageInfo?.totalPages || 1,
  });
};

const isNestedStepItem = (item) => Boolean(item?.hasContent);

const searchNestedStepsSequentially = ({
  fetchFn,
  projectKey,
  nestedSteps,
  logId,
  logQueryParams,
  pathPrefix,
  page,
  visitedItemIds,
  stepIndex = 0,
}) => {
  if (stepIndex >= nestedSteps.length) {
    return Promise.resolve(null);
  }

  const step = nestedSteps[stepIndex];

  return findLogPathRecursively({
    fetchFn,
    projectKey,
    parentItemId: step.id,
    logId,
    logQueryParams,
    pathPrefix: [...pathPrefix, { [step.id]: page }],
    visitedItemIds,
  }).then((nestedResult) => {
    if (nestedResult) {
      return nestedResult;
    }

    return searchNestedStepsSequentially({
      fetchFn,
      projectKey,
      nestedSteps,
      logId,
      logQueryParams,
      pathPrefix,
      page,
      visitedItemIds,
      stepIndex: stepIndex + 1,
    });
  });
};

const findLogPathRecursively = async ({
  fetchFn,
  projectKey,
  parentItemId,
  logId,
  logQueryParams,
  pathPrefix = [],
  page = 1,
  totalPages = 1,
  visitedItemIds = new Set(),
}) => {
  if (page > totalPages) {
    return null;
  }

  if (page === 1) {
    if (visitedItemIds.has(+parentItemId)) {
      return null;
    }
    visitedItemIds.add(+parentItemId);
  }

  const { content, page: pageInfo } = await fetchNestedLogsPage({
    fetchFn,
    projectKey,
    parentItemId,
    logQueryParams,
    page,
  });

  if (content.some((item) => +item.id === +logId)) {
    return {
      id: logId,
      pagesLocation: [...pathPrefix, { [logId]: page }],
    };
  }

  const nestedResult = await searchNestedStepsSequentially({
    fetchFn,
    projectKey,
    nestedSteps: content.filter(isNestedStepItem),
    logId,
    logQueryParams,
    pathPrefix,
    page,
    visitedItemIds,
  });

  if (nestedResult) {
    return nestedResult;
  }

  return findLogPathRecursively({
    fetchFn,
    projectKey,
    parentItemId,
    logId,
    logQueryParams,
    pathPrefix,
    page: page + 1,
    totalPages: pageInfo?.totalPages || 1,
    visitedItemIds,
  });
};

const resolveMobitruLogFromNestedGrid = async ({
  fetchFn,
  projectKey,
  retryId,
  itemId,
  logId,
  logQueryParams,
}) => {
  if (itemId != null && +itemId === +retryId) {
    const logPage = await findItemPageInNestedLogs({
      fetchFn,
      projectKey,
      parentItemId: retryId,
      targetId: logId,
      logQueryParams,
    });

    if (logPage) {
      return { id: logId, pagesLocation: [{ [logId]: logPage }] };
    }
  }

  if (itemId != null && +itemId !== +retryId) {
    const stepPage = await findItemPageInNestedLogs({
      fetchFn,
      projectKey,
      parentItemId: retryId,
      targetId: itemId,
      logQueryParams,
    });

    if (stepPage) {
      const logPage = await findItemPageInNestedLogs({
        fetchFn,
        projectKey,
        parentItemId: itemId,
        targetId: logId,
        logQueryParams,
      });

      if (logPage) {
        return {
          id: logId,
          pagesLocation: [{ [itemId]: stepPage }, { [logId]: logPage }],
        };
      }
    }
  }

  return findLogPathRecursively({
    fetchFn,
    projectKey,
    parentItemId: retryId,
    logId,
    logQueryParams,
  });
};

export const resolveMobitruLogForJump = async ({
  fetchFn,
  projectKey,
  retryId,
  itemId,
  logId,
  logQuery,
}) => {
  const url = URLS.searchLogs(projectKey, retryId).replace(/\?.*$/, '');
  const logQueryParams = buildLocationQueryParams(logQuery);

  const logInfoFromLocations = await searchWithQueryVariants({
    fetchFn,
    url,
    logId,
    logQueryParams,
  });

  if (logInfoFromLocations) {
    return logInfoFromLocations;
  }

  return resolveMobitruLogFromNestedGrid({
    fetchFn,
    projectKey,
    retryId,
    itemId,
    logId,
    logQueryParams,
  });
};
