/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import axios, { CancelToken } from 'axios';
import { isAuthorizedSelector, logoutAction } from 'controllers/auth';
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
        }
      }
      return Promise.reject(error);
    },
  );
};
