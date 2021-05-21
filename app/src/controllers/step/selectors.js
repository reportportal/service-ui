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

import { createSelector } from 'reselect';
import {
  createSelectedItemsSelector,
  createValidationErrorsSelector,
  createLastOperationSelector,
} from 'controllers/groupOperations';
import { escapeTestItemStringContent } from 'controllers/testItem/utils';

const domainSelector = (state) => state.step;

const groupOperationsSelector = (state) => domainSelector(state).groupOperations;

export const selectedStepsSelector = createSelectedItemsSelector(groupOperationsSelector);
export const validationErrorsSelector = createValidationErrorsSelector(groupOperationsSelector);
export const lastOperationSelector = createLastOperationSelector(groupOperationsSelector);

const stepsBaseSelectgor = (state) => domainSelector(state).steps || [];
export const stepsSelector = createSelector(stepsBaseSelectgor, escapeTestItemStringContent);
export const stepPaginationSelector = (state) => domainSelector(state).pagination;
