import { fetchAPI, getStorageItem, setStorageItem } from 'common/utils';
import { URLS } from 'common/urls';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { tokenSelector } from 'controllers/auth';
import { dashboardFullScreenModeSelector } from 'controllers/dashboard';
import {
  FETCH_DASHBOARD_SUCCESS,
  CHANGE_VISIBILITY_TYPE,
  ADD_DASHBOARD_ITEM_SUCCESS,
  DELETE_DASHBOARD_ITEM_SUCCESS,
  UPDATE_DASHBOARD_ITEM_SUCCESS,
  DASHBOARDS_TABLE_VIEW,
  CHANGE_FULL_SCREEN_MODE,
} from './constants';

export const fetchDashboardAction = (projectId) => (dispatch, getState) => {
  const userId = userIdSelector(getState());
  const activeProject = projectId || activeProjectSelector(getState());

  Promise.all([
    fetchAPI(URLS.dashboards(activeProject), tokenSelector(getState())),
    fetchAPI(URLS.dashboardsShared(activeProject), tokenSelector(getState())),
  ]).then(([dashboards, sharedDashboards = {}]) => {
    const { content = [] } = sharedDashboards;

    dispatch({
      type: FETCH_DASHBOARD_SUCCESS,
      payload: [...dashboards, ...content.filter((item) => item.owner !== userId)],
    });
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

  fetchAPI(URLS.dashboard(activeProject, id), tokenSelector(getState()), {
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

  fetchAPI(URLS.dashboard(activeProject, id), tokenSelector(getState()), {
    method: 'PUT',
    data: { name, description, share },
  }).then((response) => {
    const payload = { ...item, ...response };

    dispatch({
      type: UPDATE_DASHBOARD_ITEM_SUCCESS,
      payload,
    });
  });
};

export const addDashboardAction = (item) => (dispatch, getState) => {
  fetchAPI(URLS.dashboards(activeProjectSelector(getState())), tokenSelector(getState()), {
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

export const toggleFullScreenMode = () => (dispatch, getState) => {
  dispatch({
    type: CHANGE_FULL_SCREEN_MODE,
    payload: !dashboardFullScreenModeSelector(getState()),
  });
};

export const changeFullScreenMode = (mode) => ({
  type: CHANGE_FULL_SCREEN_MODE,
  payload: mode,
});
