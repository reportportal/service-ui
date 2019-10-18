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

export const CHART_MODES = {
  LAUNCH_MODE: 'launchMode',
  TIMELINE_MODE: 'timelineMode',

  ALL_LAUNCHES: 'allLaunches',
  LATEST_LAUNCHES: 'latestLaunches',

  AREA_VIEW: 'areaView',
  BAR_VIEW: 'barView',
  TABLE_VIEW: 'tableView',
  PANEL_VIEW: 'panelView',
  DONUT_VIEW: 'donutView',
  PIE_VIEW: 'pieView',
};

export const MODES_VALUES = {
  [CHART_MODES.ALL_LAUNCHES]: false,
  [CHART_MODES.LATEST_LAUNCHES]: true,
  [CHART_MODES.AREA_VIEW]: 'area-spline',
  [CHART_MODES.PIE_VIEW]: 'pie',
  [CHART_MODES.BAR_VIEW]: 'bar',
  [CHART_MODES.LAUNCH_MODE]: 'launch',
  [CHART_MODES.TIMELINE_MODE]: 'day',
  [CHART_MODES.TABLE_VIEW]: 'table',
  [CHART_MODES.DONUT_VIEW]: 'donut',
  [CHART_MODES.PANEL_VIEW]: 'panel',
};
