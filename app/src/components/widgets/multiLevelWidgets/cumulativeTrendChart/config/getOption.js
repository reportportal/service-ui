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
export const BAR_WIDTH = '18%';
export const BAR_WIDTH_WITH_TOTAL = '14%';
export const BAR_WIDTH_SEPARATE = '5%';
const BAR_MAX_WIDTH = 90;
const BAR_MAX_WIDTH_SEPARATE = 36;
const TOTAL_LINE_WIDTH = 2;
const TOTAL_LINE_GAP = 6;
// ECharts' own default gap between bar groups in a category, as a fraction
// of the bar width (`defaultBarGap` on bar series).
const DEFAULT_BAR_GAP_RATIO = 0.1;

// Mirrors ECharts' own bar layout math. Can't use `api.barLayout` here: it
// doesn't resolve percentage `barWidth` values, so it returns NaN offsets.
export const getBarsLeftOffset = ({ bandWidth, groupCount, barWidthPercent, barMaxWidth }) => {
  if (!groupCount) {
    return 0;
  }
  const width = Math.min((Number.parseFloat(barWidthPercent) / 100) * bandWidth, barMaxWidth);
  const totalWidth = groupCount * width + (groupCount - 1) * width * DEFAULT_BAR_GAP_RATIO;
  return -totalWidth / 2;
};

const getSeriesLabel = (field, formatMessage) =>
  messages[field] ? formatMessage(messages[field]) : field;

// ECharts' own `params.marker` is always a circle; build a square one instead.
const buildSquareMarker = (color) =>
  `<span style="display:inline-block;margin-right:6px;width:10px;height:10px;background-color:${color};"></span>`;

const buildTooltipFormatter =
  ({
    categories,
    tooltipContents,
    scaleName,
    valuesByField,
    percentage,
    formatMessage,
    separate,
    executionFields,
    defectFields,
  }) =>
  (params) => {
    const item = Array.isArray(params) ? params[0] : params;
    const index = item?.dataIndex ?? 0;
    const hoveredField = item?.seriesId;
    const isTotal = hoveredField === TOTAL_FIELD;

    let fieldsToShow;
    if (isTotal) {
      fieldsToShow = [TOTAL_FIELD];
    } else if (separate) {
      fieldsToShow = [hoveredField];
    } else {
      fieldsToShow = defectFields.includes(hoveredField) ? defectFields : executionFields;
    }

    const rows = fieldsToShow
      .map((field) => {
        const isFieldTotal = field === TOTAL_FIELD;
        const rawValue = valuesByField[field]?.[index];
        if (!rawValue) {
          return '';
        }
        const label = getSeriesLabel(field, formatMessage);
        // The total is always 100% of itself, and keeps its absolute count
        // even in percentage mode, since "100%" alone wouldn't say much.
        const percentValue = isFieldTotal
          ? 100
          : getPercentageValue(rawValue, valuesByField, field, index);
        const text =
          percentage && !isFieldTotal
            ? `${label}: ${percentValue}%`
            : `${label}: ${rawValue} (${percentValue}%)`;
        // Only the hovered field's color comes from ECharts; every other row
        // needs its color looked up the same way the series was colored.
        const color = field === hoveredField ? item.color : getColorForKey(field);

        return `<div${isFieldTotal ? ' style="font-weight: 600;"' : ''}>${buildSquareMarker(
          color,
        )}${text}</div>`;
      })
      .join('');

    return `<div style="font-weight: 600;">${scaleName}: ${categories[index]}</div>${
      tooltipContents[index] ? `<div>${tooltipContents[index]}</div>` : ''
    }${rows}`;
  };

const buildTotalSeries = ({ visibleFields, defectFields, separate, isPreview, absTotals, data }) => {
  const groupCount = separate
    ? visibleFields.length
    : new Set(
        visibleFields.map((field) => (defectFields.includes(field) ? STACK_DEFECTS : STACK_EXECUTIONS)),
      ).size;
  const barWidthPercent = separate ? BAR_WIDTH_SEPARATE : BAR_WIDTH_WITH_TOTAL;
  const barMaxWidth = separate ? BAR_MAX_WIDTH_SEPARATE : BAR_MAX_WIDTH;

  return {
    id: TOTAL_FIELD,
    name: TOTAL_FIELD,
    // `custom`, not `bar`: a `bar` series shares one layout calculation
    // with every other bar in the category, so giving it its own `barGap`
    // would also shift the real bars. `custom` draws exactly what
    // `renderItem` returns and never joins that calculation.
    type: 'custom',
    coordinateSystem: 'cartesian2d',
    silent: isPreview,
    itemStyle: { color: COLOR_BLACK },
    renderItem: (params, api) => {
      const categoryIndex = api.value(0);
      const start = api.coord([categoryIndex, 0]);
      const end = api.coord([categoryIndex, api.value(1)]);
      const leftOffset = getBarsLeftOffset({
        bandWidth: api.size([1, 0])[0],
        groupCount,
        barWidthPercent,
        barMaxWidth,
      });
      const x = start[0] + leftOffset - TOTAL_LINE_GAP;
      const line = {
        type: 'line',
        shape: { x1: x, y1: start[1], x2: x, y2: end[1] },
        style: { stroke: COLOR_BLACK, lineWidth: TOTAL_LINE_WIDTH },
      };
      const label = {
        type: 'text',
        x,
        y: end[1] - 2,
        style: {
          text: String(absTotals[categoryIndex]),
          fill: COLOR_BLACK,
          fontFamily: 'OpenSans',
          fontSize: 12,
          align: 'center',
          verticalAlign: 'bottom',
        },
      };

      return { type: 'group', children: isPreview ? [line] : [line, label] };
    },
    data: data.map((value, index) => [index, value]),
  };
};

const getBarWidth = (separate, showTotal) => {
  if (separate) {
    return BAR_WIDTH_SEPARATE;
  }
  return showTotal ? BAR_WIDTH_WITH_TOTAL : BAR_WIDTH;
};

const buildBarSeries = ({ field, isDefect, data, separate, showTotal, focusDefectTypes }) => {
  let stack;
  if (!separate) {
    stack = isDefect ? STACK_DEFECTS : STACK_EXECUTIONS;
  }

  return {
    id: field,
    name: field,
    type: 'bar',
    data,
    stack,
    barWidth: getBarWidth(separate, showTotal),
    barMaxWidth: separate ? BAR_MAX_WIDTH_SEPARATE : BAR_MAX_WIDTH,
    barCategoryGap: '35%',
    itemStyle: {
      color: getColorForKey(field),
      opacity: isDefect && !focusDefectTypes ? 0.3 : 1,
    },
    emphasis: {
      focus: 'none',
    },
  };
};

const buildYAxis = ({ percentage, isPreview, formatMessage }) => {
  const common = {
    type: 'value',
    show: !isPreview,
    min: 0,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { show: !isPreview, lineStyle: { color: COLOR_GRAY_80, width: 1 } },
  };

  if (!percentage) {
    return {
      ...common,
      interval: 2,
      axisLabel: { ...AXIS_LABEL_STYLE, fontSize: 12, margin: 4 },
    };
  }

  return {
    ...common,
    max: 100,
    interval: 10,
    name: isPreview ? undefined : `% ${formatMessage(messages.ofTestCases)}`,
    nameLocation: 'middle',
    nameGap: 32,
    nameRotate: 90,
    nameTextStyle: { ...AXIS_LABEL_STYLE, fontSize: 12 },
    axisLabel: { ...AXIS_LABEL_STYLE, fontSize: 12, margin: 4, formatter: '{value}%' },
  };
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

  const visibleFields = plottedFields.filter((field) => !uncheckedLegendItems.includes(field));
  const series = [
    ...(showTotal
      ? [
          buildTotalSeries({
            visibleFields,
            defectFields,
            separate,
            isPreview,
            absTotals,
            data: displayValuesByField[TOTAL_FIELD],
          }),
        ]
      : []),
    ...visibleFields.map((field) =>
      buildBarSeries({
        field,
        isDefect: defectFields.includes(field),
        data: displayValuesByField[field],
        separate,
        showTotal,
        focusDefectTypes,
      }),
    ),
  ];

  const yAxis = buildYAxis({ percentage, isPreview, formatMessage });
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
      // `item`, not `axis`: with two stacks sitting next to each other in
      // the same category, an axis trigger would report both together. The
      // formatter expands the hovered field out to its own stack instead.
      trigger: 'item',
      show: !isPreview,
      axisPointer: { show: false },
      extraCssText: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); padding: 6px 6px;',
      formatter: buildTooltipFormatter({
        categories,
        tooltipContents,
        scaleName,
        valuesByField,
        percentage,
        formatMessage,
        separate,
        executionFields,
        defectFields,
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
