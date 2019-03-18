import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { NAMESPACE, SET_PROJECTS_VIEW_MODE, GRID_VIEW } from './constants';

const setViewModeReducer = (state = GRID_VIEW, { type, payload }) => {
  switch (type) {
    case SET_PROJECTS_VIEW_MODE:
      return payload;

    default:
      return state;
  }
};

export const projectsReducer = combineReducers({
  projects: fetchReducer(NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(NAMESPACE),
  loading: loadingReducer(NAMESPACE),
  viewMode: setViewModeReducer,
});
