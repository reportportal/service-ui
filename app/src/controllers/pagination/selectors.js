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
import { createQueryParametersSelector } from 'controllers/pages';
import { SORTING_KEY } from 'controllers/sorting';
import { DEFAULT_PAGINATION, PAGE_KEY, SIZE_KEY } from './constants';
import { getAlternativePaginationAndSortParams } from './utils';

export const totalElementsSelector = (paginationSelector) => (state) =>
  paginationSelector(state).totalElements;
export const totalPagesSelector = (paginationSelector) => (state) =>
  paginationSelector(state).totalPages;

export const defaultPaginationSelector = () => DEFAULT_PAGINATION;

export const createParametersSelector = ({
  defaultPagination,
  defaultSorting,
  sortingKey,
  alternativeNamespace,
} = {}) =>
  createSelector(
    createQueryParametersSelector({
      defaultPagination,
      defaultSorting,
      sortingKey,
      alternativeNamespace,
    }),
    ({ [SIZE_KEY]: limit, [SORTING_KEY]: sort, [PAGE_KEY]: pageNumber, ...rest }) => {
      return { ...getAlternativePaginationAndSortParams(sort, limit, pageNumber), ...rest };
    },
  );
