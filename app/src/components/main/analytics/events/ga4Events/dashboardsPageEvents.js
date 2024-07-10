/*
 * Copyright 2024 EPAM Systems
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

import {
  PASSING_RATE_PER_LAUNCH,
  PASSING_RATE_SUMMARY,
  COMPONENT_HEALTH_CHECK,
  COMPONENT_HEALTH_CHECK_TABLE,
} from 'common/constants/widgetTypes';
import { getJoinedFieldEventNamesByType } from 'components/main/analytics/events/common/widgetPages/utils';
import { getBasicClickEventParameters } from '../common/ga4Utils';

const DASHBOARDS = 'dashboards';
const EXCLUDE_SKIPPED_TESTS_FROM_STATISTICS = 'exclude_skipped_tests_from_statistics';

const modalNames = {
  editWidgetModal: 'edit_widget',
  widgetWizardModal: 'add_widget',
};

const widgetType = {
  [PASSING_RATE_PER_LAUNCH]: 'passing_rate_per_launch',
  [PASSING_RATE_SUMMARY]: 'passing_rate_summary',
  [COMPONENT_HEALTH_CHECK]: 'component_health_check',
  [COMPONENT_HEALTH_CHECK_TABLE]: 'component_health_check_table_view',
};

export const WIDGETS_EVENTS = {
  createClickExcludeSkippedTestsOnHealthCheck: (modalId) => (type, status) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    type: widgetType[type],
    status,
    modal: modalNames[modalId],
    element_name: EXCLUDE_SKIPPED_TESTS_FROM_STATISTICS,
  }),
  clickOnDeleteWidgetButton: (type, dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'delete',
    modal: 'delete_widget',
    number: dashboardId,
    type,
  }),
  clickOnResizeWidgetIcon: (type) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    icon_name: 'resize_widget',
    type,
  }),
  clickOnSaveWidget: ({
    type,
    dashboardId,
    isWidgetDescriptionChanged = false,
    isWidgetNameChanged = false,
    levelsCount,
    modifiedFields,
    isEditModal = false,
    isExcludeSkippedTests = null,
  }) => {
    const actionType = isEditModal
      ? {
          element_name: 'save',
          modal: 'edit_widget',
        }
      : {
          element_name: 'add',
          modal: 'add_new_widget',
        };

    return {
      ...getBasicClickEventParameters(DASHBOARDS),
      condition: getJoinedFieldEventNamesByType(type, modifiedFields),
      number: dashboardId,
      link_name: isWidgetDescriptionChanged,
      status: isWidgetNameChanged,
      type,
      ...(isExcludeSkippedTests !== null && { place: isExcludeSkippedTests }),
      ...(levelsCount && { switcher: levelsCount }),
      ...actionType,
    };
  },

  ON_DRAG_WIDGET: {
    ...getBasicClickEventParameters(DASHBOARDS),
    icon_name: 'drag_widget',
  },
  CLICK_ON_REFRESH_WIDGET_ICON: {
    ...getBasicClickEventParameters(DASHBOARDS),
    icon_name: 'refresh_widget',
  },
  CLICK_ON_EDIT_WIDGET_ICON: {
    ...getBasicClickEventParameters(DASHBOARDS),
    icon_name: 'edit_widget',
  },
  CLICK_ON_DELETE_WIDGET_ICON: {
    ...getBasicClickEventParameters(DASHBOARDS),
    icon_name: 'delete_widget',
  },
};

export const DASHBOARD_EVENTS = {
  CLICK_ON_ADD_NEW_DASHBOARD_BTN: {
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'add_new_dashboard',
  },

  clickOnDashboardName: (dashboardName, dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: dashboardName,
    number: dashboardId,
  }),

  clickOnIconDashboard: (iconName, dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    icon_name: iconName,
    number: dashboardId,
  }),

  clickOnButtonUpdateInModalEditDashboard: (dashboardId, linkName) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'update',
    modal: 'edit_dashboard',
    link_name: linkName,
    number: dashboardId,
  }),

  clickOnButtonInModalAddNewDashboard: (dashboardId, linkName) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'add',
    modal: 'add_new_dashboard',
    link_name: linkName,
    number: dashboardId,
  }),

  clickOnButtonDeleteInModalDeleteDashboard: (dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'delete',
    modal: 'delete_dashboard',
    number: dashboardId,
  }),
};
