import {
  FETCH_DATA,
  FETCH_START,
  FETCH_ERROR,
  FETCH_SUCCESS,
  BULK_FETCH_DATA,
  CONCAT_FETCH_DATA,
  CONCAT_FETCH_SUCCESS,
} from './constants';

export const fetchSuccessAction = (namespace, payload) => ({
  type: FETCH_SUCCESS,
  payload,
  meta: {
    namespace,
  },
});
export const fetchErrorAction = (namespace, payload, silent) => ({
  type: FETCH_ERROR,
  payload,
  error: true,
  meta: {
    namespace,
    silent,
  },
});
export const fetchStartAction = (namespace, payload) => ({
  type: FETCH_START,
  payload,
  meta: {
    namespace,
  },
});

export const fetchDataAction = (namespace, silent) => (url, options) => ({
  type: FETCH_DATA,
  payload: {
    url,
    options,
  },
  meta: {
    namespace,
    silent,
  },
});
export const bulkFetchDataAction = (namespace, silent) => (urls, options) => ({
  type: BULK_FETCH_DATA,
  payload: {
    urls,
    options,
  },
  meta: {
    namespace,
    silent,
  },
});

export const concatFetchSuccessAction = (namespace, payload, concat) => ({
  type: CONCAT_FETCH_SUCCESS,
  payload,
  meta: {
    namespace,
  },
  concat,
});

export const concatFetchDataAction = (namespace, concat) => (url, options) => ({
  type: CONCAT_FETCH_DATA,
  payload: {
    url,
    options,
    concat,
  },
  meta: {
    namespace,
  },
});
