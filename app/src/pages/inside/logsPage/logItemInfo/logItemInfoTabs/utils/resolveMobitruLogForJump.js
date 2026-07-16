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
import { LOG_MESSAGE_FILTER_KEY } from 'controllers/log/constants';
import { PAGE_KEY } from 'controllers/pagination';

const LOCATIONS_PAGE_SIZE = 300;

const LOCATION_QUERY_VARIANTS = [
  { 'filter.eq.level': 'mobitru' },
  { 'filter.gte.level': 'mobitru' },
  {},
];

const findLogInLocationsPage = (content, logId) =>
  content?.find((log) => +log.id === +logId && log.pagesLocation?.length);

const buildLocationQueryParams = (logQuery = {}) => {
  const { [LOG_MESSAGE_FILTER_KEY]: _messageFilter, [PAGE_KEY]: _page, ...rest } = logQuery;

  return rest;
};

const normalizeLocationsResponse = (response) => {
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
  const { content, page: pageInfo } = normalizeLocationsResponse(response);
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

  const pageSize = logQueryParams['page.size'] || LOCATIONS_PAGE_SIZE;
  const response = await fetchFn(URLS.logItems(projectKey, parentItemId), {
    params: {
      ...logQueryParams,
      'page.size': pageSize,
      'page.page': page,
    },
  });

  const content = response?.content ?? [];
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
    totalPages: response?.page?.totalPages || 1,
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
  if (+itemId === +retryId) {
    const logPage = await findItemPageInNestedLogs({
      fetchFn,
      projectKey,
      parentItemId: retryId,
      targetId: logId,
      logQueryParams,
    });

    if (!logPage) {
      return null;
    }

    return { id: logId, pagesLocation: [{ [logId]: logPage }] };
  }

  const stepPage = await findItemPageInNestedLogs({
    fetchFn,
    projectKey,
    parentItemId: retryId,
    targetId: itemId,
    logQueryParams,
  });

  if (!stepPage) {
    return null;
  }

  const logPage = await findItemPageInNestedLogs({
    fetchFn,
    projectKey,
    parentItemId: itemId,
    targetId: logId,
    logQueryParams,
  });

  if (!logPage) {
    return null;
  }

  return {
    id: logId,
    pagesLocation: [{ [itemId]: stepPage }, { [logId]: logPage }],
  };
};

export const resolveMobitruLogForJump = async ({
  fetchFn,
  projectKey,
  retryId,
  itemId,
  logId,
  logQuery,
}) => {
  const url = URLS.errorLogs(projectKey, retryId);
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
