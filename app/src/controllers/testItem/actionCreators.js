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

import { defineGroupOperation } from 'controllers/groupOperations';
import { showModalAction } from 'controllers/modal';
import { fetchSuccessAction } from 'controllers/fetch';
import { validateDeleteItem } from './actionValidators';
import {
  FETCH_TEST_ITEMS,
  SET_LEVEL,
  RESTORE_PATH,
  SET_PAGE_LOADING,
  FETCH_TEST_ITEMS_LOG_PAGE,
  DELETE_TEST_ITEMS,
  FILTERED_ITEM_STATISTICS_INITIAL_STATE,
  FILTERED_ITEM_STATISTICS_NAMESPACE,
  FETCH_PARENT_LAUNCH_SUCCESS,
  SEARCH_TEST_ITEMS,
  SEARCHED_ITEMS_WIDGET,
  REFRESH_SEARCHED_ITEMS,
  LOAD_MORE_SEARCHED_ITEMS,
} from './constants';

export const setLevelAction = (level) => ({
  type: SET_LEVEL,
  payload: level,
});

export const fetchTestItemsAction = (payload) => ({
  type: FETCH_TEST_ITEMS,
  payload,
});

export const restorePathAction = () => ({
  type: RESTORE_PATH,
});

export const setPageLoadingAction = (isLoading) => ({
  type: SET_PAGE_LOADING,
  payload: isLoading,
});

export const fetchTestItemsFromLogPageAction = (payload) => ({
  type: FETCH_TEST_ITEMS_LOG_PAGE,
  payload,
});

export const deleteTestItemsAction = ({ items, callback }) => ({
  type: DELETE_TEST_ITEMS,
  payload: { items, callback },
});

export const createBulkDeleteTestItemsAction = (namespace) =>
  defineGroupOperation(
    namespace,
    'deleteTestItems',
    (items, { onConfirm, header, mainContent, warning, eventsInfo }) =>
      showModalAction({
        id: 'deleteItemsModal',
        data: {
          items,
          onConfirm,
          header,
          mainContent,
          warning,
          eventsInfo,
        },
      }),
    validateDeleteItem,
  );

export const testItemsSearchAction = (params) => ({
  type: SEARCH_TEST_ITEMS,
  payload: params,
});

export const refreshSearchedItemsAction = (id) => ({
  type: REFRESH_SEARCHED_ITEMS,
  payload: id,
});

export const loadMoreSearchedItemsAction = (id) => ({
  type: LOAD_MORE_SEARCHED_ITEMS,
  payload: id,
});

export const searchItemWidgetDetailsAction = (params) => ({
  type: SEARCHED_ITEMS_WIDGET,
  payload: params,
});

export const setDefaultItemStatisticsAction = () =>
  fetchSuccessAction(FILTERED_ITEM_STATISTICS_NAMESPACE, FILTERED_ITEM_STATISTICS_INITIAL_STATE);

export const fetchParentLaunchSuccessAction = (launch) => ({
  type: FETCH_PARENT_LAUNCH_SUCCESS,
  payload: launch,
});
