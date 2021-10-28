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
  getClickOnPlusMinusEvents,
  getClickSelectAllItemsEvent,
  getClickSelectOneItemEvent,
  getHistoryTabEvent,
  getListViewTabEvent,
  getLogViewTabEvent,
  getRefineFiltersPanelEvents,
  getRefreshPageActionEvent,
} from 'components/main/analytics/events/common/testItemPages/actionEventsCreators';

export const TEST_PAGE = 'test';
export const TESTS_PAGE_EVENTS = {
  REFRESH_BTN: getRefreshPageActionEvent(TEST_PAGE),
  plusMinusBreadcrumb: getClickOnPlusMinusEvents(TEST_PAGE),
  ALL_LABEL_BREADCRUMB: {
    category: TEST_PAGE,
    action: 'Click on Bread Crumb All',
    label: 'Transition to Launches Page',
  },
  ITEM_NAME_BREADCRUMB_CLICK: {
    category: TEST_PAGE,
    action: 'Click on Bread Crumb Item name',
    label: 'Transition to Item',
  },
  LIST_VIEW_TAB: getListViewTabEvent(TEST_PAGE),
  LOG_VIEW_TAB: getLogViewTabEvent(TEST_PAGE),
  HISTORY_VIEW_TAB: getHistoryTabEvent(TEST_PAGE),
  REFINE_BY_NAME: {
    category: TEST_PAGE,
    action: 'Enter parameters to refine by name',
    label: 'Refine by name',
  },
  REFINE_FILTERS_PANEL_EVENTS: {
    commonEvents: getRefineFiltersPanelEvents(TEST_PAGE),
  },
  CLICK_SELECT_ALL_ITEMS: getClickSelectAllItemsEvent(TEST_PAGE),
  CLICK_SELECT_ONE_ITEM: getClickSelectOneItemEvent(TEST_PAGE),
};
