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

export const FETCH_ITEMS_HISTORY = 'fetchItemsHistory';
export const HISTORY_ITEMS_TO_LOAD = 30;
export const OPTIMAL_HISTORY_DEPTH_FOR_RENDER = 5;
export const NAMESPACE = 'history';
export const FETCH_HISTORY_PAGE_INFO = 'fetchHistoryPageInfo';
export const SET_ITEMS_HISTORY = 'setItemsForHistory';
export const SET_VISIBLE_ITEMS_COUNT = 'setVisibleItemsCount';
export const RESET_HISTORY = 'resetHistory';
export const RESET_FETCH_HISTORY = 'refreshHistory';
export const HISTORY_DEPTH_CONFIG = {
  name: 'historyDepth',
  defaultValue: '10',
  options: [
    { value: '3', label: '3' },
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '15', label: '15' },
    { value: '20', label: '20' },
    { value: '25', label: '25' },
    { value: '30', label: '30' },
  ],
};
