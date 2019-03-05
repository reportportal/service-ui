import PropTypes from 'prop-types';

export const dashboardItemPropTypes = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
});

export const INITIAL_STATE = {
  dashboardItems: [],
  gridType: '',
  fullScreenMode: false,
};
export const FETCH_DASHBOARD_SUCCESS = 'fetchDashboardSuccess';
export const CHANGE_VISIBILITY_TYPE = 'changeVisibilityType';
export const UPDATE_DASHBOARD_ITEM_SUCCESS = 'UpdateDashboardItemInitialize';
export const ADD_DASHBOARD_ITEM_SUCCESS = 'AddDashboardItemSuccess';
export const DELETE_DASHBOARD_ITEM_SUCCESS = 'DeleteDashboardItemSuccess';
export const DASHBOARDS_TABLE_VIEW = 'table';
export const DASHBOARDS_GRID_VIEW = 'grid';
export const CHANGE_FULL_SCREEN_MODE = 'changeFullScreenMode';
export const TOGGLE_FULL_SCREEN_MODE = 'toggleFullScreenMode';
