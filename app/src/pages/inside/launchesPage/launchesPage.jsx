import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import track from 'react-tracking';
import { LAUNCHES_PAGE, LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { LAUNCH_ITEM_TYPES } from 'common/constants/launchItemTypes';
import { levelSelector } from 'controllers/testItem';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { withPagination } from 'controllers/pagination';
import { withSorting, SORTING_DESC } from 'controllers/sorting';
import { showModalAction } from 'controllers/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import {
  debugModeSelector,
  selectedLaunchesSelector,
  toggleLaunchSelectionAction,
  unselectAllLaunchesAction,
  validationErrorsSelector,
  proceedWithValidItemsAction,
  forceFinishLaunchesAction,
  mergeLaunchesAction,
  compareLaunchesAction,
  moveLaunchesAction,
  launchesSelector,
  launchPaginationSelector,
  fetchLaunchesAction,
  lastOperationSelector,
  loadingSelector,
  NAMESPACE,
  toggleAllLaunchesAction,
  deleteItemsAction,
} from 'controllers/launch';
import { LaunchSuiteGrid } from 'pages/inside/common/launchSuiteGrid';
import { LaunchToolbar } from './LaunchToolbar';

const messages = defineMessages({
  deleteModalHeader: {
    id: 'LaunchesPage.deleteModalHeader',
    defaultMessage: 'Delete launch',
  },
  deleteModalMultipleHeader: {
    id: 'LaunchesPage.deleteModalMultipleHeader',
    defaultMessage: 'Delete launches',
  },
  deleteModalContent: {
    id: 'LaunchesPage.deleteModalContent',
    defaultMessage: "Are you sure to delete launch <b>'{name}'</b>? It will no longer exist.",
  },
  deleteModalMultipleContent: {
    id: 'LaunchesPage.deleteModalMultipleContent',
    defaultMessage: 'Are you sure to delete launches? They will no longer exist.',
  },
  warning: {
    id: 'LaunchesPage.warning',
    defaultMessage:
      'You are going to delete not your own launch. This may affect other users information on the project.',
  },
  warningMultiple: {
    id: 'LaunchesPage.warningMultiple',
    defaultMessage:
      'You are going to delete not your own launches. This may affect other users information on the project.',
  },
  success: {
    id: 'LaunchesPage.success',
    defaultMessage: 'Launch was deleted',
  },
  successMultiple: {
    id: 'LaunchesPage.successMultiple',
    defaultMessage: 'Launches were deleted',
  },
  error: {
    id: 'LaunchesPage.error',
    defaultMessage: 'Error when deleting launch',
  },
  errorMultiple: {
    id: 'LaunchesPage.errorMultiple',
    defaultMessage: 'Error when deleting launches',
  },
});

@connect(
  (state) => ({
    debugMode: debugModeSelector(state),
    userId: userIdSelector(state),
    activeProject: activeProjectSelector(state),
    url: URLS.launches(activeProjectSelector(state)),
    selectedLaunches: selectedLaunchesSelector(state),
    validationErrors: validationErrorsSelector(state),
    launches: launchesSelector(state),
    lastOperation: lastOperationSelector(state),
    loading: loadingSelector(state),
    level: levelSelector(state),
  }),
  {
    showModalAction,
    toggleLaunchSelectionAction,
    unselectAllLaunchesAction,
    proceedWithValidItemsAction,
    forceFinishLaunchesAction,
    mergeLaunchesAction,
    compareLaunchesAction,
    moveLaunchesAction,
    fetchLaunchesAction,
    toggleAllLaunchesAction,
    deleteItemsAction,
    showNotification,
    showScreenLockAction,
    hideScreenLockAction,
  },
)
@withSorting({
  defaultSortingColumn: 'start_time',
  defaultSortingDirection: SORTING_DESC,
})
@withPagination({
  paginationSelector: launchPaginationSelector,
  namespace: NAMESPACE,
})
@injectIntl
@track({ page: LAUNCHES_PAGE })
export class LaunchesPage extends Component {
  static propTypes = {
    level: PropTypes.string,
    debugMode: PropTypes.bool.isRequired,
    userId: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    launches: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    showModalAction: PropTypes.func,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    onChangeSorting: PropTypes.func,
    activeProject: PropTypes.string.isRequired,
    selectedLaunches: PropTypes.arrayOf(PropTypes.object),
    validationErrors: PropTypes.object,
    toggleAllLaunchesAction: PropTypes.func,
    unselectAllLaunchesAction: PropTypes.func,
    proceedWithValidItemsAction: PropTypes.func,
    toggleLaunchSelectionAction: PropTypes.func,
    forceFinishLaunchesAction: PropTypes.func,
    mergeLaunchesAction: PropTypes.func,
    compareLaunchesAction: PropTypes.func,
    moveLaunchesAction: PropTypes.func,
    lastOperation: PropTypes.string,
    loading: PropTypes.bool,
    fetchLaunchesAction: PropTypes.func,
    showNotification: PropTypes.func.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    deleteItemsAction: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    level: '',
    launches: [],
    activePage: 1,
    itemCount: null,
    pageCount: null,
    pageSize: 20,
    sortingColumn: null,
    sortingDirection: null,
    showModalAction: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    onChangeSorting: () => {},
    selectedLaunches: [],
    validationErrors: {},
    toggleAllLaunchesAction: () => {},
    unselectAllLaunchesAction: () => {},
    proceedWithValidItemsAction: () => {},
    toggleLaunchSelectionAction: () => {},
    forceFinishLaunchesAction: () => {},
    mergeLaunchesAction: () => {},
    compareLaunchesAction: () => {},
    moveLaunchesAction: () => {},
    lastOperation: '',
    loading: false,
    fetchLaunchesAction: () => {},
    deleteItemsAction: () => {},
  };

  componentWillUnmount() {
    this.props.unselectAllLaunchesAction();
  }

  deleteItem = (id) => {
    fetch(URLS.launches(this.props.activeProject, id), {
      method: 'delete',
    }).then(this.props.fetchLaunchesAction);
  };
  confirmDeleteItem = (item) => {
    this.props.showModalAction({
      id: 'launchDeleteModal',
      data: { item, onConfirm: () => this.deleteItem(item.id) },
    });
  };

  confirmDeleteItems = (items) => {
    const ids = items.map((item) => item.id).join(',');
    this.props.showScreenLockAction();
    fetch(URLS.launches(this.props.activeProject, ids), {
      method: 'delete',
    })
      .then(() => {
        this.props.fetchLaunchesAction();
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message:
            this.props.selectedLaunches.length === 1
              ? this.props.intl.formatMessage(messages.success)
              : this.props.intl.formatMessage(messages.successMultiple),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.showNotification({
          message:
            this.props.selectedLaunches.length === 1
              ? this.props.intl.formatMessage(messages.error)
              : this.props.intl.formatMessage(messages.errorMultiple),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  deleteItems = () => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_DELETE_ACTION);
    const { selectedLaunches, intl, userId } = this.props;
    this.props.deleteItemsAction(this.props.selectedLaunches, {
      onConfirm: this.confirmDeleteItems,
      header:
        selectedLaunches.length === 1
          ? intl.formatMessage(messages.deleteModalHeader)
          : intl.formatMessage(messages.deleteModalMultipleHeader),
      mainContent:
        selectedLaunches.length === 1
          ? intl.formatMessage(messages.deleteModalContent, { name: selectedLaunches[0].name })
          : intl.formatMessage(messages.deleteModalMultipleContent),
      userId,
      warning:
        selectedLaunches.length === 1
          ? intl.formatMessage(messages.warning)
          : intl.formatMessage(messages.warningMultiple),
    });
  };

  finishForceLaunches = (eventData) => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_FORCE_FINISH_ACTION);
    const launches = eventData && eventData.id ? [eventData] : this.props.selectedLaunches;
    this.props.forceFinishLaunchesAction(launches, {
      fetchFunc: this.props.fetchLaunchesAction,
    });
  };

  openEditModal = (launch) => {
    this.props.showModalAction({
      id: 'editItemModal',
      data: {
        item: launch,
        type: LAUNCH_ITEM_TYPES.launch,
        fetchFunc: this.props.fetchLaunchesAction,
      },
    });
  };
  openImportModal = () => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_IMPORT_BTN);
    this.props.showModalAction({
      id: 'launchImportModal',
      data: {
        onImport: this.props.fetchLaunchesAction,
      },
    });
  };

  handleAllLaunchesSelection = () => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_SELECT_ALL_ICON);
    this.props.toggleAllLaunchesAction(this.props.launches);
  };

  handleOneLaunchSelection = (value) => {
    !this.props.level && this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_SELECT_ONE_ITEM);
    this.props.toggleLaunchSelectionAction(value);
  };

  proceedWithValidItems = () =>
    this.props.proceedWithValidItemsAction(this.props.lastOperation, this.props.selectedLaunches);

  mergeLaunches = () => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_MERGE_ACTION);
    this.props.mergeLaunchesAction(this.props.selectedLaunches, {
      fetchFunc: this.props.fetchLaunchesAction,
    });
  };

  moveLaunches = (eventData) => {
    const launches = eventData && eventData.id ? [eventData] : this.props.selectedLaunches;
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_MOVE_TO_DEBUG_LAUNCH_MENU);
    this.props.moveLaunchesAction(launches, {
      fetchFunc: this.props.fetchLaunchesAction,
      debugMode: this.props.debugMode,
    });
  };

  compareLaunches = () => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_COMPARE_ACTION);
    this.props.compareLaunchesAction(this.props.selectedLaunches);
  };

  unselectAllItems = () => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_CLOSE_ICON_ALL_SELECTION);
    this.props.unselectAllLaunchesAction();
  };

  unselectItem = (item) => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_CLOSE_ICON_FROM_SELECTION);
    this.props.toggleLaunchSelectionAction(item);
  };

  render() {
    const {
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
      launches,
      loading,
      debugMode,
    } = this.props;
    return (
      <PageLayout>
        <PageSection>
          <LaunchToolbar
            errors={this.props.validationErrors}
            onRefresh={this.props.fetchLaunchesAction}
            selectedLaunches={selectedLaunches}
            onUnselect={this.unselectItem}
            onUnselectAll={this.unselectAllItems}
            onProceedValidItems={this.proceedWithValidItems}
            onMove={this.moveLaunches}
            onMerge={this.mergeLaunches}
            onForceFinish={this.finishForceLaunches}
            onCompare={this.compareLaunches}
            onImportLaunch={this.openImportModal}
            debugMode={debugMode}
            onDelete={this.deleteItems}
          />
          <LaunchSuiteGrid
            data={launches}
            sortingColumn={sortingColumn}
            sortingDirection={sortingDirection}
            onChangeSorting={onChangeSorting}
            onDeleteItem={this.confirmDeleteItem}
            onMove={this.moveLaunches}
            onEditItem={this.openEditModal}
            onForceFinish={this.finishForceLaunches}
            selectedItems={selectedLaunches}
            onItemSelect={this.handleOneLaunchSelection}
            onAllItemsSelect={this.handleAllLaunchesSelection}
            withHamburger
            loading={loading}
            events={LAUNCHES_PAGE_EVENTS}
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
