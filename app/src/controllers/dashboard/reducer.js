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

import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { queueReducers } from 'common/utils/queueReducers';
import { createPageScopedReducer } from 'common/utils/createPageScopedReducer';
import { loadingReducer } from 'controllers/loading';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_DASHBOARD_ITEM_PAGE,
  PROJECT_DASHBOARD_PRINT_PAGE,
} from 'controllers/pages';
import { paginationReducer } from 'controllers/pagination';
import {
  ADD_DASHBOARD_SUCCESS,
  CHANGE_FULL_SCREEN_MODE,
  CHANGE_VISIBILITY_TYPE,
  DECREASE_TOTAL_DASHBOARDS_LOCALLY,
  INCREASE_TOTAL_DASHBOARDS_LOCALLY,
  INITIAL_STATE,
  NAMESPACE,
  REMOVE_DASHBOARD_SUCCESS,
  TOGGLE_FULL_SCREEN_MODE,
  UPDATE_DASHBOARD_SUCCESS,
  DUPLICATE_DASHBOARD_SUCCESS,
} from './constants';

const dashboardsReducer = (state = INITIAL_STATE.dashboards, { type = '', payload = {} }) => {
  switch (type) {
    case ADD_DASHBOARD_SUCCESS:
      return [...state, payload];
    case UPDATE_DASHBOARD_SUCCESS:
      return state.map((item) => (item.id === payload.id ? payload : item));
    case REMOVE_DASHBOARD_SUCCESS:
      return state.filter((item) => item.id !== payload);
    case DUPLICATE_DASHBOARD_SUCCESS:
      return [...state, payload];
    default:
      return state;
  }
};

const activeDashboardReducer = (
  state = INITIAL_STATE.activeDashboardItem,
  { type = '', payload = {} },
) => {
  switch (type) {
    case ADD_DASHBOARD_SUCCESS:
      return payload;
    case UPDATE_DASHBOARD_SUCCESS:
      return payload;
    case REMOVE_DASHBOARD_SUCCESS:
      return {};
    default:
      return state;
  }
};

const gridTypeReducer = (state = INITIAL_STATE.gridType, { type = '', payload = {} }) =>
  type === CHANGE_VISIBILITY_TYPE ? payload : state;

const fullScreenModeReducer = (
  state = INITIAL_STATE.fullScreenMode,
  { type = '', payload = {} },
) => {
  switch (type) {
    case CHANGE_FULL_SCREEN_MODE:
      return payload;
    case TOGGLE_FULL_SCREEN_MODE:
      return !state;
    default:
      return state;
  }
};

const totalDashboardsReducer = (state = INITIAL_STATE.pagination, { type = '' }) => {
  switch (type) {
    case INCREASE_TOTAL_DASHBOARDS_LOCALLY:
      return { ...state, totalElements: state.totalElements + 1 };
    case DECREASE_TOTAL_DASHBOARDS_LOCALLY:
      return { ...state, totalElements: state.totalElements - 1 };
    default:
      return state;
  }
};

const reducer = combineReducers({
  dashboards: queueReducers(fetchReducer(NAMESPACE, { contentPath: 'content' }), dashboardsReducer),
  activeDashboardItem: activeDashboardReducer,
  gridType: gridTypeReducer,
  fullScreenMode: fullScreenModeReducer,
  loading: loadingReducer(NAMESPACE),
  pagination: queueReducers(paginationReducer(NAMESPACE), totalDashboardsReducer),
});

export const dashboardReducer = createPageScopedReducer(reducer, [
  PROJECT_DASHBOARD_PAGE,
  PROJECT_DASHBOARD_ITEM_PAGE,
  PROJECT_DASHBOARD_PRINT_PAGE,
]);
