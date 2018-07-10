import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { PageLayout } from 'layouts/pageLayout';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { SORTING_ASC, withSorting } from 'controllers/sorting';
import { userIdSelector } from 'controllers/user';
import { withPagination } from 'controllers/pagination';
import { LaunchSuiteGrid } from 'pages/inside/common/launchSuiteGrid';
import {
  suitePaginationSelector,
  suitesSelector,
  selectedSuitesSelector,
  toggleSuiteSelectionAction,
  unselectAllSuitesAction,
  selectSuitesAction,
} from 'controllers/suite';
import { fetchLaunchAction } from 'controllers/launch';
import { SuiteTestToolbar } from 'pages/inside/common/suiteTestToolbar';
import { namespaceSelector, fetchTestItemsAction, parentItemSelector } from 'controllers/testItem';

@connect(
  (state) => ({
    userId: userIdSelector(state),
    suites: suitesSelector(state),
    selectedSuites: selectedSuitesSelector(state),
    parentItem: parentItemSelector(state),
  }),
  {
    toggleSuiteSelectionAction,
    unselectAllSuitesAction,
    selectSuitesAction,
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
  paginationSelector: suitePaginationSelector,
  namespaceSelector,
})
@injectIntl
export class SuitesPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
    selectSuitesAction: PropTypes.func,
    parentItem: PropTypes.object,
    fetchLaunchAction: PropTypes.func,
  };

  static defaultProps = {
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
    selectSuitesAction: () => {},
    parentItem: null,
    fetchLaunchAction: () => {},
  };

  handleAllSuitesSelection = () => {
    const { selectedSuites, suites } = this.props;
    if (suites.length === selectedSuites.length) {
      this.props.unselectAllSuitesAction();
      return;
    }
    this.props.selectSuitesAction(suites);
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
    } = this.props;
    return (
      <PageLayout>
        <SuiteTestToolbar
          selectedItems={selectedSuites}
          onUnselect={this.props.toggleSuiteSelectionAction}
          onUnselectAll={this.props.unselectAllSuitesAction}
          parentItem={parentItem}
          onRefresh={this.props.fetchTestItemsAction}
        />
        <LaunchSuiteGrid
          data={suites}
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
          selectedItems={selectedSuites}
          onItemSelect={this.props.toggleSuiteSelectionAction}
          onAllItemsSelect={this.handleAllSuitesSelection}
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
