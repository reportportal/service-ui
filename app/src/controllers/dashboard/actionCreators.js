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

import { getStorageItem } from 'common/utils/storageUtils';
import {
  ADD_DASHBOARD,
  ADD_DASHBOARD_SUCCESS,
  CHANGE_FULL_SCREEN_MODE,
  CHANGE_VISIBILITY_TYPE,
  DASHBOARDS_TABLE_VIEW,
  DASHBOARDS_VISIBILITY_TYPE_STORAGE_KEY,
  FETCH_DASHBOARD,
  FETCH_DASHBOARDS,
  REMOVE_DASHBOARD,
  REMOVE_DASHBOARD_SUCCESS,
  TOGGLE_FULL_SCREEN_MODE,
  UPDATE_DASHBOARD,
  UPDATE_DASHBOARD_SUCCESS,
  UPDATE_DASHBOARD_WIDGETS,
} from './constants';

export const fetchDashboardsAction = (params) => ({
  type: FETCH_DASHBOARDS,
  payload: params,
});

export const fetchDashboardAction = () => ({
  type: FETCH_DASHBOARD,
});

export const addDashboardAction = (item) => ({
  type: ADD_DASHBOARD,
  payload: item,
});

export const addDashboardSuccessAction = (item) => ({
  type: ADD_DASHBOARD_SUCCESS,
  payload: item,
});

export const updateDashboardAction = (item) => ({
  type: UPDATE_DASHBOARD,
  payload: item,
});

export const updateDashboardWidgetsAction = (dashboard) => ({
  type: UPDATE_DASHBOARD_WIDGETS,
  payload: dashboard,
});

export const updateDashboardItemSuccessAction = (payload) => ({
  type: UPDATE_DASHBOARD_SUCCESS,
  payload,
});

export const deleteDashboardAction = ({ id }) => ({
  type: REMOVE_DASHBOARD,
  payload: id,
});

export const deleteDashboardSuccessAction = (id) => ({
  type: REMOVE_DASHBOARD_SUCCESS,
  payload: id,
});

export const toggleFullScreenModeAction = () => ({
  type: TOGGLE_FULL_SCREEN_MODE,
});

export const changeFullScreenModeAction = (mode) => ({
  type: CHANGE_FULL_SCREEN_MODE,
  payload: mode,
});

export const changeVisibilityTypeAction = (type) => {
  const storedVisibilityType =
    getStorageItem(DASHBOARDS_VISIBILITY_TYPE_STORAGE_KEY) || DASHBOARDS_TABLE_VIEW;
  const visibilityType = type || storedVisibilityType;

  return {
    type: CHANGE_VISIBILITY_TYPE,
    payload: visibilityType,
  };
};
