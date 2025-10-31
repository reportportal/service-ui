/*
 * Copyright 2022 EPAM Systems
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

import { normalizeEventString } from '../../utils';
import { LAUNCH_ANALYZE_TYPES_TO_ANALYTICS_TITLES_MAP } from '../common/constants';
import { getBasicClickEventParameters, normalizeEventParameter } from '../common/ga4Utils';

const PROJECT_SETTINGS = 'project_settings';
const ANALYZER = 'analyzer';
const NOTIFICATIONS = 'notifications';
const DEFECT_TYPES = 'defect_types';
const INTEGRATIONS = 'integrations';
const PATTERN_ANALYSIS = 'pattern_analysis';
const LOG_TYPES = 'log_types';
const GENERAL = 'general';
const BASIC_EVENT_PARAMETERS_ANALYZER_TAB = getBasicClickEventParameters(PROJECT_SETTINGS);
const BASIC_EVENT_PARAMETERS_NOTIFICATIONS = {
  ...getBasicClickEventParameters(PROJECT_SETTINGS),
  place: NOTIFICATIONS,
};
const BASIC_EVENT_PARAMETERS_DEFECT_TYPES = {
  ...getBasicClickEventParameters(PROJECT_SETTINGS),
  place: DEFECT_TYPES,
};

const BASIC_EVENT_PARAMETERS_INTEGRATIONS = {
  ...getBasicClickEventParameters(PROJECT_SETTINGS),
  place: INTEGRATIONS,
};

const BASIC_EVENT_PARAMETERS_PATTERN_ANALYSIS = {
  ...getBasicClickEventParameters(PROJECT_SETTINGS),
  place: PATTERN_ANALYSIS,
};

const BASIC_EVENT_PARAMETERS_LOG_TYPES = {
  ...getBasicClickEventParameters(PROJECT_SETTINGS),
  place: LOG_TYPES,
};

const BASIC_EVENT_PARAMETERS_GENERAL = getBasicClickEventParameters(PROJECT_SETTINGS);

export const PROJECT_SETTINGS_VIEWS = {
  getProjectSettingsPageView: (settingsTab, subTab) => ({
    action: 'pageview',
    page: PROJECT_SETTINGS,
    place: subTab
      ? `${PROJECT_SETTINGS}_${settingsTab.toLowerCase()}_${subTab.toLowerCase()}`
      : `${PROJECT_SETTINGS}_${settingsTab.toLowerCase()}`,
  }),
};

export const PROJECT_SETTINGS_GENERAL_TAB_EVENTS = {
  CLICK_SUBMIT: (inactivityTimeout, type) => ({
    ...BASIC_EVENT_PARAMETERS_GENERAL,
    place: GENERAL,
    element_name: 'button_submit',
    number: inactivityTimeout,
    type,
  }),
};

const getStatus = (status) => (status ? 'active' : 'disabled');
const getSwitcher = (switcher) => (switcher ? 'on' : 'off');

export const PROJECT_SETTINGS_ANALYZER_EVENTS = {
  clickSubmitInAutoAnalyzerTab: (
    number,
    status,
    condition,
    switcher,
    largestRetryPriority,
    type,
  ) => ({
    ...BASIC_EVENT_PARAMETERS_ANALYZER_TAB,
    place: `${ANALYZER}_auto_analyzer`,
    element_name: 'button_submit',
    number,
    status: getStatus(status),
    condition: LAUNCH_ANALYZE_TYPES_TO_ANALYTICS_TITLES_MAP[condition],
    switcher,
    type,
    icon_name: `${largestRetryPriority ? '' : 'un'}select_largest_retry_priority`,
  }),

  clickSubmitInSimilarItemsTab: (number) => ({
    ...BASIC_EVENT_PARAMETERS_ANALYZER_TAB,
    place: `${ANALYZER}_similar_items`,
    element_name: 'button_submit',
    number,
  }),

  clickSubmitInUniqueErrorsTab: (status, type) => ({
    ...BASIC_EVENT_PARAMETERS_ANALYZER_TAB,
    place: `${ANALYZER}_unique_errors`,
    status: getStatus(status),
    element_name: 'button_submit',
    type: type ? 'exclude' : 'include',
  }),

  clickDocumentationLink: (place) => ({
    ...BASIC_EVENT_PARAMETERS_ANALYZER_TAB,
    place: `${ANALYZER}_${place}`,
    link_name: 'documentation',
  }),
};

export const PROJECT_SETTINGS_DEMO_DATA_EVENTS = {
  CLICK_GENERATE_DATA_IN_DEMO_DATA_TAB: {
    ...getBasicClickEventParameters(PROJECT_SETTINGS),
    element_name: 'button_generate_demo_data',
    place: 'demo_data',
  },
};

export const PROJECT_SETTINGS_NOTIFICATIONS_EVENTS = {
  CLICK_SAVE_BUTTON_IN_MODAL: ({
    modalName,
    status,
    number,
    type,
    switcher,
    ruleId,
    communicationChanelName,
  }) => ({
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    element_name: 'button_save',
    modal: normalizeEventString(modalName),
    status: getStatus(status),
    type: normalizeEventString(type),
    switcher: getSwitcher(switcher),
    icon_name: ruleId,
    condition: communicationChanelName,
    ...(number !== undefined && { number }),
  }),

  SWITCH_NOTIFICATION_RULE: (communicationChanelName, ruleId, switcher) => ({
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    switcher: getSwitcher(switcher),
    condition: communicationChanelName,
    element_name: 'rule',
    icon_name: ruleId,
  }),

  SWITCH_PLUGIN_NOTIFICATIONS: (communicationChanelName, switcher) => ({
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    switcher: getSwitcher(switcher),
    element_name: `${communicationChanelName}_notifications`,
  }),

  SWITCH_ALL_NOTIFICATIONS: (switcher) => ({
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    switcher: getSwitcher(switcher),
    element_name: 'all_notifications',
  }),

  CLICK_PROJECT_CONFIGURATION_LINK: {
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    link_name: 'project_configuration',
  },

  CLICK_DISCOVER_PLUGINS_LINK: {
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    link_name: 'discover_plugins',
  },

  CLICK_INTEGRATION_SETTINGS_LINK: {
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    element_name: 'integration_settings',
  },

  CLICK_CONFIGURE_INTEGRATION_LINK: {
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    element_name: 'configure_integration',
    condition: 'email',
  },

  CLICK_CREATE_RULE_BUTTON: (communicationChanelName) => ({
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    element_name: 'button_create_rule',
    condition: communicationChanelName,
  }),

  CLICK_TO_EXPAND_NOTIFICATIONS_DETAILS: (communicationChanelName) => ({
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    element_name: 'notifications_name',
    status: 'open',
    condition: communicationChanelName,
  }),

  CLICK_ICON_EDIT_NOTIFICATIONS: (communicationChanelName) => ({
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    icon_name: 'icon_edit',
    condition: communicationChanelName,
  }),

  CLICK_ICON_DUPLICATE_NOTIFICATIONS: (communicationChanelName) => ({
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    icon_name: 'icon_duplicate',
    condition: communicationChanelName,
  }),

  CLICK_ICON_DELETE_NOTIFICATIONS: (communicationChanelName) => ({
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    icon_name: 'icon_delete',
    condition: communicationChanelName,
  }),
};

export const PROJECT_SETTINGS_DEFECT_TYPES_EVENTS = {
  CLICK_CREATE_BUTTON: {
    ...BASIC_EVENT_PARAMETERS_DEFECT_TYPES,
    element_name: 'button_create_defect',
  },
  CLICK_COPY_ID_LOCATOR_ICON: {
    ...BASIC_EVENT_PARAMETERS_DEFECT_TYPES,
    icon_name: 'icon_copy',
  },
  CLICK_CREATE_ICON: {
    ...BASIC_EVENT_PARAMETERS_DEFECT_TYPES,
    icon_name: 'icon_create_defect',
  },
  CLICK_DOCUMENTATION_LINK: {
    ...BASIC_EVENT_PARAMETERS_DEFECT_TYPES,
    link_name: 'documentation',
  },
};

export const PROJECT_SETTINGS_INTEGRATION = {
  clickDocumentationLink: (place, type) => ({
    ...BASIC_EVENT_PARAMETERS_INTEGRATIONS,
    place: normalizeEventString(place),
    link_name: 'documentation',
    ...(type && { type: normalizeEventParameter(type) }),
  }),

  CLICK_ADD_PROJECT_INTEGRATION: (type) => ({
    ...BASIC_EVENT_PARAMETERS_INTEGRATIONS,
    element_name: 'button_add_project_integration',
    type: normalizeEventString(type),
  }),

  CLICK_CREATE_INTEGRATION_MODAL: (type) => ({
    ...BASIC_EVENT_PARAMETERS_INTEGRATIONS,
    element_name: 'button_create',
    modal: 'create_project_integration',
    type: normalizeEventString(type),
  }),

  CLICK_RESET_TO_GLOBAL_INTEGRATION: {
    ...BASIC_EVENT_PARAMETERS_INTEGRATIONS,
    element_name: 'button_reset',
  },
};

export const PROJECT_SETTINGS_PATTERN_ANALYSIS_EVENTS = {
  CLICK_CREATE_PATTERN_ANALYSIS: {
    ...BASIC_EVENT_PARAMETERS_PATTERN_ANALYSIS,
    element_name: 'button_create_pattern',
  },

  CLICK_SAVE_PATTERN_ANALYSIS_CREATE_MODAL: (type, switcher, isDuplicateModal) => ({
    ...BASIC_EVENT_PARAMETERS_PATTERN_ANALYSIS,
    element_name: 'button_save',
    modal: isDuplicateModal ? 'duplicate_pattern' : 'create_pattern',
    type: normalizeEventString(type),
    switcher: getSwitcher(switcher),
  }),

  SWITCH_NAME_PATTERN_ANALYSIS: (switcher) => ({
    ...BASIC_EVENT_PARAMETERS_PATTERN_ANALYSIS,
    switcher: getSwitcher(switcher),
  }),

  SWITCH_AUTO_PATTERN_ANALYSIS: (status) => ({
    ...BASIC_EVENT_PARAMETERS_PATTERN_ANALYSIS,
    element_name: 'checkbox_auto_pattern_analysis',
    status: getStatus(status),
  }),

  CLICK_ACTION_ICON_PATTERN_ANALYSIS: (iconName) => ({
    ...BASIC_EVENT_PARAMETERS_PATTERN_ANALYSIS,
    icon_name: iconName,
  }),

  OPEN_NAME_PATTERN_ANALYSIS: {
    ...BASIC_EVENT_PARAMETERS_PATTERN_ANALYSIS,
    element_name: 'pattern_name',
    status: 'open',
  },
  clickDocumentationLink: (place) => ({
    ...BASIC_EVENT_PARAMETERS_PATTERN_ANALYSIS,
    ...(place && { place }),
    link_name: 'documentation',
  }),
};

export const PROJECT_SETTINGS_LOG_TYPES_EVENTS = {
  CLICK_CREATE_TYPES: {
    ...BASIC_EVENT_PARAMETERS_LOG_TYPES,
    element_name: 'icon_create_type',
  },

  CLICK_CREATE_IN_MODAL: {
    ...BASIC_EVENT_PARAMETERS_LOG_TYPES,
    modal: 'create_log_types',
    element_name: 'create_log_type',
  },
};
