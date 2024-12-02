/*
 * Copyright 2024 EPAM Systems
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
  createAlternativeQueryParametersSelector,
  createFilterQuerySelector,
} from 'controllers/pages/selectors';
import { SORTING_ASC } from 'controllers/sorting';
import { NAMESPACE, DEFAULT_PAGINATION, SORTING_KEY, FILTERED_ORGANIZATIONS } from './constants';

export const organizationsSelector = (state) => state.organizations || {};

export const organizationsListSelector = (state) => organizationsSelector(state).list || [];

export const organizationsListLoadingSelector = (state) => organizationsSelector(state).listLoading;

export const organizationsListPaginationSelector = (state) =>
  organizationsSelector(state).pagination;

export const querySelector = createAlternativeQueryParametersSelector({
  defaultPagination: DEFAULT_PAGINATION,
  defaultSorting: SORTING_ASC,
  sortingKey: SORTING_KEY,
  namespace: NAMESPACE,
});

export const filterQuerySelector = createFilterQuerySelector({
  defaultPagination: DEFAULT_PAGINATION,
  defaultSorting: SORTING_ASC,
  sortingKey: SORTING_KEY,
  namespace: FILTERED_ORGANIZATIONS,
});
