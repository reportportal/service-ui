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
import classNames from 'classnames/bind';
import {
  COLOR_ALMOST_BLACK,
  COLOR_CHART_AXIS_LINE,
  COLOR_CHART_AXIS_TITLE,
  COLOR_TEXT_SECONDARY,
} from 'common/constants/colors';
import { CHART_TOOLTIP_SHELL } from 'components/widgets/common/echarts/configHelpers';
import styles from './trendLineChart.scss';

const cx = classNames.bind(styles);

/**
 * DS 6 presentation shared by single-series "line per launch" trend charts
 * (Failed cases, Non-passed test-cases): 2px line, invisible points that keep a
 * click hit area, Roboto 12px axis text, light axis/grid, no x ticks, dark tooltip
 * with a 1px axis pointer and width/height-driven axis label density.
 */

export const TOOLTIP_DATE_FORMAT = 'DD.MM.YYYY, HH:mm';

const LINE_WIDTH = 2;
const GRID_TOP = 34;
const GRID_BOTTOM = 38;
const Y_LABEL_GAP = 8;
const X_LABEL_GAP = 16;

// Points are invisible but keep an 8px hit area so a click on a launch still navigates.
const INVISIBLE_POINT_SIZE = 8;
const HIDDEN_POINT_STYLE = { opacity: 0, borderWidth: 0 };

const REFERENCE_WIDTH = 668;
const REFERENCE_HEIGHT = 496;
const REFERENCE_LABELS_COUNT = 6;
const PX_PER_X_LABEL = REFERENCE_WIDTH / REFERENCE_LABELS_COUNT;
const PX_PER_Y_LABEL = REFERENCE_HEIGHT / REFERENCE_LABELS_COUNT;
const MIN_LABELS_COUNT = 3;
const MAX_Y_LABELS_COUNT = 13;

export const DEFAULT_TICK_INTERVALS = REFERENCE_LABELS_COUNT - 1;

export const TICK_LABEL_STYLE = {
  fontFamily: 'Roboto',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: 12,
  lineHeight: 16,
  color: COLOR_ALMOST_BLACK,
};

export const AXIS_TITLE_STYLE = {
  ...TICK_LABEL_STYLE,
  color: COLOR_TEXT_SECONDARY,
};

/** Max number of y gridline intervals that fit the chart height (taller chart, more gridlines). */
export const getMaxTickIntervals = (chartHeight) => {
  if (!chartHeight) {
    return DEFAULT_TICK_INTERVALS;
  }
  const labelsCount = Math.round(chartHeight / PX_PER_Y_LABEL);

  return Math.min(MAX_Y_LABELS_COUNT, Math.max(MIN_LABELS_COUNT, labelsCount)) - 1;
};

/** Every n-th launch gets an x label so labels stay readable at any widget width. */
export const getXLabelStep = (count, chartWidth) => {
  const labelsCount = chartWidth
    ? Math.max(MIN_LABELS_COUNT, Math.round(chartWidth / PX_PER_X_LABEL))
    : REFERENCE_LABELS_COUNT;

  return Math.max(1, Math.ceil(count / labelsCount));
};

export const buildLabelledIndexCheck = (count, width) => {
  const step = getXLabelStep(count, width);

  return (index) => index % step === 0;
};

// startTime may be an ISO string, an epoch-ms number or a digit-only epoch-ms string.
const toTimestamp = (startTime) =>
  /^\d+$/.test(String(startTime)) ? Number(startTime) : new Date(startTime).getTime();

/** Tooltip params common to all trend charts: formatted start time and the DS tooltip class. */
export const getTrendTooltipBaseParams = (startTime) => ({
  startTimeText: moment(toTimestamp(startTime)).format(TOOLTIP_DATE_FORMAT),
  wrapperClassName: cx('tooltip'),
});

export const buildTrendSeriesStyle = (series) => {
  const hasLine = series.data.length > 1;

  return {
    ...series,
    lineStyle: { ...series.lineStyle, width: LINE_WIDTH },
    ...(hasLine ? { symbolSize: INVISIBLE_POINT_SIZE, itemStyle: HIDDEN_POINT_STYLE } : {}),
    emphasis: {
      ...series.emphasis,
      scale: false,
      ...(hasLine ? { itemStyle: HIDDEN_POINT_STYLE } : {}),
    },
  };
};

/** Applies DS 6 styling to a non-preview option built by `buildSingleLineTrendOption`. */
export const applyTrendChartDesignStyles = (option, width) => ({
  ...option,
  textStyle: TICK_LABEL_STYLE,
  grid: { ...option.grid, top: GRID_TOP, bottom: GRID_BOTTOM, outerBoundsMode: 'none' },
  xAxis: {
    ...option.xAxis,
    axisLine: {
      ...option.xAxis.axisLine,
      lineStyle: { color: COLOR_CHART_AXIS_LINE, width: 1 },
    },
    axisTick: { show: false },
    axisLabel: {
      ...option.xAxis.axisLabel,
      ...TICK_LABEL_STYLE,
      margin: X_LABEL_GAP,
      interval: buildLabelledIndexCheck(option.xAxis.data.length, width),
    },
  },
  yAxis: {
    ...option.yAxis,
    nameTextStyle: AXIS_TITLE_STYLE,
    axisLabel: {
      ...option.yAxis.axisLabel,
      ...TICK_LABEL_STYLE,
      margin: Y_LABEL_GAP,
    },
    splitLine: {
      ...option.yAxis.splitLine,
      lineStyle: { color: COLOR_CHART_AXIS_LINE, width: 1 },
    },
  },
  tooltip: {
    ...option.tooltip,
    ...CHART_TOOLTIP_SHELL,
    axisPointer: {
      type: 'line',
      lineStyle: { color: COLOR_CHART_AXIS_TITLE, width: 1, type: 'solid' },
    },
  },
  series: option.series.map(buildTrendSeriesStyle),
});

/** Preview keeps the base option and only swaps the series styling. */
export const applyTrendChartPreviewStyles = (option) => ({
  ...option,
  series: option.series.map(buildTrendSeriesStyle),
});
