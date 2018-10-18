import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  launchFiltersSelector,
  changeActiveFilterAction,
  updateFilterEntitiesAction,
  activeFilterSelector,
} from 'controllers/filter';
import { filterIdSelector } from 'controllers/pages';
import { fetchLaunchesWithParamsAction } from 'controllers/launch';
import { debounce } from 'common/utils';

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
  },
)
export class LaunchFiltersContainer extends Component {
  static propTypes = {
    launchFilters: PropTypes.array,
    activeFilterId: PropTypes.string,
    activeFilter: PropTypes.object,
    render: PropTypes.func.isRequired,
    changeActiveFilterAction: PropTypes.func,
    fetchLaunchesWithParamsAction: PropTypes.func,
    updateFilterEntitiesAction: PropTypes.func,
  };

  static defaultProps = {
    launchFilters: [],
    activeFilter: null,
    activeFilterId: null,
    changeActiveFilterAction: () => {},
    fetchLaunchesWithParamsAction: () => {},
    updateFilterEntitiesAction: () => {},
  };

  getEntities = () => {
    const { activeFilter } = this.props;
    if (!activeFilter) {
      return {};
    }
    return activeFilter.entities.reduce(
      (acc, entity) => ({ ...acc, [entity.filtering_field]: entity }),
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
      Object.keys(entities).map((key) => ({ ...entities[key], filtering_field: key })),
    );
  };

  handleFilterSelect = (filterId) => {
    this.props.changeActiveFilterAction(filterId);
  };

  handleFilterRemove = (filterId) => {
    console.log('filter:remove', filterId); // TODO
  };

  updateFilter = debounce(
    (filterId, entities) => this.props.updateFilterEntitiesAction(filterId, entities),
    1000,
  );

  render() {
    const { render, launchFilters, activeFilterId } = this.props;
    return render({
      launchFilters,
      activeFilterId,
      onSelectFilter: this.handleFilterSelect,
      onRemoveFilter: this.handleFilterRemove,
      onChangeFilter: this.handleFilterChange,
      activeFilterEntities: this.getEntities(),
    });
  }
}
