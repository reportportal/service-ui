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

import { createSelector } from 'reselect';
import { createQueryParametersSelector } from 'controllers/pages';
import { getAlternativePaginationAndSortParams, PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { SORTING_KEY } from 'controllers/organizations/projects';
import { DEFAULT_PAGINATION } from 'controllers/organizations/projects/constants';
import { SORTING_ASC } from 'controllers/sorting';

export const organizationsSelector = (state) => state.organizations || {};

export const organizationsListSelector = (state) => organizationsSelector(state).list || [];

export const organizationsListLoadingSelector = (state) => organizationsSelector(state).listLoading;

export const createParametersSelector = ({ defaultPagination, defaultSorting, sortingKey } = {}) =>
  createSelector(
    createQueryParametersSelector({
      defaultPagination,
      defaultSorting,
      sortingKey,
    }),
    ({ [SIZE_KEY]: limit, [SORTING_KEY]: sort, [PAGE_KEY]: pageNumber, ...rest }) => {
      return { ...getAlternativePaginationAndSortParams(sort, limit, pageNumber), ...rest };
    },
  );

export const querySelector = createParametersSelector({
  defaultPagination: DEFAULT_PAGINATION,
  defaultDirection: SORTING_ASC,
  sortingKey: SORTING_KEY,
});
