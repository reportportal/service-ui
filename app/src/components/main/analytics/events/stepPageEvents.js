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
  getDeleteActionEvent,
  getLinkIssueActionEvent,
  getPostIssueActionEvent,
  getUnlinkIssueActionEvent,
  getClickSelectAllItemsEvent,
  getClickSelectOneItemEvent,
  getCommonActionEvents,
  getClickOnAttributesEvent,
  getClickIssueTicketEvent,
  getClickItemNameEvent,
  getClickRefreshButtonEvent,
  getClickDefectTooltipEvents,
  getClickActionsButtonEvent,
  getClickPencilIconEvent,
  getRefineParametersEventCreator,
  getClickOnTestItemsTabsEvents,
  getClickBreadcrumbsEvents,
  getChangeItemStatusEventCreator,
  getIgnoreInAutoAnalysisActionEventCreator,
  getIncludeInAutoAnalysisActionEventCreator,
} from './common/testItemPages/actionEventsCreators';
import {
  getUnlinkIssueModalEvents,
  getPostIssueModalEvents,
  getLinkIssueModalEvents,
  getClickOnDeleteBtnDeleteItemModalEventCreator,
  getEditItemsModalEvents,
  getMakeDecisionModalEvents,
  getEditItemDetailsModalEvents,
  getIgnoreBtnIgnoreItemsInAAModalEvent,
} from './common/testItemPages/modalEventsCreators';

export const STEP_PAGE = 'step';

const basicClickEventParametersStepPage = getBasicClickEventParameters(STEP_PAGE);

export const STEP_PAGE_EVENTS = {
  // GA4 events
  CLICK_ITEM_NAME: getClickItemNameEvent(STEP_PAGE),
  CLICK_REFRESH_BTN: getClickRefreshButtonEvent(STEP_PAGE),
  CLICK_SELECT_ALL_ITEMS: getClickSelectAllItemsEvent(STEP_PAGE),
  CLICK_SELECT_ONE_ITEM: getClickSelectOneItemEvent(STEP_PAGE),
  ...getClickDefectTooltipEvents(STEP_PAGE),
  CLICK_ACTIONS_BTN: getClickActionsButtonEvent(STEP_PAGE),
  CLICK_EDIT_ICON: getClickPencilIconEvent(STEP_PAGE),
  REFINE_FILTERS_PANEL_EVENTS: {
    commonEvents: { getRefineParametersEvent: getRefineParametersEventCreator(STEP_PAGE) },
  },
  ...getClickBreadcrumbsEvents(STEP_PAGE),
  CLICK_ATTRIBUTES: getClickOnAttributesEvent(STEP_PAGE),
  TEST_ITEM_TABS_EVENTS: getClickOnTestItemsTabsEvents(STEP_PAGE),
  getClickOnDeleteBtnDeleteItemModalEvent:
    getClickOnDeleteBtnDeleteItemModalEventCreator(STEP_PAGE),
  CLICK_ON_RETRIES_BTN: {
    ...basicClickEventParametersStepPage,
    place: 'item_info',
    element_name: 'retries',
  },
  CLICK_ON_PARTICULAR_RETRY_BTN: {
    ...basicClickEventParametersStepPage,
    place: 'item_info',
    element_name: 'retry_to_read',
  },
  CLICK_LINK_OPEN_RETRY_IN_LOG_VIEW: {
    ...basicClickEventParametersStepPage,
    place: 'retries_info',
    link_name: 'open_in_log_view',
  },
  getChangeItemStatusEvent: getChangeItemStatusEventCreator(STEP_PAGE),
  getSwitchMethodTypeEvent: (isActive) => ({
    ...basicClickEventParametersStepPage,
    element_name: 'method_type',
    switcher: isActive ? 'on' : 'off',
  }),
  DELETE_ACTION: getDeleteActionEvent(STEP_PAGE),
  POST_ISSUE_ACTION: getPostIssueActionEvent(STEP_PAGE),
  LINK_ISSUE_ACTION: getLinkIssueActionEvent(STEP_PAGE),
  UNLINK_ISSUES_ACTION: getUnlinkIssueActionEvent(STEP_PAGE),
  IGNORE_IN_AA_ACTION: getIgnoreInAutoAnalysisActionEventCreator(STEP_PAGE),
  INCLUDE_IN_AA_ACTION: getIncludeInAutoAnalysisActionEventCreator(STEP_PAGE),
  // MODAL EVENTS
  EDIT_ITEM_DETAILS_MODAL_EVENTS: getEditItemDetailsModalEvents(STEP_PAGE),
  IGNORE_BTN_IGNORE_ITEMS_IN_AA_MODAL: getIgnoreBtnIgnoreItemsInAAModalEvent(STEP_PAGE),
  ...getCommonActionEvents(STEP_PAGE),
  // UNLINK_ISSUE_MODAL
  UNLINK_ISSUE_MODAL_EVENTS: getUnlinkIssueModalEvents(STEP_PAGE),
  // POST_ISSUE_MODAL
  POST_ISSUE_MODAL_EVENTS: getPostIssueModalEvents(STEP_PAGE),
  // LINK_ISSUE_MODAL
  LINK_ISSUE_MODAL_EVENTS: getLinkIssueModalEvents(STEP_PAGE),
  // EDIT_ITEMS_MODAL
  EDIT_ITEMS_MODAL_EVENTS: getEditItemsModalEvents(STEP_PAGE),
  MAKE_DECISION_MODAL_EVENTS: getMakeDecisionModalEvents(STEP_PAGE),
  onClickIssueTicketEvent: getClickIssueTicketEvent(STEP_PAGE),
};
