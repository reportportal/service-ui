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

import ReactGA from 'react-ga';
import { HUMAN_WIDGET_TYPES_MAP } from 'common/constants/widgetTypes';
import { WIDGET_MODE_VALUES_MAP } from 'components/main/analytics/events/common/widgetPages/utils';

export const provideEcGA = ({
  name,
  data,
  action,
  command = 'send',
  hitType = 'event',
  eventName = 'ecommerce',
  additionalData,
}) => {
  const ga = ReactGA.ga();

  if (Array.isArray(data)) {
    data.forEach((el) => {
      ga(`ec:${name}`, el);
    });
  } else {
    ga(`ec:${name}`, data);
  }
  if (additionalData) {
    ga('ec:setAction', action, additionalData);
  }
  ga(command, hitType, eventName, action);
};

export const normalizeDimensionValue = (value) => {
  return value !== undefined ? value.toString() : undefined;
};

const sortDashboadWidgets = (widgets) => {
  return widgets.sort((a, b) => {
    if (a.widgetPosition.positionY < b.widgetPosition.positionY) return -1;
    if (a.widgetPosition.positionY > b.widgetPosition.positionY) return 1;
    if (a.widgetPosition.positionX < b.widgetPosition.positionX) return -1;
    if (a.widgetPosition.positionX < b.widgetPosition.positionX) return 1;
    return 0;
  });
};

export const formatEcDashboardData = (dashboard) => {
  const sortedWidgets = sortDashboadWidgets([...dashboard.widgets]);
  return sortedWidgets.map((widget, index) => {
    return {
      id: widget.widgetId,
      name: HUMAN_WIDGET_TYPES_MAP[widget.widgetType],
      category: `${WIDGET_MODE_VALUES_MAP[widget.widgetOptions.viewMode] ||
        'none'}/${WIDGET_MODE_VALUES_MAP[widget.widgetOptions.timeline] ||
        'none'}/${WIDGET_MODE_VALUES_MAP[`latest-${widget.widgetOptions.latest}`] || 'none'}`,
      list: dashboard.id,
      position: index + 1,
    };
  });
};
