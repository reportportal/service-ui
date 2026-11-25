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

import { createClassnames } from 'common/utils';
import { getPercentage } from '../../../common/passingRateChart/config/utils';
import styles from '../donutChart.scss';

const cx = createClassnames(styles);

export const getChartData = (data, filter) => {
  const itemTypes = {};
  Object.keys(data).forEach((key) => {
    if (key.includes(filter)) {
      itemTypes[key] = +data[key];
    }
  });
  return { itemTypes };
};

export const calculateTooltipParams = (data, color, customProps) => {
  const { defectTypes = {}, formatMessage, itemsData, total } = customProps;
  const { value, id } = data[0];
  const { name, number, startTime } = (Array.isArray(itemsData) ? itemsData[0] : itemsData) ?? {};

  return {
    itemName: number ? `${name} #${number}` : (name ?? ''),
    startTime: startTime ? new Date(startTime).getTime() : null,
    itemCases: `${value} (${getPercentage(value, total)}%)`,
    color: color(id),
    wrapperClassName: cx('tooltip'),
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
