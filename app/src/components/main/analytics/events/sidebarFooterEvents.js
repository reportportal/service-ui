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

import { normalizeEventString } from '../utils';
import { getBasicClickEventParameters, getBasicSearchEventParameters } from './common/ga4Utils';

const SIDEBAR = 'sidebar';

const basicEventParameters = {
  ...getBasicClickEventParameters(SIDEBAR),
  place: SIDEBAR,
};

export const SIDEBAR_EVENTS = {
  // GA4 events
  CLICK_LAUNCH_ICON: {
    ...basicEventParameters,
    icon_name: 'launches',
  },
  CLICK_OPEN_ORGANIZATION_PROJECTS_BTN: {
    ...getBasicClickEventParameters(SIDEBAR),
    place: 'hover',
    icon_name: 'open_project_page',
  },
  CLICK_ALL_ORGANIZATION_PROJECTS: {
    ...getBasicClickEventParameters(SIDEBAR),
    place: 'popover',
    element_name: 'all_organization',
  },
  CLICK_PROJECT_NAME: {
    ...getBasicClickEventParameters(SIDEBAR),
    place: 'hover',
    element_name: 'project_name',
  },
  CLICK_PRIVACY_POLICY_LINK: {
    ...getBasicClickEventParameters(SIDEBAR),
    icon_name: 'privacy_policy',
  },
  SEARCH_ORGANIZATION_PROJECTS: {
    ...getBasicSearchEventParameters(SIDEBAR),
    element_name: 'search',
  },
  onClickLevelHigher: (level) => ({
    ...getBasicClickEventParameters(SIDEBAR),
    element_name: level === 'project' ? 'organization_name' : 'all_organizations',
  }),
  onClickUpdateLink: (type) => ({
    ...getBasicClickEventParameters(SIDEBAR),
    element_name: 'update',
    type: normalizeEventString(type),
  }),
  onClickItem: ({ itemName, isSidebarCollapsed }) => ({
    ...getBasicClickEventParameters(SIDEBAR),
    icon_name: normalizeEventString(itemName),
    place: isSidebarCollapsed ? 'sidebar' : 'sidebar_hover',
  }),

  // GA3 events
  CLICK_MEMBERS_BTN: {
    category: SIDEBAR,
    action: 'Click on Menu Btn Members',
    label: 'Transition on Members Page',
  },
  CLICK_SETTINGS_BTN: {
    category: SIDEBAR,
    action: 'Click on Menu Btn Settings',
    label: 'Transition on Settings Page',
  },
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
  CLICK_BACK_TO_PROJECT_BTN: {
    category: SIDEBAR,
    action: 'Click on Menu Button Back to project',
    label: 'Transition to Launches Page',
  },
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
  CLICK_PROJECT_DROPDOWN: {
    category: SIDEBAR,
    action: 'Click on Project Dropdown',
    label: 'Arise Dropdown with list of Projects',
  },
  CLICK_PROJECT_NAME_LINK: {
    category: SIDEBAR,
    action: 'Click on Another Project Name',
    label: 'Transition to another project',
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
  editNumberPerPage: (pageNumber, page) => ({
    category: FOOTER,
    action: 'Edit number per page',
    label: `${pageNumber}#${page}`,
  }),
};
