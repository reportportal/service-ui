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

export const STEP_PAGE = 'step';

export const getChangeItemStatusEvent = (oldStatus, newStatus) => ({
  category: STEP_PAGE,
  action: `Choose in drop-down from ${oldStatus} to ${newStatus}`,
  label: `Change status from ${oldStatus} to ${newStatus}`,
});

export const STEP_PAGE_EVENTS = {
  REFINE_BY_NAME: {
    category: STEP_PAGE,
    action: 'Enter parameters to refine by name',
    label: 'Refine by name',
  },
  REFINE_BTN_MORE: {
    category: STEP_PAGE,
    action: 'Click on Refine Btn More',
    label: 'Arise dropdown with parameters',
  },
  SELECT_REFINE_PARAMS: {
    category: STEP_PAGE,
    action: 'Select parameters to refine',
    label: 'Show parameters fields to refine',
  },
  METHOD_TYPE_SWITCHER: {
    category: STEP_PAGE,
    action: 'Click on Method type switcher',
    label: 'Show/Hide method type',
  },
  METHOD_TYPE_FILTER: {
    category: STEP_PAGE,
    action: 'Click on icon "filter" Method type',
    label: 'Arises active "Method type" input',
  },
  METHOD_TYPE_SORTING: {
    category: STEP_PAGE,
    action: 'Click on icon "sorting" Method type',
    label: 'Sort items by Method type',
  },
  NAME_FILTER: {
    category: STEP_PAGE,
    action: 'Click on icon "filter" Name',
    label: 'Suite name input becomes active',
  },
  NAME_SORTING: {
    category: STEP_PAGE,
    action: 'Click on icon "sorting" Name',
    label: 'Sort items by Name',
  },
  STATUS_FILTER: {
    category: STEP_PAGE,
    action: 'Click on icon "filter" Status',
    label: 'Arises active "Status" input',
  },
  STATUS_SORTING: {
    category: STEP_PAGE,
    action: 'Click on icon "sorting" Status',
    label: 'Sort items by Status',
  },
  START_TIME_FILTER: {
    category: STEP_PAGE,
    action: 'Click on icon "filter" Start time',
    label: 'Arises active "Start time" input',
  },
  START_TIME_SORTING: {
    category: STEP_PAGE,
    action: 'Click on icon "sorting" Start time',
    label: 'Sort items by Start time',
  },
  DEFECT_TYPE_FILTER: {
    category: STEP_PAGE,
    action: 'Click on icon "filter" Defect type',
    label: 'Arises active "Defect type" input',
  },
  DEFECT_TYPE_SORTING: {
    category: STEP_PAGE,
    action: 'Click on icon "sorting" Defect type',
    label: 'Sort items by Defect type',
  },
  EDIT_ICON_CLICK: {
    category: STEP_PAGE,
    action: 'Click on item icon "edit"',
    label: 'Arise Modal "Edit Item"',
  },
  EDIT_DEFECT_TYPE_ICON: {
    category: STEP_PAGE,
    action: 'Click on icon "edit" of Defect type tag',
    label: 'Arise Modal "Edit Defect Type"',
  },
  SELECT_ALL_ITEMS: {
    category: STEP_PAGE,
    action: 'Click on item icon "select all items"',
    label: 'Select/unselect all items',
  },
  SELECT_ONE_ITEM: {
    category: STEP_PAGE,
    action: 'Click on item icon "select one item"',
    label: 'Select/unselect one item',
  },
  CLOSE_ICON_EDIT_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Close Icon on Modal "Edit Item"',
    label: 'Close modal "Edit Item"',
  },
  EDIT_ITEM_DESCRIPTION: {
    category: STEP_PAGE,
    action: 'Edit description in Modal "Edit Item"',
    label: 'Edit description',
  },
  CANCEL_BTN_EDIT_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Btn Cancel on Modal "Edit Item',
    label: 'Close modal "Edit Item"',
  },
  SAVE_BTN_EDIT_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Btn Save on Modal "Edit Item"',
    label: 'Save changes',
  },
  CLOSE_ICON_EDIT_DEFECT_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Close Icon on Modal "Edit Defect Type"',
    label: 'Close modal "Edit Defect Type"',
  },
  EDIT_DESCRIPTION_EDIT_DEFECT_MODAL: {
    category: STEP_PAGE,
    action: 'Edit description in Modal "Edit Defect Type"',
    label: 'Edit description',
  },
  CANCEL_BTN_EDIT_DEFECT_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Btn Cancel on Modal "Edit Defect Type"',
    label: 'Close modal "Edit Defect Type"',
  },
  SAVE_BTN_EDIT_DEFECT_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Btn Save on Modal "Edit Defect Type"',
    label: 'Save changes',
  },
  CLOSE_ICON_SELECTED_ITEM: {
    category: STEP_PAGE,
    action: 'Click on icon "close" on selected item',
    label: 'Unselect item',
  },
  PROCEED_VALID_ITEMS: {
    category: STEP_PAGE,
    action: 'Click on Btn "Proceed Valid Items"',
    label: 'Remove invalid launches from selection',
  },
  CLOSE_ICON_FOR_ALL_SELECTIONS: {
    category: STEP_PAGE,
    action: 'Click on Close Icon of all selection',
    label: 'Close panel with selected items',
  },
  EDIT_DEFECT_ACTION: {
    category: STEP_PAGE,
    action: 'Click on Btn "Edit Defect"',
    label: 'Arise Modal "Edit Defect Type"',
  },
  POST_ISSUE_ACTION: {
    category: STEP_PAGE,
    action: 'Click on Btn "Post Issue"',
    label: 'Arise Modal "Post Issue"',
  },
  LINK_ISSUE_ACTION: {
    category: STEP_PAGE,
    action: 'Click on Btn "Link Issue"',
    label: 'Arise Modal "Link Issue"',
  },
  DELETE_ACTION: {
    category: STEP_PAGE,
    action: 'Click on Btn "Delete"',
    label: 'Arise Modal "Delete Item"',
  },
  IGNORE_IN_AA_ACTION: {
    category: STEP_PAGE,
    action: 'Click on Ignore in Auto-Analysis',
    label: 'Arise Modal "Ignore items in AA"',
  },
  INCLUDE_IN_AA_ACTION: {
    category: STEP_PAGE,
    action: 'Click on Include in Auto-Analysis',
    label: 'Arise Modal "Include items in AA"',
  },
  UNLINK_SINGLE_ISSUE: {
    category: STEP_PAGE,
    action: 'Click on Cross icon in issue block',
    label: 'Arise Modal "Unlink issue"',
  },
  UNLINK_ISSUES_ACTION: {
    category: STEP_PAGE,
    action: 'Click on Unlink issues',
    label: 'Arise Bulk Unlink issues',
  },
  CANCEL_BTN_UNLINK_ISSUE_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Cancel in Unlink issue',
    label: 'Close Modal "Unlink issue"',
  },
  CLOSE_ICON_UNLINK_ISSUE_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Close icon in Unlink issue',
    label: 'Close Modal "Unlink issue"',
  },
  UNLINK_BTN_UNLINK_ISSUE_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Unlink in Modal "Unlink issue"',
    label: 'Unlink issues',
  },
  HISTORY_BTN: {
    category: STEP_PAGE,
    action: 'Click on Btn "History"',
    label: 'Transition to History View Page',
  },
  REFRESH_BTN: {
    category: STEP_PAGE,
    action: 'Click on Btn "Refresh"',
    label: 'Refresh page',
  },
  CLOSE_ICON_POST_ISSUE_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Icon Close on Modal Post Issue',
    label: 'Close Modal Post Issue',
  },
  ATTACHMENTS_SWITCHER_POST_ISSUE_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Attachments switcher on Modal Post Issue',
    label: 'On/off Attachments in Modal Post Issue',
  },
  LOGS_SWITCHER_POST_ISSUE_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Logs switcher on Modal Post Issue',
    label: 'On/off Logs in Modal Post Issue',
  },
  COMMENT_SWITCHER_POST_ISSUE_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Comment switcher on Modal Post Issue',
    label: 'On/off Comment in Modal Post Issue',
  },
  CANCEL_BTN_POST_ISSUE_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Btn Cancel on Modal Post Issue',
    label: 'Close Modal Post Issue',
  },
  POST_BTN_POST_ISSUE_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Btn Post on Modal Post Issue',
    label: 'Post bug',
  },
  CLOSE_ICON_LINK_ISSUE_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Icon Close on Modal Link Issue',
    label: 'Close Modal Link Issue',
  },
  ADD_NEW_ISSUE_BTN_LINK_ISSUE_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Btn Add New Issue on Modal Link Issue',
    label: 'Add input in Modal Link Issue',
  },
  CANCEL_BTN_LINK_ISSUE_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Btn Cancel on Modal Link Issue',
    label: 'Close Modal Modal Link Issue',
  },
  LOAD_BTN_LINK_ISSUE_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Btn Load on Modal Link Issue',
    label: 'Link issue',
  },
  CLOSE_ICON_DELETE_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Icon Close on Modal Delete Item',
    label: 'Close Modal Delete Item',
  },
  CANCEL_BTN_DELETE_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Btn Cancel on Modal Delete Item',
    label: 'Close Modal Delete Item',
  },
  DELETE_BTN_DELETE_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Btn Delete on Modal Delete Item',
    label: 'Delete item',
  },
  SAVE_BTN_DROPDOWN_EDIT_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Click on dropdown icon on Save Btn on Modal "Edit Item"',
    label: 'Arise dropdown',
  },
  POST_BUG_BTN_EDIT_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Select Save and Post Bug on dropdown in Modal "Edit Item"',
    label: 'Arise Modal "Post Bug"',
  },
  LOAD_BUG_BTN_EDIT_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Select Save and Load Bug on dropdown in Modal "Edit Item"',
    label: 'Arise Modal "Load Bug"',
  },
  UNLINK_ISSUE_BTN_EDIT_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Select Save and Unlink Issue on dropdown in Modal "Edit Item"',
    label: 'Arise Modal "Unlink issues"',
  },
  LOG_VIEW_SWITCHER: {
    category: STEP_PAGE,
    action: 'Click on test log view switcher',
    label: 'Open "Parent log view"',
  },
  RETRIES_BTN_CLICK: {
    category: STEP_PAGE,
    action: 'Click on Btn Retries',
    label: 'Open a list with Retries',
  },
  OPEN_RETRY_IN_LOG_VIEW_LINK_CLICK: {
    category: STEP_PAGE,
    action: 'Click on "Open in Log view"',
    label: 'Open Retry in Log view',
  },
  SELECT_ALL_SIMILIAR_ITEMS_EDIT_DEFECT_MODAL: {
    category: STEP_PAGE,
    action: 'Click on checkbox Change Similiar Items in Modal "Edit Defect"',
    label: 'Choose All similiar items in Modal "Edit Defect"',
  },
  COPY_CODE_REFERENCE_EDIT_DEFECT_MODAL: {
    category: STEP_PAGE,
    action: 'Click on "Copy Code reference"',
    label: 'Copy Code reference',
  },
  IGNORE_IN_AA_EDIT_DEFECT_MODAL: {
    category: STEP_PAGE,
    action: 'Turn on switcher Ignore in AA in Defect Editor',
    label: 'Ignore in AA single item',
  },
  INCLUDE_IN_AA_EDIT_DEFECT_MODAL: {
    category: STEP_PAGE,
    action: 'Turn off switcher Ignore in AA in Defect Editor',
    label: 'Include in AA single item',
  },
  IGNORE_BTN_IGNORE_ITEMS_IN_AA_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Ignore in Modal "Ignore items in AA"',
    label: 'Ignore items in AA',
  },
  CLOSE_ICON_IGNORE_ITEMS_IN_AA_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Close icon in Modal "Ignore items in AA"',
    label: 'Close Modal "Ignore items in AA"',
  },
  CANCEL_BTN_IGNORE_ITEMS_IN_AA_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Cancel in Modal "Ignore items in AA"',
    label: 'Close Modal "Ignore items in AA"',
  },
  INCLUDE_BTN_INCLUDE_IN_AA_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Include in Modal "Include items in AA"',
    label: 'Include items in AA',
  },
  CLOSE_ICON_INCLUDE_ITEMS_IN_AA_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Close icon in Modal "Include items in AA"',
    label: 'Close Modal "Include items in AA"',
  },
  CANCEL_BTN_INCLUDE_IN_AA_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Cancel in Modal "Include items in AA"',
    label: 'Close Modal "Include items in AA"',
  },
  CHANGE_SEARCH_MODE_EDIT_DEFECT_MODAL: {
    [SEARCH_MODES.CURRENT_LAUNCH]: {
      category: STEP_PAGE,
      action: 'Choose "For the current launch" in Modal "Edit Defect"',
      label: 'Choose "For the current launch" in Modal "Edit Defect"',
    },
    [SEARCH_MODES.LAUNCH_NAME]: {
      category: STEP_PAGE,
      action: 'Choose "For the launches with the same name" in Modal "Edit Defect"',
      label: 'Choose "For the launches with the same name" in Modal "Edit Defect"',
    },
    [SEARCH_MODES.FILTER]: {
      category: STEP_PAGE,
      action: 'Choose "For the current filter" in Modal "Edit Defect"',
      label: 'Choose "For the current filter" in Modal "Edit Defect"',
    },
  },
};
