import { combineReducers } from 'redux';
import { eventsReducer } from './events';
import { allUsersReducer } from './allUsers';
import { projectsReducer } from './projects';

export const administrateReducer = combineReducers({
  events: eventsReducer,
  allUsers: allUsersReducer,
  projects: projectsReducer,
});
