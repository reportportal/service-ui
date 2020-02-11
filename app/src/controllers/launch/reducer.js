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
import { getStorageItem } from 'common/utils';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import { createPageScopedReducer } from 'common/utils/createPageScopedReducer';
import { PROJECT_LAUNCHES_PAGE, PROJECT_USERDEBUG_PAGE } from 'controllers/pages';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { groupOperationsReducer } from 'controllers/groupOperations';
import { loadingReducer } from 'controllers/loading';
import { ALL } from 'common/constants/reservedFilterIds';
import { queueReducers } from 'common/utils/queueReducers';
import {
  NAMESPACE,
  SET_DEBUG_MODE,
  CHANGE_LAUNCH_DISTINCT,
  UPDATE_LAUNCH_LOCALLY,
  UPDATE_LAUNCHES_LOCALLY,
  UPDATE_LOCAL_SORTING,
  DEFAULT_LOCAL_SORTING,
  UPDATE_DEBUG_LOCAL_SORTING,
  UPDATE_DEBUG_LOCAL_FILTER,
} from './constants';

const getDefaultLaunchDistinctState = () =>
  (getStorageItem(APPLICATION_SETTINGS) && getStorageItem(APPLICATION_SETTINGS).launchDistinct) ||
  ALL;

const debugModeReducer = (state = false, { type, payload }) => {
  switch (type) {
    case SET_DEBUG_MODE:
      return payload;
    default:
      return state;
  }
};

const launchDistinctReducer = (state = getDefaultLaunchDistinctState(), { type, payload }) => {
  switch (type) {
    case CHANGE_LAUNCH_DISTINCT:
      return payload;
    default:
      return state;
  }
};
const updateLaunchLocallyReducer = (state, { type, payload }) => {
  switch (type) {
    case UPDATE_LAUNCH_LOCALLY:
      return state.map((item) => {
        if (item.id === payload.id) {
          return payload;
        }
        return item;
      });
    case UPDATE_LAUNCHES_LOCALLY:
      return state.map((item) => payload.find((newItem) => newItem.id === item.id) || item);
    default:
      return state;
  }
};

export const localSortingReducer = (state = DEFAULT_LOCAL_SORTING, { type, payload }) => {
  switch (type) {
    case UPDATE_LOCAL_SORTING:
      return payload;
    default:
      return state;
  }
};

export const debugLocalSortingReducer = (state = DEFAULT_LOCAL_SORTING, { type, payload }) => {
  switch (type) {
    case UPDATE_DEBUG_LOCAL_SORTING:
      return payload;
    default:
      return state;
  }
};

export const debugLocalFilterReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case UPDATE_DEBUG_LOCAL_FILTER:
      return payload;
    default:
      return state;
  }
};

const reducer = combineReducers({
  launches: queueReducers(
    fetchReducer(NAMESPACE, { contentPath: 'content' }),
    updateLaunchLocallyReducer,
  ),
  pagination: paginationReducer(NAMESPACE),
  groupOperations: groupOperationsReducer(NAMESPACE),
  loading: loadingReducer(NAMESPACE),
  debugMode: debugModeReducer,
  launchDistinct: launchDistinctReducer,
  localSorting: localSortingReducer,
  debugLocalSorting: debugLocalSortingReducer,
  debugLocalFilter: debugLocalFilterReducer,
});

export const launchReducer = createPageScopedReducer(reducer, [
  PROJECT_LAUNCHES_PAGE,
  PROJECT_USERDEBUG_PAGE,
]);
