import { combineReducers } from 'redux';
import { demoDataReducer } from './demoData/reducer';

export const projectSettingsReducer = combineReducers({
  demoDataGenerator: demoDataReducer,
});
