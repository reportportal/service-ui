import {
  INITIAL_STATE,
  FETCH_DASHBOARD_SUCCESS,
  CHANGE_VISIBILITY_TYPE,
  ADD_DASHBOARD_ITEM_SUCCESS,
  DELETE_DASHBOARD_ITEM_SUCCESS,
  UPDATE_DASHBOARD_ITEM_SUCCESS,
  DASHBOARDS_TABLE_VIEW,
  DASHBOARDS_GRID_VIEW,
  CHANGE_FULL_SCREEN_MODE,
  TOGGLE_FULL_SCREEN_MODE,
} from './constants';
import { dashboardReducer } from './reducer';

describe('dashboard reducer', () => {
  test('should return initial state', () => {
    expect(dashboardReducer(undefined, {})).toBe(INITIAL_STATE);
  });

  test('should return old state on unknown action', () => {
    const oldState = { foo: 1 };
    expect(dashboardReducer(oldState, { type: 'foo' })).toBe(oldState);
  });

  test('should handle FETCH_DASHBOARD_SUCCESS', () => {
    const payload = [{ id: 0 }, { id: 1 }];
    const newState = dashboardReducer(undefined, {
      type: FETCH_DASHBOARD_SUCCESS,
      payload,
    });
    expect(newState).toEqual({
      ...INITIAL_STATE,
      dashboardItems: payload,
    });
  });

  test('should handle ADD_DASHBOARD_ITEM_SUCCESS', () => {
    const payload = { id: 1 };
    const oldState = {
      ...INITIAL_STATE,
      dashboardItems: [{ id: 0 }],
    };
    const newState = dashboardReducer(oldState, {
      type: ADD_DASHBOARD_ITEM_SUCCESS,
      payload,
    });
    expect(newState).toEqual({
      ...oldState,
      dashboardItems: [...oldState.dashboardItems, payload],
    });
  });

  test('should handle DELETE_DASHBOARD_ITEM_SUCCESS', () => {
    const payload = 1;
    const oldState = {
      ...INITIAL_STATE,
      dashboardItems: [{ id: 0 }, { id: 1 }],
    };
    const newState = dashboardReducer(oldState, {
      type: DELETE_DASHBOARD_ITEM_SUCCESS,
      payload,
    });
    expect(newState).toEqual({
      ...oldState,
      dashboardItems: [{ id: 0 }],
    });
  });

  test('should handle UPDATE_DASHBOARD_ITEM_SUCCESS', () => {
    const payload = { id: 1, foo: 2 };
    const oldState = {
      ...INITIAL_STATE,
      dashboardItems: [{ id: 0 }, { id: 1 }],
    };
    const newState = dashboardReducer(oldState, {
      type: UPDATE_DASHBOARD_ITEM_SUCCESS,
      payload,
    });
    expect(newState).toEqual({
      ...oldState,
      dashboardItems: [{ id: 0 }, payload],
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
