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
  getClickSelectAllItemsEvent,
  getClickSelectOneItemEvent,
  getCommonActionEvents,
  getClickOnAttributesEvent,
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

export const SUITE_PAGE = 'suites';
export const SUITES_PAGE_EVENTS = {
  // GA4 events
  CLICK_ITEM_NAME: getClickItemNameEvent(SUITE_PAGE),
  CLICK_REFRESH_BTN: getClickRefreshButtonEvent(SUITE_PAGE),
  CLICK_SELECT_ALL_ITEMS: getClickSelectAllItemsEvent(SUITE_PAGE),
  CLICK_SELECT_ONE_ITEM: getClickSelectOneItemEvent(SUITE_PAGE),
  ...getClickDonutEvents(SUITE_PAGE),
  ...getClickDefectTooltipEvents(SUITE_PAGE),
  CLICK_ACTIONS_BTN: getClickActionsButtonEvent(SUITE_PAGE),
  EDIT_ICON_CLICK: getClickPencilIconEvent(SUITE_PAGE),
  REFINE_FILTERS_PANEL_EVENTS: {
    commonEvents: { getRefineParametersEvent: getRefineParametersEventCreator(SUITE_PAGE) },
  },
  ...getClickBreadcrumbsEvents(SUITE_PAGE),
  CLICK_ATTRIBUTES: getClickOnAttributesEvent(SUITE_PAGE),
  TEST_ITEM_TABS_EVENTS: getClickOnTestItemsTabsEvents(SUITE_PAGE),
  // GA3 events
  ...getCommonActionEvents(SUITE_PAGE),
  DELETE_BTN: {
    category: SUITE_PAGE,
    action: 'Click on Btn Delete',
    label: 'Delete selected Items',
  },
  // REFINE_FILTERS_PANEL
  LOG_VIEW_SWITCHER: {
    category: SUITE_PAGE,
    action: 'Click on launch log view switcher',
    label: 'Open "Launch log view"',
  },
  // DELETE_ITEM_MODAL
  getClickOnDeleteBtnDeleteItemModalEvent: getClickOnDeleteBtnDeleteItemModalEventCreator(
    SUITE_PAGE,
  ),
  // EDIT_ITEMS_MODAL
  EDIT_ITEMS_MODAL_EVENTS: getEditItemsModalEvents(SUITE_PAGE),
};
