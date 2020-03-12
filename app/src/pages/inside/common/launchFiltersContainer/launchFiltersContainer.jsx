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

import { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { connect } from 'react-redux';
import {
  launchFiltersSelector,
  updateFilterConditionsAction,
  activeFilterSelector,
  removeLaunchesFilterAction,
  createFilterAction,
  addFilteringFieldToConditions,
  updateFilterOrdersAction,
} from 'controllers/filter';
import { filterIdSelector } from 'controllers/pages';
import {
  fetchLaunchesWithParamsAction,
  fetchLaunchesAction,
  localSortingSelector,
  updateLocalSortingAction,
  resetLocalSortingAction,
} from 'controllers/launch';
import { debounce } from 'common/utils';
import { hideFilterOnLaunchesAction } from 'controllers/project';
import { isEmptyValue } from 'common/utils/isEmptyValue';
import { PAGE_KEY } from 'controllers/pagination';
import { createFilterQuery } from 'components/filterEntities/containers/utils';
import { SORTING_ASC, SORTING_DESC, formatSortingString, SORTING_KEY } from 'controllers/sorting';
import { ENTITY_NUMBER } from 'components/filterEntities/constants';

@connect(
  (state) => ({
    launchFilters: launchFiltersSelector(state),
    activeFilterId: filterIdSelector(state),
    activeFilter: activeFilterSelector(state),
    localSorting: localSortingSelector(state),
  }),
  {
    fetchLaunchesWithParamsAction,
    updateFilterConditionsAction,
    fetchLaunchesAction,
    hideFilterOnLaunchesAction,
    removeLaunchesFilterAction,
    createFilter: createFilterAction,
    updateFilterOrders: updateFilterOrdersAction,
    updateLocalSorting: updateLocalSortingAction,
    resetLocalSorting: resetLocalSortingAction,
  },
)
export class LaunchFiltersContainer extends Component {
  static propTypes = {
    launchFilters: PropTypes.array,
    activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    activeFilter: PropTypes.object,
    render: PropTypes.func.isRequired,
    fetchLaunchesWithParamsAction: PropTypes.func,
    updateFilterConditionsAction: PropTypes.func,
    fetchLaunchesAction: PropTypes.func,
    hideFilterOnLaunchesAction: PropTypes.func,
    removeLaunchesFilterAction: PropTypes.func,
    createFilter: PropTypes.func,
    onChange: PropTypes.func,
    updateFilterOrders: PropTypes.func,
    localSorting: PropTypes.object,
    updateLocalSorting: PropTypes.func,
    resetLocalSorting: PropTypes.func,
  };

  static defaultProps = {
    launchFilters: [],
    activeFilter: null,
    activeFilterId: null,
    fetchLaunchesWithParamsAction: () => {},
    updateFilterConditionsAction: () => {},
    fetchLaunchesAction: () => {},
    hideFilterOnLaunchesAction: () => {},
    removeLaunchesFilterAction: () => {},
    createFilter: () => {},
    onChange: () => {},
    updateFilterOrders: () => {},
    localSorting: {},
    updateLocalSorting: () => {},
    resetLocalSorting: () => {},
  };

  componentWillUnmount() {
    this.props.resetLocalSorting();
  }

  getConditions = () => {
    const { activeFilter } = this.props;
    if (!activeFilter) {
      return {};
    }
    return activeFilter.conditions.reduce(
      (acc, condition) => ({ ...acc, [condition.filteringField]: condition }),
      {},
    );
  };

  getSortingParams = () => {
    const { activeFilter } = this.props;
    if (activeFilter && activeFilter.orders && activeFilter.orders.length > 0) {
      const currentOrder =
        activeFilter.orders.find((v) => v.sortingColumn !== ENTITY_NUMBER) ||
        activeFilter.orders[0];
      const { sortingColumn, isAsc } = currentOrder;
      return {
        sortingColumn,
        sortingDirection: isAsc ? SORTING_ASC : SORTING_DESC,
      };
    }
    const {
      localSorting: { sortingColumn, sortingDirection },
    } = this.props;
    return {
      sortingColumn,
      sortingDirection,
    };
  };

  fetchLaunches = debounce((query) => this.props.fetchLaunchesWithParamsAction(query), 1000);

  createQuery = (conditions) =>
    createFilterQuery(
      Object.keys(conditions)
        .filter((id) => !isEmptyValue(conditions[id].value))
        .reduce((res, key) => {
          const condition = conditions[key];
          return {
            ...res,
            [condition.filteringField]: condition,
          };
        }, {}),
    );

  handleFilterChange = (conditions) => {
    const conditionsWithFilteringField = addFilteringFieldToConditions(conditions);
    const newFilter = this.createQuery(conditionsWithFilteringField);
    const currentFilter = this.createQuery(this.getConditions());
    const { sortingColumn, sortingDirection } = this.getSortingParams();
    const sortingString = formatSortingString([sortingColumn, ENTITY_NUMBER], sortingDirection);
    if (!isEqual(currentFilter, newFilter)) {
      this.fetchLaunches({ [PAGE_KEY]: 1, [SORTING_KEY]: sortingString, ...newFilter });
    }
    if (this.props.activeFilter) {
      this.updateFilter(this.props.activeFilterId, conditionsWithFilteringField);
    } else {
      this.props.createFilter({
        conditions: conditionsWithFilteringField,
      });
    }

    this.props.onChange(conditions);
  };

  handleFilterRemove = (filter) => {
    if (filter.id >= 0) {
      this.props.hideFilterOnLaunchesAction(filter);
    }
    this.props.removeLaunchesFilterAction(filter.id);
  };

  updateFilter = (filterId, conditions) => {
    this.props.updateFilterConditionsAction(filterId, conditions);
  };

  updateSorting = (sortObject) => {
    const { sortingColumn, sortingDirection } = sortObject;
    const { activeFilter, updateFilterOrders, activeFilterId, updateLocalSorting } = this.props;
    const sortingString = formatSortingString([sortingColumn, ENTITY_NUMBER], sortingDirection);
    if (activeFilter) {
      const { orders } = activeFilter;
      const filterSortObject = {
        sortingColumn,
        isAsc: sortingDirection === SORTING_ASC,
      };
      const newOrders = [filterSortObject];
      const numberColumnIndex = orders.findIndex((o) => o.sortingColumn === ENTITY_NUMBER);
      if (numberColumnIndex >= 0) {
        newOrders.push(orders[numberColumnIndex]);
      }
      updateFilterOrders(activeFilterId, newOrders);
    } else {
      updateLocalSorting(sortObject);
    }
    this.props.fetchLaunchesWithParamsAction({
      [SORTING_KEY]: sortingString,
      ...this.createQuery(this.getConditions()),
    });
  };

  handleSortingChange = (newSortingColumn) => {
    const { sortingColumn, sortingDirection } = this.getSortingParams();
    const newSortingDirection =
      sortingColumn === newSortingColumn
        ? this.toggleSortingDirection(sortingDirection)
        : SORTING_ASC;
    const sortObject = {
      sortingColumn: newSortingColumn,
      sortingDirection: newSortingDirection,
    };
    this.updateSorting(sortObject);
  };

  toggleSortingDirection = (sortingDirection) =>
    sortingDirection === SORTING_DESC ? SORTING_ASC : SORTING_DESC;

  render() {
    const { render, launchFilters, activeFilterId, activeFilter } = this.props;
    const { sortingColumn, sortingDirection } = this.getSortingParams();
    return render({
      launchFilters,
      activeFilterId,
      activeFilter,
      onRemoveFilter: this.handleFilterRemove,
      onChangeFilter: this.handleFilterChange,
      activeFilterConditions: this.getConditions(),
      onResetFilter: this.props.fetchLaunchesAction,
      sortingColumn,
      sortingDirection,
      onChangeSorting: this.handleSortingChange,
    });
  }
}
