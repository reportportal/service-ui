import { combineReducers } from 'redux';
import { projectReducer } from './project';
import { eventsReducer } from './events';
import { allUsersReducer } from './allUsers';

export const administrateReducer = combineReducers({
  project: projectReducer,
  events: eventsReducer,
  allUsers: allUsersReducer,
});
