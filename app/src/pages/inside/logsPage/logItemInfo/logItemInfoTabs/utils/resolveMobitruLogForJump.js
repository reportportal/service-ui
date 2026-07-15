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

const LOCATIONS_PAGE_SIZE = 300;

const LOCATION_QUERY_VARIANTS = [{}, { 'filter.gte.level': 'mobitru' }, { 'filter.eq.level': 'mobitru' }];

const findLogInLocationsPage = (content, logId) =>
  content?.find((log) => +log.id === +logId && log.pagesLocation?.length);

const fetchLocationsPage = ({ fetchFn, url, page, extraParams }) =>
  fetchFn(url, {
    params: {
      excludeLogContent: true,
      'page.size': LOCATIONS_PAGE_SIZE,
      'page.page': page,
      ...extraParams,
    },
  });

const searchLocationsPage = async ({
  fetchFn,
  url,
  logId,
  extraParams,
  page = 1,
  totalPages = 1,
}) => {
  if (page > totalPages) {
    return null;
  }

  const response = await fetchLocationsPage({ fetchFn, url, page, extraParams });
  const logInfo = findLogInLocationsPage(response?.content, logId);

  if (logInfo) {
    return logInfo;
  }

  return searchLocationsPage({
    fetchFn,
    url,
    logId,
    extraParams,
    page: page + 1,
    totalPages: response?.page?.totalPages || 1,
  });
};

const searchWithQueryVariants = async ({ fetchFn, url, logId, variantIndex = 0 }) => {
  if (variantIndex >= LOCATION_QUERY_VARIANTS.length) {
    return null;
  }

  const logInfo = await searchLocationsPage({
    fetchFn,
    url,
    logId,
    extraParams: LOCATION_QUERY_VARIANTS[variantIndex],
  });

  if (logInfo) {
    return logInfo;
  }

  return searchWithQueryVariants({ fetchFn, url, logId, variantIndex: variantIndex + 1 });
};

export const resolveMobitruLogForJump = async ({ fetchFn, projectKey, retryId, logId }) => {
  const url = URLS.errorLogs(projectKey, retryId);

  return searchWithQueryVariants({ fetchFn, url, logId });
};
