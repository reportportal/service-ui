import PropTypes from 'prop-types';

export const dashboardItemPropTypes = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
});

export const INITIAL_STATE = {
  dashboards: [],
  gridType: '',
  fullScreenMode: false,
};
export const NAMESPACE = 'dashboards';
export const FETCH_DASHBOARDS = 'fetchDashboards';
export const FETCH_DASHBOARD = 'fetchDashboard';
export const ADD_DASHBOARD = 'addDashboard';
export const ADD_DASHBOARD_SUCCESS = 'addDashboardSuccess';
export const UPDATE_DASHBOARD = 'updateDashboard';
export const UPDATE_DASHBOARD_WIDGETS = 'updateDashboardWidgets';
export const UPDATE_DASHBOARD_SUCCESS = 'updateDashboardSuccess';
export const REMOVE_DASHBOARD = 'removeDashboard';
export const REMOVE_DASHBOARD_SUCCESS = 'removeDashboardSuccess';
export const CHANGE_VISIBILITY_TYPE = 'changeVisibilityType';
export const DASHBOARDS_VISIBILITY_TYPE_STORAGE_KEY = 'dashboard_type';
export const DASHBOARDS_TABLE_VIEW = 'table';
export const DASHBOARDS_GRID_VIEW = 'grid';
export const CHANGE_FULL_SCREEN_MODE = 'changeFullScreenMode';
export const TOGGLE_FULL_SCREEN_MODE = 'toggleFullScreenMode';
