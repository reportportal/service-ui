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

import { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { defectTypesSelector, orderedContentFieldsSelector } from 'controllers/project';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import {
  defectLinkSelector,
  statisticsLinkSelector,
  TEST_ITEMS_TYPE_LIST,
} from 'controllers/testItem';
import { PASSED, FAILED, SKIPPED, INTERRUPTED } from 'common/constants/testStatuses';
import { ALL } from 'common/constants/reservedFilterIds';
import { EChart } from 'components/widgets/common/echarts';
import {
  getChartDefaultProps,
  getDefaultTestItemLinkParams,
  getItemNameConfig,
  getDefectTypeLocators,
} from 'components/widgets/common/utils';
import { getMillisecondsWoTimezone } from 'common/utils/timeDateUtils';
import { isSingleColumnChart } from './config/utils';
import { getOption, getBarSeriesData } from './config/getOption';
import { TOTAL_KEY, LEGEND_MAX_HEIGHT } from './constants';
import { getLaunchStatisticsColor } from './chartColors';
import { applyZoomSliderStyles } from './zoomSliderStyles';
import styles from './launchStatisticsChart.scss';

const cx = classNames.bind(styles);

const getLinkParametersStatuses = ({ defectType }) =>
  defectType === TOTAL_KEY ? [PASSED, FAILED, SKIPPED, INTERRUPTED] : [defectType.toUpperCase()];

export const LaunchStatisticsChart = ({
  widget,
  container,
  isPreview = false,
  isFullscreen = false,
  observer = {},
  uncheckedLegendItems = [],
  onChangeLegend = () => {},
  heightOffset,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const slugs = useSelector(urlOrganizationAndProjectSelector);
  const defectTypes = useSelector(defectTypesSelector);
  const orderedContentFields = useSelector(orderedContentFieldsSelector);
  const getDefectLink = useSelector(defectLinkSelector);
  const getStatisticsLink = useSelector(statisticsLinkSelector);
  const chartDataRef = useRef({ itemsData: [] });
  const barDataParamsRef = useRef(null);
  // Series hidden via the legend. Kept in a ref (not in the chart config deps), so toggling the
  // legend never rebuilds the chart: the legend listener below updates the bars in place.
  const hiddenItemsRef = useRef(uncheckedLegendItems);

  const { widgetOptions = {}, contentFields = [] } = widget.contentParameters || {};
  const isTimeline = widgetOptions.timeline === MODES_VALUES[CHART_MODES.TIMELINE_MODE];
  const isZoomEnabled = Boolean(widgetOptions.zoom);
  const widgetViewMode = widgetOptions.viewMode;

  const isSingleColumn = useMemo(
    () => isSingleColumnChart(widget.content, isTimeline),
    [widget.content, isTimeline],
  );

  const isBarView = widgetViewMode !== MODES_VALUES[CHART_MODES.AREA_VIEW] || isSingleColumn;

  // Latest inputs for the bar data, read by the legend listener (which is bound once per chart).
  // `content` is what EChart passes to getOption (widget.content.result).
  useEffect(() => {
    barDataParamsRef.current = isBarView
      ? {
          content: widget.content?.result,
          defectTypes,
          orderedContentFields,
          contentFields,
          isTimeline,
          isPreview,
        }
      : null;
  }, [
    isBarView,
    widget.content,
    defectTypes,
    orderedContentFields,
    contentFields,
    isTimeline,
    isPreview,
  ]);

  // The current legend state is read when the option is built, so a rebuild (e.g. data refresh)
  // keeps the bar rounding of the hidden series; legend toggles themselves don't rebuild the chart.
  const getOptionWithHiddenItems = useCallback(
    (params) => getOption({ ...params, hiddenItems: hiddenItemsRef.current }),
    [],
  );

  const onChartCreated = useCallback((_node, chart, customData) => {
    chartDataRef.current = customData;
    applyZoomSliderStyles(chart);

    // Hiding a series via the legend doesn't rebuild the chart, so the bar top rounding is
    // recalculated for the visible series here (updated in place, zoom is kept).
    chart.on('legendselectchanged', ({ selected }) => {
      hiddenItemsRef.current = Object.keys(selected).filter((name) => !selected[name]);
      if (!barDataParamsRef.current) return;
      chart.setOption({
        series: getBarSeriesData({
          ...barDataParamsRef.current,
          hiddenItems: hiddenItemsRef.current,
        }),
      });
    });
  }, []);

  const launchModeClickHandler = useCallback(
    (data) => {
      if (!widget.content?.result?.[data.index]) return;
      const { organizationSlug, projectSlug } = slugs;
      const id = widget.content.result[data.index].id;
      const defaultParams = getDefaultTestItemLinkParams(projectSlug, ALL, id, organizationSlug);
      const nameConfig = getItemNameConfig(data.id);
      const locators = getDefectTypeLocators(nameConfig, defectTypes);
      const link = locators
        ? getDefectLink({ defects: locators, itemId: id })
        : getStatisticsLink({ statuses: getLinkParametersStatuses(nameConfig) });

      dispatch({ ...link, ...defaultParams });
    },
    [defectTypes, dispatch, getDefectLink, getStatisticsLink, slugs, widget.content],
  );

  const timeLineModeClickHandler = useCallback(
    (data) => {
      if (!widget.appliedFilters?.length) return;
      const { organizationSlug, projectSlug } = slugs;
      const chartFilterId = widget.appliedFilters[0].id;
      const launchesLimit = widget.contentParameters.itemsCount;
      const nameConfig = getItemNameConfig(data.id);
      const defaultParams = getDefaultTestItemLinkParams(
        projectSlug,
        chartFilterId,
        TEST_ITEMS_TYPE_LIST,
        organizationSlug,
      );
      const locators = getDefectTypeLocators(nameConfig, defectTypes);
      const dateValue = chartDataRef.current.itemsData[data.index]?.date;
      if (!dateValue) return;
      const startDate = getMillisecondsWoTimezone(dateValue);
      const day = 86400000;
      const endDate = startDate + day;

      const link = locators
        ? getDefectLink({
            defects: locators,
            itemId: TEST_ITEMS_TYPE_LIST,
            startTime: [startDate, endDate],
            launchesLimit,
          })
        : getStatisticsLink({
            statuses: getLinkParametersStatuses(nameConfig),
            startTime: [startDate, endDate],
            launchesLimit,
          });

      dispatch({ ...link, ...defaultParams });
    },
    [
      defectTypes,
      dispatch,
      getDefectLink,
      getStatisticsLink,
      slugs,
      widget.appliedFilters,
      widget.contentParameters,
    ],
  );

  const onChartClick = useCallback(
    (data) => (isTimeline ? timeLineModeClickHandler(data) : launchModeClickHandler(data)),
    [isTimeline, launchModeClickHandler, timeLineModeClickHandler],
  );

  const configData = useMemo(
    () => ({
      getOption: getOptionWithHiddenItems,
      formatMessage,
      isTimeline,
      isZoomEnabled,
      widgetViewMode,
      isFullscreen,
      defectTypes,
      orderedContentFields,
      contentFields,
      isSingleColumn,
      onChartClick,
    }),
    [
      getOptionWithHiddenItems,
      formatMessage,
      isTimeline,
      isZoomEnabled,
      widgetViewMode,
      isFullscreen,
      defectTypes,
      orderedContentFields,
      contentFields,
      isSingleColumn,
      onChartClick,
    ],
  );

  const legendConfig = useMemo(
    () => ({
      onChangeLegend,
      showLegend: true,
      uncheckedLegendItems,
      legendProps: {
        className: cx('legend'),
        getColor: getLaunchStatisticsColor,
        maxHeight: LEGEND_MAX_HEIGHT,
        alwaysShowScroll: true,
      },
    }),
    [onChangeLegend, uncheckedLegendItems],
  );

  return (
    <div
      className={cx('launch-statistics-chart', {
        'area-view': widgetViewMode === MODES_VALUES[CHART_MODES.AREA_VIEW],
        'full-screen': isFullscreen,
        'time-line': isTimeline,
        preview: isPreview,
      })}
    >
      <EChart
        {...getChartDefaultProps({ widget, container, isPreview, observer, heightOffset })}
        legendConfig={legendConfig}
        configData={configData}
        chartCreatedCallback={onChartCreated}
      />
    </div>
  );
};

LaunchStatisticsChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  isFullscreen: PropTypes.bool,
  observer: PropTypes.object,
  uncheckedLegendItems: PropTypes.array,
  onChangeLegend: PropTypes.func,
  heightOffset: PropTypes.number,
};
