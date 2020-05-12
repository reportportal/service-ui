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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import track from 'react-tracking';
import isEqual from 'fast-deep-equal';
import {
  LAUNCHES_PAGE,
  LAUNCHES_PAGE_EVENTS,
  LAUNCHES_MODAL_EVENTS,
} from 'components/main/analytics/events';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { LAUNCH_ITEM_TYPES } from 'common/constants/launchItemTypes';
import { ANALYZER_TYPES } from 'common/constants/analyzerTypes';
import { IN_PROGRESS } from 'common/constants/testStatuses';
import { levelSelector } from 'controllers/testItem';
import { PaginationToolbar } from 'components/main/paginationToolbar';
import { MODAL_TYPE_IMPORT_LAUNCH } from 'pages/common/modals/importModal/constants';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { projectConfigSelector } from 'controllers/project';
import { withPagination, DEFAULT_PAGINATION, SIZE_KEY, PAGE_KEY } from 'controllers/pagination';
import { showModalAction } from 'controllers/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import {
  debugModeSelector,
  selectedLaunchesSelector,
  toggleLaunchSelectionAction,
  selectLaunchesAction,
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
  updateLaunchLocallyAction,
  updateLaunchesLocallyAction,
} from 'controllers/launch';
import { prevTestItemSelector } from 'controllers/pages';
import { LaunchSuiteGrid } from 'pages/inside/common/launchSuiteGrid';
import { LaunchFiltersContainer } from 'pages/inside/common/launchFiltersContainer';
import { LEVEL_LAUNCH } from 'common/constants/launchLevels';
import { FilterEntitiesContainer } from 'components/filterEntities/containers';
import { LaunchFiltersToolbar } from 'pages/inside/common/launchFiltersToolbar';
import { ALL } from 'common/constants/reservedFilterIds';
import { RefineFiltersPanel } from 'pages/inside/common/refineFiltersPanel';
import { LaunchToolbar } from './LaunchToolbar';
import { DebugFiltersContainer } from './debugFiltersContainer';

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
    defaultMessage:
      "Are you sure you want to delete launch <b>''{name}''</b>? It will no longer exist.",
  },
  deleteModalMultipleContent: {
    id: 'LaunchesPage.deleteModalMultipleContent',
    defaultMessage: 'Are you sure you want to delete launches? They will no longer exist.',
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
  analyseStartSuccess: {
    id: 'LaunchesPage.analyseStartSuccess',
    defaultMessage: 'Auto-analyzer has been started.',
  },
  patternAnalyseStartSuccess: {
    id: 'LaunchesPage.patternAnalyseStartSuccess',
    defaultMessage: 'Pattern analyzer has been started.',
  },
  addWidgetSuccess: {
    id: 'LaunchesPage.addWidgetSuccess',
    defaultMessage: 'Widget has been added',
  },
  modalTitle: {
    id: 'LaunchesPage.modalTitle',
    defaultMessage: 'Import Launch',
  },
  importButton: {
    id: 'LaunchesPage.importButton',
    defaultMessage: 'Import',
  },
  importTip: {
    id: 'LaunchesPage.tip',
    defaultMessage:
      'Drop only <b>.zip</b> file under 32 MB to upload or <span>click</span> to add it',
  },
  noteMessage: {
    id: 'LaunchesPage.noteMessage',
    defaultMessage:
      'If your runner does not write the test start time in .xml file, then the current server time will be used.',
  },
  importConfirmationWarning: {
    id: 'LaunchesPage.importConfirmationWarning',
    defaultMessage: 'Are you sure you want to interrupt import launches?',
  },
  incorrectFileSize: {
    id: 'LaunchesPage.incorrectFileSize',
    defaultMessage: 'File size is more than 32 Mb',
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
    projectSetting: projectConfigSelector(state),
    highlightItemId: prevTestItemSelector(state),
  }),
  {
    showModalAction,
    toggleLaunchSelectionAction,
    selectLaunchesAction,
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
    updateLaunchLocallyAction,
    updateLaunchesLocallyAction,
  },
)
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
    intl: PropTypes.object.isRequired,
    launches: PropTypes.arrayOf(PropTypes.object),
    activePage: PropTypes.number,
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageSize: PropTypes.number,
    showModalAction: PropTypes.func,
    onChangePage: PropTypes.func,
    onChangePageSize: PropTypes.func,
    sortingString: PropTypes.string,
    activeProject: PropTypes.string.isRequired,
    selectedLaunches: PropTypes.arrayOf(PropTypes.object),
    validationErrors: PropTypes.object,
    toggleAllLaunchesAction: PropTypes.func,
    unselectAllLaunchesAction: PropTypes.func,
    proceedWithValidItemsAction: PropTypes.func,
    toggleLaunchSelectionAction: PropTypes.func,
    selectLaunchesAction: PropTypes.func,
    forceFinishLaunchesAction: PropTypes.func,
    mergeLaunchesAction: PropTypes.func,
    compareLaunchesAction: PropTypes.func,
    moveLaunchesAction: PropTypes.func,
    lastOperation: PropTypes.object,
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
    projectSetting: PropTypes.object.isRequired,
    updateLaunchLocallyAction: PropTypes.func.isRequired,
    updateLaunchesLocallyAction: PropTypes.func.isRequired,
    highlightItemId: PropTypes.number,
  };

  static defaultProps = {
    level: '',
    launches: [],
    activePage: DEFAULT_PAGINATION[PAGE_KEY],
    itemCount: null,
    pageCount: null,
    pageSize: DEFAULT_PAGINATION[SIZE_KEY],
    showModalAction: () => {},
    onChangePage: () => {},
    onChangePageSize: () => {},
    sortingString: '',
    selectedLaunches: [],
    validationErrors: {},
    toggleAllLaunchesAction: () => {},
    unselectAllLaunchesAction: () => {},
    proceedWithValidItemsAction: () => {},
    toggleLaunchSelectionAction: () => {},
    selectLaunchesAction: () => {},
    forceFinishLaunchesAction: () => {},
    mergeLaunchesAction: () => {},
    compareLaunchesAction: () => {},
    moveLaunchesAction: () => {},
    lastOperation: {},
    loading: false,
    fetchLaunchesAction: () => {},
    deleteItemsAction: () => {},
    highlightItemId: null,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    return prevState.prevLaunches !== nextProps.launches
      ? {
          prevLaunches: nextProps.launches,
          launchesInProgress: nextProps.launches
            .filter((item) => item.status === IN_PROGRESS)
            .map((item) => item.id),
        }
      : null;
  }

  state = {
    highlightedRowId: null,
    isGridRowHighlighted: false,
    prevLaunches: [],
    launchesInProgress: [],
    finishedLaunchesCount: null,
  };

  componentDidUpdate(prevProps) {
    if (!this.state.launchesInProgress.length && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.state.launchesInProgress.length && !this.intervalId) {
      this.intervalId = setInterval(
        () => this.fetchLaunchStatus(this.state.launchesInProgress),
        5000,
      );
    }
    if (
      this.props.loading !== prevProps.loading &&
      this.props.loading === false &&
      !this.state.highlightedRowId &&
      this.props.highlightItemId
    ) {
      this.onHighlightRow(this.props.highlightItemId);
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
    this.props.unselectAllLaunchesAction();
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

  onAnalysis = (launch) => {
    const {
      projectSetting: { attributes },
      tracking: { trackEvent },
    } = this.props;
    trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_ANALYSIS_LAUNCH_MENU);
    this.props.showModalAction({
      id: 'analysisLaunchModal',
      data: {
        item: launch,
        onConfirm: (data) => this.autoAnalyseItem(launch, data),
        analyzerMode: attributes['analyzer.autoAnalyzerMode'],
      },
    });
  };
  onPatternAnalysis = (launch) => {
    const {
      tracking: { trackEvent },
    } = this.props;
    trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_PATTERN_ANALYSIS_LAUNCH_MENU);
    this.props.showModalAction({
      id: 'launchPatternAnalysisModal',
      data: {
        item: launch,
        onConfirm: (data) => this.patternAnalyseItem(launch, data),
      },
    });
  };
  onAddDashBoard = (dashboard) => {
    const { activeProject } = this.props;
    if (dashboard.id) {
      return Promise.resolve(dashboard);
    }
    return fetch(URLS.dashboards(activeProject), {
      method: 'post',
      data: dashboard,
    });
  };
  onAddWidget = (widget, closeModal, dashboard) => {
    const {
      activeProject,
      intl: { formatMessage },
    } = this.props;
    this.onAddDashBoard(dashboard).then(({ id }) => {
      fetch(URLS.addDashboardWidget(activeProject, id), {
        method: 'put',
        data: { addWidget: widget },
      })
        .then(() => {
          this.props.hideScreenLockAction();
          closeModal();
          this.props.showNotification({
            message: formatMessage(messages.addWidgetSuccess),
            type: NOTIFICATION_TYPES.SUCCESS,
          });
        })
        .catch((err) => {
          this.props.hideScreenLockAction();
          this.props.showNotification({ message: err.message, type: NOTIFICATION_TYPES.ERROR });
        });
    });
  };
  showWidgetWizard = () => {
    const {
      tracking: { trackEvent },
    } = this.props;
    trackEvent(LAUNCHES_PAGE.ADD_NEW_WIDGET_BTN);
    this.props.showModalAction({
      id: 'widgetWizardModal',
      data: {
        onConfirm: this.onAddWidget,
        eventsInfo: {
          closeIcon: LAUNCHES_MODAL_EVENTS.CLOSE_ICON_ADD_WIDGET_MODAL,
          chooseWidgetType: LAUNCHES_MODAL_EVENTS.CHOOSE_WIDGET_TYPE_ADD_WIDGET_MODAL,
          nextStep: LAUNCHES_MODAL_EVENTS.NEXT_STEP_ADD_WIDGET_MODAL,
          prevStep: LAUNCHES_MODAL_EVENTS.PREVIOUS_STEP_ADD_WIDGET_MODAL,
          changeDescription: LAUNCHES_MODAL_EVENTS.ENTER_WIDGET_DESCRIPTION_ADD_WIDGET_MODAL,
          shareWidget: LAUNCHES_MODAL_EVENTS.SHARE_WIDGET_ADD_WIDGET_MODAL,
          addWidget: LAUNCHES_MODAL_EVENTS.ADD_BTN_ADD_WIDGET_MODAL,
        },
      },
    });
  };
  autoAnalyseItem = (launch, data) => {
    const {
      activeProject,
      intl: { formatMessage },
    } = this.props;
    fetch(URLS.launchAnalyze(activeProject), {
      method: 'POST',
      data: {
        ...data,
        analyzerTypeName: ANALYZER_TYPES.AUTO_ANALYZER,
      },
    })
      .then(() => {
        this.props.showNotification({
          message: formatMessage(messages.analyseStartSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        const item = {
          ...launch,
          autoAnalyzing: true,
        };
        this.props.updateLaunchLocallyAction(item);
      })
      .catch((error) => {
        this.props.showNotification({
          message: error.message,
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  patternAnalyseItem = (launch, data) => {
    const {
      activeProject,
      intl: { formatMessage },
    } = this.props;
    fetch(URLS.launchAnalyze(activeProject), {
      method: 'POST',
      data: {
        ...data,
        analyzerTypeName: ANALYZER_TYPES.PATTERN_ANALYSER,
      },
    })
      .then(() => {
        this.props.showNotification({
          message: formatMessage(messages.patternAnalyseStartSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        const item = {
          ...launch,
          patternAnalyzing: true,
        };
        this.props.updateLaunchLocallyAction(item);
      })
      .catch((error) => {
        this.props.showNotification({
          message: error.message,
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  unselectAndFetchLaunches = () => {
    this.props.unselectAllLaunchesAction();
    this.props.fetchLaunchesAction();
  };

  unselectAndResetPage = () => {
    this.props.unselectAllLaunchesAction();
    if (this.props.activePage === 1) {
      this.props.fetchLaunchesAction();
    } else {
      this.resetPageNumber();
    }
  };

  deleteItem = (item) => this.deleteItems([item]);

  confirmDeleteItems = (items) => {
    const ids = items.map((item) => item.id);
    this.props.showScreenLockAction();
    fetch(URLS.launches(this.props.activeProject), {
      method: 'delete',
      data: {
        ids,
      },
    })
      .then(() => {
        this.unselectAndFetchLaunches();
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message:
            items.length === 1
              ? this.props.intl.formatMessage(messages.success)
              : this.props.intl.formatMessage(messages.successMultiple),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message:
            items.length === 1
              ? this.props.intl.formatMessage(messages.error)
              : this.props.intl.formatMessage(messages.errorMultiple),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  isNotAllOwnLaunches = (launches) => {
    const { userId } = this.props;
    return launches.some((launch) => launch.owner !== userId);
  };

  deleteItems = (launches) => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_DELETE_ACTION);
    const { intl, userId } = this.props;
    const selectedLaunches = launches || this.props.selectedLaunches;
    const warning =
      this.isNotAllOwnLaunches(selectedLaunches) &&
      (selectedLaunches.length === 1
        ? intl.formatMessage(messages.warning)
        : intl.formatMessage(messages.warningMultiple));

    this.props.deleteItemsAction(selectedLaunches, {
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
      warning,
      eventsInfo: {
        closeIcon: LAUNCHES_MODAL_EVENTS.CLOSE_ICON_DELETE_MODAL,
        cancelBtn: LAUNCHES_MODAL_EVENTS.CANCEL_BTN_DELETE_MODAL,
        deleteBtn: LAUNCHES_MODAL_EVENTS.DELETE_BTN_DELETE_MODAL,
      },
    });
  };

  finishForceLaunches = (eventData) => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_FORCE_FINISH_ACTION);
    const launches = eventData && eventData.id ? [eventData] : this.props.selectedLaunches;
    this.props.forceFinishLaunchesAction(launches, {
      fetchFunc: this.unselectAndFetchLaunches,
    });
  };

  fetchLaunchStatus = (launches) => {
    fetch(URLS.launchStatus(this.props.activeProject, launches), {
      method: 'get',
    }).then((launchesWithStatus) => {
      const newLaunchesInProgress = this.state.launchesInProgress.filter(
        (item) => launchesWithStatus[item] === IN_PROGRESS,
      );

      if (!isEqual(this.state.launchesInProgress, newLaunchesInProgress)) {
        const { finishedLaunchesCount, launchesInProgress } = this.state;
        const diff = launchesInProgress.length - newLaunchesInProgress.length;
        const newFinishedLaunchesCount = finishedLaunchesCount
          ? finishedLaunchesCount + diff
          : diff;

        const newLaunchesData = this.props.launches
          .filter((item) => !item.endTime && !newLaunchesInProgress.includes(item.id))
          .map((item) => ({
            ...item,
            endTime: Date.now(),
            status: launchesWithStatus[item.id],
          }));

        this.props.updateLaunchesLocallyAction(newLaunchesData);

        this.setState({
          launchesInProgress: newLaunchesInProgress,
          finishedLaunchesCount: newFinishedLaunchesCount,
        });
      }
    });
  };

  openEditModal = (launch) => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_EDIT_LAUNCH_ACTION);
    this.props.showModalAction({
      id: 'editItemModal',
      data: {
        item: launch,
        type: LAUNCH_ITEM_TYPES.launch,
        fetchFunc: this.props.fetchLaunchesAction,
        eventsInfo: LAUNCHES_MODAL_EVENTS.EDIT_ITEMS_MODAL_EVENTS,
      },
    });
  };

  openEditItemsModal = (launches) => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_EDIT_LAUNCHES_ACTION);
    this.props.showModalAction({
      id: 'editItemsModal',
      data: {
        items: launches,
        type: LAUNCH_ITEM_TYPES.launch,
        fetchFunc: this.unselectAndFetchLaunches,
        eventsInfo: {
          cancelBtn: LAUNCHES_MODAL_EVENTS.EDIT_ITEMS_MODAL_EVENTS.CANCEL_BTN_EDIT_ITEM_MODAL,
          closeIcon: LAUNCHES_MODAL_EVENTS.EDIT_ITEMS_MODAL_EVENTS.CLOSE_ICON_EDIT_ITEM_MODAL,
          saveBtn: LAUNCHES_MODAL_EVENTS.EDIT_ITEMS_MODAL_EVENTS.SAVE_BTN_EDIT_ITEM_MODAL,
          editDescription:
            LAUNCHES_MODAL_EVENTS.EDIT_ITEMS_MODAL_EVENTS.BULK_EDIT_ITEMS_DESCRIPTION,
        },
      },
    });
  };

  openImportModal = () => {
    const {
      intl: { formatMessage },
      activeProject,
    } = this.props;

    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_IMPORT_BTN);
    this.props.showModalAction({
      id: 'importModal',
      data: {
        type: MODAL_TYPE_IMPORT_LAUNCH,
        onImport: this.props.fetchLaunchesAction,
        title: formatMessage(messages.modalTitle),
        importButton: formatMessage(messages.importButton),
        tip: formatMessage(messages.importTip),
        incorrectFileSize: formatMessage(messages.incorrectFileSize),
        noteMessage: formatMessage(messages.noteMessage),
        importConfirmationWarning: formatMessage(messages.importConfirmationWarning),
        url: URLS.launchImport(activeProject),
        eventsInfo: {
          okBtn: LAUNCHES_MODAL_EVENTS.OK_BTN_IMPORT_MODAL,
          cancelBtn: LAUNCHES_MODAL_EVENTS.CANCEL_BTN_IMPORT_MODAL,
          closeIcon: LAUNCHES_MODAL_EVENTS.CLOSE_ICON_IMPORT_MODAL,
        },
      },
    });
  };

  resetPageNumber = () => {
    if (this.props.activePage !== 1) {
      this.props.onChangePage(1);
    }
  };

  refreshLaunch = () => {
    this.setState({
      finishedLaunchesCount: null,
    });
    this.props.fetchLaunchesAction();
  };

  handleAllLaunchesSelection = () => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_SELECT_ALL_ICON);
    this.props.toggleAllLaunchesAction(this.props.launches);
  };

  handleOneLaunchSelection = (value) => {
    !this.props.level && this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_SELECT_ONE_ITEM);
    this.props.toggleLaunchSelectionAction(value);
  };

  proceedWithValidItems = () => {
    const {
      lastOperation: { operationName, operationArgs },
      selectedLaunches,
    } = this.props;

    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_PROCEED_ITEMS_BUTTON);
    this.props.proceedWithValidItemsAction(operationName, selectedLaunches, operationArgs);
  };

  mergeLaunches = () => {
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_MERGE_ACTION);
    this.props.mergeLaunchesAction(this.props.selectedLaunches, {
      fetchFunc: this.unselectAndResetPage,
    });
  };

  moveLaunches = (eventData) => {
    const launches = eventData && eventData.id ? [eventData] : this.props.selectedLaunches;
    this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_MOVE_TO_DEBUG_LAUNCH_MENU);
    this.props.moveLaunchesAction(launches, {
      fetchFunc: this.unselectAndFetchLaunches,
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

  renderPageContent = ({
    launchFilters,
    activeFilterId,
    activeFilter,
    activeFilterConditions,
    onRemoveFilter,
    onChangeFilter,
    onResetFilter,
    sortingColumn,
    sortingDirection,
    onChangeSorting,
  }) => {
    const {
      activePage,
      itemCount,
      pageCount,
      pageSize,
      onChangePage,
      onChangePageSize,
      selectedLaunches,
      launches,
      loading,
      debugMode,
    } = this.props;

    const rowHighlightingConfig = {
      onGridRowHighlighted: this.onGridRowHighlighted,
      isGridRowHighlighted: this.state.isGridRowHighlighted,
      highlightedRowId: this.state.highlightedRowId,
    };

    const { finishedLaunchesCount } = this.state;

    return (
      <FilterEntitiesContainer
        level={LEVEL_LAUNCH}
        entities={activeFilterConditions}
        onChange={onChangeFilter}
        render={({ onFilterAdd, ...rest }) => (
          <PageLayout>
            <PageSection>
              {!debugMode && !selectedLaunches.length && (
                <LaunchFiltersToolbar
                  filters={launchFilters}
                  activeFilterId={activeFilterId}
                  activeFilter={activeFilter}
                  onRemoveFilter={onRemoveFilter}
                  onFilterAdd={onFilterAdd}
                  onResetFilter={onResetFilter}
                  onChangeSorting={onChangeSorting}
                  sortingString={sortingColumn}
                  {...rest}
                />
              )}
            </PageSection>
            <PageSection>
              <LaunchToolbar
                errors={this.props.validationErrors}
                onRefresh={this.refreshLaunch}
                selectedLaunches={selectedLaunches}
                onUnselect={this.unselectItem}
                onUnselectAll={this.unselectAllItems}
                onProceedValidItems={this.proceedWithValidItems}
                onMove={this.moveLaunches}
                onEditItem={this.openEditModal}
                onEditItems={this.openEditItemsModal}
                onMerge={this.mergeLaunches}
                onForceFinish={this.finishForceLaunches}
                onCompare={this.compareLaunches}
                onImportLaunch={this.openImportModal}
                debugMode={debugMode}
                onDelete={this.deleteItems}
                activeFilterId={debugMode ? ALL : activeFilterId}
                onAddNewWidget={this.showWidgetWizard}
                finishedLaunchesCount={finishedLaunchesCount}
              />
              {debugMode && (
                <RefineFiltersPanel
                  filterEntities={activeFilterConditions}
                  onFilterAdd={onFilterAdd}
                  {...rest}
                />
              )}
              <LaunchSuiteGrid
                data={launches}
                sortingColumn={sortingColumn}
                sortingDirection={sortingDirection}
                onChangeSorting={onChangeSorting}
                onDeleteItem={this.deleteItem}
                onMove={this.moveLaunches}
                onEditItem={this.openEditModal}
                onForceFinish={this.finishForceLaunches}
                selectedItems={selectedLaunches}
                onItemSelect={this.handleOneLaunchSelection}
                onItemsSelect={this.props.selectLaunchesAction}
                onAllItemsSelect={this.handleAllLaunchesSelection}
                withHamburger
                loading={loading}
                onFilterClick={onFilterAdd}
                events={LAUNCHES_PAGE_EVENTS}
                onAnalysis={this.onAnalysis}
                onPatternAnalysis={this.onPatternAnalysis}
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
        )}
      />
    );
  };

  render() {
    const { isGridRowHighlighted, finishedLaunchesCount } = this.state;
    const FiltersContainer = this.props.debugMode ? DebugFiltersContainer : LaunchFiltersContainer;

    return (
      <FiltersContainer
        {...this.props}
        finishedLaunchesCount={finishedLaunchesCount}
        isGridRowHighlighted={isGridRowHighlighted}
        onChange={this.resetPageNumber}
        render={this.renderPageContent}
      />
    );
  }
}
