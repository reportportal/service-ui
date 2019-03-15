import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { NAMESPACE, TOGGLE_PROJECTS_VIEW } from './constants';

const toggleViewReducer = (state = null, { type, payload }) => {
  if (type === TOGGLE_PROJECTS_VIEW) {
    return payload;
  }
  return state;
};

export const projectsReducer = combineReducers({
  projects: fetchReducer(NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(NAMESPACE),
  loading: loadingReducer(NAMESPACE),
  viewType: toggleViewReducer,
});
