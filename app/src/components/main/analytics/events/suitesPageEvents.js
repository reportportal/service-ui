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
  getProceedValidItemsEvent,
  getRefreshPageActionEvent,
  getRefineFiltersPanelEvents,
  getClickOnPlusMinusEvents,
  getListViewTabEvent,
  getLogViewTabEvent,
  getHistoryTabEvent,
  getClickSelectAllItemsEvent,
  getClickSelectOneItemEvent,
  getClickCloseIconForAllSelections,
  getClickCloseIconSelectedItem,
  getPBTooltipEvent,
  getABTooltipEvent,
  getSITooltipEvent,
  getNameSortingEvent,
  getNameFilterEvent,
  getPBChartEvent,
  getABChartEvent,
  getSIChartEvent,
  getTITooltipEvent,
  getTIChartEvent,
  getEditIconClickEvent,
  getStartTimeFilterEvent,
  getStartTimeSortingEvent,
  getTotalFilterEvent,
  getTotalSortingEvent,
  getPassedFilterEvent,
  getPassedSortingEvent,
  getFailedFilterEvent,
  getFailedSortingEvent,
  getSkippedFilterEvent,
  getSkippedSortingEvent,
  getPBFilterEvent,
  getPBSortingEvent,
  getABFilterEvent,
  getABSortingEvent,
  getSIFilterEvent,
  getSISortingEvent,
  getTIFilterEvent,
  getTISortingEvent,
  getAllLabelBreadcrumbEvent,
  getItemNameBreadcrumbClickEvent,
  getRefineByNameEvent,
  getEditItemsActionEvent,
} from './common/testItemPages/actionEventsCreators';
import {
  getDeleteItemModalEvents,
  getEditItemsModalEvents,
} from './common/testItemPages/modalEventsCreators';

export const SUITE_PAGE = 'suites';
export const SUITES_PAGE_EVENTS = {
  plusMinusBreadcrumb: getClickOnPlusMinusEvents(SUITE_PAGE),
  ALL_LABEL_BREADCRUMB: getAllLabelBreadcrumbEvent(SUITE_PAGE),
  ITEM_NAME_BREADCRUMB_CLICK: getItemNameBreadcrumbClickEvent(SUITE_PAGE),
  DELETE_BTN: {
    category: SUITE_PAGE,
    action: 'Click on Btn Delete',
    label: 'Delete selected Items',
  },
  REFRESH_BTN: getRefreshPageActionEvent(SUITE_PAGE),
  REFINE_BY_NAME: getRefineByNameEvent(SUITE_PAGE),
  // REFINE_FILTERS_PANEL
  REFINE_FILTERS_PANEL_EVENTS: {
    commonEvents: getRefineFiltersPanelEvents(SUITE_PAGE),
  },
  EDIT_ICON_CLICK: getEditIconClickEvent(SUITE_PAGE),
  EDIT_ITEMS_ACTION: getEditItemsActionEvent(SUITE_PAGE),
  CLICK_SELECT_ALL_ITEMS: getClickSelectAllItemsEvent(SUITE_PAGE),
  CLICK_SELECT_ONE_ITEM: getClickSelectOneItemEvent(SUITE_PAGE),
  CLOSE_ICON_SELECTED_ITEM: getClickCloseIconSelectedItem(SUITE_PAGE),
  CLOSE_ICON_FOR_ALL_SELECTIONS: getClickCloseIconForAllSelections(SUITE_PAGE),
  PROCEED_VALID_ITEMS: getProceedValidItemsEvent(SUITE_PAGE),
  NAME_FILTER: getNameFilterEvent(SUITE_PAGE),
  NAME_SORTING: getNameSortingEvent(SUITE_PAGE),
  START_TIME_FILTER: getStartTimeFilterEvent(SUITE_PAGE),
  START_TIME_SORTING: getStartTimeSortingEvent(SUITE_PAGE),
  TOTAL_FILTER: getTotalFilterEvent(SUITE_PAGE),
  TOTAL_SORTING: getTotalSortingEvent(SUITE_PAGE),
  PASSED_FILTER: getPassedFilterEvent(SUITE_PAGE),
  PASSED_SORTING: getPassedSortingEvent(SUITE_PAGE),
  FAILED_FILTER: getFailedFilterEvent(SUITE_PAGE),
  FAILED_SORTING: getFailedSortingEvent(SUITE_PAGE),
  SKIPPED_FILTER: getSkippedFilterEvent(SUITE_PAGE),
  SKIPPED_SORTING: getSkippedSortingEvent(SUITE_PAGE),
  PB_FILTER: getPBFilterEvent(SUITE_PAGE),
  PB_SORTING: getPBSortingEvent(SUITE_PAGE),
  AB_FILTER: getABFilterEvent(SUITE_PAGE),
  AB_SORTING: getABSortingEvent(SUITE_PAGE),
  SI_FILTER: getSIFilterEvent(SUITE_PAGE),
  SI_SORTING: getSISortingEvent(SUITE_PAGE),
  TI_FILTER: getTIFilterEvent(SUITE_PAGE),
  TI_SORTING: getTISortingEvent(SUITE_PAGE),
  PB_CHART: getPBChartEvent(SUITE_PAGE),
  PB_TOOLTIP: getPBTooltipEvent(SUITE_PAGE),
  AB_CHART: getABChartEvent(SUITE_PAGE),
  AB_TOOLTIP: getABTooltipEvent(SUITE_PAGE),
  SI_CHART: getSIChartEvent(SUITE_PAGE),
  SI_TOOLTIP: getSITooltipEvent(SUITE_PAGE),
  TI_CHART: getTIChartEvent(SUITE_PAGE),
  TI_TOOLTIP: getTITooltipEvent(SUITE_PAGE),
  LOG_VIEW_SWITCHER: {
    category: SUITE_PAGE,
    action: 'Click on launch log view switcher',
    label: 'Open "Launch log view"',
  },
  // DELETE_ITEM_MODAL
  DELETE_ITEM_MODAL_EVENTS: getDeleteItemModalEvents(SUITE_PAGE),
  // EDIT_ITEMS_MODAL
  EDIT_ITEMS_MODAL_EVENTS: getEditItemsModalEvents(SUITE_PAGE),
  LIST_VIEW_TAB: getListViewTabEvent(SUITE_PAGE),
  LOG_VIEW_TAB: getLogViewTabEvent(SUITE_PAGE),
  HISTORY_VIEW_TAB: getHistoryTabEvent(SUITE_PAGE),
};
