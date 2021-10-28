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

export const getProceedValidItemsEvent = (page) => ({
  category: page,
  action: 'Click on Btn "Proceed Valid Items"',
  label: 'Remove invalid items from selection',
});

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

export const getRefreshPageActionEvent = (category) => ({
  category,
  action: 'Click on button "Refresh"',
  label: 'Refresh page',
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

export const getClickCloseIconForAllSelections = (page) => ({
  category: page,
  action: 'Click on icon "close" of all selection',
  label: 'Unselect all items',
});

export const getClickCloseIconSelectedItem = (page) => ({
  category: page,
  action: 'Click on icon "close" on selected item',
  label: 'Remove item from  selection',
});

export const getListViewTabEvent = (page) => ({
  category: page,
  action: 'Click on tab "List view"',
  label: 'User redirects to the List view page',
});

export const getLogViewTabEvent = (page) => ({
  category: page,
  action: 'Click on tab "Log view"',
  label: 'User redirects to the Log view page',
});

export const getHistoryTabEvent = (page) => ({
  category: page,
  action: 'Click on tab "History"',
  label: 'User redirects to the History page',
});

export const getPBTooltipEvent = (page) => ({
  category: page,
  action: 'Click on Tooltip "Total Product Bugs"',
  label: 'Transition to PB list view',
});

export const getABTooltipEvent = (page) => ({
  category: page,
  action: 'Click on Tooltip "Auto Bug"',
  label: 'Transition to AB list view ',
});

export const getSITooltipEvent = (page) => ({
  category: page,
  action: 'Click on Tooltip "Total System Issue"',
  label: 'Transition to SI list view',
});

export const getTITooltipEvent = (page) => ({
  category: page,
  action: 'Click on Tooltip "To Investigate"',
  label: 'Transition to inner level of launch with To Investigate',
});

export const getPBChartEvent = (page) => ({
  category: page,
  action: 'Click on PB Circle',
  label: 'Transition to PB list view',
});

export const getABChartEvent = (page) => ({
  category: page,
  action: 'Click on AB Circle',
  label: 'Transition to AB list view ',
});

export const getSIChartEvent = (page) => ({
  category: page,
  action: 'Click on SI Circle',
  label: 'Transition to SI list view ',
});

export const getTIChartEvent = (page) => ({
  category: page,
  action: 'Click on TI tag',
  label: 'Transition to TI list view',
});

export const getNameFilterEvent = (page) => ({
  category: page,
  action: 'Click on icon "filter" on Name',
  label: 'Suite name input becomes active',
});

export const getNameSortingEvent = (page) => ({
  category: page,
  action: 'Click on icon "sorting" on Name',
  label: 'Sort items by name',
});

export const getEditIconClickEvent = (page) => ({
  category: page,
  action: 'Click on item icon "edit"',
  label: 'Arise Modal "Edit Item"',
});

export const getStartTimeFilterEvent = (page) => ({
  category: page,
  action: 'Click on icon "filter" on Start time',
  label: 'Arises active "Start time" input',
});

export const getStartTimeSortingEvent = (page) => ({
  category: page,
  action: 'Click on icon "sorting" on Start time',
  label: 'Sort items by Start time',
});

export const getTotalFilterEvent = (page) => ({
  category: page,
  action: 'Click on icon "filter" on Total',
  label: 'Arises active "Total" input',
});

export const getTotalSortingEvent = (page) => ({
  category: page,
  action: 'Click on icon "sorting" on Total',
  label: 'Sort items by Total',
});

export const getPassedFilterEvent = (page) => ({
  category: page,
  action: 'Click on icon "filter" on Passed',
  label: 'Arises active "Passed" input',
});

export const getPassedSortingEvent = (page) => ({
  category: page,
  action: 'Click on icon "sorting" on Passed',
  label: 'Sort items by Passed',
});

export const getFailedFilterEvent = (page) => ({
  category: page,
  action: 'Click on icon "filter" on Failed',
  label: 'Arises active "Failed" input',
});

export const getFailedSortingEvent = (page) => ({
  category: page,
  action: 'Click on icon "sorting" on Failed',
  label: 'Sort items by Failed',
});

export const getSkippedFilterEvent = (page) => ({
  category: page,
  action: 'Click on icon "filter" on Skipped',
  label: 'Arises active "Skipped" input',
});

export const getSkippedSortingEvent = (page) => ({
  category: page,
  action: 'Click on icon "sorting" on Skipped',
  label: 'Sort items by Skipped',
});

export const getPBFilterEvent = (page) => ({
  category: page,
  action: 'Click on icon "filter" on Product Bug',
  label: 'Arises active "Product Bug" input',
});

export const getPBSortingEvent = (page) => ({
  category: page,
  action: 'Click on icon "sorting" on Product Bug',
  label: 'Sort items by Product Bug',
});

export const getABFilterEvent = (page) => ({
  category: page,
  action: 'Click on icon "filter" on Auto Bug',
  label: 'Arises active "Auto Bug" input',
});

export const getABSortingEvent = (page) => ({
  category: page,
  action: 'Click on icon "sorting" on Auto Bug',
  label: 'Sort items by Auto Bug',
});

export const getSIFilterEvent = (page) => ({
  category: page,
  action: 'Click on icon "filter" on System Issue',
  label: 'Arises active "System Issue" input',
});

export const getSISortingEvent = (page) => ({
  category: page,
  action: 'Click on icon "sorting" on System Issue',
  label: 'Sort items by System Issue',
});

export const getTIFilterEvent = (page) => ({
  category: page,
  action: 'Click on icon "filter" on To Investigate',
  label: 'Arises active "To Investigate" input',
});

export const getTISortingEvent = (page) => ({
  category: page,
  action: 'Click on icon "sorting" on To Investigatee',
  label: 'Sort items by To Investigate',
});

export const getAllLabelBreadcrumbEvent = (page) => ({
  category: page,
  action: 'Click on Bread Crumb All',
  label: 'Transition to Launches Page',
});

export const getItemNameBreadcrumbClickEvent = (page) => ({
  category: page,
  action: 'Click on Bread Crumb Item name',
  label: 'Transition to Item',
});

export const getRefineByNameEvent = (page) => ({
  category: page,
  action: 'Enter parameters to refine by name',
  label: 'Refine by name',
});

export const getEditItemsActionEvent = (page) => ({
  category: page,
  action: 'Click on "edit" in Actions',
  label: 'Arise Modal "Edit Items"',
});
