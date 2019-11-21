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
  createProceedWithValidItemsAction,
  selectItemsAction,
  toggleItemSelectionAction,
  unselectAllItemsAction,
  defineGroupOperation,
} from 'controllers/groupOperations';
import { NAMESPACE } from './constants';
import {
  validateIgnoreInAA,
  validateIncludeInAA,
  validateUnlinkIssue,
  validateEditDefect,
  validateLinkIssue,
  validatePostIssue,
} from './actionValidators';
import { ignoreInAA, editDefect, includeInAA, linkIssue, postIssue, unlinkIssue } from './utils';

export const toggleStepSelectionAction = toggleItemSelectionAction(NAMESPACE);
export const selectStepsAction = selectItemsAction(NAMESPACE);
export const unselectAllStepsAction = unselectAllItemsAction(NAMESPACE);

export const proceedWithValidItemsAction = createProceedWithValidItemsAction(NAMESPACE);

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

export const unlinkIssueAction = defineGroupOperation(
  NAMESPACE,
  'unlink-issue',
  unlinkIssue,
  validateUnlinkIssue,
);

export const editDefectsAction = defineGroupOperation(
  NAMESPACE,
  'edit-defect',
  editDefect,
  validateEditDefect,
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
