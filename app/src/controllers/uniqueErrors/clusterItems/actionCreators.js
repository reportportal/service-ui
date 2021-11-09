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

import {
  createProceedWithValidItemsAction,
  defineGroupOperation,
  selectItemsAction,
  toggleAllItemsAction,
  toggleItemSelectionAction,
  unselectAllItemsAction,
} from 'controllers/groupOperations';
import { createBulkDeleteTestItemsAction } from 'controllers/testItem';
import {
  editDefect,
  ignoreInAA,
  includeInAA,
  linkIssue,
  postIssue,
  unlinkIssue,
  validateEditDefect,
  validateIgnoreInAA,
  validateIncludeInAA,
  validateLinkIssue,
  validatePostIssue,
  validateUnlinkIssue,
} from 'controllers/step';
import { NAMESPACE } from '../constants';
import {
  FETCH_CLUSTER_ITEMS_START,
  FETCH_CLUSTER_ITEMS_SUCCESS,
  TOGGLE_CLUSTER_ITEMS,
  FETCH_CLUSTER_ITEMS_ERROR,
  LOAD_MORE_CLUSTER_ITEMS,
  REQUEST_CLUSTER_ITEMS,
} from './constants';

export const requestClusterItemsAction = (payload) => ({
  type: REQUEST_CLUSTER_ITEMS,
  payload,
});
export const fetchClusterItemsStartAction = (payload) => ({
  type: FETCH_CLUSTER_ITEMS_START,
  payload,
});
export const fetchClusterItemsSuccessAction = (payload) => ({
  type: FETCH_CLUSTER_ITEMS_SUCCESS,
  payload,
});
export const fetchClusterItemsErrorAction = (payload) => ({
  type: FETCH_CLUSTER_ITEMS_ERROR,
  payload,
});

export const toggleClusterItemsAction = (payload) => ({
  type: TOGGLE_CLUSTER_ITEMS,
  payload,
});
export const loadMoreClusterItemsAction = (payload) => ({
  type: LOAD_MORE_CLUSTER_ITEMS,
  payload,
});
export const toggleClusterItemSelectionAction = toggleItemSelectionAction(NAMESPACE);
export const selectClusterItemsAction = selectItemsAction(NAMESPACE);
export const unselectAllClusterItemsAction = unselectAllItemsAction(NAMESPACE);
export const toggleAllClusterItemsAction = toggleAllItemsAction(NAMESPACE);

export const editDefectsAction = defineGroupOperation(
  NAMESPACE,
  'edit-defect',
  editDefect,
  validateEditDefect,
);
export const unlinkIssueAction = defineGroupOperation(
  NAMESPACE,
  'unlink-issue',
  unlinkIssue,
  validateUnlinkIssue,
);
export const linkIssueAction = defineGroupOperation(
  NAMESPACE,
  'link-issue',
  linkIssue,
  validateLinkIssue,
);
export const postIssueAction = defineGroupOperation(
  NAMESPACE,
  'post-issue',
  postIssue,
  validatePostIssue,
);
export const ignoreInAutoAnalysisAction = defineGroupOperation(
  NAMESPACE,
  'ignore-in-aa',
  ignoreInAA,
  validateIgnoreInAA,
);

export const includeInAutoAnalysisAction = defineGroupOperation(
  NAMESPACE,
  'include-in-aa',
  includeInAA,
  validateIncludeInAA,
);
export const proceedWithValidItemsAction = createProceedWithValidItemsAction(NAMESPACE);
export const deleteClusterItemsAction = createBulkDeleteTestItemsAction(NAMESPACE);
