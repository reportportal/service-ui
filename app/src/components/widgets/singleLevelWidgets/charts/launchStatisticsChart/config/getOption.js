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
import { COLOR_GRAY_80 } from 'common/constants/colors';
import { AXIS_LABEL_STYLE, createBarSeries } from '../../common/stackedBarSeries';
import { buildAxisTooltip, buildItemTooltip } from '../../common/echartsAxisBuilders';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { getConfigData, calculateTooltipParams } from './utils';

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
    areaStyle: { opacity: 0.75 },
    lineStyle: { width: 0 },
    symbol: 'none',
    smooth: true,
    triggerLineEvent: true,
    silent: isPreview,
    cursor: isPreview ? 'default' : 'pointer',
    itemStyle: { color: colors[name] },
    emphasis: { disabled: true },
  }));

const buildDataByName = (chartDataOrdered) =>
  Object.fromEntries(chartDataOrdered.map((col) => [col[0], col.slice(1)]));

const buildCategory = (item, isTimeline) => {
  if (!isTimeline) {
    return `#${item.number}`;
  }
  const day = moment(item.date).format('dddd').substring(0, 3);
  return `${day}, ${item.date}`;
};

const getGridBottom = (isPreview, withZoom) => {
  if (isPreview) return 0;
  return withZoom ? 80 : 40;
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
    height: 30,
    bottom: 10,
    showDataShadow: true,
    fillerColor: 'rgba(130, 146, 204, 0.15)',
    borderColor: COLOR_GRAY_80,
    dataBackground: {
      areaStyle: { color: '#d0d8e8', opacity: 0.8 },
      lineStyle: { color: '#b0bad0', width: 1 },
    },
    selectedDataBackground: {
      areaStyle: { color: '#b0bad0', opacity: 0.6 },
      lineStyle: { color: '#8292cc', width: 1 },
    },
  },
];

const buildSeries = ({ isActiveAreaView, isPreview, itemNames, dataByName, colors }) =>
  isActiveAreaView
    ? buildAreaSeries(itemNames, dataByName, colors, isPreview)
    : createBarSeries(itemNames, dataByName, colors, {
        silent: isPreview,
        stack: 'total',
        barWidth: '60%',
        barCategoryGap: '40%',
      });

const buildTooltip = ({ isActiveAreaView, isPreview, hoveredSeriesRef, tooltipData }) => {
  const baseFormatter = buildTooltipFormatter(
    IssueTypeStatTooltip,
    isActiveAreaView ? buildAreaTooltipCalculator(hoveredSeriesRef) : calculateTooltipParams,
    tooltipData,
  );

  if (!isActiveAreaView) {
    return buildItemTooltip({ show: !isPreview, formatter: baseFormatter });
  }

  // In area view the axis tooltip fires anywhere in the grid; show nothing unless an area is hovered.
  const formatter = (params) => (hoveredSeriesRef.current ? baseFormatter(params) : '');
  return buildAxisTooltip({ show: !isPreview, formatter, axisPointer: { type: 'none' } });
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
        lineStyle: { color: COLOR_GRAY_80, width: 1 },
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
        lineStyle: { color: COLOR_GRAY_80, width: 1 },
      },
    },
    tooltip: buildTooltip({
      isActiveAreaView,
      isPreview,
      hoveredSeriesRef,
      tooltipData: { itemsData, isTimeline, formatMessage, defectTypes },
    }),
    ...(withZoom ? { dataZoom: buildDataZoom() } : {}),
    legend: { show: false },
    series: buildSeries({ isActiveAreaView, isPreview, itemNames, dataByName, colors }),
    customData: {
      itemsData,
      colors,
      legendItems: itemNames,
      ...(withZoom ? { resizeCursor: true } : {}),
      ...(isActiveAreaView ? { hoveredSeriesRef, isAreaMode: true } : {}),
    },
  };
};
