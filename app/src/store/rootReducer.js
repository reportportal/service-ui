import { combineReducers } from 'redux';
import { APP_INFO_STORE_KEY, appInfoReducer } from 'controllers/appInfo';
import { AUTH_STORE_KEY, authReducer } from 'controllers/auth';

export const rootReducer = combineReducers({
  [APP_INFO_STORE_KEY]: appInfoReducer,
  [AUTH_STORE_KEY]: authReducer,
});
