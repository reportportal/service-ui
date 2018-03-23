import { submit } from 'redux-form';
import { fetch } from 'common/utils';
import {
  FETCH_DASHBOARD_SUCCESS,
  CHANGE_VISIBILITY_TYPE,
  ADD_DASHBOARD_ITEM_SUCCESS,
  DELETE_DASHBOARD_ITEM_SUCCESS,
  UPDATE_DASHBOARD_ITEM_SUCCESS,
} from './constants';


export const fetchDashboardAction = () => (dispatch, getState) => {
  const { activeProject, info: { userId } } = getState().user;
  Promise.all(
    [
      fetch(`/api/v1/${activeProject}/dashboard`),
      fetch(`api/v1/${activeProject}/dashboard/shared?page.page=1&page.size=300`),
    ],
  ).then(([dashboards, sharedDashboards]) => {
    const { content } = sharedDashboards;

    dispatch(
      {
        type: FETCH_DASHBOARD_SUCCESS,
        payload: [...dashboards, ...content.filter(item => item.owner !== userId)] },
        );
  });
};

export const changeVisibilityTypeAction = type => dispatch =>
  dispatch({ type: CHANGE_VISIBILITY_TYPE, payload: type });

export const deleteDashboardAction = ({ id }) => (dispatch, getState) => {
  const { activeProject } = getState().user;

  fetch(`/api/v1/${activeProject}/dashboard/${id}`, {
    method: 'DELETE',
  }).then(() => {
    dispatch({
      type: DELETE_DASHBOARD_ITEM_SUCCESS,
      payload: id,
    });
  });
};

export const editDashboardAction = item => (dispatch, getState) => {
  const { activeProject } = getState().user;

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

export const addDashboardAction = item => (dispatch, getState) => {
  const { activeProject, info: { userId } } = getState().user;

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

export const submitAddEditDashboardFormAction = () => (dispatch) => {
  dispatch(submit('addEditDashboard'));
};
