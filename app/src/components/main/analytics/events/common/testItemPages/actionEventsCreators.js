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
    action:
      'Choose time for filter by start time on Launches and click on checkbox "Dynamic update"',
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
