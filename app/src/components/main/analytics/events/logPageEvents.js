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

import { getBasicChooseEventParameters, getBasicClickEventParameters } from './common/ga4Utils';
import {
  getUnlinkIssueActionEvent,
  getClickRefreshButtonEvent,
  getClickIssueTicketEvent,
  getClickDefectTooltipEvents,
  getClickOnExpandEvent,
  getClickOnTestItemsTabsEvents,
  getClickBreadcrumbsEvents,
  getChangeItemStatusEventCreator,
} from './common/testItemPages/actionEventsCreators';
import {
  getLinkIssueModalEvents,
  getMakeDecisionModalEvents,
  getPostIssueModalEvents,
  getUnlinkIssueModalEvents,
} from './common/testItemPages/modalEventsCreators';

export const LOG_PAGE = 'log';

const basicLogPageClickEventParameters = getBasicClickEventParameters(LOG_PAGE);
const basicLogPageChooseEventParameters = getBasicChooseEventParameters(LOG_PAGE);
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
const basicLogMessageClickEventParameters = {
  ...basicLogPageClickEventParameters,
  place: 'log_message',
};
const basicNestedStepsClickEventParameters = {
  ...basicLogPageClickEventParameters,
  place: 'nested_steps',
};

export const LOG_PAGE_EVENTS = {
  // GA4 events
  CLICK_REFRESH_BTN: getClickRefreshButtonEvent(LOG_PAGE),
  ...getClickDefectTooltipEvents(LOG_PAGE),
  TEST_ITEM_TABS_EVENTS: getClickOnTestItemsTabsEvents(LOG_PAGE),
  ...getClickBreadcrumbsEvents(LOG_PAGE),
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
  getClickOnLogMicrosecondPrecisionEvent: (isActive) => ({
    ...basicLogPageClickEventParameters,
    element_name: 'microseconds',
    switcher: isActive ? 'on' : 'off',
  }),
  clickJumpToLog: (place = 'stack_trace') => ({
    ...basicLogPageClickEventParameters,
    place,
    icon_name: 'jump_to',
  }),
  NESTED_STEP_EXPAND: {
    ...basicNestedStepsClickEventParameters,
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
  ATTACHMENT_IN_LOG_MSG: {
    OPEN_IN_MODAL: {
      ...basicLogMessageClickEventParameters,
      icon_name: 'attachment',
    },
    DOWNLOAD: {
      ...basicLogMessageClickEventParameters,
      icon_name: 'download',
    },
    OPEN_IN_NEW_TAB: {
      ...basicLogMessageClickEventParameters,
      icon_name: 'open_in_new_tab',
    },
  },
  ATTACHMENT_CODE_MODAL: {
    OPEN_IN_NEW_TAB: {
      ...basicLogPageClickEventParameters,
      modal: 'attachment',
      icon_name: 'open_in_new_tab',
    },
  },
  ALL_STATUSES_DROPDOWN: {
    OPEN: {
      ...basicLogPageClickEventParameters,
      icon_name: 'all_statuses',
    },
    getChangeStatusEvent: (status) => ({
      ...basicLogPageChooseEventParameters,
      place: 'nested_steps',
      icon_name: 'all_statuses',
      type: status,
    }),
  },
  RETRY_CLICK: {
    ...basicLogPageClickEventParameters,
    icon_name: 'retries',
  },
  getClickOnLoadMoreLogsEvent: (direction) => ({
    ...basicNestedStepsClickEventParameters,
    icon_name: `load_${direction}_300`,
  }),
  LOAD_CURRENT_STEP: {
    ...basicNestedStepsClickEventParameters,
    icon_name: 'load_current_step',
  },
  TIME_SORTING: {
    ...basicLogPageClickEventParameters,
    icon_name: 'sort_time',
  },
  SAUCE_LABS_BTN: {
    ...basicLogPageClickEventParameters,
    icon_name: 'sauce_labs',
  },
  PLAY_SAUCE_LABS_VIDEO: {
    ...basicLogPageClickEventParameters,
    element_name: 'play_video_sauce_labs',
  },
  getChangeItemStatusEvent: getChangeItemStatusEventCreator(LOG_PAGE),
  clickSettingsIcon: (isEnabled) => ({
    ...basicLogPageClickEventParameters,
    icon_name: 'settings',
    status: isEnabled ? 'on' : 'off',
  }),
  getToggleNoLogsCollapsingEvent: (isEnabled) => ({
    ...basicLogPageClickEventParameters,
    element_name: 'no_logs_collapsing',
    place: 'settings',
    status: isEnabled ? 'enabled' : 'disabled',
  }),
  getClickPaginationOptionEvent: (isEnabled) => ({
    ...basicLogPageClickEventParameters,
    place: 'settings',
    element_name: isEnabled ? 'turn_on_pagination' : 'turn_off_pagination',
  }),
  getTogglePaginationEvent: (isEnabled) => ({
    ...basicLogPageClickEventParameters,
    place: 'settings',
    modal: isEnabled ? 'turn_on_pagination' : 'turn_off_pagination',
    element_name: isEnabled ? 'turn_on_reload' : 'turn_off_reload',
  }),
  getLogsSizeChangeEvent: (logsSize) => ({
    ...basicLogPageClickEventParameters,
    element_name: 'console_mode_log_size',
    place: 'settings',
    condition: logsSize,
  }),
  getToggleFullWidthModeEvent: (isEnabled) => ({
    ...basicLogPageClickEventParameters,
    element_name: 'full_width_size',
    place: 'settings',
    status: isEnabled ? 'enabled' : 'disabled',
  }),
  getToggleColorizedBackgroundEvent: (isEnabled) => ({
    ...basicLogPageClickEventParameters,
    element_name: 'colorized_background',
    place: 'settings',
    status: isEnabled ? 'enabled' : 'disabled',
  }),
  ENTER_LOG_MSG_FILTER: {
    ...basicLogPageClickEventParameters,
    place: 'all_logs',
    element_name: 'search',
  },
  UNLINK_ISSUES_ACTION: getUnlinkIssueActionEvent(LOG_PAGE),
  // UNLINK_ISSUE_MODAL
  UNLINK_ISSUE_MODAL_EVENTS: getUnlinkIssueModalEvents(LOG_PAGE),
  // POST_ISSUE_MODAL
  POST_ISSUE_MODAL_EVENTS: getPostIssueModalEvents(LOG_PAGE),
  // LINK_ISSUE_MODAL
  LINK_ISSUE_MODAL_EVENTS: getLinkIssueModalEvents(LOG_PAGE),
  MAKE_DECISION_MODAL_EVENTS: getMakeDecisionModalEvents(LOG_PAGE),
  onClickIssueTicketEvent: getClickIssueTicketEvent(LOG_PAGE),
};
