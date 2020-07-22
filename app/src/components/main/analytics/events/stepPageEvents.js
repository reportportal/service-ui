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
import {
  getProceedValidItemsEvent,
  getEditDefectActionEvent,
  getDeleteActionEvent,
  getLinkIssueActionEvent,
  getPostIssueActionEvent,
  getUnlinkIssueActionEvent,
  getHistoryPageLinkEvent,
  getRefreshPageActionEvent,
  getRefineFiltersPanelEvents,
  getChangeFilterEvent,
} from './common/testItemPages/actionEventsCreators';
import {
  getEditDefectModalEvents,
  getEditToInvestigateChangeSearchModeEvent,
  getEditToInvestigateSelectAllSimilarItemsEvent,
  getEditToInvestigateSelectSpecificSimilarItemEvent,
  getUnlinkIssueModalEvents,
  getPostIssueModalEvents,
  getLinkIssueModalEvents,
  getDeleteItemModalEvents,
  getEditItemsModalEvents,
} from './common/testItemPages/modalEventsCreators';

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
  // REFINE_FILTERS_PANEL
  REFINE_FILTERS_PANEL_EVENTS: {
    commonEvents: getRefineFiltersPanelEvents(STEP_PAGE),
    getChangeFilterEvent: getChangeFilterEvent(STEP_PAGE),
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
  EDIT_ITEMS_ACTION: {
    category: STEP_PAGE,
    action: 'Click on "edit" in Actions',
    label: 'Arise Modal "Edit Items"',
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
  CLOSE_ICON_SELECTED_ITEM: {
    category: STEP_PAGE,
    action: 'Click on icon "close" on selected item',
    label: 'Remove item from the selected items',
  },
  CLOSE_ICON_FOR_ALL_SELECTIONS: {
    category: STEP_PAGE,
    action: 'Click on Close Icon of all selection',
    label: 'Close panel with selected items',
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
  HISTORY_BTN: getHistoryPageLinkEvent(STEP_PAGE),
  REFRESH_BTN: getRefreshPageActionEvent(STEP_PAGE),
  PROCEED_VALID_ITEMS: getProceedValidItemsEvent(STEP_PAGE),
  EDIT_DEFECT_ACTION: getEditDefectActionEvent(STEP_PAGE),
  POST_ISSUE_ACTION: getPostIssueActionEvent(STEP_PAGE),
  LINK_ISSUE_ACTION: getLinkIssueActionEvent(STEP_PAGE),
  UNLINK_ISSUES_ACTION: getUnlinkIssueActionEvent(STEP_PAGE),
  DELETE_ACTION: getDeleteActionEvent(STEP_PAGE),
  // EDIT_DEFECT_MODAL
  EDIT_DEFECT_MODAL_EVENTS: getEditDefectModalEvents(STEP_PAGE),
  SELECT_ALL_SIMILAR_ITEMS_EDIT_DEFECT_MODAL: getEditToInvestigateSelectAllSimilarItemsEvent(
    STEP_PAGE,
  ),
  SELECT_SPECIFIC_SIMILAR_ITEM_EDIT_DEFECT_MODAL: getEditToInvestigateSelectSpecificSimilarItemEvent(
    STEP_PAGE,
  ),
  CHANGE_SEARCH_MODE_EDIT_DEFECT_MODAL: getEditToInvestigateChangeSearchModeEvent(STEP_PAGE),
  // UNLINK_ISSUE_MODAL
  UNLINK_ISSUE_MODAL_EVENTS: getUnlinkIssueModalEvents(STEP_PAGE),
  // POST_ISSUE_MODAL
  POST_ISSUE_MODAL_EVENTS: getPostIssueModalEvents(STEP_PAGE),
  // LINK_ISSUE_MODAL
  LINK_ISSUE_MODAL_EVENTS: getLinkIssueModalEvents(STEP_PAGE),
  // DELETE_ITEM_MODAL
  DELETE_ITEM_MODAL_EVENTS: getDeleteItemModalEvents(STEP_PAGE),
  // EDIT_ITEMS_MODAL
  EDIT_ITEMS_MODAL_EVENTS: getEditItemsModalEvents(STEP_PAGE),
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
  COPY_CODE_REFERENCE_EDIT_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Click on "Copy Code reference"',
    label: 'Copy Code reference',
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
};
