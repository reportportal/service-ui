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

import { useCallback, useMemo, useRef } from 'react';
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
import { COLOR_CHART_SLIDER_ACCENT } from 'common/constants/colors';
import { EChart } from 'components/widgets/common/echarts';
import {
  getChartDefaultProps,
  getDefaultTestItemLinkParams,
  getItemNameConfig,
  getDefectTypeLocators,
} from 'components/widgets/common/utils';
import { getMillisecondsWoTimezone } from 'common/utils/timeDateUtils';
import { isSingleColumnChart } from './config/utils';
import { getOption } from './config/getOption';
import {
  TOTAL_KEY,
  LEGEND_MAX_HEIGHT,
  ZOOM_CORNER_RADIUS,
  ZOOM_SHADOW_BOTTOM_GAP,
  ZOOM_SHADOW_SMOOTH,
} from './constants';
import { getLaunchStatisticsColor } from './chartColors';
import styles from './launchStatisticsChart.scss';

const cx = classNames.bind(styles);

const getLinkParametersStatuses = ({ defectType }) =>
  defectType === TOTAL_KEY ? [PASSED, FAILED, SKIPPED, INTERRUPTED] : [defectType.toUpperCase()];

// ECharts has no options for these zoom slider details, so its elements are adjusted after render:
// - selection (filler): teal outline + small radius
// - mini chart (data shadow): smoothed curve, lifted a few px above the slider bottom
// - frame: only top and bottom lines (no side borders)
// Values are set only when they differ, otherwise each change would trigger another render.
const styleZoomSlider = (view) => {
  const { filler, dataShadowSegs = [], sliderGroup } = view._displayables || {};
  const [width, height] = view._size || [];
  if (!filler || !sliderGroup || !height) return;

  if (filler.shape.r !== ZOOM_CORNER_RADIUS) filler.setShape({ r: ZOOM_CORNER_RADIUS });
  if (filler.style.stroke !== COLOR_CHART_SLIDER_ACCENT) {
    filler.setStyle({ stroke: COLOR_CHART_SLIDER_ACCENT, lineWidth: 1 });
  }

  const scaleY = (height - ZOOM_SHADOW_BOTTOM_GAP) / height;
  dataShadowSegs.forEach((seg) => {
    // the slider group is flipped vertically, so a positive y moves the shadow up
    if (seg.y !== ZOOM_SHADOW_BOTTOM_GAP || seg.scaleY !== scaleY) {
      seg.attr({ y: ZOOM_SHADOW_BOTTOM_GAP, scaleY });
    }
    seg.eachChild((shape) => {
      if (shape.shape.smooth !== ZOOM_SHADOW_SMOOTH) shape.setShape({ smooth: ZOOM_SHADOW_SMOOTH });
    });
  });

  sliderGroup.eachChild((el) => {
    const isFrame =
      el !== filler &&
      el.type === 'rect' &&
      el.silent &&
      el.shape.width === width &&
      el.style.stroke;
    // dash pattern along the rect path: top drawn, right side skipped, bottom drawn, left side skipped
    if (isFrame && !el.style.lineDash) el.setStyle({ lineDash: [width, height, width, height] });
  });
};

const applyZoomSliderStyles = (chart) => {
  if (!chart || chart.zoomSliderStyled) return;
  chart.zoomSliderStyled = true;
  const apply = () =>
    (chart._componentsViews || []).forEach((view) => view && styleZoomSlider(view));
  chart.on('rendered', apply);
  chart.on('finished', apply);
  apply();
};

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

  const { widgetOptions = {}, contentFields = [] } = widget.contentParameters || {};
  const isTimeline = widgetOptions.timeline === MODES_VALUES[CHART_MODES.TIMELINE_MODE];
  const isZoomEnabled = Boolean(widgetOptions.zoom);
  const widgetViewMode = widgetOptions.viewMode;

  const isSingleColumn = useMemo(
    () => isSingleColumnChart(widget.content, isTimeline),
    [widget.content, isTimeline],
  );

  const onChartCreated = useCallback((_node, chart, customData) => {
    chartDataRef.current = customData;
    applyZoomSliderStyles(chart);
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
      getOption,
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
