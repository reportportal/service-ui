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

const SIDEBAR = 'sidebar';
export const SIDEBAR_EVENTS = {
  CLICK_DASHBOARD_BTN: {
    category: SIDEBAR,
    action: 'Click on Menu button Dashboards',
    label: 'Transition on Dashboards Page',
  },
  CLICK_FILTERS_BTN: {
    category: SIDEBAR,
    action: 'Click on Menu button Filters',
    label: 'Transition on Filters Page',
  },
  CLICK_DEBUG_BTN: {
    category: SIDEBAR,
    action: 'Click on Menu button Debug',
    label: 'Transition on Debug Page',
  },
};

export const ADMIN_SIDEBAR_EVENTS = {
  CLICK_PROJECTS_BTN: {
    category: SIDEBAR,
    action: 'Click on Menu Btn Projects',
    label: 'Transition to Projects Page',
  },
  CLICK_ALL_USERS_BTN: {
    category: SIDEBAR,
    action: 'Click on Menu Btn All Users',
    label: 'Transition on All Users Page',
  },
  CLICK_SERVER_SETTINGS_BTN: {
    category: SIDEBAR,
    action: 'Click on Menu Btn Server Settings',
    label: 'Transition on Server Settings Page',
  },
  CLICK_PLUGINS_BTN: {
    category: SIDEBAR,
    action: 'Click on Menu Btn Plugins',
    label: 'Transition on Plugins Page',
  },
};

const HEADER = 'header';
export const HEADER_EVENTS = {
  CLICK_MEMBERS_BTN: {
    category: HEADER,
    action: 'Click on Menu Btn Members',
    label: 'Transition on Members Page',
  },
  CLICK_SETTINGS_BTN: {
    category: HEADER,
    action: 'Click on Menu Btn Settings',
    label: 'Transition on Settings Page',
  },
  CLICK_PROFILE_DROPDOWN: {
    category: HEADER,
    action: 'Click on Profile Dropdown',
    label: 'Arise Dropdown Menu',
  },
  CLICK_PROFILE_LINK: {
    category: HEADER,
    action: 'Click on Profile link on Dropdown',
    label: 'Transition on Profile Page',
  },
  CLICK_ADMINISTRATE_LINK: {
    category: HEADER,
    action: 'Click on Administrate link on Dropdown',
    label: 'Transition to Administrate Mode',
  },
  CLICK_LOGOUT_LINK: {
    category: HEADER,
    action: 'Click on Logout link',
    label: 'Logout and transition on Landing Page',
  },
  CLICK_PROJECT_DROPDOWN: {
    category: HEADER,
    action: 'Click on Project Dropdown',
    label: 'Arise Dropdown with list of Projects',
  },
  CLICK_PROJECT_NAME_LINK: {
    category: HEADER,
    action: 'Click on Another Project Name',
    label: 'Transition to another project',
  },
  CLICK_API_LINK: {
    category: HEADER,
    action: 'Click on link API',
    label: 'Transition to API page',
  },
};

const FOOTER = 'footer';
export const FOOTER_EVENTS = {
  BACK_TO_TOP_CLICK: {
    category: FOOTER,
    action: 'Click on Back to Top link',
    label: 'Transition to top',
  },
  FORK_US_CLICK: {
    category: FOOTER,
    action: 'Click on Fork us on GitHub link',
    label: 'Fork on GitHub',
  },
  SLACK_LINK: {
    category: FOOTER,
    action: 'Click on Chat with us on Slack link',
    label: 'Move to Slack',
  },
  CONTACT_US_LINK: {
    category: FOOTER,
    action: 'Click on Contact us link',
    label: 'Open message window',
  },
  EPAM_LINK: {
    category: FOOTER,
    action: 'Click on EPAM link',
    label: 'Transition to EPAM site',
  },
  DOCUMENTATION_LINK: {
    category: FOOTER,
    action: 'Click on Documentation link',
    label: 'Transition to Documentation',
  },
  EDIT_NUMBER_PER_PAGE: {
    category: FOOTER,
    action: 'Edit number per page',
    label: 'Change number per page',
  },
};
