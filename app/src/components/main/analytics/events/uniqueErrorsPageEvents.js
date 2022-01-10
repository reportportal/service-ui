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

import {
  getClickExpandStackTraceArrowEvent,
  getClickIssueTicketEvent,
  getClickSelectAllItemsEvent,
  getClickSelectOneItemEvent,
  getCommonActionEvents,
  getDeleteActionEvent,
  getLinkIssueActionEvent,
  getPostIssueActionEvent,
  getUnlinkIssueActionEvent,
} from './common/testItemPages/actionEventsCreators';
import {
  getEditItemsModalEvents,
  getMakeDecisionModalEvents,
} from './common/testItemPages/modalEventsCreators';

export const UNIQUE_ERRORS_PAGE = 'Unique Errors';

export const UNIQUE_ERRORS_PAGE_EVENTS = {
  ...getCommonActionEvents(UNIQUE_ERRORS_PAGE),
  onClickIssueTicketEvent: getClickIssueTicketEvent(UNIQUE_ERRORS_PAGE),
  MAKE_DECISION_MODAL_EVENTS: getMakeDecisionModalEvents(UNIQUE_ERRORS_PAGE),
  CLICK_RUN_BUTTON: {
    category: UNIQUE_ERRORS_PAGE,
    action: 'Click on Button "Run Unique Error"',
    label: '',
  },
  clickAnalyzeEvent: (isExcludeNumbers) => ({
    category: UNIQUE_ERRORS_PAGE,
    action: 'Click on Button "Analyze" in Modal "Analyze Launch"',
    label: isExcludeNumbers
      ? 'Exclude numbers from analyzed logs'
      : 'Include number to analyzed logs',
  }),
  CLICK_CLUSTER_ITEM_ARROW: {
    category: UNIQUE_ERRORS_PAGE,
    action: 'Click on Cluster Item Arrow to Expand Test',
    label: 'Open cluster',
  },
  CLICK_EXPANDED_ERROR_ARROW: {
    category: UNIQUE_ERRORS_PAGE,
    action: 'Click on Icon Arrow to Expand Errors',
    label: 'Open Errors',
  },
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
  CLICK_SELECT_ONE_ITEM: getClickSelectOneItemEvent(UNIQUE_ERRORS_PAGE),
  CLICK_SELECT_ALL_ITEMS: getClickSelectAllItemsEvent(UNIQUE_ERRORS_PAGE),
};
