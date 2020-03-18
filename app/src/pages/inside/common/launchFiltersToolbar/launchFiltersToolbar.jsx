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
import { showModalAction } from 'controllers/modal';
import {
  updateFilterAction,
  resetFilterAction,
  unsavedFilterIdsSelector,
  createFilterAction,
  saveNewFilterAction,
  changeActiveFilterAction,
  dirtyFilterIdsSelector,
} from 'controllers/filter';
import { changeLaunchDistinctAction, launchDistinctSelector } from 'controllers/launch';
import { userInfoSelector, activeProjectRoleSelector } from 'controllers/user';
import { canEditFilter } from 'common/utils/permissions';
import { isEmptyObject, isEmptyValue } from 'common/utils';
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
    dirtyFilterIds: dirtyFilterIdsSelector(state),
    launchDistinct: launchDistinctSelector(state),
    level: levelSelector(state),
    userInfo: userInfoSelector(state),
    projectRole: activeProjectRoleSelector(state),
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
    userInfo: PropTypes.object.isRequired,
    projectRole: PropTypes.string.isRequired,
    intl: PropTypes.object.isRequired,
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
  isNoFilterValues = () => {
    const {
      activeFilter: { conditions = [] },
    } = this.props;
    return !conditions.some((filter) => !isEmptyValue(filter.value));
  };
  toggleExpand = () => this.setState({ expanded: !this.state.expanded });
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
    const {
      filterErrors,
      projectRole,
      userInfo: { userRole, userId },
      activeFilter,
    } = this.props;

    return (
      !this.isFilterUnsaved() ||
      !isEmptyObject(filterErrors) ||
      this.isNoFilterValues() ||
      !canEditFilter(userRole, projectRole, activeFilter.owner === userId)
    );
  };
  isDiscardDisabled = () => !this.isFilterDirty();
  isEditDisabled = () => this.isFilterUnsaved() || this.isNewFilter();
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
      level,
      intl,
    } = this.props;
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
              onRemoveFilter={onRemoveFilter}
              intl={intl}
            />
          </div>
          {!!activeFilter && !level && (
            <div className={cx('expand-toggle-container')}>
              <ExpandToggler expanded={this.state.expanded} onToggleExpand={this.toggleExpand} />
            </div>
          )}
        </div>
        {this.state.expanded && !level && !!activeFilter && (
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
