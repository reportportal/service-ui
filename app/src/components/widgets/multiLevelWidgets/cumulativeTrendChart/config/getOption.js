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

import {
  COLOR_ALMOST_BLACK,
  COLOR_CHART_AXIS_LINE,
  COLOR_CHART_AXIS_TITLE,
  COLOR_WHITE_TWO,
} from 'common/constants/colors';
import { escapeHtml } from 'common/utils/escapeHtml';
import { sanitizeUserHtml } from 'common/utils/sanitizeUserHtml';
import { buildAxisTicks } from 'components/widgets/common/echarts/configHelpers';
import { CHART_FONT_FAMILY } from 'components/widgets/common/constants';
import { getChartColor } from 'components/widgets/common/chartColors';
import { messages } from '../messages';
import {
  TOTAL_FIELD,
  EXECUTION_FIELDS,
  getDefectFields,
  getScaleName,
  getPercentageValue,
  convertToPercentages,
} from './utils';

const AXIS_LABEL_STYLE = {
  fontFamily: CHART_FONT_FAMILY,
  fontSize: 12,
  fontWeight: 400,
  lineHeight: 16,
  color: COLOR_ALMOST_BLACK,
};

const STACK_EXECUTIONS = 'executions';
const STACK_DEFECTS = 'defects';
export const BAR_WIDTH = '18%';
export const BAR_WIDTH_SEPARATE = '5%';
const BAR_MAX_WIDTH = 90;
const BAR_MAX_WIDTH_SEPARATE = 36;
export const TOTAL_LINE_COLOR = COLOR_ALMOST_BLACK;
const TOTAL_LINE_WIDTH = 2;
const TOTAL_LINE_GAP = 6;
const TOTAL_LABEL_GAP = 4;
const TOTAL_LINE_HIT_WIDTH = 10;
const TOTAL_LABEL_STYLE = {
  fontFamily: CHART_FONT_FAMILY,
  fontSize: 12,
  fontWeight: 400,
  lineHeight: 16,
  fill: COLOR_ALMOST_BLACK,
};
const BAR_SEGMENT_STYLE = { borderColor: COLOR_WHITE_TWO, borderWidth: 1 };
const BAR_SEGMENT_STYLE_PREVIEW = { ...BAR_SEGMENT_STYLE, borderWidth: 0.5 };
// the border is centred on the edge and eats into the corner: radius 3 looks like 2px
export const BAR_TOP_RADIUS = [3, 3, 0, 0];
const BAR_TOP_RADIUS_PREVIEW = [2, 2, 0, 0];
const BAR_HOVER_OPACITY = 0.75;
const MUTED_DEFECTS_OPACITY = 0.3;
const TOOLTIP_MARKER_SIZE = 8;
const TOOLTIP_ROW_GAP = 4;
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

const buildMarker = (color) =>
  `<span style="display:inline-block;flex:none;margin-right:6px;width:${TOOLTIP_MARKER_SIZE}px;height:${TOOLTIP_MARKER_SIZE}px;border-radius:50%;background-color:${color};"></span>`;

const buildTooltipRow = (color, label, value) =>
  `<div style="display:flex;align-items:center;margin-top:${TOOLTIP_ROW_GAP}px;">${buildMarker(
    color,
  )}<span>${label}:&nbsp;</span><span style="font-weight:700;">${value}</span></div>`;

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
    visibleFields,
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
      // top-down, as drawn
      fieldsToShow = (defectFields.includes(hoveredField) ? defectFields : executionFields)
        .filter((field) => visibleFields.includes(field))
        .reverse();
    }

    const rows = fieldsToShow
      .map((field) => {
        const isFieldTotal = field === TOTAL_FIELD;
        const rawValue = valuesByField[field]?.[index];
        if (!rawValue) {
          return '';
        }
        const label = escapeHtml(getSeriesLabel(field, formatMessage));
        // The total is always 100% of itself, and keeps its absolute count
        // even in percentage mode, since "100%" alone wouldn't say much.
        const percentValue = isFieldTotal
          ? 100
          : getPercentageValue(rawValue, valuesByField, field, index);
        const value =
          percentage && !isFieldTotal ? `${percentValue}%` : `${rawValue} (${percentValue}%)`;
        // the dark line color is invisible on the dark tooltip
        const color = isFieldTotal ? COLOR_WHITE_TWO : getChartColor(field);

        return buildTooltipRow(color, label, value);
      })
      .join('');

    // rendered as HTML: attribute keys and values are user data
    const extraContent = tooltipContents[index] ? sanitizeUserHtml(tooltipContents[index]) : '';
    return `<div>${escapeHtml(scaleName)}: ${escapeHtml(categories[index])}</div>${
      extraContent ? `<div>${extraContent}</div>` : ''
    }${rows}`;
  };

const getStackKey = (field, defectFields, separate) => {
  if (separate) {
    return field;
  }
  return defectFields.includes(field) ? STACK_DEFECTS : STACK_EXECUTIONS;
};

// ids without a series (hidden in the legend, or not plotted) are ignored by ECharts
export const getStackSeriesIds = (field, defectFields, separate) => {
  const stackKey = getStackKey(field, defectFields, separate);
  return [...EXECUTION_FIELDS, ...defectFields].filter(
    (item) => getStackKey(item, defectFields, separate) === stackKey,
  );
};

// In percentage mode the line has no count: above a 0–100% scale it would read as a percentage.
const buildTotalSeries = ({
  visibleFields,
  defectFields,
  separate,
  percentage,
  isPreview,
  absTotals,
  data,
}) => {
  const groupCount = new Set(
    visibleFields.map((field) => getStackKey(field, defectFields, separate)),
  ).size;
  const barWidthPercent = separate ? BAR_WIDTH_SEPARATE : BAR_WIDTH;
  const barMaxWidth = separate ? BAR_MAX_WIDTH_SEPARATE : BAR_MAX_WIDTH;

  return {
    id: TOTAL_FIELD,
    name: TOTAL_FIELD,
    // `custom`, not `bar`: a `bar` series shares one layout calculation
    // with every other bar in the category, so it would shift the real bars.
    // `custom` draws exactly what `renderItem` returns and never joins that calculation.
    type: 'custom',
    coordinateSystem: 'cartesian2d',
    silent: isPreview,
    itemStyle: { color: TOTAL_LINE_COLOR },
    renderItem: (params, api) => {
      const categoryIndex = api.value(0);
      const total = api.value(1);
      if (!total || !groupCount) {
        return null;
      }
      const [centerX, bottom] = api.coord([categoryIndex, 0]);
      const [, top] = api.coord([categoryIndex, total]);
      const leftOffset = getBarsLeftOffset({
        bandWidth: api.size([1, 0])[0],
        groupCount,
        barWidthPercent,
        barMaxWidth,
      });
      // the bars' border is centred on their edge, so their colour starts half a border inside it
      const barBorderInset =
        (isPreview ? BAR_SEGMENT_STYLE_PREVIEW : BAR_SEGMENT_STYLE).borderWidth / 2;
      const visibleBarLeft = centerX + leftOffset + barBorderInset;
      const x = visibleBarLeft - TOTAL_LINE_GAP - TOTAL_LINE_WIDTH / 2;
      const line = {
        type: 'line',
        shape: { x1: x, y1: bottom, x2: x, y2: top },
        style: { stroke: TOTAL_LINE_COLOR, lineWidth: TOTAL_LINE_WIDTH },
      };
      if (isPreview) {
        return { type: 'group', children: [line] };
      }
      const hitArea = {
        type: 'rect',
        shape: {
          x: x - TOTAL_LINE_HIT_WIDTH / 2,
          y: top,
          width: TOTAL_LINE_HIT_WIDTH,
          height: bottom - top,
        },
        style: { fill: 'rgba(0, 0, 0, 0)' },
      };
      if (percentage) {
        return { type: 'group', children: [hitArea, line] };
      }
      const label = {
        type: 'text',
        x,
        y: top - TOTAL_LABEL_GAP,
        style: {
          ...TOTAL_LABEL_STYLE,
          text: String(absTotals[categoryIndex]),
          align: 'center',
          verticalAlign: 'bottom',
        },
      };

      return { type: 'group', children: [hitArea, line, label] };
    },
    data: data.map((value, index) => [index, value]),
  };
};

// Rounds the top of the topmost non-zero segment of every stack; zero points are not drawn.
export const withTopRounding = (fields, dataByField, defectFields, separate, isPreview) => {
  const count = fields.length ? dataByField[fields[0]].length : 0;
  const topFieldByStack = {};

  fields.forEach((field) => {
    const stackKey = getStackKey(field, defectFields, separate);
    topFieldByStack[stackKey] = topFieldByStack[stackKey] || Array(count).fill(null);
    dataByField[field].forEach((value, index) => {
      if (value > 0) {
        topFieldByStack[stackKey][index] = field;
      }
    });
  });

  return Object.fromEntries(
    fields.map((field) => {
      const topFields = topFieldByStack[getStackKey(field, defectFields, separate)];
      return [
        field,
        dataByField[field].map((value, index) => {
          if (!value) return null;
          return topFields[index] === field
            ? {
                value,
                itemStyle: {
                  borderRadius: isPreview ? BAR_TOP_RADIUS_PREVIEW : BAR_TOP_RADIUS,
                },
              }
            : value;
        }),
      ];
    }),
  );
};

const buildBarSeries = ({
  field,
  isDefect,
  defectFields,
  data,
  separate,
  focusDefectTypes,
  isPreview,
}) => {
  const stack = separate ? undefined : getStackKey(field, defectFields, separate);
  const opacity = isDefect && !focusDefectTypes ? MUTED_DEFECTS_OPACITY : 1;

  return {
    id: field,
    name: field,
    type: 'bar',
    data,
    stack,
    barWidth: separate ? BAR_WIDTH_SEPARATE : BAR_WIDTH,
    barMaxWidth: separate ? BAR_MAX_WIDTH_SEPARATE : BAR_MAX_WIDTH,
    barCategoryGap: '35%',
    silent: isPreview,
    itemStyle: {
      color: getChartColor(field),
      opacity,
      ...(isPreview ? BAR_SEGMENT_STYLE_PREVIEW : BAR_SEGMENT_STYLE),
    },
    // cumulativeTrendChart.jsx highlights the whole hovered stack
    emphasis: isPreview
      ? { disabled: true }
      : { focus: 'none', scale: false, itemStyle: { opacity: opacity * BAR_HOVER_OPACITY } },
  };
};

const buildYAxis = ({ percentage, isPreview, formatMessage }) => {
  const common = {
    type: 'value',
    show: !isPreview,
    min: 0,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { show: !isPreview, lineStyle: { color: COLOR_CHART_AXIS_LINE, width: 1 } },
  };

  if (!percentage) {
    return {
      ...common,
      minInterval: 1,
      axisLabel: { ...AXIS_LABEL_STYLE, margin: 8 },
    };
  }

  return {
    ...common,
    max: 100,
    interval: 10,
    name: isPreview ? undefined : `% ${formatMessage(messages.ofTestCases)}`,
    nameLocation: 'middle',
    nameGap: 44,
    nameRotate: 90,
    nameTextStyle: { ...AXIS_LABEL_STYLE, color: COLOR_CHART_AXIS_TITLE },
    axisLabel: { ...AXIS_LABEL_STYLE, margin: 8, formatter: '{value}%' },
  };
};

const getGridLeft = (percentage) => (percentage ? 64 : 48);

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(38, 38, 38, 0.92)', // fallback for the color-mix in extraCssText
  borderWidth: 0,
  padding: [8, 12],
  textStyle: {
    fontFamily: CHART_FONT_FAMILY,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 16,
    color: COLOR_WHITE_TWO,
  },
  extraCssText:
    'box-shadow: none; border-radius: 8px; ' +
    'background-color: color-mix(in srgb, var(--rp-ui-base-dark-e-400) 92%, transparent);',
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
  const valuesByField = {};

  [TOTAL_FIELD, ...plottedFields].forEach((field) => {
    valuesByField[field] = [];
  });

  content.forEach((item) => {
    categories.push(item.attributeValue);
    tooltipContents.push(item.content.tooltipContent);

    [TOTAL_FIELD, ...plottedFields].forEach((field) => {
      valuesByField[field].push(Number(item.content.statistics[field]) || 0);
    });
  });

  const displayValuesByField = percentage ? convertToPercentages(valuesByField) : valuesByField;
  const scaleName = getScaleName(attributes, activeAttribute);

  const colors = {};
  legendItems.forEach((field) => {
    colors[field] = getChartColor(field);
  });

  const visibleFields = plottedFields.filter((field) => !uncheckedLegendItems.includes(field));
  const barDataByField = withTopRounding(
    visibleFields,
    displayValuesByField,
    defectFields,
    separate,
    isPreview,
  );
  const series = [
    ...(showTotal
      ? [
          buildTotalSeries({
            visibleFields,
            defectFields,
            separate,
            percentage,
            isPreview,
            absTotals: valuesByField[TOTAL_FIELD],
            data: displayValuesByField[TOTAL_FIELD],
          }),
        ]
      : []),
    ...visibleFields.map((field) =>
      buildBarSeries({
        field,
        isDefect: defectFields.includes(field),
        defectFields,
        data: barDataByField[field],
        separate,
        focusDefectTypes,
        isPreview,
      }),
    ),
  ];

  const yAxis = buildYAxis({ percentage, isPreview, formatMessage });
  const tickValues = buildAxisTicks(categories.length);

  return {
    textStyle: AXIS_LABEL_STYLE,
    grid: {
      top: isPreview ? 0 : 24,
      left: isPreview ? 0 : getGridLeft(percentage),
      right: isPreview ? 0 : 20,
      bottom: isPreview ? 0 : 32,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      show: !isPreview,
      data: categories,
      boundaryGap: true,
      axisLine: {
        show: true,
        lineStyle: { color: COLOR_CHART_AXIS_LINE, width: 1 },
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
      ...TOOLTIP_STYLE,
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
        visibleFields,
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
