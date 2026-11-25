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
  COLOR_BLACK,
  COLOR_CHART_DURATION,
  COLOR_GRAY_80,
  COLOR_CHART_AXIS_LINE,
} from 'common/constants/colors';
import { getNiceTickStep, transformCategoryLabelByDefault } from 'components/widgets/common/utils';
import { buildTooltipFormatter } from 'components/widgets/common/echarts/configHelpers';
import { messages } from 'components/widgets/common/messages';
import { DURATION } from 'components/widgets/common/constants';
import { STOPPED } from 'common/constants/testStatuses';
import { AXIS_LABEL_STYLE, STACKED_BAR_EMPHASIS } from '../../common/stackedBarSeries';
import { buildItemTooltip } from '../../common/echartsAxisBuilders';
import { isValueInterrupted, prepareChartData, calculateTooltipParams } from './utils';
import { LaunchesDurationTooltip } from './launchesDurationTooltip';

const DISPLAY_TICK_STEP = 0.5;
const VALUE_AXIS_TICKS_COUNT = 10;
// Gridlines are spaced twice as far apart as the default step
const VALUE_AXIS_STEP_MULTIPLIER = 2;
// The dark tooltip look lives in the widget scss (`tooltip` class on the wrapper)
const TOOLTIP_SHELL = {
  backgroundColor: 'transparent',
  borderWidth: 0,
  extraCssText: 'box-shadow: none; padding: 0; max-width: min(300px, 100%);',
  confine: true,
};
const COLOR_INTERRUPTED_BAR = '#fdc63a';
const COLOR_STOPPED_BAR = '#a2aab5';
const COLOR_AXIS_TITLE = '#8d95a1';
// DS 6 axis tick labels: Roboto 400, 12px / 16px, #3F3F3F
const TICK_LABEL_STYLE = {
  fontFamily: 'Roboto',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: 12,
  lineHeight: 16,
  color: '#3f3f3f',
};
// The chart canvas already sits 24px from the widget's left/bottom border (widget padding),
// so the y labels block starts at the canvas edge and the x title sits on the canvas bottom.
const Y_LABEL_WIDTH = 36;
const Y_LABEL_HEIGHT = 16;
const Y_LABEL_MARGIN = 8;
const GRID_LEFT = Y_LABEL_WIDTH + Y_LABEL_MARGIN;
const GRID_RIGHT = 20;

// ECharts clamps a native axis name ~5px above the canvas bottom whatever `nameGap` is,
// so the unit title (seconds / minutes / hours) is drawn as a graphic pinned to the bottom,
// centered over the plot area (not the whole canvas).
const AXIS_TITLE_PLOT_OFFSET = (GRID_LEFT - GRID_RIGHT) / 2;
const AXIS_TITLE_BOX_HALF_WIDTH = 100;
const buildAxisTitle = (text) => ({
  type: 'group',
  left: 'center',
  bottom: 0,
  silent: true,
  children: [
    // invisible rect shifts the group's bounding box so the text lands at the plot center
    {
      type: 'rect',
      shape: {
        x: -AXIS_TITLE_BOX_HALF_WIDTH - AXIS_TITLE_PLOT_OFFSET,
        y: 0,
        width: AXIS_TITLE_BOX_HALF_WIDTH * 2,
        height: 1,
      },
      style: { fill: 'transparent' },
    },
    {
      type: 'text',
      x: 0,
      y: 0,
      style: {
        text,
        font: '400 12px Roboto',
        fill: COLOR_AXIS_TITLE,
        textAlign: 'center',
        textVerticalAlign: 'bottom',
      },
    },
  ],
});
const getBarColor = (item) => {
  if (isValueInterrupted(item)) {
    return COLOR_INTERRUPTED_BAR;
  }

  return item.status === STOPPED ? COLOR_STOPPED_BAR : COLOR_CHART_DURATION;
};

const BAR_END_RADIUS = [0, 3, 3, 0];
const BAR_END_RADIUS_PREVIEW = [0, 2, 2, 0];

const formatDurationTick = (value, timeTypeValue) =>
  (Number(value) / timeTypeValue).toFixed(2);

export const getOption = ({ content, isPreview, formatMessage }) => {
  const { timeType, chartData, itemsData = [] } = prepareChartData(content || []);
  const values = chartData.slice(1).map(Number);
  const categories = itemsData.map(transformCategoryLabelByDefault);
  // DS 6: a label (and tick) on every second launch, starting from the first.
  const isLabelledIndex = (index) => index % 2 === 0;
  const maxValue = Math.max(0, ...values.filter(Number.isFinite));
  const valueAxisInterval =
    maxValue > 0
      ? getNiceTickStep(maxValue, VALUE_AXIS_TICKS_COUNT) * VALUE_AXIS_STEP_MULTIPLIER
      : timeType.value * DISPLAY_TICK_STEP;

  const isMaxOnTick = maxValue % valueAxisInterval === 0;

  const seriesData = values.map((value, index) => ({
    value,
    itemStyle: {
      color: getBarColor(itemsData[index]),
    },
  }));

  return {
    textStyle: AXIS_LABEL_STYLE,
    graphic: isPreview ? [] : [buildAxisTitle(formatMessage(messages[timeType.type]))],
    grid: {
      top: isPreview ? 0 : 20,
      left: isPreview ? 0 : GRID_LEFT,
      right: isPreview ? 0 : GRID_RIGHT,
      bottom: isPreview ? 0 : 40,
      containLabel: false,
      // without this ECharts 6 shifts the grid to fit labels, overriding the exact offsets above
      outerBoundsMode: 'none',
    },
    xAxis: {
      type: 'value',
      show: !isPreview,
      min: 0,
      max: maxValue > 0 ? maxValue : undefined,
      interval: valueAxisInterval,
      axisLabel: {
        ...TICK_LABEL_STYLE,
        align: 'center',
        margin: 8,
        showMaxLabel: isMaxOnTick,
        formatter: (value) => formatDurationTick(value, timeType.value),
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: COLOR_GRAY_80,
          width: 1,
        },
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: !isPreview,
        showMaxLine: isMaxOnTick,
        lineStyle: {
          color: COLOR_CHART_AXIS_LINE,
          width: 1,
        },
      },
    },
    yAxis: {
      type: 'category',
      show: !isPreview,
      data: categories,
      inverse: true,
      z: 3,
      axisLine: {
        show: true,
        lineStyle: { color: COLOR_BLACK, width: 1 },
      },
      axisTick: {
        show: true,
        interval: isLabelledIndex,
        alignWithLabel: true,
        length: 6,
        lineStyle: { color: COLOR_BLACK, width: 1 },
      },
      axisLabel: {
        ...TICK_LABEL_STYLE,
        // DS 6: 36x16 label block, number in its right part, close to the axis
        width: Y_LABEL_WIDTH,
        height: Y_LABEL_HEIGHT,
        overflow: 'truncate',
        align: 'right',
        margin: Y_LABEL_MARGIN,
        interval: isLabelledIndex,
        hideOverlap: true,
      },
      splitLine: {
        show: false,
      },
    },
    tooltip: {
      ...buildItemTooltip({
        show: !isPreview,
        formatter: buildTooltipFormatter(LaunchesDurationTooltip, calculateTooltipParams, {
          itemsData,
          timeType,
          formatMessage,
        }),
      }),
      ...TOOLTIP_SHELL,
    },
    legend: {
      show: false,
    },
    series: [
      {
        id: DURATION,
        name: DURATION,
        type: 'bar',
        data: seriesData,
        barWidth: '60%',
        barCategoryGap: '40%',
        itemStyle: { borderRadius: isPreview ? BAR_END_RADIUS_PREVIEW : BAR_END_RADIUS },
        emphasis: isPreview ? { disabled: true } : STACKED_BAR_EMPHASIS,
      },
    ],
    customData: {
      itemsData,
      timeType,
    },
  };
};
