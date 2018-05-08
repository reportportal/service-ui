import { FETCH_DATA, FETCH_START, FETCH_ERROR, FETCH_SUCCESS } from './constants';

export const fetchSuccess = (namespace, payload) => ({
  type: FETCH_SUCCESS,
  payload,
  meta: {
    namespace,
  },
});
export const fetchError = (namespace, payload) => ({
  type: FETCH_ERROR,
  payload,
  meta: {
    namespace,
  },
});
export const fetchStart = (namespace, payload) => ({
  type: FETCH_START,
  payload,
  meta: {
    namespace,
  },
});

export const fetchData = (namespace) => (url, options) => ({
  type: FETCH_DATA,
  payload: {
    url,
    options,
  },
  meta: {
    namespace,
  },
});
