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

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { stringify } from 'qs';
import { Store } from 'redux';

import { isAuthorizedSelector, logoutAction } from 'controllers/auth';
import { setServiceAvailabilityAction } from 'controllers/initialData/actionCreators';

export const ERROR_CANCELED = 'REQUEST_CANCELED';
export const ERROR_UNAUTHORIZED = 'UNAUTHORIZED';

const handleError = (error: unknown): never => {
  if (axios.isCancel(error) || (error instanceof Error && error.name === 'AbortError')) {
    throw new Error(ERROR_CANCELED);
  }

  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      throw new Error(ERROR_UNAUTHORIZED);
    }

    if (error.response?.data) {
      throw error.response.data;
    }
  }

  throw error;
};

const handleResponse = <T>(res: AxiosResponse<T>): T => res.data;

type ParamsSerializer = (params?: Record<string, unknown>) => string;

interface FetchParams extends Omit<AxiosRequestConfig<unknown>, 'url'> {
  abort?: (cancel: (message?: string) => void) => void;
}

type FetchFn = {
  <T = unknown>(url: string, params?: FetchParams, isRawResponse?: false): Promise<T>;
  <T = unknown>(
    url: string,
    params: FetchParams | undefined,
    isRawResponse: true,
  ): Promise<AxiosResponse<T>>;
};

export const fetch: FetchFn = <T = unknown>(
  url: string,
  params: FetchParams = {},
  isRawResponse = false,
): Promise<T | AxiosResponse<T>> => {
  let controller: AbortController | undefined;

  if (params?.abort) {
    controller = new AbortController();
    params.abort(() => controller.abort());
  }

  const headersFromParams = params?.headers;
  const headers = headersFromParams ? { ...headersFromParams } : undefined;
  const paramsSerializer: ParamsSerializer = (parameters) => stringify(parameters ?? {});

  const requestParams: AxiosRequestConfig<unknown> = {
    ...params,
    paramsSerializer,
    signal: controller?.signal ?? params.signal,
    url,
    headers,
  };

  const request = axios.request<T>(requestParams).catch(handleError);

  if (isRawResponse) {
    return request;
  }

  return request.then(handleResponse<T>);
};

export const updateToken = (newToken: string): void => {
  axios.defaults.headers.common.Authorization = newToken;
};

const isCompositeInfoRequest = (url = ''): boolean => /\/composite\/info/.test(url);
const isServiceUnavailableError = (error: AxiosError): boolean => {
  const status = error.response?.status;
  return (
    !error.response ||
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
};
const isApiServiceAvailable = (data: unknown): boolean => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const responseData = data as Record<string, unknown>;
  const api = responseData.api as Record<string, unknown> | undefined;
  const build = api?.build as Record<string, unknown> | undefined;
  return build?.name === 'API Service';
};

export const initAuthInterceptor = (store: Store): void => {
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      const responseUrl = response.config?.url || '';

      if (isCompositeInfoRequest(responseUrl)) {
        store.dispatch(setServiceAvailabilityAction({ 
          checked: true, 
          apiUnavailable: !isApiServiceAvailable(response.data) 
        }));
      }

      return response;
    },
    (error: AxiosError) => {
      const requestUrl = error.config?.url || '';

      if (error.response && error.response.status === 401) {
        const isAuthorized = isAuthorizedSelector(store.getState());
        if (isAuthorized) {
          store.dispatch(logoutAction());
        }
      }

      if (isCompositeInfoRequest(requestUrl) && isServiceUnavailableError(error)) {
        store.dispatch(setServiceAvailabilityAction({ checked: true, apiUnavailable: true }));
      }

      return Promise.reject(error);
    },
  );
};
