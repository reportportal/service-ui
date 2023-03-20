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
import { getClickIssueTicketEvent } from 'components/main/analytics/events/common/testItemPages/actionEventsCreators';
import { defectFromTIGroupMap } from './constants';
import { getBasicClickEventParameters } from '../ga4Utils';

// EDIT DEFECT MODAL
export const getEditDefectModalEvents = (category) => ({
  CLOSE_ICON_EDIT_DEFECT_MODAL: {
    category,
    action: 'Click on Close Icon on Modal "Edit Defect Type"',
    label: 'Close modal "Edit Defect Type"',
  },
  EDIT_DESCRIPTION_EDIT_DEFECT_MODAL: {
    category,
    action: 'Edit description in Modal "Edit Defect Type"',
    label: 'Edit description',
  },
  CANCEL_BTN_EDIT_DEFECT_MODAL: {
    category,
    action: 'Click on Btn Cancel on Modal "Edit Defect Type"',
    label: 'Close modal "Edit Defect Type"',
  },
  SAVE_BTN_EDIT_DEFECT_MODAL: {
    category,
    action: 'Click on Btn Save on Modal "Edit Defect Type"',
    label: 'Save changes',
  },
  SAVE_BTN_DROPDOWN_EDIT_DEFECT_MODAL: {
    category,
    action: 'Click on dropdown icon on Save Btn on Modal "Edit Defect Type"',
    label: 'Arise dropdown',
  },
  POST_ISSUE_BTN_EDIT_DEFECT_MODAL: {
    category,
    action: 'Select Save and Post Issue on dropdown in Modal "Edit Defect Type"',
    label: 'Arise Modal "Post Issue"',
  },
  LINK_ISSUE_BTN_EDIT_DEFECT_MODAL: {
    category,
    action: 'Select Save and Link Issue on dropdown in Modal "Edit Defect Type"',
    label: 'Arise Modal "Link Issue"',
  },
  UNLINK_ISSUE_BTN_EDIT_DEFECT_MODAL: {
    category,
    action: 'Select Save and Unlink Issue on dropdown in Modal "Edit Defect Type"',
    label: 'Arise Modal "Unlink Issue"',
  },
  IGNORE_IN_AA_EDIT_DEFECT_MODAL: {
    category,
    action: 'Turn on switcher Ignore in AA in Defect Editor',
    label: 'Ignore in AA single item',
  },
  INCLUDE_IN_AA_EDIT_DEFECT_MODAL: {
    category,
    action: 'Turn off switcher Ignore in AA in Defect Editor',
    label: 'Include in AA single item',
  },
});

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

// DELETE ITEM MODAL
export const getDeleteItemModalEvents = (category) => ({
  CLOSE_ICON_DELETE_ITEM_MODAL: {
    category,
    action: 'Click on Icon Close on Modal Delete Item',
    label: 'Close Modal Delete Item',
  },
  CANCEL_BTN_DELETE_ITEM_MODAL: {
    category,
    action: 'Click on Btn Cancel on Modal Delete Item',
    label: 'Close Modal Delete Item',
  },
  DELETE_BTN_DELETE_ITEM_MODAL: {
    category,
    action: 'Click on Btn Delete on Modal Delete Item',
    label: 'Delete item',
  },
});

const EDIT_ITEM_MODAL = 'edit_item';

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
  BULK_EDIT_ITEMS_DESCRIPTION: {
    category,
    action: `Edit description in Modal "Edit ${itemType}" in a bulk`,
    label: 'Edit description in mode: ',
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

const MODAL_MAKE_DECISION = 'Modal Make decision';
const getOpenModalEvent = (page) => (defectFromTIGroup, actionPlace = '') => ({
  category: MODAL_MAKE_DECISION,
  action: 'Open Modal "Make decision"',
  label: `${page}${actionPlace && `#${actionPlace}`}#${defectFromTIGroupMap[defectFromTIGroup]}`,
});
const getCloseModalEvent = (page) => (defectFromTIGroup, hasSuggestions, timestamp) => {
  const suggestionsStatus = hasSuggestions ? 'withML' : 'withoutML';
  return {
    category: MODAL_MAKE_DECISION,
    action: 'Close modal "Make decisions"',
    label: [page, defectFromTIGroupMap[defectFromTIGroup], suggestionsStatus, timestamp].join('#'),
  };
};
const getApplyBtnEvent = (page) => ({
  section,
  defectFromTIGroup,
  hasSuggestions,
  optionLabel,
  itemsLength,
  timestamp,
  matchScore,
}) => {
  const suggestionsStatus = hasSuggestions ? 'withML' : 'withoutML';
  const selectedOption = optionLabel.replace(/{([A-Za-z]+)}/, 'filter');
  return {
    category: MODAL_MAKE_DECISION,
    action: `Click on button "Apply" after selecting ${section}`,
    label: [
      page,
      defectFromTIGroupMap[defectFromTIGroup],
      suggestionsStatus,
      selectedOption,
      itemsLength,
      timestamp,
      matchScore,
    ]
      .join('#')
      .replace(/#$/, ''),
  };
};
const getApplyAndContinueBtnEvent = (page) => (defectFromTIGroup, hasSuggestions, issueBtn) => {
  const suggestionsStatus = hasSuggestions ? 'withML' : 'withoutML';
  return {
    category: MODAL_MAKE_DECISION,
    action: `Click on button "Apply & Continue" on modal "Make decision"`,
    label: [
      page,
      defectFromTIGroupMap[defectFromTIGroup],
      suggestionsStatus,
      `after "+${issueBtn}"`,
    ].join('#'),
  };
};
const getShowErrLogsSwitcherEvent = (page) => ({ defectFromTIGroup, state }) => {
  const switcher = state ? 'ON' : 'OFF';
  return {
    category: MODAL_MAKE_DECISION,
    action: 'Switch "Show Error Logs" in Apply defect for',
    label: [page, defectFromTIGroupMap[defectFromTIGroup], switcher].join('#'),
  };
};
const getIgnoreAASwitcherEvent = (page) => (defectFromTIGroup, state) => {
  const switcher = state ? 'ON' : 'OFF';
  return {
    category: MODAL_MAKE_DECISION,
    action: 'Switch Ignore in Auto Analysis on modal "Make decision"',
    label: [page, defectFromTIGroupMap[defectFromTIGroup], switcher].join('#'),
  };
};
const getOnClickIssueEvent = (page) => (defectFromTIGroup, label) => ({
  category: MODAL_MAKE_DECISION,
  action: `Click on button "+${label}" on modal "Make decision"`,
  label: `${page}#${defectFromTIGroupMap[defectFromTIGroup]}`,
});
const getOnClickExternalLink = (page) => ({ defectFromTIGroup, section }) => ({
  category: MODAL_MAKE_DECISION,
  action: 'Click on Issue Link and Open Page Log',
  label: [page, defectFromTIGroupMap[defectFromTIGroup], section].join('#'),
});
const getOpenStackTraceEvent = (page) => (defectFromTIGroup, section) => ({
  category: MODAL_MAKE_DECISION,
  action: 'Expand Error Log',
  label: [page, defectFromTIGroupMap[defectFromTIGroup], section].join('#'),
});
const getOnDecisionOptionEvent = (page) => (defectFromTIGroup, optionLabel) => {
  const selectedOption = optionLabel.replace(/{([A-Za-z]+)}/, 'filter');
  return {
    category: MODAL_MAKE_DECISION,
    action: 'Choose radio button "Apply defect for"',
    label: [page, defectFromTIGroupMap[defectFromTIGroup], selectedOption].join('#'),
  };
};
const getOnSelectAllEvent = (page) => ({ defectFromTIGroup, state, optionLabel }) => {
  const switcher = state ? 'OFF' : 'ON';
  const selectedOption = optionLabel && optionLabel.replace(/{([A-Za-z]+)}/, 'filter');
  return {
    category: MODAL_MAKE_DECISION,
    action: 'Checkmark box "Item selected" in Apply defect for',
    label: [page, defectFromTIGroupMap[defectFromTIGroup], switcher, selectedOption].join('#'),
  };
};
const getOnClickEditorIconEvent = (page) => (defectFromTIGroup) => {
  return {
    category: MODAL_MAKE_DECISION,
    action: 'Click on icons Editor in toolbar',
    label: `${page}#${defectFromTIGroupMap[defectFromTIGroup]}`,
  };
};
const getOnExpandFooterEvent = (page) => (defectFromTIGroup) => ({
  category: MODAL_MAKE_DECISION,
  action: 'Following Results Will be Applied for the Items',
  label: `${page}#${defectFromTIGroupMap[defectFromTIGroup]}`,
});
const getOnChangeCommentOptionEvent = (page) => (label) => ({
  category: MODAL_MAKE_DECISION,
  action:
    'Choose Radio Button in Defect comments in "Following Results Will be Applied for the Items"',
  label: `${page}#Defect comments will ${label}`,
});
const getOnClickItemEvent = (page) => (defectFromTIGroup, section) => ({
  category: MODAL_MAKE_DECISION,
  action: 'Show Error Logs or Defect Comment',
  label: [page, defectFromTIGroupMap[defectFromTIGroup], section].join('#'),
});

export const getMakeDecisionModalEvents = (page) => ({
  openModal: getOpenModalEvent(page),
  closeModal: getCloseModalEvent(page),
  onApply: getApplyBtnEvent(page),
  onApplyAndContinue: getApplyAndContinueBtnEvent(page),
  toggleShowErrLogsSwitcher: getShowErrLogsSwitcherEvent(page),
  toggleIgnoreAASwitcher: getIgnoreAASwitcherEvent(page),
  onClickIssueBtn: getOnClickIssueEvent(page),
  onClickExternalLink: getOnClickExternalLink(page),
  onOpenStackTrace: getOpenStackTraceEvent(page),
  onDecisionOption: getOnDecisionOptionEvent(page),
  onSelectAllItems: getOnSelectAllEvent(page),
  onClickEditorIcon: getOnClickEditorIconEvent(page),
  onExpandFooter: getOnExpandFooterEvent(page),
  onChangeCommentOption: getOnChangeCommentOptionEvent(page),
  onClickItem: getOnClickItemEvent(page),
  onClickIssueTicketEvent: getClickIssueTicketEvent(MODAL_MAKE_DECISION),
});
