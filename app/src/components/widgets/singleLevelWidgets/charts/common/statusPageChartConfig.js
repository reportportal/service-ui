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

import * as COLORS from 'common/constants/colors';
import { defineMessages } from 'react-intl';
import { PERIOD_VALUES_LENGTH, PERIOD_VALUES } from 'common/constants/statusPeriodValues';
import { buildTooltipFormatter } from 'components/widgets/common/echarts/configHelpers';
import { messages } from 'components/widgets/common/messages';
import { IssueTypeStatTooltip } from './issueTypeStatTooltip';
import {
  AXIS_LABEL_STYLE,
  STACKED_BAR_EMPHASIS,
  createStackedBarSeries,
} from './stackedBarSeries';
import {
  buildCategoryXAxis,
  buildItemTooltip,
  buildValueYAxis,
} from './echartsAxisBuilders';

const localMessages = defineMessages({
  xAxisWeeksTitle: {
    id: 'Chart.xAxisWeeksTitle',
    defaultMessage: 't, weeks',
  },
  xAxisDaysTitle: {
    id: 'Chart.xAxisDaysTitle',
    defaultMessage: 't, days',
  },
});

const getCategories = (itemData, interval) => {
  const ticksToShowPeriod = Math.floor(PERIOD_VALUES_LENGTH[interval] / 4);

  return itemData.reduce((acc, el, index) => {
    if (!((index - 1) % ticksToShowPeriod)) {
      return [...acc, (index + 1).toString()];
    }
    return [...acc, ''];
  }, []);
};

const getYTicksValues = (columns) => {
  const allValues = columns.reduce((acc, column) => {
    const valuesList = column.slice(1);

    return [...acc, ...valuesList.map((value) => +value)];
  }, []);

  const max = allValues.sort((a, b) => b - a)[0] || 1;
  const numberOfLines = max > 10 ? 10 : Math.ceil(max);
  const lineStep = Math.ceil(max / numberOfLines);
  const tickValues = [];

  for (let i = 0; i <= max; i += lineStep) {
    tickValues.push(i);
  }

  const lastTick = tickValues[tickValues.length - 1];
  if (lastTick < max) {
    tickValues.push(lastTick + lineStep);
  }

  return tickValues;
};

const getItemCases = (value, integerValueType, casesText) => {
  if (integerValueType) {
    return value;
  }

  return casesText ? `${value} ${casesText}` : `${Number(value).toFixed(2)}%`;
};

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage, integerValueType, casesText, wrapperClassName } = customProps;
  const { index, id, value } = Array.isArray(data) ? data[0] : data;
  const item = itemsData[index];

  return {
    itemName: item.date || item,
    startTime: null,
    itemCases: getItemCases(value, integerValueType, casesText),
    color: color(id),
    issueStatNameProps: { itemName: messages[id] ? formatMessage(messages[id]) : id },
    wrapperClassName,
  };
};

/**
 * ECharts option builder for status-page usages of investigatedTrendChart.
 */
export const getOption = ({
  content,
  formatMessage,
  interval,
  chartType = 'bar',
  isPointsShow = true,
  isCustomTooltip = false,
  integerValueType = false,
  wrapperClassName,
  isPreview = false,
}) => {
  const chartData = {};
  const colors = {};
  const itemsData = [];

  const data = content.map((value) => ({
    date: value.name,
    values: value.values,
  }));

  Object.keys(data[0].values).forEach((key) => {
    const shortKey = key.split('$').pop();

    colors[shortKey] = COLORS[`COLOR_${shortKey.toUpperCase()}`];
    chartData[shortKey] = [shortKey];
  });

  data.forEach((item) => {
    itemsData.push(item.date);

    Object.keys(item.values).forEach((key) => {
      const shortKey = key.split('$').pop();

      chartData[shortKey].push(Number.parseFloat(item.values[key]));
    });
  });

  const itemNames = Object.keys(chartData);
  const columns = Object.values(chartData);
  const yTicksValues = integerValueType ? getYTicksValues(columns) : null;
  const isBar = chartType === 'bar';
  const dataByName = itemNames.reduce((acc, name) => {
    acc[name] = chartData[name].slice(1);
    return acc;
  }, {});
  const series = isBar
    ? createStackedBarSeries(itemNames, dataByName, colors)
    : itemNames.map((name) => ({
        id: name,
        name,
        type: 'line',
        stack: 'total',
        data: dataByName[name],
        showSymbol: isPointsShow,
        symbolSize: 6,
        areaStyle: {
          opacity: 0.7,
        },
        lineStyle: {
          width: 1,
        },
        itemStyle: {
          color: colors[name],
        },
        emphasis: STACKED_BAR_EMPHASIS,
      }));

  const yInterval =
    integerValueType && yTicksValues?.length > 1 ? yTicksValues[1] - yTicksValues[0] : 10;

  let xAxisName;
  if (!isPreview) {
    xAxisName =
      interval === PERIOD_VALUES.ONE_MONTH
        ? formatMessage(localMessages.xAxisDaysTitle)
        : formatMessage(localMessages.xAxisWeeksTitle);
  }

  return {
    color: itemNames.map((name) => colors[name]),
    textStyle: AXIS_LABEL_STYLE,
    grid: {
      top: 0,
      left: 35,
      right: 10,
      bottom: 0,
      containLabel: true,
    },
    xAxis: buildCategoryXAxis({
      show: !isPreview,
      data: getCategories(itemsData, interval),
      boundaryGap: isBar,
      name: xAxisName,
    }),
    yAxis: buildValueYAxis({
      show: !isPreview,
      max: integerValueType ? yTicksValues?.[yTicksValues.length - 1] : 100,
      interval: integerValueType ? yInterval : 10,
      axisLabel: {
        formatter: (value) => (integerValueType ? value : `${value}%`),
      },
    }),
    tooltip: buildItemTooltip({
      show: !isPreview && !isCustomTooltip,
      formatter: buildTooltipFormatter(IssueTypeStatTooltip, calculateTooltipParams, {
        itemsData,
        formatMessage,
        integerValueType,
        wrapperClassName,
      }),
    }),
    legend: {
      show: false,
    },
    series,
    customData: {
      itemsData,
      colors,
      legendItems: itemNames,
    },
  };
};
