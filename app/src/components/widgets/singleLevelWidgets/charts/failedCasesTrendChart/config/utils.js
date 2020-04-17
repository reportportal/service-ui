/*
 * Copyright 2019 EPAM Systems
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

import { range } from 'common/utils';
import { FAILED } from 'common/constants/testStatuses';
import { statusLocalization } from 'common/constants/localization/statusLocalization';
import { messages } from 'components/widgets/common/messages';

export const getTicks = (bottom, top) => {
  const count = 6; // change it if want to increase/decrease Y-lines
  const height = top - bottom;
  let step;
  const result = [bottom];
  if (height < 1) {
    step = 0.2;
  } else if (height < 10) {
    step = 2;
  } else {
    step = Math.round(height / count / 10) * 10;
  }
  range(0, top, step || 1).forEach((item) => {
    if (item > bottom) {
      result.push(item);
    }
  });
  result.push(top);
  return result;
};

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage } = customProps;
  const { index, id, value } = data[0];
  const { name, number, startTime } = itemsData[index];

  return {
    itemName: `${name} #${number}`,
    startTime: Number(startTime),
    itemCases: `${value} ${formatMessage(messages.cases)}`,
    color: color(id),
    issueStatNameProps: { itemName: formatMessage(statusLocalization[FAILED]) },
  };
};
