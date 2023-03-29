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

import { getBasicClickEventParameters } from './common/ga4Utils';
import {
  getUnlinkIssueActionEvent,
  getClickOnPlusMinusEventCreator,
  getClickRefreshButtonEvent,
  getClickIssueTicketEvent,
  getClickDefectTooltipEvents,
  getClickOnExpandEvent,
} from './common/testItemPages/actionEventsCreators';
import {
  getDeleteItemModalEvents,
  getEditDefectModalEvents,
  getEditToInvestigateChangeSearchModeEvent,
  getEditToInvestigateSelectAllSimilarItemsEvent,
  getEditToInvestigateSelectSpecificSimilarItemEvent,
  getLinkIssueModalEvents,
  getMakeDecisionModalEvents,
  getPostIssueModalEvents,
  getUnlinkIssueModalEvents,
} from './common/testItemPages/modalEventsCreators';

export const LOG_PAGE = 'log';

const basicLogPageClickEventParameters = getBasicClickEventParameters(LOG_PAGE);
const basicHistoryLineClickEventParameters = {
  ...basicLogPageClickEventParameters,
  place: 'history_line',
};
const basicContainerWithDefectsClickEventParameters = {
  ...basicLogPageClickEventParameters,
  place: 'container_with_defects',
};
const basicAttachmentSectionClickEventParameters = {
  ...basicLogPageClickEventParameters,
  place: 'attachment_section',
};

export const LOG_PAGE_EVENTS = {
  // GA4 events
  CLICK_REFRESH_BTN: getClickRefreshButtonEvent(LOG_PAGE),
  ...getClickDefectTooltipEvents(LOG_PAGE),
  getClickOnPlusMinusBreadcrumbEvent: getClickOnPlusMinusEventCreator(LOG_PAGE),
  getClickOnHistoryLineCheckboxEvent: (isChecked) => ({
    ...basicLogPageClickEventParameters,
    element_name: 'history_line_checkbox',
    status: isChecked ? 'active' : 'disable',
  }),
  PREVIOUS_ITEM_BTN: {
    ...basicLogPageClickEventParameters,
    element_name: 'previous_method',
  },
  NEXT_ITEM_BTN: {
    ...basicLogPageClickEventParameters,
    element_name: 'next_method',
  },
  HISTORY_LINE_ITEM: {
    ...basicHistoryLineClickEventParameters,
    element_name: 'history_execution_tab',
  },
  CLICK_ON_MORE_BTN: {
    ...basicHistoryLineClickEventParameters,
    element_name: 'more',
  },
  getClickOnDefectDetailsTogglerEvent: (isExpanded) => ({
    ...basicContainerWithDefectsClickEventParameters,
    element_name: isExpanded ? 'more' : 'show_less',
  }),
  POST_ISSUE_ACTION: {
    ...basicContainerWithDefectsClickEventParameters,
    element_name: 'post',
  },
  LINK_ISSUE_ACTION: {
    ...basicContainerWithDefectsClickEventParameters,
    element_name: 'link',
  },
  STACK_TRACE_TAB: {
    ...basicLogPageClickEventParameters,
    element_name: 'stack_trace',
  },
  LOGS_TAB: {
    ...basicLogPageClickEventParameters,
    element_name: 'all_logs',
  },
  ATTACHMENT_TAB: {
    ...basicLogPageClickEventParameters,
    element_name: 'attachments',
  },
  ITEM_DETAILS_TAB: {
    ...basicLogPageClickEventParameters,
    element_name: 'item_details',
  },
  ACTIONS_TAB: {
    ...basicLogPageClickEventParameters,
    element_name: 'history_of_actions',
  },
  EXPAND_LOG_MSG: getClickOnExpandEvent(LOG_PAGE, 'all_logs'),
  EXPAND_STACK_TRACE: getClickOnExpandEvent(LOG_PAGE, 'stack_trace'),
  getClickOnLogLevelFilterEvent: (logLevel) => ({
    ...basicLogPageClickEventParameters,
    icon_name: 'level_filter',
    element_name: logLevel,
  }),
  getClickOnHighlightErrorLogEvent: (hasDirection) => ({
    ...basicLogPageClickEventParameters,
    element_name: hasDirection ? 'show_error_logs' : 'show',
  }),
  getClickOnLogsWithAttachmentsCheckboxEvent: (isChecked) => ({
    ...basicLogPageClickEventParameters,
    element_name: 'logs_with_attachments',
    status: isChecked ? 'check' : 'uncheck',
  }),
  getClickOnHidePassedLogsCheckboxEvent: (isChecked) => ({
    ...basicLogPageClickEventParameters,
    element_name: 'hide_all_passed_logs',
    status: isChecked ? 'check' : 'uncheck',
  }),
  getClickOnLogViewModeEvent: (viewMode, isActive) => ({
    ...basicLogPageClickEventParameters,
    icon_name: `${viewMode}_mode`,
    status: isActive ? 'on' : 'off',
  }),
  CLICK_JUMP_TO_ERROR_LOG: {
    ...basicLogPageClickEventParameters,
    place: 'stack_trace',
    icon_name: 'jump_to',
  },
  NESTED_STEP_EXPAND: {
    ...basicLogPageClickEventParameters,
    place: 'nested_steps',
    icon_name: 'expand_nested_step',
  },
  CLICK_HISTORY_RELEVANT_ITEM_LINK: {
    ...basicLogPageClickEventParameters,
    place: 'history_of_actions',
    link_name: 'item',
  },
  PREVIOUS_ATTACHMENT_ICON: {
    ...basicLogPageClickEventParameters,
    icon_name: 'previous_attachment',
  },
  NEXT_ATTACHMENT_ICON: {
    ...basicLogPageClickEventParameters,
    icon_name: 'next_attachment',
  },
  ATTACHMENT_THUMBNAIL: {
    ...basicAttachmentSectionClickEventParameters,
    icon_name: 'thumbnail_attachment',
  },
  ATTACHMENT_IN_CAROUSEL: {
    DOWNLOAD: {
      ...basicAttachmentSectionClickEventParameters,
      icon_name: 'download',
    },
    OPEN_IN_NEW_TAB: {
      ...basicAttachmentSectionClickEventParameters,
      icon_name: 'open_in_new_tab',
    },
  },
  // GA3 events
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
  DEFECT_TYPE_TAG: {
    category: LOG_PAGE,
    action: 'Click on Defect type tag',
    label: 'Arise Modal Edit Defect type',
  },
  selectDropDownStatusEvent: (oldStatus, newStatus) => ({
    category: LOG_PAGE,
    action: 'Select Test Item Status from Drop-down List',
    label: `Change status from ${oldStatus} to ${newStatus}`,
  }),
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
  ALL_STATUSES: {
    category: LOG_PAGE,
    action: 'Click on Icon Sorting on "All Statuses" in Log Message',
    label: 'Sort Logs',
  },
  TIME_SORTING: {
    category: LOG_PAGE,
    action: 'Click on icon Sorting on Time in Log Message',
    label: 'Sort logs',
  },
  ATTACHMENT_IN_LOG_MSG: {
    OPEN_IN_MODAL: {
      category: LOG_PAGE,
      action: 'Click on Attachment in Log Message',
      label: 'Open Attachment in modal',
    },
    DOWNLOAD: {
      category: LOG_PAGE,
      action: 'Click on Download Attachment icon in Log Message',
      label: 'Download Attachment',
    },
    OPEN_IN_NEW_TAB: {
      category: LOG_PAGE,
      action: 'Click on Open Attachment in new tab icon in Log Message',
      label: 'Open Attachment in new browser tab',
    },
  },
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
  CLOSE_ICON_ATTACHMENT_MODAL: {
    category: LOG_PAGE,
    action: 'Click on icon Close on Modal Attachment',
    label: 'Close Modal Attachment',
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
  MAKE_DECISION_MODAL_EVENTS: getMakeDecisionModalEvents(LOG_PAGE),
  onClickIssueTicketEvent: getClickIssueTicketEvent(LOG_PAGE),
};
