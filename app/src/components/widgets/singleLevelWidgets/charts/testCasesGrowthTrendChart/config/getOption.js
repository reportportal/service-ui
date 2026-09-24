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

import moment from 'moment';
import {
  COLOR_BLACK,
  COLOR_CHARCOAL_GREY,
  COLOR_DARK_PASTEL_GREEN,
  COLOR_GRAY_80,
  COLOR_ORANGE_RED,
} from 'common/constants/colors';
import {
  buildAxisTicks,
  buildTooltipFormatter,
} from 'components/widgets/common/echarts/configHelpers';
import { messages } from 'components/widgets/common/messages';
import { normalizeChartData } from 'components/widgets/common/utils';
import { AXIS_LABEL_STYLE, STACKED_BAR_EMPHASIS } from '../../common/stackedBarSeries';
import {
  buildAxisTooltip,
  buildCategoryXAxis,
} from '../../common/echartsAxisBuilders';
import { TestCasesGrowthTrendChartTooltip } from './testCasesGrowthTrendChartTooltip';
import { calculateTooltipParams } from './utils';

const OFFSET_SERIES_ID = 'offset';
const BAR_SERIES_ID = 'bar';
const ZERO_DELTA_SERIES_ID = 'zeroDelta';
const Y_AXIS_INTERVAL = 2;
const GRID_DASH = [3, 3];
const BAR_WIDTH_RATIO = 0.6;

const getGridBottom = (isTimeline) => (isTimeline ? 50 : 40);

const getLabelStep = (itemsCount, isTimeline) => {
  if (isTimeline && itemsCount >= 20) {
    return 6;
  }

  return itemsCount < 20 ? 1 : 2;
};

const buildCategories = (itemsData, isTimeline) =>
  itemsData.map((item) => {
    if (isTimeline) {
      const day = moment(item.date).format('dddd').substring(0, 3);
      return `${day}, ${item.date}`;
    }

    return `#${item.number}`;
  });

const buildBarDataItem = (value, isPositive) => {
  if (value === 0) {
    return {
      value,
      itemStyle: {
        color: 'rgba(0,0,0,0)',
      },
    };
  }

  return {
    value,
    itemStyle: {
      color: isPositive ? COLOR_DARK_PASTEL_GREEN : COLOR_ORANGE_RED,
    },
  };
};

const formatBarLabel = (value, dataIndex, positiveTrend, labelStep) => {
  if (dataIndex % labelStep !== 0) {
    return '';
  }

  const signed = positiveTrend[dataIndex] ? value : -value;
  return String(signed);
};

/**
 * C3 draws a 1px stroke centered on the stack top for delta=0.
 * barMinHeight grows upward from that point and sits above the grid — use a
 * custom 1px line on the exact y instead.
 *
 * x is computed directly from params.coordSys to avoid api.coord() failures
 * on category axes. y uses api.coord() with a coordSys fallback.
 */
const buildZeroDeltaSeries = (bars, offsets, categories, yAxisMax) => ({
  id: ZERO_DELTA_SERIES_ID,
  type: 'custom',
  clip: false,
  silent: true,
  tooltip: {
    show: false,
  },
  z: 10,
  data: bars
    .map((value, index) => (value === 0 ? [index, offsets[index]] : null))
    .filter((item) => item !== null),
  renderItem: (params, api) => {
    const categoryOrdinal = api.value(0);
    const yValue = api.value(1);
    const { x: gridX, y: gridY, width: gridWidth, height: gridHeight } = params.coordSys;
    const slotWidth = gridWidth / categories.length;
    const xCenter = gridX + (categoryOrdinal + 0.5) * slotWidth;
    const lineWidth = slotWidth * BAR_WIDTH_RATIO;
    const coordPoint = api.coord([categoryOrdinal, yValue]);
    const yPixel =
      coordPoint && !isNaN(coordPoint[1])
        ? coordPoint[1]
        : gridY + gridHeight * (1 - yValue / (yAxisMax || 1));
    const y = Math.round(yPixel) + 0.5;

    return {
      type: 'line',
      shape: {
        x1: xCenter - lineWidth / 2,
        y1: y,
        x2: xCenter + lineWidth / 2,
        y2: y,
      },
      style: {
        stroke: COLOR_CHARCOAL_GREY,
        lineWidth: 1,
        fill: 'none',
      },
    };
  },
});

export const getOption = ({ content, isPreview, formatMessage, isTimeline = false }) => {
  const data = normalizeChartData(content || (isTimeline ? {} : []), isTimeline);
  const itemsData = [];
  const offsets = [];
  const bars = [];
  const positiveTrend = [];

  data.forEach((item) => {
    const { values, ...itemInfo } = item;
    const delta = Number.parseFloat(values.delta);
    const total = Number.parseFloat(values.statistics$executions$total);
    const isPositive = delta >= 0;

    positiveTrend.push(isPositive);
    offsets.push(isPositive ? total - delta : total);
    bars.push(Math.abs(delta));
    itemsData.push(itemInfo);
  });

  const gridBottom = isPreview ? 0 : getGridBottom(isTimeline);
  const categories = buildCategories(itemsData, isTimeline);
  const tickValues = buildAxisTicks(itemsData.length, isTimeline);
  const labelStep = getLabelStep(itemsData.length, isTimeline);
  const barData = bars.map((value, index) => buildBarDataItem(value, positiveTrend[index]));
  const dataMax = offsets.length ? Math.max(...offsets.map((o, i) => o + bars[i])) : 0;
  const yAxisMax = Math.ceil(dataMax / Y_AXIS_INTERVAL) * Y_AXIS_INTERVAL || Y_AXIS_INTERVAL;
  const zeroDeltaSeries = buildZeroDeltaSeries(bars, offsets, categories, yAxisMax);

  return {
    textStyle: AXIS_LABEL_STYLE,
    grid: {
      top: isPreview ? 0 : 30,
      left: isPreview ? 0 : 60,
      right: isPreview ? 0 : 30,
      bottom: gridBottom,
      containLabel: false,
    },
    xAxis: {
      ...buildCategoryXAxis({
        show: !isPreview,
        data: categories,
        onZero: true,
        axisLineColor: COLOR_BLACK,
        showAxisTick: true,
        axisTickColor: COLOR_BLACK,
        axisTickLength: 6,
      }),
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
      interval: Y_AXIS_INTERVAL,
      name: isPreview ? undefined : formatMessage(messages.cases),
      nameLocation: 'middle',
      nameGap: 40,
      nameRotate: 90,
      nameTextStyle: AXIS_LABEL_STYLE,
      axisLabel: {
        ...AXIS_LABEL_STYLE,
        margin: 8,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: COLOR_BLACK,
          width: 1,
        },
      },
      axisTick: {
        show: true,
        length: 6,
        lineStyle: {
          color: COLOR_BLACK,
          width: 1,
        },
      },
      splitLine: {
        show: !isPreview,
        lineStyle: {
          color: COLOR_GRAY_80,
          width: 1,
          type: GRID_DASH,
        },
      },
    },
    tooltip: buildAxisTooltip({
      show: !isPreview,
      formatter: buildTooltipFormatter(TestCasesGrowthTrendChartTooltip, calculateTooltipParams, {
        itemsData,
        positiveTrend,
        isTimeline,
        formatMessage,
      }),
    }),
    legend: {
      show: false,
    },
    series: [
      {
        id: OFFSET_SERIES_ID,
        name: OFFSET_SERIES_ID,
        type: 'bar',
        stack: 'total',
        data: offsets,
        barWidth: '60%',
        barCategoryGap: '40%',
        clip: false,
        itemStyle: {
          color: 'rgba(0,0,0,0)',
        },
        emphasis: {
          disabled: true,
        },
      },
      {
        id: BAR_SERIES_ID,
        name: BAR_SERIES_ID,
        type: 'bar',
        stack: 'total',
        data: barData,
        barWidth: '60%',
        barCategoryGap: '40%',
        clip: false,
        emphasis: STACKED_BAR_EMPHASIS,
        label: {
          show: !isPreview,
          position: 'top',
          distance: 2,
          ...AXIS_LABEL_STYLE,
          formatter: (params) => {
            const raw = params.value;
            const value = raw && typeof raw === 'object' && 'value' in raw ? raw.value : raw;
            return formatBarLabel(value, params.dataIndex, positiveTrend, labelStep);
          },
        },
      },
      ...(zeroDeltaSeries.data.length > 0 ? [zeroDeltaSeries] : []),
    ],
    customData: {
      itemsData,
      positiveTrend,
    },
  };
};
