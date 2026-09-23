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
import { COLOR_FAILED } from 'common/constants/colors';
import {
  buildSingleLineTrendOption,
  buildTrendChartYAxis,
} from '../../common/lineTrendChartOption';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { calculateTooltipParams, getTicks } from './utils';

const localMessages = defineMessages({
  failedCasesLabel: {
    id: 'FailedCasesTrendChart.failedCases',
    defaultMessage: 'failed cases',
  },
});

const SERIES_ID = 'failed';
const Y_AXIS_NAME_GAP = 24;

const buildYAxis = ({ isPreview, values, formatMessage }) => {
  const bottomExtremum = values.length ? Math.min(...values) : 0;
  const topExtremum = values.length ? Math.max(...values) : 0;
  const yAxisTicks = getTicks(bottomExtremum, topExtremum);

  return buildTrendChartYAxis({
    isPreview,
    name: formatMessage(localMessages.failedCasesLabel),
    nameGap: Y_AXIS_NAME_GAP,
    min: bottomExtremum,
    max: topExtremum,
    customValues: yAxisTicks,
  });
};

export const getOption = ({ content, isPreview, formatMessage }) =>
  buildSingleLineTrendOption({
    content,
    isPreview,
    formatMessage,
    seriesId: SERIES_ID,
    color: COLOR_FAILED,
    getValue: (item) => Number(item.values.total),
    buildYAxis,
    TooltipComponent: IssueTypeStatTooltip,
    calculateTooltipParams,
  });
