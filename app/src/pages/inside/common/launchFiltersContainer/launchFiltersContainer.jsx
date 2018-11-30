import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  launchFiltersSelector,
  changeActiveFilterAction,
  updateFilterConditionsAction,
  activeFilterSelector,
  removeFilterAction,
} from 'controllers/filter';
import { filterIdSelector } from 'controllers/pages';
import { fetchLaunchesWithParamsAction, fetchLaunchesAction } from 'controllers/launch';
import { debounce } from 'common/utils';
import { toggleDisplayFilterOnLaunchesAction } from 'controllers/project';

const isEmptyValue = (value) => value === '' || value === null || value === undefined;

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
    toggleDisplayFilterOnLaunchesAction,
    removeFilterAction,
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
    toggleDisplayFilterOnLaunchesAction: PropTypes.func,
    removeFilterAction: PropTypes.func,
  };

  static defaultProps = {
    launchFilters: [],
    activeFilter: null,
    activeFilterId: null,
    changeActiveFilterAction: () => {},
    fetchLaunchesWithParamsAction: () => {},
    updateFilterConditionsAction: () => {},
    fetchLaunchesAction: () => {},
    toggleDisplayFilterOnLaunchesAction: () => {},
    removeFilterAction: () => {},
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

  fetchLaunches = debounce((query) => this.props.fetchLaunchesWithParamsAction(query), 1000);

  createFilterQuery = (conditions) =>
    Object.keys(conditions)
      .filter((id) => !isEmptyValue(conditions[id].value))
      .reduce((res, key) => {
        const condition = conditions[key];
        return {
          ...res,
          [`filter.${condition.condition}.${key}`]: condition.value,
        };
      }, {});

  handleFilterChange = (conditions) => {
    this.fetchLaunches(this.createFilterQuery(conditions));
    this.updateFilter(
      this.props.activeFilterId,
      Object.keys(conditions).map((key) => ({ ...conditions[key], filteringField: key })),
    );
  };

  handleFilterRemove = (filterId) => {
    if (filterId >= 0) {
      this.props.toggleDisplayFilterOnLaunchesAction(filterId);
    }
    this.props.removeFilterAction(filterId);
  };

  handleFilterSelect = (filterId) => {
    this.props.changeActiveFilterAction(filterId);
  };

  updateFilter = debounce(
    (filterId, conditions) => this.props.updateFilterConditionsAction(filterId, conditions),
    1000,
  );

  render() {
    const { render, launchFilters, activeFilterId, activeFilter } = this.props;
    return render({
      launchFilters,
      activeFilterId,
      activeFilter,
      onSelectFilter: this.handleFilterSelect,
      onRemoveFilter: this.handleFilterRemove,
      onChangeFilter: this.handleFilterChange,
      activeFilterConditions: this.getConditions(),
      onResetFilter: this.props.fetchLaunchesAction,
    });
  }
}
