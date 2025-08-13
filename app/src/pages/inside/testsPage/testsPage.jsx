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
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { LaunchSuiteGrid } from 'pages/inside/common/launchSuiteGrid';
import { SuiteTestToolbar } from 'pages/inside/common/suiteTestToolbar';
import { debugModeSelector } from 'controllers/launch';
import { TESTS_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  testsSelector,
  selectedTestsSelector,
  toggleTestSelectionAction,
  unselectAllTestsAction,
  testPaginationSelector,
  toggleAllTestsAction,
  validationErrorsSelector,
  selectTestsAction,
} from 'controllers/test';
import { DEFAULT_PAGINATION, SIZE_KEY, PAGE_KEY, withPagination } from 'controllers/pagination';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import {
  namespaceSelector,
  fetchTestItemsAction,
  parentItemSelector,
  loadingSelector,
} from 'controllers/testItem';
import { prevTestItemSelector, userRolesSelector } from 'controllers/pages';
import { ENTITY_START_TIME } from 'components/filterEntities/constants';
import { canWorkWithTests } from 'common/utils/permissions/permissions';

// TODO: Refactor to avoid duplication
export const TestsPageWrapped = ({
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
  const { trackEvent } = useTracking();

  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const [isGridRowHighlighted, setIsGridRowHighlighted] = useState(false);
  const debugMode = useSelector(debugModeSelector);
  const validationErrors = useSelector(validationErrorsSelector);
  const tests = useSelector(testsSelector);
  const selectedTests = useSelector(selectedTestsSelector);
  const parentItem = useSelector(parentItemSelector);
  const loading = useSelector(loadingSelector);
  const highlightItemId = useSelector(prevTestItemSelector);
  const userRoles = useSelector(userRolesSelector);
  const canManageTests = canWorkWithTests(userRoles);
  const dispatch = useDispatch();

  // TODO - extract highlighting into custom hook
  const onHighlightRow = (rowId) => {
    setHighlightedRowId(rowId);
    setIsGridRowHighlighted(true);
  };

  const onGridRowHighlighted = () => {
    setIsGridRowHighlighted(false);
  };

  const handleAllTestsSelection = () => {
    if (tests.length !== selectedTests.length) {
      trackEvent(TESTS_PAGE_EVENTS.CLICK_SELECT_ALL_ITEMS);
    }
    dispatch(toggleAllTestsAction(tests));
  };

  const handleOneItemSelection = (value) => {
    if (!selectedTests.includes(value)) {
      trackEvent(TESTS_PAGE_EVENTS.CLICK_SELECT_ONE_ITEM);
    }
    dispatch(toggleTestSelectionAction(value));
  };

  const handleItemsSelection = (items) => {
    dispatch(selectTestsAction(items));
  };

  const unselectAllItems = () => {
    trackEvent(TESTS_PAGE_EVENTS.CLOSE_ICON_FOR_ALL_SELECTIONS);
    dispatch(unselectAllTestsAction());
  };

  const unselectItem = (item) => {
    trackEvent(TESTS_PAGE_EVENTS.CLOSE_ICON_SELECTED_ITEM);
    dispatch(toggleTestSelectionAction(item));
  };

  const rowHighlightingConfig = {
    onGridRowHighlighted,
    isGridRowHighlighted,
    highlightedRowId,
  };

  const handleRefresh = () => {
    dispatch(fetchTestItemsAction());
  };

  useEffect(() => {
    if (highlightItemId) {
      onHighlightRow(highlightItemId);
    }
  }, [highlightItemId]);

  useEffect(() => {
    return () => {
      if (selectedTests.length > 0) {
        dispatch(unselectAllTestsAction());
      }
    };
  }, [selectedTests, dispatch]);

  return (
    <PageLayout>
      <PageSection>
        <SuiteTestToolbar
          selectedItems={selectedTests}
          parentItem={parentItem}
          onUnselect={unselectItem}
          onUnselectAll={unselectAllItems}
          onProceedValidItems={() => trackEvent(TESTS_PAGE_EVENTS.PROCEED_VALID_ITEMS)}
          onRefresh={handleRefresh}
          debugMode={debugMode}
          errors={validationErrors}
          onDelete={() => deleteItems(selectedTests)}
          onEditItems={() => onEditItems(selectedTests)}
          filterEntities={filterEntities}
          filterErrors={filterErrors}
          onFilterChange={onFilterChange}
          onFilterValidate={onFilterValidate}
          onFilterRemove={onFilterRemove}
          onFilterAdd={onFilterAdd}
          events={TESTS_PAGE_EVENTS}
        />
        <LaunchSuiteGrid
          data={tests}
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
          selectedItems={selectedTests}
          onItemSelect={handleOneItemSelection}
          onItemsSelect={handleItemsSelection}
          onAllItemsSelect={handleAllTestsSelection}
          loading={loading}
          events={TESTS_PAGE_EVENTS}
          onFilterClick={onFilterAdd}
          onEditItem={onEditItem}
          rowHighlightingConfig={rowHighlightingConfig}
          selectable={canManageTests}
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

TestsPageWrapped.propTypes = {
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
  filterEntities: PropTypes.arrayOf(PropTypes.object),
};

TestsPageWrapped.defaultProps = {
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

export const TestsPage = withSortingURL({
  defaultFields: [ENTITY_START_TIME],
  defaultDirection: SORTING_ASC,
  namespaceSelector,
})(
  withPagination({
    paginationSelector: testPaginationSelector,
    namespaceSelector,
  })(TestsPageWrapped),
);
