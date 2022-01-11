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

export const getClickOnPlusMinusEvents = (page) => (state) => ({
  category: page,
  action: 'Click on Bread Crumb icon Plus/Minus',
  label: state ? 'Minus' : 'Plus',
});

export const getClickSelectAllItemsEvent = (page) => (value) => ({
  category: page,
  action: 'Click on item icon "select all items"',
  label: `${value ? 'select' : 'unselect'} all items`,
});

export const getClickSelectOneItemEvent = (page) => (value) => ({
  category: page,
  action: 'Click on item icon "select one item"',
  label: `${value ? 'select' : 'unselect'} one item`,
});

export const getClickAttributes = (category) => (value) => ({
  category,
  action: 'Click on icon Attributes',
  label: value,
});

export const getClickIssueTicketEvent = (page) => (pluginName) => ({
  category: page,
  action: 'Click on Issue Ticket',
  label: pluginName || 'BTS',
});

export const getClickUniqueErrorsEvent = (page) => ({
  category: page,
  action: 'Click on Tab "Unique Errors"',
  label: 'User Redirects to the Unique Errors Page',
});

export const getClickExpandStackTraceArrowEvent = (page) => ({
  category: page,
  action: 'Click on Icon Arrow to Expand Stack Trace Message on Modal "Test Item Details"',
  label: 'Expand Stack Trace Message',
});

export const getIgnoreBtnIgnoreItemsInAAModalEvent = (page) => ({
  category: page,
  action: 'Click on Ignore in Modal "Ignore items in AA"',
  label: 'Ignore items in AA',
});

export const getIncludeBtnIncludeInAAModalEvent = (page) => ({
  category: page,
  action: 'Click on Include in Modal "Include items in AA"',
  label: 'Include items in AA',
});

export const getCommonActionEvents = (page) => ({
  CLOSE_ICON_FOR_ALL_SELECTIONS: {
    category: page,
    action: 'Click on icon "close" of all selection',
    label: 'Unselect all items',
  },

  CLOSE_ICON_SELECTED_ITEM: {
    category: page,
    action: 'Click on icon "close" on selected item',
    label: 'Remove item from  selection',
  },
  LIST_VIEW_TAB: {
    category: page,
    action: 'Click on tab "List view"',
    label: 'User redirects to the List view page',
  },

  LOG_VIEW_TAB: {
    category: page,
    action: 'Click on tab "Log view"',
    label: 'User redirects to the Log view page',
  },

  HISTORY_VIEW_TAB: {
    category: page,
    action: 'Click on tab "History"',
    label: 'User redirects to the History page',
  },

  PB_TOOLTIP: {
    category: page,
    action: 'Click on Tooltip "Total Product Bugs"',
    label: 'Transition to PB list view',
  },

  AB_TOOLTIP: {
    category: page,
    action: 'Click on Tooltip "Auto Bug"',
    label: 'Transition to AB list view ',
  },

  SI_TOOLTIP: {
    category: page,
    action: 'Click on Tooltip "Total System Issue"',
    label: 'Transition to SI list view',
  },

  TI_TOOLTIP: {
    category: page,
    action: 'Click on Tooltip "To Investigate"',
    label: 'Transition to inner level of launch with To Investigate',
  },
  PB_CHART: {
    category: page,
    action: 'Click on PB Circle',
    label: 'Transition to PB list view',
  },

  AB_CHART: {
    category: page,
    action: 'Click on AB Circle',
    label: 'Transition to AB list view ',
  },

  SI_CHART: {
    category: page,
    action: 'Click on SI Circle',
    label: 'Transition to SI list view ',
  },

  TI_CHART: {
    category: page,
    action: 'Click on TI tag',
    label: 'Transition to TI list view',
  },

  NAME_FILTER: {
    category: page,
    action: 'Click on icon "filter" on Name',
    label: 'Suite name input becomes active',
  },

  NAME_SORTING: {
    category: page,
    action: 'Click on icon "sorting" on Name',
    label: 'Sort items by name',
  },

  EDIT_ICON_CLICK: {
    category: page,
    action: 'Click on item icon "edit"',
    label: 'Arise Modal "Edit Item"',
  },

  START_TIME_FILTER: {
    category: page,
    action: 'Click on icon "filter" on Start time',
    label: 'Arises active "Start time" input',
  },

  START_TIME_SORTING: {
    category: page,
    action: 'Click on icon "sorting" on Start time',
    label: 'Sort items by Start time',
  },

  TOTAL_FILTER: {
    category: page,
    action: 'Click on icon "filter" on Total',
    label: 'Arises active "Total" input',
  },

  TOTAL_SORTING: {
    category: page,
    action: 'Click on icon "sorting" on Total',
    label: 'Sort items by Total',
  },

  PASSED_FILTER: {
    category: page,
    action: 'Click on icon "filter" on Passed',
    label: 'Arises active "Passed" input',
  },

  PASSED_SORTING: {
    category: page,
    action: 'Click on icon "sorting" on Passed',
    label: 'Sort items by Passed',
  },

  FAILED_FILTER: {
    category: page,
    action: 'Click on icon "filter" on Failed',
    label: 'Arises active "Failed" input',
  },

  FAILED_SORTING: {
    category: page,
    action: 'Click on icon "sorting" on Failed',
    label: 'Sort items by Failed',
  },

  SKIPPED_FILTER: {
    category: page,
    action: 'Click on icon "filter" on Skipped',
    label: 'Arises active "Skipped" input',
  },

  SKIPPED_SORTING: {
    category: page,
    action: 'Click on icon "sorting" on Skipped',
    label: 'Sort items by Skipped',
  },

  PB_FILTER: {
    category: page,
    action: 'Click on icon "filter" on Product Bug',
    label: 'Arises active "Product Bug" input',
  },

  PB_SORTING: {
    category: page,
    action: 'Click on icon "sorting" on Product Bug',
    label: 'Sort items by Product Bug',
  },

  AB_FILTER: {
    category: page,
    action: 'Click on icon "filter" on Auto Bug',
    label: 'Arises active "Auto Bug" input',
  },

  AB_SORTING: {
    category: page,
    action: 'Click on icon "sorting" on Auto Bug',
    label: 'Sort items by Auto Bug',
  },

  SI_FILTER: {
    category: page,
    action: 'Click on icon "filter" on System Issue',
    label: 'Arises active "System Issue" input',
  },

  SI_SORTING: {
    category: page,
    action: 'Click on icon "sorting" on System Issue',
    label: 'Sort items by System Issue',
  },

  TI_FILTER: {
    category: page,
    action: 'Click on icon "filter" on To Investigate',
    label: 'Arises active "To Investigate" input',
  },

  TI_SORTING: {
    category: page,
    action: 'Click on icon "sorting" on To Investigatee',
    label: 'Sort items by To Investigate',
  },

  ALL_LABEL_BREADCRUMB: {
    category: page,
    action: 'Click on Bread Crumb All',
    label: 'Transition to Launches Page',
  },

  ITEM_NAME_BREADCRUMB_CLICK: {
    category: page,
    action: 'Click on Bread Crumb Item name',
    label: 'Transition to Item',
  },

  REFINE_BY_NAME: {
    category: page,
    action: 'Enter parameters to refine by name',
    label: 'Refine by name',
  },

  EDIT_ITEMS_ACTION: {
    category: page,
    action: 'Click on "edit" in Actions',
    label: 'Arise Modal "Edit Items"',
  },
  REFRESH_BTN: {
    category: page,
    action: 'Click on button "Refresh"',
    label: 'Refresh page',
  },
  PROCEED_VALID_ITEMS: {
    category: page,
    action: 'Click on Btn "Proceed Valid Items"',
    label: 'Remove invalid items from selection',
  },
  CLICK_ITEM_NAME: {
    category: page,
    action: 'Click on Item Name',
    label: 'Transition to Item page',
  },
});
