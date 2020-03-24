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
  FETCH_LOG_PAGE_DATA,
  FETCH_LOG_PAGE_STACK_TRACE,
  CLEAR_LOG_PAGE_STACK_TRACE,
  SET_LOG_PAGE_LOADING,
  FETCH_HISTORY_ITEMS_SUCCESS,
  UPDATE_HISTORY_ITEM_ISSUES,
} from './constants';

export const fetchLogPageData = () => ({
  type: FETCH_LOG_PAGE_DATA,
});

export const refreshLogPageData = () => ({
  type: FETCH_LOG_PAGE_DATA,
  meta: {
    refresh: true,
  },
});

export const fetchHistoryItemsSuccessAction = (items) => ({
  type: FETCH_HISTORY_ITEMS_SUCCESS,
  payload: items,
});

export const fetchLogPageStackTrace = (logItem) => ({
  type: FETCH_LOG_PAGE_STACK_TRACE,
  payload: logItem,
});

export const clearLogPageStackTrace = () => ({
  type: CLEAR_LOG_PAGE_STACK_TRACE,
});

export const setPageLoadingAction = (isLoading) => ({
  type: SET_LOG_PAGE_LOADING,
  payload: isLoading,
});

export const updateHistoryItemIssuesAction = (issues) => ({
  type: UPDATE_HISTORY_ITEM_ISSUES,
  payload: issues,
});
