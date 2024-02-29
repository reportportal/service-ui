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

import { SEARCH_MODES } from 'pages/inside/stepPage/modals/makeDecisionModal/constants';
import { DEFECT_FROM_TI_GROUP_MAP, ISSUE_TYPE_MAP } from './constants';
import { getBasicClickEventParameters } from '../ga4Utils';
import { getIncludedData } from '../utils';
import {
  getMakeDecisionElementName,
  getSwitchedDefectTypes,
  getDefectTypesAnalyticsData,
} from './utils';

// GA4 events
export const getClickOnAnalyzeUniqueErrorsEventCreator = (category) => (isExcludeNumbers) => ({
  ...getBasicClickEventParameters(category),
  modal: 'analyze_launch',
  element_name: 'analyze',
  type: `${isExcludeNumbers ? 'exclude' : 'include'}_numbers`,
});
export const getClickOnDeleteBtnDeleteItemModalEventCreator = (category) => (itemLength) => ({
  ...getBasicClickEventParameters(category),
  modal: 'delete_item',
  element_name: 'delete',
  condition: itemLength > 1 ? 'bulk' : 'single',
});

const MAKE_DECISION = 'make_decision';
const basicClickEventParametersMakeDecision = getBasicClickEventParameters(MAKE_DECISION);
const getBasicClickEventParametersMakeDecisionCreator = (place, defectFromTIGroup) => ({
  ...basicClickEventParametersMakeDecision,
  place,
  condition: DEFECT_FROM_TI_GROUP_MAP[defectFromTIGroup] || 'bulk',
});

const getOpenModalEventCreator = (place) => (defectFromTIGroup, actionPlace = '') => ({
  ...basicClickEventParametersMakeDecision,
  place: `${place}${actionPlace && `#${actionPlace}`}`,
  condition: DEFECT_FROM_TI_GROUP_MAP[defectFromTIGroup] || 'bulk',
});

const getClickOnApplyEventCreator = (place) => (
  defectFromTIGroup,
  hasSuggestions,
  status,
  issueType,
  itemDataIssueType,
  issueActionType,
  suggestedItems,
) => {
  const basicEventParameters = getBasicClickEventParametersMakeDecisionCreator(
    place,
    defectFromTIGroup,
  );

  basicEventParameters.type = `${hasSuggestions ? 'with_ml' : 'without_ml'}${
    issueActionType ? `#${ISSUE_TYPE_MAP[issueActionType]}` : ''
  }`;

  const switcher = `${getDefectTypesAnalyticsData(itemDataIssueType)}#${getDefectTypesAnalyticsData(
    issueType,
  )}`;

  const iconName = suggestedItems
    .map(({ testItemResource }) => getDefectTypesAnalyticsData(testItemResource.issue.issueType))
    .join('#');

  return {
    ...basicEventParameters,
    status,
    switcher,
    icon_name: iconName,
    element_name: getMakeDecisionElementName(issueActionType),
  };
};

const getClickOnApplyBulkEventCreator = (place) => (
  defectFromTIGroup,
  issueActionType,
  items,
  issueType,
  linkName,
) => {
  const basicEventParameters = getBasicClickEventParametersMakeDecisionCreator(
    place,
    defectFromTIGroup,
  );

  return {
    ...basicEventParameters,
    element_name: getMakeDecisionElementName(issueActionType),
    switcher: getSwitchedDefectTypes(items, issueType),
    type: ISSUE_TYPE_MAP[issueActionType] || undefined,
    link_name: linkName,
  };
};

const getShowErrLogsSwitcherEventCreator = (place) => (defectFromTIGroup, switcherState) => ({
  ...getBasicClickEventParametersMakeDecisionCreator(place, defectFromTIGroup),
  element_name: 'show_error_logs',
  switcher: switcherState ? 'on' : 'off',
});
const getClickIgnoreAACheckboxEventCreator = (place) => (defectFromTIGroup, status) => ({
  ...getBasicClickEventParametersMakeDecisionCreator(place, defectFromTIGroup),
  element_name: 'ignore_in_auto_analysis',
  status: status ? 'active' : 'disable',
});
const getClickOnCommentEditorIconEventCreator = (place) => (defectFromTIGroup) => ({
  ...getBasicClickEventParametersMakeDecisionCreator(place, defectFromTIGroup),
  icon_name: 'editor_toolbar',
});
const getOpenStackTraceEventCreator = (place) => (defectFromTIGroup, type) => ({
  ...getBasicClickEventParametersMakeDecisionCreator(place, defectFromTIGroup),
  icon_name: 'expand_error_log',
  type,
});
const getClickOnItemLinkEventCreator = (place) => (defectFromTIGroup, type) => ({
  ...getBasicClickEventParametersMakeDecisionCreator(place, defectFromTIGroup),
  link_name: 'item_link',
  type,
});
const getApplyDefectForOptionEventCreator = (place) => (defectFromTIGroup, typeLabel) => {
  const type = typeLabel
    .replace(/{([A-Za-z]+)}/, 'filter')
    .toLowerCase()
    .replace(/\s/g, '_');
  return {
    ...getBasicClickEventParametersMakeDecisionCreator(place, defectFromTIGroup),
    icon_name: 'apply_for',
    type,
  };
};
const getExpandFooterEventCreator = (place) => (defectFromTIGroup) => ({
  ...getBasicClickEventParametersMakeDecisionCreator(place, defectFromTIGroup),
  icon_name: 'results_will_be_applied_for_the_item',
});
const getOnChangeCommentOptionEventCreator = (place) => (label) => ({
  ...getBasicClickEventParametersMakeDecisionCreator(place),
  icon_name: 'results_will_be_applied_for_the_item',
  type: label.toLowerCase().replace(/\s/g, '_'),
});
export const getMakeDecisionModalEvents = (page) => ({
  getOpenModalEvent: getOpenModalEventCreator(page),
  getClickOnApplyEvent: getClickOnApplyEventCreator(page),
  getClickOnApplyBulkEvent: getClickOnApplyBulkEventCreator(page),
  getToggleShowErrLogsSwitcherEvent: getShowErrLogsSwitcherEventCreator(page),
  getClickIgnoreAACheckboxEvent: getClickIgnoreAACheckboxEventCreator(page),
  getClickCommentEditorIcon: getClickOnCommentEditorIconEventCreator(page),
  getOpenStackTraceEvent: getOpenStackTraceEventCreator(page),
  getClickItemLinkEvent: getClickOnItemLinkEventCreator(page),
  getClickOnApplyDefectForOptionEvent: getApplyDefectForOptionEventCreator(page),
  getExpandFooterEvent: getExpandFooterEventCreator(page),
  getOnChangeCommentOptionEvent: getOnChangeCommentOptionEventCreator(page),
});

export const getIgnoreBtnIgnoreItemsInAAModalEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  modal: 'ignore_item_in_aa',
  element_name: 'ignore',
});

// GA3 events
export const getEditToInvestigateChangeSearchModeEvent = (category) => ({
  [SEARCH_MODES.CURRENT_LAUNCH]: {
    category,
    action: 'Choose "For the current launch" in Modal "Edit Defect"',
    label: 'Choose "For the current launch" in Modal "Edit Defect"',
  },
  [SEARCH_MODES.LAST_TEN_LAUNCHES]: {
    category,
    action: 'Choose "For the launches with the same name" in Modal "Edit Defect"',
    label: 'Choose "For the launches with the same name" in Modal "Edit Defect"',
  },
  [SEARCH_MODES.WITH_FILTER]: {
    category,
    action: 'Choose "For the current filter" in Modal "Edit Defect"',
    label: 'Choose "For the current filter" in Modal "Edit Defect"',
  },
});

export const getEditToInvestigateSelectAllSimilarItemsEvent = (category) => ({
  category,
  action: 'Click on checkbox Change Similar Items in Modal "Edit Defect"',
  label: 'Choose All similar items in Modal "Edit Defect"',
});

export const getEditToInvestigateSelectSpecificSimilarItemEvent = (category) => ({
  category,
  action: 'Select the specific item in Change Similar Items in Modal "Edit Defect"',
  label: `Choose specific item in Modal "Edit Defect"`,
});

// UNLINK ISSUE MODAL
export const getUnlinkIssueModalEvents = (category) => ({
  CANCEL_BTN_UNLINK_ISSUE_MODAL: {
    category,
    action: 'Click on Cancel in Unlink issue',
    label: 'Close Modal "Unlink issue"',
  },
  CLOSE_ICON_UNLINK_ISSUE_MODAL: {
    category,
    action: 'Click on Close icon in Unlink issue',
    label: 'Close Modal "Unlink issue"',
  },
  getClickUnlinkButtonEventParameters: (place) => (isAutoAnalyzeEnabled) => ({
    ...getBasicClickEventParameters(category),
    modal: 'unlink_issue',
    element_name: 'unlink_issue',
    type: `autoAnalyzed_${isAutoAnalyzeEnabled}`,
    ...(place && { place }),
  }),
});

// POST ISSUE MODAL
export const getPostIssueModalEvents = (category) => ({
  CLOSE_ICON_POST_ISSUE_MODAL: {
    category,
    action: 'Click on Icon Close on Modal Post Issue',
    label: 'Close Modal Post Issue',
  },
  CANCEL_BTN_POST_ISSUE_MODAL: {
    category,
    action: 'Click on Btn Cancel on Modal Post Issue',
    label: 'Close Modal Post Issue',
  },
  getClickPostIssueButtonEventParameters: (place) => (type) => {
    const analyticsData = getIncludedData(type);

    return {
      ...getBasicClickEventParameters(category),
      modal: 'post_issue',
      element_name: 'post_issue',
      ...(analyticsData && { type: analyticsData }),
      ...(place && { place }),
    };
  },
});

const getBasicLinkIssueModalEventParameters = (category) => ({
  ...getBasicClickEventParameters(category),
  modal: 'link_issue',
});
// LINK ISSUE MODAL
export const getLinkIssueModalEvents = (category) => ({
  CLOSE_ICON_LINK_ISSUE_MODAL: {
    category,
    action: 'Click on Icon Close on Modal Link Issue',
    label: 'Close Modal Link Issue',
  },
  getClickAddNewIssueButtonEventParameters: (place) => ({
    ...getBasicLinkIssueModalEventParameters(category),
    element_name: 'add_new_issue',
    ...(place && { place }),
  }),
  CANCEL_BTN_LINK_ISSUE_MODAL: {
    category,
    action: 'Click on Btn Cancel on Modal Link Issue',
    label: 'Close Modal Modal Link Issue',
  },
  getClickLoadButtonEventParameters: (place = '') => (number) => ({
    ...getBasicLinkIssueModalEventParameters(category),
    element_name: 'link_issue',
    number,
    ...(place && { place }),
  }),
});

const EDIT_ITEM_MODAL = 'edit_item';
const EDIT_ITEMS_MODAL = 'edit_items'; // There are two different modals for multiple and single item editing

// EDIT ITEMS MODAL
export const getEditItemsModalEvents = (category, itemType = 'Item') => ({
  // GA4 events
  SAVE_BTN_EDIT_ITEM_MODAL: {
    ...getBasicClickEventParameters(category),
    modal: EDIT_ITEM_MODAL,
    element_name: 'save',
  },
  CLICK_COPY_ICON_UUID: {
    ...getBasicClickEventParameters(category),
    modal: EDIT_ITEM_MODAL,
    icon_name: 'copy_uuid',
  },
  getSaveBtnEditItemsEvent: (type) => ({
    ...getBasicClickEventParameters(category),
    modal: EDIT_ITEMS_MODAL,
    element_name: 'save',
    type,
  }),
  // GA3 events
  CLOSE_ICON_EDIT_ITEM_MODAL: {
    category,
    action: `Click on Close Icon on Modal "Edit ${itemType}"`,
    label: `Close modal "Edit ${itemType}"`,
  },
  CANCEL_BTN_EDIT_ITEM_MODAL: {
    category,
    action: `Click on Btn Cancel on Modal "Edit ${itemType}`,
    label: `Close modal "Edit ${itemType}"`,
  },
  EDIT_ITEM_DESCRIPTION: {
    category,
    action: `Edit description in Modal "Edit ${itemType}"`,
    label: 'Edit description',
  },
  DETAILS_TAB_EVENT: {
    category,
    action: `Click on tab "Details" on modal "Test item details"`,
    label: 'Open tab "Details"',
  },
  STACK_TRACE_TAB_EVENT: {
    category,
    action: `Click on tab "Stack trace" on modal "Test item details"`,
    label: 'Open tab "Stack trace"',
  },
  ADD_ATTRIBUTE: {
    category,
    action: 'Click on add new attributes on modal "Test item details"',
    label: 'Add attributes',
  },
});

const TEST_ITEM_DETAILS_MODAL = 'test_item_details';

export const getEditItemDetailsModalEvents = (category) => {
  const basicClickEventParams = getBasicClickEventParameters(category);
  const modal = TEST_ITEM_DETAILS_MODAL;

  return {
    DETAILS_TAB: {
      ...basicClickEventParams,
      modal,
      element_name: 'details',
    },
    STACK_TRACE_TAB: {
      ...basicClickEventParams,
      modal,
      element_name: 'stack_trace',
    },
    EXPAND_STACK_TRACE: {
      ...basicClickEventParams,
      modal,
      icon_name: 'arrow_to_expand',
    },
    SAVE_BTN: {
      ...basicClickEventParams,
      modal,
      element_name: 'save',
    },
  };
};
