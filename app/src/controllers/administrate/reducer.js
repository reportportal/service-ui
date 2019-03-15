import { combineReducers } from 'redux';
import { eventsReducer } from './events';
import { allUsersReducer } from './allUsers';

export const administrateReducer = combineReducers({
  events: eventsReducer,
  allUsers: allUsersReducer,
});
