/*
 * Copyright 2023 EPAM Systems
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

import { getBasicClickEventParameters, normalizeEventParameter } from '../ga4Utils';
import { getFilterEntityType } from './utils';

// GA4 events
export const getClickItemNameEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'item_name',
});
export const getClickRefreshButtonEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'button_refresh',
});
export const getClickSelectAllItemsEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'select_all_item',
});
export const getClickSelectOneItemEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'select_one_item',
});
export const getClickDonutEvents = (category) => ({
  CLICK_DONUT_PB: {
    ...getBasicClickEventParameters(category),
    icon_name: 'donut_product_bug',
  },
  CLICK_DONUT_AB: {
    ...getBasicClickEventParameters(category),
    icon_name: 'donut_auto_bug',
  },
  CLICK_DONUT_SI: {
    ...getBasicClickEventParameters(category),
    icon_name: 'donut_system_issue',
  },
  CLICK_DONUT_TI: {
    ...getBasicClickEventParameters(category),
    icon_name: 'donut_to_invest',
  },
});
export const getClickDefectTooltipEvents = (category) => ({
  getClickTooltipPbEvent: (place = 'body') => ({
    ...getBasicClickEventParameters(category),
    icon_name: 'tooltip_product_bug',
    place,
  }),
  getClickTooltipAbEvent: (place = 'body') => ({
    ...getBasicClickEventParameters(category),
    icon_name: 'tooltip_auto_bug',
    place,
  }),
  getClickTooltipSiEvent: (place = 'body') => ({
    ...getBasicClickEventParameters(category),
    icon_name: 'tooltip_system_issue',
    place,
  }),
  getClickTooltipTiEvent: (place = 'body') => ({
    ...getBasicClickEventParameters(category),
    icon_name: 'tooltip_to_invest',
    place,
  }),
  getClickTooltipNdEvent: (place = 'body') => ({
    ...getBasicClickEventParameters(category),
    icon_name: 'tooltip_no_defect',
    place,
  }),
});
export const getClickActionsButtonEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'button_actions',
});
export const getClickPencilIconEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  icon_name: 'edit_item',
});
export const getRefineParametersEventCreator = (category) => (entity) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'parameter_refine',
  type: getFilterEntityType(entity),
});
export const getClickOnAttributesEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  icon_name: 'icon_attributes',
});
export const getClickOnExpandEvent = (category, place) => ({
  ...getBasicClickEventParameters(category),
  place,
  icon_name: 'expand',
});
export const getClickOnTestItemsTabsEvents = (category) => ({
  CLICK_LIST_VIEW_TAB: {
    ...getBasicClickEventParameters(category),
    element_name: 'tab_list_view',
  },
  CLICK_LOG_VIEW_TAB: {
    ...getBasicClickEventParameters(category),
    element_name: 'tab_log_view',
  },
  CLICK_HISTORY_TAB: {
    ...getBasicClickEventParameters(category),
    element_name: 'tab_history',
  },
  CLICK_UNIQUE_ERRORS_TAB: {
    ...getBasicClickEventParameters(category),
    element_name: 'tab_unique_errors',
  },
});
export const getClickBreadcrumbsEvents = (category) => ({
  CLICK_ALL_LABEL_BREADCRUMB: {
    ...getBasicClickEventParameters(category),
    element_name: 'bread_crumb_all',
  },
  CLICK_ITEM_NAME_BREADCRUMB: {
    ...getBasicClickEventParameters(category),
    element_name: 'bread_crumb_item_name',
  },
  getClickOnPlusMinusBreadcrumbEvent: (expanded) => ({
    ...getBasicClickEventParameters(category),
    icon_name: expanded ? 'minus' : 'plus',
  }),
});
export const getChangeItemStatusEventCreator = (category) => (status) => ({
  ...getBasicClickEventParameters(category),
  type: 'status',
  element_name: status.toLowerCase(),
});

const getClickListOfActionsEventCreator = (category) => ({
  ...getBasicClickEventParameters(category),
  place: 'list_of_actions',
});

export const getDeleteActionEvent = (category) => ({
  ...getClickListOfActionsEventCreator(category),
  element_name: 'delete',
});

export const getEditDefectActionEvent = (category) => ({
  ...getClickListOfActionsEventCreator(category),
  element_name: 'edit_defects',
});

export const getPostIssueActionEvent = (category) => ({
  ...getClickListOfActionsEventCreator(category),
  element_name: 'post_issue',
});

export const getLinkIssueActionEvent = (category) => ({
  ...getClickListOfActionsEventCreator(category),
  element_name: 'link_issue',
});

export const getUnlinkIssueActionEvent = (category) => ({
  ...getClickListOfActionsEventCreator(category),
  element_name: 'unlink_issue',
});

export const getIgnoreInAutoAnalysisActionEventCreator = (category) => ({
  ...getClickListOfActionsEventCreator(category),
  element_name: 'ignore_in_Auto_Analysis',
});

export const getIncludeInAutoAnalysisActionEventCreator = (category) => ({
  ...getClickListOfActionsEventCreator(category),
  element_name: 'include_into_auto_analysis',
});
// GA3 events

export const getChangeFilterEvent = (category) => (title, value) => ({
  category,
  action: `Click on dropdown ${title} in the refine filters panel`,
  label: `Select ${value} in ${title} filter`,
});

export const getRefineFiltersPanelEvents = (category) => ({
  getChosenDate: (date) => ({
    category,
    action: 'Choose time for filter by start time on Launches.',
    label: date,
  }),
  getStartTimeCustomRange: (date) => ({
    category,
    action: 'Choose time for filter by start time on Launches',
    label: date,
  }),
  getStartTimeDynamicUpdate: (state) => ({
    category,
    action:
      'Choose time for filter by start time on Launches and click on checkbox "Dynamic update"',
    label: state ? 'Add checkmark' : 'Remove checkmark',
  }),
});

export const getClickIssueTicketEvent = (category) => (pluginName) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'issue_ticket',
  type: normalizeEventParameter(pluginName || 'BTS'),
});

export const getClickExpandStackTraceArrowEvent = (category) => ({
  category,
  action: 'Click on Icon Arrow to Expand Stack Trace Message on Modal "Test Item Details"',
  label: 'Expand Stack Trace Message',
});

export const getIncludeBtnIncludeInAAModalEvent = (category) => ({
  category,
  action: 'Click on Include in Modal "Include items in AA"',
  label: 'Include items in AA',
});

export const getCommonActionEvents = (category) => ({
  // GA4 events
  PROCEED_VALID_ITEMS: {
    ...getBasicClickEventParameters(category),
    element_name: 'proceed_valid_items',
  },
  EDIT_ITEMS_ACTION: {
    ...getClickListOfActionsEventCreator(category),
    element_name: 'edit_items',
  },

  // GA3 events
  CLOSE_ICON_FOR_ALL_SELECTIONS: {
    category,
    action: 'Click on icon "close" of all selection',
    label: 'Unselect all items',
  },

  CLOSE_ICON_SELECTED_ITEM: {
    category,
    action: 'Click on icon "close" on selected item',
    label: 'Remove item from  selection',
  },

  NAME_FILTER: {
    category,
    action: 'Click on icon "filter" on Name',
    label: 'Suite name input becomes active',
  },

  NAME_SORTING: {
    category,
    action: 'Click on icon "sorting" on Name',
    label: 'Sort items by name',
  },

  START_TIME_FILTER: {
    category,
    action: 'Click on icon "filter" on Start time',
    label: 'Arises active "Start time" input',
  },

  START_TIME_SORTING: {
    category,
    action: 'Click on icon "sorting" on Start time',
    label: 'Sort items by Start time',
  },

  TOTAL_FILTER: {
    category,
    action: 'Click on icon "filter" on Total',
    label: 'Arises active "Total" input',
  },

  TOTAL_SORTING: {
    category,
    action: 'Click on icon "sorting" on Total',
    label: 'Sort items by Total',
  },

  PASSED_FILTER: {
    category,
    action: 'Click on icon "filter" on Passed',
    label: 'Arises active "Passed" input',
  },

  PASSED_SORTING: {
    category,
    action: 'Click on icon "sorting" on Passed',
    label: 'Sort items by Passed',
  },

  FAILED_FILTER: {
    category,
    action: 'Click on icon "filter" on Failed',
    label: 'Arises active "Failed" input',
  },

  FAILED_SORTING: {
    category,
    action: 'Click on icon "sorting" on Failed',
    label: 'Sort items by Failed',
  },

  SKIPPED_FILTER: {
    category,
    action: 'Click on icon "filter" on Skipped',
    label: 'Arises active "Skipped" input',
  },

  SKIPPED_SORTING: {
    category,
    action: 'Click on icon "sorting" on Skipped',
    label: 'Sort items by Skipped',
  },

  PB_FILTER: {
    category,
    action: 'Click on icon "filter" on Product Bug',
    label: 'Arises active "Product Bug" input',
  },

  PB_SORTING: {
    category,
    action: 'Click on icon "sorting" on Product Bug',
    label: 'Sort items by Product Bug',
  },

  AB_FILTER: {
    category,
    action: 'Click on icon "filter" on Auto Bug',
    label: 'Arises active "Auto Bug" input',
  },

  AB_SORTING: {
    category,
    action: 'Click on icon "sorting" on Auto Bug',
    label: 'Sort items by Auto Bug',
  },

  SI_FILTER: {
    category,
    action: 'Click on icon "filter" on System Issue',
    label: 'Arises active "System Issue" input',
  },

  SI_SORTING: {
    category,
    action: 'Click on icon "sorting" on System Issue',
    label: 'Sort items by System Issue',
  },

  TI_FILTER: {
    category,
    action: 'Click on icon "filter" on To Investigate',
    label: 'Arises active "To Investigate" input',
  },

  TI_SORTING: {
    category,
    action: 'Click on icon "sorting" on To Investigatee',
    label: 'Sort items by To Investigate',
  },

  REFINE_BY_NAME: {
    category,
    action: 'Enter parameters to refine by name',
    label: 'Refine by name',
  },
});
