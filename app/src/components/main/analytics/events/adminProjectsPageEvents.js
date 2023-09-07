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

import { getBasicClickEventParameters } from './common/ga4Utils';
import { getRefineFiltersPanelEvents } from './common/testItemPages/actionEventsCreators';

export const ADMIN_PROJECTS_PAGE = 'Projects page';
export const ADMINISTRATE = 'administrate';

const basicAdminProjectsClickEventParams = getBasicClickEventParameters(ADMINISTRATE);

export const ADMIN_PROJECTS_PAGE_EVENTS = {
  // GA4 events
  PROJECT_MENU: {
    ...basicAdminProjectsClickEventParams,
    icon_name: 'dots_menu_button',
    place: 'all_projects',
  },
  CLICK_EVENT_MONITORING: {
    ...basicAdminProjectsClickEventParams,
    element_name: 'monitoring',
    place: 'drop_down',
  },
  HEADER_BUTTON_CLICK(section) {
    const baseElementName = 'button_project_';
    const sectionToElementNameMap = {
      monitoring: `${baseElementName}${section}`,
      members: `${baseElementName}${section}`,
      settings: `${baseElementName}${section}`,
    };

    return {
      ...basicAdminProjectsClickEventParams,
      element_name: sectionToElementNameMap[section],
    };
  },
  REFINE_FILTERS_PANEL_EVENTS: {
    commonEvents: getRefineFiltersPanelEvents(ADMINISTRATE),
  },
  // GA3 events
  ADD_PROJECT_BTN: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Btn Add Project',
    label: 'Arise Modal Add Project',
  },
  ADD_BTN_ADD_PROJECT_MODAL: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Btn Add project in Modal Add Project',
    label: 'Add new project',
  },
  CLOSE_ICON_ADD_PROJECT_MODAL: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Close Icon in Modal Add Project',
    label: 'Close Modal Add Project',
  },
  CANCEL_BTN_ADD_PROJECT_MODAL: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Btn Cancel in Modal Add Project',
    label: 'Cancel new project creation',
  },
  DELETE_PROJECT_BTN: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Delete project',
    label: 'Arise Modal Delete project',
  },
  CLOSE_ICON_DELETE_MODAL: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Close Icon in Modal Delete Project',
    label: 'Close Modal Delete projects',
  },
  CANCEL_BTN_DELETE_MODAL: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Btn Cancel in Modal Delete Project',
    label: 'Close Modal Delete projects',
  },
  DELETE_BTN_DELETE_MODAL: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Btn Delete in Modal Delete Projects',
    label: 'Delete projects',
  },
  EXPORT_BTN: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Export',
    label: 'Start export procedure',
  },
  STATISTIC_ICON: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Statistic Icon',
    label: 'Transition to Project Statistic Page',
  },
  PROJECT_NAME: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Project name',
    label: 'Transition to Project space',
  },
  SETTINGS_ACTION: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Settings in Project Menu',
    label: 'Transition to Settings page',
  },
  MEMBERS_ACTION: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Members in Project Menu',
    label: 'Transition to Members page',
  },
  ASSIGN_ACTION: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Assign',
    label: 'Assign user to Project',
  },
  UNASSIGN_ACTION: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Unassign',
    label: 'Unassign user from Project',
  },
  APPLY_FILTER_BTN: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Apply in Filter Modal',
    label: 'Apply filter',
  },
  FUNNEL_BTN: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Funnel',
    label: 'Arise Filter modal',
  },
  SET_TILE_VIEW: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Btn Tile view',
    label: 'Tile view',
  },
  SET_TABLE_VIEW: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Click on Bttn Table view',
    label: 'Table view',
  },
  CHANGE_SORTING: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Edit sorting tab',
    label: 'Change sorting',
  },
  ENTER_FILTER: {
    category: ADMIN_PROJECTS_PAGE,
    action: 'Enter parameter for search',
    label: 'Show project by parameter',
  },
};
