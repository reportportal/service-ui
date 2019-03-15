import { getStorageItem, setStorageItem } from 'common/utils';
import { FETCH_PROJECTS, TABLE_VIEW, USER_VIEW, TOGGLE_PROJECTS_VIEW } from './constants';

export const fetchProjectsAction = (params) => ({
  type: FETCH_PROJECTS,
  payload: params,
});

export const toggleViewAction = (type) => (dispatch) => {
  const userView = getStorageItem(USER_VIEW) || TABLE_VIEW;
  const viewType = type || userView;

  setStorageItem(USER_VIEW, viewType);

  dispatch({ type: TOGGLE_PROJECTS_VIEW, payload: viewType });
};
