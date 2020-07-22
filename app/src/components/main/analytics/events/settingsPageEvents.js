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

export const SETTINGS_PAGE = 'settings';

export const getSaveNewPatternEvent = (patternType) => ({
  category: SETTINGS_PAGE,
  action: `Choose ${patternType} and Click Save in Modal Create Pattern`,
  label: `Save new Pattern with ${patternType}`,
});

export const getIntegrationItemClickEvent = (integrationName) => ({
  category: SETTINGS_PAGE,
  action: `Click on ${integrationName} integration on tab Integrations`,
  label: `Open page with info for ${integrationName} integration on tab Integrations`,
});

export const getIntegrationAddClickEvent = (integrationName) => ({
  category: SETTINGS_PAGE,
  action: `Click on Add integration ${integrationName} plugin`,
  label: `Arise Modal Create Manual Integration for ${integrationName} integration`,
});

export const getIntegrationEditAuthClickEvent = (integrationName) => ({
  category: SETTINGS_PAGE,
  action: `Click on Add integration ${integrationName} plugin`,
  label: `Arise Modal Create Manual Integration for ${integrationName} integration`,
});

export const getIntegrationUnlinkGlobalEvent = (integrationName) => ({
  category: SETTINGS_PAGE,
  action: `Click on Unlink global integration for ${integrationName} integration on tab Integrations`,
  label: `Arise Modal Create Manual Integration for ${integrationName} integration`,
});

export const getSaveIntegrationModalEvents = (integrationName, isGlobal) => {
  const integrationType = isGlobal ? 'Global' : 'Project';
  return {
    saveBtn: {
      category: SETTINGS_PAGE,
      action: `Click on Save in Modal Save ${integrationType} Integration for ${integrationName} plugin`,
      label: `Save ${integrationType.toLowerCase()} integration for ${integrationName} plugin`,
    },
    cancelBtn: {
      category: SETTINGS_PAGE,
      action: `Click on Cancel in Modal Save ${integrationType} Integration for ${integrationName} plugin`,
      label: `Close Modal Save ${integrationType} Integration for ${integrationName} plugin`,
    },
    closeIcon: {
      category: SETTINGS_PAGE,
      action: `Click on Close icon in Modal Save ${integrationType} Integration for ${integrationName} plugin`,
      label: `Close Modal Save ${integrationType} Integration for ${integrationName} plugin`,
    },
  };
};

export const getAutoAnalysisMinimumShouldMatchSubmitEvent = (value) => ({
  category: SETTINGS_PAGE,
  action: 'Submit Minimum should match in Auto-Analysis tab',
  label: `Minimum should match ${value} percent`,
});

export const SETTINGS_PAGE_EVENTS = {
  GENERAL_TAB: {
    category: SETTINGS_PAGE,
    action: 'Click on tab General in Settings',
    label: 'Open tab General in Settings',
  },
  INACTIVITY_TIMEOUT_GENERAL: {
    category: SETTINGS_PAGE,
    action: 'Edit input Launch inactivity timeout on tab General',
    label: 'Change input Launch inactivity timeout on tab General',
  },
  KEEP_LOGS_GENERAL: {
    category: SETTINGS_PAGE,
    action: 'Edit input Keep logs on tab General',
    label: 'Change input Keep logs on tab General',
  },
  KEEP_SCREENSHOTS_GENERAL: {
    category: SETTINGS_PAGE,
    action: 'Edit input Keep screenshots on tab General',
    label: 'Change input Keep screenshots on tab General',
  },
  GENERAL_SUBMIT: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Submit on tab General',
    label: 'Submit changes on tab General',
  },
  NOTIFICATIONS_TAB: {
    category: SETTINGS_PAGE,
    action: 'Click on tab Notifications in Settings',
    label: 'Open tab Notifications in Settings',
  },
  TURN_ON_NOTIFICATION_RULE_SWITCHER: {
    category: SETTINGS_PAGE,
    action: 'Enable Notification Rule',
    label: 'Enable Notification Rule',
  },
  TURN_OFF_NOTIFICATION_RULE_SWITCHER: {
    category: SETTINGS_PAGE,
    action: 'Disable Notification Rule',
    label: 'Disable Notification Rule',
  },
  CLICK_ON_DELETE_RULE_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Delete Rule on tab Notifications',
    label: 'Arise Modal Delete Rule on tab Notifications',
  },
  CLOSE_ICON_DELETE_RULE_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Close on Modal Delete Rule Notification',
    label: 'Close Modal Delete Rule Notification',
  },
  CANCEL_DELETE_RULE_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Cancel in Delete Rule Notification modal on tab Notifications',
    label: 'Close Delete Rule Notification modal on tab Notifications',
  },
  DELETE_RULE_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Delete in Delete Rule Notification modal on tab Notifications',
    label: 'Delete Rule on tab Notifications',
  },
  EDIT_RULE_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Edit rule on tab Notifications',
    label: 'Arise Modal Edit Rule Notification on tab Notifications',
  },
  CLOSE_ICON_EDIT_RULE_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Close on Modal Edit Rule Notification',
    label: 'Close Modal Edit Rule Notification',
  },
  CANCEL_EDIT_RULE_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Cancel in Edit Rule Notification modal on tab Notifications',
    label: 'Close Edit Rule Notification modal on tab Notifications',
  },
  SAVE_EDIT_RULE_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Save in Edit Rule Notification modal on tab Notifications',
    label: 'Save Rule Notification in Edit Rule Notification modal on tab Notifications',
  },
  CLOSE_ICON_ADD_RULE_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Close on Modal Add Rule Notification',
    label: 'Close Modal Add Rule Notification',
  },
  CANCEL_ADD_RULE_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Cancel in Add Rule Notification modal on tab Notifications',
    label: 'Close Add Rule Notification modal on tab Notifications',
  },
  SAVE_ADD_RULE_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Save in Add Rule Notification modal on tab Notifications',
    label: 'Save Rule Notification in Add Rule Notification modal on tab Notifications',
  },
  EDIT_INPUT_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Edit input Email notifications on tab Notifications',
    label: 'Change input Email notifications on tab Notifications',
  },
  EDIT_RECIPIENTS_INPUT_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Edit input Recipients on tab Notifications',
    label: 'Change input Recipients on tab Notifications',
  },
  CHECKBOX_LAUNCH_OWNER_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Edit checkbox Launch owner on tab Notifications',
    label: 'Check/uncheck Launch owner on tab Notifications',
  },
  EDIT_IN_CASE_INPUT_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Edit input In case on tab Notifications',
    label: 'Change input In case on tab Notifications',
  },
  LAUNCH_NAME_INPUT_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Edit input Launch names on tab Notifications',
    label: 'Change input Launch names on tab Notifications',
  },
  TAGS_INPUT_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Edit input Tags on tab Notifications',
    label: 'Change input Tags on tab Notifications',
  },
  ADD_RULE_BTN_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Add new rule on tab Notifications',
    label: 'Add new rule on tab Notifications',
  },
  INTEGRATIONS_TAB: {
    category: SETTINGS_PAGE,
    action: 'Click on tab Integrations in Settings',
    label: 'Open tab Integrations in Settings',
  },
  EDIT_DEFECT_TAG_DEFECT_TYPES: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Edit defect tag on tab Defect Types',
    label: 'Arise fields for editing defect tag on tab Defect Types',
  },
  DELETE_ICON_DEFECT_TYPE: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Delete defect tag on tab Defect Types',
    label: 'Arise Modal Delete defect type on tab Defect Types',
  },
  EDIT_DEFECT_TYPE_NAME_DEFECT_TYPE: {
    category: SETTINGS_PAGE,
    action: 'Edit input Defect type name on tab Defect Types',
    label: 'Change Defect type name on tab Defect Types',
  },
  EDIT_DEFECT_TYPE_ABBREVIATION: {
    category: SETTINGS_PAGE,
    action: 'Edit input Defect type abbreviation on tab Defect Types',
    label: 'Change Defect type abbreviation on tab Defect Types',
  },
  CHANGE_DEFECT_TYPE_COLOR: {
    category: SETTINGS_PAGE,
    action: 'Edit input Defect type color on tab Defect Types',
    label: 'Change Defect type color on tab Defect Types',
  },
  SUBMIT_DEFECT_TYPE_CHANGES: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Submit defect type change on tab Defect Types',
    label: 'Change defect type on tab Defect Types',
  },
  CANCEL_DEFECT_TYPE_CHANGES: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Cancel defect type change on tab Defect Types',
    label: 'Cancel defect type change on tab Defect Types',
  },
  CLOSE_ICON_DELETE_DEFECT_TYPE_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Close on Modal Delete Defect type',
    label: 'Close Modal Delete Defect type',
  },
  CANCEL_BTN_DELETE_DEFECT_TYPE_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Cancel on Modal Delete Defect type',
    label: 'Close Modal Delete Defect type',
  },
  DELETE_BTN_DELETE_DEFECT_TYPE_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Delete on Modal Delete Defect type',
    label: 'Delete Defect type',
  },
  ADD_DEFECT_TYPE_BTN: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Add defect type on tab Defect types',
    label: 'Arise fieldes for Add defect type on tab Defect types',
  },
  RESET_DEFAULT_COLOR: {
    category: SETTINGS_PAGE,
    action: 'Click on link Reset to default colors on tab Defect types',
    label: 'Arise fieldes for Add defect type on tab Defect types',
  },
  CLOSE_ICON_RESET_DEFECT_COLORS_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Close on Modal Reset Defect colors',
    label: 'Close Modal Reset Defect colors',
  },
  CANCEL_BTN_RESET_DEFECT_COLORS_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Cancel on Modal Reset Defect colors',
    label: 'Close Modal Reset Defect colors',
  },
  RESET_BTN_RESET_DEFECT_COLORS_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Reset on Modal Reset Defect colors',
    label: 'Reset Defect colors',
  },
  DEFECT_TYPE_TAB: {
    category: SETTINGS_PAGE,
    action: 'Click on tab Defect Types in Settings',
    label: 'Open tab Defect Types in Settings',
  },
  DEMO_DATA_TAB: {
    category: SETTINGS_PAGE,
    action: 'Click on tab Demo Data in Settings',
    label: 'Open tab Demo Data in Settings',
  },
  ENTER_POSTFIX_DEMO_DATA: {
    category: SETTINGS_PAGE,
    action: 'Edit input Postfix on tab Demo Data',
    label: 'Change Postfix on tab Demo Data',
  },
  GENERATE_DATA_BTN: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Generate Demo Data on tab Demo Data',
    label: 'Generate Demo Data on tab Demo Data',
  },
  AUTO_ANALYSIS_TAB: {
    category: SETTINGS_PAGE,
    action: 'Click on tab Auto-Analysis in Settings',
    label: 'Open tab Auto-Analysis in Settings',
  },
  AUTO_ANALYSIS_SWITCHER_ON: {
    category: SETTINGS_PAGE,
    action: 'Click on Auto-Analysis ON in Auto-Analysis tab',
    label: 'Auto-Analysis ON',
  },
  AUTO_ANALYSIS_SWITCHER_OFF: {
    category: SETTINGS_PAGE,
    action: 'Click on Auto-Analysis OFF in Auto-Analysis tab',
    label: 'Auto-Analysis OFF',
  },
  AUTO_ANALYSIS_BASE_RADIO_BTN: {
    category: SETTINGS_PAGE,
    action: 'Choose radio Btn of Base for Auto-Analysis',
    label: 'Choose Base for Auto-Analysis',
  },
  TOGGLE_AUTO_ANALYSIS_MODE: {
    category: SETTINGS_PAGE,
    action: 'Toggle Mode of Auto-Analysis Accuracy',
    label: 'Choose Mode of Auto-Analysis',
  },
  SUBMIT_AUTO_ANALYSIS_SETTINGS: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Submit in Auto-Analysis tab',
    label: 'Submit changes in Auto-Analysis tab',
  },
  REMOVE_INDEX_BTN: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Remove index in Auto-Analysis tab',
    label: 'Remove index in Auto-Analysis tab',
  },
  GENERATE_INDEX_BTN: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Generate index in Auto-Analysis tab',
    label: 'Generate index in Auto-Analysis tab',
  },
  PATTERN_ANALYSIS_TAB: {
    category: SETTINGS_PAGE,
    action: 'Click on tab Pattern-analysis in Settings',
    label: 'Open tab Pattern-analysis in Settings',
  },
  CLOSE_ICON_DELETE_PATTERN_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Close on Modal Delete Pattern',
    label: 'Close Modal Delete Pattern',
  },
  CANCEL_BTN_DELETE_PATTERN_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Cancel on Modal Delete Pattern',
    label: 'Close Modal Delete Pattern',
  },
  DELETE_BTN_DELETE_PATTERN_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Delete on Modal Delete Pattern',
    label: 'Delete Pattern',
  },
  CREATE_PATTERN_BTN: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Create Pattern',
    label: 'Arise Modal Create Pattern',
  },
  EDIT_PATTERN_ICON: {
    category: SETTINGS_PAGE,
    action: 'Click on Edit Pencil',
    label: 'Arise Modal Edit Pattern',
  },
  CLONE_PATTERN_ICON: {
    category: SETTINGS_PAGE,
    action: 'Click on Clone Pattern Rule',
    label: 'Arrise Modal Clone Pattern Rule',
  },
  DELETE_PATTERN_ICON: {
    category: SETTINGS_PAGE,
    action: 'Click on Delete Pattern icon',
    label: 'Arise Modal Delete Pattern Rule',
  },
  TURN_ON_PA_RULE_SWITCHER: {
    category: SETTINGS_PAGE,
    action: 'Enable Pattern Rule',
    label: 'Enable Pattern Rule',
  },
  TURN_OFF_PA_RULE_SWITCHER: {
    category: SETTINGS_PAGE,
    action: 'Disable Pattern Rule',
    label: 'Disable Pattern Rule',
  },
  TURN_ON_PA_SWITCHER: {
    category: SETTINGS_PAGE,
    action: 'Switch On Pattern Analysis',
    label: 'Switch On Pattern Analysis',
  },
  TURN_OFF_PA_SWITCHER: {
    category: SETTINGS_PAGE,
    action: 'Switch Off Pattern Analysis',
    label: 'Switch Off Pattern Analysis',
  },
  CLOSE_ICON_CREATE_PATTERN_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Close on Modal Create Pattern',
    label: 'Close Modal Create Pattern',
  },
  CANCEL_BTN_CREATE_PATTERN_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Cancel on Modal Create Pattern',
    label: 'Close Modal Create Pattern',
  },
  CLOSE_ICON_CLONE_PATTERN_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Close on Modal Clone Pattern',
    label: 'Close Modal Clone Pattern',
  },
  CANCEL_BTN_CLONE_PATTERN_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Cancel on Modal Clone Pattern',
    label: 'Close Modal Clone Pattern',
  },
  SAVE_BTN_CLONE_PATTERN_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Save on Modal Clone Pattern',
    label: 'Clone Pattern',
  },
  CLOSE_ICON_RENAME_PATTERN_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on icon Close on Modal Rename Pattern',
    label: 'Close Modal Rename Pattern',
  },
  CANCEL_BTN_RENAME_PATTERN_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Cancel on Modal Rename Pattern',
    label: 'Close Modal Rename Pattern',
  },
  SAVE_BTN_RENAME_PATTERN_MODAL: {
    category: SETTINGS_PAGE,
    action: 'Click on Btn Save on Modal Rename Pattern',
    label: 'Rename Pattern',
  },
};
