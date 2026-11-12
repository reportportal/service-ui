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

import moment from 'moment';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import {
  buildAxisTicks,
  buildTooltipFormatter,
} from 'components/widgets/common/echarts/configHelpers';
import {
  COLOR_ALMOST_BLACK,
  COLOR_CHART_AXIS_LINE,
  COLOR_CHART_SLIDER_ACCENT,
  COLOR_CHART_SLIDER_BG,
  COLOR_WHITE_TWO,
} from 'common/constants/colors';
import { createBarSeries } from '../../common/stackedBarSeries';
import { buildAxisTooltip, buildItemTooltip } from '../../common/echartsAxisBuilders';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { getConfigData, calculateTooltipParams } from './utils';
import { TIMELINE_AXIS_DATE_FORMAT, CHART_FONT_FAMILY } from '../constants';

const AXIS_LABEL_STYLE = {
  fontFamily: CHART_FONT_FAMILY,
  fontWeight: 400,
  fontSize: 13,
  lineHeight: 18,
  color: COLOR_ALMOST_BLACK,
};
// 5x20 pill; ECharts keeps the icon's aspect ratio and scales it to `handleSize`
const SLIDER_HANDLE_ICON =
  'path://M2.5,0 a2.5,2.5 0 0 1 2.5,2.5 v15 a2.5,2.5 0 0 1 -5,0 v-15 a2.5,2.5 0 0 1 2.5,-2.5 z';
const SLIDER_HANDLE_HEIGHT = 20;
const SLIDER_FILL_ALPHA = '26'; // hex alpha of the accent color (15%) for the selected range
const SLIDER_MARGIN_TOP = 5; // extra space between the x-axis labels and the zoom slider
// white border = gap between stacked segments
const BAR_SEGMENT_STYLE = { borderColor: COLOR_WHITE_TWO, borderWidth: 1 };
const BAR_SEGMENT_STYLE_PREVIEW = { ...BAR_SEGMENT_STYLE, borderWidth: 0.5 };
// The 1px border is drawn centred on the edge and eats into the corner, so a path radius of 3
// gives a visible 2px rounding. The smaller preview uses a smaller radius.
const BAR_TOP_RADIUS = [3, 3, 0, 0];
const BAR_TOP_RADIUS_PREVIEW = [2, 2, 0, 0];
// Tiny non-zero segments (e.g. 1 of 500) are given a minimum share of the tallest stack so they stay
// visible. Done in the data (not via barMinHeight) so segments never overlap and gaps stay uniform.
const BAR_MIN_SEGMENT_SHARE = 0.04;
const BAR_TINY_BASE = 0.2; // share of the threshold that the smallest non-zero value is drawn at

// Round only the top corners of the topmost non-zero segment of each stack; inner joins stay square.
// Series hidden via the legend are ignored, so the top visible segment is the rounded one.
const withTopRounding = (itemNames, dataByName, isPreview, hiddenItems = []) => {
  const visibleNames = itemNames.filter((name) => !hiddenItems.includes(name));
  const count = itemNames.length ? dataByName[itemNames[0]].length : 0;
  const maxTotal = Math.max(
    0,
    ...Array.from({ length: count }, (_, index) =>
      visibleNames.reduce((sum, name) => sum + (dataByName[name][index] || 0), 0),
    ),
  );
  const minSegment = maxTotal * BAR_MIN_SEGMENT_SHARE;
  const topSeriesByIndex = Array.from({ length: count }, (_, index) => {
    for (let i = visibleNames.length - 1; i >= 0; i -= 1) {
      if (dataByName[visibleNames[i]][index] > 0) return visibleNames[i];
    }
    return null;
  });

  return Object.fromEntries(
    itemNames.map((name) => [
      name,
      dataByName[name].map((value, index) => {
        // zero points are not rendered at all (no ghost blocks on hover)
        if (!value) return null;
        // below the threshold, scale from a small base up to the threshold so 1 still looks smaller than 5
        const drawnValue =
          value >= minSegment
            ? value
            : minSegment * BAR_TINY_BASE + (minSegment * (1 - BAR_TINY_BASE) * value) / minSegment;
        return topSeriesByIndex[index] === name
          ? {
              value: drawnValue,
              itemStyle: { borderRadius: isPreview ? BAR_TOP_RADIUS_PREVIEW : BAR_TOP_RADIUS },
            }
          : drawnValue;
      }),
    ]),
  );
};

const buildAreaTooltipCalculator = (hoveredSeriesRef) => (data, color, customProps) => {
  const id = hoveredSeriesRef.current;
  const resolved = id ? data.find((d) => d.id === id) : undefined;
  return resolved ? calculateTooltipParams([resolved], color, customProps) : {};
};

const buildAreaSeries = (itemNames, dataByName, colors, isPreview) =>
  itemNames.map((name) => ({
    id: name,
    name,
    type: 'line',
    stack: 'total',
    data: dataByName[name],
    areaStyle: { opacity: 1 },
    lineStyle: { width: 0 },
    symbol: 'none',
    smooth: true,
    triggerLineEvent: true,
    silent: isPreview,
    cursor: isPreview ? 'default' : 'pointer',
    itemStyle: { color: colors[name] },
    // native emphasis is off: the axis tooltip would highlight ALL areas; hover is applied in EChart.tsx
    emphasis: { disabled: true },
  }));

const buildDataByName = (chartDataOrdered) =>
  Object.fromEntries(chartDataOrdered.map((col) => [col[0], col.slice(1)]));

const buildCategory = (item, isTimeline) => {
  if (!isTimeline) {
    return `#${item.number}`;
  }
  return moment(item.date).format(TIMELINE_AXIS_DATE_FORMAT);
};

const getGridBottom = (isPreview, withZoom) => {
  if (isPreview) return 0;
  return withZoom ? 80 + SLIDER_MARGIN_TOP : 40;
};

const buildGrid = (isPreview, withZoom) => ({
  top: isPreview ? 0 : 85,
  left: isPreview ? 0 : 40,
  right: isPreview ? 0 : 30,
  bottom: getGridBottom(isPreview, withZoom),
  containLabel: false,
});

const buildDataZoom = () => [
  { type: 'inside', zoomRate: 0.02, throttle: 100 },
  {
    type: 'slider',
    height: 40,
    bottom: 12, // gap under the slider
    showDataShadow: true,
    showDetail: false,
    brushSelect: false,
    fillerColor: `${COLOR_CHART_SLIDER_ACCENT}${SLIDER_FILL_ALPHA}`,
    borderColor: COLOR_CHART_AXIS_LINE,
    borderRadius: 0, // frame side borders are hidden (launchStatisticsChart.jsx), so no corners
    handleIcon: SLIDER_HANDLE_ICON,
    handleSize: SLIDER_HANDLE_HEIGHT,
    handleStyle: { color: COLOR_CHART_SLIDER_ACCENT, borderWidth: 0 },
    moveHandleSize: 0,
    dataBackground: {
      areaStyle: { color: COLOR_CHART_SLIDER_BG, opacity: 1 },
      lineStyle: { color: COLOR_CHART_SLIDER_BG, width: 1 },
    },
    selectedDataBackground: {
      areaStyle: { color: COLOR_CHART_SLIDER_ACCENT, opacity: 0.2 },
      lineStyle: { opacity: 0 }, // no darker outline along the selected part of the mini chart
    },
  },
];

const buildSeries = ({
  isActiveAreaView,
  isPreview,
  itemNames,
  dataByName,
  colors,
  hiddenItems,
}) =>
  isActiveAreaView
    ? buildAreaSeries(itemNames, dataByName, colors, isPreview)
    : createBarSeries(
        itemNames,
        withTopRounding(itemNames, dataByName, isPreview, hiddenItems),
        colors,
        {
          silent: isPreview,
          stack: 'total',
          barWidth: '60%',
          barCategoryGap: '40%',
          itemStyle: isPreview ? BAR_SEGMENT_STYLE_PREVIEW : BAR_SEGMENT_STYLE,
        },
      ).map((series) => ({
        ...series,
        // hover only lightens the hovered segment (no size / border / shape change)
        emphasis: isPreview
          ? { disabled: true }
          : { focus: 'none', scale: false, itemStyle: { opacity: 0.75 } },
      }));

const TOOLTIP_SHELL = {
  backgroundColor: 'transparent',
  borderWidth: 0,
  extraCssText: 'box-shadow: none; padding: 0;',
};

const buildTooltip = ({ isActiveAreaView, isPreview, hoveredSeriesRef, tooltipData }) => {
  const baseFormatter = buildTooltipFormatter(
    IssueTypeStatTooltip,
    isActiveAreaView ? buildAreaTooltipCalculator(hoveredSeriesRef) : calculateTooltipParams,
    tooltipData,
  );

  if (!isActiveAreaView) {
    return {
      ...buildItemTooltip({ show: !isPreview, formatter: baseFormatter }),
      ...TOOLTIP_SHELL,
    };
  }

  // In area view the axis tooltip fires anywhere in the grid; show nothing unless an area is hovered.
  const formatter = (params) => (hoveredSeriesRef.current ? baseFormatter(params) : '');
  return {
    ...buildAxisTooltip({ show: !isPreview, formatter, axisPointer: { type: 'none' } }),
    ...TOOLTIP_SHELL,
  };
};

export const getBarSeriesData = ({
  content,
  defectTypes,
  orderedContentFields,
  contentFields,
  isTimeline,
  isPreview,
  hiddenItems,
}) => {
  const { itemNames, chartDataOrdered } = getConfigData(content, {
    defectTypes,
    orderedContentFields,
    contentFields,
    isTimeline,
  });
  const barData = withTopRounding(
    itemNames,
    buildDataByName(chartDataOrdered),
    isPreview,
    hiddenItems,
  );

  return itemNames.map((name) => ({ id: name, data: barData[name] }));
};

export const getOption = ({
  content,
  isPreview,
  formatMessage,
  isTimeline,
  isZoomEnabled,
  widgetViewMode,
  isFullscreen,
  defectTypes,
  orderedContentFields,
  contentFields,
  isSingleColumn,
  hiddenItems = [],
}) => {
  const { itemNames, itemsData, colors, chartDataOrdered } = getConfigData(content, {
    defectTypes,
    orderedContentFields,
    contentFields,
    isTimeline,
  });

  const dataByName = buildDataByName(chartDataOrdered);
  const categories = itemsData.map((item) => buildCategory(item, isTimeline));
  const tickValues = buildAxisTicks(itemsData.length, isTimeline);
  const isActiveAreaView =
    widgetViewMode === MODES_VALUES[CHART_MODES.AREA_VIEW] && !isSingleColumn;
  const withZoom = !isPreview && isZoomEnabled;
  const hoveredSeriesRef = isActiveAreaView ? { current: null } : null;

  return {
    color: itemNames.map((name) => colors[name]),
    textStyle: AXIS_LABEL_STYLE,
    grid: buildGrid(isPreview, withZoom),
    xAxis: {
      type: 'category',
      show: !isPreview,
      data: categories,
      boundaryGap: true,
      axisLine: {
        show: true,
        lineStyle: { color: COLOR_CHART_AXIS_LINE, width: 1 },
      },
      axisTick: { show: false },
      axisLabel: {
        ...AXIS_LABEL_STYLE,
        margin: 8,
        interval: (index) => tickValues.includes(index),
        hideOverlap: true,
      },
    },
    yAxis: {
      type: 'value',
      show: !isPreview && isFullscreen,
      min: 0,
      axisLabel: { ...AXIS_LABEL_STYLE, margin: 8 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: !isPreview,
        lineStyle: { color: COLOR_CHART_AXIS_LINE, width: 1 },
      },
    },
    tooltip: buildTooltip({
      isActiveAreaView,
      isPreview,
      hoveredSeriesRef,
      tooltipData: { itemsData, isTimeline, formatMessage, defectTypes, realValues: dataByName },
    }),
    ...(withZoom ? { dataZoom: buildDataZoom() } : {}),
    legend: { show: false },
    series: buildSeries({
      isActiveAreaView,
      isPreview,
      itemNames,
      dataByName,
      colors,
      hiddenItems,
    }),
    customData: {
      itemsData,
      colors,
      legendItems: itemNames,
      ...(withZoom ? { resizeCursor: true } : {}),
      ...(isActiveAreaView ? { hoveredSeriesRef, isAreaMode: true } : {}),
    },
  };
};
