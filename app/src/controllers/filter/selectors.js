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
import isEqual from 'fast-deep-equal';
import { createQueryParametersSelector, filterIdSelector } from 'controllers/pages';
import { userFiltersSelector } from '../project/selectors';

const domainSelector = (state) => state.filters || {};

export const filtersPaginationSelector = (state) => domainSelector(state).pagination;
export const filtersSelector = (state) => domainSelector(state).filters;
export const loadingSelector = (state) => domainSelector(state).loading || false;
export const pageLoadingSelector = (state) => domainSelector(state).pageLoading;
export const querySelector = createQueryParametersSelector({
  defaultSorting: 'name',
});
export const launchFiltersSelector = (state) => domainSelector(state).launchesFilters || [];
export const launchFiltersReadySelector = (state) => domainSelector(state).launchesFiltersReady;
export const activeFilterSelector = createSelector(
  launchFiltersSelector,
  filterIdSelector,
  (filters, filterId) => filters.find((filter) => filter.id === filterId),
);

export const unsavedFilterIdsSelector = createSelector(
  launchFiltersSelector,
  userFiltersSelector,
  (filters, savedFilters) =>
    filters
      .map((filter) => ({
        ...filter,
        conditions: filter.conditions.filter(
          (condition) => !(condition.filteringField === 'name' && condition.value === ''),
        ),
      }))
      .filter((filter) => {
        if (filter.id >= 0) {
          const savedFilter = savedFilters.find((item) => item.id === filter.id);
          return savedFilter && !isEqual(filter, savedFilter);
        }
        return filter.id < 0;
      })
      .map((item) => item.id),
);

export const dirtyFilterIdsSelector = createSelector(
  launchFiltersSelector,
  userFiltersSelector,
  (filters, savedFilters) =>
    filters
      .filter((filter) => {
        const savedFilter = savedFilters.find((item) => item.id === filter.id);
        return savedFilter && !isEqual(filter, savedFilter);
      })
      .map((item) => item.id),
);
