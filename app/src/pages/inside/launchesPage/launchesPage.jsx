import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { PageLayout } from 'layouts/pageLayout';
import { fetch } from 'common/utils';
import { DEBUG } from 'common/constants/common';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { withPagination } from 'controllers/pagination';
import { withSorting, SORTING_DESC } from 'controllers/sorting';
import { showModalAction } from 'controllers/modal';
import {
  selectedLaunchesSelector,
  toggleLaunchSelectionAction,
  selectLaunchesAction,
  unselectAllLaunchesAction,
  validationErrorsSelector,
  proceedWithValidItemsAction,
  mergeLaunchesAction,
  compareLaunchesAction,
} from 'controllers/launch';
import { LaunchSuiteGrid } from './launchSuiteGrid';
import { LaunchToolbar } from './LaunchToolbar';

const messages = defineMessages({
  filtersPageTitle: {
    id: 'LaunchesPage.title',
    defaultMessage: 'Launches',
  },
});

@connect(
  (state) => ({
    userId: userIdSelector(state),
    url: `/api/v1/${activeProjectSelector(state)}/launch`,
    selectedLaunches: selectedLaunchesSelector(state),
    validationErrors: validationErrorsSelector(state),
  }),
  {
    showModalAction,
    toggleLaunchSelectionAction,
    selectAllLaunchesAction: selectLaunchesAction,
    unselectAllLaunchesAction,
    proceedWithValidItemsAction,
    mergeLaunchesAction,
    compareLaunchesAction,
  },
)
@withSorting({
  defaultSortingColumn: 'start_time',
  defaultSortingDirection: SORTING_DESC,
})
@withPagination()
@injectIntl
export class LaunchesPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    fetchData: PropTypes.func,
    showModalAction: PropTypes.func,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    onChangeSorting: PropTypes.func,
    url: PropTypes.string.isRequired,
    selectedLaunches: PropTypes.arrayOf(PropTypes.object),
    validationErrors: PropTypes.object,
    selectAllLaunchesAction: PropTypes.func,
    unselectAllLaunchesAction: PropTypes.func,
    proceedWithValidItemsAction: PropTypes.func,
    toggleLaunchSelectionAction: PropTypes.func,
    mergeLaunchesAction: PropTypes.func,
    compareLaunchesAction: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: null,
    sortingColumn: null,
    sortingDirection: null,
    showModalAction: () => {},
    fetchData: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    onChangeSorting: () => {},
    selectedLaunches: [],
    validationErrors: {},
    selectAllLaunchesAction: () => {},
    unselectAllLaunchesAction: () => {},
    proceedWithValidItemsAction: () => {},
    toggleLaunchSelectionAction: () => {},
    mergeLaunchesAction: () => {},
    compareLaunchesAction: () => {},
  };

  getTitle = () =>
    !this.props.selectedLaunches.length && this.props.intl.formatMessage(messages.filtersPageTitle);

  updateLaunch = (launch) => {
    fetch(`${this.props.url}/${launch.id}/update`, {
      method: 'put',
      data: launch,
    }).then(this.props.fetchData);
  };
  deleteItem = (id) => {
    fetch(this.props.url, {
      method: 'delete',
      params: {
        ids: id,
      },
    }).then(this.props.fetchData);
  };
  moveToDebug = (id) => {
    fetch(`${this.props.url}/update`, {
      method: 'put',
      data: {
        entities: {
          [id]: {
            mode: DEBUG.toUpperCase(),
          },
        },
      },
    }).then(this.props.fetchData);
  };
  confirmDeleteItem = (item) => {
    this.props.showModalAction({
      id: 'launchDeleteModal',
      data: { item, onConfirm: () => this.deleteItem(item.id) },
    });
  };
  confirmMoveToDebug = (item) => {
    this.props.showModalAction({
      id: 'moveToDebugModal',
      data: { onConfirm: () => this.moveToDebug(item.id) },
    });
  };
  openEditModal = (launch) => {
    this.props.showModalAction({
      id: 'launchEditModal',
      data: { launch, onEdit: this.updateLaunch },
    });
  };

  handleAllLaunchesSelection = () => {
    const { selectedLaunches, data: launches } = this.props;
    if (launches.length === selectedLaunches.length) {
      this.props.unselectAllLaunchesAction();
      return;
    }
    this.props.selectAllLaunchesAction(launches);
  };

  proceedWithValidItems = () => this.props.proceedWithValidItemsAction(this.props.fetchData);

  mergeLaunches = () => this.props.mergeLaunchesAction(this.props.fetchData);

  render() {
    const {
      data,
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      sortingColumn,
      sortingDirection,
      onChangeSorting,
      selectedLaunches,
    } = this.props;

    return (
      <PageLayout title={this.getTitle()}>
        <LaunchToolbar
          errors={this.props.validationErrors}
          selectedLaunches={selectedLaunches}
          onUnselect={this.props.toggleLaunchSelectionAction}
          onUnselectAll={this.props.unselectAllLaunchesAction}
          onProceedValidItems={this.proceedWithValidItems}
          onMerge={this.mergeLaunches}
          onCompare={this.props.compareLaunchesAction}
        />
        <LaunchSuiteGrid
          data={data}
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
          onDeleteItem={this.confirmDeleteItem}
          onMoveToDebug={this.confirmMoveToDebug}
          onEditLaunch={this.openEditModal}
          selectedLaunches={selectedLaunches}
          onLaunchSelect={this.props.toggleLaunchSelectionAction}
          onAllLaunchesSelect={this.handleAllLaunchesSelection}
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
