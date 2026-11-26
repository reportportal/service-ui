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

import { defineMessages } from 'react-intl';
import {
  COLOR_ALMOST_BLACK,
  COLOR_CHART_AXIS_LINE,
  COLOR_CHART_AXIS_TITLE,
  COLOR_CHART_NON_PASSED,
  COLOR_TEXT_SECONDARY,
} from 'common/constants/colors';
import { CHART_TOOLTIP_SHELL } from 'components/widgets/common/echarts/configHelpers';
import {
  buildSingleLineTrendOption,
  buildTrendChartYAxis,
} from '../../common/lineTrendChartOption';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { calculateTooltipParams, getXLabelStep } from './utils';

const localMessages = defineMessages({
  nonPassedCases: {
    id: 'NonPassedTestCasesTrendChart.nonPassedCases',
    defaultMessage: 'of non-passed cases',
  },
});

export const FAILED_SKIPPED_TOTAL = '% (Failed+Skipped)/Total';
const SERIES_ID = 'notPassed';
const Y_AXIS_NAME_GAP = 36;
const Y_AXIS_MIN = 0;
const Y_AXIS_MAX = 100;
const LINE_WIDTH = 2;
const GRID_TOP = 34;
const GRID_BOTTOM = 38;

const Y_LABEL_GAP = 8;
const X_LABEL_GAP = 16;

const TICK_LABEL_STYLE = {
  fontFamily: 'Roboto',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: 12,
  lineHeight: 16,
  color: COLOR_ALMOST_BLACK,
};
const AXIS_TITLE_STYLE = {
  ...TICK_LABEL_STYLE,
  color: COLOR_TEXT_SECONDARY,
};

const buildLabelledIndexCheck = (count, width) => {
  const step = getXLabelStep(count, width);
  return (index) => index % step === 0;
};

export const getAxesUpdate = (content, { width }) => ({
  xAxis: { axisLabel: { interval: buildLabelledIndexCheck(content.length, width) } },
});

const buildYAxis = ({ isPreview, formatMessage }) => {
  const yAxis = buildTrendChartYAxis({
    isPreview,
    name: `% ${formatMessage(localMessages.nonPassedCases)}`,
    nameGap: Y_AXIS_NAME_GAP,
    min: Y_AXIS_MIN,
    max: Y_AXIS_MAX,
  });

  if (isPreview) {
    return yAxis;
  }

  return {
    ...yAxis,
    nameTextStyle: AXIS_TITLE_STYLE,
    axisLabel: {
      ...yAxis.axisLabel,
      ...TICK_LABEL_STYLE,
      margin: Y_LABEL_GAP,
    },
    splitLine: {
      ...yAxis.splitLine,
      lineStyle: { color: COLOR_CHART_AXIS_LINE, width: 1 },
    },
  };
};

const INVISIBLE_POINT_SIZE = 8;
const HIDDEN_POINT_STYLE = { opacity: 0, borderWidth: 0 };

const buildSeriesStyle = (series) => {
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

const applyDesignSystemStyles = (option, width) => ({
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
  tooltip: {
    ...option.tooltip,
    ...CHART_TOOLTIP_SHELL,
    axisPointer: {
      type: 'line',
      lineStyle: { color: COLOR_CHART_AXIS_TITLE, width: 1, type: 'solid' },
    },
  },
  series: option.series.map((series) => buildSeriesStyle(series)),
});

export const getOption = ({ content, isPreview, formatMessage, size }) => {
  const option = buildSingleLineTrendOption({
    content,
    isPreview,
    formatMessage,
    seriesId: SERIES_ID,
    color: COLOR_CHART_NON_PASSED,
    getValue: (item) => Number.parseFloat(item.values[FAILED_SKIPPED_TOTAL]),
    buildYAxis,
    TooltipComponent: IssueTypeStatTooltip,
    calculateTooltipParams,
  });

  return isPreview
    ? { ...option, series: option.series.map(buildSeriesStyle) }
    : applyDesignSystemStyles(option, size?.width);
};
