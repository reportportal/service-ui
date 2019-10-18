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

import { createSelector } from 'reselect';
import { activeDashboardIdSelector, createQueryParametersSelector } from 'controllers/pages';

const domainSelector = (state) => state.dashboards || {};
export const loadingSelector = (state) => domainSelector(state).loading || false;
export const dashboardItemsUnsortedSelector = (state) => domainSelector(state).dashboards;

export const dashboardItemsSelector = createSelector(
  dashboardItemsUnsortedSelector,
  (dashboardItems) => dashboardItems.sort((a, b) => a.name.localeCompare(b.name)),
);

export const dashboardGridTypeSelector = (state) => domainSelector(state).gridType;

export const activeDashboardItemSelector = createSelector(
  dashboardItemsUnsortedSelector,
  activeDashboardIdSelector,
  (dashboardItems, activeDashboardId) =>
    dashboardItems.find((item) => item.id === activeDashboardId) || {},
);

export const dashboardFullScreenModeSelector = (state) => domainSelector(state).fullScreenMode;

export const querySelector = createQueryParametersSelector();
