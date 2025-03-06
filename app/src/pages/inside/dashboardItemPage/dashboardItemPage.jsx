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
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DOMPurify from 'dompurify';
import { Fullscreen } from 'components/containers/fullscreen';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import {
  activeDashboardItemSelector,
  updateDashboardWidgetsAction,
  dashboardFullScreenModeSelector,
  changeFullScreenModeAction,
  toggleFullScreenModeAction,
  deleteDashboardAction,
  updateDashboardAction,
} from 'controllers/dashboard';
import { userInfoSelector, activeProjectSelector } from 'controllers/user';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_DASHBOARD_PRINT_PAGE,
  activeDashboardIdSelector,
  pagePropertiesSelector,
} from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { hideScreenLockAction } from 'controllers/screenLock';
import { GhostButton } from 'components/buttons/ghostButton';
import Link from 'redux-first-router-link';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { DASHBOARD_PAGE_EVENTS } from 'components/main/analytics/events';
import { DashboardPageHeader } from 'pages/inside/common/dashboardPageHeader';
import AddWidgetIcon from 'common/img/add-widget-inline.svg';
import ExportIcon from 'common/img/export-inline.svg';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { getUpdatedWidgetsList } from './modals/common/utils';
import EditIcon from './img/edit-inline.svg';
import CancelIcon from './img/cancel-inline.svg';
import FullscreenIcon from './img/full-screen-inline.svg';
import { WidgetsGrid } from './widgetsGrid';
import styles from './dashboardItemPage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  pageTitle: {
    id: 'DashboardPage.title',
    defaultMessage: 'All Dashboards',
  },
  addNewWidget: {
    id: 'DashboardItemPage.addNewWidget',
    defaultMessage: 'Add new widget',
  },
  editDashboard: {
    id: 'DashboardItemPage.editDashboard',
    defaultMessage: 'Edit',
  },
  delete: {
    id: 'DashboardItemPage.delete',
    defaultMessage: 'Delete',
  },
  fullscreen: {
    id: 'DashboardItemPage.fullscreen',
    defaultMessage: 'Full screen',
  },
  addWidgetSuccess: {
    id: 'DashboardItemPage.addWidgetSuccess',
    defaultMessage: 'Widget has been added successfully',
  },
  deleteModalWarningMessage: {
    id: 'DashboardPage.modal.deleteModalWarningMessage',
    defaultMessage:
      'You are going to delete not your own dashboard. This may affect other users information on the project.',
  },
  deleteModalTitle: {
    id: 'DashboardPage.modal.deleteModalTitle',
    defaultMessage: 'Delete Dashboard',
  },
  deleteModalConfirmationText: {
    id: 'DashboardPage.modal.deleteModalConfirmationText',
    defaultMessage:
      "Are you sure you want to delete dashboard ''<b>{name}</b>''? It will no longer exist.",
  },
  print: {
    id: 'DashboardPage.print',
    defaultMessage: 'Print',
  },
});

@injectIntl
@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
    dashboard: activeDashboardItemSelector(state),
    userInfo: userInfoSelector(state),
    fullScreenMode: dashboardFullScreenModeSelector(state),
    activeDashboardId: activeDashboardIdSelector(state),
    query: pagePropertiesSelector(state),
  }),
  {
    showModalAction,
    updateDashboardWidgetsAction,
    showNotification,
    hideScreenLockAction,
    changeFullScreenModeAction,
    toggleFullScreenModeAction,
    deleteDashboard: deleteDashboardAction,
    editDashboard: updateDashboardAction,
  },
)
@track()
export class DashboardItemPage extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showModalAction: PropTypes.func.isRequired,
    updateDashboardWidgetsAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    activeProject: PropTypes.string.isRequired,
    dashboard: PropTypes.object.isRequired,
    userInfo: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    fullScreenMode: PropTypes.bool,
    changeFullScreenModeAction: PropTypes.func.isRequired,
    toggleFullScreenModeAction: PropTypes.func.isRequired,
    deleteDashboard: PropTypes.func.isRequired,
    editDashboard: PropTypes.func.isRequired,
    activeDashboardId: PropTypes.number,
    query: PropTypes.object,
  };

  static defaultProps = {
    fullScreenMode: false,
    activeDashboardId: undefined,
    query: {},
  };

  onDeleteDashboard = () => {
    const {
      intl: { formatMessage },
      userInfo: { userId },
      deleteDashboard,
      dashboard,
      tracking: { trackEvent },
    } = this.props;
    const { id } = dashboard;

    const warning =
      dashboard.owner === userId ? '' : formatMessage(messages.deleteModalWarningMessage);
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('delete', id));
    this.props.showModalAction({
      id: 'deleteItemsModal',
      data: {
        items: [dashboard],
        onConfirm: () => deleteDashboard(dashboard),
        header: formatMessage(messages.deleteModalTitle),
        mainContent: formatMessage(messages.deleteModalConfirmationText, {
          b: (data) => DOMPurify.sanitize(`<b>${data}</b>`),
          name: `'<b>${dashboard.name}</b>'`,
        }),
        warning,
        eventsInfo: {
          closeIcon: DASHBOARD_PAGE_EVENTS.CLOSE_ICON_DELETE_DASHBOARD_MODAL,
          cancelBtn: DASHBOARD_PAGE_EVENTS.CANCEL_BTN_DELETE_DASHBOARD_MODAL,
          deleteBtn: DASHBOARD_EVENTS.clickOnButtonDeleteInModalDeleteDashboard(id),
        },
      },
    });
  };

  onEditDashboardItem = () => {
    const {
      showModalAction: showModal,
      editDashboard,
      dashboard,
      tracking: { trackEvent },
    } = this.props;

    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('edit', dashboard.id));
    showModal({
      id: 'dashboardAddEditModal',
      data: {
        dashboardItem: dashboard,
        onSubmit: editDashboard,
        type: 'edit',
      },
    });
  };

  getBreadcrumbs = () => {
    const { activeProject, query, intl } = this.props;
    return [
      {
        title: intl.formatMessage(messages.pageTitle),
        link: {
          type: PROJECT_DASHBOARD_PAGE,
          payload: { projectId: activeProject },
          meta: {
            query,
          },
        },
        eventInfo: DASHBOARD_PAGE_EVENTS.BREADCRUMB_ALL_DASHBOARD,
      },
      {
        title: this.getDashboardName(),
      },
    ];
  };

  getDashboardName = () => this.props.dashboard?.name || '';

  addWidget = (widget, closeModal) => {
    const {
      intl: { formatMessage },
      activeProject,
      dashboard,
    } = this.props;

    return fetch(URLS.addDashboardWidget(activeProject, dashboard.id), {
      method: 'put',
      data: { addWidget: widget },
    })
      .then(() =>
        this.props.updateDashboardWidgetsAction({
          ...this.props.dashboard,
          widgets: getUpdatedWidgetsList(dashboard.widgets, widget),
        }),
      )
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
  };

  toggleFullscreen = () => {
    const {
      dashboard: { id },
      tracking: { trackEvent },
    } = this.props;
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('full_screen', id));
    this.props.toggleFullScreenModeAction();
  };

  onPrintDashboard = () => {
    const {
      dashboard: { id },
      tracking: { trackEvent },
    } = this.props;
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('print', id));
  };

  showWidgetWizard = () => {
    const dashboardId = this.props.activeDashboardId;
    const modalId = 'widgetWizardModal';
    this.props.tracking.trackEvent(DASHBOARD_EVENTS.clickOnAddNewWidgetButton(dashboardId));
    this.props.showModalAction({
      id: modalId,
      data: {
        onConfirm: this.addWidget,
        eventsInfo: {
          closeIcon: DASHBOARD_PAGE_EVENTS.CLOSE_ICON_ADD_WIDGET_MODAL,
          cancelBtn: DASHBOARD_PAGE_EVENTS.CANCEL_BTN_ADD_WIDGET_MODAL,
          changeName: DASHBOARD_PAGE_EVENTS.WIDGET_NAME_ADD_WIDGET_MODAL,
          chooseWidgetType: DASHBOARD_PAGE_EVENTS.CHOOSE_WIDGET_TYPE_ADD_WIDGET_MODAL,
          nextStep: DASHBOARD_PAGE_EVENTS.NEXT_STEP_ADD_WIDGET_MODAL,
          prevStep: DASHBOARD_PAGE_EVENTS.PREVIOUS_STEP_ADD_WIDGET_MODAL,
          changeDescription: DASHBOARD_PAGE_EVENTS.ENTER_WIDGET_DESCRIPTION_ADD_WIDGET_MODAL,
          editFilterIcon: DASHBOARD_PAGE_EVENTS.EDIT_FILTER_ADD_WIDGET_MODAL,
          enterSearchParams: DASHBOARD_PAGE_EVENTS.ENTER_SEARCH_PARAMS_ADD_WIDGET_MODAL,
          chooseFilter: DASHBOARD_PAGE_EVENTS.CHOOSE_FILTER_ADD_WIDGET_MODAL,
          addFilter: DASHBOARD_PAGE_EVENTS.ADD_FILTER_BTN_ADD_WIDGET_MODAL,
          cancelAddNewFilter: DASHBOARD_PAGE_EVENTS.CANCEL_BTN_ADD_NEW_FILTER_ADD_WIDGET_MODAL,
          addNewFilter: DASHBOARD_PAGE_EVENTS.ADD_BTN_ADD_NEW_FILTER_ADD_WIDGET_MODAL,
          sortingSelectParameters: DASHBOARD_PAGE_EVENTS.SELECT_SORTING_FILTER_ADD_WIDGET_MODAL,
          editFilterName: DASHBOARD_PAGE_EVENTS.EDIT_FILTER_NAME_ADD_WIDGET_MODAL,
          selectParamsForFilter: DASHBOARD_PAGE_EVENTS.SELECT_PARAMS_FILTER_ADD_WIDGET_MODAL,
          clickOnZoomWidgetArea: DASHBOARD_PAGE_EVENTS.CLICK_ZOOM_ADD_WIDGET_AREA,
          selectCriteria: DASHBOARD_PAGE_EVENTS.SELECT_CRITERIA_ADD_NEW_WIDGET_MODAL,
          selectToggleButtons: DASHBOARD_PAGE_EVENTS.SELECT_TOGGLE_BUTTONS_ADD_NEW_WIDGET_MODAL,
        },
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
      dashboard,
      fullScreenMode,
      activeProject,
      changeFullScreenModeAction: changeFullScreenMode,
    } = this.props;

    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.getBreadcrumbs()}>
          <DashboardPageHeader />
        </PageHeader>
        <PageSection>
          <div className={cx('dashboard-item')}>
            <div className={cx('buttons-container')}>
              <div className={cx('buttons-block')}>
                <GhostButton icon={AddWidgetIcon} onClick={this.showWidgetWizard}>
                  {formatMessage(messages.addNewWidget)}
                </GhostButton>
              </div>
              <div className={cx('buttons-block')}>
                <GhostButton icon={EditIcon} onClick={this.onEditDashboardItem}>
                  {formatMessage(messages.editDashboard)}
                </GhostButton>
                <GhostButton icon={FullscreenIcon} onClick={this.toggleFullscreen}>
                  {formatMessage(messages.fullscreen)}
                </GhostButton>
                <GhostButton icon={CancelIcon} onClick={this.onDeleteDashboard}>
                  {formatMessage(messages.delete)}
                </GhostButton>
                <Link
                  to={{
                    type: PROJECT_DASHBOARD_PRINT_PAGE,
                    payload: {
                      projectId: this.props.activeProject,
                      dashboardId: this.props.activeDashboardId,
                    },
                  }}
                  target={'_blank'}
                  className={cx('print-button')}
                  onClick={this.onPrintDashboard}
                >
                  <GhostButton icon={ExportIcon}>{formatMessage(messages.print)}</GhostButton>
                </Link>
              </div>
            </div>
            <Fullscreen enabled={fullScreenMode} onChange={changeFullScreenMode}>
              <WidgetsGrid
                isModifiable={!fullScreenMode}
                dashboard={dashboard}
                isFullscreen={fullScreenMode}
                showWidgetWizard={this.showWidgetWizard}
                activeProject={activeProject}
                showNotification={this.props.showNotification}
                updateDashboardWidgetsAction={this.props.updateDashboardWidgetsAction}
              />
              {fullScreenMode && (
                <i className={cx('icon-close')} onClick={this.toggleFullscreen}>
                  {Parser(CancelIcon)}
                </i>
              )}
            </Fullscreen>
          </div>
        </PageSection>
      </PageLayout>
    );
  }
}
