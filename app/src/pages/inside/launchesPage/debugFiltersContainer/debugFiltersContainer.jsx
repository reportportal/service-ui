import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isEqual from 'fast-deep-equal';
import { formatSortingString, SORTING_ASC, SORTING_DESC, SORTING_KEY } from 'controllers/sorting';
import { ENTITY_NUMBER, ENTITY_START_TIME } from 'components/filterEntities/constants';
import { debounce } from 'common/utils';
import { createFilterQuery } from 'components/filterEntities/containers/utils';
import { PAGE_KEY } from 'controllers/pagination';
import { fetchLaunchesWithParamsAction } from 'controllers/launch';

export class DebugFiltersContainer extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    fetchLaunchesWithParams: PropTypes.func,
  };

  static defaultProps = {
    fetchLaunchesWithParams: () => {},
  };

  state = {
    conditions: {},
    sortingColumn: ENTITY_START_TIME,
    sortingDirection: SORTING_DESC,
  };

  fetchLaunches = debounce((query) => this.props.fetchLaunchesWithParams(query), 1000);

  handleFilterChange = (conditions) => {
    const newQuery = createFilterQuery(conditions);
    const oldQuery = createFilterQuery(this.state.conditions);
    if (!isEqual(oldQuery, newQuery)) {
      this.fetchLaunches({ [PAGE_KEY]: 1, ...newQuery });
    }
    this.setState({ conditions });
  };

  updateSorting = (sortingObject) => {
    const { sortingColumn, sortingDirection } = sortingObject;

    const sortingString = formatSortingString([sortingColumn, ENTITY_NUMBER], sortingDirection);
    this.setState({
      sortingColumn,
      sortingDirection,
    });
    this.props.fetchLaunchesWithParams({
      [SORTING_KEY]: sortingString,
      ...createFilterQuery(this.state.conditions),
    });
  };

  handleSortingChange = (newSortingColumn) => {
    const { sortingColumn, sortingDirection } = this.state;
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
    const { conditions, sortingColumn, sortingDirection } = this.state;
    const { fetchLaunchesWithParams, render, ...rest } = this.props;
    return render({
      activeFilterConditions: conditions,
      sortingColumn,
      sortingDirection,
      onChangeFilter: this.handleFilterChange,
      onChangeSorting: this.handleSortingChange,
      ...rest,
    });
  }
}

export const ConnectedDebugFiltersContainer = connect(null, {
  fetchLaunchesWithParams: fetchLaunchesWithParamsAction,
})(DebugFiltersContainer);
