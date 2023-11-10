/*
 * Copyright 2021 EPAM Systems
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

// conditions should look like 'statistics$defects$product_bug$pb001'
export const getDefectTypeLabel = (condition) => {
  try {
    const conditionUnits = condition.split('$');
    const defectType = conditionUnits[2].replace('_', ' ');
    const defectTypeLocator = conditionUnits[3];
    const total = defectTypeLocator === 'total' ? 'Total' : '';
    if (defectTypeLocator.indexOf('001') !== -1) {
      return defectType;
    }

    return `${total || 'Custom'} ${defectType}`;
  } catch (e) {
    return '';
  }
};

export const getIncludedData = ({ includeData, includeComments, includeLogs }) => {
  const analyticsDataMap = {
    logs: includeLogs,
    attachments: includeData,
    comments: includeComments,
  };

  return Object.keys(analyticsDataMap)
    .filter((key) => analyticsDataMap[key])
    .join('#');
};
