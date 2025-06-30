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

import { PopoverItem } from 'pages/common/popoverControl/popoverControl';
import { messages } from './messages';

export const DEFAULT_FILTER_VALUE = 'all';
export const DEFAULT_CURRENT_PAGE = 1;
export const DEFAULT_ITEMS_PER_PAGE = 10;

/**
 * Creates menu items for test case actions
 * @param formatMessage - Function to format internationalized messages
 * @param skippedIndexes - Optional array of indexes to filter out from the menu items
 * @returns Array of PopoverItem objects for test case actions
 */
export const createTestCaseMenuItems = (
  formatMessage: (message: { id: string; defaultMessage: string }) => string,
  skippedIndexes?: number[],
): PopoverItem[] => {
  const allMenuItems: PopoverItem[] = [
    { label: formatMessage(messages.duplicate) },
    { label: formatMessage(messages.editTestCase) },
    { label: formatMessage(messages.moveTestCaseTo) },
    { label: formatMessage(messages.historyOfActions) },
    { label: formatMessage(messages.deleteTestCase), variant: 'danger' },
  ];

  if (!skippedIndexes || skippedIndexes.length === 0) {
    return allMenuItems;
  }

  return allMenuItems.filter((_, index) => !skippedIndexes.includes(index));
};
