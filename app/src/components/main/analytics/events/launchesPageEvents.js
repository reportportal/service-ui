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
  getClickOnAnalyzeUniqueErrorsEventCreator,
  getEditItemsModalEvents,
  getClickOnDeleteBtnDeleteItemModalEventCreator,
} from './common/testItemPages/modalEventsCreators';
import {
  getClickOnAttributesEvent,
  getRefineFiltersPanelEvents,
  getClickItemNameEvent,
  getClickRefreshButtonEvent,
  getClickSelectAllItemsEvent,
  getClickSelectOneItemEvent,
  getClickDonutEvents,
  getClickDefectTooltipEvents,
  getClickActionsButtonEvent,
  getClickPencilIconEvent,
  getRefineParametersEventCreator,
  getCommonActionEvents,
  getClickBreadcrumbsEvents,
} from './common/testItemPages/actionEventsCreators';
import {
  getAddBtnAddNewFilterAddWidgetModal,
  getAddFilterBtnAddWidgetModal,
  getCancelBtnAddNewFilterAddWidgetModal,
  getChooseFilterAddWidgetModal,
  getSelectCriteriaNewWidget,
  getSelectSortingFilterAddWidgetModal,
  getSelectToggleButtonsAddWidgetModal,
} from './common/widgetPages/actionEventCreators';
import { getBasicClickEventParameters } from './common/ga4Utils';

export const LAUNCHES_PAGE = 'launches';
const LAUNCHES_MODAL = 'Modal launches';

const getActionTableFilter = (titleName) =>
  `Click on Filter Icon before Table title "${titleName}"`;
const getDescriptionTableFilter = () => 'Arise new field in filter';

const getAnalyzeItemMessage = (analyzerType, analyzeItemsMode) =>
  `Run analysis on Modal ${analyzerType} with mode: ${analyzeItemsMode}`;

const getAnalyzeItemEvent = (analyzerType, analyzeItemsMode) => {
  const message = getAnalyzeItemMessage(analyzerType, analyzeItemsMode.join(', '));
  return {
    category: LAUNCHES_MODAL,
    action: message,
    label: message,
  };
};

export const getRunAnalysisAnalysisModalEvent = (analyzeItemsMode) =>
  getAnalyzeItemEvent('Analyze Launch', analyzeItemsMode);
export const getRunAnalysisPatternAnalysisModalEvent = (analyzeItemsMode) =>
  getAnalyzeItemEvent('Pattern Analyze Launch', analyzeItemsMode);

const basicClickEventParametersLaunchPage = getBasicClickEventParameters(LAUNCHES_PAGE);
const basicLaunchMenuClickEventParameters = {
  ...basicClickEventParametersLaunchPage,
  place: 'launch_menu',
};
const basicFilterActionBarClickEventParameters = {
  ...basicClickEventParametersLaunchPage,
  place: 'filter_action_bar',
};

export const LAUNCHES_PAGE_EVENTS = {
  // GA4 events
  CLICK_ITEM_NAME: getClickItemNameEvent(LAUNCHES_PAGE),
  CLICK_REFRESH_BTN: getClickRefreshButtonEvent(LAUNCHES_PAGE),
  CLICK_SELECT_ALL_ITEMS: getClickSelectAllItemsEvent(LAUNCHES_PAGE),
  CLICK_SELECT_ONE_ITEM: getClickSelectOneItemEvent(LAUNCHES_PAGE),
  CLICK_ACTIONS_BTN: getClickActionsButtonEvent(LAUNCHES_PAGE),
  EDIT_ICON_CLICK: getClickPencilIconEvent(LAUNCHES_PAGE),
  getClickOnListOfActionsButtonEvent: (element) => ({
    ...basicClickEventParametersLaunchPage,
    place: 'list_of_actions',
    element_name: element,
  }),
  getRefineParametersEvent: getRefineParametersEventCreator(LAUNCHES_PAGE),
  ...getClickDonutEvents(LAUNCHES_PAGE),
  ...getClickDefectTooltipEvents(LAUNCHES_PAGE),
  getClickOnCriteriaTogglerEvent: (expanded) => ({
    ...basicFilterActionBarClickEventParameters,
    element_name: expanded ? 'hide_criteria' : 'show_criteria',
  }),
  CLICK_IMPORT_BTN: {
    ...basicClickEventParametersLaunchPage,
    element_name: 'import',
  },
  ADD_NEW_WIDGET_BTN: {
    ...basicClickEventParametersLaunchPage,
    element_name: 'add_new_widget',
  },
  getClickOnPlusMinusBreadcrumbEvent: getClickBreadcrumbsEvents(LAUNCHES_PAGE)
    .getClickOnPlusMinusBreadcrumbEvent,
  CLICK_ATTRIBUTES: getClickOnAttributesEvent(LAUNCHES_PAGE),
  getClickOnFilterActionBarButtonEvent: (name) => ({
    ...basicFilterActionBarClickEventParameters,
    element_name: name,
  }),
  CLICK_ALL_LAUNCHES_DROPDOWN: {
    ...basicClickEventParametersLaunchPage,
    icon_name: 'icon_all_launches_dropdown',
  },
  SELECT_ALL_LAUNCHES: {
    ...basicClickEventParametersLaunchPage,
    element_name: 'all_launches',
  },
  SELECT_LATEST_LAUNCHES: {
    ...basicClickEventParametersLaunchPage,
    element_name: 'latest_launches',
  },
  CLICK_PROCEED_VALID_ITEMS: getCommonActionEvents(LAUNCHES_PAGE).PROCEED_VALID_ITEMS,
  CLICK_HAMBURGER_MENU: {
    ...basicClickEventParametersLaunchPage,
    icon_name: 'launch_menu',
  },
  CLICK_MOVE_TO_DEBUG_LAUNCH_MENU: {
    ...basicLaunchMenuClickEventParameters,
    element_name: 'move_to_debug',
  },
  CLICK_FORCE_FINISH_LAUNCH_MENU: {
    ...basicLaunchMenuClickEventParameters,
    element_name: 'force_finish',
  },
  CLICK_UNIQUE_ERROR_ANALYSIS_LAUNCH_MENU: {
    ...basicLaunchMenuClickEventParameters,
    element_name: 'unique_error_analysis',
  },
  CLICK_ANALYSIS_LAUNCH_MENU: {
    ...basicLaunchMenuClickEventParameters,
    element_name: 'analysis',
  },
  CLICK_PATTERN_ANALYSIS_LAUNCH_MENU: {
    ...basicLaunchMenuClickEventParameters,
    element_name: 'pattern_analysis',
  },
  CLICK_DELETE_LAUNCH_MENU: {
    ...basicLaunchMenuClickEventParameters,
    element_name: 'delete',
  },
  CLICK_EXPORT_PDF: {
    ...basicLaunchMenuClickEventParameters,
    element_name: 'pdf',
  },
  CLICK_EXPORT_HTML: {
    ...basicLaunchMenuClickEventParameters,
    element_name: 'html',
  },
  CLICK_EXPORT_XLS: {
    ...basicLaunchMenuClickEventParameters,
    element_name: 'xls',
  },
  ADD_FILTER: {
    ...basicClickEventParametersLaunchPage,
    element_name: 'add_filters',
  },
  getClickOnAnalyzeUniqueErrorsEvent: getClickOnAnalyzeUniqueErrorsEventCreator(LAUNCHES_PAGE),
  // GA3 events
  NAME_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('NAME'),
    label: getDescriptionTableFilter(),
  },
  START_TIME_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('START'),
    label: getDescriptionTableFilter(),
  },
  TOTAL_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('TOTAL'),
    label: getDescriptionTableFilter(),
  },
  PASSED_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('PASSED'),
    label: getDescriptionTableFilter(),
  },
  FAILED_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('FAILED'),
    label: getDescriptionTableFilter(),
  },
  SKIPPED_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('SKIPPED'),
    label: getDescriptionTableFilter(),
  },
  PB_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('PRODUCT BUG'),
    label: getDescriptionTableFilter(),
  },
  AB_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('AUTO BUG'),
    label: getDescriptionTableFilter(),
  },
  SI_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('SYSTEM ISSUE'),
    label: getDescriptionTableFilter(),
  },
  TI_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('TO INVESTIGATE'),
    label: getDescriptionTableFilter(),
  },
  CLICK_CLOSE_ICON_FROM_SELECTION: {
    category: LAUNCHES_PAGE,
    action: 'Click on Close Icon on Tag of Launch',
    label: 'Remove launch from  selection',
  },
  CLICK_CLOSE_ICON_ALL_SELECTION: {
    category: LAUNCHES_PAGE,
    action: 'Click on Close Icon of all selection',
    label: 'Unselect all launches',
  },
  REFINE_FILTERS_PANEL_EVENTS: {
    commonEvents: getRefineFiltersPanelEvents(LAUNCHES_PAGE),
  },
  countFilters: (filterStatistic) => ({
    category: LAUNCHES_PAGE,
    action: 'Count Filters',
    label: filterStatistic,
  }),
};

export const LAUNCHES_MODAL_EVENTS = {
  // GA4 events
  getClickOnMergeButtonInMergeModalEvent: (type = '') => ({
    ...basicClickEventParametersLaunchPage,
    modal: 'merge_launch',
    element_name: 'merge',
    type,
  }),
  getClickOnMoveButtonInMoveToDebugModalEvent: (place) => ({
    ...basicClickEventParametersLaunchPage,
    modal: 'move_to_debug',
    element_name: 'move',
    place,
  }),
  getClickOnFinishButtonInForceFinishModal: (place) => ({
    ...basicClickEventParametersLaunchPage,
    modal: 'force_finish',
    element_name: 'finish',
    place,
  }),
  getClickOnAnalyzeInPatterAnalysisModal: (type) => ({
    ...basicClickEventParametersLaunchPage,
    modal: 'pattern_analyze_launches',
    element_name: 'analyze',
    type,
  }),
  getClickOnDeleteBtnDeleteItemModalEvent: getClickOnDeleteBtnDeleteItemModalEventCreator(
    LAUNCHES_PAGE,
  ),
  OK_BTN_IMPORT_MODAL: {
    ...basicClickEventParametersLaunchPage,
    modal: 'import_launch',
    element_name: 'import',
  },
  // GA3 events and GA4 events
  // EDIT_ITEMS_MODAL
  EDIT_ITEMS_MODAL_EVENTS: getEditItemsModalEvents(LAUNCHES_PAGE, 'Launch'),
  CLOSE_ICON_MOVE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Close Icon on Modal "Move to Debug"',
    label: 'Close modal "Move to Debug"',
  },
  CLICK_CANCEL_BTN_MOVE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Btn Cancel on Modal "Move to Debug"',
    label: 'Close modal "Move to Debug"',
  },
  CLOSE_ICON_MERGE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Close Icon on Modal "Merge Launches"',
    label: 'Close modal "Merge Launches"',
  },
  CANCEL_BTN_MERGE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Btn Cancel on Modal "Merge Launches"',
    label: 'Close modal "Merge Launches"',
  },
  CLOSE_ICON_IMPORT_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Close Icon on Modal "Import Launch"',
    label: 'Close Modal Import Launch',
  },
  CANCEL_BTN_IMPORT_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Btn Cancel on Modal "Import Launch"',
    label: 'Close Modal Import Launch',
  },
  LINEAR_MERGE_BTN_MERGE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Btn Linear Merge on Modal "Merge Launches"',
    label: 'Linear Merge',
  },
  DEEP_MERGE_BTN_MERGE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Btn Deep Merge on Modal "Merge Launches"',
    label: 'Deep Merge',
  },
  CLOSE_BTN_ANALYSIS_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Close Icon on Modal "Analyze Launch"',
    label: 'Close Analyze Launch Modal',
  },
  CANCEL_BTN_ANALYSIS_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Btn Cancel on Modal "Analyze Launch"',
    label: 'Cancel Modal "Analyze Launch"',
  },
  OK_BTN_PATTERN_ANALYSIS_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Btn Analyze on Modal "Pattern Analyze Launch"',
    label: 'Analyze launch mentioned in modal "Pattern Analyze Launch"',
  },
  CLOSE_BTN_PATTERN_ANALYSIS_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Close Icon on Modal "Pattern Analyze Launch"',
    label: 'Close Pattern Analyze Launch Modal',
  },
  CANCEL_BTN_PATTERN_ANALYSIS_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Btn Cancel on Modal "Pattern Analyze Launch"',
    label: 'Cancel Modal "Pattern Analyze Launch"',
  },
  CLOSE_ICON_ADD_WIDGET_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on icon Close on Modal Add New Widget',
    label: 'Close Modal Add New Widget',
  },
  CHOOSE_WIDGET_TYPE_ADD_WIDGET_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Choose radio Btn of Widget type in Modal Add New Widget',
    label: 'Choose Widget type in Modal Add New Widget',
  },
  CHOOSE_FILTER_ADD_WIDGET_MODAL: getChooseFilterAddWidgetModal(LAUNCHES_MODAL),
  ADD_FILTER_BTN_ADD_WIDGET_MODAL: getAddFilterBtnAddWidgetModal(LAUNCHES_MODAL),
  ADD_BTN_ADD_NEW_FILTER_ADD_WIDGET_MODAL: getAddBtnAddNewFilterAddWidgetModal(LAUNCHES_MODAL),
  CANCEL_BTN_ADD_NEW_FILTER_ADD_WIDGET_MODAL: getCancelBtnAddNewFilterAddWidgetModal(
    LAUNCHES_MODAL,
  ),
  NEXT_STEP_ADD_WIDGET_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Btn Next Step on Modal Add New Widget',
    label: 'Transition to Next Step on Modal Add New Widget',
  },
  PREVIOUS_STEP_ADD_WIDGET_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Btn Previous Step on Modal Add New Widget',
    label: 'Transition to Previous Step in Modal Add New Widget',
  },
  ENTER_WIDGET_DESCRIPTION_ADD_WIDGET_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Enter Widget description in Modal Add New Widget',
    label: 'Widget description in Modal Add New Widget',
  },
  SELECT_CRITERIA_ADD_NEW_WIDGET_MODAL: getSelectCriteriaNewWidget(LAUNCHES_MODAL),
  SELECT_SORTING_FILTER_ADD_WIDGET_MODAL: getSelectSortingFilterAddWidgetModal(LAUNCHES_PAGE),
  SELECT_TOGGLE_BUTTONS_ADD_NEW_WIDGET_MODAL: getSelectToggleButtonsAddWidgetModal(LAUNCHES_PAGE),
};
