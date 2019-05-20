import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
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
import { SUITE_PAGE, SUITES_PAGE_EVENTS } from 'components/main/analytics/events';
import { SuiteTestToolbar } from 'pages/inside/common/suiteTestToolbar';
import { userIdSelector } from 'controllers/user';
import {
  namespaceSelector,
  fetchTestItemsAction,
  parentItemSelector,
  loadingSelector,
} from 'controllers/testItem';
import { LaunchFiltersSection } from 'pages/inside/common/launchFiltersSection';
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
  }),
  {
    toggleSuiteSelectionAction,
    unselectAllSuitesAction,
    toggleAllSuitesAction,
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
  };

  static defaultProps = {
    deleteItems: () => {},
    onEditItem: () => {},
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
    validationErrors: {},
    onFilterAdd: () => {},
    onFilterRemove: () => {},
    onFilterValidate: () => {},
    onFilterChange: () => {},
    filterErrors: {},
    filterEntities: [],
  };

  componentWillUnmount() {
    this.props.unselectAllSuitesAction();
  }

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
          <LaunchFiltersSection />
        </PageSection>
        <PageSection>
          <SuiteTestToolbar
            onDelete={() => deleteItems(selectedSuites)}
            errors={this.props.validationErrors}
            selectedItems={selectedSuites}
            onUnselect={this.unselectItem}
            onUnselectAll={this.unselectAllItems}
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
            loading={loading}
            events={SUITES_PAGE_EVENTS}
            onFilterClick={onFilterAdd}
            onEditItem={onEditItem}
          />
          {!!pageCount &&
            !loading && (
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
