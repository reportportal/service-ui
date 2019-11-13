/*
 * Copyright 2019 EPAM Systems
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
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { messages } from 'components/widgets/common/messages';
import { IssueTypeStatTooltip } from './issueTypeStatTooltip';

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

export const getConfig = ({
  content,
  formatMessage,
  positionCallback,
  size,
  interval,
  chartType = 'bar',
  isPointsShow = true,
  isCustomTooltip,
  integerValueType,
  wrapperClassName,
}) => {
  const chartData = {};
  const colors = {};
  const itemsData = [];

  const data = content.map((value) => ({
    date: value.name,
    values: value.values,
  }));

  // prepare columns array and fill it with field names
  Object.keys(data[0].values).forEach((key) => {
    const shortKey = key.split('$').pop();

    colors[shortKey] = COLORS[`COLOR_${shortKey.toUpperCase()}`];
    chartData[shortKey] = [shortKey];
  });

  // fill columns arrays with values
  data.forEach((item) => {
    itemsData.push(item.date);

    Object.keys(item.values).forEach((key) => {
      const splitted = key.split('$');
      const shortKey = splitted[splitted.length - 1];

      chartData[shortKey].push(item.values[key]);
    });
  });

  const itemNames = Object.keys(chartData);
  const columns = Object.values(chartData);
  const formatYAxisText = (value) => (integerValueType ? value : `${value}%`);
  const yTicksValues = integerValueType ? getYTicksValues(columns) : null;

  return {
    customData: {
      itemsData,
      colors,
    },
    data: {
      columns,
      type: chartType,
      order: null,
      groups: [itemNames],
      colors,
    },
    grid: {
      y: {
        show: true,
      },
    },
    axis: {
      x: {
        show: true,
        type: 'category',
        categories: getCategories(itemsData, interval),
        tick: {
          width: 60,
          centered: true,
          inner: true,
          multiline: true,
          outer: false,
        },
        label: {
          text:
            interval === PERIOD_VALUES.ONE_MONTH
              ? formatMessage(localMessages.xAxisDaysTitle)
              : formatMessage(localMessages.xAxisWeeksTitle),
          position: 'outer-center',
        },
      },
      y: {
        show: true,
        max: integerValueType ? null : 100,
        padding: {
          top: 0,
        },
        tick: {
          format: formatYAxisText,
          values: integerValueType ? yTicksValues : null,
        },
      },
    },
    interaction: {
      enabled: true,
    },
    padding: {
      top: 0,
      left: 35,
      right: 10,
      bottom: 0,
    },
    legend: {
      show: false,
    },
    tooltip: {
      show: !isCustomTooltip,
      grouped: false,
      position: positionCallback,
      contents: createTooltipRenderer(IssueTypeStatTooltip, calculateTooltipParams, {
        itemsData,
        formatMessage,
        integerValueType,
        wrapperClassName,
      }),
    },
    size,
    point: {
      show: isPointsShow,
    },
  };
};
