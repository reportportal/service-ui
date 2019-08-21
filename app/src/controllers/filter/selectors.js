import { createSelector } from 'reselect';
import isEqual from 'fast-deep-equal';
import { createQueryParametersSelector, filterIdSelector } from 'controllers/pages';
import { userFiltersSelector } from '../project/selectors';
import { DEFAULT_PAGINATION } from './constants';

const domainSelector = (state) => state.filters || {};

export const filtersPaginationSelector = (state) => domainSelector(state).pagination;
export const filtersSelector = (state) => domainSelector(state).filters;
export const loadingSelector = (state) => domainSelector(state).loading || false;
export const querySelector = createQueryParametersSelector({
  defaultPagination: DEFAULT_PAGINATION,
  defaultSorting: 'name',
});
export const launchFiltersSelector = (state) => domainSelector(state).launchesFilters || [];
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
