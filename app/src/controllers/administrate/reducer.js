import { combineReducers } from 'redux';
import { projectReducer } from './project';
import { eventsReducer } from './events';

export const administrateReducer = combineReducers({
  project: projectReducer,
  events: eventsReducer,
});
