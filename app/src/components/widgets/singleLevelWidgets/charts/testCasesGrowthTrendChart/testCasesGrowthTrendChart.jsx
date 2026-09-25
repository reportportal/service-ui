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

import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { statisticsLinkSelector } from 'controllers/testItem';
import { createFilterAction } from 'controllers/filter';
import * as STATUSES from 'common/constants/testStatuses';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { ALL } from 'common/constants/reservedFilterIds';
import { EChart } from 'components/widgets/common/echarts';
import {
  getUpdatedFilterWithTime,
  getChartDefaultProps,
  getDefaultTestItemLinkParams,
} from 'components/widgets/common/utils';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { getOption } from './config/getOption';
import styles from './testCasesGrowthTrendChart.scss';

const cx = classNames.bind(styles);

export const TestCasesGrowthTrendChart = ({
  widget,
  container,
  isPreview = false,
  observer = {},
  heightOffset,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const slugs = useSelector(urlOrganizationAndProjectSelector);
  const getStatisticsLink = useSelector(statisticsLinkSelector);

  const isTimeline = useMemo(
    () =>
      Boolean(
        widget.contentParameters &&
          widget.contentParameters.widgetOptions.timeline ===
            MODES_VALUES[CHART_MODES.TIMELINE_MODE],
      ),
    [widget.contentParameters],
  );

  const timeLineModeClickHandler = useCallback(
    (data) => {
      const chartFilter = widget.appliedFilters[0];
      const arrResult = Object.keys(widget.content.result).map((item) => item);
      const itemDate = arrResult[data.index];
      const newFilter = getUpdatedFilterWithTime(chartFilter, itemDate);

      dispatch(createFilterAction(newFilter));
    },
    [dispatch, widget],
  );

  const launchModeClickHandler = useCallback(
    (data) => {
      const { organizationSlug, projectSlug } = slugs;
      const id = widget.content.result[data.index].id;
      const defaultParams = getDefaultTestItemLinkParams(projectSlug, ALL, id, organizationSlug);
      const statisticsLink = getStatisticsLink({
        statuses: [STATUSES.PASSED, STATUSES.FAILED, STATUSES.SKIPPED, STATUSES.INTERRUPTED],
      });

      dispatch(Object.assign(statisticsLink, defaultParams));
    },
    [dispatch, getStatisticsLink, slugs, widget],
  );

  const onChartClick = useCallback(
    (data) => (isTimeline ? timeLineModeClickHandler(data) : launchModeClickHandler(data)),
    [isTimeline, launchModeClickHandler, timeLineModeClickHandler],
  );

  const configData = useMemo(
    () => ({
      getOption,
      formatMessage,
      isTimeline,
      onChartClick,
    }),
    [formatMessage, isTimeline, onChartClick],
  );

  return (
    <div className={cx('test-cases-growth-trend-chart')}>
      <EChart
        {...getChartDefaultProps({ widget, container, isPreview, observer, heightOffset })}
        configData={configData}
        legendConfig={{
          showLegend: false,
        }}
      />
    </div>
  );
};

TestCasesGrowthTrendChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  heightOffset: PropTypes.number,
};
