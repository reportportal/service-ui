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
  getClickOnAttributesEvent,
  getClickSelectAllItemsEvent,
  getClickSelectOneItemEvent,
  getCommonActionEvents,
  getClickItemNameEvent,
  getClickRefreshButtonEvent,
  getClickDonutEvents,
  getClickDefectTooltipEvents,
  getClickActionsButtonEvent,
  getClickPencilIconEvent,
  getRefineParametersEventCreator,
  getClickOnTestItemsTabsEvents,
  getClickBreadcrumbsEvents,
} from './common/testItemPages/actionEventsCreators';
import {
  getClickOnDeleteBtnDeleteItemModalEventCreator,
  getEditItemsModalEvents,
} from './common/testItemPages/modalEventsCreators';

export const TEST_PAGE = 'test';
export const TESTS_PAGE_EVENTS = {
  // GA4 events
  CLICK_ITEM_NAME: getClickItemNameEvent(TEST_PAGE),
  CLICK_REFRESH_BTN: getClickRefreshButtonEvent(TEST_PAGE),
  CLICK_SELECT_ALL_ITEMS: getClickSelectAllItemsEvent(TEST_PAGE),
  CLICK_SELECT_ONE_ITEM: getClickSelectOneItemEvent(TEST_PAGE),
  ...getClickDonutEvents(TEST_PAGE),
  ...getClickDefectTooltipEvents(TEST_PAGE),
  CLICK_ACTIONS_BTN: getClickActionsButtonEvent(TEST_PAGE),
  EDIT_ICON_CLICK: getClickPencilIconEvent(TEST_PAGE),
  REFINE_FILTERS_PANEL_EVENTS: {
    commonEvents: { getRefineParametersEvent: getRefineParametersEventCreator(TEST_PAGE) },
  },
  ...getClickBreadcrumbsEvents(TEST_PAGE),
  CLICK_ATTRIBUTES: getClickOnAttributesEvent(TEST_PAGE),
  TEST_ITEM_TABS_EVENTS: getClickOnTestItemsTabsEvents(TEST_PAGE),
  // GA3 events
  ...getCommonActionEvents(TEST_PAGE),
  EDIT_ITEMS_MODAL_EVENTS: getEditItemsModalEvents(TEST_PAGE),
  getClickOnDeleteBtnDeleteItemModalEvent: getClickOnDeleteBtnDeleteItemModalEventCreator(
    TEST_PAGE,
  ),
};
