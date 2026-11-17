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

import { buildTooltipFormatter } from 'components/widgets/common/echarts/configHelpers';
import { CHART_FONT_FAMILY } from 'components/widgets/common/constants';
import {
  COLOR_ALMOST_BLACK,
  COLOR_CHART_AXIS_LINE,
  COLOR_WHITE_TWO,
} from 'common/constants/colors';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { buildItemTooltip } from '../../common/echartsAxisBuilders';
import { createBarSeries } from '../../common/stackedBarSeries';
import { calculateTooltipParams, localMessages } from './utils';

const AXIS_LABEL_STYLE = {
  fontFamily: CHART_FONT_FAMILY,
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 16,
  color: COLOR_ALMOST_BLACK,
};
const COLOR_AXIS_TITLE = '#8d95a1'; // --rp-ui-base-e-400
const AXIS_TITLE_STYLE = {
  fontFamily: CHART_FONT_FAMILY,
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: 12,
  lineHeight: 16,
  color: COLOR_AXIS_TITLE,
};

const BAR_SEGMENT_STYLE = { borderColor: COLOR_WHITE_TWO, borderWidth: 1 };
const BAR_SEGMENT_STYLE_PREVIEW = { ...BAR_SEGMENT_STYLE, borderWidth: 0.5 };
const BAR_TOP_RADIUS = [3, 3, 0, 0];
const BAR_TOP_RADIUS_PREVIEW = [2, 2, 0, 0];

const TOOLTIP_SHELL = {
  backgroundColor: 'transparent',
  borderWidth: 0,
  extraCssText: 'box-shadow: none; padding: 0;',
};

const withTopRounding = (itemNames, dataByName, isPreview, hiddenItems = []) => {
  const visibleNames = itemNames.filter((name) => !hiddenItems.includes(name));
  const count = itemNames.length ? dataByName[itemNames[0]].length : 0;
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
        if (!value) return null;
        return topSeriesByIndex[index] === name
          ? {
              value,
              itemStyle: { borderRadius: isPreview ? BAR_TOP_RADIUS_PREVIEW : BAR_TOP_RADIUS },
            }
          : value;
      }),
    ]),
  );
};

const buildBarSeries = ({ itemNames, dataByName, colors, isPreview, hiddenItems }) =>
  createBarSeries(
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
    emphasis: isPreview
      ? { disabled: true }
      : { focus: 'none', scale: false, itemStyle: { opacity: 0.75 } },
  }));

export const getBarSeriesData = ({ itemNames, dataByName, isPreview, hiddenItems }) => {
  const barData = withTopRounding(itemNames, dataByName, isPreview, hiddenItems);

  return itemNames.map((name) => ({ id: name, data: barData[name] }));
};

export const buildInvestigatedChartOption = ({
  isPreview,
  categories,
  tickValues,
  itemNames,
  dataByName,
  colors,
  itemsData,
  formatMessage,
  hiddenItems = [],
  gridRight = 20,
  tooltipExtra = {},
}) => ({
  color: itemNames.map((name) => colors[name]),
  textStyle: AXIS_LABEL_STYLE,
  grid: {
    top: isPreview ? 0 : 85,
    left: isPreview ? 0 : 60,
    right: isPreview ? 0 : gridRight,
    bottom: isPreview ? 0 : 40,
    containLabel: false,
  },
  xAxis: {
    type: 'category',
    show: !isPreview,
    data: categories,
    boundaryGap: true,
    axisLine: { show: true, lineStyle: { color: COLOR_CHART_AXIS_LINE, width: 1 } },
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
    show: !isPreview,
    min: 0,
    max: 100,
    interval: 10,
    ...(isPreview
      ? {}
      : {
          name: formatMessage(localMessages.yAxisInvestigationsTitle),
          nameLocation: 'middle',
          nameGap: 47,
          nameRotate: 90,
          nameTextStyle: AXIS_TITLE_STYLE,
        }),
    axisLabel: { ...AXIS_LABEL_STYLE, margin: 8 },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { show: !isPreview, lineStyle: { color: COLOR_CHART_AXIS_LINE, width: 1 } },
  },
  tooltip: {
    ...buildItemTooltip({
      show: !isPreview,
      formatter: buildTooltipFormatter(IssueTypeStatTooltip, calculateTooltipParams, {
        itemsData,
        formatMessage,
        ...tooltipExtra,
      }),
    }),
    ...TOOLTIP_SHELL,
  },
  legend: {
    show: false,
  },
  series: buildBarSeries({ itemNames, dataByName, colors, isPreview, hiddenItems }),
  customData: {
    itemsData,
    colors,
    legendItems: itemNames,
  },
});
