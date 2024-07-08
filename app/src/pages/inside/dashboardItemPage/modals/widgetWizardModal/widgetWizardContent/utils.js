/*
 * Copyright 2024 EPAM Systems
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

import _ from 'lodash';
import {
  COMPONENT_HEALTH_CHECK,
  COMPONENT_HEALTH_CHECK_TABLE,
  CUMULATIVE_TREND,
} from 'common/constants/widgetTypes';

const compareFields = (defaultValues, changedValues, parentKey = '') => {
  const modifiedFields = [];

  Object.keys(defaultValues).forEach((key) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (_.isObject(defaultValues[key]) && !_.isArray(defaultValues[key])) {
      const nestedDifferences = compareFields(
        defaultValues[key],
        _.get(changedValues, key, {}),
        fullKey,
      );
      modifiedFields.push(...nestedDifferences);
    } else if (!_.isEqual(defaultValues[key], _.get(changedValues, key))) {
      modifiedFields.push(fullKey);
    }
  });
  return modifiedFields;
};

export const getModifiedFieldsLabels = (defaultFormValues, changedFormValues) => {
  return compareFields(
    { contentParameters: defaultFormValues },
    { contentParameters: changedFormValues },
  );
};

export const getCreatedWidgetLevelsCount = (widgetType, data) => {
  if (
    ![CUMULATIVE_TREND, COMPONENT_HEALTH_CHECK, COMPONENT_HEALTH_CHECK_TABLE].includes(widgetType)
  )
    return null;
  const {
    contentParameters: { widgetOptions },
  } = data;
  return widgetOptions.attributes?.length || widgetOptions.attributeKeys?.length || 1;
};
