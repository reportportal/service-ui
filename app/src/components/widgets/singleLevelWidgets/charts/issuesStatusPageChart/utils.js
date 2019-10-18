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

import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { messages } from 'components/widgets/common/messages';
import { IssueTypeStatTooltip } from '../common/issueTypeStatTooltip';

const calculateTooltipParams = (data, color, customProps) => {
  const { content, formatMessage, wrapperClassName } = customProps;
  const { id, index, value } = data;
  const { name } = content[index];

  return {
    itemName: name,
    itemCases: `${value} ${formatMessage(messages.cases)}`,
    color: color[id],
    issueStatNameProps: { itemName: formatMessage(messages[id]) },
    wrapperClassName,
  };
};

export const createTooltip = (content, formatMessage, wrapperClassName) =>
  createTooltipRenderer(IssueTypeStatTooltip, calculateTooltipParams, {
    content,
    formatMessage,
    wrapperClassName,
  });
