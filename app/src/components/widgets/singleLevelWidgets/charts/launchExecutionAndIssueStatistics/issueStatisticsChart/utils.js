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

import { getItemNameConfig } from 'components/widgets/common/utils';
import { getChartData } from '../common/config/utils';

export const getChartColors = (columns, defectTypes) =>
  columns.reduce((colors, column) => {
    const locator = getItemNameConfig(column[0]).locator;
    const defectTypesValues = Object.values(defectTypes);

    for (let i = 0; i < defectTypesValues.length; i += 1) {
      const defect = defectTypesValues[i].find((defectType) => defectType.locator === locator);

      if (defect) {
        Object.assign(colors, { [column[0]]: defect.color });

        return colors;
      }
    }

    return colors;
  }, {});

export const getColumns = (content, contentFields, { orderedContentFields, defectTypes }) => {
  const values = (content[0] || content).values;
  const defectDataItems = getChartData(values, '$defects$');
  const defectTypesChartData = defectDataItems.itemTypes;
  const columns = [];

  const orderedData = orderedContentFields.map((type) => ({
    key: type,
    value: defectTypesChartData[type] || 0,
  }));

  orderedData.forEach((item) => {
    const currentContentField = contentFields.find((field) => field === item.key);
    if (currentContentField) {
      columns.push([item.key, item.value]);
    }
  });

  const colors = getChartColors(columns, defectTypes);

  return { columns, colors };
};
