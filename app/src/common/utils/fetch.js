import axios, { CancelToken } from 'axios';
import { redirect } from 'redux-first-router';
import { isAuthorizedSelector, logoutAction } from 'controllers/auth';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { LOGIN_PAGE } from 'controllers/pages';
import { stringify } from 'qs';

export const ERROR_CANCELED = 'REQUEST_CANCELED';
export const ERROR_UNAUTHORIZED = 'UNAUTHORIZED';

const handleError = (error) => {
  if (axios.isCancel(error)) {
    throw new Error(ERROR_CANCELED);
  }
  if (error.response && error.response.status === 401) {
    throw new Error(ERROR_UNAUTHORIZED);
  }
  if (error.response && error.response.data) {
    throw error.response.data;
  }
  throw error;
};

const handleResponse = (res) => res.data;

export const fetch = (url, params = {}, isRawResponse) => {
  const cancelToken = params && params.abort ? new CancelToken(params.abort) : null;
  const headersFromParams = params && params.headers;
  const headers = Object.assign({}, headersFromParams || {});

  const requestParams = {
    ...params,
    paramsSerializer: (parameters) => stringify(parameters),
    cancelToken,
    url,
    headers,
  };

  return axios(requestParams)
    .catch(handleError)
    .then(!isRawResponse ? handleResponse : (response) => response);
};

export const updateToken = (newToken) => {
  axios.defaults.headers.common.Authorization = newToken;
};

export const initAuthInterceptor = (store) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        const isAuthorized = isAuthorizedSelector(store.getState());
        if (isAuthorized) {
          store.dispatch(logoutAction());
        } else {
          const isBadToken =
            error.response.data.error && error.response.data.error.indexOf('token') !== -1;
          if (isBadToken) {
            store.dispatch(
              showNotification({
                message: error.response.statusText,
                type: NOTIFICATION_TYPES.ERROR,
              }),
            );
          }
          store.dispatch(redirect({ type: LOGIN_PAGE }));
        }
      }
      return Promise.reject(error);
    },
  );
};
