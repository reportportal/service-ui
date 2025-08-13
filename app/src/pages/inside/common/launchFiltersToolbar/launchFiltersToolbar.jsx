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
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { showModalAction } from 'controllers/modal';
import {
  updateFilterAction,
  resetFilterAction,
  unsavedFilterIdsSelector,
  createFilterAction,
  saveNewFilterAction,
  changeActiveFilterAction,
  dirtyFilterIdsSelector,
  removeLaunchesFilterAction,
} from 'controllers/filter';
import { changeLaunchDistinctAction, launchDistinctSelector } from 'controllers/launch';
import { isEmptyObject, isEmptyValue } from 'common/utils';
import { GhostButton } from 'components/buttons/ghostButton';
import { levelSelector } from 'controllers/testItem';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import AddFilterIcon from 'common/img/add-filter-inline.svg';
import FilterIcon from 'common/img/newIcons/filter-inline.svg';
import { ClearIcon } from '@reportportal/ui-kit';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { canWorkWithFilters } from 'common/utils/permissions';
import { userRolesType } from 'common/constants/projectRoles';
import { userRolesSelector } from 'controllers/pages';
import { CUSTOM_FILTER_ID } from 'common/constants/reservedFilterIds';
import { FilterList } from './filterList';
import { FiltersActionBar } from './filtersActionBar';
import { ExpandToggler } from './expandToggler';
import { filterShape } from './propTypes';
import { AllLatestDropdown } from './allLatestDropdown';
import styles from './launchFiltersToolbar.scss';

const cx = classNames.bind(styles);

@track()
@connect(
  (state) => ({
    unsavedFilterIds: unsavedFilterIdsSelector(state),
    dirtyFilterIds: dirtyFilterIdsSelector(state),
    launchDistinct: launchDistinctSelector(state),
    userRoles: userRolesSelector(state),
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
    removeLaunchesFilter: removeLaunchesFilterAction,
  },
)
export class LaunchFiltersToolbar extends Component {
  static propTypes = {
    filters: PropTypes.arrayOf(filterShape),
    activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    activeFilter: PropTypes.object,
    unsavedFilterIds: PropTypes.array,
    dirtyFilterIds: PropTypes.array,
    onRemoveFilter: PropTypes.func,
    onFilterAdd: PropTypes.func,
    onFilterRemove: PropTypes.func,
    onFilterValidate: PropTypes.func,
    onFilterChange: PropTypes.func,
    onChangeSorting: PropTypes.func,
    sortingString: PropTypes.string,
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
    intl: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    userRoles: userRolesType,
    removeLaunchesFilter: PropTypes.func,
  };

  static defaultProps = {
    filters: [],
    activeFilterId: null,
    activeFilter: null,
    unsavedFilterIds: [],
    dirtyFilterIds: [],
    onRemoveFilter: () => {},
    onFilterAdd: () => {},
    onFilterRemove: () => {},
    onFilterValidate: () => {},
    onFilterChange: () => {},
    onChangeSorting: () => {},
    sortingString: '',
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
    userRoles: {},
  };

  state = {
    expanded: true,
    isFilterCreate: false,
  };

  handleFilterClone = () => {
    const { activeFilter, createFilter, tracking } = this.props;
    createFilter(activeFilter);
    tracking.trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnFilterActionBarButtonEvent('clone'));
  };

  handleFilterCreate = (hasFilterPermissions) => {
    const { createFilter, removeLaunchesFilter, tracking } = this.props;

    if (hasFilterPermissions) {
      createFilter();
    } else {
      if (this.state.isFilterCreate) {
        removeLaunchesFilter(CUSTOM_FILTER_ID);
      } else {
        createFilter();
      }

      this.setState({ isFilterCreate: !this.state.isFilterCreate });
    }
    tracking.trackEvent(LAUNCHES_PAGE_EVENTS.ADD_FILTER);
  };

  handleFilterEdit = () => {
    const { showModal, activeFilter, updateFilter, tracking } = this.props;
    showModal({
      id: 'filterEditModal',
      data: {
        filter: activeFilter,
        onEdit: updateFilter,
      },
    });
    tracking.trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnFilterActionBarButtonEvent('edit'));
  };

  handleFilterReset = () => {
    const { activeFilter, resetFilter, onResetFilter, tracking } = this.props;
    resetFilter(activeFilter.id);
    onResetFilter();
    tracking.trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnFilterActionBarButtonEvent('discard'));
  };

  redirectToLaunches = () => this.props.redirectToLaunches(this.props.launchDistinct);

  updateActiveFilter = () => {
    const { activeFilter, updateFilter, activeFilterId, showModal, saveNewFilter, tracking } =
      this.props;
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
    tracking.trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnFilterActionBarButtonEvent('save'));
  };
  isNoFilterValues = () => {
    const {
      activeFilter: { conditions = [] },
    } = this.props;
    return !conditions.some((filter) => !isEmptyValue(filter.value));
  };
  toggleExpand = () => {
    this.props.tracking.trackEvent(
      LAUNCHES_PAGE_EVENTS.getClickOnCriteriaTogglerEvent(this.state.expanded),
    );

    return this.setState({ expanded: !this.state.expanded });
  };
  isNewFilter = () => {
    const { activeFilterId } = this.props;
    return activeFilterId < 0;
  };
  isFilterUnsaved = () => {
    const { unsavedFilterIds, activeFilterId } = this.props;
    return unsavedFilterIds.indexOf(activeFilterId) !== -1;
  };
  isFilterDirty = () => {
    const { dirtyFilterIds, activeFilterId } = this.props;
    return dirtyFilterIds.indexOf(activeFilterId) !== -1;
  };
  isSaveDisabled = () => {
    const { filterErrors } = this.props;

    return !this.isFilterUnsaved() || !isEmptyObject(filterErrors) || this.isNoFilterValues();
  };
  isDiscardDisabled = () => !this.isFilterDirty();
  isEditDisabled = () => this.isFilterUnsaved() || this.isNewFilter();

  getFilterMessage = (hasFilterPermissions) => {
    if (hasFilterPermissions) {
      return <FormattedMessage id="LaunchFiltersToolbar.addFilter" defaultMessage="Add filter" />;
    }

    return this.state.isFilterCreate ? (
      <FormattedMessage id="LaunchFiltersToolbar.clearFilter" defaultMessage="Clear filter" />
    ) : (
      <FormattedMessage id="LaunchFiltersToolbar.filter" defaultMessage="Filter" />
    );
  };

  getFilterIcon = (hasFilterPermissions) => {
    if (hasFilterPermissions) {
      return AddFilterIcon;
    }

    return this.state.isFilterCreate ? <ClearIcon /> : FilterIcon;
  };

  render() {
    const {
      filters,
      activeFilterId,
      launchDistinct,
      activeFilter,
      onRemoveFilter,
      filterEntities,
      filterErrors,
      onFilterChange,
      onChangeSorting,
      sortingString,
      onFilterValidate,
      onFilterAdd,
      onFilterRemove,
      changeLaunchDistinct,
      unsavedFilterIds,
      userRoles,
      level,
      intl,
    } = this.props;

    const hasFilterPermissions = canWorkWithFilters(userRoles);

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
            <GhostButton
              icon={this.getFilterIcon(hasFilterPermissions)}
              onClick={() => this.handleFilterCreate(hasFilterPermissions)}
              preventIconParsing={this.state.isFilterCreate}
            >
              {this.getFilterMessage(hasFilterPermissions)}
            </GhostButton>
          </div>
          {hasFilterPermissions && (
            <div className={cx('filter-tickets-container')}>
              <FilterList
                filters={filters}
                activeFilterId={activeFilterId}
                unsavedFilterIds={unsavedFilterIds}
                onRemoveFilter={onRemoveFilter}
                intl={intl}
              />
            </div>
          )}
          {!!activeFilter && !level && (
            <div className={cx('expand-toggle-container')}>
              <ExpandToggler expanded={this.state.expanded} onToggleExpand={this.toggleExpand} />
            </div>
          )}
        </div>
        {this.state.expanded &&
          !level &&
          !!activeFilter &&
          (hasFilterPermissions || this.state.isFilterCreate) && (
            <div className={cx('filter-controls-container')}>
              <div className={cx('filter-entities-container')}>
                <EntitiesGroup
                  onChange={onFilterChange}
                  onValidate={onFilterValidate}
                  onRemove={onFilterRemove}
                  onAdd={onFilterAdd}
                  errors={filterErrors}
                  entities={filterEntities}
                  events={LAUNCHES_PAGE_EVENTS}
                />
              </div>
              <FiltersActionBar
                unsaved={this.isFilterUnsaved()}
                discardDisabled={this.isDiscardDisabled()}
                saveDisabled={this.isSaveDisabled()}
                cloneDisabled={this.isNoFilterValues()}
                editDisabled={this.isEditDisabled()}
                onDiscard={this.handleFilterReset}
                onEdit={this.handleFilterEdit}
                onSave={this.updateActiveFilter}
                onClone={this.handleFilterClone}
                filter={activeFilter}
                onChangeSorting={onChangeSorting}
                sortingString={sortingString}
              />
            </div>
          )}
      </div>
    );
  }
}
