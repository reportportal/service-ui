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
import { SORTING_ASC } from 'controllers/sorting';
import { organizationsSelector } from 'controllers/instance/organizations/selectors';
import { SORTING_KEY } from './projects';
import { DEFAULT_PAGINATION } from './projects/constants';

export const organizationSelector = (state) => organizationsSelector(state).organization || {};

export const activeOrganizationSelector = (state) => organizationSelector(state).activeOrganization;

export const activeOrganizationLoadingSelector = (state) =>
  organizationSelector(state).organizationLoading || false;

export const activeOrganizationNameSelector = (state) => activeOrganizationSelector(state)?.name;

export const activeOrganizationIdSelector = (state) => activeOrganizationSelector(state)?.id;

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
