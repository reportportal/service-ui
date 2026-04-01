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
import { getBasicClickEventParameters } from './common/ga4Utils';
import { LAUNCH_ANALYZE_TYPES_TO_ANALYTICS_TITLES_MAP } from './common/constants';

export const LAUNCHES_PAGE = 'launches';
const LAUNCH_VIEW = 'launches';
const DEBUG_VIEW = 'debug_mode';
export const LAUNCHES_PAGE_VIEWS = {
  LAUNCHES: {
    page: LAUNCHES_PAGE,
    place: LAUNCH_VIEW,
  },
  DEBUG: {
    page: LAUNCHES_PAGE,
    place: DEBUG_VIEW,
  },
};

const formatAnalyzeItemsMode = (modes) =>
  modes.map((mode) => LAUNCH_ANALYZE_TYPES_TO_ANALYTICS_TITLES_MAP[mode]).join('#');

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
  CLICK_EDIT_ICON: getClickPencilIconEvent(LAUNCHES_PAGE),
  getClickOnListOfActionsButtonEvent: (element) => ({
    ...basicClickEventParametersLaunchPage,
    place: 'list_of_actions',
    element_name: element,
  }),
  commonEvents: {
    getRefineParametersEvent: getRefineParametersEventCreator(LAUNCHES_PAGE),
  },
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
  CLICK_INTERRUPT_EXPORT_BANNER_BTN: {
    ...basicClickEventParametersLaunchPage,
    icon_name: 'interrupt',
  },
  CLICK_INTERRUPT_EXPORT_MODAL_BTN: {
    ...basicClickEventParametersLaunchPage,
    element_name: 'interrupt',
    modal: 'interrupt_report_generation',
  },
  ADD_NEW_WIDGET_BTN: {
    ...basicClickEventParametersLaunchPage,
    element_name: 'add_new_widget',
  },
  getClickOnPlusMinusBreadcrumbEvent:
    getClickBreadcrumbsEvents(LAUNCHES_PAGE).getClickOnPlusMinusBreadcrumbEvent,
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
  CLICK_MARK_AS_IMPORTANT_LAUNCH_MENU: {
    ...basicLaunchMenuClickEventParameters,
    element_name: 'mark_as_important',
  },
  CLICK_UNMARK_AS_IMPORTANT_LAUNCH_MENU: {
    ...basicLaunchMenuClickEventParameters,
    element_name: 'unmark_as_important',
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
  CLICK_EXPORT_REPORT: {
    ...basicLaunchMenuClickEventParameters,
    element_name: 'export_report',
  },
  ADD_FILTER: {
    ...basicClickEventParametersLaunchPage,
    element_name: 'add_filters',
  },
  getClickOnAnalyzeUniqueErrorsEvent: getClickOnAnalyzeUniqueErrorsEventCreator(LAUNCHES_PAGE),
  getClickOnExecutionStatisticIconEvent: (type) => ({
    ...basicClickEventParametersLaunchPage,
    element_name: 'execution_statistic_icon',
    type,
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
  getClickOnAnalyzeInPatterAnalysisModal: (analyzeItemsMode) => ({
    ...basicClickEventParametersLaunchPage,
    modal: 'pattern_analyze_launches',
    element_name: 'analyze',
    type: formatAnalyzeItemsMode(analyzeItemsMode),
  }),
  getClickOnAnalyzeInAnalysisModal: (analyzerMode, analyzeItemsMode) => ({
    ...basicClickEventParametersLaunchPage,
    modal: 'analyze_launches',
    element_name: 'analyze',
    condition: LAUNCH_ANALYZE_TYPES_TO_ANALYTICS_TITLES_MAP[analyzerMode],
    type: formatAnalyzeItemsMode(analyzeItemsMode),
  }),
  getClickOnDeleteBtnDeleteItemModalEvent:
    getClickOnDeleteBtnDeleteItemModalEventCreator(LAUNCHES_PAGE),
  getOkBtnImportModal: (selectedPluginName) => ({
    ...basicClickEventParametersLaunchPage,
    modal: 'import_launch',
    element_name: 'import',
    type: selectedPluginName,
  }),
  CLICK_MARK_AS_IMPORTANT_BTN_MODAL: {
    ...basicClickEventParametersLaunchPage,
    modal: 'mark_as_important',
    element_name: 'mark_as_important',
  },
  CLICK_UNMARK_AS_IMPORTANT_BTN_MODAL: {
    ...basicClickEventParametersLaunchPage,
    modal: 'unmark_as_important',
    element_name: 'unmark_as_important',
  },
  getClickDeleteWithImportantLaunchesBtnModalEvent: (isBulk) => ({
    ...basicClickEventParametersLaunchPage,
    modal: 'delete_launch',
    element_name: 'delete_with_important_launches',
    condition: isBulk ? 'bulk' : 'single',
  }),
  getClickDeleteImportantLaunchesBtnModalEvent: (isBulk) => ({
    ...basicClickEventParametersLaunchPage,
    modal: 'delete_launch',
    element_name: isBulk ? 'delete_important_launches' : 'delete_important_launch',
    condition: isBulk ? 'bulk' : 'single',
  }),
  getClickDeleteRegularLaunchesBtnModalEvent: (isBulk) => ({
    ...basicClickEventParametersLaunchPage,
    modal: 'delete_launch',
    element_name: 'delete_only_regular',
    condition: isBulk ? 'bulk' : 'single',
  }),
  getClickDeleteLaunchesBtnModalEvent: (isBulk) => ({
    ...basicClickEventParametersLaunchPage,
    modal: 'delete_launch',
    element_name: 'delete',
    condition: isBulk ? 'bulk' : 'single',
  }),
  getClickExportLaunchBtnModalEvent: (type, isWithAttachments) => ({
    ...basicClickEventParametersLaunchPage,
    modal: 'export_report',
    element_name: 'export',
    type,
    status: isWithAttachments ? 'active' : 'disable',
  }),
  EDIT_ITEMS_MODAL_EVENTS: getEditItemsModalEvents(LAUNCHES_PAGE),
};
