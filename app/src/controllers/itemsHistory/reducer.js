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

import { combineReducers } from 'redux';
import { FETCH_SUCCESS } from 'controllers/fetch';
import { NAMESPACE, SET_ITEMS_HISTORY, SET_VISIBLE_ITEMS_COUNT, RESET_HISTORY } from './constants';

const itemsReducer = (state = [], { type, payload }) => {
  switch (type) {
    case SET_ITEMS_HISTORY:
      return payload;
    default:
      return state;
  }
};

const visibleItemsCountReducer = (state = 0, { type, payload }) => {
  switch (type) {
    case SET_VISIBLE_ITEMS_COUNT:
      return payload;
    case RESET_HISTORY:
      return 0;
    default:
      return state;
  }
};

const historyReducer = (state = [], { type, payload, meta }) => {
  if (meta && meta.namespace && meta.namespace !== NAMESPACE) {
    return state;
  }
  let reversedPayload;
  switch (type) {
    case FETCH_SUCCESS:
      if (state.length === 0) {
        return payload.reverse();
      }
      reversedPayload = payload.reverse();
      return state.map((item, index) => ({
        ...item,
        resources: item.resources.concat(
          reversedPayload[index] && reversedPayload[index].resources,
        ),
      }));
    case RESET_HISTORY:
      return [];
    default:
      return state;
  }
};

export const itemsHistoryReducer = combineReducers({
  history: historyReducer,
  items: itemsReducer,
  visibleItemsCount: visibleItemsCountReducer,
});
