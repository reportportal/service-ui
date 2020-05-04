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

import { PASSED, FAILED, NOT_FOUND } from 'common/constants/testStatuses';
import { extractNamespacedQuery, createNamespacedQuery } from 'common/utils/routingUtils';
import { NAMESPACE } from './constants';

const validForGrowthDuration = (item) => item.status === FAILED || item.status === PASSED;

export const calculateGrowthDuration = (historyItems) => {
  const historyItemsLastIndex = historyItems.length - 1;
  return historyItems.reverse().map((item, index) => {
    if (!validForGrowthDuration(item) || index >= historyItemsLastIndex) {
      return item;
    }

    const newItem = { ...item };
    let prevItemIndex = index + 1;
    while (
      !validForGrowthDuration(historyItems[prevItemIndex]) &&
      prevItemIndex < historyItemsLastIndex
    ) {
      prevItemIndex += 1;
    }
    if (prevItemIndex <= historyItemsLastIndex) {
      const prevDuration =
        historyItems[prevItemIndex].endTime - historyItems[prevItemIndex].startTime;
      const currentDuration = item.endTime - item.startTime;
      const growth = currentDuration / prevDuration - 1;
      if (growth > 0) {
        newItem.growthDuration = `+${Math.round(growth * 100)}%`;
      }
    }
    return newItem;
  });
};

export const normalizeHistoryItem = (historyItem, index) => {
  if (!historyItem) {
    return {
      status: NOT_FOUND,
      id: `${NOT_FOUND}_${index}`,
    };
  }

  return {
    ...historyItem,
    launchNumber: historyItem.pathNames.launchPathName.number,
  };
};

export const getPreviousItem = (testItems = [], currentId) => {
  if (testItems.length < 2) {
    return null;
  }
  const itemIndex = testItems.findIndex((item) => item.id === currentId);
  return testItems[itemIndex - 1] || null;
};

export const getNextItem = (testItems = [], currentId) => {
  const itemIndex = testItems.findIndex((item) => item.id === currentId);

  if (testItems.length < 2) {
    if (itemIndex === -1) {
      return testItems.length === 0 ? null : testItems[0];
    }

    return null;
  }
  return testItems[itemIndex + 1] || null;
};

export const getUpdatedLogQuery = (query, itemId, params = {}) => {
  const previousLogQuery = extractNamespacedQuery(query, NAMESPACE);
  if (previousLogQuery.history) {
    previousLogQuery.history = itemId;
  }
  if (previousLogQuery.retryId) {
    delete previousLogQuery.retryId;
  }
  const newLogQuery = { ...previousLogQuery, ...params };
  return createNamespacedQuery(newLogQuery, NAMESPACE);
};

export const normalizeHistoryItems = (items) => {
  if (!items.length) return [];
  const historyItems = items[0].resources.map(normalizeHistoryItem);

  return calculateGrowthDuration(historyItems);
};

export const updateHistoryItemIssues = (items = [], issues) => {
  return items.map((item) => {
    const itemForUpdate = issues.find((issueForItem) => issueForItem.testItemId === item.id);

    if (itemForUpdate) {
      return {
        ...item,
        issue: itemForUpdate.issue,
      };
    }

    return item;
  });
};
