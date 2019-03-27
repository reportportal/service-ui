import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { groupOperationsReducer } from 'controllers/groupOperations';
import { ASSIGN_TO_RROJECT_SUCCESS, UNASSIGN_FROM_PROJECT_SUCCESS } from 'controllers/user';
import { queueReducers } from 'common/utils/queueReducers';
import { NAMESPACE, SET_PROJECTS_VIEW_MODE, GRID_VIEW } from './constants';

export const setViewModeReducer = (state = GRID_VIEW, { type, payload }) => {
  switch (type) {
    case SET_PROJECTS_VIEW_MODE:
      return payload;

    default:
      return state;
  }
};

export const projectFetchReducer = fetchReducer(NAMESPACE, {
  contentPath: 'content',
  initialState: [],
});

export const assignProjectReducer = (state = [], { type, payload }) => {
  switch (type) {
    case ASSIGN_TO_RROJECT_SUCCESS:
      return state.map(
        (project) =>
          project.projectName === payload.projectName
            ? { ...project, usersQuantity: project.usersQuantity + 1 }
            : project,
      );
    case UNASSIGN_FROM_PROJECT_SUCCESS: {
      const { projectName } = payload;
      return state.map(
        (project) =>
          project.projectName === projectName
            ? { ...project, usersQuantity: project.usersQuantity - 1 }
            : project,
      );
    }
    default:
      return state;
  }
};

export const projectsReducer = combineReducers({
  projects: queueReducers(projectFetchReducer, assignProjectReducer),
  pagination: paginationReducer(NAMESPACE),
  loading: loadingReducer(NAMESPACE),
  viewMode: setViewModeReducer,
  groupOperations: groupOperationsReducer(NAMESPACE),
});
