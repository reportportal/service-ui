/*
 * Copyright 2026 EPAM Systems
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

import { useCallback } from 'react';
import { useTracking } from 'react-tracking';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import qs from 'qs';
import { actionToPath, history, selectLocationState } from 'redux-first-router';

import { URLS } from 'common/urls';
import { createClassnames, fetch } from 'common/utils';
import { useCanLockDashboard } from 'common/hooks';
import { useProjectDetails } from 'hooks/useTypedSelector';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import {
  activeDashboardItemSelector,
  dashboardFullWidthModeSelector,
  updateDashboardWidgetsAction,
  dashboardFullScreenModeSelector,
  changeFullWidthModeAction,
  changeFullScreenModeAction,
  toggleFullScreenModeAction,
  updateDashboardAction,
  loadingSelector,
} from 'controllers/dashboard';
import { updateDashboardLockedAction } from 'controllers/dashboard/actionCreators';
import { projectKeySelector } from 'controllers/project';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_DASHBOARD_PRINT_PAGE,
  activeDashboardIdSelector,
  pagePropertiesSelector,
} from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import {
  showNotification,
  showErrorNotification,
  showSuccessNotification,
} from 'controllers/notification';
import { hideScreenLockAction } from 'controllers/screenLock';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { PageHeaderWithBreadcrumbsAndActions } from 'pages/inside/common/pageHeaderWithBreadcrumbsAndActions';
import { LockedDashboardTooltip } from 'pages/inside/common/lockedDashboardTooltip';

import { ActiveDashboardItem } from '../dashboardPage/types';
import { AddEditModal, DeleteDashboardModal } from '../dashboardPage/modals';
import { DashboardLockedIcon } from '../dashboardPage/dashboardList/dashboardLockedIcon';
import { WidgetWizardModal } from './modals';
import { getUpdatedWidgetsList } from './modals/common/utils';
import { DashboardFullScreen } from './dashboardFullScreen';
import { DashboardItemActions } from './dashboardItemActions';
import { Widget } from './modals/widgetWizardModal/types';
import { WidgetsGrid } from './widgetsGrid';
import { messages } from './messages';

import styles from './dashboardItemPage.scss';

const cx = createClassnames(styles);

export const DashboardItemPage = () => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const projectKey = useSelector(projectKeySelector);
  const dashboard = useSelector(activeDashboardItemSelector) as ActiveDashboardItem;
  const fullWidthMode = useSelector(dashboardFullWidthModeSelector);
  const fullScreenMode = useSelector(dashboardFullScreenModeSelector);
  const activeDashboardId = useSelector(activeDashboardIdSelector);
  const query = useSelector(pagePropertiesSelector);
  const { routesMap } = useSelector(selectLocationState);
  const loading = useSelector(loadingSelector);
  const canLock = useCanLockDashboard();
  const isDisabled = dashboard?.locked && !canLock;
  const isCurrentDashboard = dashboard?.id && +dashboard.id === +activeDashboardId;
  const isEmpty = !dashboard?.widgets?.length;

  const breadcrumbDescriptors = [
    {
      id: 'dashboards',
      title: formatMessage(messages.projectDashboards),
      link: {
        type: PROJECT_DASHBOARD_PAGE,
        payload: { organizationSlug, projectSlug },
        meta: { query },
      },
    },
    { id: 'dashboard', title: dashboard?.name || '' },
  ];

  const onDeleteDashboard = () => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('delete', dashboard.id));
    dispatch(showModalAction({ component: <DeleteDashboardModal dashboardItem={dashboard} /> }));
  };

  const onEditDashboardItem = () => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('edit', dashboard.id));
    dispatch(
      showModalAction({
        component: (
          <AddEditModal
            dashboardItem={dashboard}
            onSubmit={(data: object) => dispatch(updateDashboardAction(data))}
            type="edit"
          />
        ),
      }),
    );
  };

  const addWidget = useCallback(
    (widget: Widget, closeModal: () => void) =>
      fetch(URLS.addDashboardWidget(projectKey, dashboard.id), {
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
          dispatch(showSuccessNotification({ message: formatMessage(messages.addWidgetSuccess) }));
        })
        .catch((err: Error) => {
          dispatch(hideScreenLockAction());
          dispatch(showErrorNotification({ message: err.message }));
        }),
    [projectKey, dashboard, formatMessage, dispatch],
  );

  const onPrintDashboard = () => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('print', dashboard.id));

    const path = actionToPath(
      {
        type: PROJECT_DASHBOARD_PRINT_PAGE,
        payload: { projectSlug, organizationSlug, dashboardId: activeDashboardId },
      },
      routesMap,
      qs,
    );

    window.open(history().createHref({ pathname: path }), '_blank', 'noopener,noreferrer');
  };

  const toggleFullScreen = useCallback(() => {
    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard('full_screen', dashboard.id));
    dispatch(toggleFullScreenModeAction());
  }, [dashboard?.id, trackEvent, dispatch]);

  const closeFullScreen = useCallback(() => {
    dispatch(changeFullScreenModeAction(false));
  }, [dispatch]);

  const toggleFullWidthMode = () => {
    const newValue = !fullWidthMode;

    requestAnimationFrame(() => {
      globalThis.dispatchEvent(new Event('resize'));
    });
    trackEvent(DASHBOARD_EVENTS.clickOnFullWidthModeCheckbox(newValue));
    dispatch(changeFullWidthModeAction(newValue));
  };

  const showWidgetWizard = useCallback(() => {
    trackEvent(DASHBOARD_EVENTS.clickOnAddNewWidgetButton(activeDashboardId));
    dispatch(showModalAction({ component: <WidgetWizardModal data={{ onConfirm: addWidget }} /> }));
  }, [activeDashboardId, addWidget, trackEvent, dispatch]);

  const onChangeLockedState = () => {
    const iconName = `${dashboard.locked ? 'un' : ''}lock_dashboard`;

    trackEvent(DASHBOARD_EVENTS.clickOnIconDashboard(iconName, dashboard.id));
    dispatch(updateDashboardLockedAction(!dashboard.locked, dashboard));
  };

  if (!isCurrentDashboard || loading) {
    return (
      <SettingsLayout>
        <SpinningPreloader />
      </SettingsLayout>
    );
  }

  const widgetsGrid = (
    <WidgetsGrid
      isModifiable={!fullScreenMode && !isDisabled}
      dashboard={dashboard}
      isFullscreen={fullScreenMode}
      showWidgetWizard={showWidgetWizard}
      projectKey={projectKey}
      showNotification={(payload: Parameters<typeof showNotification>[0]) =>
        dispatch(showNotification(payload))
      }
      updateDashboardWidgetsAction={(payload: object) =>
        dispatch(updateDashboardWidgetsAction(payload))
      }
    />
  );

  return (
    <SettingsLayout>
      <ScrollWrapper>
        <PageHeaderWithBreadcrumbsAndActions
          title={dashboard.name}
          description={dashboard.description}
          breadcrumbDescriptors={breadcrumbDescriptors}
          titleAddon={
            dashboard.locked && (
              <LockedDashboardTooltip locked>
                <DashboardLockedIcon />
              </LockedDashboardTooltip>
            )
          }
          actions={
            <DashboardItemActions
              locked={dashboard.locked}
              isEmpty={isEmpty}
              fullWidthMode={fullWidthMode}
              onToggleFullWidthMode={toggleFullWidthMode}
              onFullScreen={toggleFullScreen}
              onAddWidget={showWidgetWizard}
              onToggleLock={onChangeLockedState}
              onEdit={onEditDashboardItem}
              onPrint={onPrintDashboard}
              onDelete={onDeleteDashboard}
            />
          }
        />
        <div className={cx('dashboard-item-page__content', { 'full-width': fullWidthMode })}>
          {fullScreenMode ? (
            <DashboardFullScreen title={dashboard.name} onClose={closeFullScreen}>
              {widgetsGrid}
            </DashboardFullScreen>
          ) : (
            widgetsGrid
          )}
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
