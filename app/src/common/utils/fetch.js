import axios, { CancelToken } from 'axios';
import { DEFAULT_TOKEN, TOKEN_KEY } from 'controllers/auth';

export const ERROR_CANCELED = 'REQUEST_CANCELED';
export const ERROR_UNAUTHORIZED = 'UNAUTHORIZED';

const handleError = (error) => {
  if (axios.isCancel(error)) {
    throw new Error(ERROR_CANCELED);
  }
  if (error.response && error.response.status === 401) {
    throw new Error(ERROR_UNAUTHORIZED);
  }
  throw error;
};

const handleResponse = res => res.data;

export const fetch = (url, params = {}) => {
  const cancelToken = (params && params.abort) ? new CancelToken(params.abort) : null;
  const token = localStorage.getItem(TOKEN_KEY) || DEFAULT_TOKEN;
  const headersFromParams = params && params.headers;
  const headers = Object.assign({}, headersFromParams || {}, { Authorization: token });
  const requestParams = {
    ...params,
    cancelToken,
    url,
    headers,
  };
  return axios(requestParams).catch(handleError).then(handleResponse);
};
