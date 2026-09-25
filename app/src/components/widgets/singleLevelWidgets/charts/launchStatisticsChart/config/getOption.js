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
  if (!id) return '';
  const resolved = data.find((d) => d.id === id);
  if (!resolved) return '';
  return calculateTooltipParams([resolved], color, customProps);
};

const buildAreaSeries = (itemNames, dataByName, colors) =>
  itemNames.map((name) => ({
    id: name,
    name,
    type: 'line',
    stack: 'total',
    data: dataByName[name],
    areaStyle: { opacity: 0.75 },
    lineStyle: { width: 0 },
    symbol: 'none',
    smooth: false,
    triggerLineEvent: true,
    cursor: 'pointer',
    itemStyle: { color: colors[name] },
    emphasis: { disabled: true },
  }));

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

  const dataByName = {};
  chartDataOrdered.forEach((col) => {
    dataByName[col[0]] = col.slice(1);
  });

  const categories = itemsData.map((item) => {
    if (isTimeline) {
      const day = moment(item.date).format('dddd').substring(0, 3);
      return `${day}, ${item.date}`;
    }
    return `#${item.number}`;
  });

  const tickValues = buildAxisTicks(itemsData.length, isTimeline);
  const isAreaView = widgetViewMode === MODES_VALUES[CHART_MODES.AREA_VIEW];
  const isActiveAreaView = isAreaView && !isSingleColumn;
  const withZoom = !isPreview && isZoomEnabled;

  let gridBottom = 40;
  if (isPreview) gridBottom = 0;
  else if (withZoom) gridBottom = 80;

  const series = isActiveAreaView
    ? buildAreaSeries(itemNames, dataByName, colors)
    : createBarSeries(itemNames, dataByName, colors, {
        stack: 'total',
        barWidth: '60%',
        barCategoryGap: '40%',
      });

  const hoveredSeriesRef = isActiveAreaView ? { current: null } : null;

  const tooltipFormatter = buildTooltipFormatter(
    IssueTypeStatTooltip,
    isActiveAreaView ? buildAreaTooltipCalculator(hoveredSeriesRef) : calculateTooltipParams,
    { itemsData, isTimeline, formatMessage, defectTypes },
  );

  const tooltip = isActiveAreaView
    ? buildAxisTooltip({ show: !isPreview, formatter: tooltipFormatter, axisPointer: { type: 'none' } })
    : buildItemTooltip({ show: !isPreview, formatter: tooltipFormatter });

  return {
    color: itemNames.map((name) => colors[name]),
    textStyle: AXIS_LABEL_STYLE,
    grid: {
      top: isPreview ? 0 : 85,
      left: isPreview ? 0 : 40,
      right: isPreview ? 0 : 30,
      bottom: gridBottom,
      containLabel: false,
    },
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
    tooltip,
    ...(withZoom
      ? {
          dataZoom: [
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
          ],
        }
      : {}),
    legend: { show: false },
    series,
    customData: {
      itemsData,
      colors,
      legendItems: itemNames,
      ...(isActiveAreaView ? { hoveredSeriesRef, isAreaMode: true } : {}),
    },
  };
};
