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
  COLOR_CHART_AXIS_TITLE,
} from 'common/constants/colors';
import { getNiceTickStep, transformCategoryLabelByDefault } from 'components/widgets/common/utils';
import { buildTooltipFormatter } from 'components/widgets/common/echarts/configHelpers';
import { messages } from 'components/widgets/common/messages';
import { DURATION } from 'components/widgets/common/constants';
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
  extraCssText: 'box-shadow: none; padding: 0;',
};
const COLOR_INTERRUPTED_BAR = '#fdc63a';
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
      color: isValueInterrupted(itemsData[index]) ? COLOR_INTERRUPTED_BAR : COLOR_CHART_DURATION,
    },
  }));

  return {
    textStyle: AXIS_LABEL_STYLE,
    grid: {
      top: isPreview ? 0 : 20,
      left: isPreview ? 0 : 40,
      right: isPreview ? 0 : 20,
      bottom: isPreview ? 0 : 40,
      containLabel: false,
    },
    xAxis: {
      type: 'value',
      show: !isPreview,
      min: 0,
      max: maxValue > 0 ? maxValue : undefined,
      interval: valueAxisInterval,
      name: isPreview ? undefined : formatMessage(messages[timeType.type]),
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: {
        ...AXIS_LABEL_STYLE,
        fontSize: 12,
        color: COLOR_CHART_AXIS_TITLE,
      },
      axisLabel: {
        ...AXIS_LABEL_STYLE,
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
        ...AXIS_LABEL_STYLE,
        margin: 8,
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
