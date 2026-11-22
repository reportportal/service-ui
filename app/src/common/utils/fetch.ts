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

type ErrorBody = Record<string, unknown>;

const isPlainObject = (value: unknown): value is ErrorBody =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Blob);

const parseErrorText = (text: string, status: number | undefined, fallbackMessage: string) => {
  try {
    const parsed: unknown = JSON.parse(text);
    if (isPlainObject(parsed)) {
      return parsed;
    }
  } catch {
    // not JSON: fall through
  }
  const trimmed = text.trim();
  const isMarkup = trimmed.startsWith('<');
  return { message: trimmed && !isMarkup ? trimmed : fallbackMessage, status };
};

const readBlobText = (blob: Blob): Promise<string> =>
  typeof blob.text === 'function'
    ? blob.text()
    : new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
      });

// Error bodies are not always ErrorRS objects: proxies answer with HTML/text, blob requests with a Blob.
export const normalizeErrorBody = (error: AxiosError): ErrorBody | Promise<ErrorBody> => {
  const data: unknown = error.response?.data;
  const status = error.response?.status;
  if (isPlainObject(data)) {
    return data;
  }
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    return readBlobText(data)
      .then((text) => parseErrorText(text, status, error.message))
      .catch(() => ({ message: error.message, status }));
  }
  if (typeof data === 'string') {
    return parseErrorText(data, status, error.message);
  }
  return { message: error.message, status };
};

const handleError = (error: unknown): Promise<never> => {
  if (axios.isCancel(error) || (error instanceof Error && error.name === 'AbortError')) {
    throw new Error(ERROR_CANCELED);
  }

  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      throw new Error(ERROR_UNAUTHORIZED);
    }

    if (error.response?.data) {
      // Callers read ErrorRS fields (message, errorCode) from the rejection reason.
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return Promise.resolve(normalizeErrorBody(error)).then((body) => Promise.reject(body));
    }
  }

  throw error;
};

const handleResponse = <T>(res: AxiosResponse<T>): T => res.data;

// Aborting this controller cancels every pending request (see fetch()) when the user logs out.
let sessionAbortController = new AbortController();

export const abortPendingRequests = (): void => {
  sessionAbortController.abort();
  sessionAbortController = new AbortController();
};

type ParamsSerializer = (params?: Record<string, unknown>) => string;

interface FetchParams extends Omit<AxiosRequestConfig<unknown>, 'url'> {
  abort?: (cancel: (message?: string) => void) => void;
  // the request is not aborted by abortPendingRequests() (e.g. a cleanup request sent on logout)
  keepOnLogout?: boolean;
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
  const { abort, keepOnLogout, signal, ...config } = params ?? {};
  // Every request is aborted by its own cancel callback or signal and, unless it opts out, by
  // abortPendingRequests() on logout, so late responses do not repopulate the cleared store.
  const controller = new AbortController();
  const abortRequest = () => controller.abort();
  const sources = [signal, keepOnLogout ? undefined : sessionAbortController.signal].filter(
    (source): source is NonNullable<typeof source> => Boolean(source),
  );
  sources.forEach((source) => {
    if (source.aborted) {
      abortRequest();
    } else {
      source.addEventListener?.('abort', abortRequest, { once: true });
    }
  });
  abort?.(abortRequest);

  const headersFromParams = config.headers;
  const headers = headersFromParams ? { ...headersFromParams } : undefined;
  const paramsSerializer: ParamsSerializer = (parameters) => stringify(parameters ?? {});

  const requestParams: AxiosRequestConfig<unknown> = {
    ...config,
    paramsSerializer,
    signal: controller.signal,
    url,
    headers,
  };

  const request = axios
    .request<T>(requestParams)
    .catch(handleError)
    .finally(() => {
      sources.forEach((source) => {
        source.removeEventListener?.('abort', abortRequest);
      });
    });

  if (isRawResponse) {
    return request;
  }

  return request.then(handleResponse<T>);
};

export const updateToken = (newToken: string): void => {
  axios.defaults.headers.common.Authorization = newToken;
};

const isAppInfoApiRequest = (url = ''): boolean => /\/api\/info(?:\?|$)/.test(url);
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
  const build = responseData.build as Record<string, unknown> | undefined;
  return build?.name === 'API Service';
};

export const initAuthInterceptor = (store: Store): void => {
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      const responseUrl = response.config?.url || '';

      if (isAppInfoApiRequest(responseUrl)) {
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

      if (isAppInfoApiRequest(requestUrl) && isServiceUnavailableError(error)) {
        store.dispatch(setServiceAvailabilityAction({ checked: true, apiUnavailable: true }));
      }

      return Promise.reject(error);
    },
  );
};
