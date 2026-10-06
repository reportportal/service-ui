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
  COLOR_INTERRUPTED,
} from 'common/constants/colors';
import { transformCategoryLabelByDefault } from 'components/widgets/common/utils';
import { buildAxisTicks, buildTooltipFormatter } from 'components/widgets/common/echarts/configHelpers';
import { messages } from 'components/widgets/common/messages';
import { DURATION } from 'components/widgets/common/constants';
import { AXIS_LABEL_STYLE, STACKED_BAR_EMPHASIS } from '../../common/stackedBarSeries';
import { buildItemTooltip } from '../../common/echartsAxisBuilders';
import { isValueInterrupted, prepareChartData, calculateTooltipParams } from './utils';
import { LaunchesDurationTooltip } from './launchesDurationTooltip';

const DISPLAY_TICK_STEP = 0.5;
const VALUE_AXIS_TICKS_COUNT = 10;

const getNiceTickStep = (max, count) => {
  const rawStep = max / count;
  const power = Math.floor(Math.log10(rawStep));
  const error = rawStep / 10 ** power;
  let factor = 1;
  if (error >= Math.sqrt(50)) {
    factor = 10;
  } else if (error >= Math.sqrt(10)) {
    factor = 5;
  } else if (error >= Math.sqrt(2)) {
    factor = 2;
  }
  return factor * 10 ** power;
};

const formatDurationTick = (value, timeTypeValue) =>
  (Number(value) / timeTypeValue).toFixed(2);

export const getOption = ({ content, isPreview, formatMessage }) => {
  const { timeType, chartData, itemsData = [] } = prepareChartData(content || []);
  const values = chartData.slice(1).map(Number);
  const categories = itemsData.map(transformCategoryLabelByDefault);
  // Same launches get a label as before the migration: every Nth one, counting from the first.
  const labelledIndexes = new Set(buildAxisTicks(itemsData.length));
  const isLabelledIndex = (index) => labelledIndexes.has(index);
  const maxValue = Math.max(0, ...values.filter(Number.isFinite));
  const valueAxisInterval =
    maxValue > 0 ? getNiceTickStep(maxValue, VALUE_AXIS_TICKS_COUNT) : timeType.value * DISPLAY_TICK_STEP;

  const seriesData = values.map((value, index) => ({
    value,
    itemStyle: {
      color: isValueInterrupted(itemsData[index]) ? COLOR_INTERRUPTED : COLOR_CHART_DURATION,
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
      },
      axisLabel: {
        ...AXIS_LABEL_STYLE,
        margin: 8,
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
        lineStyle: {
          color: COLOR_GRAY_80,
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
    tooltip: buildItemTooltip({
      show: !isPreview,
      formatter: buildTooltipFormatter(LaunchesDurationTooltip, calculateTooltipParams, {
        itemsData,
        timeType,
        formatMessage,
      }),
    }),
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
        emphasis: STACKED_BAR_EMPHASIS,
      },
    ],
    customData: {
      itemsData,
      timeType,
    },
  };
};
