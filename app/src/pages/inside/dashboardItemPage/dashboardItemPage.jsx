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

import React, { useCallback } from 'react';
import { useTracking } from 'react-tracking';
import { useDispatch, useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import { Fullscreen } from 'components/containers/fullscreen';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { useIntl, defineMessages } from 'react-intl';
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
  loadingSelector,
} from 'controllers/dashboard';
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
import { useCanLockDashboard } from 'common/hooks/useCanLockDashboard';
import { updateDashboardLockedAction } from 'controllers/dashboard/actionCreators';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { LockedDashboardTooltip } from '../common/lockedDashboardTooltip';
import { LockedIcon } from '../common/lockedIcon';
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
  lockedDashboard: {
    id: 'DashboardPage.lockedDashboard',
    defaultMessage: 'Locked dashboard',
  },
  lock: {
    id: 'DashboardPage.lock',
    defaultMessage: 'Lock',
  },
  unlock: {
    id: 'DashboardPage.unlock',
    defaultMessage: 'Unlock',
  },
});

export const DashboardItemPage = () => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const projectKey = useSelector(projectKeySelector);
  const dashboard = useSelector(activeDashboardItemSelector);
  const userInfo = useSelector(userInfoSelector);
  const fullWidthMode = useSelector(dashboardFullWidthModeSelector);
  const fullScreenMode = useSelector(dashboardFullScreenModeSelector);
  const activeDashboardId = useSelector(activeDashboardIdSelector);
  const userRoles = useSelector(userRolesSelector);
  const isWorkWithWidgets = canWorkWithWidgets(userRoles);
  const query = useSelector(pagePropertiesSelector);
  const loading = useSelector(loadingSelector);
  const canLock = useCanLockDashboard();
  const isDisabled = dashboard?.locked && !canLock;
  const isCurrentDashboard = dashboard?.id && +dashboard.id === +activeDashboardId;

  const getBreadcrumbs = useCallback(() => {
    return [
      {
        title: formatMessage(messages.pageTitle),
        link: {
          type: PROJECT_DASHBOARD_PAGE,
          payload: { organizationSlug, projectSlug },
          meta: {
            query,
          },
        },
      },
      { title: dashboard?.name || '' },
    ];
  }, [projectKey, query, formatMessage, dashboard?.name]);

  const onDeleteDashboard = useCallback(() => {
    const warning =
      dashboard.owner === userInfo.userId ? '' : formatMessage(messages.deleteModalWarningMessage);
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('delete', dashboard.id));
    dispatch(
      showModalAction({
        id: 'deleteItemsModal',
        data: {
          items: [dashboard],
          onConfirm: () => dispatch(deleteDashboardAction(dashboard)),
          header: formatMessage(messages.deleteModalTitle),
          mainContent: formatMessage(messages.deleteModalConfirmationText, {
            b: (data) => DOMPurify.sanitize(`<b>${data}</b>`),
            name: `'<b>${dashboard.name}</b>'`,
          }),
          warning,
          eventsInfo: {
            deleteBtn: DASHBOARD_EVENTS.clickOnButtonDeleteInModalDeleteDashboard(dashboard.id),
          },
        },
      }),
    );
  }, [dashboard, userInfo.userId, formatMessage, trackEvent, dispatch]);

  const onEditDashboardItem = useCallback(() => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('edit', dashboard.id));
    dispatch(
      showModalAction({
        id: 'dashboardAddEditModal',
        data: {
          dashboardItem: dashboard,
          onSubmit: (data) => dispatch(updateDashboardAction(data)),
          type: 'edit',
        },
      }),
    );
  }, [dashboard, trackEvent, dispatch]);

  const addWidget = useCallback(
    (widget, closeModal) => {
      return fetch(URLS.addDashboardWidget(projectKey, dashboard.id), {
        method: 'put',
        data: { addWidget: widget },
      })
        .then(() =>
          dispatch(
            updateDashboardWidgetsAction({
              ...dashboard,
              widgets: getUpdatedWidgetsList(dashboard.widgets, widget),
            }),
          ),
        )
        .then(() => {
          dispatch(hideScreenLockAction());
          closeModal();
          dispatch(
            showNotification({
              message: formatMessage(messages.addWidgetSuccess),
              type: NOTIFICATION_TYPES.SUCCESS,
            }),
          );
        })
        .catch((err) => {
          dispatch(hideScreenLockAction());
          dispatch(showNotification({ message: err.message, type: NOTIFICATION_TYPES.ERROR }));
        });
    },
    [projectKey, dashboard, formatMessage, dispatch],
  );

  const toggleFullscreen = useCallback(() => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('full_screen', dashboard.id));
    dispatch(toggleFullScreenModeAction());
  }, [dashboard?.id, trackEvent, dispatch]);

  const onOpenDashboardLayoutSettings = () => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('dashboard_layout', dashboard.id));
  };

  const toggleFullWidthMode = () => {
    const newValue = !fullWidthMode;

    requestAnimationFrame(() => {
      globalThis.dispatchEvent(new Event('resize'));
    });
    trackEvent(DASHBOARD_EVENTS.clickOnFullWidthModeCheckbox(newValue));
    dispatch(changeFullWidthModeAction(newValue));
  };

  const onPrintDashboard = useCallback(() => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('print', dashboard.id));
  }, [dashboard?.id, trackEvent]);

  const showWidgetWizard = useCallback(() => {
    trackEvent(DASHBOARD_EVENTS.clickOnAddNewWidgetButton(activeDashboardId));
    dispatch(
      showModalAction({
        id: 'widgetWizardModal',
        data: {
          onConfirm: addWidget,
        },
      }),
    );
  }, [activeDashboardId, addWidget, trackEvent, dispatch]);

  const onChangeLockedState = () => {
    const newValue = !dashboard.locked;
    const iconName = `${dashboard.locked ? 'un' : ''}lock_dashboard`;

    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard(iconName, dashboard.id));
    dispatch(updateDashboardLockedAction(newValue, dashboard));
  };

  return (
    <PageLayout fullWidth={fullWidthMode}>
      {!isCurrentDashboard || loading ? (
        <PageSection>
          <SpinningPreloader />
        </PageSection>
      ) : (
        <>
          <PageHeader breadcrumbs={getBreadcrumbs()}>
            <DashboardPageHeader />
          </PageHeader>
          <PageSection>
            <div className={cx('dashboard-item')}>
              <div className={cx('buttons-container')}>
                <div className={cx('buttons-block')}>
                  {isWorkWithWidgets && (
                    <LockedDashboardTooltip locked={dashboard.locked}>
                      <GhostButton
                        icon={AddWidgetIcon}
                        onClick={showWidgetWizard}
                        disabled={isDisabled}
                        appearance="faded"
                      >
                        {formatMessage(messages.addNewWidget)}
                      </GhostButton>
                    </LockedDashboardTooltip>
                  )}
                </div>
                {isDisabled && (
                  <div className={cx('locked-dashboard')}>
                    <LockedDashboardTooltip locked={dashboard.locked}>
                      <LockedIcon />
                    </LockedDashboardTooltip>
                    <span>{formatMessage(messages.lockedDashboard)}</span>
                  </div>
                )}
                <div className={cx('buttons-block')}>
                  <DashboardLayoutSettings
                    className={cx('dashboard-layout-settings-control')}
                    fullWidthMode={fullWidthMode}
                    onOpen={onOpenDashboardLayoutSettings}
                    onToggleFullWidthMode={toggleFullWidthMode}
                  />
                  {canLock && (
                    <GhostButton
                      icon={<LockedIcon locked={!dashboard.locked} />}
                      onClick={onChangeLockedState}
                    >
                      {formatMessage(dashboard.locked ? messages.unlock : messages.lock)}
                    </GhostButton>
                  )}
                  {isWorkWithWidgets && (
                    <LockedDashboardTooltip locked={dashboard.locked}>
                      <GhostButton
                        icon={EditIcon}
                        onClick={onEditDashboardItem}
                        disabled={isDisabled}
                        appearance="faded"
                      >
                        {formatMessage(messages.editDashboard)}
                      </GhostButton>
                    </LockedDashboardTooltip>
                  )}
                  <GhostButton icon={FullscreenIcon} onClick={toggleFullscreen}>
                    {formatMessage(messages.fullscreen)}
                  </GhostButton>
                  {isWorkWithWidgets && (
                    <LockedDashboardTooltip locked={dashboard.locked}>
                      <GhostButton
                        icon={CancelIcon}
                        onClick={onDeleteDashboard}
                        disabled={isDisabled}
                        appearance="faded"
                      >
                        {formatMessage(messages.delete)}
                      </GhostButton>
                    </LockedDashboardTooltip>
                  )}
                  <Link
                    to={{
                      type: PROJECT_DASHBOARD_PRINT_PAGE,
                      payload: { projectSlug, organizationSlug, dashboardId: activeDashboardId },
                    }}
                    target="_blank"
                    className={cx('print-button')}
                    onClick={onPrintDashboard}
                  >
                    <GhostButton icon={ExportIcon}>{formatMessage(messages.print)}</GhostButton>
                  </Link>
                </div>
              </div>
              <Fullscreen
                enabled={fullScreenMode}
                onChange={(mode) => dispatch(changeFullScreenModeAction(mode))}
              >
                <WidgetsGrid
                  isModifiable={!fullScreenMode && !isDisabled}
                  dashboard={dashboard}
                  isFullscreen={fullScreenMode}
                  showWidgetWizard={showWidgetWizard}
                  projectKey={projectKey}
                  showNotification={(payload) => dispatch(showNotification(payload))}
                  updateDashboardWidgetsAction={(payload) =>
                    dispatch(updateDashboardWidgetsAction(payload))
                  }
                />
                {fullScreenMode && (
                  <button className={cx('icon-close')} onClick={toggleFullscreen}>
                    {Parser(CancelIcon)}
                  </button>
                )}
              </Fullscreen>
            </div>
          </PageSection>
        </>
      )}
    </PageLayout>
  );
};
