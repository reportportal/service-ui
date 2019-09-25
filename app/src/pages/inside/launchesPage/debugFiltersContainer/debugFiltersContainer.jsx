import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isEqual from 'fast-deep-equal';
import { formatSortingString, SORTING_ASC, SORTING_DESC, SORTING_KEY } from 'controllers/sorting';
import { ENTITY_NUMBER } from 'components/filterEntities/constants';
import { debounce } from 'common/utils';
import { createFilterQuery } from 'components/filterEntities/containers/utils';
import { PAGE_KEY } from 'controllers/pagination';
import {
  fetchLaunchesWithParamsAction,
  debugLocalSortingSelector,
  resetDebugLocalSortingAction,
  updateDebugLocalSortingAction,
  debugLocalFilterSelector,
  updateDebugLocalFilterAction,
  resetDebugLocalFilterAction,
} from 'controllers/launch';

export class DebugFiltersContainer extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    fetchLaunchesWithParams: PropTypes.func,
    localSorting: PropTypes.object,
    updateLocalSorting: PropTypes.func,
    resetLocalSorting: PropTypes.func,
    updateDebugLocalFilter: PropTypes.func,
    resetDebugLocalFilter: PropTypes.func,
    localFilter: PropTypes.object,
  };

  static defaultProps = {
    fetchLaunchesWithParams: () => {},
    localSorting: {},
    updateLocalSorting: () => {},
    resetLocalSorting: () => {},
    updateDebugLocalFilter: () => {},
    resetDebugLocalFilter: () => {},
    localFilter: {},
  };

  state = {
    conditions: {},
  };

  componentWillUnmount() {
    this.props.resetLocalSorting();
    this.props.resetDebugLocalFilter();
  }

  getSortingString = (sortingObject) => {
    const { sortingColumn, sortingDirection } = sortingObject;
    return formatSortingString([sortingColumn, ENTITY_NUMBER], sortingDirection);
  };

  fetchLaunches = debounce((query) => this.props.fetchLaunchesWithParams(query), 1000);

  handleFilterChange = (conditions) => {
    const newQuery = createFilterQuery(conditions);
    const oldQuery = createFilterQuery(this.props.localFilter);
    if (!isEqual(oldQuery, newQuery)) {
      this.fetchLaunches({
        [PAGE_KEY]: 1,
        [SORTING_KEY]: this.getSortingString(this.props.localSorting),
        ...newQuery,
      });
    }
    this.props.updateDebugLocalFilter(conditions);
  };

  updateSorting = (sortingObject) => {
    const { sortingColumn, sortingDirection } = sortingObject;

    this.props.updateLocalSorting({
      sortingColumn,
      sortingDirection,
    });
    this.props.fetchLaunchesWithParams({
      [SORTING_KEY]: this.getSortingString(sortingObject),
      ...createFilterQuery(this.props.localFilter),
    });
  };

  handleSortingChange = (newSortingColumn) => {
    const { sortingColumn, sortingDirection } = this.props.localSorting;
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
    const {
      fetchLaunchesWithParams,
      localSorting,
      localFilter,
      render,
      updateLocalSorting,
      resetLocalSorting,
      updateDebugLocalFilter,
      resetDebugLocalFilter,
      ...rest
    } = this.props;
    return render({
      activeFilterConditions: localFilter,
      sortingColumn: localSorting.sortingColumn,
      sortingDirection: localSorting.sortingDirection,
      onChangeFilter: this.handleFilterChange,
      onChangeSorting: this.handleSortingChange,
      ...rest,
    });
  }
}

export const ConnectedDebugFiltersContainer = connect(
  (state) => ({
    localSorting: debugLocalSortingSelector(state),
    localFilter: debugLocalFilterSelector(state),
  }),
  {
    fetchLaunchesWithParams: fetchLaunchesWithParamsAction,
    updateLocalSorting: updateDebugLocalSortingAction,
    resetLocalSorting: resetDebugLocalSortingAction,
    updateDebugLocalFilter: updateDebugLocalFilterAction,
    resetDebugLocalFilter: resetDebugLocalFilterAction,
  },
)(DebugFiltersContainer);
