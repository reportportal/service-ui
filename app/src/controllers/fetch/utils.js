import { FETCH_ERROR, FETCH_SUCCESS } from './constants';

export const createFetchPredicate = (namespace) => (action) =>
  (action.type === FETCH_SUCCESS || action.type === FETCH_ERROR) &&
  action.meta &&
  action.meta.namespace === namespace;
