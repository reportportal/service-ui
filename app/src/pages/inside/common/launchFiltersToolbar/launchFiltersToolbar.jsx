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

import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
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
import { isEmptyObject, isEmptyValue } from 'common/utils';
import { GhostButton } from 'components/buttons/ghostButton';
import { levelSelector } from 'controllers/testItem';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import AddFilterIcon from 'common/img/add-filter-inline.svg';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { useCanLockDashboard } from 'common/hooks';
import { FilterList } from './filterList';
import { FiltersActionBar } from './filtersActionBar';
import { ExpandToggler } from './expandToggler';
import { filterShape } from './propTypes';
import { AllLatestDropdown } from './allLatestDropdown';
import styles from './launchFiltersToolbar.scss';

const cx = classNames.bind(styles);

export const LaunchFiltersToolbar = ({
  filters,
  activeFilterId,
  activeFilter,
  onRemoveFilter,
  onFilterAdd,
  onFilterRemove,
  onFilterValidate,
  onFilterChange,
  onChangeSorting,
  sortingString,
  filterErrors,
  filterEntities,
  onResetFilter,
}) => {
  const [expanded, setExpanded] = useState(true);
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

  const unsavedFilterIds = useSelector(unsavedFilterIdsSelector);
  const dirtyFilterIds = useSelector(dirtyFilterIdsSelector);
  const launchDistinct = useSelector(launchDistinctSelector);
  const level = useSelector(levelSelector);
  const canLock = useCanLockDashboard();
  const isFilterLocked = !!activeFilter?.locked;

  const showModal = useCallback((payload) => dispatch(showModalAction(payload)), [dispatch]);
  const updateFilter = useCallback((payload) => dispatch(updateFilterAction(payload)), [dispatch]);
  const resetFilter = useCallback((payload) => dispatch(resetFilterAction(payload)), [dispatch]);
  const createFilter = useCallback((payload) => dispatch(createFilterAction(payload)), [dispatch]);
  const saveNewFilter = useCallback(
    (payload) => dispatch(saveNewFilterAction(payload)),
    [dispatch],
  );
  const changeLaunchDistinct = useCallback(
    (payload) => dispatch(changeLaunchDistinctAction(payload)),
    [dispatch],
  );
  const redirectToLaunches = useCallback(
    () => dispatch(changeActiveFilterAction(launchDistinct)),
    [dispatch, launchDistinct],
  );

  const handleFilterClone = useCallback(() => {
    const { locked, ...newFilter } = activeFilter || {};
    createFilter(newFilter);
    trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnFilterActionBarButtonEvent('clone'));
  }, [activeFilter, createFilter, trackEvent]);

  const handleFilterCreate = useCallback(() => {
    createFilter();
    trackEvent(LAUNCHES_PAGE_EVENTS.ADD_FILTER);
  }, [createFilter, trackEvent]);

  const handleFilterEdit = useCallback(() => {
    showModal({
      id: 'filterEditModal',
      data: { filter: activeFilter, onEdit: updateFilter },
    });
    trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnFilterActionBarButtonEvent('edit'));
  }, [activeFilter, showModal, updateFilter, trackEvent]);

  const handleFilterReset = useCallback(() => {
    resetFilter(activeFilter.id);
    onResetFilter();
    trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnFilterActionBarButtonEvent('discard'));
  }, [activeFilter, resetFilter, onResetFilter, trackEvent]);

  const updateActiveFilter = useCallback(() => {
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
    trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnFilterActionBarButtonEvent('save'));
  }, [activeFilter, activeFilterId, showModal, saveNewFilter, updateFilter, trackEvent]);
  const isNoFilterValues = useCallback(() => {
    const { conditions = [] } = activeFilter || {};
    return !conditions.some((filter) => !isEmptyValue(filter.value));
  }, [activeFilter]);
  const toggleExpand = useCallback(() => {
    trackEvent(LAUNCHES_PAGE_EVENTS.getClickOnCriteriaTogglerEvent(expanded));
    setExpanded((prev) => !prev);
  }, [expanded, trackEvent]);
  const isNewFilter = useCallback(() => activeFilterId < 0, [activeFilterId]);
  const isFilterUnsaved = useCallback(
    () => unsavedFilterIds.includes(activeFilterId),
    [unsavedFilterIds, activeFilterId],
  );
  const isFilterDirty = useCallback(
    () => dirtyFilterIds.includes(activeFilterId),
    [dirtyFilterIds, activeFilterId],
  );
  const isSaveDisabled = useCallback(
    () =>
      !isFilterUnsaved() ||
      !isEmptyObject(filterErrors) ||
      isNoFilterValues() ||
      (!canLock && isFilterLocked),
    [canLock, isFilterLocked, isFilterUnsaved, filterErrors, isNoFilterValues],
  );
  const isDiscardDisabled = useCallback(() => !isFilterDirty(), [isFilterDirty]);
  const isEditDisabled = useCallback(
    () => isFilterUnsaved() || isNewFilter() || (!canLock && isFilterLocked),
    [canLock, isFilterLocked, isFilterUnsaved, isNewFilter],
  );

  return (
    <div className={cx('launch-filters-toolbar')}>
      <div className={cx('filter-tickets-row')}>
        <div className={cx('all-latest-switcher')}>
          <AllLatestDropdown
            activeFilterId={activeFilterId}
            value={launchDistinct}
            onClick={() => redirectToLaunches(launchDistinct)}
            onChange={changeLaunchDistinct}
          />
        </div>
        <div className={cx('separator')} />
        <div className={cx('add-filter-button')}>
          <GhostButton icon={AddFilterIcon} onClick={handleFilterCreate}>
            <FormattedMessage id="LaunchFiltersToolbar.addFilter" defaultMessage="Add filter" />
          </GhostButton>
        </div>
        <div className={cx('filter-tickets-container')}>
          <FilterList
            filters={filters}
            activeFilterId={activeFilterId}
            unsavedFilterIds={unsavedFilterIds}
            onRemoveFilter={onRemoveFilter}
          />
        </div>
        {!!activeFilter && !level && (
          <div className={cx('expand-toggle-container')}>
            <ExpandToggler expanded={expanded} onToggleExpand={toggleExpand} />
          </div>
        )}
      </div>
      {expanded && !level && !!activeFilter && (
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
            unsaved={isFilterUnsaved()}
            discardDisabled={isDiscardDisabled()}
            saveDisabled={isSaveDisabled()}
            cloneDisabled={isNoFilterValues()}
            editDisabled={isEditDisabled()}
            onDiscard={handleFilterReset}
            onEdit={handleFilterEdit}
            onSave={updateActiveFilter}
            onClone={handleFilterClone}
            filter={activeFilter}
            onChangeSorting={onChangeSorting}
            sortingString={sortingString}
          />
        </div>
      )}
    </div>
  );
};

LaunchFiltersToolbar.propTypes = {
  filters: PropTypes.arrayOf(filterShape),
  activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  activeFilter: PropTypes.object,
  onRemoveFilter: PropTypes.func,
  onFilterAdd: PropTypes.func,
  onFilterRemove: PropTypes.func,
  onFilterValidate: PropTypes.func,
  onFilterChange: PropTypes.func,
  onChangeSorting: PropTypes.func,
  sortingString: PropTypes.string,
  filterErrors: PropTypes.object,
  filterEntities: PropTypes.array,
  onResetFilter: PropTypes.func,
};

LaunchFiltersToolbar.defaultProps = {
  filters: [],
  activeFilterId: null,
  activeFilter: null,
  onRemoveFilter: () => {},
  onFilterAdd: () => {},
  onFilterRemove: () => {},
  onFilterValidate: () => {},
  onFilterChange: () => {},
  onChangeSorting: () => {},
  sortingString: '',
  filterErrors: {},
  filterEntities: [],
  onResetFilter: () => {},
};
