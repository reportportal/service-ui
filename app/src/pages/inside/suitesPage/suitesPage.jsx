/*
 * Copyright 2024 EPAM Systems
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

import { useEffect, useState } from 'react';
import { useTracking } from 'react-tracking';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import { DEFAULT_PAGINATION, SIZE_KEY, PAGE_KEY, withPagination } from 'controllers/pagination';
import { LaunchSuiteGrid } from 'pages/inside/common/launchSuiteGrid';
import { debugModeSelector } from 'controllers/launch';
import {
  suitePaginationSelector,
  suitesSelector,
  selectSuitesAction,
  selectedSuitesSelector,
  toggleSuiteSelectionAction,
  unselectAllSuitesAction,
  toggleAllSuitesAction,
  validationErrorsSelector,
} from 'controllers/suite';
import { SUITE_PAGE, SUITES_PAGE_EVENTS } from 'components/main/analytics/events';
import { SuiteTestToolbar } from 'pages/inside/common/suiteTestToolbar';
import {
  namespaceSelector,
  fetchTestItemsAction,
  parentItemSelector,
  loadingSelector,
} from 'controllers/testItem';
import { prevTestItemSelector, userRolesSelector } from 'controllers/pages';
import { ENTITY_START_TIME } from 'components/filterEntities/constants';
import { canManageTestItemsActions } from 'common/utils/permissions/permissions';

export const SuitesPageWrapped = ({
  deleteItems,
  onEditItem,
  onEditItems,
  activePage,
  itemCount,
  pageCount,
  pageSize,
  sortingColumn,
  sortingDirection,
  onChangePage,
  onChangePageSize,
  onChangeSorting,
  onFilterAdd,
  onFilterRemove,
  onFilterValidate,
  onFilterChange,
  filterErrors,
  filterEntities,
}) => {
  const { trackEvent } = useTracking({ page: SUITE_PAGE });

  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const [isGridRowHighlighted, setIsGridRowHighlighted] = useState(false);
  const debugMode = useSelector(debugModeSelector);
  const suites = useSelector(suitesSelector);
  const selectedSuites = useSelector(selectedSuitesSelector);
  const parentItem = useSelector(parentItemSelector);
  const loading = useSelector(loadingSelector);
  const validationErrors = useSelector(validationErrorsSelector);
  const highlightItemId = useSelector(prevTestItemSelector);
  const userRoles = useSelector(userRolesSelector);
  const canSelectItems = canManageTestItemsActions(userRoles);
  const dispatch = useDispatch();
  const onHighlightRow = (rowId) => {
    setHighlightedRowId(rowId);
    setIsGridRowHighlighted(true);
  };

  const onGridRowHighlighted = () => {
    setIsGridRowHighlighted(false);
  };

  const handleAllSuitesSelection = () => {
    if (suites.length !== selectedSuites.length) {
      trackEvent(SUITES_PAGE_EVENTS.CLICK_SELECT_ALL_ITEMS);
    }
    dispatch(toggleAllSuitesAction(suites));
  };

  const handleOneItemSelection = (value) => {
    if (!selectedSuites.includes(value)) {
      trackEvent(SUITES_PAGE_EVENTS.CLICK_SELECT_ONE_ITEM);
    }
    dispatch(toggleSuiteSelectionAction(value));
  };

  const handleItemsSelection = (items) => {
    dispatch(selectSuitesAction(items));
  };
  const handleRefresh = () => {
    dispatch(fetchTestItemsAction());
  };
  const unselectAllItems = () => {
    trackEvent(SUITES_PAGE_EVENTS.CLOSE_ICON_FOR_ALL_SELECTIONS);
    dispatch(unselectAllSuitesAction());
  };

  const unselectItem = (item) => {
    trackEvent(SUITES_PAGE_EVENTS.CLOSE_ICON_SELECTED_ITEM);
    dispatch(toggleSuiteSelectionAction(item));
  };

  const rowHighlightingConfig = {
    onGridRowHighlighted,
    isGridRowHighlighted,
    highlightedRowId,
  };

  useEffect(() => {
    if (highlightItemId) {
      onHighlightRow(highlightItemId);
    }
  }, [highlightItemId]);

  useEffect(() => {
    return () => {
      if (selectedSuites.length > 0) {
        dispatch(unselectAllSuitesAction());
      }
    };
  }, [selectedSuites, dispatch]);

  return (
    <PageLayout>
      <PageSection>
        <SuiteTestToolbar
          onDelete={() => deleteItems(selectedSuites)}
          onEditItems={() => onEditItems(selectedSuites)}
          errors={validationErrors}
          selectedItems={selectedSuites}
          onUnselect={unselectItem}
          onUnselectAll={unselectAllItems}
          onProceedValidItems={() => trackEvent(SUITES_PAGE_EVENTS.PROCEED_VALID_ITEMS)}
          parentItem={parentItem}
          onRefresh={handleRefresh}
          debugMode={debugMode}
          events={SUITES_PAGE_EVENTS}
          filterErrors={filterErrors}
          onFilterChange={onFilterChange}
          onFilterValidate={onFilterValidate}
          onFilterRemove={onFilterRemove}
          onFilterAdd={onFilterAdd}
          filterEntities={filterEntities}
        />
        <LaunchSuiteGrid
          data={suites}
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
          selectedItems={selectedSuites}
          onItemSelect={handleOneItemSelection}
          onAllItemsSelect={handleAllSuitesSelection}
          onItemsSelect={handleItemsSelection}
          loading={loading}
          events={SUITES_PAGE_EVENTS}
          onFilterClick={onFilterAdd}
          onEditItem={onEditItem}
          rowHighlightingConfig={rowHighlightingConfig}
          selectable={canSelectItems}
        />
        {!!pageCount && !loading && (
          <PaginationToolbar
            activePage={activePage}
            itemCount={itemCount}
            pageCount={pageCount}
            pageSize={pageSize}
            onChangePage={onChangePage}
            onChangePageSize={onChangePageSize}
          />
        )}
      </PageSection>
    </PageLayout>
  );
};

SuitesPageWrapped.propTypes = {
  deleteItems: PropTypes.func,
  onEditItem: PropTypes.func,
  onEditItems: PropTypes.func,
  activePage: PropTypes.number,
  itemCount: PropTypes.number,
  pageCount: PropTypes.number,
  pageSize: PropTypes.number,
  sortingColumn: PropTypes.string,
  sortingDirection: PropTypes.string,
  onChangePage: PropTypes.func,
  onChangePageSize: PropTypes.func,
  onChangeSorting: PropTypes.func,
  onFilterAdd: PropTypes.func,
  onFilterRemove: PropTypes.func,
  onFilterValidate: PropTypes.func,
  onFilterChange: PropTypes.func,
  filterErrors: PropTypes.object,
  filterEntities: PropTypes.array,
};

SuitesPageWrapped.defaultProps = {
  deleteItems: () => {},
  onEditItem: () => {},
  onEditItems: () => {},
  activePage: DEFAULT_PAGINATION[PAGE_KEY],
  itemCount: null,
  pageCount: null,
  pageSize: DEFAULT_PAGINATION[SIZE_KEY],
  sortingColumn: null,
  sortingDirection: null,
  onChangePage: () => {},
  onChangePageSize: () => {},
  onChangeSorting: () => {},
  onFilterAdd: () => {},
  onFilterRemove: () => {},
  onFilterValidate: () => {},
  onFilterChange: () => {},
  filterErrors: {},
  filterEntities: [],
};

export const SuitesPage = withSortingURL({
  defaultFields: [ENTITY_START_TIME],
  defaultDirection: SORTING_ASC,
  namespaceSelector,
})(
  withPagination({
    paginationSelector: suitePaginationSelector,
    namespaceSelector,
  })(SuitesPageWrapped),
);
