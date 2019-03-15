import { fetch, getStorageItem, setStorageItem } from 'common/utils';
import { URLS } from 'common/urls';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { PROJECT_DASHBOARD_PAGE, activeDashboardIdSelector } from 'controllers/pages';
import {
  FETCH_DASHBOARD_SUCCESS,
  CHANGE_VISIBILITY_TYPE,
  ADD_DASHBOARD_ITEM_SUCCESS,
  DELETE_DASHBOARD_ITEM_SUCCESS,
  UPDATE_DASHBOARD_ITEM_SUCCESS,
  DASHBOARDS_TABLE_VIEW,
  CHANGE_FULL_SCREEN_MODE,
  TOGGLE_FULL_SCREEN_MODE,
} from './constants';

const updateDashboardItemAction = (payload) => (dispatch) =>
  dispatch({
    type: UPDATE_DASHBOARD_ITEM_SUCCESS,
    payload,
  });

export const fetchDashboardsAction = (projectId) => (dispatch, getState) => {
  const activeProject = projectId || activeProjectSelector(getState());

  fetch(URLS.dashboards(activeProject)).then((dashboards = {}) => {
    dispatch({
      type: FETCH_DASHBOARD_SUCCESS,
      payload: dashboards.content,
    });
  });
};

export const fetchDashboardAction = () => (dispatch, getState) => {
  const activeProject = activeProjectSelector(getState());
  const activeDashboard = activeDashboardIdSelector(getState());

  fetch(URLS.dashboard(activeProject, activeDashboard))
    .then((dashboard) => {
      updateDashboardItemAction(dashboard)(dispatch);
    })
    .catch(() => {
      this.props.redirect({ type: PROJECT_DASHBOARD_PAGE, payload: { projectId: activeProject } });
    });
};

export const updateDashboardWidgetsAction = (dashboard) => (dispatch, getState) => {
  const activeProject = activeProjectSelector(getState());

  return fetch(URLS.dashboard(activeProject, dashboard.id), {
    method: 'PUT',
    data: {
      updateWidgets: dashboard.widgets,
    },
  }).then(() => {
    updateDashboardItemAction(dashboard)(dispatch);
  });
};

export const changeVisibilityTypeAction = (type) => (dispatch) => {
  const storedVisibilityType = getStorageItem('dashboard_type') || DASHBOARDS_TABLE_VIEW;
  const visibilityType = type || storedVisibilityType;

  setStorageItem('dashboard_type', visibilityType);

  dispatch({ type: CHANGE_VISIBILITY_TYPE, payload: visibilityType });
};

export const deleteDashboardAction = ({ id }) => (dispatch, getState) => {
  const activeProject = activeProjectSelector(getState());

  fetch(URLS.dashboard(activeProject, id), {
    method: 'DELETE',
  }).then(() => {
    dispatch({
      type: DELETE_DASHBOARD_ITEM_SUCCESS,
      payload: id,
    });
  });
};

export const editDashboardAction = (item) => (dispatch, getState) => {
  const activeProject = activeProjectSelector(getState());

  const { name, description, share, id } = item;

  fetch(URLS.dashboard(activeProject, id), {
    method: 'PUT',
    data: { name, description, share },
  }).then((response) => {
    const payload = { ...item, ...response };
    updateDashboardItemAction(payload)(dispatch);
  });
};

export const addDashboardAction = (item) => (dispatch, getState) => {
  fetch(URLS.dashboards(activeProjectSelector(getState())), {
    method: 'POST',
    data: item,
  }).then((response) => {
    const payload = { ...item, ...response, ...{ owner: userIdSelector(getState()) } };

    dispatch({
      type: ADD_DASHBOARD_ITEM_SUCCESS,
      payload,
    });
  });
};

export const toggleFullScreenModeAction = () => ({
  type: TOGGLE_FULL_SCREEN_MODE,
});

export const changeFullScreenModeAction = (mode) => ({
  type: CHANGE_FULL_SCREEN_MODE,
  payload: mode,
});
