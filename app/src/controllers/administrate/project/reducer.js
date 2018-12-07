import { fetchReducer } from 'controllers/fetch';
import { NAMESPACE } from './constants';

export const projectReducer = fetchReducer(NAMESPACE, { initialState: {} });
