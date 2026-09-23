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

import { COLOR_BLACK, COLOR_CHARCOAL_GREY, COLOR_GRAY_80 } from 'common/constants/colors';
import { buildAxisTicks, buildTooltipFormatter } from './configHelpers';

/**
 * Shared building blocks for single-series "line per launch" trend charts
 * (for example failedCasesTrendChart, nonPassedTestCasesTrendChart) so widget
 * `getOption` modules only need to supply what differs: value extraction and
 * the y-axis scale/ticks.
 */

export const TREND_AXIS_LABEL_STYLE = {
  fontFamily: 'OpenSans',
  fontSize: 10,
  fontWeight: 400,
  color: COLOR_CHARCOAL_GREY,
};

export const buildTrendChartGrid = (isPreview) => ({
  top: isPreview ? 0 : 95,
  left: isPreview ? 0 : 60,
  right: isPreview ? 0 : 20,
  bottom: isPreview ? 0 : 30,
  containLabel: false,
});

export const buildTrendChartXAxis = ({ categories, isPreview }) => {
  const tickValues = buildAxisTicks(categories.length);

  return {
    type: 'category',
    show: !isPreview,
    data: categories,
    boundaryGap: true,
    axisLine: {
      show: true,
      onZero: true,
      lineStyle: {
        color: COLOR_BLACK,
        width: 1,
      },
    },
    axisTick: {
      show: true,
      interval: 0,
      alignWithLabel: true,
      inside: false,
      length: 6,
      lineStyle: {
        color: COLOR_BLACK,
        width: 1,
      },
    },
    axisLabel: {
      ...TREND_AXIS_LABEL_STYLE,
      margin: 8,
      interval: (index) => tickValues.includes(index),
      hideOverlap: true,
    },
  };
};

export const buildTrendChartYAxisBase = ({ isPreview, name, nameGap = 32 }) => ({
  type: 'value',
  show: !isPreview,
  name: isPreview ? undefined : name,
  nameLocation: 'middle',
  nameGap,
  nameRotate: 90,
  nameTextStyle: {
    ...TREND_AXIS_LABEL_STYLE,
    fontSize: 12,
  },
  axisLabel: {
    ...TREND_AXIS_LABEL_STYLE,
    margin: 8,
  },
  axisLine: {
    show: false,
  },
  axisTick: {
    show: false,
  },
  splitLine: {
    show: !isPreview,
    lineStyle: {
      color: COLOR_GRAY_80,
      width: 1,
    },
  },
});

export const buildTrendChartLineSeries = ({ id, data }) => {
  const singlePoint = data.length === 1;

  return {
    id,
    name: id,
    type: 'line',
    data,
    showSymbol: singlePoint,
    symbolSize: singlePoint ? 10 : 2,
    lineStyle: {
      width: 1,
    },
    emphasis: {
      scale: true,
      itemStyle: {
        borderWidth: 2,
      },
    },
    triggerLineEvent: true,
  };
};

export const buildTrendChartTooltip = ({
  isPreview,
  TooltipComponent,
  calculateTooltipParams,
  itemsData,
  formatMessage,
}) => ({
  trigger: 'axis',
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
    textStyle: TREND_AXIS_LABEL_STYLE,
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
    series: [buildTrendChartLineSeries({ id: seriesId, data: values })],
    customData: {
      itemsData,
      colors: {
        [seriesId]: color,
      },
      legendItems: [seriesId],
    },
  };
};
