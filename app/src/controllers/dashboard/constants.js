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

import PropTypes from 'prop-types';
import { formatSortingString, SORTING_DESC } from 'controllers/sorting';

export const dashboardItemPropTypes = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
});

export const INITIAL_STATE = {
  dashboards: [],
  activeDashboardItem: {},
  gridType: '',
  fullScreenMode: false,
  loading: false,
  pagination: {},
};
export const NAMESPACE = 'dashboards';
export const FETCH_DASHBOARDS = 'fetchDashboards';
export const FETCH_DASHBOARD = 'fetchDashboard';
export const ADD_DASHBOARD = 'addDashboard';
export const ADD_DASHBOARD_SUCCESS = 'addDashboardSuccess';
export const UPDATE_DASHBOARD = 'updateDashboard';
export const UPDATE_DASHBOARD_WIDGETS = 'updateDashboardWidgets';
export const UPDATE_DASHBOARD_SUCCESS = 'updateDashboardSuccess';
export const DUPLICATE_DASHBOARD = 'duplicateDashboard';
export const DUPLICATE_DASHBOARD_SUCCESS = 'duplicateDashboardSuccess';
export const REMOVE_DASHBOARD = 'removeDashboard';
export const REMOVE_DASHBOARD_SUCCESS = 'removeDashboardSuccess';
export const CHANGE_VISIBILITY_TYPE = 'changeVisibilityType';
export const DASHBOARDS_VISIBILITY_TYPE_STORAGE_KEY = 'dashboard_type';
export const DASHBOARDS_TABLE_VIEW = 'table';
export const DASHBOARDS_GRID_VIEW = 'grid';
export const CHANGE_FULL_SCREEN_MODE = 'changeFullScreenMode';
export const TOGGLE_FULL_SCREEN_MODE = 'toggleFullScreenMode';
export const INCREASE_TOTAL_DASHBOARDS_LOCALLY = 'increaseTotalDashboardsLocally';
export const DECREASE_TOTAL_DASHBOARDS_LOCALLY = 'decreaseTotalDashboardsLocally';
export const DEFAULT_SORT_COLUMN = 'creationDate';
export const DEFAULT_SORTING = formatSortingString([DEFAULT_SORT_COLUMN], SORTING_DESC);
export const ERROR_CODES = {
  DASHBOARD_EXISTS: 4091,
};
