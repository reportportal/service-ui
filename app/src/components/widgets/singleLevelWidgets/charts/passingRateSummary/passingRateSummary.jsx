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
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { STATS_PASSED } from 'common/constants/statistics';
import { PASSED, FAILED, INTERRUPTED, SKIPPED } from 'common/constants/testStatuses';
import { statisticsLinkSelector, TEST_ITEMS_TYPE_LIST } from 'controllers/testItem';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { getDefaultTestItemLinkParams } from 'components/widgets/common/utils';
import { messages } from 'components/widgets/common/messages';
import { PassingRateChart } from '../common/passingRateChart';

export const PassingRateSummary = (props) => {
  const { widget } = props;
  const dispatch = useDispatch();
  const slugs = useSelector(urlOrganizationAndProjectSelector);
  const getStatisticsLink = useSelector(statisticsLinkSelector);

  const onChartClick = useCallback(
    (data) => {
      const { organizationSlug, projectSlug } = slugs;
      const { excludeSkipped } = widget.contentParameters.widgetOptions;
      const linkCreationParametersForFailed = excludeSkipped
        ? [FAILED, INTERRUPTED]
        : [FAILED, INTERRUPTED, SKIPPED];

      const link = getStatisticsLink({
        statuses: data.id === STATS_PASSED ? [PASSED] : linkCreationParametersForFailed,
        launchesLimit: widget.contentParameters.itemsCount,
      });
      const navigationParams = getDefaultTestItemLinkParams(
        projectSlug,
        widget.appliedFilters[0].id,
        TEST_ITEMS_TYPE_LIST,
        organizationSlug,
      );

      dispatch(Object.assign(link, navigationParams));
    },
    [dispatch, getStatisticsLink, slugs, widget],
  );

  const filterName = widget.appliedFilters[0]?.name;

  return (
    <PassingRateChart
      {...props}
      filterNameTitle={messages.filterLabel}
      filterName={filterName}
      onChartClick={onChartClick}
    />
  );
};

PassingRateSummary.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
};
