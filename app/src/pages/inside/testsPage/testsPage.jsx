import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { SORTING_ASC, withSorting } from 'controllers/sorting';
import { PageLayout } from 'layouts/pageLayout';
import { LaunchSuiteGrid } from 'pages/inside/common/launchSuiteGrid';
import { SuiteTestToolbar } from 'pages/inside/common/suiteTestToolbar';
import {
  testsSelector,
  selectedTestsSelector,
  toggleTestSelectionAction,
  unselectAllTestsAction,
  selectTestsAction,
  testPaginationSelector,
} from 'controllers/test';
import { currentSuiteSelector, fetchSuiteAction } from 'controllers/suite';
import { withPagination } from 'controllers/pagination';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { launchIdSelector, suiteIdSelector } from 'controllers/pages';
import { fetchLaunchAction } from 'controllers/launch';
import { namespaceSelector, fetchTestItemsAction } from 'controllers/testItem';

@connect(
  (state) => ({
    tests: testsSelector(state),
    selectedTests: selectedTestsSelector(state),
    currentSuite: currentSuiteSelector(state),
    launchId: launchIdSelector(state),
    suiteId: suiteIdSelector(state),
  }),
  {
    toggleTestSelectionAction,
    unselectAllTestsAction,
    selectTestsAction,
    fetchSuiteAction,
    fetchLaunchAction,
    fetchTestItemsAction,
  },
)
@withSorting({
  defaultSortingColumn: 'start_time',
  defaultSortingDirection: SORTING_ASC,
})
@withPagination({
  fetchAction: fetchTestItemsAction,
  paginationSelector: testPaginationSelector,
  namespaceSelector,
})
@injectIntl
export class TestsPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
    selectTestsAction: PropTypes.func,
    currentSuite: PropTypes.object,
    launchId: PropTypes.string,
    suiteId: PropTypes.string,
    fetchSuiteAction: PropTypes.func,
    fetchLaunchAction: PropTypes.func,
  };

  static defaultProps = {
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
    selectTestsAction: () => {},
    currentSuite: null,
    launchId: null,
    suiteId: null,
    fetchSuiteAction: () => {},
    fetchLaunchAction: () => {},
  };

  handleAllTestsSelection = () => {
    const { selectedTests, tests } = this.props;
    if (tests.length === selectedTests.length) {
      this.props.unselectAllTestsAction();
      return;
    }
    this.props.selectTestsAction(tests);
  };

  handleRefresh = () => {
    if (this.props.suiteId && this.props.launchId) {
      this.props.fetchSuiteAction(this.props.suiteId);
      this.props.fetchLaunchAction(this.props.launchId);
    }
    this.props.fetchTestItemsAction();
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
      currentSuite,
    } = this.props;
    return (
      <PageLayout>
        <SuiteTestToolbar
          selectedItems={selectedTests}
          parentItem={currentSuite}
          onUnselect={this.props.toggleTestSelectionAction}
          onUnselectAll={this.props.unselectAllTestsAction}
          onRefresh={this.handleRefresh}
        />
        <LaunchSuiteGrid
          data={tests}
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
          selectedItems={selectedTests}
          onItemSelect={this.props.toggleTestSelectionAction}
          onAllItemsSelect={this.handleAllTestsSelection}
        />
        <PaginationToolbar
          activePage={activePage}
          itemCount={itemCount}
          pageCount={pageCount}
          pageSize={pageSize}
          onChangePage={onChangePage}
          onChangePageSize={onChangePageSize}
        />
      </PageLayout>
    );
  }
}
