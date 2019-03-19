import { fetchReducer } from 'controllers/fetch';
import { NAMESPACE } from './constants';

export const appInfoReducer = fetchReducer(NAMESPACE, { initialState: {} });
