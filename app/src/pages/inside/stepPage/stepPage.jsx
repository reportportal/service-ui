import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { SuiteTestToolbar } from 'pages/inside/common/suiteTestToolbar';
import {
  parentItemSelector,
  loadingSelector,
  fetchTestItemsAction,
  isListViewSelector,
  namespaceSelector,
} from 'controllers/testItem';
import { debugModeSelector } from 'controllers/launch';
import { STEP_PAGE_EVENTS, STEP_PAGE } from 'components/main/analytics/events';
import {
  stepsSelector,
  selectedStepsSelector,
  validationErrorsSelector,
  lastOperationSelector,
  unselectAllStepsAction,
  toggleStepSelectionAction,
  proceedWithValidItemsAction,
  selectStepsAction,
  stepPaginationSelector,
  ignoreInAutoAnalysisAction,
  includeInAutoAnalysisAction,
  unlinkIssueAction,
  editDefectsAction,
  linkIssueAction,
  postIssueAction,
} from 'controllers/step';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import { ENTITY_START_TIME } from 'components/filterEntities/constants';
import { withPagination, DEFAULT_PAGINATION, SIZE_KEY } from 'controllers/pagination';
import { prevTestItemSelector } from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { LaunchFiltersSection } from 'pages/inside/common/launchFiltersSection';
import { LAUNCH_ITEM_TYPES } from 'common/constants/launchItemTypes';
import { getDefectTypeSelector } from 'controllers/project';
import { TO_INVESTIGATE } from 'common/constants/defectTypes';
import { StepGrid } from './stepGrid';

@connect(
  (state) => ({
    debugMode: debugModeSelector(state),
    parentItem: parentItemSelector(state),
    steps: stepsSelector(state),
    lastOperation: lastOperationSelector(state),
    selectedItems: selectedStepsSelector(state),
    validationErrors: validationErrorsSelector(state),
    loading: loadingSelector(state),
    listView: isListViewSelector(state, namespaceSelector(state)),
    highlightItemId: prevTestItemSelector(state),
    getDefectType: getDefectTypeSelector(state),
  }),
  {
    unselectAllSteps: unselectAllStepsAction,
    toggleStepSelection: toggleStepSelectionAction,
    proceedWithValidItemsAction,
    selectStepsAction,
    fetchTestItemsAction,
    showModalAction,
    ignoreInAutoAnalysisAction,
    includeInAutoAnalysisAction,
    unlinkIssueAction,
    editDefectsAction,
    linkIssueAction,
    postIssueAction,
  },
)
@withSortingURL({
  defaultFields: [ENTITY_START_TIME],
  defaultDirection: SORTING_ASC,
  namespaceSelector,
})
@withPagination({
  paginationSelector: stepPaginationSelector,
  namespaceSelector,
})
@track({ page: STEP_PAGE })
export class StepPage extends Component {
  static propTypes = {
    deleteItems: PropTypes.func,
    onEditItem: PropTypes.func,
    onEditItems: PropTypes.func,
    debugMode: PropTypes.bool.isRequired,
    steps: PropTypes.arrayOf(PropTypes.object),
    parentItem: PropTypes.object,
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    validationErrors: PropTypes.object,
    lastOperation: PropTypes.string,
    selectStepsAction: PropTypes.func,
    unselectAllSteps: PropTypes.func,
    proceedWithValidItemsAction: PropTypes.func,
    toggleStepSelection: PropTypes.func,
    loading: PropTypes.bool,
    fetchTestItemsAction: PropTypes.func,
    listView: PropTypes.bool,
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    onChangeSorting: PropTypes.func,
    showModalAction: PropTypes.func,
    ignoreInAutoAnalysisAction: PropTypes.func,
    includeInAutoAnalysisAction: PropTypes.func,
    unlinkIssueAction: PropTypes.func,
    editDefectsAction: PropTypes.func.isRequired,
    linkIssueAction: PropTypes.func,
    postIssueAction: PropTypes.func,
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
    getDefectType: PropTypes.func,
  };

  static defaultProps = {
    deleteItems: () => {},
    onEditItem: () => {},
    onEditItems: () => {},
    steps: [],
    parentItem: {},
    selectedItems: [],
    validationErrors: {},
    lastOperation: '',
    selectStepsAction: () => {},
    unselectAllSteps: () => {},
    proceedWithValidItemsAction: () => {},
    toggleStepSelection: () => {},
    loading: false,
    fetchTestItemsAction: () => {},
    listView: false,
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    sortingColumn: null,
    sortingDirection: null,
    onChangePage: () => {},
    onChangePageSize: () => {},
    onChangeSorting: () => {},
    showModalAction: () => {},
    ignoreInAutoAnalysisAction: () => {},
    includeInAutoAnalysisAction: () => {},
    unlinkIssueAction: () => {},
    linkIssueAction: () => {},
    postIssueAction: () => {},
    onFilterAdd: () => {},
    onFilterRemove: () => {},
    onFilterValidate: () => {},
    onFilterChange: () => {},
    filterErrors: {},
    filterEntities: [],
    highlightItemId: null,
    getDefectType: () => {},
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
    this.props.unselectAllSteps();
  }

  onHighlightRow = (highlightedRowId) => {
    this.setState({
      highlightedRowId,
      isGridRowHighlighted: false,
    });
  };

  onGridRowHighlighted = () => {
    this.setState({
      isGridRowHighlighted: true,
    });
  };

  onEditItem = (launch) => {
    this.props.showModalAction({
      id: 'testItemDetails',
      data: {
        item: launch,
        type: LAUNCH_ITEM_TYPES.item,
        fetchFunc: this.props.fetchTestItemsAction,
      },
    });
  };

  handleAllStepsSelection = () => {
    const { selectedItems, steps } = this.props;
    this.props.tracking.trackEvent(STEP_PAGE_EVENTS.SELECT_ALL_ITEMS);
    if (steps.length === selectedItems.length) {
      this.props.unselectAllSteps();
      return;
    }
    this.props.selectStepsAction(steps);
  };

  handleOneItemSelection = (value) => {
    this.props.tracking.trackEvent(STEP_PAGE_EVENTS.SELECT_ONE_ITEM);
    this.props.toggleStepSelection(value);
  };

  unselectAllItems = () => {
    this.props.tracking.trackEvent(STEP_PAGE_EVENTS.CLOSE_ICON_FOR_ALL_SELECTIONS);
    this.props.unselectAllSteps();
  };

  unselectItem = (item) => {
    this.props.tracking.trackEvent(STEP_PAGE_EVENTS.CLOSE_ICON_SELECTED_ITEM);
    this.props.toggleStepSelection(item);
  };

  handleUnlinkIssue = () =>
    this.props.unlinkIssueAction(this.props.selectedItems, {
      fetchFunc: this.props.fetchTestItemsAction,
    });

  handleUnlinkSingleTicket = (testItem) => (ticketId) => {
    const items = [
      {
        ...testItem,
        issue: {
          ...testItem.issue,
          externalSystemIssues: testItem.issue.externalSystemIssues.filter(
            (issue) => issue.ticketId === ticketId,
          ),
        },
      },
    ];

    this.props.unlinkIssueAction(items, {
      fetchFunc: this.props.fetchTestItemsAction,
    });
  };

  handleLinkIssue = () =>
    this.props.linkIssueAction(this.props.selectedItems, {
      fetchFunc: this.props.fetchTestItemsAction,
    });

  handlePostIssue = () =>
    this.props.postIssueAction(this.props.selectedItems, {
      fetchFunc: this.props.fetchTestItemsAction,
    });

  handleIgnoreInAA = () =>
    this.props.ignoreInAutoAnalysisAction(this.props.selectedItems, {
      fetchFunc: this.props.fetchTestItemsAction,
    });

  handleIncludeInAA = () =>
    this.props.includeInAutoAnalysisAction(this.props.selectedItems, {
      fetchFunc: this.props.fetchTestItemsAction,
    });

  handleEditDefects = (eventData) => {
    const items = eventData && eventData.id ? [eventData] : this.props.selectedItems;
    if (this.isDefectGroupOperationAvailable(eventData)) {
      this.props.showModalAction({
        id: 'editToInvestigateDefectModal',
        data: { item: items[0], fetchFunc: this.props.fetchTestItemsAction },
      });
    } else {
      this.props.editDefectsAction(items, {
        fetchFunc: this.props.fetchTestItemsAction,
        debugMode: this.props.debugMode,
      });
    }
  };

  isDefectGroupOperationAvailable = (editedData) => {
    const items = editedData && editedData.id ? [editedData] : this.props.selectedItems;
    return (
      items.length === 1 &&
      items[0].issue &&
      items[0].issue.issueType &&
      this.props.getDefectType(items[0].issue.issueType).typeRef.toUpperCase() ===
        TO_INVESTIGATE.toUpperCase() &&
      !this.props.debugMode
    );
  };

  proceedWithValidItems = () => {
    this.props.tracking.trackEvent(STEP_PAGE_EVENTS.PROCEED_VALID_ITEMS);
    this.props.proceedWithValidItemsAction(this.props.lastOperation, this.props.selectedItems, {
      fetchFunc: this.props.fetchTestItemsAction,
    });
  };

  deleteItems = () => {
    const { selectedItems, deleteItems } = this.props;
    deleteItems(selectedItems);
  };

  render() {
    const {
      parentItem,
      steps,
      selectedItems,
      validationErrors,
      loading,
      listView,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      debugMode,
      onFilterAdd,
      onFilterRemove,
      onFilterValidate,
      onFilterChange,
      filterErrors,
      filterEntities,
      onEditItems,
      onChangeSorting,
      sortingColumn,
      sortingDirection,
    } = this.props;
    const rowHighlightingConfig = {
      onGridRowHighlighted: this.onGridRowHighlighted,
      isGridRowHighlighted: this.state.isGridRowHighlighted,
      highlightedRowId: this.state.highlightedRowId,
    };

    return (
      <PageLayout>
        <PageSection>
          <LaunchFiltersSection />
        </PageSection>
        <PageSection>
          <SuiteTestToolbar
            onDelete={this.deleteItems}
            onEditItems={() => onEditItems(selectedItems)}
            errors={validationErrors}
            selectedItems={selectedItems}
            parentItem={parentItem}
            onUnselect={this.unselectItem}
            onUnselectAll={this.unselectAllItems}
            onProceedValidItems={this.proceedWithValidItems}
            onRefresh={this.props.fetchTestItemsAction}
            debugMode={debugMode}
            onEditDefects={this.handleEditDefects}
            onIgnoreInAA={this.handleIgnoreInAA}
            onIncludeInAA={this.handleIncludeInAA}
            onUnlinkIssue={this.handleUnlinkIssue}
            onLinkIssue={this.handleLinkIssue}
            onPostIssue={this.handlePostIssue}
            filterEntities={filterEntities}
            filterErrors={filterErrors}
            onFilterChange={onFilterChange}
            onFilterValidate={onFilterValidate}
            onFilterRemove={onFilterRemove}
            onFilterAdd={onFilterAdd}
          />
          <StepGrid
            data={steps}
            selectedItems={selectedItems}
            onAllItemsSelect={this.handleAllStepsSelection}
            onItemSelect={this.handleOneItemSelection}
            loading={loading}
            listView={listView}
            onEditDefect={this.handleEditDefects}
            onUnlinkSingleTicket={this.handleUnlinkSingleTicket}
            events={STEP_PAGE_EVENTS}
            onEditItem={this.onEditItem}
            onFilterClick={onFilterAdd}
            onChangeSorting={onChangeSorting}
            sortingColumn={sortingColumn}
            sortingDirection={sortingDirection}
            rowHighlightingConfig={rowHighlightingConfig}
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
