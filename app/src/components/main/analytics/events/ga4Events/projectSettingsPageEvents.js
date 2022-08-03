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

import { normalizeEventType } from '../../utils';

const PROJECT_SETTINGS = 'project_settings';
const ANALYZER = 'analyzer';
const NOTIFICATIONS = 'notifications';
const BASIC_EVENT_PARAMETERS = {
  action: 'click',
  category: PROJECT_SETTINGS,
  element_name: 'button_submit',
};
const BASIC_EVENT_PARAMETERS_NOTIFICATIONS = {
  action: 'click',
  category: PROJECT_SETTINGS,
  place: NOTIFICATIONS,
};

const getStatus = (status) => (status ? 'active' : 'disabled');
const getSwitcher = (switcher) => (switcher ? 'on' : 'off');

export const PROJECT_SETTINGS_ANALYZER_EVENTS = {
  CLICK_SUBMIT_IN_INDEX_TAB: (number, status) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: `${ANALYZER}_index_settings`,
    number,
    status: getStatus(status),
  }),

  CLICK_SUBMIT_IN_AUTO_ANALYZER_TAB: (number, status, type) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: `${ANALYZER}_auto_analyzer`,
    number,
    status: getStatus(status),
    type: normalizeEventType(type),
  }),

  CLICK_SUBMIT_IN_SIMILAR_ITEMS_TAB: (number) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: `${ANALYZER}_similar_items`,
    number,
  }),

  CLICK_SUBMIT_IN_UNIQUE_ERRORS_TAB: (status, type) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: `${ANALYZER}_unique_errors`,
    status: getStatus(status),
    type: type ? 'exclude' : 'include',
  }),
};

export const PROJECT_SETTINGS_DEMO_DATA_EVENTS = {
  CLICK_GENERATE_DATA_IN_DEMO_DATA_TAB: {
    ...BASIC_EVENT_PARAMETERS,
    element_name: 'button_generate_demo_data',
    place: 'demo_data',
  },
};

export const PROJECT_SETTINGS_NOTIFICATIONS_EVENTS = {
  CLICK_SAVE_BUTTON_IN_MODAL: (modalName, status, number, type, switcher) => ({
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    element_name: 'button_save',
    modal: normalizeEventType(modalName),
    status: getStatus(status),
    number,
    type: normalizeEventType(type),
    switcher: getSwitcher(switcher),
  }),

  CLICK_CHECKBOX_AUTO_NOTIFICATIONS: (status) => ({
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    element_name: 'checkbox_auto_email_notifications',
    status: getStatus(status),
  }),

  SWITCH_NOTIFICATION_RULE: (switcher) => ({
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    switcher: getSwitcher(switcher),
  }),

  CLICK_LINK_DOCUMENTATION: {
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    link_name: 'documentation',
  },

  CLICK_CREATE_RULE_BUTTON: {
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    element_name: 'button_create_rule',
  },

  CLICK_TO_EXPAND_NOTIFICATIONS_DETAILS: {
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    element_name: 'notifications_name',
    status: 'open',
  },

  CLICK_ICON_EDIT_NOTIFICATIONS: {
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    icon_name: 'icon_edit',
  },

  CLICK_ICON_DUPLICATE_NOTIFICATIONS: {
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    icon_name: 'icon_duplicate',
  },

  CLICK_ICON_DELETE_NOTIFICATIONS: {
    ...BASIC_EVENT_PARAMETERS_NOTIFICATIONS,
    icon_name: 'icon_delete',
  },
};
