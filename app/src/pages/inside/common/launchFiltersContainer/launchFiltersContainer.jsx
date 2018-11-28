import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  launchFiltersSelector,
  changeActiveFilterAction,
  updateFilterEntitiesAction,
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
    updateFilterEntitiesAction,
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
    updateFilterEntitiesAction: PropTypes.func,
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
    updateFilterEntitiesAction: () => {},
    fetchLaunchesAction: () => {},
    toggleDisplayFilterOnLaunchesAction: () => {},
    removeFilterAction: () => {},
  };

  getEntities = () => {
    const { activeFilter } = this.props;
    if (!activeFilter) {
      return {};
    }
    return activeFilter.entities.reduce(
      (acc, entity) => ({ ...acc, [entity.filteringField]: entity }),
      {},
    );
  };

  fetchLaunches = debounce((query) => this.props.fetchLaunchesWithParamsAction(query), 1000);

  createFilterQuery = (entities) =>
    Object.keys(entities)
      .filter((id) => !isEmptyValue(entities[id].value))
      .reduce((res, key) => {
        const entity = entities[key];
        return {
          ...res,
          [`filter.${entity.condition}.${key}`]: entity.value,
        };
      }, {});

  handleFilterChange = (entities) => {
    this.fetchLaunches(this.createFilterQuery(entities));
    this.updateFilter(
      this.props.activeFilterId,
      Object.keys(entities).map((key) => ({ ...entities[key], filteringField: key })),
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
    (filterId, entities) => this.props.updateFilterEntitiesAction(filterId, entities),
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
      activeFilterEntities: this.getEntities(),
      onResetFilter: this.props.fetchLaunchesAction,
    });
  }
}
