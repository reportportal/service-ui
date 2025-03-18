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

import { getJoinedFieldEventNamesByType } from 'components/main/analytics/events/common/widgetPages/utils';
import { getBasicClickEventParameters, normalizeEventParameter } from '../common/ga4Utils';

const DASHBOARDS = 'dashboards';

export const WIDGETS_EVENTS = {
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
  clickOnLoadMoreSearchItems: (dashboardId, isSearchedByName) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'load_more',
    type: 'search_widget',
    number: dashboardId,
    status: isSearchedByName ? 'test_name' : 'attribute',
  }),
  clickOnSearchedItemName: (dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'test_name',
    type: 'search_widget',
    number: dashboardId,
  }),
  clickOnIssueTicket: (dashboardId) => (pluginName) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'issue_ticket',
    place: 'search_widget',
    number: dashboardId,
    type: normalizeEventParameter(pluginName || 'BTS'),
  }),
  clickOnExpandDescription: (dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    icon_name: 'expand',
    type: 'search_widget',
    number: dashboardId,
  }),
  onSearchWidgetDocumentLinkClick: (dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    link_name: 'documentation',
    place: 'search_widget',
    type: 'search_widget',
    number: dashboardId,
  }),
  onDisplayLaunchesToggle: (isDisplayedLaunches, dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'display_launches',
    switcher: isDisplayedLaunches ? 'on' : 'off',
    type: 'search_widget',
    number: dashboardId,
  }),
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

  CLICK_ON_SHOW_DASHBOARD_CONFIG: {
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'show_dashboard_configuration',
    modal: 'add_new_dashboard',
  },

  CLICK_ON_PASTE_CONFIGURATION: {
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'paste_configuration',
    modal: 'add_new_dashboard',
  },

  CLICK_ON_REMOVE_CONFIGURATION: {
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'remove_configuration',
    modal: 'add_new_dashboard',
  },

  clickOnAddNewWidgetButton: (dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'add_new_widget',
    number: dashboardId,
  }),

  clickOnDashboardName: (dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'dashboard_name',
    number: dashboardId,
  }),

  clickOnIconDashboard: (iconName, dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    icon_name: iconName,
    number: dashboardId,
  }),

  clickOnDuplicateMenuOption: (option) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: option,
  }),

  clickOnBtnInModalDuplicateDashboard: (dashboardId, isDescriptionEdited) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'duplicate',
    modal: 'duplicate_dashboard',
    link_name: isDescriptionEdited,
    number: dashboardId,
  }),

  clickOnButtonUpdateInModalEditDashboard: (dashboardId, linkName) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'update',
    modal: 'edit_dashboard',
    link_name: linkName,
    number: dashboardId,
  }),

  clickOnButtonInModalAddNewDashboard: (dashboardId, linkName, condition = 'standard') => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'add',
    modal: 'add_new_dashboard',
    link_name: linkName,
    condition,
    number: dashboardId,
  }),

  clickOnButtonDeleteInModalDeleteDashboard: (dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'delete',
    modal: 'delete_dashboard',
    number: dashboardId,
  }),
};
