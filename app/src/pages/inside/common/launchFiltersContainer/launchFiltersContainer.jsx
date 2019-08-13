import { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { connect } from 'react-redux';
import {
  launchFiltersSelector,
  changeActiveFilterAction,
  updateFilterConditionsAction,
  activeFilterSelector,
  removeLaunchesFilterAction,
  createFilterAction,
  addFilteringFieldToConditions,
  updateFilterOrdersAction,
} from 'controllers/filter';
import { filterIdSelector } from 'controllers/pages';
import { fetchLaunchesWithParamsAction, fetchLaunchesAction } from 'controllers/launch';
import { debounce } from 'common/utils';
import { hideFilterOnLaunchesAction } from 'controllers/project';
import { isEmptyValue } from 'common/utils/isEmptyValue';
import { PAGE_KEY } from 'controllers/pagination';
import { createFilterQuery } from 'components/filterEntities/containers/utils';
import { SORTING_ASC, SORTING_DESC, formatSortingString, SORTING_KEY } from 'controllers/sorting';
import { ENTITY_START_TIME, ENTITY_NUMBER } from 'components/filterEntities/constants';

@connect(
  (state) => ({
    launchFilters: launchFiltersSelector(state),
    activeFilterId: filterIdSelector(state),
    activeFilter: activeFilterSelector(state),
  }),
  {
    changeActiveFilterAction,
    fetchLaunchesWithParamsAction,
    updateFilterConditionsAction,
    fetchLaunchesAction,
    hideFilterOnLaunchesAction,
    removeLaunchesFilterAction,
    createFilter: createFilterAction,
    updateFilterOrders: updateFilterOrdersAction,
  },
)
export class LaunchFiltersContainer extends Component {
  static propTypes = {
    launchFilters: PropTypes.array,
    activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    activeFilter: PropTypes.object,
    render: PropTypes.func.isRequired,
    changeActiveFilterAction: PropTypes.func,
    fetchLaunchesWithParamsAction: PropTypes.func,
    updateFilterConditionsAction: PropTypes.func,
    fetchLaunchesAction: PropTypes.func,
    hideFilterOnLaunchesAction: PropTypes.func,
    removeLaunchesFilterAction: PropTypes.func,
    createFilter: PropTypes.func,
    onChange: PropTypes.func,
    updateFilterOrders: PropTypes.func,
  };

  static defaultProps = {
    launchFilters: [],
    activeFilter: null,
    activeFilterId: null,
    changeActiveFilterAction: () => {},
    fetchLaunchesWithParamsAction: () => {},
    updateFilterConditionsAction: () => {},
    fetchLaunchesAction: () => {},
    hideFilterOnLaunchesAction: () => {},
    removeLaunchesFilterAction: () => {},
    createFilter: () => {},
    onChange: () => {},
    updateFilterOrders: () => {},
  };

  state = {
    sortingColumn: ENTITY_START_TIME,
    sortingDirection: SORTING_DESC,
  };

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
    if (activeFilter) {
      const currentOrder = activeFilter.orders[0];
      const { sortingColumn, isAsc } = currentOrder;
      return {
        sortingColumn,
        sortingDirection: isAsc ? SORTING_ASC : SORTING_DESC,
      };
    }
    const { sortingColumn, sortingDirection } = this.state;
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
    if (!isEqual(currentFilter, newFilter)) {
      this.fetchLaunches({ [PAGE_KEY]: 1, ...newFilter });
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

  handleFilterSelect = (filterId) => {
    this.props.changeActiveFilterAction(filterId);
  };

  updateFilter = (filterId, conditions) => {
    this.props.updateFilterConditionsAction(filterId, conditions);
  };

  updateSorting = (sortObject) => {
    const { sortingColumn, sortingDirection } = sortObject;
    const { activeFilter, updateFilterOrders, activeFilterId } = this.props;
    const sortingString = formatSortingString([sortingColumn, ENTITY_NUMBER], sortingDirection);
    if (activeFilter) {
      const { orders } = activeFilter;
      const filterSortObject = {
        sortingColumn,
        isAsc: sortingDirection === SORTING_ASC,
      };
      const newOrders = [filterSortObject, ...orders.slice(1)];
      updateFilterOrders(activeFilterId, newOrders);
    } else {
      this.setState((prevState) => ({
        ...prevState,
        ...sortObject,
      }));
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
      onSelectFilter: this.handleFilterSelect,
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
