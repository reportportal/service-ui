import { FETCH_DATA, FETCH_START, FETCH_ERROR, FETCH_SUCCESS, BULK_FETCH_DATA } from './constants';

export const fetchSuccessAction = (namespace, payload) => ({
  type: FETCH_SUCCESS,
  payload,
  meta: {
    namespace,
  },
});
export const fetchErrorAction = (namespace, payload) => ({
  type: FETCH_ERROR,
  payload,
  meta: {
    namespace,
  },
});
export const fetchStartAction = (namespace, payload) => ({
  type: FETCH_START,
  payload,
  meta: {
    namespace,
  },
});

export const fetchDataAction = (namespace) => (url, options) => ({
  type: FETCH_DATA,
  payload: {
    url,
    options,
  },
  meta: {
    namespace,
  },
});
export const bulkFetchDataAction = (namespace) => (urls, options) => ({
  type: BULK_FETCH_DATA,
  payload: {
    urls,
    options,
  },
  meta: {
    namespace,
  },
});
