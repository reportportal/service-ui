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
import { messages } from 'components/widgets/common/messages';
import { FAILED, PASSED, INTERRUPTED, SKIPPED } from 'common/constants/testStatuses';
import { ALL } from 'common/constants/reservedFilterIds';
import { getDefaultTestItemLinkParams } from 'components/widgets/common/utils';
import { statisticsLinkSelector } from 'controllers/testItem';
import { STATS_PASSED } from 'common/constants/statistics';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { PassingRateChart } from '../common/passingRateChart';

const getFilterName = ({ contentParameters, content: { result = {} } = {} } = {}) =>
  `${contentParameters.widgetOptions.launchNameFilter} #${result.number}`;

export const PassingRatePerLaunch = (props) => {
  const { widget } = props;
  const dispatch = useDispatch();
  const slugs = useSelector(urlOrganizationAndProjectSelector);
  const getStatisticsLink = useSelector(statisticsLinkSelector);

  const onChartClick = useCallback(
    (data) => {
      const { organizationSlug, projectSlug } = slugs;
      const launchId = widget.content.result.id;
      const { excludeSkipped } = widget.contentParameters.widgetOptions;
      const linkCreationParametersForFailed = excludeSkipped
        ? [FAILED, INTERRUPTED]
        : [FAILED, INTERRUPTED, SKIPPED];
      const statuses = data.id === STATS_PASSED ? [PASSED] : linkCreationParametersForFailed;
      const link = getStatisticsLink({ statuses });
      const navigationParams = getDefaultTestItemLinkParams(
        projectSlug,
        ALL,
        launchId,
        organizationSlug,
      );

      dispatch(Object.assign(link, navigationParams));
    },
    [dispatch, getStatisticsLink, slugs, widget],
  );

  return (
    <PassingRateChart
      {...props}
      filterNameTitle={messages.launchName}
      filterName={getFilterName(widget)}
      onChartClick={onChartClick}
    />
  );
};

PassingRatePerLaunch.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
};
