import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PageLayout } from 'layouts/pageLayout';
import { SuiteTestToolbar } from 'pages/inside/common/suiteTestToolbar';
import {
  parentItemSelector,
  loadingSelector,
  fetchTestItemsAction,
  isListViewSelector,
  namespaceSelector,
} from 'controllers/testItem';
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
} from 'controllers/step';
import { withPagination } from 'controllers/pagination';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { StepGrid } from './stepGrid';

@connect(
  (state) => ({
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
  },
)
@withPagination({
  paginationSelector: stepPaginationSelector,
  namespaceSelector,
})
export class StepPage extends Component {
  static propTypes = {
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
  };

  static defaultProps = {
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
  };

  handleAllStepsSelection = () => {
    const { selectedItems, steps } = this.props;
    if (steps.length === selectedItems.length) {
      this.props.unselectAllSteps();
      return;
    }
    this.props.selectStepsAction(steps);
  };

  proceedWithValidItems = () =>
    this.props.proceedWithValidItemsAction(this.props.lastOperation, this.props.selectedItems);

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
    } = this.props;
    return (
      <PageLayout>
        <SuiteTestToolbar
          errors={validationErrors}
          selectedItems={selectedItems}
          parentItem={parentItem}
          onUnselect={toggleStepSelection}
          onUnselectAll={unselectAllSteps}
          onProceedValidItems={this.proceedWithValidItems}
          onRefresh={this.props.fetchTestItemsAction}
        />
        <StepGrid
          data={steps}
          selectedItems={selectedItems}
          onAllItemsSelect={this.handleAllStepsSelection}
          onItemSelect={toggleStepSelection}
          loading={loading}
          listView={listView}
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
