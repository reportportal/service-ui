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
import { SuiteTestToolbar } from 'pages/inside/common/suiteTestToolbar';
import {
  parentItemSelector,
  loadingSelector,
  fetchTestItemsAction,
  isListViewSelector,
  isTestItemsListSelector,
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
  isDefectGroupOperationAvailable,
} from 'controllers/step';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import { ENTITY_START_TIME } from 'components/filterEntities/constants';
import { withPagination, DEFAULT_PAGINATION, SIZE_KEY, PAGE_KEY } from 'controllers/pagination';
import { prevTestItemSelector } from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { LAUNCH_ITEM_TYPES } from 'common/constants/launchItemTypes';
import { getDefectTypeSelector } from 'controllers/project';
import { StepGrid } from './stepGrid';

const UNLINK_ISSUE_EVENTS_INFO = {
  unlinkAutoAnalyzedFalse:
    STEP_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.UNLINK_IN_UNLINK_ISSUE_MODAL_AUTO_ANALYZED_FALSE,
  unlinkAutoAnalyzedTrue:
    STEP_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.UNLINK_IN_UNLINK_ISSUE_MODAL_AUTO_ANALYZED_TRUE,
  unlinkBtn: STEP_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.UNLINK_BTN_UNLINK_ISSUE_MODAL,
  cancelBtn: STEP_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.CANCEL_BTN_UNLINK_ISSUE_MODAL,
  closeIcon: STEP_PAGE_EVENTS.UNLINK_ISSUE_MODAL_EVENTS.CLOSE_ICON_UNLINK_ISSUE_MODAL,
};

const POST_ISSUE_EVENTS_INFO = {
  postBtn: STEP_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.POST_BTN_POST_ISSUE_MODAL,
  attachmentsSwitcher:
    STEP_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.ATTACHMENTS_SWITCHER_POST_ISSUE_MODAL,
  logsSwitcher: STEP_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.LOGS_SWITCHER_POST_ISSUE_MODAL,
  commentSwitcher: STEP_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.COMMENT_SWITCHER_POST_ISSUE_MODAL,
  cancelBtn: STEP_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.CANCEL_BTN_POST_ISSUE_MODAL,
  closeIcon: STEP_PAGE_EVENTS.POST_ISSUE_MODAL_EVENTS.CLOSE_ICON_POST_ISSUE_MODAL,
};

const LINK_ISSUE_EVENTS_INFO = {
  loadBtn: STEP_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.LOAD_BTN_LINK_ISSUE_MODAL,
  cancelBtn: STEP_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.CANCEL_BTN_LINK_ISSUE_MODAL,
  addNewIssue: STEP_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.ADD_NEW_ISSUE_BTN_LINK_ISSUE_MODAL,
  closeIcon: STEP_PAGE_EVENTS.LINK_ISSUE_MODAL_EVENTS.CLOSE_ICON_LINK_ISSUE_MODAL,
};

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
    isTestItemsList: isTestItemsListSelector(state),
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
    onEditItems: PropTypes.func,
    debugMode: PropTypes.bool.isRequired,
    steps: PropTypes.arrayOf(PropTypes.object),
    parentItem: PropTypes.object,
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    validationErrors: PropTypes.object,
    lastOperation: PropTypes.object,
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
    isTestItemsList: PropTypes.bool,
  };

  static defaultProps = {
    deleteItems: () => {},
    onEditItems: () => {},
    steps: [],
    parentItem: {},
    selectedItems: [],
    validationErrors: {},
    lastOperation: {},
    selectStepsAction: () => {},
    unselectAllSteps: () => {},
    proceedWithValidItemsAction: () => {},
    toggleStepSelection: () => {},
    loading: false,
    fetchTestItemsAction: () => {},
    listView: false,
    activePage: DEFAULT_PAGINATION[PAGE_KEY],
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
    isTestItemsList: false,
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
      isGridRowHighlighted: true,
    });
  };

  onGridRowHighlighted = () => {
    this.setState({
      isGridRowHighlighted: false,
    });
  };

  onEditItem = (item) => {
    this.props.showModalAction({
      id: 'testItemDetails',
      data: {
        item,
        type: LAUNCH_ITEM_TYPES.item,
        fetchFunc: this.props.fetchTestItemsAction,
        eventsInfo: {
          saveBtn: STEP_PAGE_EVENTS.EDIT_ITEMS_MODAL_EVENTS.SAVE_BTN_EDIT_ITEM_MODAL,
          editDescription: STEP_PAGE_EVENTS.EDIT_ITEMS_MODAL_EVENTS.EDIT_ITEM_DESCRIPTION,
          cancelBtn: STEP_PAGE_EVENTS.EDIT_ITEMS_MODAL_EVENTS.CANCEL_BTN_EDIT_ITEM_MODAL,
          closeIcon: STEP_PAGE_EVENTS.EDIT_ITEMS_MODAL_EVENTS.CLOSE_ICON_EDIT_ITEM_MODAL,
        },
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

  handleUnlinkIssue = () => {
    this.props.tracking.trackEvent(STEP_PAGE_EVENTS.UNLINK_ISSUES_ACTION);
    this.props.unlinkIssueAction(this.props.selectedItems, {
      fetchFunc: this.unselectAndFetchItems,
      eventsInfo: UNLINK_ISSUE_EVENTS_INFO,
    });
  };

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
    this.props.tracking.trackEvent(STEP_PAGE_EVENTS.UNLINK_SINGLE_ISSUE);
    this.props.unlinkIssueAction(items, {
      fetchFunc: this.unselectAndFetchItems,
      eventsInfo: UNLINK_ISSUE_EVENTS_INFO,
    });
  };

  handleLinkIssue = () =>
    this.props.linkIssueAction(this.props.selectedItems, {
      fetchFunc: this.unselectAndFetchItems,
      eventsInfo: LINK_ISSUE_EVENTS_INFO,
    });

  handlePostIssue = () =>
    this.props.postIssueAction(this.props.selectedItems, {
      fetchFunc: this.unselectAndFetchItems,
      eventsInfo: POST_ISSUE_EVENTS_INFO,
    });

  handleIgnoreInAA = () => {
    this.props.tracking.trackEvent(STEP_PAGE_EVENTS.IGNORE_IN_AA_ACTION);
    this.props.ignoreInAutoAnalysisAction(this.props.selectedItems, {
      fetchFunc: this.unselectAndFetchItems,
      eventsInfo: {
        closeIcon: STEP_PAGE_EVENTS.CLOSE_ICON_IGNORE_ITEMS_IN_AA_MODAL,
        cancelBtn: STEP_PAGE_EVENTS.CANCEL_BTN_IGNORE_ITEMS_IN_AA_MODAL,
        ignoreBtn: STEP_PAGE_EVENTS.IGNORE_BTN_IGNORE_ITEMS_IN_AA_MODAL,
      },
    });
  };

  handleIncludeInAA = () => {
    this.props.tracking.trackEvent(STEP_PAGE_EVENTS.INCLUDE_IN_AA_ACTION);
    this.props.includeInAutoAnalysisAction(this.props.selectedItems, {
      fetchFunc: this.unselectAndFetchItems,
      eventsInfo: {
        closeIcon: STEP_PAGE_EVENTS.CLOSE_ICON_INCLUDE_ITEMS_IN_AA_MODAL,
        cancelBtn: STEP_PAGE_EVENTS.CANCEL_BTN_INCLUDE_IN_AA_MODAL,
        includeBtn: STEP_PAGE_EVENTS.INCLUDE_BTN_INCLUDE_IN_AA_MODAL,
      },
    });
  };

  handleEditDefects = (eventData) => {
    const { selectedItems, getDefectType, debugMode } = this.props;
    const items = eventData && eventData.id ? [eventData] : selectedItems;
    const isDefectGroupOperation = isDefectGroupOperationAvailable({
      editedData: eventData,
      selectedItems,
      getDefectType,
      debugMode,
    });
    if (isDefectGroupOperation) {
      this.props.showModalAction({
        id: 'editToInvestigateDefectModal',
        data: {
          item: items[0],
          fetchFunc: this.unselectAndFetchItems,
          eventsInfo: {
            changeSearchMode: STEP_PAGE_EVENTS.CHANGE_SEARCH_MODE_EDIT_DEFECT_MODAL,
            selectAllSimilarItems: STEP_PAGE_EVENTS.SELECT_ALL_SIMILAR_ITEMS_EDIT_DEFECT_MODAL,
            selectSpecificSimilarItem:
              STEP_PAGE_EVENTS.SELECT_SPECIFIC_SIMILAR_ITEM_EDIT_DEFECT_MODAL,
            editDefectsEvents: STEP_PAGE_EVENTS.EDIT_DEFECT_MODAL_EVENTS,
            unlinkIssueEvents: UNLINK_ISSUE_EVENTS_INFO,
            postIssueEvents: POST_ISSUE_EVENTS_INFO,
            linkIssueEvents: LINK_ISSUE_EVENTS_INFO,
          },
        },
      });
    } else {
      this.props.editDefectsAction(items, {
        fetchFunc: this.unselectAndFetchItems,
        debugMode: this.props.debugMode,
        eventsInfo: {
          editDefectsEvents: STEP_PAGE_EVENTS.EDIT_DEFECT_MODAL_EVENTS,
          unlinkIssueEvents: UNLINK_ISSUE_EVENTS_INFO,
          postIssueEvents: POST_ISSUE_EVENTS_INFO,
          linkIssueEvents: LINK_ISSUE_EVENTS_INFO,
        },
      });
    }
  };

  unselectAndFetchItems = () => {
    this.props.unselectAllSteps();
    this.props.fetchTestItemsAction();
  };

  proceedWithValidItems = () => {
    const {
      lastOperation: { operationName, operationArgs },
      selectedItems,
    } = this.props;

    this.props.tracking.trackEvent(STEP_PAGE_EVENTS.PROCEED_VALID_ITEMS);
    this.props.proceedWithValidItemsAction(operationName, selectedItems, operationArgs);
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
      isTestItemsList,
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
            isTestItemsList={isTestItemsList}
            events={STEP_PAGE_EVENTS}
          />
          <StepGrid
            data={steps}
            selectedItems={selectedItems}
            onAllItemsSelect={this.handleAllStepsSelection}
            onItemSelect={this.handleOneItemSelection}
            onItemsSelect={this.props.selectStepsAction}
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
