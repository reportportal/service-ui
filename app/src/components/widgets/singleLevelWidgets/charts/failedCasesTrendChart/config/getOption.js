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
import { COLOR_CHART_FAILED } from 'common/constants/colors';
import {
  buildSingleLineTrendOption,
  buildTrendChartYAxis,
} from '../../common/lineTrendChartOption';
import {
  applyTrendChartDesignStyles,
  applyTrendChartPreviewStyles,
  buildLabelledIndexCheck,
} from '../../common/trendLineChart/trendChartDesignStyles';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { calculateTooltipParams, getTicks, getMaxTickIntervals } from './utils';

const localMessages = defineMessages({
  failedCasesLabel: {
    id: 'FailedCasesTrendChart.failedCases',
    defaultMessage: 'failed cases',
  },
});

const SERIES_ID = 'failed';
const Y_AXIS_NAME_GAP = 24;

const getExtremums = (values) => ({
  bottomExtremum: values.length ? Math.min(...values) : 0,
  topExtremum: values.length ? Math.max(...values) : 0,
});

const getValues = (content = []) => content.map((item) => Number(item.values.total));

export const getAxesUpdate = (content, { width, height }) => {
  const { bottomExtremum, topExtremum } = getExtremums(getValues(content));
  const customValues = getTicks(bottomExtremum, topExtremum, getMaxTickIntervals(height));

  return {
    xAxis: { axisLabel: { interval: buildLabelledIndexCheck(content.length, width) } },
    yAxis: { axisLabel: { customValues }, axisTick: { customValues } },
  };
};

const buildYAxis = ({ isPreview, values, formatMessage, height }) => {
  const { bottomExtremum, topExtremum } = getExtremums(values);
  const yAxis = buildTrendChartYAxis({
    isPreview,
    name: formatMessage(localMessages.failedCasesLabel),
    nameGap: Y_AXIS_NAME_GAP,
    min: bottomExtremum,
    max: topExtremum,
    customValues: getTicks(bottomExtremum, topExtremum, getMaxTickIntervals(height)),
  });

  if (isPreview) {
    return yAxis;
  }

  return {
    ...yAxis,
    axisLabel: {
      ...yAxis.axisLabel,
      formatter: (value) => String(Math.round(value)),
    },
  };
};

export const getOption = ({ content, isPreview, formatMessage, size }) => {
  const option = buildSingleLineTrendOption({
    content,
    isPreview,
    formatMessage,
    seriesId: SERIES_ID,
    color: COLOR_CHART_FAILED,
    getValue: (item) => Number(item.values.total),
    buildYAxis: (params) => buildYAxis({ ...params, height: size?.height }),
    TooltipComponent: IssueTypeStatTooltip,
    calculateTooltipParams,
  });

  return isPreview
    ? applyTrendChartPreviewStyles(option)
    : applyTrendChartDesignStyles(option, size?.width);
};
