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
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import {
  NAMESPACE,
  FETCH_USER_FILTERS_SUCCESS,
  UPDATE_FILTER_CONDITIONS,
  ADD_FILTER,
  UPDATE_FILTER_SUCCESS,
  REMOVE_FILTER,
  UPDATE_FILTER_ORDERS,
  SET_PAGE_LOADING,
} from './constants';
import { updateFilter } from './utils';

const updateFilterConditions = (filters, filterId, conditions) => {
  const filter = filters.find((item) => item.id === filterId);
  return updateFilter(filters, { ...filter, conditions });
};

const updateFilterOrders = (filters, filterId, orders) => {
  const filter = filters.find((item) => item.id === filterId);
  return updateFilter(filters, { ...filter, orders });
};

export const launchesFiltersReducer = (state = [], { type, payload, meta: { oldId } = {} }) => {
  switch (type) {
    case FETCH_USER_FILTERS_SUCCESS:
      return payload;
    case UPDATE_FILTER_CONDITIONS:
      return updateFilterConditions(state, payload.filterId, payload.conditions);
    case UPDATE_FILTER_ORDERS:
      return updateFilterOrders(state, payload.filterId, payload.orders);
    case UPDATE_FILTER_SUCCESS:
      return updateFilter(state, payload, oldId);
    case ADD_FILTER:
      return [...state, payload];
    case REMOVE_FILTER:
      return state.filter((filter) => filter.id !== payload);
    default:
      return state;
  }
};

export const launchesFiltersReadyReducer = (state = false, { type }) => {
  switch (type) {
    case FETCH_USER_FILTERS_SUCCESS:
      return true;
    default:
      return state;
  }
};

export const pageLoadingReducer = (state = false, { type, payload }) => {
  switch (type) {
    case SET_PAGE_LOADING:
      return payload;
    default:
      return state;
  }
};

export const filterReducer = combineReducers({
  filters: fetchReducer(NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(NAMESPACE),
  loading: loadingReducer(NAMESPACE),
  pageLoading: pageLoadingReducer,
  launchesFilters: launchesFiltersReducer,
  launchesFiltersReady: launchesFiltersReadyReducer,
});
