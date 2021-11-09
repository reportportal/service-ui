/*
 * Copyright 2021 EPAM Systems
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
  FETCH_CLUSTER_ITEMS_START,
  FETCH_CLUSTER_ITEMS_SUCCESS,
  CLEAR_CLUSTER_ITEMS,
  TOGGLE_CLUSTER_ITEMS,
} from './constants';

export const clusterItemsReducer = (state = {}, action) => {
  switch (action.type) {
    case FETCH_CLUSTER_ITEMS_START: {
      const {
        payload: { id },
        refresh = false,
      } = action;
      return {
        ...state,
        [id]: {
          content: [],
          page: {},
          collapsed: !refresh,
          ...state[id],
          loading: !refresh,
        },
      };
    }
    case FETCH_CLUSTER_ITEMS_SUCCESS: {
      const {
        payload: { id, page, content },
      } = action;

      return {
        ...state,
        [id]: {
          ...state[id],
          loading: false,
          content,
          page,
        },
      };
    }
    case CLEAR_CLUSTER_ITEMS:
      return {};
    case TOGGLE_CLUSTER_ITEMS: {
      const {
        payload: { id },
      } = action;
      return {
        ...state,
        [id]: {
          ...state[id],
          collapsed: !state[id].collapsed,
        },
      };
    }
    default:
      return state;
  }
};
