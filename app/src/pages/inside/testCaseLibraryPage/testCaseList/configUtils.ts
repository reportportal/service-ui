/*
 * Copyright 2025 EPAM Systems
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

import { isEmpty } from 'lodash';

import { PopoverItem } from 'pages/common/popoverControl/popoverControl';
import { messages } from './messages';
import { TestCaseMenuAction } from './types';

export const DEFAULT_CURRENT_PAGE = 1;
export const DEFAULT_ITEMS_PER_PAGE = 10;

export const createTestCaseMenuItems = (
  formatMessage: (message: { id: string; defaultMessage: string }) => string,
  actions?: { [key in TestCaseMenuAction]?: () => void },
  excludedActions?: TestCaseMenuAction[],
): PopoverItem[] => {
  const allMenuItems: (PopoverItem & { action: TestCaseMenuAction })[] = [
    { label: formatMessage(messages.duplicate), action: TestCaseMenuAction.DUPLICATE },
    { label: formatMessage(messages.editTestCase), action: TestCaseMenuAction.EDIT },
    { label: formatMessage(messages.moveTestCaseTo), action: TestCaseMenuAction.MOVE },
    { label: formatMessage(messages.historyOfActions), action: TestCaseMenuAction.HISTORY },
    {
      label: formatMessage(messages.deleteTestCase),
      variant: 'danger',
      action: TestCaseMenuAction.DELETE,
    },
  ];

  if (isEmpty(excludedActions)) {
    return allMenuItems;
  }

  return allMenuItems
    .filter((item) => !excludedActions.includes(item.action))
    .map((item) => ({
      ...item,
      onClick: actions?.[item.action],
    }));
};
