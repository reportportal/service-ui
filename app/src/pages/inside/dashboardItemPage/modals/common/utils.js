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

import equal from 'fast-deep-equal';
import {
  COMPONENT_HEALTH_CHECK,
  COMPONENT_HEALTH_CHECK_TABLE,
  CUMULATIVE_TREND,
  TEST_CASE_SEARCH,
} from 'common/constants/widgetTypes';
import { DEFAULT_WIDGET_CONFIG, FULLSIZED_WIDGET_CONFIG } from './constants';

export const isWidgetDataAvailable = (data) => data.content && Object.keys(data.content).length;

export const prepareWidgetDataForSubmit = (data) => ({
  ...data,
  ...(data.filters && { filterIds: data.filters.map((item) => item.value) }),
});

export const getDefaultWidgetConfig = (widgetType) =>
  [CUMULATIVE_TREND, TEST_CASE_SEARCH].includes(widgetType)
    ? FULLSIZED_WIDGET_CONFIG
    : DEFAULT_WIDGET_CONFIG;

export const getUpdatedWidgetsList = (oldWidgets, newWidget) => {
  const {
    widgetSize: { width: newWidgetWidth, height: newWidgetHeight },
  } = newWidget;
  const newWidgets = oldWidgets.map((item) => {
    const {
      widgetPosition: { positionY, positionX },
    } = item;

    return {
      ...item,
      widgetPosition: {
        ...item.widgetPosition,
        positionY: positionX < newWidgetWidth ? positionY + newWidgetHeight : positionY,
      },
    };
  });
  newWidgets.unshift(newWidget);

  return newWidgets;
};

const compareFields = (defaultValues, changedValues, parentKey = '') => {
  const modifiedFields = [];

  Object.keys(defaultValues).forEach((key) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (
      defaultValues[key] &&
      typeof defaultValues[key] === 'object' &&
      !Array.isArray(defaultValues[key])
    ) {
      const nestedDifferences = compareFields(
        defaultValues[key],
        changedValues[key] || {},
        fullKey,
      );
      modifiedFields.push(...nestedDifferences);
    } else if (!equal(defaultValues[key], changedValues[key])) {
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

export const getIsExcludeSkipped = (widgetType, data) => {
  if (![COMPONENT_HEALTH_CHECK, COMPONENT_HEALTH_CHECK_TABLE].includes(widgetType)) return null;
  const {
    contentParameters: { widgetOptions },
  } = data;
  return widgetOptions.excludeSkipped.toString();
};
