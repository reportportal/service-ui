import { combineReducers } from 'redux';
import { projectDetailsReducer } from 'controllers/projectDetails';

export const adminReducer = combineReducers({
  projectDetails: projectDetailsReducer,
});
