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

export const getHistoryPageLinkEvent = (category) => ({
  category,
  action: 'Click on Btn "History"',
  label: 'Transition to History View Page',
});

export const getRefreshPageActionEvent = (category) => ({
  category,
  action: 'Click on Btn "Refresh"',
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
});
