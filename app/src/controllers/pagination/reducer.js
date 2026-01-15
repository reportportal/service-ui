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
  fetchReducer,
  FETCH_SUCCESS,
  CONCAT_FETCH_SUCCESS,
  PREPEND_FETCH_SUCCESS,
} from 'controllers/fetch';

export const paginationReducer = (namespace, initialState = {}) =>
  fetchReducer(namespace, { contentPath: 'page', initialState });

const payloadConverter = (payload) => ({
  size: payload.limit,
  totalElements: payload.total_count,
  totalPages: Math.ceil(payload.total_count / payload.limit),
});

export const alternativePaginationReducer = (namespace, initialState = {}) =>
  fetchReducer(namespace, { initialState }, payloadConverter);

export const pageRangeReducer =
  (namespace) =>
  (state = null, { type, payload, meta }) => {
    if (meta?.namespace !== namespace) {
      return state;
    }

    switch (type) {
      case FETCH_SUCCESS: {
        const pageNumber = payload?.page?.number || 1;
        return { start: pageNumber, end: pageNumber };
      }
      case CONCAT_FETCH_SUCCESS: {
        const newEnd = state.end + 1;
        return {
          ...state,
          end: newEnd,
        };
      }
      case PREPEND_FETCH_SUCCESS: {
        const newStart = Math.max(1, state.start - 1);
        return {
          ...state,
          start: newStart,
        };
      }
      default:
        return state;
    }
  };
