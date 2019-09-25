import { fetchReducer } from 'controllers/fetch';
import { APP_INFO_NAMESPACE } from './constants';

export const appInfoReducer = fetchReducer(APP_INFO_NAMESPACE, { initialState: {} });
