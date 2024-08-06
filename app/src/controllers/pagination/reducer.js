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

import { FETCH_SUCCESS, fetchReducer } from 'controllers/fetch';
import { initialPaginationState } from './constants';

export const paginationReducer = (namespace, initialState = {}) =>
  fetchReducer(namespace, { contentPath: 'page', initialState });

export const alternativePaginationReducer = (state = initialPaginationState, { type, payload }) => {
  switch (type) {
    case FETCH_SUCCESS: {
      return {
        ...state,
        size: payload.limit,
        totalElements: payload.total_count,
        totalPages: Math.ceil(payload.total_count / payload.limit),
      };
    }

    default:
      return state;
  }
};
