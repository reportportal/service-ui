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

import {
  FETCH_DATA,
  FETCH_START,
  FETCH_ERROR,
  FETCH_SUCCESS,
  BULK_FETCH_DATA,
  CONCAT_FETCH_DATA,
  CONCAT_FETCH_SUCCESS,
  PREPEND_FETCH_DATA,
  PREPEND_FETCH_SUCCESS,
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

export const fetchDataAction = (namespace, silent) => (url, options, direction) => ({
  type: FETCH_DATA,
  payload: {
    url,
    options,
    direction,
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

export const concatFetchDataAction = (namespace, concat) => (url, options, direction) => ({
  type: CONCAT_FETCH_DATA,
  payload: {
    url,
    options,
    concat,
    direction,
  },
  meta: {
    namespace,
  },
});

export const prependFetchDataAction = (namespace) => (url, options, direction) => ({
  type: PREPEND_FETCH_DATA,
  payload: {
    url,
    options,
    direction,
  },
  meta: {
    namespace,
  },
});

export const prependFetchSuccessAction = (namespace, payload) => ({
  type: PREPEND_FETCH_SUCCESS,
  payload,
  meta: {
    namespace,
  },
});
