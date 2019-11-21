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
import { HISTORY_PAGE, payloadSelector, querySelector } from 'controllers/pages';

const domainSelector = (state) => state.itemsHistory || {};
const groupOperationsSelector = (state) => domainSelector(state).groupOperations;

export const selectedHistoryItemsSelector = createSelectedItemsSelector(groupOperationsSelector);
export const validationErrorsSelector = createValidationErrorsSelector(groupOperationsSelector);
export const lastOperationSelector = createLastOperationSelector(groupOperationsSelector);

export const historySelector = (state) => domainSelector(state).history;

export const historyPaginationSelector = (state) => domainSelector(state).pagination;

export const totalItemsCountSelector = (state) => {
  const pagination = historyPaginationSelector(state);
  return pagination.totalElements;
};

export const loadingSelector = (state) => domainSelector(state).loading;

export const historyPageLinkSelector = createSelector(
  payloadSelector,
  querySelector,
  (payload, query) => ({
    type: HISTORY_PAGE,
    payload,
    query: { ...query },
  }),
);
