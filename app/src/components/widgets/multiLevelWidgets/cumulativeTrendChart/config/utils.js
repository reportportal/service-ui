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

import * as COLORS from 'common/constants/colors';

export const TOTAL_FIELD = 'statistics$executions$total';

export const EXECUTION_FIELDS = [
  'statistics$executions$failed',
  'statistics$executions$skipped',
  'statistics$executions$passed',
];

export const getDefectFields = (contentFields) =>
  contentFields.filter((item) => /defects/.test(item));

export const getColorForKey = (key) => COLORS[`COLOR_${key.split('$')[2].toUpperCase()}`];

export const firstCapital = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const getScaleName = (attributes, activeAttribute) =>
  activeAttribute && attributes[1] ? attributes[1] : attributes[0];

/**
 * Percentage of `value` against the relevant total at `index`: the sum of
 * all defect fields when `field` is a defect, otherwise the total dataset's
 * own value at that index — mirrors the original Chart.js widget's math.
 */
export const getPercentageValue = (value, valuesByField, field, index) => {
  const isDefectField = /defects/.test(field);
  let totalValue = valuesByField[TOTAL_FIELD]?.[index];

  if (isDefectField) {
    totalValue = Object.keys(valuesByField)
      .filter((key) => /defects/.test(key))
      .reduce((total, key) => total + (valuesByField[key][index] || 0), 0);
  }

  return totalValue ? -((-value / totalValue) * 100).toFixed(2) : 0;
};

export const convertToPercentages = (valuesByField) =>
  Object.keys(valuesByField).reduce((acc, field) => {
    acc[field] = valuesByField[field].map((value, index) =>
      Number(getPercentageValue(value, valuesByField, field, index)),
    );
    return acc;
  }, {});
