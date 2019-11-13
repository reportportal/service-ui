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

import { defineMessages } from 'react-intl';
import { messages } from 'components/widgets/common/messages';

export const localMessages = defineMessages({
  yAxisInvestigationsTitle: {
    id: 'Chart.yAxisTitle',
    defaultMessage: '% of investigations',
  },
});

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage, isTimeline } = customProps;
  const { index, id, value } = data[0];
  const { name, number, startTime, date } = itemsData[index];

  return {
    itemName: isTimeline ? date : `${name} #${number}`,
    startTime: isTimeline ? null : Number(startTime),
    itemCases: `${Number(value).toFixed(2)}%`,
    color: color(id),
    issueStatNameProps: { itemName: messages[id] ? formatMessage(messages[id]) : id },
  };
};
