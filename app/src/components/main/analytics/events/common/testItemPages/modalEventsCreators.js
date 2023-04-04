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
import { defectFromTIGroupMap } from './constants';
import { getBasicClickEventParameters } from '../ga4Utils';

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
  condition: defectFromTIGroupMap[defectFromTIGroup] || 'bulk',
});

const getOpenModalEventCreator = (place) => (defectFromTIGroup, actionPlace = '') => ({
  ...basicClickEventParametersMakeDecision,
  place: `${place}${actionPlace && `#${actionPlace}`}`,
  condition: defectFromTIGroupMap[defectFromTIGroup] || 'bulk',
});
const getClickOnApplyBtnEventCreator = (place) => (defectFromTIGroup, hasSuggestions) => {
  const basicEventParameters = getBasicClickEventParametersMakeDecisionCreator(
    place,
    defectFromTIGroup,
  );
  const isBulkOperation = basicEventParameters.condition === 'bulk';
  if (!isBulkOperation) {
    basicEventParameters.type = hasSuggestions ? 'with_ml' : 'without_ml';
  }
  return {
    ...basicEventParameters,
    element_name: 'apply',
  };
};
const getClickOnApplyAndContinueBtnEventCreator = (place) => (
  defectFromTIGroup,
  hasSuggestions,
  issueBtn,
) => {
  const basicEventParameters = getBasicClickEventParametersMakeDecisionCreator(
    place,
    defectFromTIGroup,
  );
  const isBulkOperation = basicEventParameters.condition === 'bulk';
  const types = [];
  if (!isBulkOperation) {
    types.push(hasSuggestions ? 'with_ml' : 'without_ml');
  }
  types.push(issueBtn);
  return {
    ...basicEventParameters,
    element_name: 'apply_and_continue',
    type: types.join('#'),
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
  getClickOnApplyEvent: getClickOnApplyBtnEventCreator(page),
  getClickOnApplyAndContinueEvent: getClickOnApplyAndContinueBtnEventCreator(page),
  getToggleShowErrLogsSwitcherEvent: getShowErrLogsSwitcherEventCreator(page),
  getClickIgnoreAACheckboxEvent: getClickIgnoreAACheckboxEventCreator(page),
  getClickCommentEditorIcon: getClickOnCommentEditorIconEventCreator(page),
  getOpenStackTraceEvent: getOpenStackTraceEventCreator(page),
  getClickItemLinkEvent: getClickOnItemLinkEventCreator(page),
  getClickOnApplyDefectForOptionEvent: getApplyDefectForOptionEventCreator(page),
  getExpandFooterEvent: getExpandFooterEventCreator(page),
  getOnChangeCommentOptionEvent: getOnChangeCommentOptionEventCreator(page),
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
  UNLINK_BTN_UNLINK_ISSUE_MODAL: {
    category,
    action: 'Click on Unlink in Modal "Unlink issue"',
    label: 'Unlink issues',
  },
  UNLINK_IN_UNLINK_ISSUE_MODAL_AUTO_ANALYZED_TRUE: {
    category,
    action: 'Click on Unlink in Modal "Unlink issue"',
    label: 'Unlink issues, autoAnalyzed is true',
  },
  UNLINK_IN_UNLINK_ISSUE_MODAL_AUTO_ANALYZED_FALSE: {
    category,
    action: 'Click on Unlink in Modal "Unlink issue"',
    label: 'Unlink issues, autoAnalyzed is false',
  },
});

const getIncludeDataSwitcherEvent = (category, switcherLabel) => (state) => {
  const checkboxState = state ? 'Active' : 'Disable';
  return {
    category,
    action: `Click on ${switcherLabel} on Modal Post Issue`,
    label: `${category}#${checkboxState}`,
  };
};
// POST ISSUE MODAL
export const getPostIssueModalEvents = (category) => ({
  CLOSE_ICON_POST_ISSUE_MODAL: {
    category,
    action: 'Click on Icon Close on Modal Post Issue',
    label: 'Close Modal Post Issue',
  },
  commentSwitcher: getIncludeDataSwitcherEvent(category, 'Comment Switcher'),
  attachmentsSwitcher: getIncludeDataSwitcherEvent(category, 'Attachments Switcher'),
  logsSwitcher: getIncludeDataSwitcherEvent(category, 'Logs Switcher'),
  CANCEL_BTN_POST_ISSUE_MODAL: {
    category,
    action: 'Click on Btn Cancel on Modal Post Issue',
    label: 'Close Modal Post Issue',
  },
  POST_BTN_POST_ISSUE_MODAL: {
    category,
    action: 'Click on Btn Post on Modal Post Issue',
    label: 'Post bug',
  },
});

// LINK ISSUE MODAL
export const getLinkIssueModalEvents = (category) => ({
  CLOSE_ICON_LINK_ISSUE_MODAL: {
    category,
    action: 'Click on Icon Close on Modal Link Issue',
    label: 'Close Modal Link Issue',
  },
  ADD_NEW_ISSUE_BTN_LINK_ISSUE_MODAL: {
    category,
    action: 'Click on Btn Add New Issue on Modal Link Issue',
    label: 'Add input in Modal Link Issue',
  },
  CANCEL_BTN_LINK_ISSUE_MODAL: {
    category,
    action: 'Click on Btn Cancel on Modal Link Issue',
    label: 'Close Modal Modal Link Issue',
  },
  LOAD_BTN_LINK_ISSUE_MODAL: {
    category,
    action: 'Click on Btn Load on Modal Link Issue',
    label: 'Link issue',
  },
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
