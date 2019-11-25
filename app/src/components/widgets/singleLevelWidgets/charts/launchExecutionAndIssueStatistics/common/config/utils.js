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

import * as COLORS from 'common/constants/colors';

const getItemName = (item) => item.split('$')[2].toUpperCase();

export const getPercentage = (value) => (value * 100).toFixed(2);

export const getChartData = (data, filter) => {
  const itemTypes = {};
  const itemColors = {};
  Object.keys(data).forEach((key) => {
    if (key.includes(filter)) {
      const itemName = getItemName(key);
      itemTypes[key] = +data[key];
      itemColors[key] = COLORS[`COLOR_${itemName}`];
    }
  });
  return { itemTypes, itemColors };
};

export const calculateTooltipParams = (data, color, customProps) => {
  const { defectTypes = {}, formatMessage } = customProps;
  const { value, ratio, id } = data[0];

  return {
    itemsCount: `${value} (${getPercentage(ratio)}%)`,
    color: color(id),
    issueStatNameProps: { itemName: id, defectTypes, formatMessage },
  };
};

/**
 *
 * @param height - element height
 * @param width - current element width
 * @returns {boolean} - if Donut chart becomes so small that % and title start overlap chart - returns true, else returns false
 */
export const isSmallDonutChartView = (height, width) => height <= 326 || width <= 474;
