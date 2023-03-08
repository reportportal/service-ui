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

import { getBasicClickEventParameters } from '../ga4Utils';

// GA4 events
export const getClickItemNameEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'item_name',
});
export const getClickRefreshButtonEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'button_refresh',
});
// TODO: Update after Yuliya's answer
export const getClickSelectAllItemsEvent = (category) => () => ({
  ...getBasicClickEventParameters(category),
  element_name: 'select_all_item', // TODO: 'all_item_selection'? and may be use value from second function as another parameter
});
export const getClickSelectOneItemEvent = (category) => () => ({
  ...getBasicClickEventParameters(category),
  element_name: 'select_one_item', // TODO: 'all_item_selection'? and may be use value from second function as another parameter
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
});
export const getClickActionsButtonEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'button_actions',
});

// GA3 events
export const getEditDefectActionEvent = (category) => ({
  category,
  action: 'Click on Btn "Edit Defect"',
  label: 'Arise Modal "Edit Defect Type"',
});

export const getPostIssueActionEvent = (category) => ({
  category,
  action: 'Click on Btn "Post Issue"',
  label: 'Arise Modal "Post Issue"',
});

export const getLinkIssueActionEvent = (category) => ({
  category,
  action: 'Click on Btn "Link Issue"',
  label: 'Arise Modal "Link Issue"',
});

export const getDeleteActionEvent = (category) => ({
  category,
  action: 'Click on Btn "Delete"',
  label: 'Arise Modal "Delete Item"',
});

export const getUnlinkIssueActionEvent = (category) => ({
  category,
  action: 'Click on Btn "Unlink Issue"',
  label: 'Arise Modal "Unlink Issue"',
});

export const getChangeFilterEvent = (category) => (title, value) => ({
  category,
  action: `Click on dropdown ${title} in the refine filters panel`,
  label: `Select ${value} in ${title} filter`,
});

export const getRefineFiltersPanelEvents = (category) => ({
  REFINE_BTN_MORE: {
    category,
    action: 'Click on Refine Btn More',
    label: 'Arise dropdown with parameters',
  },
  getSelectRefineParams: (parameter) => ({
    category,
    action: `Select ${parameter} parameter to refine`,
    label: `Show ${parameter} parameter field to refine`,
  }),
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

export const getClickOnPlusMinusEvents = (category) => (state) => ({
  category,
  action: 'Click on Bread Crumb icon Plus/Minus',
  label: state ? 'Minus' : 'Plus',
});

export const getClickAttributes = (category) => (value) => ({
  category,
  action: 'Click on icon Attributes',
  label: value,
});

export const getClickIssueTicketEvent = (category) => (pluginName) => ({
  category,
  action: 'Click on Issue Ticket',
  label: pluginName || 'BTS',
});

export const getClickUniqueErrorsEvent = (category) => ({
  category,
  action: 'Click on Tab "Unique Errors"',
  label: 'User Redirects to the Unique Errors Page',
});

export const getClickExpandStackTraceArrowEvent = (category) => ({
  category,
  action: 'Click on Icon Arrow to Expand Stack Trace Message on Modal "Test Item Details"',
  label: 'Expand Stack Trace Message',
});

export const getIgnoreBtnIgnoreItemsInAAModalEvent = (category) => ({
  category,
  action: 'Click on Ignore in Modal "Ignore items in AA"',
  label: 'Ignore items in AA',
});

export const getIncludeBtnIncludeInAAModalEvent = (category) => ({
  category,
  action: 'Click on Include in Modal "Include items in AA"',
  label: 'Include items in AA',
});

export const getClickAnalyzeInUniqueErrorAnalysisModalEvent = (category) => (isExcludeNumbers) => ({
  category,
  action: 'Click on Button "Analyze" in Modal "Analyze Launch"',
  label: isExcludeNumbers
    ? 'Exclude numbers from analyzed logs'
    : 'Include numbers to analyzed logs',
});

export const getCommonActionEvents = (category) => ({
  // GA4 events

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
  LIST_VIEW_TAB: {
    category,
    action: 'Click on tab "List view"',
    label: 'User redirects to the List view page',
  },

  LOG_VIEW_TAB: {
    category,
    action: 'Click on tab "Log view"',
    label: 'User redirects to the Log view page',
  },

  HISTORY_VIEW_TAB: {
    category,
    action: 'Click on tab "History"',
    label: 'User redirects to the History page',
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

  EDIT_ICON_CLICK: {
    category,
    action: 'Click on item icon "edit"',
    label: 'Arise Modal "Edit Item"',
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

  ALL_LABEL_BREADCRUMB: {
    category,
    action: 'Click on Bread Crumb All',
    label: 'Transition to Launches Page',
  },

  ITEM_NAME_BREADCRUMB_CLICK: {
    category,
    action: 'Click on Bread Crumb Item name',
    label: 'Transition to Item',
  },

  REFINE_BY_NAME: {
    category,
    action: 'Enter parameters to refine by name',
    label: 'Refine by name',
  },

  EDIT_ITEMS_ACTION: {
    category,
    action: 'Click on "edit" in Actions',
    label: 'Arise Modal "Edit Items"',
  },
  PROCEED_VALID_ITEMS: {
    category,
    action: 'Click on Btn "Proceed Valid Items"',
    label: 'Remove invalid items from selection',
  },
});
