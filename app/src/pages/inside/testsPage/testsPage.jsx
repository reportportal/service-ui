import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { SORTING_ASC, withSorting } from 'controllers/sorting';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { LaunchSuiteGrid } from 'pages/inside/common/launchSuiteGrid';
import { SuiteTestToolbar } from 'pages/inside/common/suiteTestToolbar';
import { debugModeSelector } from 'controllers/launch';
import {
  testsSelector,
  selectedTestsSelector,
  toggleTestSelectionAction,
  unselectAllTestsAction,
  testPaginationSelector,
  toggleAllTestsAction,
  validationErrorsSelector,
} from 'controllers/test';
import { withPagination } from 'controllers/pagination';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import {
  namespaceSelector,
  fetchTestItemsAction,
  parentItemSelector,
  loadingSelector,
} from 'controllers/testItem';

@connect(
  (state) => ({
    debugMode: debugModeSelector(state),
    validationErrors: validationErrorsSelector(state),
    tests: testsSelector(state),
    selectedTests: selectedTestsSelector(state),
    parentItem: parentItemSelector(state),
    loading: loadingSelector(state),
  }),
  {
    toggleTestSelectionAction,
    unselectAllTestsAction,
    toggleAllTestsAction,
    fetchTestItemsAction,
  },
)
@withSorting({
  defaultSortingColumn: 'start_time',
  defaultSortingDirection: SORTING_ASC,
})
@withPagination({
  paginationSelector: testPaginationSelector,
  namespaceSelector,
})
export class TestsPage extends Component {
  static propTypes = {
    deleteItems: PropTypes.func,
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
    parentItem: PropTypes.object,
    loading: PropTypes.bool,
    onFilterAdd: PropTypes.func,
    onFilterRemove: PropTypes.func,
    onFilterValidate: PropTypes.func,
    onFilterChange: PropTypes.func,
    filterErrors: PropTypes.object,
    filterEntities: PropTypes.array,
  };

  static defaultProps = {
    deleteItems: () => {},
    tests: [],
    selectedTests: [],
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: 20,
    sortingColumn: null,
    sortingDirection: null,
    fetchTestItemsAction: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    onChangeSorting: () => {},
    toggleTestSelectionAction: () => {},
    unselectAllTestsAction: () => {},
    toggleAllTestsAction: () => {},
    parentItem: null,
    loading: false,
    onFilterAdd: () => {},
    onFilterRemove: () => {},
    onFilterValidate: () => {},
    onFilterChange: () => {},
    filterErrors: {},
    filterEntities: [],
  };

  handleAllTestsSelection = () => this.props.toggleAllTestsAction(this.props.tests);

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
      onFilterAdd,
      onFilterRemove,
      onFilterValidate,
      onFilterChange,
      filterErrors,
      filterEntities,
    } = this.props;
    return (
      <PageLayout>
        <PageSection>
          <SuiteTestToolbar
            selectedItems={selectedTests}
            parentItem={parentItem}
            onUnselect={this.props.toggleTestSelectionAction}
            onUnselectAll={this.props.unselectAllTestsAction}
            onRefresh={this.props.fetchTestItemsAction}
            debugMode={debugMode}
            errors={this.props.validationErrors}
            onDelete={() => deleteItems(selectedTests)}
            filterEntities={filterEntities}
            filterErrors={filterErrors}
            onFilterChange={onFilterChange}
            onFilterValidate={onFilterValidate}
            onFilterRemove={onFilterRemove}
            onFilterAdd={onFilterAdd}
          />
          <LaunchSuiteGrid
            data={tests}
            sortingColumn={sortingColumn}
            sortingDirection={sortingDirection}
            onChangeSorting={onChangeSorting}
            selectedItems={selectedTests}
            onItemSelect={this.props.toggleTestSelectionAction}
            onAllItemsSelect={this.handleAllTestsSelection}
            loading={loading}
            onFilterClick={onFilterAdd}
          />
          <PaginationToolbar
            activePage={activePage}
            itemCount={itemCount}
            pageCount={pageCount}
            pageSize={pageSize}
            onChangePage={onChangePage}
            onChangePageSize={onChangePageSize}
          />
        </PageSection>
      </PageLayout>
    );
  }
}
