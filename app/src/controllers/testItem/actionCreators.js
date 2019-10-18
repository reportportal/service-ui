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
import { validateDeleteItem } from './actionValidators';
import {
  FETCH_TEST_ITEMS,
  SET_LEVEL,
  RESTORE_PATH,
  SET_PAGE_LOADING,
  NAMESPACE,
  FETCH_TEST_ITEMS_LOG_PAGE,
} from './constants';

export const setLevelAction = (level) => ({
  type: SET_LEVEL,
  payload: level,
});

export const fetchTestItemsAction = (options) => ({
  type: FETCH_TEST_ITEMS,
  payload: options,
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

export const deleteItemsAction = defineGroupOperation(
  NAMESPACE,
  'deleteTestItems',
  (items, { onConfirm, header, mainContent, userId, currentLaunch, warning, eventsInfo }) =>
    showModalAction({
      id: 'deleteItemsModal',
      data: { items, onConfirm, header, mainContent, userId, currentLaunch, warning, eventsInfo },
    }),
  validateDeleteItem,
);
