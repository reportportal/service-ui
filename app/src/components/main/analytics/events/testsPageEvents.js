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
  getABChartEvent,
  getABFilterEvent,
  getABSortingEvent,
  getABTooltipEvent,
  getAllLabelBreadcrumbEvent,
  getClickCloseIconForAllSelections,
  getClickCloseIconSelectedItem,
  getClickOnPlusMinusEvents,
  getClickSelectAllItemsEvent,
  getClickSelectOneItemEvent,
  getEditIconClickEvent,
  getFailedFilterEvent,
  getFailedSortingEvent,
  getHistoryTabEvent,
  getItemNameBreadcrumbClickEvent,
  getListViewTabEvent,
  getLogViewTabEvent,
  getNameFilterEvent,
  getNameSortingEvent,
  getPassedFilterEvent,
  getPassedSortingEvent,
  getPBChartEvent,
  getPBFilterEvent,
  getPBSortingEvent,
  getPBTooltipEvent,
  getRefineByNameEvent,
  getRefineFiltersPanelEvents,
  getRefreshPageActionEvent,
  getSIChartEvent,
  getSIFilterEvent,
  getSISortingEvent,
  getSITooltipEvent,
  getSkippedFilterEvent,
  getSkippedSortingEvent,
  getStartTimeFilterEvent,
  getStartTimeSortingEvent,
  getTIChartEvent,
  getTIFilterEvent,
  getTISortingEvent,
  getTITooltipEvent,
  getTotalFilterEvent,
  getTotalSortingEvent,
} from 'components/main/analytics/events/common/testItemPages/actionEventsCreators';

export const TEST_PAGE = 'test';
export const TESTS_PAGE_EVENTS = {
  REFRESH_BTN: getRefreshPageActionEvent(TEST_PAGE),
  plusMinusBreadcrumb: getClickOnPlusMinusEvents(TEST_PAGE),
  ALL_LABEL_BREADCRUMB: getAllLabelBreadcrumbEvent(TEST_PAGE),
  ITEM_NAME_BREADCRUMB_CLICK: getItemNameBreadcrumbClickEvent(TEST_PAGE),
  LIST_VIEW_TAB: getListViewTabEvent(TEST_PAGE),
  LOG_VIEW_TAB: getLogViewTabEvent(TEST_PAGE),
  HISTORY_VIEW_TAB: getHistoryTabEvent(TEST_PAGE),
  REFINE_BY_NAME: getRefineByNameEvent(TEST_PAGE),
  REFINE_FILTERS_PANEL_EVENTS: {
    commonEvents: getRefineFiltersPanelEvents(TEST_PAGE),
  },
  CLICK_SELECT_ALL_ITEMS: getClickSelectAllItemsEvent(TEST_PAGE),
  CLICK_SELECT_ONE_ITEM: getClickSelectOneItemEvent(TEST_PAGE),
  CLOSE_ICON_SELECTED_ITEM: getClickCloseIconSelectedItem(TEST_PAGE),
  CLOSE_ICON_FOR_ALL_SELECTIONS: getClickCloseIconForAllSelections(TEST_PAGE),
  PB_TOOLTIP: getPBTooltipEvent(TEST_PAGE),
  PB_CHART: getPBChartEvent(TEST_PAGE),
  AB_TOOLTIP: getABTooltipEvent(TEST_PAGE),
  AB_CHART: getABChartEvent(TEST_PAGE),
  SI_TOOLTIP: getSITooltipEvent(TEST_PAGE),
  SI_CHART: getSIChartEvent(TEST_PAGE),
  TI_TOOLTIP: getTITooltipEvent(TEST_PAGE),
  TI_CHART: getTIChartEvent(TEST_PAGE),
  NAME_FILTER: getNameFilterEvent(TEST_PAGE),
  NAME_SORTING: getNameSortingEvent(TEST_PAGE),
  EDIT_ICON_CLICK: getEditIconClickEvent(TEST_PAGE),
  START_TIME_FILTER: getStartTimeFilterEvent(TEST_PAGE),
  START_TIME_SORTING: getStartTimeSortingEvent(TEST_PAGE),
  TOTAL_FILTER: getTotalFilterEvent(TEST_PAGE),
  TOTAL_SORTING: getTotalSortingEvent(TEST_PAGE),
  PASSED_FILTER: getPassedFilterEvent(TEST_PAGE),
  PASSED_SORTING: getPassedSortingEvent(TEST_PAGE),
  FAILED_FILTER: getFailedFilterEvent(TEST_PAGE),
  FAILED_SORTING: getFailedSortingEvent(TEST_PAGE),
  SKIPPED_FILTER: getSkippedFilterEvent(TEST_PAGE),
  SKIPPED_SORTING: getSkippedSortingEvent(TEST_PAGE),
  PB_FILTER: getPBFilterEvent(TEST_PAGE),
  PB_SORTING: getPBSortingEvent(TEST_PAGE),
  AB_FILTER: getABFilterEvent(TEST_PAGE),
  AB_SORTING: getABSortingEvent(TEST_PAGE),
  SI_FILTER: getSIFilterEvent(TEST_PAGE),
  SI_SORTING: getSISortingEvent(TEST_PAGE),
  TI_FILTER: getTIFilterEvent(TEST_PAGE),
  TI_SORTING: getTISortingEvent(TEST_PAGE),
};
