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

import { CUMULATIVE_TREND } from 'common/constants/widgetTypes';
import { DEFAULT_WIDGET_CONFIG, CUMULATIVE_TREND_CHART_WIDGET_CONFIG } from './constants';

export const isWidgetDataAvailable = (data) => data.content && Object.keys(data.content).length;

export const prepareWidgetDataForSubmit = (data) => ({
  ...data,
  filterIds: (data.filters || []).map((item) => item.value),
});

export const getDefaultWidgetConfig = (widgetType) =>
  widgetType === CUMULATIVE_TREND ? CUMULATIVE_TREND_CHART_WIDGET_CONFIG : DEFAULT_WIDGET_CONFIG;

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
