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
  toggleItemSelectionAction,
  selectItemsAction,
  unselectAllItemsAction,
  createProceedWithValidItemsAction,
  defineGroupOperation,
} from 'controllers/groupOperations';
import {
  editDefect,
  linkIssue,
  postIssue,
  unlinkIssue,
  validateEditDefect,
  validateLinkIssue,
  validatePostIssue,
  validateUnlinkIssue,
} from 'controllers/step';
import { createBulkDeleteTestItemsAction } from 'controllers/testItem';
import {
  NAMESPACE,
  FETCH_ITEMS_HISTORY,
  FETCH_HISTORY_PAGE_INFO,
  RESET_HISTORY,
  REFRESH_HISTORY,
  SET_HISTORY_PAGE_LOADING,
  SET_FILTER_FOR_COMPARE,
  FETCH_FILTER_HISTORY,
} from './constants';

export const toggleHistoryItemSelectionAction = toggleItemSelectionAction(NAMESPACE);
export const selectHistoryItemsAction = selectItemsAction(NAMESPACE);
export const unselectAllHistoryItemsAction = unselectAllItemsAction(NAMESPACE);
export const proceedWithValidItemsAction = createProceedWithValidItemsAction(NAMESPACE);
export const deleteHistoryItemsAction = createBulkDeleteTestItemsAction(NAMESPACE);

export const unlinkIssueHistoryAction = defineGroupOperation(
  NAMESPACE,
  'unlink-issue',
  unlinkIssue,
  validateUnlinkIssue,
);

export const editDefectsHistoryAction = defineGroupOperation(
  NAMESPACE,
  'edit-defect',
  editDefect,
  validateEditDefect,
);

export const linkIssueHistoryAction = defineGroupOperation(
  NAMESPACE,
  'link-issue',
  linkIssue,
  validateLinkIssue,
);

export const postIssueHistoryAction = defineGroupOperation(
  NAMESPACE,
  'post-issue',
  postIssue,
  validatePostIssue,
);

export const fetchItemsHistoryAction = ({ historyDepth, historyBase, loadMore } = {}) => ({
  type: FETCH_ITEMS_HISTORY,
  payload: { historyDepth, historyBase, loadMore },
});

export const fetchHistoryPageInfoAction = () => ({
  type: FETCH_HISTORY_PAGE_INFO,
});

export const resetHistoryAction = () => ({
  type: RESET_HISTORY,
});

export const refreshHistoryAction = ({ historyBase }) => ({
  type: REFRESH_HISTORY,
  payload: { historyBase },
});

export const setHistoryPageLoadingAction = (payload) => ({
  type: SET_HISTORY_PAGE_LOADING,
  payload,
});

export const setFilterForCompareAction = (payload) => ({
  type: SET_FILTER_FOR_COMPARE,
  payload,
});

export const fetchFilterHistoryAction = ({ filter, loadMore } = {}) => ({
  type: FETCH_FILTER_HISTORY,
  payload: { filter, loadMore },
});
