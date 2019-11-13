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

import {
  ADD_DASHBOARD_SUCCESS,
  CHANGE_FULL_SCREEN_MODE,
  CHANGE_VISIBILITY_TYPE,
  DASHBOARDS_GRID_VIEW,
  DASHBOARDS_TABLE_VIEW,
  INITIAL_STATE,
  REMOVE_DASHBOARD_SUCCESS,
  TOGGLE_FULL_SCREEN_MODE,
  UPDATE_DASHBOARD_SUCCESS,
} from './constants';
import { dashboardReducer } from './reducer';

describe('dashboard reducer', () => {
  test('should return initial state', () => {
    expect(dashboardReducer(undefined, {})).toEqual(INITIAL_STATE);
  });

  test('should return old state on unknown action', () => {
    const oldState = INITIAL_STATE;
    expect(dashboardReducer(oldState, { type: 'foo' })).toBe(oldState);
  });

  test('should handle ADD_DASHBOARD_SUCCESS', () => {
    const payload = { id: 1 };
    const oldState = {
      ...INITIAL_STATE,
      dashboards: [{ id: 0 }],
    };
    const newState = dashboardReducer(oldState, {
      type: ADD_DASHBOARD_SUCCESS,
      payload,
    });
    expect(newState).toEqual({
      ...oldState,
      dashboards: [...oldState.dashboards, payload],
    });
  });

  test('should handle REMOVE_DASHBOARD_SUCCESS', () => {
    const payload = 1;
    const oldState = {
      ...INITIAL_STATE,
      dashboards: [{ id: 0 }, { id: 1 }],
    };
    const newState = dashboardReducer(oldState, {
      type: REMOVE_DASHBOARD_SUCCESS,
      payload,
    });
    expect(newState).toEqual({
      ...oldState,
      dashboards: [{ id: 0 }],
    });
  });

  test('should handle UPDATE_DASHBOARD_SUCCESS', () => {
    const payload = { id: 1, foo: 2 };
    const oldState = {
      ...INITIAL_STATE,
      dashboards: [{ id: 0 }, { id: 1 }],
    };
    const newState = dashboardReducer(oldState, {
      type: UPDATE_DASHBOARD_SUCCESS,
      payload,
    });
    expect(newState).toEqual({
      ...oldState,
      dashboards: [{ id: 0 }, payload],
    });
  });

  test('should handle CHANGE_VISIBILITY_TYPE', () => {
    const oldState = {
      ...INITIAL_STATE,
      gridType: DASHBOARDS_GRID_VIEW,
    };
    const newState = dashboardReducer(oldState, {
      type: CHANGE_VISIBILITY_TYPE,
      payload: DASHBOARDS_TABLE_VIEW,
    });
    expect(newState).toEqual({
      ...oldState,
      gridType: DASHBOARDS_TABLE_VIEW,
    });
  });

  test('should handle CHANGE_FULL_SCREEN_MODE', () => {
    const oldState = {
      ...INITIAL_STATE,
      fullScreenMode: false,
    };
    const newState = dashboardReducer(oldState, {
      type: CHANGE_FULL_SCREEN_MODE,
      payload: true,
    });
    expect(newState).toEqual({
      ...oldState,
      fullScreenMode: true,
    });
  });

  test('should handle TOGGLE_FULL_SCREEN_MODE', () => {
    const oldState = {
      ...INITIAL_STATE,
      fullScreenMode: false,
    };
    const newState = dashboardReducer(oldState, {
      type: TOGGLE_FULL_SCREEN_MODE,
    });
    expect(newState).toEqual({
      ...oldState,
      fullScreenMode: true,
    });
    expect(
      dashboardReducer(newState, {
        type: TOGGLE_FULL_SCREEN_MODE,
      }),
    ).toEqual(oldState);
  });
});
