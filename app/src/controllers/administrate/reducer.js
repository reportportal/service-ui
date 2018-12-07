import { combineReducers } from 'redux';
import { projectReducer } from './project';

export const administrateReducer = combineReducers({
  project: projectReducer,
});
