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

import {
  getJoinedFieldEventNamesByType,
  getOverallStatisticsInterruptAnalyticsToken,
  mergeOverallStatisticsAnalyticsCondition,
} from 'components/main/analytics/events/common/widgetPages/utils';
import { OVERALL_STATISTICS } from 'common/constants/widgetTypes';
import {
  getBasicClickEventParameters,
  getBasicPerformanceEventParameters,
  normalizeEventParameter,
} from '../common/ga4Utils';

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
    isLocked = false,
    initialSeparateInterrupted,
    finalSeparateInterrupted,
  }) => {
    const actionType = isEditModal
      ? {
          element_name: 'save',
          modal: 'edit_widget',
          icon_name: `${isLocked ? '' : 'un'}locked_widget`,
        }
      : {
          element_name: 'add',
          modal: 'add_new_widget',
        };

    let condition = getJoinedFieldEventNamesByType(type, modifiedFields);
    if (type === OVERALL_STATISTICS) {
      const interruptToken = getOverallStatisticsInterruptAnalyticsToken({
        isEdit: isEditModal,
        initialSeparateInterrupted,
        finalSeparateInterrupted,
      });
      condition = mergeOverallStatisticsAnalyticsCondition(condition, interruptToken);
    }

    return {
      ...getBasicClickEventParameters(DASHBOARDS),
      condition,
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
  clickOnMostFailedTestCaseName: (dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'test_name',
    type: 'most_failed_test_cases',
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
  onLoadCompletion: (dashboardId, time, type, isSearchedByName, statusValues) => ({
    ...getBasicPerformanceEventParameters(DASHBOARDS),
    element_name: 'response_time',
    type: 'search_widget',
    number: dashboardId,
    icon_name: type,
    switcher: Math.round(time),
    status:
      (isSearchedByName ? 'test_name' : 'attribute') +
      (statusValues ? '#test_execution_status' : ''),
    ...(statusValues && {
      condition: statusValues.length === 5 ? 'All' : statusValues.join('#').toLowerCase(),
    }),
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
  onTcsPromoBannerImpression: (dashboardId, source) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'promo_banner_impression',
    place: source,
    type: 'search_widget',
    number: dashboardId,
  }),
  onTcsPromoDocumentationClick: (dashboardId, source) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    link_name: 'documentation',
    place: source,
    type: 'search_widget',
    number: dashboardId,
  }),
  onTcsPromoOpenNewSearchNavigate: (dashboardId, source) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'open_new_search',
    place: source,
    type: 'search_widget',
    number: dashboardId,
  }),
  onTcsPremiumPopupImpression: (dashboardId, source) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'premium_popup_impression',
    modal: 'premium_promo',
    place: source,
    number: dashboardId,
  }),
  onTcsPremiumExplorePlansClick: (dashboardId, source) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'explore_plans',
    modal: 'premium_promo',
    place: source,
    type: 'search_widget',
    number: dashboardId,
  }),
  onTcsPremiumContactUsClick: (dashboardId, source) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'start_contact_us_tep',
    modal: 'premium_promo',
    place: source,
    type: 'search_widget',
    number: dashboardId,
  }),
  onTcsPremiumNotNowClick: (dashboardId, source) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'not_now',
    modal: 'premium_promo',
    place: source,
    type: 'search_widget',
    number: dashboardId,
  }),
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
