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
import { buildAxisTicks } from 'components/widgets/common/echarts/configHelpers';
import { messages } from '../messages';
import {
  TOTAL_FIELD,
  EXECUTION_FIELDS,
  getDefectFields,
  getColorForKey,
  firstCapital,
  getScaleName,
  getPercentageValue,
  convertToPercentages,
} from './utils';

const AXIS_LABEL_STYLE = {
  fontFamily: 'OpenSans',
  fontSize: 10,
  fontWeight: 400,
  color: COLOR_CHARCOAL_GREY,
};

const STACK_EXECUTIONS = 'executions';
const STACK_DEFECTS = 'defects';
// ~60% of what ECharts would auto-size the bar to with two stacks sharing a category.
export const BAR_WIDTH = '18%';

const getSeriesLabel = (field, formatMessage) =>
  messages[field] ? formatMessage(messages[field]) : field;

const buildTooltipFormatter =
  ({ categories, tooltipContents, scaleName, valuesByField, percentage, formatMessage }) =>
  (params) => {
    const items = Array.isArray(params) ? params : [params];
    const index = items[0]?.dataIndex ?? 0;
    const rows = items
      .filter((item) => item.seriesId !== TOTAL_FIELD)
      .map((item) => {
        const rawValue = valuesByField[item.seriesId]?.[index];
        if (!rawValue) {
          return '';
        }
        const label = getSeriesLabel(item.seriesId, formatMessage);
        const percentValue = getPercentageValue(rawValue, valuesByField, item.seriesId, index);

        return percentage
          ? `<div>${label}: ${percentValue}%</div>`
          : `<div>${label}: ${rawValue} (${percentValue}%)</div>`;
      })
      .join('');

    return `<div>${scaleName}: ${categories[index]}</div>${
      tooltipContents[index] ? `<div>${tooltipContents[index]}</div>` : ''
    }${rows}`;
  };

export const getOption = ({
  content,
  isPreview,
  formatMessage,
  contentFields,
  attributes = [],
  activeAttribute = null,
  userSettings = {},
  uncheckedLegendItems = [],
}) => {
  const {
    defectTypes: focusDefectTypes = false,
    showTotal = false,
    separate = false,
    percentage = false,
  } = userSettings;

  const defectFields = getDefectFields(contentFields);
  const executionFields = focusDefectTypes ? [] : EXECUTION_FIELDS;

  const plottedFields = [...executionFields, ...defectFields];
  const legendItems = focusDefectTypes ? defectFields : EXECUTION_FIELDS;

  const categories = [];
  const tooltipContents = [];
  const absTotals = [];
  const valuesByField = {};

  [TOTAL_FIELD, ...plottedFields].forEach((field) => {
    valuesByField[field] = [];
  });

  content.forEach((item) => {
    categories.push(item.attributeValue);
    tooltipContents.push(item.content.tooltipContent);
    absTotals.push(Number(item.content.statistics[TOTAL_FIELD]) || 0);

    [TOTAL_FIELD, ...plottedFields].forEach((field) => {
      valuesByField[field].push(Number(item.content.statistics[field]) || 0);
    });
  });

  const displayValuesByField = percentage ? convertToPercentages(valuesByField) : valuesByField;
  const scaleName = firstCapital(getScaleName(attributes, activeAttribute));

  const colors = {};
  legendItems.forEach((field) => {
    colors[field] = getColorForKey(field);
  });

  const series = [];

  if (showTotal) {
    series.push({
      id: TOTAL_FIELD,
      name: TOTAL_FIELD,
      type: 'bar',
      data: displayValuesByField[TOTAL_FIELD],
      barWidth: 0,
      silent: true,
      itemStyle: { color: 'transparent' },
      label: {
        show: !isPreview,
        position: 'top',
        color: COLOR_BLACK,
        fontFamily: 'OpenSans',
        fontSize: 12,
        formatter: (params) => absTotals[params.dataIndex],
      },
    });
  }

  plottedFields.forEach((field) => {
    if (uncheckedLegendItems.includes(field)) {
      return;
    }
    const isDefect = defectFields.includes(field);
    // Not "separate": every execution status stacks into one bar, every
    // defect field into a second bar next to it (two bars per category) —
    // matches the original Chart.js layout. "Separate" drops the stack so
    // each field draws its own individual bar instead.
    let stack;
    if (!separate) {
      stack = isDefect ? STACK_DEFECTS : STACK_EXECUTIONS;
    }

    series.push({
      id: field,
      name: field,
      type: 'bar',
      data: displayValuesByField[field],
      stack,
      barWidth: BAR_WIDTH,
      barCategoryGap: '35%',
      itemStyle: {
        color: getColorForKey(field),
        opacity: isDefect && !focusDefectTypes ? 0.3 : 1,
      },
      emphasis: {
        focus: 'series',
      },
    });
  });

  const yAxis = percentage
    ? {
        type: 'value',
        show: !isPreview,
        min: 0,
        max: 100,
        interval: 10,
        name: isPreview ? undefined : `% ${formatMessage(messages.ofTestCases)}`,
        nameLocation: 'middle',
        nameGap: 32,
        nameRotate: 90,
        nameTextStyle: { ...AXIS_LABEL_STYLE, fontSize: 12 },
        axisLabel: { ...AXIS_LABEL_STYLE, fontSize: 12, margin: 4 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: !isPreview, lineStyle: { color: COLOR_GRAY_80, width: 1 } },
      }
    : {
        type: 'value',
        show: !isPreview,
        min: 0,
        axisLabel: { ...AXIS_LABEL_STYLE, fontSize: 12, margin: 4 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: !isPreview, lineStyle: { color: COLOR_GRAY_80, width: 1 } },
      };

  const tickValues = buildAxisTicks(categories.length);

  return {
    textStyle: AXIS_LABEL_STYLE,
    grid: {
      top: isPreview ? 0 : 40,
      left: isPreview ? 0 : 24,
      right: isPreview ? 0 : 20,
      bottom: isPreview ? 0 : 40,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      show: !isPreview,
      data: categories,
      boundaryGap: true,
      name: isPreview ? undefined : scaleName,
      nameLocation: 'middle',
      nameGap: 26,
      nameTextStyle: { ...AXIS_LABEL_STYLE, fontSize: 14 },
      axisLine: {
        show: true,
        lineStyle: { color: COLOR_GRAY_80, width: 1 },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        ...AXIS_LABEL_STYLE,
        margin: 8,
        interval: (index) => tickValues.includes(index),
        hideOverlap: true,
      },
    },
    yAxis,
    tooltip: {
      trigger: 'axis',
      show: !isPreview,
      formatter: buildTooltipFormatter({
        categories,
        tooltipContents,
        scaleName,
        valuesByField,
        percentage,
        formatMessage,
      }),
    },
    legend: {
      show: false,
    },
    series,
    customData: {
      itemsData: content,
      colors,
      legendItems,
    },
  };
};
