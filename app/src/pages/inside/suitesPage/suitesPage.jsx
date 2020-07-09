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
import { userIdSelector } from 'controllers/user';
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
    userId: userIdSelector(state),
    suites: suitesSelector(state),
    selectedSuites: selectedSuitesSelector(state),
    parentItem: parentItemSelector(state),
    loading: loadingSelector(state),
    validationErrors: validationErrorsSelector(state),
    highlightItemId: prevTestItemSelector(state),
  }),
  {
    toggleSuiteSelectionAction,
    unselectAllSuitesAction,
    toggleAllSuitesAction,
    selectSuitesAction,
    fetchTestItemsAction,
  },
)
@withSortingURL({
  defaultFields: [ENTITY_START_TIME],
  defaultDirection: SORTING_ASC,
  namespaceSelector,
})
@withPagination({
  paginationSelector: suitePaginationSelector,
  namespaceSelector,
})
@track({ page: SUITE_PAGE })
export class SuitesPage extends Component {
  static propTypes = {
    debugMode: PropTypes.bool.isRequired,
    deleteItems: PropTypes.func,
    onEditItem: PropTypes.func,
    onEditItems: PropTypes.func,
    suites: PropTypes.arrayOf(PropTypes.object),
    selectedSuites: PropTypes.arrayOf(PropTypes.object),
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
    toggleSuiteSelectionAction: PropTypes.func,
    unselectAllSuitesAction: PropTypes.func,
    toggleAllSuitesAction: PropTypes.func,
    selectSuitesAction: PropTypes.func,
    parentItem: PropTypes.object,
    loading: PropTypes.bool,
    validationErrors: PropTypes.object,
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
    suites: [],
    selectedSuites: [],
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
    toggleSuiteSelectionAction: () => {},
    unselectAllSuitesAction: () => {},
    toggleAllSuitesAction: () => {},
    selectSuitesAction: () => {},
    parentItem: null,
    loading: false,
    validationErrors: {},
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
    this.props.unselectAllSuitesAction();
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

  handleAllSuitesSelection = () => {
    this.props.tracking.trackEvent(SUITES_PAGE_EVENTS.SELECT_ALL_ITEMS);
    this.props.toggleAllSuitesAction(this.props.suites);
  };

  handleOneItemSelection = (value) => {
    this.props.tracking.trackEvent(SUITES_PAGE_EVENTS.SELECT_ONE_ITEM);
    this.props.toggleSuiteSelectionAction(value);
  };

  unselectAllItems = () => {
    this.props.tracking.trackEvent(SUITES_PAGE_EVENTS.CLOSE_ICON_FOR_ALL_SELECTIONS);
    this.props.unselectAllSuitesAction();
  };

  unselectItem = (item) => {
    this.props.tracking.trackEvent(SUITES_PAGE_EVENTS.CLOSE_ICON_SELECTED_ITEM);
    this.props.toggleSuiteSelectionAction(item);
  };

  render() {
    const {
      suites,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
      selectedSuites,
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
      tracking,
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
            onDelete={() => deleteItems(selectedSuites)}
            onEditItems={() => onEditItems(selectedSuites)}
            errors={this.props.validationErrors}
            selectedItems={selectedSuites}
            onUnselect={this.unselectItem}
            onUnselectAll={this.unselectAllItems}
            onProceedValidItems={() => tracking.trackEvent(SUITES_PAGE_EVENTS.PROCEED_VALID_ITEMS)}
            parentItem={parentItem}
            onRefresh={this.props.fetchTestItemsAction}
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
            onItemSelect={this.handleOneItemSelection}
            onAllItemsSelect={this.handleAllSuitesSelection}
            onItemsSelect={this.props.selectSuitesAction}
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
