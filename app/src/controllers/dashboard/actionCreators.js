import { fetch, getStorageItem, setStorageItem } from 'common/utils';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import {
  FETCH_DASHBOARD_SUCCESS,
  CHANGE_VISIBILITY_TYPE,
  ADD_DASHBOARD_ITEM_SUCCESS,
  DELETE_DASHBOARD_ITEM_SUCCESS,
  UPDATE_DASHBOARD_ITEM_SUCCESS,
  DASHBOARDS_TABLE_VIEW,
} from './constants';

export const fetchDashboardAction = () => (dispatch, getState) => {
  const userId = userIdSelector(getState());
  const activeProject = activeProjectSelector(getState());

  Promise.all([
    fetch(`/api/v1/${activeProject}/dashboard`),
    fetch(`/api/v1/${activeProject}/dashboard/shared?page.page=1&page.size=300`),
  ]).then(([dashboards, sharedDashboards]) => {
    const { content } = sharedDashboards;

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

  fetch(`/api/v1/${activeProject}/dashboard/${id}`, {
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

  fetch(`/api/v1/${activeProject}/dashboard/${id}`, {
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
  const activeProject = activeProjectSelector(getState());
  const userId = userIdSelector(getState());

  fetch(`/api/v1/${activeProject}/dashboard`, {
    method: 'POST',
    data: item,
  }).then((response) => {
    const payload = { ...item, ...response, ...{ owner: userId } };

    dispatch({
      type: ADD_DASHBOARD_ITEM_SUCCESS,
      payload,
    });
  });
};
