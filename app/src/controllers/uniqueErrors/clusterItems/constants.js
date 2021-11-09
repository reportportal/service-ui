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

export const FETCH_CLUSTER_ITEMS_START = 'fetchClusterItemsStart';
export const FETCH_CLUSTER_ITEMS_SUCCESS = 'fetchClusterItemsSuccess';
export const FETCH_CLUSTER_ITEMS_ERROR = 'fetchClusterItemsError';
export const CLEAR_CLUSTER_ITEMS = 'clearClusterItems';
export const TOGGLE_CLUSTER_ITEMS = 'toggleClusterItems';
export const LOAD_MORE_CLUSTER_ITEMS = 'loadMoreClusterItems';
export const REQUEST_CLUSTER_ITEMS = 'requestClusterItems';

export const PAGE_SIZE = 10;

export const INITIAL_STATE = {
  loading: false,
  content: [],
  page: {},
  collapsed: true,
  initial: true,
};
