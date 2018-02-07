import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { appInfoReducer } from 'controllers/appInfo';
import { authReducer } from 'controllers/auth';
import { langReducer } from 'controllers/lang';

export const rootReducer = combineReducers({
  appInfo: appInfoReducer,
  auth: authReducer,
  lang: langReducer,
  form: formReducer,
});
