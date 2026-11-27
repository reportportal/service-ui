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
  COLOR_CHARCOAL_GREY,
  COLOR_CHART_AXIS_LINE,
  COLOR_CHART_FAILED,
  COLOR_CHART_PASSED,
} from 'common/constants/colors';
import {
  buildTooltipFormatter,
  CHART_TOOLTIP_SHELL,
} from 'components/widgets/common/echarts/configHelpers';
import { messages } from 'components/widgets/common/messages';
import { normalizeChartData } from 'components/widgets/common/utils';
import { STACKED_BAR_EMPHASIS } from '../../common/stackedBarSeries';
import { buildAxisTooltip, buildCategoryXAxis } from '../../common/echartsAxisBuilders';
import {
  AXIS_TITLE_STYLE,
  TICK_LABEL_STYLE,
} from '../../common/trendLineChart/trendChartDesignStyles';
import { TIMELINE_AXIS_DATE_FORMAT } from '../../launchStatisticsChart/constants';
import { TestCasesGrowthTrendChartTooltip } from './testCasesGrowthTrendChartTooltip';
import { calculateTooltipParams } from './utils';

const OFFSET_SERIES_ID = 'offset';
const BAR_SERIES_ID = 'bar';
const ZERO_DELTA_SERIES_ID = 'zeroDelta';
const POSITIVE_BAR_RADIUS = [2, 2, 0, 0];
const NEGATIVE_BAR_RADIUS = [0, 0, 2, 2];
const BAR_WIDTH_RATIO = 0.6;
const X_LABEL_MARGIN = 4;

const REFERENCE_WIDTH = 668;
const REFERENCE_HEIGHT = 496;
const REFERENCE_Y_INTERVALS = 11;
const REFERENCE_X_LABELS_LAUNCH = 16;
const REFERENCE_X_LABELS_TIMELINE = 8;
const MIN_Y_INTERVALS = 2;
const MIN_X_LABELS = 2;
const NICE_STEPS = [1, 2, 4, 5, 8, 10];

const getYIntervalsCount = (height) =>
  height
    ? Math.max(MIN_Y_INTERVALS, Math.round((height / REFERENCE_HEIGHT) * REFERENCE_Y_INTERVALS))
    : REFERENCE_Y_INTERVALS;

const getXLabelStep = (itemsCount, width, isTimeline) => {
  const reference = isTimeline ? REFERENCE_X_LABELS_TIMELINE : REFERENCE_X_LABELS_LAUNCH;
  const labelsCount = width
    ? Math.max(MIN_X_LABELS, Math.round((width / REFERENCE_WIDTH) * reference))
    : reference;

  return Math.max(1, Math.ceil(itemsCount / labelsCount));
};

const computeYInterval = (max, intervalsCount) => {
  if (max <= 0) return 1;
  const rough = max / intervalsCount;
  if (rough <= 1) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const normalized = rough / magnitude;
  const step = NICE_STEPS.find((nice) => normalized <= nice) || 10;
  return step * magnitude;
};

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
      return moment(item.date).format(TIMELINE_AXIS_DATE_FORMAT);
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
      color: isPositive ? COLOR_CHART_PASSED : COLOR_CHART_FAILED,
      borderRadius: isPositive ? POSITIVE_BAR_RADIUS : NEGATIVE_BAR_RADIUS,
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
 * A 1px stroke centered on the stack top is expected for delta=0.
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
      coordPoint && !Number.isNaN(coordPoint[1])
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

const getDataMax = (data) =>
  data.reduce((max, { values }) => {
    const delta = Number.parseFloat(values.delta);
    const total = Number.parseFloat(values.statistics$executions$total);

    return Math.max(max, delta >= 0 ? total : total + Math.abs(delta));
  }, 0);

const getYScale = (dataMax, height) => {
  const interval = computeYInterval(dataMax, getYIntervalsCount(height));

  return { interval, max: Math.ceil(dataMax / interval) * interval || 1 };
};

export const getAxesUpdate = (content, { width, height, isTimeline = false }) => {
  const data = normalizeChartData(content || (isTimeline ? {} : []), isTimeline);
  const xLabelStep = getXLabelStep(data.length, width, isTimeline);

  return {
    xAxis: { axisLabel: { interval: (index) => index % xLabelStep === 0 } },
    yAxis: getYScale(getDataMax(data), height),
  };
};

export const getOption = ({ content, isPreview, formatMessage, isTimeline = false, size }) => {
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
  const xLabelStep = getXLabelStep(itemsData.length, size?.width, isTimeline);
  const labelStep = getLabelStep(itemsData.length, isTimeline);
  const barData = bars.map((value, index) => buildBarDataItem(value, positiveTrend[index]));
  const { interval: yInterval, max: yAxisMax } = getYScale(getDataMax(data), size?.height);
  const zeroDeltaSeries = buildZeroDeltaSeries(bars, offsets, categories, yAxisMax);

  return {
    textStyle: TICK_LABEL_STYLE,
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
        axisLineColor: COLOR_CHART_AXIS_LINE,
        showAxisTick: false,
      }),
      axisLabel: {
        ...TICK_LABEL_STYLE,
        margin: X_LABEL_MARGIN,
        interval: (index) => index % xLabelStep === 0,
        hideOverlap: true,
      },
    },
    yAxis: {
      type: 'value',
      show: !isPreview,
      min: 0,
      max: yAxisMax,
      interval: yInterval,
      name: isPreview ? undefined : formatMessage(messages.cases),
      nameLocation: 'middle',
      nameGap: 40,
      nameRotate: 90,
      nameTextStyle: AXIS_TITLE_STYLE,
      axisLabel: {
        ...TICK_LABEL_STYLE,
        margin: 8,
        formatter: (value) => String(value),
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: !isPreview,
        lineStyle: {
          color: COLOR_CHART_AXIS_LINE,
          width: 1,
          type: 'solid',
        },
      },
    },
    tooltip: {
      ...buildAxisTooltip({
        show: !isPreview,
        axisPointer: { type: 'none' },
        formatter: buildTooltipFormatter(TestCasesGrowthTrendChartTooltip, calculateTooltipParams, {
          itemsData,
          positiveTrend,
          isTimeline,
          formatMessage,
        }),
      }),
      ...CHART_TOOLTIP_SHELL,
    },
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
          ...TICK_LABEL_STYLE,
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
