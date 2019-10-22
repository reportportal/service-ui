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

import { defineMessages } from 'react-intl';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';

export const widgetModeMessages = defineMessages({
  [CHART_MODES.LAUNCH_MODE]: {
    id: 'WidgetModes.launchMode',
    defaultMessage: 'Launch mode',
  },
  [CHART_MODES.TIMELINE_MODE]: {
    id: 'WidgetModes.timelineMode',
    defaultMessage: 'Timeline mode',
  },
  [CHART_MODES.ALL_LAUNCHES]: {
    id: 'WidgetModes.allLaunches',
    defaultMessage: 'All launches',
  },
  [CHART_MODES.LATEST_LAUNCHES]: {
    id: 'WidgetModes.latestLaunches',
    defaultMessage: 'Latest launches',
  },
  [CHART_MODES.AREA_VIEW]: {
    id: 'WidgetModes.areaViewMode',
    defaultMessage: 'Area view',
  },
  [CHART_MODES.BAR_VIEW]: {
    id: 'WidgetModes.barViewMode',
    defaultMessage: 'Bar view',
  },
  [CHART_MODES.DONUT_VIEW]: {
    id: 'WidgetModes.donutView',
    defaultMessage: 'Donut view',
  },
  [CHART_MODES.PANEL_VIEW]: {
    id: 'WidgetModes.panelView',
    defaultMessage: 'Panel view',
  },
  [CHART_MODES.PIE_VIEW]: {
    id: 'WidgetModes.pieView',
    defaultMessage: 'Pie view',
  },
  [CHART_MODES.TABLE_VIEW]: {
    id: 'WidgetModes.tableView',
    defaultMessage: 'Table view',
  },
});

export const getWidgetModeByValue = (modeValue) =>
  Object.keys(MODES_VALUES).find((mode) => MODES_VALUES[mode] === modeValue);

export const getWidgetModeOptions = (widgetModes, formatMessage) =>
  widgetModes.map((widgetMode) => ({
    value: MODES_VALUES[widgetMode],
    label: formatMessage(widgetModeMessages[`${widgetMode}`]),
  }));
