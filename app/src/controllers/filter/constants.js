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

export const FETCH_FILTERS = 'fetchFilters';
export const FETCH_FILTERS_CONCAT = 'fetchFiltersConcat';
export const NAMESPACE = 'filters';
export const LAUNCHES_FILTERS_NAMESPACE = `${NAMESPACE}/launchesFilters`;
export const LAUNCHES_FILTERS_UPDATE_NAMESPACE = `${NAMESPACE}/launchesFiltersUpdate`;
export const CHANGE_ACTIVE_FILTER = 'changeActiveFilter';
export const UPDATE_FILTER_CONDITIONS = 'updateFilterConditions';
export const UPDATE_FILTER_ORDERS = 'updateFilterOrders';
export const UPDATE_FILTER = 'updateFilter';
export const RESET_FILTER = 'resetFilter';
export const CREATE_FILTER = 'createFilter';
export const ADD_FILTER = 'addFilter';
export const SAVE_NEW_FILTER = 'saveNewFilter';
export const REMOVE_FILTER = 'removeFilter';
export const REMOVE_LAUNCHES_FILTER = 'removeLaunchesFilter';

export const UPDATE_FILTER_SUCCESS = 'updateFilterSuccess';
export const FETCH_USER_FILTERS_SUCCESS = 'fetchUserFiltersSuccess';
export const FETCH_FILTERS_PAGE = 'fetchFiltersPage';
export const SET_PAGE_LOADING = 'setPageLoading';

export const DEFAULT_FILTER = {
  conditions: [],
  type: 'launch',
  orders: [
    { isAsc: false, sortingColumn: 'startTime' },
    { isAsc: false, sortingColumn: 'number' },
  ],
};
