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
  getRefreshPageActionEvent,
  getLinkIssueActionEvent,
  getPostIssueActionEvent,
  getUnlinkIssueActionEvent,
} from './common/testItemPages/actionEventsCreators';
import {
  getDeleteItemModalEvents,
  getEditDefectModalEvents,
  getEditToInvestigateChangeSearchModeEvent,
  getEditToInvestigateSelectAllSimilarItemsEvent,
  getEditToInvestigateSelectSpecificSimilarItemEvent,
  getLinkIssueModalEvents,
  getPostIssueModalEvents,
  getUnlinkIssueModalEvents,
} from './common/testItemPages/modalEventsCreators';

export const LOG_PAGE = 'log';
export const LOG_PAGE_EVENTS = {
  PLUS_MINUS_BREADCRUMB: {
    category: LOG_PAGE,
    action: 'Click on Bread Crumb icon Plus/Minus',
    label: 'Show/Hide all names of items',
  },
  ALL_LABEL_BREADCRUMB: {
    category: LOG_PAGE,
    action: 'Click on Bread Crumb All',
    label: 'Transition to Launches Page',
  },
  ITEM_NAME_BREADCRUMB_CLICK: {
    category: LOG_PAGE,
    action: 'Click on Bread Crumb Item name',
    label: 'Transition to Item',
  },
  PREVIOUS_ITEM_BTN: {
    category: LOG_PAGE,
    action: 'Click on Btn prev Method',
    label: 'Transition to prev Method Item',
  },
  NEXT_ITEM_BTN: {
    category: LOG_PAGE,
    action: 'Click on Btn next Method',
    label: 'Transition to next Method Item',
  },
  REFRESH_BTN: getRefreshPageActionEvent(LOG_PAGE),
  DEFECT_TYPE_TAG: {
    category: LOG_PAGE,
    action: 'Click on Defect type tag',
    label: 'Arise Modal Edit Defect type',
  },
  HISTORY_LINE_ITEM: {
    category: LOG_PAGE,
    action: 'Click on History execution tab',
    label: 'Transition to item log page',
  },
  STACK_TRACE_TAB: {
    category: LOG_PAGE,
    action: 'Click on Stack Trace tab',
    label: 'Open Stack Trace tab',
  },
  ATTACHMENT_TAB: {
    category: LOG_PAGE,
    action: 'Click on Attachments tab',
    label: 'Open Attachments tab',
  },
  ITEM_DETAILS_TAB: {
    category: LOG_PAGE,
    action: 'Click on Item Details tab',
    label: 'Open Item Details tab',
  },
  ACTIONS_TAB: {
    category: LOG_PAGE,
    action: 'Click on History of Actions tab',
    label: 'Open History of Actions tab',
  },
  LOG_LEVEL_FILTER: {
    category: LOG_PAGE,
    action: 'Select Log level filter in dropdown',
    label: 'Filter by selected parameter',
  },
  LOG_WITH_ATTACHMENT_CHECKBOX: {
    category: LOG_PAGE,
    action: 'Click on checkbox Logs with attachments',
    label: 'Check/uncheck logs with attachments',
  },
  PREVIOUS_LOG_MSG_PAGE: {
    category: LOG_PAGE,
    action: 'Click on Btn Previous Log message page',
    label: 'Transition to previous log message page',
  },
  NEXT_LOG_MSG_PAGE: {
    category: LOG_PAGE,
    action: 'Click on Btn Next Log message page',
    label: 'Transition to next log message page',
  },
  ENTER_LOG_MSG_FILTER: {
    category: LOG_PAGE,
    action: 'Enter filter parameter in Log message input',
    label: 'Filter log messages by parameter',
  },
  TIME_SORTING: {
    category: LOG_PAGE,
    action: 'Click on icon Sorting on Time in Log Message',
    label: 'Sort logs',
  },
  ATTACHMENT_IN_LOG_MSG: {
    category: LOG_PAGE,
    action: 'Click on Attachment in Log Message',
    label: 'Open Attachment',
  },
  EXPAND_LOG_MSG: {
    category: LOG_PAGE,
    action: 'Click on icon Expand in Log Message',
    label: 'Expand/close log',
  },
  POST_ISSUE_ACTION: getPostIssueActionEvent(LOG_PAGE),
  LINK_ISSUE_ACTION: getLinkIssueActionEvent(LOG_PAGE),
  UNLINK_ISSUES_ACTION: getUnlinkIssueActionEvent(LOG_PAGE),
  // EDIT_DEFECT_MODAL
  EDIT_DEFECT_MODAL_EVENTS: getEditDefectModalEvents(LOG_PAGE),
  SELECT_ALL_SIMILAR_ITEMS_EDIT_DEFECT_MODAL: getEditToInvestigateSelectAllSimilarItemsEvent(
    LOG_PAGE,
  ),
  SELECT_SPECIFIC_SIMILAR_ITEM_EDIT_DEFECT_MODAL: getEditToInvestigateSelectSpecificSimilarItemEvent(
    LOG_PAGE,
  ),
  CHANGE_SEARCH_MODE_EDIT_DEFECT_MODAL: getEditToInvestigateChangeSearchModeEvent(LOG_PAGE),
  // UNLINK_ISSUE_MODAL
  UNLINK_ISSUE_MODAL_EVENTS: getUnlinkIssueModalEvents(LOG_PAGE),
  // POST_ISSUE_MODAL
  POST_ISSUE_MODAL_EVENTS: getPostIssueModalEvents(LOG_PAGE),
  // LINK_ISSUE_MODAL
  LINK_ISSUE_MODAL_EVENTS: getLinkIssueModalEvents(LOG_PAGE),
  // DELETE_ITEM_MODAL
  DELETE_ITEM_MODAL_EVENTS: getDeleteItemModalEvents(LOG_PAGE),
  PREVIOUS_ATTACHMENT_ICON: {
    category: LOG_PAGE,
    action: 'Click on icon Previous Attachment',
    label: 'Show Previous Attachment',
  },
  NEXT_ATTACHMENT_ICON: {
    category: LOG_PAGE,
    action: 'Click on icon Next Attachment',
    label: 'Show Next Attachment',
  },
  ATTACHMENT_CLICK: {
    category: LOG_PAGE,
    action: 'Click on opened Attachment',
    label: 'Arise modal with Attachment',
  },
  ATTACHMENT_THUMBNAIL: {
    category: LOG_PAGE,
    action: 'Click on thumbnail of Attachment',
    label: 'Show this Attachment',
  },
  CLOSE_ICON_ATTACHMENT_MODAL: {
    category: LOG_PAGE,
    action: 'Click on icon Close on Modal Attachment',
    label: 'Close Modal Attachment',
  },
  ROTATE_ICON_ATTACHMENT_MODAL: {
    category: LOG_PAGE,
    action: 'Click on icon Rotate on Modal Attachment',
    label: 'Rotate Attachment',
  },
  CLOSE_BTN_ATTACHMENT_MODAL: {
    category: LOG_PAGE,
    action: 'Click on Btn Close on Modal Attachment',
    label: 'Close Modal Attachment',
  },
  COPY_DEFECT_FROM_BTN: {
    category: LOG_PAGE,
    action: 'Click on Btn "Copy defect from #"',
    label: 'Arise Modal "Receive previous result"',
  },
  RECEIVE_BTN_RECEIVE_PREVIOUS_RESULT_MODAL: {
    category: LOG_PAGE,
    action: 'Click on button Receive in Modal "Receive previous result"',
    label: 'Receive defect from previouse result',
  },
  CANCEL_BTN_RECEIVE_PREVIOUS_RESULT_MODAL: {
    category: LOG_PAGE,
    action: 'Click on Copy defect from #',
    label: 'Close Modal "Receive previous result"',
  },
  SEND_DEFECT_TO_BTN: {
    category: LOG_PAGE,
    action: 'Click on Btn "Send defect to #"',
    label: 'Arise Modal "Send defect to the last item"',
  },
  SEND_BTN_SEND_DEFECT_MODAL: {
    category: LOG_PAGE,
    action: 'Click on button Send in Modal "Send defect to the last item"',
    label: 'Send defect to the last item',
  },
  CANCEL_BTN_SEND_DEFECT_MODAL: {
    category: LOG_PAGE,
    action: 'Click on button Cancel in Modal "Send defect to the last item"',
    label: 'Close Modal "Send defect to the last item"',
  },
  RETRY_CLICK: {
    category: LOG_PAGE,
    action: 'Click on retry',
    label: 'Transition to retry log page',
  },
  LOAD_MORE_CLICK_STACK_TRACE: {
    category: LOG_PAGE,
    action: 'Click on Load more in Stake Trace',
    label: 'Load more logs in Stak Trace tab on Log view',
  },
  NESTED_STEP_EXPAND: {
    category: LOG_PAGE,
    action: 'Click on Nested step',
    label: 'Expand Nested step',
  },
  SAUCE_LABS_BTN: {
    category: LOG_PAGE,
    action: 'Click on Sauce labs button',
    label: 'Open Sauce Labs section',
  },
  PLAY_SAUCE_LABS_VIDEO: {
    category: LOG_PAGE,
    action: 'Click on Play button on Sauce Labs video',
    label: 'Play Sauce Labs video',
  },
};
