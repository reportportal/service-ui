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
import { getTimeType, convertSecondsToMilliseconds } from 'components/widgets/common/utils';
import { buildTooltipFormatter } from 'components/widgets/common/echarts/configHelpers';
import { messages } from 'components/widgets/common/messages';
import { DURATION } from 'components/widgets/common/constants';
import { AXIS_LABEL_STYLE, STACKED_BAR_EMPHASIS } from '../../../charts/common/stackedBarSeries';
import { buildItemTooltip } from '../../../charts/common/echartsAxisBuilders';
import { MostTimeConsumingTestCasesTooltip } from './mostTimeConsumingTestCasesTooltip';
import { calculateTooltipParams } from './utils';

const DISPLAY_TICK_STEP = 0.1;

const formatDurationTick = (value, timeTypeValue) =>
  (Number.parseInt(value, 10) / timeTypeValue).toFixed(2);

const prepareChartData = (content) => {
  const chartData = [DURATION];
  let maxDuration = 0;
  const itemsData = content.map((item) => {
    const duration = convertSecondsToMilliseconds(item.duration);
    maxDuration = duration > maxDuration ? duration : maxDuration;
    chartData.push(duration);

    return { ...item, duration };
  });

  return {
    timeType: getTimeType(maxDuration),
    chartData,
    itemsData,
  };
};

export const getOption = ({ content, isPreview, formatMessage }) => {
  const { timeType, chartData, itemsData = [] } = prepareChartData(content || []);
  const values = chartData.slice(1).map(Number);
  const categories = itemsData.map((_, index) => String(index));
  const valueAxisInterval = timeType.value * DISPLAY_TICK_STEP;
  const maxValue = Math.max(0, ...values.filter(Number.isFinite));

  const seriesData = values.map((value, index) => {
    const status = itemsData[index]?.status;

    return {
      value,
      itemStyle: {
        color: COLORS[`COLOR_${status}`],
      },
    };
  });

  return {
    textStyle: AXIS_LABEL_STYLE,
    grid: {
      top: isPreview ? 0 : 40,
      left: isPreview ? 0 : 35,
      right: isPreview ? 0 : 10,
      bottom: isPreview ? 0 : 50,
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
          color: COLORS.COLOR_GRAY_80,
          width: 1,
        },
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'category',
      show: !isPreview,
      data: categories,
      inverse: true,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: !isPreview,
        alignWithLabel: true,
        inside: true,
        customValues: categories.filter((_, index) => index % 2 === 0),
        length: 10000,
        lineStyle: {
          color: COLORS.COLOR_GRAY_80,
          width: 1,
        },
      },
      axisLabel: {
        show: false,
      },
      splitLine: {
        show: false,
      },
    },
    tooltip: buildItemTooltip({
      show: !isPreview,
      formatter: buildTooltipFormatter(MostTimeConsumingTestCasesTooltip, calculateTooltipParams, {
        itemsData,
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
        barWidth: '80%',
        barCategoryGap: '20%',
        emphasis: STACKED_BAR_EMPHASIS,
      },
    ],
    customData: {
      itemsData,
      timeType,
    },
  };
};
