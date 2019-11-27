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
  FETCH_FILTERS,
  FETCH_FILTERS_CONCAT,
  CHANGE_ACTIVE_FILTER,
  UPDATE_FILTER_CONDITIONS,
  UPDATE_FILTER,
  UPDATE_FILTER_SUCCESS,
  ADD_FILTER,
  CREATE_FILTER,
  SAVE_NEW_FILTER,
  RESET_FILTER,
  REMOVE_FILTER,
  FETCH_USER_FILTERS_SUCCESS,
  REMOVE_LAUNCHES_FILTER,
  UPDATE_FILTER_ORDERS,
  FETCH_FILTERS_PAGE,
  SET_PAGE_LOADING,
} from './constants';

export const fetchFiltersAction = (params) => ({
  type: FETCH_FILTERS,
  payload: params,
});

export const fetchFiltersConcatAction = (params) => ({
  type: FETCH_FILTERS_CONCAT,
  payload: params,
});

export const fetchUserFiltersSuccessAction = (filters) => ({
  type: FETCH_USER_FILTERS_SUCCESS,
  payload: filters,
});

export const changeActiveFilterAction = (filterId) => ({
  type: CHANGE_ACTIVE_FILTER,
  payload: filterId,
});

export const updateFilterConditionsAction = (filterId, conditions) => ({
  type: UPDATE_FILTER_CONDITIONS,
  payload: {
    filterId,
    conditions,
  },
});
export const updateFilterOrdersAction = (filterId, orders) => ({
  type: UPDATE_FILTER_ORDERS,
  payload: {
    filterId,
    orders,
  },
});

export const updateFilterAction = (filter) => ({
  type: UPDATE_FILTER,
  payload: filter,
});

export const resetFilterAction = (filterId) => ({
  type: RESET_FILTER,
  payload: filterId,
});

export const createFilterAction = (filter) => ({
  type: CREATE_FILTER,
  payload: filter,
});

export const removeFilterAction = (filterId) => ({
  type: REMOVE_FILTER,
  payload: filterId,
});

export const removeLaunchesFilterAction = (filterId) => ({
  type: REMOVE_LAUNCHES_FILTER,
  payload: filterId,
});

export const addFilterAction = (filter) => ({
  type: ADD_FILTER,
  payload: filter,
});

export const saveNewFilterAction = (filter) => ({
  type: SAVE_NEW_FILTER,
  payload: filter,
});

export const updateFilterSuccessAction = (filter, oldId) => ({
  type: UPDATE_FILTER_SUCCESS,
  payload: filter,
  meta: {
    oldId,
  },
});

export const fetchFiltersPageAction = (refreshProjectSettings) => ({
  type: FETCH_FILTERS_PAGE,
  payload: refreshProjectSettings,
});

export const setPageLoadingAction = (isLoading) => ({
  type: SET_PAGE_LOADING,
  payload: isLoading,
});
