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
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import {
  PRODUCT_BUG,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
  NO_DEFECT,
  TO_INVESTIGATE,
} from 'common/constants/defectTypes';
import { defectLinkSelector, statisticsLinkSelector } from 'controllers/testItem';
import { createFilterAction } from 'controllers/filter';
import {
  getUpdatedFilterWithTime,
  getChartDefaultProps,
  getDefaultTestItemLinkParams,
} from 'components/widgets/common/utils';
import { defectTypesSelector } from 'controllers/project';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import * as STATUSES from 'common/constants/testStatuses';
import { ALL } from 'common/constants/reservedFilterIds';
import { EChart } from 'components/widgets/common/echarts';
import { getOption as getStatusPageOption } from '../common/statusPageChartConfig';
import { selectOptionFunction } from './config';
import styles from './investigatedTrendChart.scss';

const cx = classNames.bind(styles);

export const InvestigatedTrendChart = ({
  widget,
  container,
  isPreview = false,
  observer = {},
  heightOffset,
  onStatusPageMode = false,
  interval = null,
  integerValueType = false,
  uncheckedLegendItems = [],
  onChangeLegend = () => {},
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const slugs = useSelector(urlOrganizationAndProjectSelector);
  const defectTypes = useSelector(defectTypesSelector);
  const getDefectLink = useSelector(defectLinkSelector);
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

  const getDefectTypeLocators = useCallback(
    (id) => {
      const investigatedDefectType = [PRODUCT_BUG, AUTOMATION_BUG, SYSTEM_ISSUE, NO_DEFECT];
      const toInvestigateDefectType = [TO_INVESTIGATE];
      const defectType = id === 'toInvestigate' ? toInvestigateDefectType : investigatedDefectType;

      return defectType
        .reduce((acc, currentValue) => acc.concat(defectTypes[currentValue.toUpperCase()]), [])
        .map((item) => item.locator);
    },
    [defectTypes],
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

  const sortedLaunchResult = useMemo(
    () =>
      [...(widget.content?.result ?? [])].sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime),
      ),
    [widget.content?.result],
  );

  const launchModeClickHandler = useCallback(
    (data) => {
      const { organizationSlug, projectSlug } = slugs;
      const id = sortedLaunchResult[data.index].id;
      const defaultParams = getDefaultTestItemLinkParams(projectSlug, ALL, id, organizationSlug);
      const defectTypeLocators = getDefectTypeLocators(data.id);
      const link = defectTypeLocators
        ? getDefectLink({ defects: defectTypeLocators, itemId: id })
        : getStatisticsLink({
            statuses: [STATUSES.PASSED, STATUSES.FAILED, STATUSES.SKIPPED, STATUSES.INTERRUPTED],
          });

      dispatch(Object.assign(link, defaultParams));
    },
    [dispatch, getDefectLink, getDefectTypeLocators, getStatisticsLink, slugs, sortedLaunchResult],
  );

  const onChartClick = useCallback(
    (data) => (isTimeline ? timeLineModeClickHandler(data) : launchModeClickHandler(data)),
    [isTimeline, launchModeClickHandler, timeLineModeClickHandler],
  );

  const configData = useMemo(() => {
    if (onStatusPageMode) {
      return {
        formatMessage,
        getOption: getStatusPageOption,
        interval,
        chartType: MODES_VALUES[CHART_MODES.BAR_VIEW],
        integerValueType,
        wrapperClassName: cx('tooltip-container'),
      };
    }

    return {
      formatMessage,
      getOption: selectOptionFunction(isTimeline),
      onChartClick,
    };
  }, [
    formatMessage,
    integerValueType,
    interval,
    isTimeline,
    onChartClick,
    onStatusPageMode,
  ]);

  const legendConfig = useMemo(
    () => ({
      onChangeLegend,
      showLegend: !onStatusPageMode,
      uncheckedLegendItems,
    }),
    [onChangeLegend, onStatusPageMode, uncheckedLegendItems],
  );

  return (
    <div className={cx('investigated-trend-chart', { 'timeline-mode': isTimeline })}>
      <EChart
        {...getChartDefaultProps({ widget, container, isPreview, observer, heightOffset })}
        className={cx('widget-wrapper')}
        legendConfig={legendConfig}
        configData={configData}
      />
    </div>
  );
};

InvestigatedTrendChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  heightOffset: PropTypes.number,
  onStatusPageMode: PropTypes.bool,
  interval: PropTypes.string,
  integerValueType: PropTypes.bool,
  uncheckedLegendItems: PropTypes.array,
  onChangeLegend: PropTypes.func,
};
