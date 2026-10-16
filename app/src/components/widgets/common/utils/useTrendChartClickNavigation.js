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

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { statisticsLinkSelector } from 'controllers/testItem';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { getDefaultTestItemLinkParams } from './utils';

/**
 * Shared click handler for single-launch-series trend charts: resolves the
 * statistics link for `statusesLinkParams` and navigates to the clicked
 * launch's filtered test items. `statusesLinkParams` should be a stable
 * (module-level or memoized) reference.
 */
export const useTrendChartClickNavigation = (widget, statusesLinkParams) => {
  const dispatch = useDispatch();
  const slugs = useSelector(urlOrganizationAndProjectSelector);
  const getStatisticsLink = useSelector(statisticsLinkSelector);

  return useCallback(
    (data) => {
      const { organizationSlug, projectSlug } = slugs;
      const launchIds = widget.content.result.map((item) => item.id);
      const link = getStatisticsLink(statusesLinkParams);
      const navigationParams = getDefaultTestItemLinkParams(
        projectSlug,
        widget.appliedFilters[0].id,
        launchIds[data.index],
        organizationSlug,
      );

      dispatch(Object.assign(link, navigationParams));
    },
    [dispatch, getStatisticsLink, slugs, widget, statusesLinkParams],
  );
};
