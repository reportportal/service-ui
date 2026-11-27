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

import { messages } from 'components/widgets/common/messages';
import { getTrendTooltipBaseParams } from '../../common/trendLineChart/trendChartDesignStyles';

// Gridline steps that divide the fixed 0-100 axis evenly, from densest to sparsest.
const PERCENT_STEPS = [5, 10, 20, 25, 50, 100];
const PERCENT_MAX = 100;

/** Y ticks for the 0-100 axis: the smallest nice step whose gridline count fits maxIntervals. */
export const getPercentTicks = (maxIntervals) => {
  const step =
    PERCENT_STEPS.find((item) => PERCENT_MAX / item <= maxIntervals) ??
    PERCENT_STEPS[PERCENT_STEPS.length - 1];

  return Array.from({ length: PERCENT_MAX / step + 1 }, (_, index) => index * step);
};

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage } = customProps;
  const { index, id, value } = data[0];
  const { name, number, startTime } = itemsData[index];

  return {
    ...getTrendTooltipBaseParams(startTime),
    itemName: `${name} #${number}`,
    itemCases: Number(value).toFixed(2),
    color: color(id),
    issueStatNameProps: { itemName: formatMessage(messages.failedSkippedTotal) },
  };
};
