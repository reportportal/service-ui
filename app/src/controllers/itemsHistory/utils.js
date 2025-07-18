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

import { NOT_FOUND } from 'common/constants/testStatuses';
import { updateHistoryItemLaunchAttributes } from 'controllers/log/utils';

export const normalizeHistoryItem = (historyItem, id) => {
  if (!historyItem) {
    return {
      status: NOT_FOUND,
      id: `${NOT_FOUND}_${id}`,
    };
  }

  return historyItem;
};

export const calculateMaxRowItemsCount = (history) =>
  history.reduce(
    (count, item) => (item.resources.length > count ? item.resources.length : count),
    0,
  );

export const updateItemsHistoryLaunchAttributes = (items = [], launch = {}) => {
  return items.map((item) => {
    const resources = updateHistoryItemLaunchAttributes(item.resources, launch);
    return { ...item, resources };
  });
};

// Score utility functions
export const getScoreFromAttributes = (attributes, key) => {
  if (!attributes || !key) {
    return null;
  }
  const attribute = attributes.find((attr) => attr.key === key);
  return attribute ? parseFloat(attribute.value) : null;
};

export const getScoreCellColor = (score, highlightLessThan) => {
  // Don't apply any color if threshold is not set
  if (highlightLessThan === '' || highlightLessThan === null || highlightLessThan === undefined) {
    return null;
  }

  const threshold = parseFloat(highlightLessThan);
  if (isNaN(threshold)) {
    return null;
  }

  if (score === null || score === undefined || isNaN(score)) {
    return '#E3E7EC'; // Default gray for missing score when threshold is set
  }

  return score < threshold ? '#FFC0BD' : '#E3E7EC';
};

export const formatScoreValue = (score) => {
  if (score === null || score === undefined) {
    return '-';
  }
  return score.toString();
};
