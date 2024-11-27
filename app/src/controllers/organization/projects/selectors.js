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
  createQueryParametersSelector,
} from 'controllers/pages/selectors';
import { SORTING_ASC } from 'controllers/sorting';
import { createSelector } from 'reselect';
import { getAlternativePaginationAndSortParams, PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { getAppliedFilters } from 'controllers/instance/events/utils';
import { organizationSelector } from '../selectors';
import { DEFAULT_PAGINATION, FILTERED_PROJECTS, NAMESPACE, SORTING_KEY } from './constants';

const domainSelector = (state) => organizationSelector(state).projects || {};

export const projectsPaginationSelector = (state) => domainSelector(state).pagination;
export const projectsSelector = (state) => domainSelector(state).projects;
export const loadingSelector = (state) => domainSelector(state).loading || false;

export const querySelector = createAlternativeQueryParametersSelector({
  defaultPagination: DEFAULT_PAGINATION,
  defaultSorting: SORTING_ASC,
  sortingKey: SORTING_KEY,
  namespace: NAMESPACE,
});

const createFilterQuerySelector = ({
  defaultPagination,
  defaultSorting,
  sortingKey,
  namespace,
} = {}) =>
  createSelector(
    createQueryParametersSelector({
      defaultPagination,
      defaultSorting,
      sortingKey,
      namespace,
    }),
    ({ [SIZE_KEY]: limit, [SORTING_KEY]: sort, [PAGE_KEY]: pageNumber, ...rest }) => {
      return {
        ...getAlternativePaginationAndSortParams(sort, limit, pageNumber),
        search_criteria: getAppliedFilters(rest)?.search_criterias,
      };
    },
  );

export const filterQuerySelector = createFilterQuerySelector({
  defaultPagination: DEFAULT_PAGINATION,
  defaultSorting: SORTING_ASC,
  sortingKey: SORTING_KEY,
  namespace: FILTERED_PROJECTS,
});
