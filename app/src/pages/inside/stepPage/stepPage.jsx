import { Component } from 'react';
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
} from 'controllers/step';
import { withPagination } from 'controllers/pagination';
import { showModalAction } from 'controllers/modal';
import { PaginationToolbar } from 'components/main/paginationToolbar';
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
  }),
  {
    unselectAllSteps: unselectAllStepsAction,
    toggleStepSelection: toggleStepSelectionAction,
    proceedWithValidItemsAction,
    selectStepsAction,
    fetchTestItemsAction,
    showTestParamsModal: (item) => showModalAction({ id: 'testItemDetails', data: { item } }),
    ignoreInAutoAnalysisAction,
    includeInAutoAnalysisAction,
    unlinkIssueAction,
    editDefectsAction,
    linkIssueAction,
  },
)
@withPagination({
  paginationSelector: stepPaginationSelector,
  namespaceSelector,
})
export class StepPage extends Component {
  static propTypes = {
    deleteItems: PropTypes.func,
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
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    showTestParamsModal: PropTypes.func,
    ignoreInAutoAnalysisAction: PropTypes.func,
    includeInAutoAnalysisAction: PropTypes.func,
    unlinkIssueAction: PropTypes.func,
    editDefectsAction: PropTypes.func.isRequired,
    linkIssueAction: PropTypes.func,
    onFilterAdd: PropTypes.func,
    onFilterRemove: PropTypes.func,
    onFilterValidate: PropTypes.func,
    onFilterChange: PropTypes.func,
    filterErrors: PropTypes.object,
    filterEntities: PropTypes.array,
  };

  static defaultProps = {
    deleteItems: () => {},
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
    pageSize: 20,
    onChangePage: () => {},
    onChangePageSize: () => {},
    showTestParamsModal: () => {},
    ignoreInAutoAnalysisAction: () => {},
    includeInAutoAnalysisAction: () => {},
    unlinkIssueAction: () => {},
    linkIssueAction: () => {},
    onFilterAdd: () => {},
    onFilterRemove: () => {},
    onFilterValidate: () => {},
    onFilterChange: () => {},
    filterErrors: {},
    filterEntities: [],
  };

  handleAllStepsSelection = () => {
    const { selectedItems, steps } = this.props;
    if (steps.length === selectedItems.length) {
      this.props.unselectAllSteps();
      return;
    }
    this.props.selectStepsAction(steps);
  };

  handleUnlinkIssue = () =>
    this.props.unlinkIssueAction(this.props.selectedItems, {
      fetchFunc: this.props.fetchTestItemsAction,
    });

  handleLinkIssue = () =>
    this.props.linkIssueAction(this.props.selectedItems, {
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
    this.props.editDefectsAction(items, {
      fetchFunc: this.props.fetchTestItemsAction,
    });
  };

  proceedWithValidItems = () =>
    this.props.proceedWithValidItemsAction(this.props.lastOperation, this.props.selectedItems);

  deleteItems = () => {
    const { selectedItems, deleteItems } = this.props;
    deleteItems(selectedItems);
  };

  render() {
    const {
      parentItem,
      steps,
      selectedItems,
      toggleStepSelection,
      unselectAllSteps,
      validationErrors,
      loading,
      listView,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      showTestParamsModal,
      debugMode,
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
            onDelete={this.deleteItems}
            errors={validationErrors}
            selectedItems={selectedItems}
            parentItem={parentItem}
            onUnselect={toggleStepSelection}
            onUnselectAll={unselectAllSteps}
            onProceedValidItems={this.proceedWithValidItems}
            onRefresh={this.props.fetchTestItemsAction}
            debugMode={debugMode}
            onEditDefects={this.handleEditDefects}
            onIgnoreInAA={this.handleIgnoreInAA}
            onIncludeInAA={this.handleIncludeInAA}
            onUnlinkIssue={this.handleUnlinkIssue}
            onLinkIssue={this.handleLinkIssue}
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
            onItemSelect={toggleStepSelection}
            loading={loading}
            listView={listView}
            onShowTestParams={showTestParamsModal}
            onEditDefect={this.handleEditDefects}
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
