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
  dashboardFullWidthModeSelector,
  updateDashboardWidgetsAction,
  dashboardFullScreenModeSelector,
  changeFullWidthModeAction,
  changeFullScreenModeAction,
  toggleFullScreenModeAction,
  deleteDashboardAction,
  updateDashboardAction,
} from 'controllers/dashboard';
import { userRolesType } from 'common/constants/projectRoles';
import { userInfoSelector } from 'controllers/user';
import { projectKeySelector } from 'controllers/project';
import {
  urlOrganizationAndProjectSelector,
  PROJECT_DASHBOARD_PAGE,
  PROJECT_DASHBOARD_PRINT_PAGE,
  activeDashboardIdSelector,
  userRolesSelector,
  pagePropertiesSelector,
} from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { hideScreenLockAction } from 'controllers/screenLock';
import { GhostButton } from 'components/buttons/ghostButton';
import Link from 'redux-first-router-link';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { DashboardPageHeader } from 'pages/inside/common/dashboardPageHeader';
import AddWidgetIcon from 'common/img/add-widget-inline.svg';
import ExportIcon from 'common/img/export-inline.svg';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { canWorkWithWidgets } from 'common/utils/permissions/permissions';
import { getUpdatedWidgetsList } from './modals/common/utils';
import EditIcon from './img/edit-inline.svg';
import CancelIcon from './img/cancel-inline.svg';
import FullscreenIcon from './img/full-screen-inline.svg';
import { DashboardLayoutSettings } from './dashboardLayoutSettings';
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
    slugs: urlOrganizationAndProjectSelector(state),
    projectKey: projectKeySelector(state),
    dashboard: activeDashboardItemSelector(state),
    userInfo: userInfoSelector(state),
    fullWidthMode: dashboardFullWidthModeSelector(state),
    fullScreenMode: dashboardFullScreenModeSelector(state),
    activeDashboardId: activeDashboardIdSelector(state),
    userRoles: userRolesSelector(state),
    query: pagePropertiesSelector(state),
  }),
  {
    showModalAction,
    updateDashboardWidgetsAction,
    showNotification,
    hideScreenLockAction,
    changeFullWidthModeAction,
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
    dashboard: PropTypes.object.isRequired,
    userInfo: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    fullWidthMode: PropTypes.bool,
    fullScreenMode: PropTypes.bool,
    changeFullWidthModeAction: PropTypes.func.isRequired,
    changeFullScreenModeAction: PropTypes.func.isRequired,
    toggleFullScreenModeAction: PropTypes.func.isRequired,
    deleteDashboard: PropTypes.func.isRequired,
    editDashboard: PropTypes.func.isRequired,
    activeDashboardId: PropTypes.number,
    slugs: PropTypes.shape({
      organizationSlug: PropTypes.string.isRequired,
      projectSlug: PropTypes.string.isRequired,
    }),
    projectKey: PropTypes.string.isRequired,
    userRoles: userRolesType,
    query: PropTypes.object,
  };

  static defaultProps = {
    fullWidthMode: false,
    fullScreenMode: false,
    activeDashboardId: undefined,
    userRoles: {},
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
    const {
      intl,
      query,
      slugs: { organizationSlug, projectSlug },
    } = this.props;
    return [
      {
        title: intl.formatMessage(messages.pageTitle),
        link: {
          type: PROJECT_DASHBOARD_PAGE,
          payload: { organizationSlug, projectSlug },
          meta: {
            query,
          },
        },
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
      projectKey,
      dashboard,
    } = this.props;

    return fetch(URLS.addDashboardWidget(projectKey, dashboard.id), {
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

  onOpenDashboardLayoutSettings = () => {
    const {
      dashboard: { id },
      tracking: { trackEvent },
    } = this.props;

    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('dashboard_layout', id));
  };

  toggleFullWidthMode = () => {
    const {
      fullWidthMode,
      changeFullWidthModeAction,
      tracking: { trackEvent },
    } = this.props;
    const newValue = !fullWidthMode;
    
    requestAnimationFrame(() => {
      globalThis.dispatchEvent(new Event('resize'));
    });
    trackEvent(DASHBOARD_EVENTS.clickOnFullWidthModeCheckbox(newValue));
    changeFullWidthModeAction(newValue);
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
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
      dashboard,
      projectKey,
      fullWidthMode,
      fullScreenMode,
      changeFullScreenModeAction: changeFullScreenMode,
      slugs: { organizationSlug, projectSlug },
      userRoles,
    } = this.props;

    const isWorkWithWidgets = canWorkWithWidgets(userRoles);

    return (
      <PageLayout fullWidth={fullWidthMode}>
        <PageHeader breadcrumbs={this.getBreadcrumbs()}>
          <DashboardPageHeader />
        </PageHeader>
        <PageSection>
          <div className={cx('dashboard-item')}>
            <div className={cx('buttons-container')}>
              <div className={cx('buttons-block')}>
                {isWorkWithWidgets && (
                  <GhostButton icon={AddWidgetIcon} onClick={this.showWidgetWizard}>
                    {formatMessage(messages.addNewWidget)}
                  </GhostButton>
                )}
              </div>
              <div className={cx('buttons-block')}>
                <DashboardLayoutSettings
                  className={cx('dashboard-layout-settings-control')}
                  fullWidthMode={fullWidthMode}
                  onOpen={this.onOpenDashboardLayoutSettings}
                  onToggleFullWidthMode={this.toggleFullWidthMode}
                />
                {isWorkWithWidgets && (
                  <GhostButton icon={EditIcon} onClick={this.onEditDashboardItem}>
                    {formatMessage(messages.editDashboard)}
                  </GhostButton>
                )}
                <GhostButton icon={FullscreenIcon} onClick={this.toggleFullscreen}>
                  {formatMessage(messages.fullscreen)}
                </GhostButton>
                {isWorkWithWidgets && (
                  <GhostButton icon={CancelIcon} onClick={this.onDeleteDashboard}>
                    {formatMessage(messages.delete)}
                  </GhostButton>
                )}
                <Link
                  to={{
                    type: PROJECT_DASHBOARD_PRINT_PAGE,
                    payload: {
                      projectSlug,
                      dashboardId: this.props.activeDashboardId,
                      organizationSlug,
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
                projectKey={projectKey}
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
