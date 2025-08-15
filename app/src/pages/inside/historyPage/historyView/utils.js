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

import { CELL_HIGHLIGHT_COLORS } from './constants';

export const getAttributeValue = (attributes, key) => {
  if (!attributes || !key) {
    return null;
  }
  const attribute = attributes.find((attr) => attr.key === key);
  return attribute ? parseFloat(attribute.value) : null;
};

export const getAttributeCellColor = (value, highlightLessThan) => {
  if (highlightLessThan === '' || highlightLessThan === null || highlightLessThan === undefined) {
    return null;
  }

  const threshold = parseFloat(highlightLessThan);
  if (isNaN(threshold)) {
    return null;
  }

  if (value === null || value === undefined || isNaN(value)) {
    return CELL_HIGHLIGHT_COLORS.DEFAULT;
  }

  if (value < threshold) {
    return CELL_HIGHLIGHT_COLORS.BELOW_THRESHOLD;
  }

  return CELL_HIGHLIGHT_COLORS.ABOVE_THRESHOLD;
};

export const formatAttributeValue = (value) => {
  if (value === null || value === undefined) {
    return '-';
  }
  return value.toString();
};
