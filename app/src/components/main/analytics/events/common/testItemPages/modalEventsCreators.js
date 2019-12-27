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

import { SEARCH_MODES } from 'pages/inside/stepPage/modals/editDefectModals/constants';

// EDIT DEFECT MODAL
export const getEditDefectModalEvents = (category) => ({
  CLOSE_ICON_EDIT_DEFECT_MODAL: {
    category,
    action: 'Click on Close Icon on Modal "Edit Defect Type"',
    label: 'Close modal "Edit Defect Type"',
  },
  EDIT_DESCRIPTION_EDIT_DEFECT_MODAL: {
    category,
    action: 'Edit description in Modal "Edit Defect Type"',
    label: 'Edit description',
  },
  CANCEL_BTN_EDIT_DEFECT_MODAL: {
    category,
    action: 'Click on Btn Cancel on Modal "Edit Defect Type"',
    label: 'Close modal "Edit Defect Type"',
  },
  SAVE_BTN_EDIT_DEFECT_MODAL: {
    category,
    action: 'Click on Btn Save on Modal "Edit Defect Type"',
    label: 'Save changes',
  },
  SAVE_BTN_DROPDOWN_EDIT_DEFECT_MODAL: {
    category,
    action: 'Click on dropdown icon on Save Btn on Modal "Edit Defect Type"',
    label: 'Arise dropdown',
  },
  POST_ISSUE_BTN_EDIT_DEFECT_MODAL: {
    category,
    action: 'Select Save and Post Issue on dropdown in Modal "Edit Defect Type"',
    label: 'Arise Modal "Post Issue"',
  },
  LINK_ISSUE_BTN_EDIT_DEFECT_MODAL: {
    category,
    action: 'Select Save and Link Issue on dropdown in Modal "Edit Defect Type"',
    label: 'Arise Modal "Link Issue"',
  },
  UNLINK_ISSUE_BTN_EDIT_DEFECT_MODAL: {
    category,
    action: 'Select Save and Unlink Issue on dropdown in Modal "Edit Defect Type"',
    label: 'Arise Modal "Unlink Issue"',
  },
  IGNORE_IN_AA_EDIT_DEFECT_MODAL: {
    category,
    action: 'Turn on switcher Ignore in AA in Defect Editor',
    label: 'Ignore in AA single item',
  },
  INCLUDE_IN_AA_EDIT_DEFECT_MODAL: {
    category,
    action: 'Turn off switcher Ignore in AA in Defect Editor',
    label: 'Include in AA single item',
  },
});

export const getEditToInvestigateChangeSearchModeEvent = (category) => ({
  [SEARCH_MODES.CURRENT_LAUNCH]: {
    category,
    action: 'Choose "For the current launch" in Modal "Edit Defect"',
    label: 'Choose "For the current launch" in Modal "Edit Defect"',
  },
  [SEARCH_MODES.LAUNCH_NAME]: {
    category,
    action: 'Choose "For the launches with the same name" in Modal "Edit Defect"',
    label: 'Choose "For the launches with the same name" in Modal "Edit Defect"',
  },
  [SEARCH_MODES.FILTER]: {
    category,
    action: 'Choose "For the current filter" in Modal "Edit Defect"',
    label: 'Choose "For the current filter" in Modal "Edit Defect"',
  },
});

export const getEditToInvestigateSelectAllSimilarItemsEvent = (category) => ({
  category,
  action: 'Click on checkbox Change Similiar Items in Modal "Edit Defect"',
  label: 'Choose All similiar items in Modal "Edit Defect"',
});

// UNLINK ISSUE MODAL
export const getUnlinkIssueCancelButtonEvent = (page) => ({
  category: page,
  action: 'Click on Cancel in Unlink issue',
  label: 'Close Modal "Unlink issue"',
});

export const getUnlinkIssueCloseIconEvent = (page) => ({
  category: page,
  action: 'Click on Close icon in Unlink issue',
  label: 'Close Modal "Unlink issue"',
});

export const getUnlinkIssueUnlinkButtonEvent = (page) => ({
  category: page,
  action: 'Click on Unlink in Modal "Unlink issue"',
  label: 'Unlink issues',
});

// POST ISSUE MODAL
export const getPostIssueCloseIconEvent = (page) => ({
  category: page,
  action: 'Click on Icon Close on Modal Post Issue',
  label: 'Close Modal Post Issue',
});

export const getPostIssueAttachmentsSwitcherEvent = (page) => ({
  category: page,
  action: 'Click on Attachments switcher on Modal Post Issue',
  label: 'On/off Attachments in Modal Post Issue',
});

export const getPostIssueLogsSwitcherEvent = (page) => ({
  category: page,
  action: 'Click on Logs switcher on Modal Post Issue',
  label: 'On/off Logs in Modal Post Issue',
});

export const getPostIssueCommentSwitcherEvent = (page) => ({
  category: page,
  action: 'Click on Comment switcher on Modal Post Issue',
  label: 'On/off Comment in Modal Post Issue',
});

export const getPostIssueCancelButtonEvent = (page) => ({
  category: page,
  action: 'Click on Btn Cancel on Modal Post Issue',
  label: 'Close Modal Post Issue',
});

export const getPostIssuePostButtonEvent = (page) => ({
  category: page,
  action: 'Click on Btn Post on Modal Post Issue',
  label: 'Post bug',
});

// LINK ISSUE MODAL
export const getLinkIssueCloseIconEvent = (page) => ({
  category: page,
  action: 'Click on Icon Close on Modal Link Issue',
  label: 'Close Modal Link Issue',
});

export const getLinkIssueAddNewIssueEvent = (page) => ({
  category: page,
  action: 'Click on Btn Add New Issue on Modal Link Issue',
  label: 'Add input in Modal Link Issue',
});

export const getLinkIssueCancelButtonEvent = (page) => ({
  category: page,
  action: 'Click on Btn Cancel on Modal Link Issue',
  label: 'Close Modal Modal Link Issue',
});

export const getLinkIssueLoadButtonEvent = (page) => ({
  category: page,
  action: 'Click on Btn Load on Modal Link Issue',
  label: 'Link issue',
});

// DELETE ITEM MODAL
export const getDeleteItemCloseIconEvent = (page) => ({
  category: page,
  action: 'Click on Icon Close on Modal Delete Item',
  label: 'Close Modal Delete Item',
});

export const getDeleteItemCancelButtonEvent = (page) => ({
  category: page,
  action: 'Click on Btn Cancel on Modal Delete Item',
  label: 'Close Modal Delete Item',
});

export const getDeleteItemDeleteButtonEvent = (page) => ({
  category: page,
  action: 'Click on Btn Delete on Modal Delete Item',
  label: 'Delete item',
});
