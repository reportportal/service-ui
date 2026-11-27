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

import { FAILED } from 'common/constants/testStatuses';
import { statusLocalization } from 'common/constants/localization/statusLocalization';
import {
  DEFAULT_TICK_INTERVALS,
  getTrendTooltipBaseParams,
} from '../../common/trendLineChart/trendChartDesignStyles';

export {
  getXLabelStep,
  getMaxTickIntervals,
} from '../../common/trendLineChart/trendChartDesignStyles';

export const getTicks = (bottom, top, maxIntervals = DEFAULT_TICK_INTERVALS) => {
  const height = top - bottom;
  if (height <= 0) {
    return [bottom];
  }
  const intervals = Math.min(maxIntervals, Math.ceil(height));
  const step = height / intervals;

  return Array.from({ length: intervals + 1 }, (_, index) =>
    index === intervals ? top : Math.round(bottom + step * index),
  );
};

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage } = customProps;
  const { index, id, value } = data[0];
  const { name, number, startTime } = itemsData[index];

  return {
    ...getTrendTooltipBaseParams(startTime),
    itemName: `${name} #${number}`,
    itemCases: String(value),
    color: color(id),
    issueStatNameProps: { itemName: formatMessage(statusLocalization[FAILED]) },
  };
};
