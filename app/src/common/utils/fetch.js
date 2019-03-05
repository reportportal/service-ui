import axios, { CancelToken } from 'axios';

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

export const fetch = (url, params = {}) => {
  const cancelToken = params && params.abort ? new CancelToken(params.abort) : null;
  const headersFromParams = params && params.headers;
  const headers = Object.assign({}, headersFromParams || {});
  const requestParams = {
    ...params,
    cancelToken,
    url,
    headers,
  };
  return axios(requestParams)
    .catch(handleError)
    .then(handleResponse);
};

export const updateToken = (newToken) => {
  axios.defaults.headers.common.Authorization = newToken;
};
