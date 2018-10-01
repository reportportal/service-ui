import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { SORTING_ASC, withSorting } from 'controllers/sorting';
import { withPagination } from 'controllers/pagination';
import { LaunchSuiteGrid } from 'pages/inside/common/launchSuiteGrid';
import { debugModeSelector } from 'controllers/launch';
import {
  suitePaginationSelector,
  suitesSelector,
  selectedSuitesSelector,
  toggleSuiteSelectionAction,
  unselectAllSuitesAction,
  toggleAllSuitesAction,
  validationErrorsSelector,
} from 'controllers/suite';
import { SuiteTestToolbar } from 'pages/inside/common/suiteTestToolbar';
import { userIdSelector } from 'controllers/user';
import {
  namespaceSelector,
  fetchTestItemsAction,
  parentItemSelector,
  loadingSelector,
} from 'controllers/testItem';

@connect(
  (state) => ({
    debugMode: debugModeSelector(state),
    userId: userIdSelector(state),
    suites: suitesSelector(state),
    selectedSuites: selectedSuitesSelector(state),
    parentItem: parentItemSelector(state),
    loading: loadingSelector(state),
    validationErrors: validationErrorsSelector(state),
  }),
  {
    toggleSuiteSelectionAction,
    unselectAllSuitesAction,
    toggleAllSuitesAction,
    fetchTestItemsAction,
  },
)
@withSorting({
  defaultSortingColumn: 'start_time',
  defaultSortingDirection: SORTING_ASC,
})
@withPagination({
  paginationSelector: suitePaginationSelector,
  namespaceSelector,
})
export class SuitesPage extends Component {
  static propTypes = {
    debugMode: PropTypes.bool.isRequired,
    deleteItems: PropTypes.func,
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
    parentItem: PropTypes.object,
    loading: PropTypes.bool,
    validationErrors: PropTypes.object,
    changeFilter: PropTypes.func,
    onFilterAdd: PropTypes.func,
    onFilterRemove: PropTypes.func,
    onFilterValidate: PropTypes.func,
    onFilterChange: PropTypes.func,
    filterErrors: PropTypes.object,
    filterEntities: PropTypes.array,
  };

  static defaultProps = {
    deleteItems: () => {},
    suites: [],
    selectedSuites: [],
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
    toggleSuiteSelectionAction: () => {},
    unselectAllSuitesAction: () => {},
    toggleAllSuitesAction: () => {},
    parentItem: null,
    loading: false,
    changeFilter: () => {},
    validationErrors: {},
    onFilterAdd: () => {},
    onFilterRemove: () => {},
    onFilterValidate: () => {},
    onFilterChange: () => {},
    filterErrors: {},
    filterEntities: [],
  };

  handleAllSuitesSelection = () => this.props.toggleAllSuitesAction(this.props.suites);

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
            onDelete={() => deleteItems(selectedSuites)}
            errors={this.props.validationErrors}
            selectedItems={selectedSuites}
            onUnselect={this.props.toggleSuiteSelectionAction}
            onUnselectAll={this.props.unselectAllSuitesAction}
            parentItem={parentItem}
            onRefresh={this.props.fetchTestItemsAction}
            debugMode={debugMode}
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
            onItemSelect={this.props.toggleSuiteSelectionAction}
            onAllItemsSelect={this.handleAllSuitesSelection}
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
