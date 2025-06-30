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
  getLinkIssueActionEvent,
  getUnlinkIssueActionEvent,
  getPostIssueActionEvent,
  getChangeFilterEvent,
  getCommonActionEvents,
  getClickRefreshButtonEvent,
  getClickDefectTooltipEvents,
  getClickActionsButtonEvent,
  getClickOnTestItemsTabsEvents,
  getClickBreadcrumbsEvents,
  getRefineParametersEventCreator,
  getRefineFiltersPanelEvents,
} from './common/testItemPages/actionEventsCreators';
import {
  getEditToInvestigateSelectAllSimilarItemsEvent,
  getEditToInvestigateSelectSpecificSimilarItemEvent,
  getEditToInvestigateChangeSearchModeEvent,
  getUnlinkIssueModalEvents,
  getPostIssueModalEvents,
  getLinkIssueModalEvents,
  getClickOnDeleteBtnDeleteItemModalEventCreator,
  getEditItemsModalEvents,
  getMakeDecisionModalEvents,
} from './common/testItemPages/modalEventsCreators';
import { getBasicClickEventParameters } from './common/ga4Utils';

export const HISTORY_PAGE = 'history';

const basicClickEventParametersHistoryPage = getBasicClickEventParameters(HISTORY_PAGE);
const { PROCEED_VALID_ITEMS, EDIT_ITEMS_ACTION } = getCommonActionEvents(HISTORY_PAGE);

export const HISTORY_PAGE_EVENTS = {
  // GA4 events
  CLICK_REFRESH_BTN: getClickRefreshButtonEvent(HISTORY_PAGE),
  ...getClickDefectTooltipEvents(HISTORY_PAGE),
  CLICK_ACTIONS_BTN: getClickActionsButtonEvent(HISTORY_PAGE),
  ...getClickBreadcrumbsEvents(HISTORY_PAGE),
  CLICK_COMPARE_WITH_FILTER_BTN: {
    ...basicClickEventParametersHistoryPage,
    element_name: 'compare',
  },
  getChooseFilterForCompareEvent: (withSearch) => ({
    ...basicClickEventParametersHistoryPage,
    element_name: 'filter_for_custom_column',
    condition: `${withSearch ? 'with' : 'without'}_search`,
  }),
  SELECT_ONE_ITEM: {
    ...basicClickEventParametersHistoryPage,
    element_name: 'select_one_item',
  },
  CLICK_ON_ITEM: {
    ...basicClickEventParametersHistoryPage,
    element_name: 'item_name',
  },
  getSelectHistoryDepthEvent: (depth) => ({
    ...basicClickEventParametersHistoryPage,
    element_name: 'history_depth',
    number: depth,
  }),
  getSelectHistoryBaseEvent: (isAllLaunches) => ({
    ...basicClickEventParametersHistoryPage,
    element_name: 'history_base',
    type: isAllLaunches ? 'all_launches' : 'launches_with_same_name',
  }),
  CLICK_CROSS_BTN_NEAR_COMPARE_FILTER: {
    ...basicClickEventParametersHistoryPage,
    icon_name: 'cross_filter',
  },
  TEST_ITEM_TABS_EVENTS: getClickOnTestItemsTabsEvents(HISTORY_PAGE),
  EDIT_ITEMS_ACTION,
  POST_ISSUE_ACTION: getPostIssueActionEvent(HISTORY_PAGE),
  LINK_ISSUE_ACTION: getLinkIssueActionEvent(HISTORY_PAGE),
  DELETE_ACTION: getDeleteActionEvent(HISTORY_PAGE),
  UNLINK_ISSUES_ACTION: getUnlinkIssueActionEvent(HISTORY_PAGE),
  PROCEED_VALID_ITEMS,
  REFINE_FILTERS_PANEL_EVENTS: {
    commonEvents: {
      getRefineFiltersPanelEvents: getRefineFiltersPanelEvents(HISTORY_PAGE),
      getRefineParametersEvent: getRefineParametersEventCreator(HISTORY_PAGE),
    },
    getChangeFilterEvent: getChangeFilterEvent(HISTORY_PAGE),
  },
  // GA3 events
  CLICK_CLOSE_ICON_FROM_SELECTION: {
    category: HISTORY_PAGE,
    action: 'Click on icon "close" on selected item',
    label: 'Remove item from the selected items',
  },
  CLICK_CLOSE_ICON_ALL_SELECTION: {
    category: HISTORY_PAGE,
    action: 'Click on Close Icon of all selection',
    label: 'Close panel with selected items',
  },
  // EDIT_DEFECT_MODAL
  SELECT_ALL_SIMILAR_ITEMS_EDIT_DEFECT_MODAL:
    getEditToInvestigateSelectAllSimilarItemsEvent(HISTORY_PAGE),
  SELECT_SPECIFIC_SIMILAR_ITEM_EDIT_DEFECT_MODAL:
    getEditToInvestigateSelectSpecificSimilarItemEvent(HISTORY_PAGE),
  CHANGE_SEARCH_MODE_EDIT_DEFECT_MODAL: getEditToInvestigateChangeSearchModeEvent(HISTORY_PAGE),
  // UNLINK_ISSUE_MODAL
  UNLINK_ISSUE_MODAL_EVENTS: getUnlinkIssueModalEvents(HISTORY_PAGE),
  // POST_ISSUE_MODAL
  POST_ISSUE_MODAL_EVENTS: getPostIssueModalEvents(HISTORY_PAGE),
  // LINK_ISSUE_MODAL
  LINK_ISSUE_MODAL_EVENTS: getLinkIssueModalEvents(HISTORY_PAGE),
  // DELETE_ITEM_MODAL
  getClickOnDeleteBtnDeleteItemModalEvent:
    getClickOnDeleteBtnDeleteItemModalEventCreator(HISTORY_PAGE),
  // EDIT_ITEMS_MODAL
  EDIT_ITEMS_MODAL_EVENTS: getEditItemsModalEvents(HISTORY_PAGE),
  MAKE_DECISION_MODAL_EVENTS: getMakeDecisionModalEvents(HISTORY_PAGE),
};
