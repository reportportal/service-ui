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
  getDeleteActionEvent,
  getEditDefectActionEvent,
  getLinkIssueActionEvent,
  getUnlinkIssueActionEvent,
  getPostIssueActionEvent,
  getProceedValidItemsEvent,
  getRefreshPageActionEvent,
} from './common/testItemPages/actionEventsCreators';
import {
  getEditDefectModalEvents,
  getEditToInvestigateSelectAllSimilarItemsEvent,
  getEditToInvestigateChangeSearchModeEvent,
  getUnlinkIssueCancelButtonEvent,
  getUnlinkIssueCloseIconEvent,
  getUnlinkIssueUnlinkButtonEvent,
  getPostIssueAttachmentsSwitcherEvent,
  getPostIssueCancelButtonEvent,
  getPostIssueCloseIconEvent,
  getPostIssueCommentSwitcherEvent,
  getPostIssueLogsSwitcherEvent,
  getPostIssuePostButtonEvent,
  getLinkIssueCloseIconEvent,
  getLinkIssueAddNewIssueEvent,
  getLinkIssueCancelButtonEvent,
  getLinkIssueLoadButtonEvent,
  getDeleteItemCancelButtonEvent,
  getDeleteItemCloseIconEvent,
  getDeleteItemDeleteButtonEvent,
} from './common/testItemPages/modalEventsCreators';

export const HISTORY_PAGE = 'history';
export const HISTORY_PAGE_EVENTS = {
  CLOSE_ICON_EDIT_ITEM_MODAL: {
    category: HISTORY_PAGE,
    action: 'Click on Close Icon on Modal "Edit Item"',
    label: 'Close modal "Edit Item"',
  },
  CANCEL_BTN_EDIT_ITEM_MODAL: {
    category: HISTORY_PAGE,
    action: 'Click on Btn Cancel on Modal "Edit Item',
    label: 'Close modal "Edit Item"',
  },
  SAVE_BTN_EDIT_ITEM_MODAL: {
    category: HISTORY_PAGE,
    action: 'Click on Btn Save on Modal "Edit Item"',
    label: 'Save changes',
  },
  BULK_EDIT_ITEMS_DESCRIPTION: {
    category: HISTORY_PAGE,
    action: 'Edit description in Modal "Edit Items" in a bulk',
    label: 'Edit description in mode: ',
  },
  SELECT_HISTORY_DEPTH: {
    category: HISTORY_PAGE,
    action: 'Select "history depth"',
    label: 'Show parameter of selected "history depth"',
  },
  CLICK_ON_ITEM: {
    category: HISTORY_PAGE,
    action: 'Click on item',
    label: 'Transition to "Item"',
  },
  SELECT_HISTORY_ITEM: {
    category: HISTORY_PAGE,
    action: 'Select history item',
    label: 'Add item to the selected items',
  },
  UNSELECT_HISTORY_ITEM: {
    category: HISTORY_PAGE,
    action: 'Unselect history item',
    label: 'Remove item from the selected items',
  },

  REFRESH_BTN: getRefreshPageActionEvent(HISTORY_PAGE),
  EDIT_DEFECT_ACTION: getEditDefectActionEvent(HISTORY_PAGE),
  POST_ISSUE_ACTION: getPostIssueActionEvent(HISTORY_PAGE),
  LINK_ISSUE_ACTION: getLinkIssueActionEvent(HISTORY_PAGE),
  DELETE_ACTION: getDeleteActionEvent(HISTORY_PAGE),
  UNLINK_ISSUES_ACTION: getUnlinkIssueActionEvent(HISTORY_PAGE),
  PROCEED_VALID_ITEMS: getProceedValidItemsEvent(HISTORY_PAGE),
  // UNLINK_ISSUE_MODAL
  CANCEL_BTN_UNLINK_ISSUE_MODAL: getUnlinkIssueCancelButtonEvent(HISTORY_PAGE),
  CLOSE_ICON_UNLINK_ISSUE_MODAL: getUnlinkIssueCloseIconEvent(HISTORY_PAGE),
  UNLINK_BTN_UNLINK_ISSUE_MODAL: getUnlinkIssueUnlinkButtonEvent(HISTORY_PAGE),
  // EDIT_DEFECT_MODAL
  EDIT_DEFECT_MODAL_EVENTS: getEditDefectModalEvents(HISTORY_PAGE),
  SELECT_ALL_SIMILIAR_ITEMS_EDIT_DEFECT_MODAL: getEditToInvestigateSelectAllSimilarItemsEvent(
    HISTORY_PAGE,
  ),
  CHANGE_SEARCH_MODE_EDIT_DEFECT_MODAL: getEditToInvestigateChangeSearchModeEvent(HISTORY_PAGE),
  // POST_ISSUE_MODAL
  CLOSE_ICON_POST_ISSUE_MODAL: getPostIssueCloseIconEvent(HISTORY_PAGE),
  ATTACHMENTS_SWITCHER_POST_ISSUE_MODAL: getPostIssueAttachmentsSwitcherEvent(HISTORY_PAGE),
  LOGS_SWITCHER_POST_ISSUE_MODAL: getPostIssueLogsSwitcherEvent(HISTORY_PAGE),
  COMMENT_SWITCHER_POST_ISSUE_MODAL: getPostIssueCommentSwitcherEvent(HISTORY_PAGE),
  CANCEL_BTN_POST_ISSUE_MODAL: getPostIssueCancelButtonEvent(HISTORY_PAGE),
  POST_BTN_POST_ISSUE_MODAL: getPostIssuePostButtonEvent(HISTORY_PAGE),
  // LINK_ISSUE_MODAL
  CLOSE_ICON_LINK_ISSUE_MODAL: getLinkIssueCloseIconEvent(HISTORY_PAGE),
  ADD_NEW_ISSUE_BTN_LINK_ISSUE_MODAL: getLinkIssueAddNewIssueEvent(HISTORY_PAGE),
  CANCEL_BTN_LINK_ISSUE_MODAL: getLinkIssueCancelButtonEvent(HISTORY_PAGE),
  LOAD_BTN_LINK_ISSUE_MODAL: getLinkIssueLoadButtonEvent(HISTORY_PAGE),
  // DELETE_ITEM_MODAL
  CLOSE_ICON_DELETE_ITEM_MODAL: getDeleteItemCloseIconEvent(HISTORY_PAGE),
  CANCEL_BTN_DELETE_ITEM_MODAL: getDeleteItemCancelButtonEvent(HISTORY_PAGE),
  DELETE_BTN_DELETE_ITEM_MODAL: getDeleteItemDeleteButtonEvent(HISTORY_PAGE),
};
