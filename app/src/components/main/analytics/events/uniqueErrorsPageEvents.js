/*
 * Copyright 2021 EPAM Systems
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
  getClickExpandStackTraceArrowEvent,
  getClickIssueTicketEvent,
  getClickSelectAllItemsEvent,
  getClickSelectOneItemEvent,
  getCommonActionEvents,
  getDeleteActionEvent,
  getIgnoreBtnIgnoreItemsInAAModalEvent,
  getIncludeBtnIncludeInAAModalEvent,
  getLinkIssueActionEvent,
  getPostIssueActionEvent,
  getUnlinkIssueActionEvent,
  getClickItemNameEvent,
  getClickRefreshButtonEvent,
  getClickActionsButtonEvent,
  getClickPencilIconEvent,
  getClickOnPlusMinusEventCreator,
} from './common/testItemPages/actionEventsCreators';
import {
  getClickOnAnalyzeUniqueErrorsEventCreator,
  getDeleteItemModalEvents,
  getEditItemsModalEvents,
  getLinkIssueModalEvents,
  getMakeDecisionModalEvents,
  getPostIssueModalEvents,
  getUnlinkIssueModalEvents,
} from './common/testItemPages/modalEventsCreators';

export const UNIQUE_ERRORS_PAGE = 'unique_errors';

const basicUniqueErrorsPageClickEventParameters = getBasicClickEventParameters(UNIQUE_ERRORS_PAGE);

export const UNIQUE_ERRORS_PAGE_EVENTS = {
  // GA4 events
  CLICK_ITEM_NAME: getClickItemNameEvent(UNIQUE_ERRORS_PAGE),
  CLICK_REFRESH_BTN: getClickRefreshButtonEvent(UNIQUE_ERRORS_PAGE),
  CLICK_SELECT_ONE_ITEM: getClickSelectOneItemEvent(UNIQUE_ERRORS_PAGE),
  CLICK_SELECT_ALL_ITEMS: getClickSelectAllItemsEvent(UNIQUE_ERRORS_PAGE),
  CLICK_ACTIONS_BTN: getClickActionsButtonEvent(UNIQUE_ERRORS_PAGE),
  EDIT_ICON_CLICK: getClickPencilIconEvent(UNIQUE_ERRORS_PAGE),
  getClickOnPlusMinusBreadcrumbEvent: getClickOnPlusMinusEventCreator(UNIQUE_ERRORS_PAGE),
  CLICK_RUN_BUTTON: {
    ...basicUniqueErrorsPageClickEventParameters,
    element_name: 'run_unique_errors_analysis',
  },
  clickAnalyzeEvent: getClickOnAnalyzeUniqueErrorsEventCreator(UNIQUE_ERRORS_PAGE),
  CLICK_CLUSTER_ITEM_ARROW: {
    ...basicUniqueErrorsPageClickEventParameters,
    icon_name: 'expand_cluster',
  },
  CLICK_EXPANDED_ERROR_ARROW: {
    ...basicUniqueErrorsPageClickEventParameters,
    icon_name: 'expand_error',
  },
  // GA3 events
  ...getCommonActionEvents(UNIQUE_ERRORS_PAGE),
  onClickIssueTicketEvent: getClickIssueTicketEvent(UNIQUE_ERRORS_PAGE),
  MAKE_DECISION_MODAL_EVENTS: getMakeDecisionModalEvents(UNIQUE_ERRORS_PAGE),
  EDIT_ITEMS_MODAL_EVENTS: getEditItemsModalEvents(UNIQUE_ERRORS_PAGE),
  CLICK_EXPAND_STACK_TRACE_ARROW: getClickExpandStackTraceArrowEvent(UNIQUE_ERRORS_PAGE),
  POST_ISSUE_ACTION: getPostIssueActionEvent(UNIQUE_ERRORS_PAGE),
  LINK_ISSUE_ACTION: getLinkIssueActionEvent(UNIQUE_ERRORS_PAGE),
  UNLINK_ISSUES_ACTION: getUnlinkIssueActionEvent(UNIQUE_ERRORS_PAGE),
  DELETE_ACTION: getDeleteActionEvent(UNIQUE_ERRORS_PAGE),
  IGNORE_IN_AA_ACTION: {
    category: UNIQUE_ERRORS_PAGE,
    action: 'Click on Ignore in Auto-Analysis',
    label: 'Arise Modal "Ignore items in AA"',
  },
  INCLUDE_IN_AA_ACTION: {
    category: UNIQUE_ERRORS_PAGE,
    action: 'Click on Include in Auto-Analysis',
    label: 'Arise Modal "Include items in AA"',
  },
  IGNORE_BTN_IGNORE_ITEMS_IN_AA_MODAL: getIgnoreBtnIgnoreItemsInAAModalEvent(UNIQUE_ERRORS_PAGE),
  DELETE_ITEM_MODAL_EVENTS: getDeleteItemModalEvents(UNIQUE_ERRORS_PAGE),
  INCLUDE_BTN_INCLUDE_IN_AA_MODAL: getIncludeBtnIncludeInAAModalEvent(UNIQUE_ERRORS_PAGE),
  POST_ISSUE_MODAL_EVENTS: getPostIssueModalEvents(UNIQUE_ERRORS_PAGE),
  LINK_ISSUE_MODAL_EVENTS: getLinkIssueModalEvents(UNIQUE_ERRORS_PAGE),
  UNLINK_ISSUE_MODAL_EVENTS: getUnlinkIssueModalEvents(UNIQUE_ERRORS_PAGE),
};
