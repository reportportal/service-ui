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
import { COLOR_CHART_NON_PASSED } from 'common/constants/colors';
import {
  buildSingleLineTrendOption,
  buildTrendChartYAxis,
} from '../../common/lineTrendChartOption';
import {
  applyTrendChartDesignStyles,
  applyTrendChartPreviewStyles,
  buildLabelledIndexCheck,
  getMaxTickIntervals,
} from '../../common/trendLineChart/trendChartDesignStyles';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { calculateTooltipParams, getPercentTicks } from './utils';

const localMessages = defineMessages({
  nonPassedCases: {
    id: 'NonPassedTestCasesTrendChart.nonPassedCases',
    defaultMessage: 'of non-passed cases',
  },
});

export const FAILED_SKIPPED_TOTAL = '% (Failed+Skipped)/Total';
const SERIES_ID = 'notPassed';
// Y labels go up to "100", so the title sits further from the axis than in the failed chart.
const Y_AXIS_NAME_GAP = 36;
const Y_AXIS_MIN = 0;
const Y_AXIS_MAX = 100;

// Applied on resize so axis label density follows the current chart size.
export const getAxesUpdate = (content, { width, height }) => {
  const customValues = getPercentTicks(getMaxTickIntervals(height));

  return {
    xAxis: { axisLabel: { interval: buildLabelledIndexCheck(content.length, width) } },
    yAxis: { axisLabel: { customValues }, axisTick: { customValues } },
  };
};

const buildYAxis = ({ isPreview, formatMessage, height }) =>
  buildTrendChartYAxis({
    isPreview,
    name: `% ${formatMessage(localMessages.nonPassedCases)}`,
    nameGap: Y_AXIS_NAME_GAP,
    min: Y_AXIS_MIN,
    max: Y_AXIS_MAX,
    customValues: getPercentTicks(getMaxTickIntervals(height)),
  });

export const getOption = ({ content, isPreview, formatMessage, size }) => {
  const option = buildSingleLineTrendOption({
    content,
    isPreview,
    formatMessage,
    seriesId: SERIES_ID,
    color: COLOR_CHART_NON_PASSED,
    getValue: (item) => Number.parseFloat(item.values[FAILED_SKIPPED_TOTAL]),
    buildYAxis: (params) => buildYAxis({ ...params, height: size?.height }),
    TooltipComponent: IssueTypeStatTooltip,
    calculateTooltipParams,
  });

  return isPreview
    ? applyTrendChartPreviewStyles(option)
    : applyTrendChartDesignStyles(option, size?.width);
};
