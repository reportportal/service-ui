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
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { LaunchSuiteGrid } from 'pages/inside/common/launchSuiteGrid';
import { SuiteTestToolbar } from 'pages/inside/common/suiteTestToolbar';
import { debugModeSelector } from 'controllers/launch';
import { SUITES_PAGE_EVENTS } from 'components/main/analytics/events';
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
import { prevTestItemSelector } from 'controllers/pages';
import { ENTITY_START_TIME } from 'components/filterEntities/constants';

@connect(
  (state) => ({
    debugMode: debugModeSelector(state),
    validationErrors: validationErrorsSelector(state),
    tests: testsSelector(state),
    selectedTests: selectedTestsSelector(state),
    parentItem: parentItemSelector(state),
    loading: loadingSelector(state),
    highlightItemId: prevTestItemSelector(state),
  }),
  {
    toggleTestSelectionAction,
    unselectAllTestsAction,
    toggleAllTestsAction,
    selectTestsAction,
    fetchTestItemsAction,
  },
)
@withSortingURL({
  defaultFields: [ENTITY_START_TIME],
  defaultDirection: SORTING_ASC,
  namespaceSelector,
})
@withPagination({
  paginationSelector: testPaginationSelector,
  namespaceSelector,
})
@track()
export class TestsPage extends Component {
  static propTypes = {
    deleteItems: PropTypes.func,
    onEditItem: PropTypes.func,
    onEditItems: PropTypes.func,
    validationErrors: PropTypes.object.isRequired,
    debugMode: PropTypes.bool.isRequired,
    tests: PropTypes.arrayOf(PropTypes.object),
    selectedTests: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    fetchTestItemsAction: PropTypes.func,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    onChangeSorting: PropTypes.func,
    toggleTestSelectionAction: PropTypes.func,
    unselectAllTestsAction: PropTypes.func,
    toggleAllTestsAction: PropTypes.func,
    selectTestsAction: PropTypes.func,
    parentItem: PropTypes.object,
    loading: PropTypes.bool,
    onFilterAdd: PropTypes.func,
    onFilterRemove: PropTypes.func,
    onFilterValidate: PropTypes.func,
    onFilterChange: PropTypes.func,
    filterErrors: PropTypes.object,
    filterEntities: PropTypes.array,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    highlightItemId: PropTypes.number,
  };

  static defaultProps = {
    deleteItems: () => {},
    onEditItem: () => {},
    onEditItems: () => {},
    tests: [],
    selectedTests: [],
    activePage: DEFAULT_PAGINATION[PAGE_KEY],
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    sortingColumn: null,
    sortingDirection: null,
    fetchTestItemsAction: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    onChangeSorting: () => {},
    toggleTestSelectionAction: () => {},
    unselectAllTestsAction: () => {},
    toggleAllTestsAction: () => {},
    selectTestsAction: () => {},
    parentItem: null,
    loading: false,
    onFilterAdd: () => {},
    onFilterRemove: () => {},
    onFilterValidate: () => {},
    onFilterChange: () => {},
    filterErrors: {},
    filterEntities: [],
    highlightItemId: null,
  };

  state = {
    highlightedRowId: null,
    isGridRowHighlighted: false,
    isSauceLabsIntegrationView: false,
  };

  componentDidMount() {
    const { highlightItemId } = this.props;
    if (highlightItemId) {
      this.onHighlightRow(highlightItemId);
    }
  }

  componentWillUnmount() {
    this.props.unselectAllTestsAction();
  }

  onHighlightRow = (highlightedRowId) => {
    this.setState({
      highlightedRowId,
      isGridRowHighlighted: true,
    });
  };

  onGridRowHighlighted = () => {
    this.setState({
      isGridRowHighlighted: false,
    });
  };

  handleAllTestsSelection = () => {
    this.props.tracking.trackEvent(SUITES_PAGE_EVENTS.SELECT_ALL_ITEMS);
    this.props.toggleAllTestsAction(this.props.tests);
  };

  handleOneItemSelection = (value) => {
    this.props.tracking.trackEvent(SUITES_PAGE_EVENTS.SELECT_ONE_ITEM);
    this.props.toggleTestSelectionAction(value);
  };

  unselectAllItems = () => {
    this.props.tracking.trackEvent(SUITES_PAGE_EVENTS.CLOSE_ICON_FOR_ALL_SELECTIONS);
    this.props.unselectAllTestsAction();
  };

  unselectItem = (item) => {
    this.props.tracking.trackEvent(SUITES_PAGE_EVENTS.CLOSE_ICON_SELECTED_ITEM);
    this.props.toggleTestSelectionAction(item);
  };
  render() {
    const {
      tests,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
      selectedTests,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      parentItem,
      loading,
      debugMode,
      deleteItems,
      onEditItem,
      onEditItems,
      onFilterAdd,
      onFilterRemove,
      onFilterValidate,
      onFilterChange,
      filterErrors,
      filterEntities,
    } = this.props;

    const rowHighlightingConfig = {
      onGridRowHighlighted: this.onGridRowHighlighted,
      isGridRowHighlighted: this.state.isGridRowHighlighted,
      highlightedRowId: this.state.highlightedRowId,
    };

    return (
      <PageLayout>
        <PageSection>
          <SuiteTestToolbar
            selectedItems={selectedTests}
            parentItem={parentItem}
            onUnselect={this.unselectItem}
            onUnselectAll={this.unselectAllItems}
            onRefresh={this.props.fetchTestItemsAction}
            debugMode={debugMode}
            errors={this.props.validationErrors}
            onDelete={() => deleteItems(selectedTests)}
            onEditItems={() => onEditItems(selectedTests)}
            filterEntities={filterEntities}
            filterErrors={filterErrors}
            onFilterChange={onFilterChange}
            onFilterValidate={onFilterValidate}
            onFilterRemove={onFilterRemove}
            onFilterAdd={onFilterAdd}
            events={SUITES_PAGE_EVENTS}
          />
          <LaunchSuiteGrid
            data={tests}
            sortingColumn={sortingColumn}
            sortingDirection={sortingDirection}
            onChangeSorting={onChangeSorting}
            selectedItems={selectedTests}
            onItemSelect={this.handleOneItemSelection}
            onItemsSelect={this.props.selectTestsAction}
            onAllItemsSelect={this.handleAllTestsSelection}
            loading={loading}
            events={SUITES_PAGE_EVENTS}
            onFilterClick={onFilterAdd}
            onEditItem={onEditItem}
            rowHighlightingConfig={rowHighlightingConfig}
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
  }
}
