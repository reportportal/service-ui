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

import { COLOR_BLACK } from 'common/constants/colors';
import {
  buildAxisTicks,
  buildTooltipFormatter,
} from 'components/widgets/common/echarts/configHelpers';
import { AXIS_LABEL_STYLE } from './stackedBarSeries';
import { buildAxisTooltip, buildCategoryXAxis, buildValueYAxis } from './echartsAxisBuilders';

/**
 * Shared building blocks for single-series "line per launch" trend charts
 * (for example failedCasesTrendChart) on top of the common axis builders
 * from `echartsAxisBuilders.js` / `stackedBarSeries.js`, so widget
 * `getOption` modules only need to supply what differs: value extraction and
 * the y-axis scale/ticks.
 */

// Preview has no axes, so it needs explicit padding to keep the line and dots off the edges.
const PREVIEW_GRID_PADDING = 12;

export const buildTrendChartGrid = (isPreview) => ({
  top: isPreview ? PREVIEW_GRID_PADDING : 95,
  left: isPreview ? PREVIEW_GRID_PADDING : 60,
  right: isPreview ? PREVIEW_GRID_PADDING : 20,
  bottom: isPreview ? PREVIEW_GRID_PADDING : 30,
  containLabel: false,
});

// The preview is much smaller than the real chart, so its dots are scaled down proportionally.
export const getTrendChartSymbolSize = (isPreview, singlePoint) => {
  if (singlePoint) return isPreview ? 3 : 6;
  return isPreview ? 0.5 : 1.2;
};

export const buildTrendChartXAxis = ({ categories, isPreview }) => {
  const tickValues = buildAxisTicks(categories.length);

  return buildCategoryXAxis({
    show: !isPreview,
    data: categories,
    onZero: true,
    axisLabelInterval: (index) => tickValues.includes(index),
    axisLineColor: COLOR_BLACK,
    showAxisTick: true,
    axisTickColor: COLOR_BLACK,
    axisTickLength: 6,
  });
};

export const buildTrendChartYAxis = ({ isPreview, name, nameGap = 32, min, max, customValues }) => {
  const baseYAxis = buildValueYAxis({
    show: !isPreview,
    min,
    max,
    name: isPreview ? undefined : name,
    nameGap,
    axisLabel: customValues ? { customValues } : undefined,
  });

  return customValues
    ? { ...baseYAxis, axisTick: { ...baseYAxis.axisTick, customValues } }
    : baseYAxis;
};

export const buildTrendChartLineSeries = ({ id, data, isPreview }) => {
  const singlePoint = data.length === 1;

  return {
    id,
    name: id,
    type: 'line',
    data,
    showSymbol: true,
    symbolSize: getTrendChartSymbolSize(isPreview, singlePoint),
    lineStyle: {
      width: 1,
    },
    emphasis: {
      scale: 4,
      itemStyle: {
        borderWidth: 2,
      },
    },
    triggerLineEvent: true,
    cursor: isPreview ? 'default' : 'pointer',
    silent: isPreview,
  };
};

export const buildTrendChartTooltip = ({
  isPreview,
  TooltipComponent,
  calculateTooltipParams,
  itemsData,
  formatMessage,
}) =>
  buildAxisTooltip({
    show: !isPreview,
    formatter: buildTooltipFormatter(TooltipComponent, calculateTooltipParams, {
      itemsData,
      formatMessage,
    }),
  });

/**
 * Assembles a full ECharts option for a single-series line trend chart.
 *
 * @param getValue - (item) => number, extracts the plotted value from a widget content item
 * @param buildYAxis - ({ isPreview, values, formatMessage }) => yAxis option object
 */
export const buildSingleLineTrendOption = ({
  content,
  isPreview,
  formatMessage,
  seriesId,
  color,
  getValue,
  buildYAxis,
  TooltipComponent,
  calculateTooltipParams,
}) => {
  const itemsData = [];
  const values = [];

  content.forEach((item) => {
    const { id, name, number, startTime } = item;
    itemsData.push({ id, name, number, startTime });
    values.push(getValue(item));
  });

  const categories = itemsData.map((item) => `# ${item.number}`);

  return {
    color: [color],
    textStyle: AXIS_LABEL_STYLE,
    grid: buildTrendChartGrid(isPreview),
    xAxis: buildTrendChartXAxis({ categories, isPreview }),
    yAxis: buildYAxis({ isPreview, values, formatMessage }),
    tooltip: buildTrendChartTooltip({
      isPreview,
      TooltipComponent,
      calculateTooltipParams,
      itemsData,
      formatMessage,
    }),
    legend: {
      show: false,
    },
    series: [buildTrendChartLineSeries({ id: seriesId, data: values, isPreview })],
    customData: {
      itemsData,
      colors: {
        [seriesId]: color,
      },
      legendItems: [seriesId],
    },
  };
};
