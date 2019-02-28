import { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { showModalAction } from 'controllers/modal';
import {
  updateFilterAction,
  resetFilterAction,
  unsavedFilterIdsSelector,
  createFilterAction,
  saveNewFilterAction,
  changeActiveFilterAction,
} from 'controllers/filter';
import { changeLaunchDistinctAction, launchDistinctSelector } from 'controllers/launch';
import { GhostButton } from 'components/buttons/ghostButton';
import { levelSelector } from 'controllers/testItem';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import AddFilterIcon from 'common/img/add-filter-inline.svg';
import { FilterList } from './filterList';
import { FiltersActionBar } from './filtersActionBar';
import { ExpandToggler } from './expandToggler';
import { filterShape } from './propTypes';
import { AllLatestDropdown } from './allLatestDropdown';
import styles from './launchFiltersToolbar.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    unsavedFilterIds: unsavedFilterIdsSelector(state),
    launchDistinct: launchDistinctSelector(state),
    level: levelSelector(state),
  }),
  {
    showModal: showModalAction,
    updateFilter: updateFilterAction,
    resetFilter: resetFilterAction,
    createFilter: createFilterAction,
    saveNewFilter: saveNewFilterAction,
    changeLaunchDistinct: changeLaunchDistinctAction,
    redirectToLaunches: changeActiveFilterAction,
  },
)
export class LaunchFiltersToolbar extends Component {
  static propTypes = {
    filters: PropTypes.arrayOf(filterShape),
    activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    activeFilter: PropTypes.object,
    unsavedFilterIds: PropTypes.array,
    onSelectFilter: PropTypes.func,
    onRemoveFilter: PropTypes.func,
    onFilterAdd: PropTypes.func,
    onFilterRemove: PropTypes.func,
    onFilterValidate: PropTypes.func,
    onFilterChange: PropTypes.func,
    filterErrors: PropTypes.object,
    filterEntities: PropTypes.array,
    showModal: PropTypes.func,
    updateFilter: PropTypes.func,
    resetFilter: PropTypes.func,
    onResetFilter: PropTypes.func,
    createFilter: PropTypes.func,
    saveNewFilter: PropTypes.func,
    redirectToLaunches: PropTypes.func,
    changeLaunchDistinct: PropTypes.func,
    launchDistinct: PropTypes.string,
    level: PropTypes.string,
  };

  static defaultProps = {
    filters: [],
    activeFilterId: null,
    activeFilter: null,
    unsavedFilterIds: [],
    onSelectFilter: () => {},
    onRemoveFilter: () => {},
    onFilterAdd: () => {},
    onFilterRemove: () => {},
    onFilterValidate: () => {},
    onFilterChange: () => {},
    filterErrors: {},
    filterEntities: [],
    showModal: () => {},
    updateFilter: () => {},
    resetFilter: () => {},
    onResetFilter: () => {},
    createFilter: () => {},
    saveNewFilter: () => {},
    redirectToLaunches: () => {},
    changeLaunchDistinct: () => {},
    launchDistinct: '',
    level: '',
  };

  state = {
    expanded: true,
  };

  handleFilterClone = () => {
    const { activeFilter, createFilter } = this.props;
    createFilter(activeFilter);
  };

  handleFilterCreate = () => {
    this.props.createFilter();
  };

  handleFilterEdit = () => {
    const { showModal, activeFilter, updateFilter } = this.props;
    showModal({
      id: 'filterEditModal',
      data: {
        filter: activeFilter,
        onEdit: updateFilter,
      },
    });
  };

  handleFilterReset = () => {
    const { activeFilter, resetFilter, onResetFilter } = this.props;
    resetFilter(activeFilter.id);
    onResetFilter();
  };

  redirectToLaunches = () => this.props.redirectToLaunches(this.props.launchDistinct);

  updateActiveFilter = () => {
    const { activeFilter, updateFilter, activeFilterId, showModal, saveNewFilter } = this.props;
    if (activeFilterId < 0) {
      showModal({
        id: 'filterEditModal',
        data: {
          creationMode: true,
          filter: activeFilter,
          onEdit: saveNewFilter,
        },
      });
    } else {
      updateFilter(activeFilter);
    }
  };

  toggleExpand = () => this.setState({ expanded: !this.state.expanded });

  render() {
    const {
      filters,
      activeFilterId,
      launchDistinct,
      activeFilter,
      onSelectFilter,
      onRemoveFilter,
      filterEntities,
      filterErrors,
      onFilterChange,
      onFilterValidate,
      onFilterAdd,
      onFilterRemove,
      changeLaunchDistinct,
      unsavedFilterIds,
      level,
    } = this.props;
    const isFilterUnsaved = unsavedFilterIds.indexOf(activeFilterId) !== -1;
    const isNewFilter = activeFilterId < 0;
    return (
      <div className={cx('launch-filters-toolbar')}>
        <div className={cx('filter-tickets-row')}>
          <div className={cx('all-latest-switcher')}>
            <AllLatestDropdown
              activeFilterId={activeFilterId}
              value={launchDistinct}
              onClick={this.redirectToLaunches}
              onChange={changeLaunchDistinct}
            />
          </div>
          <div className={cx('separator')} />
          <div className={cx('add-filter-button')}>
            <GhostButton icon={AddFilterIcon} onClick={this.handleFilterCreate}>
              <FormattedMessage id="LaunchFiltersToolbar.addFilter" defaultMessage="Add filter" />
            </GhostButton>
          </div>
          <div className={cx('filter-tickets-container')}>
            <FilterList
              filters={filters}
              activeFilterId={activeFilterId}
              unsavedFilterIds={unsavedFilterIds}
              onSelectFilter={onSelectFilter}
              onRemoveFilter={onRemoveFilter}
            />
          </div>
          {!!activeFilter &&
            !level && (
              <ExpandToggler expanded={this.state.expanded} onToggleExpand={this.toggleExpand} />
            )}
        </div>
        {this.state.expanded &&
          !level &&
          !!activeFilter && (
            <div className={cx('filter-controls-container')}>
              <div className={cx('filter-entities-container')}>
                <EntitiesGroup
                  onChange={onFilterChange}
                  onValidate={onFilterValidate}
                  onRemove={onFilterRemove}
                  onAdd={onFilterAdd}
                  errors={filterErrors}
                  entities={filterEntities}
                />
              </div>
              <FiltersActionBar
                unsaved={isFilterUnsaved}
                discardDisabled={!isFilterUnsaved}
                saveDisabled={!isFilterUnsaved}
                cloneDisabled={isFilterUnsaved}
                editDisabled={isFilterUnsaved || isNewFilter}
                onDiscard={this.handleFilterReset}
                onEdit={this.handleFilterEdit}
                onSave={this.updateActiveFilter}
                onClone={this.handleFilterClone}
                filter={activeFilter}
              />
            </div>
          )}
      </div>
    );
  }
}
