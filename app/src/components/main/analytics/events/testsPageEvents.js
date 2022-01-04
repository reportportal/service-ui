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
  getClickAttributes,
  getClickOnPlusMinusEvents,
  getClickSelectAllItemsEvent,
  getClickSelectOneItemEvent,
  getClickUniqueErrorsEvent,
  getCommonActionEvents,
  getRefineFiltersPanelEvents,
} from 'components/main/analytics/events/common/testItemPages/actionEventsCreators';
import {
  getDeleteItemModalEvents,
  getEditItemsModalEvents,
} from 'components/main/analytics/events/common/testItemPages/modalEventsCreators';

export const TEST_PAGE = 'test';
export const TESTS_PAGE_EVENTS = {
  ...getCommonActionEvents(TEST_PAGE),
  plusMinusBreadcrumb: getClickOnPlusMinusEvents(TEST_PAGE),
  REFINE_FILTERS_PANEL_EVENTS: {
    commonEvents: getRefineFiltersPanelEvents(TEST_PAGE),
  },
  CLICK_SELECT_ALL_ITEMS: getClickSelectAllItemsEvent(TEST_PAGE),
  CLICK_SELECT_ONE_ITEM: getClickSelectOneItemEvent(TEST_PAGE),
  EDIT_ITEMS_MODAL_EVENTS: getEditItemsModalEvents(TEST_PAGE),
  DELETE_ITEM_MODAL_EVENTS: getDeleteItemModalEvents(TEST_PAGE),
  CLICK_ATTRIBUTES: getClickAttributes(TEST_PAGE),
  CLICK_UNIQUE_ERRORS: getClickUniqueErrorsEvent(TEST_PAGE),
};
